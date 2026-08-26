using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/menu")]
[Authorize(Roles = "Admin,SuperAdmin,Caja")]
public class MenuController : ControllerBase
{
    private readonly IMenuItemRepository _menuRepository;
    private readonly ICurrentUserService _currentUserService;

    public MenuController(IMenuItemRepository menuRepository, ICurrentUserService currentUserService)
    {
        _menuRepository = menuRepository;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [AllowAnonymous] // Permitimos a todos ver el menú
    public async Task<IActionResult> GetMenu([FromQuery] Guid? restauranteId = null)
    {
        IEnumerable<MenuItem> items;
        if (restauranteId.HasValue)
        {
            items = await _menuRepository.GetAllActivosPorRestauranteAsync(restauranteId.Value);
        }
        else
        {
            items = await _menuRepository.GetAllActivosAsync();
        }
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMenuItem(Guid id)
    {
        var item = await _menuRepository.GetByIdAsync(id);
        if (item == null) return NotFound();

        if (!_currentUserService.IsSuperAdmin() && item.RestauranteId != _currentUserService.GetRestauranteId())
        {
            return Forbid();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearMenuItemDto dto)
    {
        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            Categoria = dto.Categoria,
            Nombre = dto.Nombre,
            Precio = dto.Precio,
            Descripcion = dto.Descripcion,
            Activo = dto.Activo,
            MenuCategoryId = dto.MenuCategoryId
        };

        var result = await _menuRepository.AddAsync(item);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarMenuItemDto dto)
    {
        var item = await _menuRepository.GetByIdAsync(id);
        if (item == null) return NotFound();

        if (!_currentUserService.IsSuperAdmin() && item.RestauranteId != _currentUserService.GetRestauranteId())
        {
            return Forbid();
        }

        item.Categoria = dto.Categoria;
        item.Nombre = dto.Nombre;
        item.Precio = dto.Precio;
        item.Descripcion = dto.Descripcion;
        item.Activo = dto.Activo;
        item.MenuCategoryId = dto.MenuCategoryId;

        await _menuRepository.UpdateAsync(item);
        return Ok(item);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var item = await _menuRepository.GetByIdAsync(id);
        if (item == null) return NotFound();

        if (!_currentUserService.IsSuperAdmin() && item.RestauranteId != _currentUserService.GetRestauranteId())
        {
            return Forbid();
        }

        await _menuRepository.DeleteAsync(item);
        return NoContent();
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkSync([FromBody] List<BulkMenuItemDto> dtos)
    {
        var items = dtos.Select(dto => new MenuItem
        {
            Id = dto.Id ?? Guid.NewGuid(),
            Categoria = dto.Categoria,
            Nombre = dto.Nombre,
            Precio = dto.Precio,
            Descripcion = dto.Descripcion,
            Activo = dto.Activo,
            MenuCategoryId = dto.MenuCategoryId
        }).ToList();

        await _menuRepository.BulkSyncAsync(items);
        return Ok(items);
    }
}
