using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class SettingsController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public SettingsController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _context.SystemSettings.ToListAsync();
        return Ok(settings);
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicSettings()
    {
        var settings = await _context.SystemSettings
            .Where(s => s.Key == "GlobalAppName" || s.Key == "GlobalLogoBase64")
            .ToListAsync();
        return Ok(settings);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateSetting([FromBody] SystemSetting settingUpdate)
    {
        var setting = await _context.SystemSettings.FindAsync(settingUpdate.Key);
        if (setting == null)
        {
            _context.SystemSettings.Add(settingUpdate);
        }
        else
        {
            setting.Value = settingUpdate.Value;
            _context.SystemSettings.Update(setting);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Setting updated successfully" });
    }
}
