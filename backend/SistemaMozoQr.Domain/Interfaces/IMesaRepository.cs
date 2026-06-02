using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface IMesaRepository
{
    Task<Mesa?> GetByIdAsync(Guid id);
    Task<Mesa?> GetByTokenQRAsync(string tokenQR);
    Task<Mesa?> GetByNumeroIgnoreQueryFiltersAsync(int numero);
    Task<IEnumerable<Mesa>> GetAllAsync();
    Task<Mesa> AddAsync(Mesa mesa);
    Task UpdateAsync(Mesa mesa);
    Task DeleteAsync(Mesa mesa);
    Task BulkSyncAsync(IEnumerable<Mesa> mesas);
}
