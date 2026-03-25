using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class MenuItem
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Categoria { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;
    
    [Required]
    public decimal Precio { get; set; }
    
    [MaxLength(500)]
    public string? Descripcion { get; set; }
    
    public bool Activo { get; set; } = true;
}
