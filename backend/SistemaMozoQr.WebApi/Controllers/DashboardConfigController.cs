using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardConfigController : ControllerBase
{
    private readonly RestauranteDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DashboardConfigController(RestauranteDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    private readonly List<string> DefaultWidgets = new()
    {
        "KPI_Ventas", "KPI_Pedidos", "KPI_Llamados", "KPI_Alertas", "StaffPerformance", "TopTables", "PeakHours"
    };

    [HttpGet("mine")]
    public async Task<IActionResult> GetMyDashboardConfig()
    {
        var tenantId = _currentUserService.GetRestauranteId();
        if (tenantId == null || tenantId == Guid.Empty)
        {
            if (_currentUserService.IsSuperAdmin())
            {
                return Ok(GetDefaultConfig(Guid.Empty));
            }
            return BadRequest(new { message = "No se pudo identificar el restaurante del usuario activo." });
        }

        var configs = await _context.DashboardWidgetConfigs
            .IgnoreQueryFilters() // En caso de que se necesite consultar todo
            .Where(w => w.RestauranteId == tenantId.Value)
            .OrderBy(w => w.Orden)
            .ToListAsync();

        if (!configs.Any())
        {
            configs = GetDefaultConfig(tenantId.Value);
        }

        return Ok(configs);
    }

    [HttpGet("{restauranteId:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetDashboardConfigByRestaurante(Guid restauranteId)
    {
        var configs = await _context.DashboardWidgetConfigs
            .IgnoreQueryFilters()
            .Where(w => w.RestauranteId == restauranteId)
            .OrderBy(w => w.Orden)
            .ToListAsync();

        if (!configs.Any())
        {
            configs = GetDefaultConfig(restauranteId);
        }

        return Ok(configs);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> SaveDashboardConfig([FromBody] List<DashboardWidgetConfig> incomingConfigs)
    {
        if (incomingConfigs == null || !incomingConfigs.Any())
        {
            return BadRequest(new { message = "La lista de configuraciones no puede estar vacía." });
        }

        var restauranteId = incomingConfigs.First().RestauranteId;

        // Limpiar configuración anterior
        var existing = await _context.DashboardWidgetConfigs
            .IgnoreQueryFilters()
            .Where(w => w.RestauranteId == restauranteId)
            .ToListAsync();

        if (existing.Any())
        {
            _context.DashboardWidgetConfigs.RemoveRange(existing);
        }

        // Agregar nuevas configuraciones
        foreach (var config in incomingConfigs)
        {
            config.Id = config.Id == Guid.Empty ? Guid.NewGuid() : config.Id;
            config.RestauranteId = restauranteId;
            _context.DashboardWidgetConfigs.Add(config);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Configuración del dashboard guardada correctamente." });
    }

    private List<DashboardWidgetConfig> GetDefaultConfig(Guid restauranteId)
    {
        return DefaultWidgets.Select((widgetKey, index) => new DashboardWidgetConfig
        {
            Id = Guid.NewGuid(),
            RestauranteId = restauranteId,
            WidgetKey = widgetKey,
            Orden = index + 1,
            Activo = true
        }).ToList();
    }
}
