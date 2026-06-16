using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Application.Interfaces;

public interface IPedidoService
{
    Task<Pedido> CrearPedidoAsync(CrearPedidoDto pedidoDto);
    Task<IEnumerable<Pedido>> GetActiveOrdersAsync();
    Task AprobarPedidoAsync(Guid pedidoId);
    Task ActualizarEstadoPedidoAsync(Guid pedidoId, SistemaMozoQr.Domain.Enums.EstadoPedido nuevoEstado);
}
