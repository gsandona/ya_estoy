using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByUsernameAsync(string username);
    Task<Usuario?> GetByIdAsync(Guid id);
    Task<IEnumerable<Usuario>> GetAllAsync();
    Task<Usuario> AddAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task DeleteAsync(Usuario usuario);
    Task BulkSyncAsync(IEnumerable<Usuario> items);
    Task<List<string>> GetFeaturesForRoleAsync(int roleId);
}
