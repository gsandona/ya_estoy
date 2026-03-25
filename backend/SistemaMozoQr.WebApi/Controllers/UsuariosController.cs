using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _usuarioService.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearUsuarioDto dto)
    {
        try
        {
            var user = await _usuarioService.CrearUsuarioAsync(dto);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarUsuarioDto dto)
    {
        try
        {
            var user = await _usuarioService.ActualizarUsuarioAsync(id, dto);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        try
        {
            await _usuarioService.EliminarUsuarioAsync(id);
            return Ok(new { message = "Usuario eliminado correctamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkSync([FromBody] List<BulkUsuarioDto> dtos)
    {
        var usuariosRequeridos = dtos.Select(d => new SistemaMozoQr.Domain.Entities.Usuario
        {
            Id = d.Id,
            Email = d.Email,
            PasswordHash = !string.IsNullOrEmpty(d.Password) ? BCrypt.Net.BCrypt.HashPassword(d.Password) : null!,
            Rol = d.Role
        }).ToList();

        // Utilizamos un repositorio directamente. Ya que este endpoint de Sync requiere saltarse unas reglas normales.
        var _usuarioRepository = HttpContext.RequestServices.GetService(typeof(SistemaMozoQr.Domain.Interfaces.IUsuarioRepository)) as SistemaMozoQr.Domain.Interfaces.IUsuarioRepository;
        await _usuarioRepository.BulkSyncAsync(usuariosRequeridos);

        return Ok(dtos);
    }
}
