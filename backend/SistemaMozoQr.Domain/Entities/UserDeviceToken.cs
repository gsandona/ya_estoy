using SistemaMozoQr.Domain.Interfaces;
using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class UserDeviceToken : IMustHaveTenant
{
    public Guid Id { get; set; }

    [Required]
    public Guid UsuarioId { get; set; }

    [Required]
    public string Token { get; set; } = string.Empty;

    public string DeviceType { get; set; } = string.Empty; // "android", "ios", etc.

    [Required]
    public Guid RestauranteId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Usuario? Usuario { get; set; }
}
