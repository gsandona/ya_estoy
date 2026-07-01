using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class VentasController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public VentasController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpGet("resumen")]
    public async Task<IActionResult> GetResumen(
        [FromQuery] Guid? restauranteId = null, 
        [FromQuery] string? fecha = null,
        [FromQuery] string? startUtc = null,
        [FromQuery] string? endUtc = null)
    {
        DateTime targetStart;
        DateTime targetEnd;

        if (!string.IsNullOrWhiteSpace(startUtc) && DateTime.TryParse(startUtc, out DateTime parsedStart) &&
            !string.IsNullOrWhiteSpace(endUtc) && DateTime.TryParse(endUtc, out DateTime parsedEnd))
        {
            targetStart = DateTime.SpecifyKind(parsedStart, DateTimeKind.Utc);
            targetEnd = DateTime.SpecifyKind(parsedEnd, DateTimeKind.Utc);
        }
        else
        {
            DateTime targetDate;
            if (!string.IsNullOrWhiteSpace(fecha) && DateTime.TryParse(fecha, out DateTime parsedDate))
            {
                targetDate = parsedDate.Date;
            }
            else
            {
                // Por defecto la fecha local/UTC actual
                targetDate = DateTime.UtcNow.Date;
            }
            targetStart = DateTime.SpecifyKind(targetDate, DateTimeKind.Utc);
            targetEnd = DateTime.SpecifyKind(targetDate.AddDays(1), DateTimeKind.Utc);
        }

        var query = _context.Ventas.IgnoreQueryFilters().AsQueryable();

        // Si es Admin, obligatoriamente su restaurante
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var tenantIdClaim = User.FindFirst("RestauranteId")?.Value;
        
        if (userRole == "Admin" && Guid.TryParse(tenantIdClaim, out Guid adminTenantId))
        {
            query = query.Where(v => v.RestauranteId == adminTenantId);
        }
        else if (restauranteId.HasValue)
        {
            query = query.Where(v => v.RestauranteId == restauranteId.Value);
        }

        // SQLite almacena fechas en formato de texto ISO. Hacemos filtrado entre inicio y fin de día en UTC
        query = query.Where(v => v.FechaHora >= targetStart && v.FechaHora < targetEnd);

        var ventasList = await query.OrderByDescending(v => v.FechaHora).ToListAsync();

        return Ok(ventasList);
    }
}
