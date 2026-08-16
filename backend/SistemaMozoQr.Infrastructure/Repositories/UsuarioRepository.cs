using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly RestauranteDbContext _context;

    public UsuarioRepository(RestauranteDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario> AddAsync(Usuario usuario)
    {
        await _context.Usuarios.AddAsync(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task DeleteAsync(Usuario usuario)
    {
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync()
    {
        return await _context.Usuarios.ToListAsync();
    }

    public async Task<Usuario?> GetByIdAsync(Guid id)
    {
        return await _context.Usuarios.FindAsync(id);
    }

    public async Task<Usuario?> GetByUsernameAsync(string username)
    {
        return await _context.Usuarios.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task BulkSyncAsync(IEnumerable<Usuario> incomingItems)
    {
        var dbItems = await _context.Usuarios.ToListAsync();
        
        var toDelete = dbItems.Where(db => !incomingItems.Any(inc => inc.Id == db.Id) && db.Username != "admin").ToList();
        if (toDelete.Any())
        {
            var toDeleteIds = toDelete.Select(u => u.Id).ToList();
            var mesasAffected = await _context.Mesas.Where(m => m.MozoId.HasValue && toDeleteIds.Contains(m.MozoId.Value)).ToListAsync();
            foreach (var mesa in mesasAffected)
            {
                mesa.MozoId = null;
            }
            _context.Usuarios.RemoveRange(toDelete);
        }

        foreach (var inc in incomingItems)
        {
            var dbItem = dbItems.FirstOrDefault(db => db.Id == inc.Id);
            if (dbItem != null)
            {
                dbItem.Username = inc.Username;
                dbItem.Rol = inc.Rol;
                if (!string.IsNullOrEmpty(inc.PasswordHash))
                {
                    dbItem.PasswordHash = inc.PasswordHash;
                }
                _context.Usuarios.Update(dbItem);
            }
            else
            {
                if (inc.Id == Guid.Empty) inc.Id = Guid.NewGuid();
                inc.PasswordHash = string.IsNullOrEmpty(inc.PasswordHash) ? BCrypt.Net.BCrypt.HashPassword("123456") : inc.PasswordHash;
                inc.NombreCompleto = "Nuevo Usuario";
                _context.Usuarios.Add(inc);
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<string>> GetFeaturesForRoleAsync(int roleId)
    {
        return await _context.RoleFeatures
            .Where(rf => rf.RoleId == roleId && rf.Activo)
            .Select(rf => rf.FeatureKey)
            .ToListAsync();
    }
}
