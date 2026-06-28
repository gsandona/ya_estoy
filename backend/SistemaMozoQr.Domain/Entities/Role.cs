using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class Role
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Descripcion { get; set; }
}
