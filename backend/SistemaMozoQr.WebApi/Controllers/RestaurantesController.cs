using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Admin,Caja")]
public class RestaurantesController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public RestaurantesController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (_context.IsSuperAdmin)
        {
            var restaurantes = await _context.Restaurantes.ToListAsync();
            return Ok(restaurantes);
        }
        else
        {
            var restaurantes = await _context.Restaurantes
                .Where(r => r.Id == _context.CurrentTenantId || r.ParentRestauranteId == _context.CurrentTenantId)
                .ToListAsync();
            return Ok(restaurantes);
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var restaurante = await _context.Restaurantes.FindAsync(id);
        if (restaurante == null) return NotFound();
        
        if (!_context.IsSuperAdmin && restaurante.Id != _context.CurrentTenantId && restaurante.ParentRestauranteId != _context.CurrentTenantId)
            return Forbid();

        return Ok(restaurante);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Restaurante restaurante)
    {
        restaurante.Id = Guid.NewGuid();
        restaurante.FechaCreacion = DateTime.UtcNow;

        if (!_context.IsSuperAdmin)
        {
            // Un Admin solo puede crear sucursales dependientes de su restaurante actual
            restaurante.ParentRestauranteId = _context.CurrentTenantId;
        }

        _context.Restaurantes.Add(restaurante);
        await _context.SaveChangesAsync();
        return Ok(restaurante);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Restaurante restaurante)
    {
        var existing = await _context.Restaurantes.FindAsync(id);
        if (existing == null) return NotFound();

        if (!_context.IsSuperAdmin && existing.ParentRestauranteId != _context.CurrentTenantId)
            return Forbid();

        existing.Nombre = restaurante.Nombre;
        existing.Activo = restaurante.Activo;
        existing.LogoUrl = restaurante.LogoUrl;
        existing.IconoPrincipal = restaurante.IconoPrincipal;
        existing.ImagenFondoUrl = restaurante.ImagenFondoUrl;
        existing.ColorPrimario = restaurante.ColorPrimario;
        existing.ColorSecundario = restaurante.ColorSecundario;
        existing.ColorFondo = restaurante.ColorFondo;

        _context.Restaurantes.Update(existing);
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _context.Restaurantes.FindAsync(id);
        if (existing == null) return NotFound();

        if (!_context.IsSuperAdmin && existing.ParentRestauranteId != _context.CurrentTenantId)
            return Forbid();

        // Eliminar entidades dependientes primero para evitar violación de claves foráneas en SQLite
        var users = await _context.Usuarios.IgnoreQueryFilters().Where(u => u.RestauranteId == id).ToListAsync();
        _context.Usuarios.RemoveRange(users);

        var tables = await _context.Mesas.IgnoreQueryFilters().Where(m => m.RestauranteId == id).ToListAsync();
        _context.Mesas.RemoveRange(tables);

        var menuItems = await _context.MenuItems.IgnoreQueryFilters().Where(m => m.RestauranteId == id).ToListAsync();
        _context.MenuItems.RemoveRange(menuItems);

        var orders = await _context.Pedidos.IgnoreQueryFilters().Where(p => p.RestauranteId == id).ToListAsync();
        var orderIds = orders.Select(o => o.Id).ToList();
        var orderItems = await _context.PedidoItems.Where(pi => orderIds.Contains(pi.PedidoId)).ToListAsync();
        _context.PedidoItems.RemoveRange(orderItems);
        _context.Pedidos.RemoveRange(orders);

        var tasks = await _context.Tasks.IgnoreQueryFilters().Where(t => t.RestauranteId == id).ToListAsync();
        _context.Tasks.RemoveRange(tasks);

        var auditLogs = await _context.Auditorias.IgnoreQueryFilters().Where(a => a.RestauranteId == id).ToListAsync();
        _context.Auditorias.RemoveRange(auditLogs);

        var errorLogs = await _context.ErrorLogs.IgnoreQueryFilters().Where(e => e.RestauranteId == id).ToListAsync();
        _context.ErrorLogs.RemoveRange(errorLogs);

        var widgetConfigs = await _context.DashboardWidgetConfigs.IgnoreQueryFilters().Where(w => w.RestauranteId == id).ToListAsync();
        _context.DashboardWidgetConfigs.RemoveRange(widgetConfigs);

        _context.Restaurantes.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
