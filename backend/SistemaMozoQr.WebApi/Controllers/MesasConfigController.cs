using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Application.DTOs;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/mesas")]
[Authorize(Roles = "Admin,Mozo")]
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
    [Authorize(Roles = "Admin")]
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
    [Authorize(Roles = "Admin")]
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
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        await _mesaRepository.DeleteAsync(mesa);
        return NoContent();
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin")]
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

    [HttpPost("scan")]
    [AllowAnonymous]
    public async Task<IActionResult> ScanMesa([FromBody] ScanMesaDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest();

        if (!Guid.TryParse(dto.Code, out Guid parsedId))
            return BadRequest("El código QR es inválido.");

        var mesa = await _mesaRepository.GetByIdAsync(parsedId);

        if (mesa == null) return NotFound("La mesa no existe o fue eliminada.");

        return Ok(new ScanResponseDto
        {
            MesaId = mesa.Id,
            Numero = mesa.Numero
        });
    }
}
