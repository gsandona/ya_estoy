using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly SistemaMozoQr.Domain.Interfaces.IUsuarioRepository _usuarioRepository;

    public UsuariosController(IUsuarioService usuarioService, SistemaMozoQr.Domain.Interfaces.IUsuarioRepository usuarioRepository)
    {
        _usuarioService = usuarioService;
        _usuarioRepository = usuarioRepository;
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

    [HttpGet("mozos")]
    [Authorize(Roles = "Admin,SuperAdmin,MozoPortal")]
    public async Task<IActionResult> GetRestauranteMozos()
    {
        var users = await _usuarioService.GetAllAsync();
        var mozos = users.Where(u => u.Role == "Mozo").ToList();
        return Ok(mozos);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkSync([FromBody] List<BulkUsuarioDto> dtos)
    {
        var usuariosRequeridos = dtos.Select(d => new SistemaMozoQr.Domain.Entities.Usuario
        {
            Id = d.Id,
            Username = d.Username,
            PasswordHash = !string.IsNullOrEmpty(d.Password) ? BCrypt.Net.BCrypt.HashPassword(d.Password) : null!,
            Rol = d.Role
        }).ToList();

        // Utilizamos un repositorio directamente. Ya que este endpoint de Sync requiere saltarse unas reglas normales.
        await _usuarioRepository.BulkSyncAsync(usuariosRequeridos);

        return Ok(dtos);
    }
}
