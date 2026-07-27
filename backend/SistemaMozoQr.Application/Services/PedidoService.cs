using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Enums;
using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Application.Services;

public class PedidoService : IPedidoService
{
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IMesaRepository _mesaRepository;
    private readonly IMenuItemRepository _menuItemRepository;
    private readonly INotificacionService _notificacionService;
    private readonly ITaskRepository _taskRepository;

    public PedidoService(
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        IMenuItemRepository menuItemRepository,
        INotificacionService notificacionService,
        ITaskRepository taskRepository)
    {
        _pedidoRepository = pedidoRepository;
        _mesaRepository = mesaRepository;
        _menuItemRepository = menuItemRepository;
        _notificacionService = notificacionService;
        _taskRepository = taskRepository;
    }

    public async Task<Pedido> CrearPedidoAsync(CrearPedidoDto pedidoDto)
    {
        var mesa = await _mesaRepository.GetByIdIgnoreQueryFiltersAsync(pedidoDto.MesaId);
        if (mesa == null) throw new Exception("Mesa no encontrada.");
        if (mesa.Estado != EstadoMesa.Ocupada || mesa.CodigoAcceso != pedidoDto.CodigoAcceso)
        {
            throw new Exception("La mesa no está activa o el PIN es incorrecto.");
        }

        var pedido = new Pedido
        {
            Id = Guid.NewGuid(),
            MesaId = mesa.Id,
            RestauranteId = mesa.RestauranteId,
            Estado = EstadoPedido.Recibido,
            Fecha = DateTime.UtcNow,
            CodigoAcceso = mesa.CodigoAcceso,
            Items = new List<PedidoItem>()
        };

        foreach (var itemDto in pedidoDto.Items)
        {
            var menuItem = await _menuItemRepository.GetByIdAsync(itemDto.MenuItemId);
            if (menuItem == null) throw new Exception($"MenuItem {itemDto.MenuItemId} no encontrado.");
            if (menuItem.RestauranteId != mesa.RestauranteId) throw new Exception($"MenuItem {itemDto.MenuItemId} no pertenece al restaurante de la mesa.");

            pedido.Items.Add(new PedidoItem
            {
                Id = Guid.NewGuid(),
                RestauranteId = mesa.RestauranteId,
                PedidoId = pedido.Id,
                MenuItemId = menuItem.Id,
                Cantidad = itemDto.Cantidad,
                PrecioUnitario = menuItem.Precio,
                MenuItem = menuItem
            });
        }

        await _pedidoRepository.AddAsync(pedido);

        var resultDetails = string.Join(", ", pedido.Items.Select(i => $"{i.Cantidad}x {i.MenuItem?.Nombre ?? "Item"}"));
        
        // Crear la tarea correspondiente en la base de datos
        var task = new MesaTask
        {
            Id = pedido.Id,
            TableId = mesa.Numero,
            Type = "Pedido",
            Details = resultDetails,
            Status = "Pending",
            AssignedMozoId = mesa.MozoId?.ToString(),
            RestauranteId = mesa.RestauranteId
        };
        await _taskRepository.AddAsync(task);

        // Notificar al dashboard de administración y al mozo
        await _notificacionService.NotificarNuevoPedidoAsync(pedido.Id, task.Id, mesa.Numero, resultDetails, mesa.MozoId);

        return pedido;
    }

    public async Task<IEnumerable<Pedido>> GetActiveOrdersAsync()
    {
        return await _pedidoRepository.GetActiveOrdersAsync();
    }

    public async Task AprobarPedidoAsync(Guid pedidoId)
    {
        var pedido = await _pedidoRepository.GetByIdAsync(pedidoId);
        if (pedido == null) throw new Exception("Pedido no encontrado.");

        pedido.Estado = EstadoPedido.Aprobado;
        await _pedidoRepository.UpdateAsync(pedido);

        var resultDetails = string.Join(", ", pedido.Items.Select(i => $"{i.Cantidad}x {i.MenuItem?.Nombre ?? "Item"}"));

        // Notificar por SignalR a la cocina y al administrador/mozo
        await _notificacionService.NotificarPedidoAprobadoAsync(pedido.Id, pedido.Mesa?.Numero ?? 0, resultDetails, pedido.Mesa?.MozoId);
    }

    public async Task ActualizarEstadoPedidoAsync(Guid pedidoId, EstadoPedido nuevoEstado)
    {
        var pedido = await _pedidoRepository.GetByIdAsync(pedidoId);
        if (pedido == null) throw new Exception("Pedido no encontrado.");

        pedido.Estado = nuevoEstado;
        await _pedidoRepository.UpdateAsync(pedido);

        if (nuevoEstado == EstadoPedido.Listo)
        {
            // Notificar al mozo que el pedido está listo
            await _notificacionService.NotificarPedidoListoAsync(pedido.Id, pedido.Id, pedido.Mesa?.Numero ?? 0, pedido.Mesa?.MozoId);
        }
        else if (nuevoEstado == EstadoPedido.EnPreparacion)
        {
            // Notificar a todos que el pedido está en preparación
            await _notificacionService.NotificarPedidoAprobadoAsync(pedido.Id, pedido.Mesa?.Numero ?? 0, "", pedido.Mesa?.MozoId);
        }
        else if (nuevoEstado == EstadoPedido.Entregado || nuevoEstado == EstadoPedido.Cancelado)
        {
            // Completar la tarea original de la mesa
            var task = await _taskRepository.GetByIdIgnoreQueryFiltersAsync(pedidoId);
            if (task != null)
            {
                task.Status = "Completed";
                await _taskRepository.UpdateAsync(task);
            }
            await _notificacionService.NotificarTareaCompletadaAsync(pedidoId);

            // Si se entrega el pedido, sumar su monto al consumido de la mesa
            if (nuevoEstado == EstadoPedido.Entregado)
            {
                var mesa = await _mesaRepository.GetByIdAsync(pedido.MesaId);
                if (mesa != null)
                {
                    decimal totalPedido = pedido.Items.Sum(i => i.Cantidad * i.PrecioUnitario);
                    mesa.MontoConsumo = (mesa.MontoConsumo ?? 0) + totalPedido;
                    await _mesaRepository.UpdateAsync(mesa);

                    // Notificar consumo actualizado a los comensales
                    await _notificacionService.NotificarMontoConsumoActualizadoAsync(mesa.Id, mesa.MontoConsumo);
                }
            }
        }
    }
}
