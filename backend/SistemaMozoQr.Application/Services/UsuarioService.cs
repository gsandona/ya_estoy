using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IRestauranteRepository _restauranteRepository;
    private readonly ICurrentUserService _currentUserService;

    public UsuarioService(
        IUsuarioRepository usuarioRepository, 
        IRestauranteRepository restauranteRepository, 
        ICurrentUserService currentUserService)
    {
        _usuarioRepository = usuarioRepository;
        _restauranteRepository = restauranteRepository;
        _currentUserService = currentUserService;
    }

    private void ValidarFortalezaPassword(string? password)
    {
        if (string.IsNullOrEmpty(password)) return;
        
        // Mínimo 8 caracteres
        if (password.Length < 8)
            throw new Exception("La contraseña debe tener al menos 8 caracteres de longitud.");
            
        // Al menos 1 mayúscula
        bool hasUpper = password.Any(char.IsUpper);
        if (!hasUpper)
            throw new Exception("La contraseña debe tener al menos una letra mayúscula.");
            
        // Al menos 1 símbolo
        bool hasSymbol = password.Any(c => !char.IsLetterOrDigit(c));
        if (!hasSymbol)
            throw new Exception("La contraseña debe tener al menos un símbolo especial (ej. .,+°!).");
    }

    public async Task<UsuarioDto> CrearUsuarioAsync(CrearUsuarioDto dto)
    {
        var existing = await _usuarioRepository.GetByUsernameAsync(dto.Username);
        if (existing != null)
            throw new Exception("El nombre de usuario ya está en uso.");

        ValidarFortalezaPassword(dto.Password);

        var restauranteId = dto.RestauranteId;
        if (!restauranteId.HasValue)
        {
            restauranteId = _currentUserService.GetRestauranteId();
            if (!restauranteId.HasValue)
            {
                var rests = await _restauranteRepository.GetAllAsync();
                var firstRest = rests.FirstOrDefault();
                if (firstRest == null)
                    throw new Exception("No hay restaurantes en el sistema para asociar al usuario.");
                restauranteId = firstRest.Id;
            }
        }

        var user = new Usuario
        {
            Id = dto.Id ?? Guid.NewGuid(),
            NombreCompleto = dto.NombreCompleto ?? "Usuario",
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(string.IsNullOrEmpty(dto.Password) ? "MozoGo1234!" : dto.Password),
            Rol = dto.Role,
            RestauranteId = restauranteId.Value
        };

        await _usuarioRepository.AddAsync(user);

        var restsList = await _restauranteRepository.GetAllAsync();

        return new UsuarioDto
        {
            Id = user.Id,
            NombreCompleto = user.NombreCompleto,
            Username = user.Username,
            Role = user.Rol.ToString(),
            RestauranteId = user.RestauranteId,
            RestauranteNombre = restsList.FirstOrDefault(r => r.Id == user.RestauranteId)?.Nombre ?? "Sin Restaurante"
        };
    }

    public async Task<UsuarioDto> ActualizarUsuarioAsync(Guid id, EditarUsuarioDto dto)
    {
        var user = await _usuarioRepository.GetByIdAsync(id);
        if (user == null)
            throw new Exception("Usuario no encontrado.");

        if (user.Username != dto.Username)
        {
            var existing = await _usuarioRepository.GetByUsernameAsync(dto.Username);
            if (existing != null)
                throw new Exception("El nombre de usuario ya está en uso.");
        }

        if (!string.IsNullOrEmpty(dto.Password))
        {
            ValidarFortalezaPassword(dto.Password);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        user.NombreCompleto = dto.NombreCompleto ?? user.NombreCompleto;
        user.Username = dto.Username;
        user.Rol = dto.Role;
        if (dto.RestauranteId.HasValue)
        {
            user.RestauranteId = dto.RestauranteId.Value;
        }

        await _usuarioRepository.UpdateAsync(user);

        var restsList = await _restauranteRepository.GetAllAsync();

        return new UsuarioDto
        {
            Id = user.Id,
            NombreCompleto = user.NombreCompleto,
            Username = user.Username,
            Role = user.Rol.ToString(),
            RestauranteId = user.RestauranteId,
            RestauranteNombre = restsList.FirstOrDefault(r => r.Id == user.RestauranteId)?.Nombre ?? "Sin Restaurante"
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
        var restaurantes = await _restauranteRepository.GetAllAsync();
        
        return usuarios.Select(u => new UsuarioDto
        {
            Id = u.Id,
            NombreCompleto = u.NombreCompleto,
            Username = u.Username,
            Role = u.Rol.ToString(),
            RestauranteId = u.RestauranteId,
            RestauranteNombre = restaurantes.FirstOrDefault(r => r.Id == u.RestauranteId)?.Nombre ?? "Sin Restaurante"
        });
    }

    public async Task CambiarPasswordAsync(Guid id, string nuevaPassword)
    {
        var user = await _usuarioRepository.GetByIdAsync(id);
        if (user == null)
            throw new Exception("Usuario no encontrado.");

        ValidarFortalezaPassword(nuevaPassword);

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(nuevaPassword);
        await _usuarioRepository.UpdateAsync(user);
    }
}
