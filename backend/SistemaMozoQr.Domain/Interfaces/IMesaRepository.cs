using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface IMesaRepository
{
    Task<Mesa?> GetByIdAsync(Guid id);
    Task<Mesa?> GetByTokenQRAsync(string tokenQR);
    Task<IEnumerable<Mesa>> GetAllAsync();
    Task<Mesa> AddAsync(Mesa mesa);
    Task UpdateAsync(Mesa mesa);
    Task DeleteAsync(Mesa mesa);
    Task BulkSyncAsync(IEnumerable<Mesa> mesas);
}
