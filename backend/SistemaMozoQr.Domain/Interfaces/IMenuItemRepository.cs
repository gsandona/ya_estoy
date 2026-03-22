using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface IMenuItemRepository
{
    Task<IEnumerable<MenuItem>> GetAllActivosAsync();
    Task<MenuItem?> GetByIdAsync(Guid id);
}
