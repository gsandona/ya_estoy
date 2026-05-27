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

    public async Task<IEnumerable<MenuItem>> GetAllAsync()
    {
        return await _context.MenuItems.ToListAsync();
    }

    public async Task<IEnumerable<MenuItem>> GetAllActivosAsync()
    {
        return await _context.MenuItems.Where(m => m.Activo).ToListAsync();
    }

    public async Task<IEnumerable<MenuItem>> GetAllActivosPorRestauranteAsync(Guid restauranteId)
    {
        return await _context.MenuItems.IgnoreQueryFilters().Where(m => m.RestauranteId == restauranteId && m.Activo).ToListAsync();
    }

    public async Task<MenuItem?> GetByIdAsync(Guid id)
    {
        return await _context.MenuItems.FindAsync(id);
    }

    public async Task<MenuItem> AddAsync(MenuItem item)
    {
        await _context.MenuItems.AddAsync(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task UpdateAsync(MenuItem item)
    {
        _context.MenuItems.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(MenuItem item)
    {
        _context.MenuItems.Remove(item);
        await _context.SaveChangesAsync();
    }

    public async Task BulkSyncAsync(IEnumerable<MenuItem> incomingItems)
    {
        var dbItems = await _context.MenuItems.ToListAsync();
        
        // Items a borrar (están en DB pero no en incoming)
        var toDelete = dbItems.Where(dbItem => !incomingItems.Any(inc => inc.Id == dbItem.Id)).ToList();
        if (toDelete.Any())
        {
            _context.MenuItems.RemoveRange(toDelete);
        }

        foreach (var inc in incomingItems)
        {
            var dbItem = dbItems.FirstOrDefault(db => db.Id == inc.Id);
            if (dbItem != null)
            {
                // Actualizar
                dbItem.Categoria = inc.Categoria;
                dbItem.Nombre = inc.Nombre;
                dbItem.Precio = inc.Precio;
                dbItem.Descripcion = inc.Descripcion;
                dbItem.Activo = inc.Activo;
                _context.MenuItems.Update(dbItem);
            }
            else
            {
                // Crear
                if (inc.Id == Guid.Empty) inc.Id = Guid.NewGuid();
                _context.MenuItems.Add(inc);
            }
        }

        await _context.SaveChangesAsync();
    }
}
