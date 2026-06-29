using SistemaMozoQr.Domain.Interfaces;
using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class UserPushSubscription : IMustHaveTenant
{
    public Guid Id { get; set; }

    [Required]
    public Guid UsuarioId { get; set; }

    [Required]
    public string Endpoint { get; set; } = string.Empty;

    [Required]
    public string P256dh { get; set; } = string.Empty;

    [Required]
    public string Auth { get; set; } = string.Empty;

    [Required]
    public Guid RestauranteId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Propiedades de navegación
    public Usuario? Usuario { get; set; }
}
