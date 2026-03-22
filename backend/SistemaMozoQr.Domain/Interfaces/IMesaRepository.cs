using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface IMesaRepository
{
    Task<Mesa?> GetByIdAsync(Guid id);
    Task<Mesa?> GetByTokenQRAsync(string tokenQR);
    Task UpdateAsync(Mesa mesa);
    Task<IEnumerable<Mesa>> GetAllAsync();
}
