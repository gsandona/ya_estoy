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
        return await _context.Mesas.FindAsync(id);
    }

    public async Task<Mesa?> GetByTokenQRAsync(string tokenQR)
    {
        return await _context.Mesas.FirstOrDefaultAsync(m => m.TokenQR == tokenQR);
    }

    public async Task UpdateAsync(Mesa mesa)
    {
        _context.Mesas.Update(mesa);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Mesa>> GetAllAsync()
    {
        return await _context.Mesas.ToListAsync();
    }
}
