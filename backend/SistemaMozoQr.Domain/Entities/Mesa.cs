using SistemaMozoQr.Domain.Enums;
using SistemaMozoQr.Domain.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class Mesa : IMustHaveTenant
{
    public Guid Id { get; set; }
    
    [Required]
    public int Numero { get; set; }
    
    [Required]
    public EstadoMesa Estado { get; set; } = EstadoMesa.Disponible;
    
    public string? TokenQR { get; set; } // Opcional, puede generarse por sesión
    
    [MaxLength(250)]
    public string? Ubicacion { get; set; }
    
    public Guid? MozoId { get; set; }
    public Usuario? Mozo { get; set; }

    [MaxLength(10)]
    public string? CodigoAcceso { get; set; } // PIN de acceso generado cuando se abre la mesa

    public Guid RestauranteId { get; set; }
    public Restaurante? Restaurante { get; set; }
}
