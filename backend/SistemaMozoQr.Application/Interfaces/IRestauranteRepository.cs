using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Application.Interfaces;

public interface IRestauranteRepository
{
    Task<IEnumerable<Restaurante>> GetAllAsync();
    Task<Restaurante?> GetByIdAsync(Guid id);
    Task<Restaurante> AddAsync(Restaurante restaurante);
    Task UpdateAsync(Restaurante restaurante);
    Task DeleteAsync(Restaurante restaurante);
}
