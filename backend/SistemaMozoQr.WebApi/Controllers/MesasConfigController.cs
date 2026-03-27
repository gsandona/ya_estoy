using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Application.DTOs;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/mesas")]
[Authorize(Roles = "Admin")]
public class MesasConfigController : ControllerBase
{
    private readonly IMesaRepository _mesaRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public MesasConfigController(IMesaRepository mesaRepository, IUsuarioRepository usuarioRepository)
    {
        _mesaRepository = mesaRepository;
        _usuarioRepository = usuarioRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var mesas = await _mesaRepository.GetAllAsync();
        return Ok(mesas);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();
        return Ok(mesa);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearMesaDto dto)
    {
        var mesa = new Mesa
        {
            Id = dto.Id ?? Guid.NewGuid(),
            Numero = dto.Numero,
            Ubicacion = dto.Ubicacion,
            MozoId = dto.MozoId,
            TokenQR = dto.TokenQR,
            Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible
        };
        await _mesaRepository.AddAsync(mesa);
        return Ok(mesa);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarMesaDto dto)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        mesa.Numero = dto.Numero;
        mesa.Ubicacion = dto.Ubicacion;
        mesa.MozoId = dto.MozoId;
        mesa.TokenQR = dto.TokenQR;

        await _mesaRepository.UpdateAsync(mesa);
        return Ok(mesa);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        await _mesaRepository.DeleteAsync(mesa);
        return NoContent();
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkSync([FromBody] List<BulkMesaDto> dtos)
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        var mesas = new List<Mesa>();

        foreach (var dto in dtos)
        {
             Guid? realMozoId = null;
             if (!string.IsNullOrWhiteSpace(dto.MozoId))
             {
                  if (Guid.TryParse(dto.MozoId, out Guid parsedId)) {
                      realMozoId = parsedId;
                  } else {
                      var user = usuarios.FirstOrDefault(u => u.Email == dto.MozoId);
                      if (user != null) realMozoId = user.Id;
                  }
             }

             mesas.Add(new Mesa
             {
                 Id = dto.Id,
                 Numero = dto.Numero,
                 Ubicacion = dto.Ubicacion,
                 MozoId = realMozoId,
                 Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible
             });
        }
        await _mesaRepository.BulkSyncAsync(mesas);
        return Ok(mesas);
    }

    [HttpGet("verify")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyMesa([FromQuery] string mesaId, [FromQuery] string token)
    {
        if (string.IsNullOrEmpty(mesaId) || string.IsNullOrEmpty(token))
            return BadRequest();

        var mesas = await _mesaRepository.GetAllAsync();
        
        Mesa? mesa = null;
        if (int.TryParse(mesaId, out int parsedNum))
        {
            mesa = mesas.FirstOrDefault(m => m.Numero == parsedNum);
        }

        if (mesa == null) return NotFound();

        if (mesa.Id.ToString().ToLower() != token.ToLower()) 
            return BadRequest();

        return Ok();
    }
}
