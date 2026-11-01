using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Enums;
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

    public AuthService(
        IUsuarioRepository usuarioRepository,
        IConfiguration configuration,
        IRestauranteRepository restauranteRepository)
    {
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
        _restauranteRepository = restauranteRepository;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var normalizedUsername = (loginDto.Username ?? string.Empty).Trim().ToLowerInvariant();
        var rawPassword = loginDto.Password ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedUsername) || string.IsNullOrWhiteSpace(rawPassword))
        {
            return null;
        }

        var user = await _usuarioRepository.GetByUsernameAsync(normalizedUsername);
        if (user == null || string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return null;
        }

        // Verificación criptográfica estricta BCrypt (sin atajos ni fallbacks)
        if (!BCrypt.Net.BCrypt.Verify(rawPassword, user.PasswordHash))
        {
            return null;
        }

        bool isSuperAdmin = user.Rol == Rol.SuperAdmin;
        Restaurante? restaurante = null;

        if (!isSuperAdmin)
        {
            // Todo usuario de restaurante debe cumplir formato usuario@local y pertenecer a un tenant activo
            if (!user.Username.Contains('@') || user.RestauranteId == Guid.Empty)
            {
                return null;
            }

            restaurante = await _restauranteRepository.GetByIdAsync(user.RestauranteId);
            if (restaurante == null || !restaurante.Activo)
            {
                return null;
            }
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"] ?? "clave_secreta_super_larga_de_ejemplo_jwt_123");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Rol.ToString())
        };

        if (!isSuperAdmin && user.RestauranteId != Guid.Empty)
        {
            claims.Add(new Claim("TenantId", user.RestauranteId.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(12),
            Issuer = _configuration["JwtSettings:Issuer"] ?? "MozoGo.Server",
            Audience = _configuration["JwtSettings:Audience"] ?? "MozoGo.Clients",
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var features = await _usuarioRepository.GetFeaturesForRoleAsync(user.RolId);

        return new AuthResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            NombreCompleto = user.NombreCompleto,
            Role = user.Rol.ToString(),
            Token = tokenHandler.WriteToken(token),
            RestauranteId = (!isSuperAdmin && restaurante != null) ? restaurante.Id : null,
            RestauranteNombre = (!isSuperAdmin && restaurante != null) ? restaurante.Nombre : null,
            RestauranteLogo = (!isSuperAdmin && restaurante != null) ? restaurante.LogoUrl : null,
            ColorPrimario = (!isSuperAdmin && restaurante != null) ? restaurante.ColorPrimario : null,
            ColorSecundario = (!isSuperAdmin && restaurante != null) ? restaurante.ColorSecundario : null,
            ColorFondo = (!isSuperAdmin && restaurante != null) ? restaurante.ColorFondo : null,
            Features = features
        };
    }
}
