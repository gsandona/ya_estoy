namespace SistemaMozoQr.Domain.Entities;

public class ErrorLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Mensaje { get; set; } = string.Empty;
    public string StackTrace { get; set; } = string.Empty;
    public string RutaAPI { get; set; } = string.Empty;
    public string? UsuarioInvolucrado { get; set; }
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
}
