using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public DevicesController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDeviceDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Usuarios.FindAsync(userId);
        if (user == null) return NotFound("User not found");

        var existing = await _context.UserDeviceTokens
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Token == dto.Token);

        if (existing != null)
        {
            existing.UsuarioId = userId;
            existing.RestauranteId = user.RestauranteId;
            existing.DeviceType = dto.DeviceType;
            _context.UserDeviceTokens.Update(existing);
        }
        else
        {
            var deviceToken = new UserDeviceToken
            {
                Id = Guid.NewGuid(),
                UsuarioId = userId,
                RestauranteId = user.RestauranteId,
                Token = dto.Token,
                DeviceType = dto.DeviceType,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserDeviceTokens.Add(deviceToken);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Device registered successfully" });
    }

    [HttpPost("unregister")]
    [AllowAnonymous]
    public async Task<IActionResult> Unregister([FromBody] UnregisterDeviceDto dto)
    {
        var existing = await _context.UserDeviceTokens
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Token == dto.Token);

        if (existing != null)
        {
            _context.UserDeviceTokens.Remove(existing);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Device unregistered successfully" });
    }
}

public class RegisterDeviceDto
{
    public string Token { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
}

public class UnregisterDeviceDto
{
    public string Token { get; set; } = string.Empty;
}
