using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.Infrastructure.Repositories;

public class MenuItemRepository : IMenuItemRepository
{
    private readonly RestauranteDbContext _context;

    public MenuItemRepository(RestauranteDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MenuItem>> GetAllActivosAsync()
    {
        return await _context.MenuItems.Where(m => m.Activo).ToListAsync();
    }

    public async Task<MenuItem?> GetByIdAsync(Guid id)
    {
        return await _context.MenuItems.FindAsync(id);
    }
}
