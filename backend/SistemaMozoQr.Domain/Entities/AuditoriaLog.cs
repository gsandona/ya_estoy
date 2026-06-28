using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Domain.Entities;

public class AuditoriaLog : IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? UsuarioUsername { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public string EntidadId { get; set; } = string.Empty;
    public string Detalles { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;

    public Guid RestauranteId { get; set; }
    public Restaurante? Restaurante { get; set; }
}
