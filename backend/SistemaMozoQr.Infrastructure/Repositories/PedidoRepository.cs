using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.Infrastructure.Repositories;

public class PedidoRepository : IPedidoRepository
{
    private readonly RestauranteDbContext _context;

    public PedidoRepository(RestauranteDbContext context)
    {
        _context = context;
    }

    public async Task<Pedido> AddAsync(Pedido pedido)
    {
        await _context.Pedidos.AddAsync(pedido);
        await _context.SaveChangesAsync();
        return pedido;
    }

    public async Task<Pedido?> GetByIdAsync(Guid id)
    {
        return await _context.Pedidos
            .Include(p => p.Items)
            .Include(p => p.Mesa)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Pedido>> GetByMesaIdAsync(Guid mesaId)
    {
        return await _context.Pedidos
            .Include(p => p.Items)
            .Where(p => p.MesaId == mesaId)
            .ToListAsync();
    }

    public async Task UpdateAsync(Pedido pedido)
    {
        _context.Pedidos.Update(pedido);
        await _context.SaveChangesAsync();
    }
}
