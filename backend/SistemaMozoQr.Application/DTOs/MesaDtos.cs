using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Application.DTOs;

public class CrearMesaDto
{
    public Guid? Id { get; set; }
    [Required]
    public int Numero { get; set; }
    public string? Ubicacion { get; set; }
    public Guid? MozoId { get; set; }
    public string? TokenQR { get; set; }
}

public class EditarMesaDto
{
    [Required]
    public int Numero { get; set; }
    public string? Ubicacion { get; set; }
    public Guid? MozoId { get; set; }
    public string? TokenQR { get; set; }
}

public class BulkMesaDto
{
    public Guid Id { get; set; }
    public int Numero { get; set; }
    public string? Ubicacion { get; set; }
    public string? MozoId { get; set; }
}
