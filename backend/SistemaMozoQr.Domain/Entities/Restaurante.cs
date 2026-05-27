namespace SistemaMozoQr.Domain.Entities;

public class Restaurante
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public string? IconoPrincipal { get; set; } = "🏪";
    public string? LogoUrl { get; set; }
    public Guid? ParentRestauranteId { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones (Opcional si quieres navegación)
    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<Mesa> Mesas { get; set; } = new List<Mesa>();
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
