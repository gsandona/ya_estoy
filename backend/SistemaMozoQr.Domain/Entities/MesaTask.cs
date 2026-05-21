namespace SistemaMozoQr.Domain.Entities;

public class MesaTask
{
    public Guid Id { get; set; }
    public int TableId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Opcional, si la tarea fue reasignada a un mozo específico
    public string? AssignedMozoId { get; set; }
}
