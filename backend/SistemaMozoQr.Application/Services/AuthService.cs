using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SistemaMozoQr.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IConfiguration _configuration;
    private readonly IRestauranteRepository _restauranteRepository;

    public AuthService(IUsuarioRepository usuarioRepository, IConfiguration configuration, IRestauranteRepository restauranteRepository)
    {
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
        _restauranteRepository = restauranteRepository;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var user = await _usuarioRepository.GetByEmailAsync(loginDto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null; // Credenciales inválidas
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"] ?? "clave_secreta_super_larga_de_ejemplo_jwt_123");
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Rol.ToString())
        };

        if (user.RestauranteId != Guid.Empty)
        {
            claims.Add(new Claim("TenantId", user.RestauranteId.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(12),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        string? restauranteNombre = null;
        if (user.RestauranteId != Guid.Empty)
        {
            var restaurante = await _restauranteRepository.GetByIdAsync(user.RestauranteId);
            if (restaurante != null)
            {
                restauranteNombre = restaurante.Nombre;
            }
        }

        return new AuthResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Rol.ToString(),
            Token = tokenHandler.WriteToken(token),
            RestauranteId = user.RestauranteId != Guid.Empty ? user.RestauranteId : null,
            RestauranteNombre = restauranteNombre
        };
    }
}
