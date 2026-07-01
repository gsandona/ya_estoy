using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class LogsController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public LogsController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpGet("auditoria")]
    public async Task<IActionResult> GetAuditoriaLogs([FromQuery] Guid? restauranteId = null)
    {
        var query = _context.Auditorias.IgnoreQueryFilters().AsQueryable();
        if (restauranteId.HasValue)
        {
            query = query.Where(a => a.RestauranteId == restauranteId.Value);
        }
        var logs = await query.OrderByDescending(a => a.FechaHora).Take(100).ToListAsync();
        return Ok(logs);
    }

    [HttpGet("errores")]
    public async Task<IActionResult> GetErrorLogs([FromQuery] Guid? restauranteId = null)
    {
        var query = _context.ErrorLogs.IgnoreQueryFilters().AsQueryable();
        if (restauranteId.HasValue)
        {
            query = query.Where(a => a.RestauranteId == restauranteId.Value);
        }
        var logs = await query.OrderByDescending(a => a.FechaHora).Take(100).ToListAsync();
        return Ok(logs);
    }
}
