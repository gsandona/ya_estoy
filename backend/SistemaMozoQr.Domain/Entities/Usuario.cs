using SistemaMozoQr.Domain.Enums;
using SistemaMozoQr.Domain.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class Usuario : IMustHaveTenant
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string NombreCompleto { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public Rol Rol { get; set; } = Rol.Mozo;

    public Guid RestauranteId { get; set; }
}
