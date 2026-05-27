using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.Infrastructure.Repositories;

public class RestauranteRepository : IRestauranteRepository
{
    private readonly RestauranteDbContext _context;

    public RestauranteRepository(RestauranteDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Restaurante>> GetAllAsync()
    {
        return await _context.Restaurantes.ToListAsync();
    }

    public async Task<Restaurante?> GetByIdAsync(Guid id)
    {
        return await _context.Restaurantes.FindAsync(id);
    }

    public async Task<Restaurante> AddAsync(Restaurante restaurante)
    {
        await _context.Restaurantes.AddAsync(restaurante);
        await _context.SaveChangesAsync();
        return restaurante;
    }

    public async Task UpdateAsync(Restaurante restaurante)
    {
        _context.Restaurantes.Update(restaurante);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Restaurante restaurante)
    {
        _context.Restaurantes.Remove(restaurante);
        await _context.SaveChangesAsync();
    }
}
