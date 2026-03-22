using SistemaMozoQr.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class Pedido
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid MesaId { get; set; }
    public Mesa? Mesa { get; set; }
    
    [Required]
    public EstadoPedido Estado { get; set; } = EstadoPedido.Recibido;
    
    [Required]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    
    public List<PedidoItem> Items { get; set; } = new();
}
