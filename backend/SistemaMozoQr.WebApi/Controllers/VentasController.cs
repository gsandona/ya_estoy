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
[Authorize(Roles = "Admin,SuperAdmin,Caja")]
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
        
        if ((userRole == "Admin" || userRole == "Caja") && Guid.TryParse(tenantIdClaim, out Guid adminTenantId))
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

    [HttpGet("productos")]
    public async Task<IActionResult> GetProductSales(
        [FromQuery] Guid? restauranteId = null,
        [FromQuery] string? startUtc = null,
        [FromQuery] string? endUtc = null)
    {
        DateTime targetStart = DateTime.UtcNow.Date;
        DateTime targetEnd = targetStart.AddDays(1);

        if (!string.IsNullOrWhiteSpace(startUtc) && DateTime.TryParse(startUtc, out DateTime parsedStart) &&
            !string.IsNullOrWhiteSpace(endUtc) && DateTime.TryParse(endUtc, out DateTime parsedEnd))
        {
            targetStart = DateTime.SpecifyKind(parsedStart, DateTimeKind.Utc);
            targetEnd = DateTime.SpecifyKind(parsedEnd, DateTimeKind.Utc);
        }
        else
        {
            targetStart = DateTime.SpecifyKind(targetStart, DateTimeKind.Utc);
            targetEnd = DateTime.SpecifyKind(targetEnd, DateTimeKind.Utc);
        }

        var query = _context.Ventas.IgnoreQueryFilters().AsQueryable();

        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var tenantIdClaim = User.FindFirst("RestauranteId")?.Value;
        
        Guid adminTenantId = Guid.Empty;
        if ((userRole == "Admin" || userRole == "Caja") && Guid.TryParse(tenantIdClaim, out adminTenantId))
        {
            query = query.Where(v => v.RestauranteId == adminTenantId);
        }
        else if (restauranteId.HasValue)
        {
            query = query.Where(v => v.RestauranteId == restauranteId.Value);
        }

        query = query.Where(v => v.FechaHora >= targetStart && v.FechaHora < targetEnd);

        // Cargamos las ventas filtradas en memoria para deserializar y agregar de forma agnóstica a la base de datos (evita incompatibilidades Postgres/SQLite)
        var ventas = await query.Select(v => new { v.DetallesJson }).ToListAsync();

        var productSalesDict = new Dictionary<string, (int Cantidad, decimal Recaudacion)>();

        foreach (var venta in ventas)
        {
            if (string.IsNullOrWhiteSpace(venta.DetallesJson))
                continue;

            try
            {
                var items = System.Text.Json.JsonSerializer.Deserialize<List<VentaItemDto>>(venta.DetallesJson);
                if (items == null)
                    continue;

                foreach (var item in items)
                {
                    var nombre = item.Nombre ?? "Producto Desconocido";
                    if (productSalesDict.ContainsKey(nombre))
                    {
                        var current = productSalesDict[nombre];
                        productSalesDict[nombre] = (current.Cantidad + item.Cantidad, current.Recaudacion + (item.Cantidad * item.PrecioUnitario));
                    }
                    else
                    {
                        productSalesDict[nombre] = (item.Cantidad, item.Cantidad * item.PrecioUnitario);
                    }
                }
            }
            catch (System.Text.Json.JsonException)
            {
                // Ignorar JSON malformado
            }
        }

        var result = productSalesDict.Select(kvp => new {
            Producto = kvp.Key,
            Cantidad = kvp.Value.Cantidad,
            Recaudacion = kvp.Value.Recaudacion
        }).OrderByDescending(r => r.Cantidad).ToList();

        return Ok(result);
    }

    public class VentaItemDto
    {
        [System.Text.Json.Serialization.JsonPropertyName("nombre")]
        public string? Nombre { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("cantidad")]
        public int Cantidad { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("precioUnitario")]
        public decimal PrecioUnitario { get; set; }
    }
}
