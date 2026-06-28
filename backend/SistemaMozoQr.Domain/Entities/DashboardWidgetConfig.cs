using System.ComponentModel.DataAnnotations;
using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Domain.Entities;

public class DashboardWidgetConfig : IMustHaveTenant
{
    public Guid Id { get; set; }

    [Required]
    public Guid RestauranteId { get; set; }

    [Required]
    [MaxLength(50)]
    public string WidgetKey { get; set; } = string.Empty;

    public int Orden { get; set; }

    public bool Activo { get; set; }
}
