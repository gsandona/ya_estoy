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

        // Eliminar entidades dependientes usando ExecuteDeleteAsync para evitar sobrecarga de memoria
        await _context.Usuarios.IgnoreQueryFilters().Where(u => u.RestauranteId == id).ExecuteDeleteAsync();
        
        await _context.Tasks.IgnoreQueryFilters().Where(t => t.RestauranteId == id).ExecuteDeleteAsync();
        await _context.Auditorias.IgnoreQueryFilters().Where(a => a.RestauranteId == id).ExecuteDeleteAsync();
        await _context.ErrorLogs.IgnoreQueryFilters().Where(e => e.RestauranteId == id).ExecuteDeleteAsync();
        await _context.DashboardWidgetConfigs.IgnoreQueryFilters().Where(w => w.RestauranteId == id).ExecuteDeleteAsync();
        
        // Para PedidoItems, necesitamos borrar los asociados a los pedidos del restaurante
        var orderIds = _context.Pedidos.IgnoreQueryFilters().Where(p => p.RestauranteId == id).Select(p => p.Id);
        await _context.PedidoItems.IgnoreQueryFilters().Where(pi => orderIds.Contains(pi.PedidoId)).ExecuteDeleteAsync();
        
        await _context.Ventas.IgnoreQueryFilters().Where(v => v.RestauranteId == id).ExecuteDeleteAsync();
        await _context.PushSubscriptions.IgnoreQueryFilters().Where(u => u.RestauranteId == id).ExecuteDeleteAsync();
        await _context.Pedidos.IgnoreQueryFilters().Where(p => p.RestauranteId == id).ExecuteDeleteAsync();
        await _context.MenuItems.IgnoreQueryFilters().Where(m => m.RestauranteId == id).ExecuteDeleteAsync();
        await _context.Mesas.IgnoreQueryFilters().Where(m => m.RestauranteId == id).ExecuteDeleteAsync();

        _context.Restaurantes.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpPost("{id:guid}/seed")]
    public async Task<IActionResult> Seed(Guid id)
    {
        var existing = await _context.Restaurantes.FindAsync(id);
        if (existing == null) return NotFound();

        // Crear categorías
        var catBebidas = new MenuCategory { Id = Guid.NewGuid(), Nombre = "Bebidas", Emoji = "🥤" };
        var catComidas = new MenuCategory { Id = Guid.NewGuid(), Nombre = "Comidas", Emoji = "🍔" };
        _context.MenuCategories.AddRange(catBebidas, catComidas);

        // Crear items
        var item1 = new MenuItem { Id = Guid.NewGuid(), RestauranteId = id, Nombre = "Cerveza Artesanal", Precio = 250, Categoria = "Bebidas", Activo = true, MenuCategoryId = catBebidas.Id };
        var item2 = new MenuItem { Id = Guid.NewGuid(), RestauranteId = id, Nombre = "Hamburguesa Completa", Precio = 550, Categoria = "Comidas", Activo = true, MenuCategoryId = catComidas.Id };
        _context.MenuItems.AddRange(item1, item2);

        // Crear mesas
        var mesa1 = new Mesa { Id = Guid.NewGuid(), RestauranteId = id, Numero = 1, Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible, TokenQR = Guid.NewGuid().ToString() };
        var mesa2 = new Mesa { Id = Guid.NewGuid(), RestauranteId = id, Numero = 2, Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible, TokenQR = Guid.NewGuid().ToString() };
        _context.Mesas.AddRange(mesa1, mesa2);

        await _context.SaveChangesAsync();
        return Ok(new { message = "Datos de prueba generados exitosamente." });
    }
}
