using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface IPedidoRepository
{
    Task<Pedido> AddAsync(Pedido pedido);
    Task<Pedido?> GetByIdAsync(Guid id);
    Task<IEnumerable<Pedido>> GetByMesaIdAsync(Guid mesaId);
    Task<IEnumerable<Pedido>> GetActiveOrdersAsync();
    Task UpdateAsync(Pedido pedido);
}
