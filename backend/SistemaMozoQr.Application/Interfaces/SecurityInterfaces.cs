using SistemaMozoQr.Application.DTOs;

namespace SistemaMozoQr.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
}

public interface IUsuarioService
{
    Task<IEnumerable<UsuarioDto>> GetAllAsync();
    Task<UsuarioDto> CrearUsuarioAsync(CrearUsuarioDto dto);
    Task<UsuarioDto> ActualizarUsuarioAsync(Guid id, EditarUsuarioDto dto);
    Task EliminarUsuarioAsync(Guid id);
    Task CambiarPasswordAsync(Guid id, string nuevaPassword);
}
