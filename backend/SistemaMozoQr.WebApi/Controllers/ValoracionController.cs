using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/valoraciones")]
public class ValoracionController : ControllerBase
{
    private readonly RestauranteDbContext _context;

    public ValoracionController(RestauranteDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearValoracionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Validar la sesión de la mesa usando su PIN
        var mesa = await _context.Mesas.IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.Id == dto.MesaId);
            
        if (mesa == null) 
            return BadRequest(new { message = "Mesa no encontrada." });
            
        if (mesa.CodigoAcceso != dto.CodigoAcceso)
            return BadRequest(new { message = "Código de acceso PIN inválido para calificar." });

        var valoracion = new Valoracion
        {
            Id = Guid.NewGuid(),
            RestauranteId = mesa.RestauranteId,
            MesaId = mesa.Id,
            MozoId = mesa.MozoId, // Se auto-asigna el mozo que atendía la mesa
            PuntajeGeneral = dto.PuntajeGeneral,
            PuntajeComida = dto.PuntajeComida,
            PuntajeMozo = dto.PuntajeMozo,
            PuntajeServicio = dto.PuntajeServicio,
            Comentario = dto.Comentario,
            FechaHora = DateTime.UtcNow
        };

        _context.Valoraciones.Add(valoracion);
        await _context.SaveChangesAsync();

        return Ok(new { message = "¡Muchas gracias por tus comentarios!" });
    }

    [HttpGet]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetList()
    {
        var list = await _context.Valoraciones
            .Include(v => v.Mesa)
            .Include(v => v.Mozo)
            .OrderByDescending(v => v.FechaHora)
            .ToListAsync();
            
        return Ok(list.Select(v => new {
            id = v.Id,
            mesaNumero = v.Mesa?.Numero,
            mozoNombre = v.Mozo?.NombreCompleto ?? v.Mozo?.Username,
            puntajeGeneral = v.PuntajeGeneral,
            puntajeComida = v.PuntajeComida,
            puntajeMozo = v.PuntajeMozo,
            puntajeServicio = v.PuntajeServicio,
            comentario = v.Comentario,
            fechaHora = v.FechaHora
        }));
    }
}

public class CrearValoracionDto
{
    [Required]
    public Guid MesaId { get; set; }
    
    [Required]
    public string CodigoAcceso { get; set; } = string.Empty;
    
    [Range(1, 5)]
    public int PuntajeGeneral { get; set; }
    
    [Range(1, 5)]
    public int PuntajeComida { get; set; }
    
    [Range(1, 5)]
    public int PuntajeMozo { get; set; }
    
    [Range(1, 5)]
    public int PuntajeServicio { get; set; }
    
    public string? Comentario { get; set; }
}
