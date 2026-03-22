using SistemaMozoQr.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class Mesa
{
    public Guid Id { get; set; }
    
    [Required]
    public int Numero { get; set; }
    
    [Required]
    public EstadoMesa Estado { get; set; } = EstadoMesa.Disponible;
    
    public string? TokenQR { get; set; } // Opcional, puede generarse por sesión
}
