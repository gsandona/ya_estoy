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

    public PedidoService(
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        IMenuItemRepository menuItemRepository,
        INotificacionService notificacionService)
    {
        _pedidoRepository = pedidoRepository;
        _mesaRepository = mesaRepository;
        _menuItemRepository = menuItemRepository;
        _notificacionService = notificacionService;
    }

    public async Task<Pedido> CrearPedidoAsync(CrearPedidoDto pedidoDto)
    {
        var mesa = await _mesaRepository.GetByIdAsync(pedidoDto.MesaId);
        if (mesa == null) throw new Exception("Mesa no encontrada.");

        var pedido = new Pedido
        {
            Id = Guid.NewGuid(),
            MesaId = mesa.Id,
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
                PrecioUnitario = menuItem.Precio
            });
        }

        await _pedidoRepository.AddAsync(pedido);

        var resultDetails = string.Join(", ", pedido.Items.Select(i => $"{i.Cantidad}x {i.MenuItem?.Nombre ?? "Item"}"));
        
        // Notificar al dashboard de administración
        await _notificacionService.NotificarNuevoPedidoAsync(pedido.Id, mesa.Id, mesa.Numero, resultDetails);

        return pedido;
    }
}
