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
    private readonly ITaskRepository _taskRepository;

    public MesasConfigController(IMesaRepository mesaRepository, IUsuarioRepository usuarioRepository, ITaskRepository taskRepository)
    {
        _mesaRepository = mesaRepository;
        _usuarioRepository = usuarioRepository;
        _taskRepository = taskRepository;
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

    [HttpPost("{id:guid}/abrir")]
    [Authorize(Roles = "Admin,Mozo")]
    public async Task<IActionResult> Abrir(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        mesa.Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Ocupada;
        // Generar PIN de 4 dígitos aleatorio
        var random = new Random();
        mesa.CodigoAcceso = random.Next(1000, 9999).ToString();
        
        await _mesaRepository.UpdateAsync(mesa);
        return Ok(new { mesa.Id, mesa.Numero, mesa.Estado, mesa.CodigoAcceso });
    }

    [HttpPost("{id:guid}/cerrar")]
    [Authorize(Roles = "Admin,Mozo")]
    public async Task<IActionResult> Cerrar(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        mesa.Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible;
        mesa.CodigoAcceso = null; // Se invalida el PIN
        
        await _mesaRepository.UpdateAsync(mesa);
        return Ok(new { mesa.Id, mesa.Numero, mesa.Estado, mesa.CodigoAcceso });
    }

    [HttpGet("verify")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyMesa([FromQuery] string mesaId, [FromQuery] string? pin)
    {
        if (string.IsNullOrWhiteSpace(mesaId))
            return BadRequest("Parámetros incompletos.");

        var mesas = await _mesaRepository.GetAllAsync();
        
        Mesa? mesa = null;
        if (int.TryParse(mesaId, out int parsedNum))
        {
            mesa = mesas.FirstOrDefault(m => m.Numero == parsedNum);
        }
        else if (Guid.TryParse(mesaId, out Guid parsedId))
        {
            mesa = mesas.FirstOrDefault(m => m.Id == parsedId);
        }

        if (mesa == null) 
            return NotFound("La mesa solicitada no existe.");

        // Validar que la mesa esté activa (PIN configurado)
        if (string.IsNullOrEmpty(mesa.CodigoAcceso) || mesa.Estado == SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible)
            return BadRequest(new { message = "La mesa se encuentra inactiva. Solicite al mozo que la habilite.", code = "INACTIVA" });

        // Si no envía PIN, retornamos 401 para que el front pida el PIN
        if (string.IsNullOrEmpty(pin))
        {
            return Unauthorized(new { message = "Se requiere el PIN de la mesa.", mesaId = mesa.Id, numero = mesa.Numero });
        }

        if (mesa.CodigoAcceso != pin)
        {
            return BadRequest(new { message = "PIN incorrecto.", code = "PIN_INVALIDO" });
        }

        var pendingTasks = await _taskRepository.GetPendingTasksAsync();
        var mesaTasks = pendingTasks.Where(t => t.TableId == mesa.Numero).ToList();
        var hasLlamado = mesaTasks.Any(t => t.Type == "Llamado");
        var hasCuenta = mesaTasks.Any(t => t.Type == "Cuenta");

        return Ok(new { 
            mesaId = mesa.Id, 
            numero = mesa.Numero, 
            estado = mesa.Estado, 
            validado = true,
            hasLlamado,
            hasCuenta
        });
    }
}
