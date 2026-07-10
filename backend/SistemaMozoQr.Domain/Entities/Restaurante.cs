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
    public string? ImagenFondoUrl { get; set; }
    public string? ColorPrimario { get; set; } = "#0f5132";
    public string? ColorSecundario { get; set; } = "#198754";
    public string? ColorFondo { get; set; } = "#f4f9f4";

    // Relaciones (Opcional si quieres navegación)
    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<Mesa> Mesas { get; set; } = new List<Mesa>();
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
