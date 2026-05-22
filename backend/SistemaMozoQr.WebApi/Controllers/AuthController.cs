using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var response = await _authService.LoginAsync(loginDto);
            if (response == null)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, stack = ex.StackTrace, inner = ex.InnerException?.Message });
        }
    }
}
