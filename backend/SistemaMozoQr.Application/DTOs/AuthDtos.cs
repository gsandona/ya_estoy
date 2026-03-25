using SistemaMozoQr.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Application.DTOs;

public class LoginDto
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}

public class CrearUsuarioDto
{
    public Guid? Id { get; set; }
    public string? NombreCompleto { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    [Required]
    public Rol Role { get; set; }
}

public class UsuarioDto
{
    public Guid Id { get; set; }
    public string? NombreCompleto { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class EditarUsuarioDto
{
    public Guid? Id { get; set; }
    public string? NombreCompleto { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; } // Opcional al editar
    [Required]
    public Rol Role { get; set; }
}

public class BulkUsuarioDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public Rol Role { get; set; }
}
