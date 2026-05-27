using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface IMenuItemRepository
{
    Task<IEnumerable<MenuItem>> GetAllActivosAsync();
    Task<IEnumerable<MenuItem>> GetAllActivosPorRestauranteAsync(Guid restauranteId);
    Task<IEnumerable<MenuItem>> GetAllAsync();
    Task<MenuItem?> GetByIdAsync(Guid id);
    Task<MenuItem> AddAsync(MenuItem item);
    Task UpdateAsync(MenuItem item);
    Task DeleteAsync(MenuItem item);
    Task BulkSyncAsync(IEnumerable<MenuItem> items);
}
