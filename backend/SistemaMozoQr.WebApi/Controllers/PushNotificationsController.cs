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
public class PushNotificationsController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public PushNotificationsController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpGet("public-key")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicKey()
    {
        var setting = await _context.SystemSettings.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.Key == "VapidPublicKey");
        if (setting == null) return NotFound("VAPID keys not generated yet");
        return Ok(new { publicKey = setting.Value });
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized();
        }

        // Obtener el usuario para asociarle su RestauranteId (Multi-Tenancy)
        var user = await _context.Usuarios.FindAsync(userId);
        if (user == null) return NotFound("User not found");

        // Evitar duplicados por Endpoint globalmente
        var existing = await _context.PushSubscriptions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Endpoint == dto.Endpoint);

        if (existing != null)
        {
            existing.UsuarioId = userId;
            existing.RestauranteId = user.RestauranteId;
            existing.P256dh = dto.P256dh;
            existing.Auth = dto.Auth;
            _context.PushSubscriptions.Update(existing);
        }
        else
        {
            var sub = new UserPushSubscription
            {
                Id = Guid.NewGuid(),
                UsuarioId = userId,
                RestauranteId = user.RestauranteId,
                Endpoint = dto.Endpoint,
                P256dh = dto.P256dh,
                Auth = dto.Auth,
                CreatedAt = DateTime.UtcNow
            };
            _context.PushSubscriptions.Add(sub);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Subscribed successfully" });
    }

    [HttpPost("unsubscribe")]
    [AllowAnonymous]
    public async Task<IActionResult> Unsubscribe([FromBody] PushSubscriptionDto dto)
    {
        var existing = await _context.PushSubscriptions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Endpoint == dto.Endpoint);

        if (existing != null)
        {
            _context.PushSubscriptions.Remove(existing);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Unsubscribed successfully" });
    }
}

public class PushSubscriptionDto
{
    public string Endpoint { get; set; } = string.Empty;
    public string P256dh { get; set; } = string.Empty;
    public string Auth { get; set; } = string.Empty;
}
