using SistemaMozoQr.Domain.Enums;
using SistemaMozoQr.Domain.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class Pedido : IMustHaveTenant
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid MesaId { get; set; }
    public Mesa? Mesa { get; set; }
    
    [Required]
    public EstadoPedido Estado { get; set; } = EstadoPedido.Recibido;
    
    [Required]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    
    [MaxLength(10)]
    public string? CodigoAcceso { get; set; }
    
    public List<PedidoItem> Items { get; set; } = new();

    public Guid RestauranteId { get; set; }
    public Restaurante? Restaurante { get; set; }
}
