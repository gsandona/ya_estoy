using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.Infrastructure.Repositories;

public class MesaRepository : IMesaRepository
{
    private readonly RestauranteDbContext _context;

    public MesaRepository(RestauranteDbContext context)
    {
        _context = context;
    }

    public async Task<Mesa?> GetByIdAsync(Guid id)
    {
        return await _context.Mesas.IgnoreQueryFilters().FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<Mesa?> GetByTokenQRAsync(string tokenQR)
    {
        return await _context.Mesas.IgnoreQueryFilters().Include(m => m.Restaurante).FirstOrDefaultAsync(m => m.TokenQR == tokenQR);
    }

    public async Task<Mesa?> GetByNumeroIgnoreQueryFiltersAsync(int numero)
    {
        return await _context.Mesas.IgnoreQueryFilters().Include(m => m.Mozo).FirstOrDefaultAsync(m => m.Numero == numero);
    }

    public async Task<Mesa?> GetByRestauranteAndNumeroAsync(string restauranteNombre, int numeroMesa)
    {
        var mesas = await _context.Mesas
            .IgnoreQueryFilters()
            .Include(m => m.Restaurante)
            .Include(m => m.Mozo)
            .ToListAsync();

        return mesas.FirstOrDefault(m => 
            m.Numero == numeroMesa && 
            m.Restaurante != null && 
            NormalizeString(m.Restaurante.Nombre) == NormalizeString(restauranteNombre));
    }

    public async Task<IEnumerable<Mesa>> GetAllAsync()
    {
        return await _context.Mesas.Include(m => m.Mozo).ToListAsync();
    }

    public async Task<Mesa> AddAsync(Mesa mesa)
    {
        await _context.Mesas.AddAsync(mesa);
        await _context.SaveChangesAsync();
        return mesa;
    }

    public async Task UpdateAsync(Mesa mesa)
    {
        _context.Mesas.Update(mesa);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Mesa mesa)
    {
        _context.Mesas.Remove(mesa);
        await _context.SaveChangesAsync();
    }

    public async Task BulkSyncAsync(IEnumerable<Mesa> incomingItems)
    {
        var dbItems = await _context.Mesas.ToListAsync();
        
        var toDelete = dbItems.Where(db => !incomingItems.Any(inc => inc.Id == db.Id)).ToList();
        if (toDelete.Any())
        {
            _context.Mesas.RemoveRange(toDelete);
        }

        foreach (var inc in incomingItems)
        {
            var dbItem = dbItems.FirstOrDefault(db => db.Id == inc.Id);
            if (dbItem != null)
            {
                dbItem.Numero = inc.Numero;
                dbItem.Ubicacion = inc.Ubicacion;
                dbItem.MozoId = inc.MozoId;
                _context.Mesas.Update(dbItem);
            }
            else
            {
                if (inc.Id == Guid.Empty) inc.Id = Guid.NewGuid();
                inc.Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible;
                _context.Mesas.Add(inc);
            }
        }

        await _context.SaveChangesAsync();
    }

    private static string NormalizeString(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        return new string(input.ToLowerInvariant()
            .Where(c => !char.IsWhiteSpace(c) && c != '-')
            .ToArray());
    }
}
