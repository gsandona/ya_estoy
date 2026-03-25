using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<UsuarioDto> CrearUsuarioAsync(CrearUsuarioDto dto)
    {
        var existing = await _usuarioRepository.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new Exception("El email ya está en uso.");

        var user = new Usuario
        {
            Id = dto.Id ?? Guid.NewGuid(),
            NombreCompleto = dto.NombreCompleto ?? "Usuario",
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(string.IsNullOrEmpty(dto.Password) ? "123456" : dto.Password),
            Rol = dto.Role
        };

        await _usuarioRepository.AddAsync(user);

        return new UsuarioDto
        {
            Id = user.Id,
            NombreCompleto = user.NombreCompleto,
            Email = user.Email,
            Role = user.Rol.ToString()
        };
    }

    public async Task<UsuarioDto> ActualizarUsuarioAsync(Guid id, EditarUsuarioDto dto)
    {
        var user = await _usuarioRepository.GetByIdAsync(id);
        if (user == null)
            throw new Exception("Usuario no encontrado.");

        if (user.Email != dto.Email)
        {
            var existing = await _usuarioRepository.GetByEmailAsync(dto.Email);
            if (existing != null)
                throw new Exception("El email ya está en uso.");
        }

        user.NombreCompleto = dto.NombreCompleto ?? user.NombreCompleto;
        user.Email = dto.Email;
        user.Rol = dto.Role;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _usuarioRepository.UpdateAsync(user);

        return new UsuarioDto
        {
            Id = user.Id,
            NombreCompleto = user.NombreCompleto,
            Email = user.Email,
            Role = user.Rol.ToString()
        };
    }

    public async Task EliminarUsuarioAsync(Guid id)
    {
        var user = await _usuarioRepository.GetByIdAsync(id);
        if (user == null)
            throw new Exception("Usuario no encontrado.");
            
        await _usuarioRepository.DeleteAsync(user);
    }

    public async Task<IEnumerable<UsuarioDto>> GetAllAsync()
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        return usuarios.Select(u => new UsuarioDto
        {
            Id = u.Id,
            NombreCompleto = u.NombreCompleto,
            Email = u.Email,
            Role = u.Rol.ToString()
        });
    }
}
