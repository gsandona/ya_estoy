using System.ComponentModel.DataAnnotations;
using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Domain.Entities;

public class MenuItem : IMustHaveTenant
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

    public Guid? MenuCategoryId { get; set; }
    public MenuCategory? MenuCategory { get; set; }

    public Guid RestauranteId { get; set; }
    public Restaurante? Restaurante { get; set; }
}
