using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/features")]
[Authorize(Roles = "SuperAdmin")]
public class FeaturesController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public FeaturesController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAllFeatures()
    {
        var allFeatures = new List<object>
        {
            new { Key = "Metricas", Label = "Métricas y Datos", Description = "Acceso a estadísticas de ventas, pedidos y desempeño general." },
            new { Key = "MesasTareas", Label = "Mesas y Tareas", Description = "Monitoreo de llamados de mesas, pedidos pendientes y cuentas en tiempo real." },
            new { Key = "Cocina", Label = "Cocina", Description = "Visualización y preparación de comandas enviadas por los clientes." },
            new { Key = "Ventas", Label = "Ventas", Description = "Historial completo de tickets facturados y reportes contables." },
            new { Key = "MetricasMenu", Label = "Platos Vendidos", Description = "Métricas de platos y bebidas con mayor volumen de salida." },
            new { Key = "ConfigPersonal", Label = "Config. Personal", Description = "Edición del staff, mesas locales y configuración del comercio." },
            new { Key = "Sistema", Label = "Sistema (SaaS)", Description = "Centro de control SaaS de restaurantes, logs y configuración global." }
        };

        return Ok(allFeatures);
    }

    [HttpGet("role/{roleId:int}")]
    public async Task<IActionResult> GetByRole(int roleId)
    {
        var roleFeatures = await _context.RoleFeatures
            .Where(rf => rf.RoleId == roleId && rf.Activo)
            .Select(rf => rf.FeatureKey)
            .ToListAsync();

        return Ok(roleFeatures);
    }

    [HttpPost("role/{roleId:int}")]
    public async Task<IActionResult> UpdateRoleFeatures(int roleId, [FromBody] List<string> featureKeys)
    {
        // Verificar que el rol existe
        var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleId);
        if (!roleExists)
            return BadRequest(new { message = "Rol no encontrado." });

        // Eliminar las mapeadas existentes para este rol
        var existing = await _context.RoleFeatures.Where(rf => rf.RoleId == roleId).ToListAsync();
        _context.RoleFeatures.RemoveRange(existing);

        // Guardar las nuevas mapeadas
        foreach (var key in featureKeys)
        {
            if (string.IsNullOrEmpty(key)) continue;

            _context.RoleFeatures.Add(new RoleFeature
            {
                Id = Guid.NewGuid(),
                RoleId = roleId,
                FeatureKey = key,
                Activo = true
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Funcionalidades de rol actualizadas correctamente." });
    }
}
