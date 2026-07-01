using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;
using SistemaMozoQr.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/menu-categories")]
public class MenuCategoriesController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public MenuCategoriesController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var allCats = await _context.MenuCategories.ToListAsync();
        
        var rootDtos = allCats
            .Where(c => c.ParentCategoryId == null)
            .Select(c => MapToDto(c, allCats))
            .ToList();

        return Ok(rootDtos);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Crear([FromBody] CrearMenuCategoryDto dto)
    {
        if (dto.ParentCategoryId.HasValue)
        {
            var parentExists = await _context.MenuCategories.AnyAsync(c => c.Id == dto.ParentCategoryId.Value);
            if (!parentExists) return BadRequest("La categoría padre no existe.");
        }

        var category = new MenuCategory
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre,
            Emoji = dto.Emoji,
            ParentCategoryId = dto.ParentCategoryId
        };

        _context.MenuCategories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarMenuCategoryDto dto)
    {
        var category = await _context.MenuCategories.FindAsync(id);
        if (category == null) return NotFound();

        if (dto.ParentCategoryId.HasValue)
        {
            if (dto.ParentCategoryId.Value == id) return BadRequest("Una categoría no puede ser su propio padre.");
            var parentExists = await _context.MenuCategories.AnyAsync(c => c.Id == dto.ParentCategoryId.Value);
            if (!parentExists) return BadRequest("La categoría padre no existe.");
        }

        category.Nombre = dto.Nombre;
        category.Emoji = dto.Emoji;
        category.ParentCategoryId = dto.ParentCategoryId;

        _context.MenuCategories.Update(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var category = await _context.MenuCategories.FindAsync(id);
        if (category == null) return NotFound();

        var categoryIds = new List<Guid> { id };
        var subCats = await _context.MenuCategories.Where(c => c.ParentCategoryId == id).Select(c => c.Id).ToListAsync();
        categoryIds.AddRange(subCats);

        var hasAssociatedItems = await _context.MenuItems.IgnoreQueryFilters().AnyAsync(m => m.MenuCategoryId.HasValue && categoryIds.Contains(m.MenuCategoryId.Value));
        if (hasAssociatedItems)
        {
            return BadRequest("No se puede eliminar la categoría porque tiene productos asociados.");
        }

        var subcategories = await _context.MenuCategories.Where(c => c.ParentCategoryId == id).ToListAsync();
        if (subcategories.Any())
        {
            _context.MenuCategories.RemoveRange(subcategories);
        }

        _context.MenuCategories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static MenuCategoryDto MapToDto(MenuCategory cat, List<MenuCategory> allCats)
    {
        var dto = new MenuCategoryDto
        {
            Id = cat.Id,
            Nombre = cat.Nombre,
            Emoji = cat.Emoji,
            ParentCategoryId = cat.ParentCategoryId
        };

        dto.SubCategories = allCats
            .Where(c => c.ParentCategoryId == cat.Id)
            .Select(c => MapToDto(c, allCats))
            .ToList();

        return dto;
    }
}
