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
        var mesa = await _mesaRepository.GetByIdAsync(pedidoDto.MesaId);
        if (mesa == null) throw new Exception("Mesa no encontrada.");

        var pedido = new Pedido
        {
            Id = Guid.NewGuid(),
            MesaId = mesa.Id,
            RestauranteId = mesa.RestauranteId,
            Estado = EstadoPedido.Recibido,
            Fecha = DateTime.UtcNow,
            Items = new List<PedidoItem>()
        };

        foreach (var itemDto in pedidoDto.Items)
        {
            var menuItem = await _menuItemRepository.GetByIdAsync(itemDto.MenuItemId);
            if (menuItem == null) throw new Exception($"MenuItem {itemDto.MenuItemId} no encontrado.");

            pedido.Items.Add(new PedidoItem
            {
                Id = Guid.NewGuid(),
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

        pedido.Estado = EstadoPedido.EnPreparacion;
        await _pedidoRepository.UpdateAsync(pedido);

        // Completar la tarea original de aprobación
        var task = await _taskRepository.GetByIdIgnoreQueryFiltersAsync(pedidoId);
        if (task != null)
        {
            task.Status = "Completed";
            await _taskRepository.UpdateAsync(task);
        }

        var resultDetails = string.Join(", ", pedido.Items.Select(i => $"{i.Cantidad}x {i.MenuItem?.Nombre ?? "Item"}"));

        // Notificar por SignalR a la cocina y al administrador
        await _notificacionService.NotificarPedidoAprobadoAsync(pedido.Id, pedido.Mesa?.Numero ?? 0, resultDetails, pedido.Mesa?.MozoId);
    }

    public async Task ActualizarEstadoPedidoAsync(Guid pedidoId, EstadoPedido nuevoEstado)
    {
        var pedido = await _pedidoRepository.GetByIdAsync(pedidoId);
        if (pedido == null) throw new Exception("Pedido no encontrado.");

        pedido.Estado = nuevoEstado;
        await _pedidoRepository.UpdateAsync(pedido);

        var resultDetails = string.Join(", ", pedido.Items.Select(i => $"{i.Cantidad}x {i.MenuItem?.Nombre ?? "Item"}"));

        if (nuevoEstado == EstadoPedido.Listo)
        {
            // Crear nueva tarea para el mozo indicando que el pedido está listo
            var taskId = Guid.NewGuid();
            var task = new MesaTask
            {
                Id = taskId,
                TableId = pedido.Mesa?.Numero ?? 0,
                Type = "Pedido Listo",
                Details = $"Pedido listo para retirar: {resultDetails}",
                Status = "Pending",
                AssignedMozoId = pedido.Mesa?.MozoId?.ToString(),
                RestauranteId = pedido.RestauranteId
            };
            await _taskRepository.AddAsync(task);

            // Notificar al mozo
            await _notificacionService.NotificarPedidoListoAsync(pedido.Id, taskId, pedido.Mesa?.Numero ?? 0, pedido.Mesa?.MozoId);
        }
        else if (nuevoEstado == EstadoPedido.Entregado)
        {
            // Si el pedido se entregó, completar las tareas del tipo "Pedido Listo" para esta mesa
            var pendingTasks = await _taskRepository.GetPendingTasksIgnoreQueryFiltersAsync();
            var tableReadyTasks = pendingTasks
                .Where(t => t.TableId == (pedido.Mesa?.Numero ?? 0) && t.Type == "Pedido Listo" && t.RestauranteId == pedido.RestauranteId)
                .ToList();

            foreach (var t in tableReadyTasks)
            {
                t.Status = "Completed";
                await _taskRepository.UpdateAsync(t);
            }
        }
    }
}
