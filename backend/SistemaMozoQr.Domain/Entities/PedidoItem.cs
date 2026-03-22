using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class PedidoItem
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid PedidoId { get; set; }
    public Pedido? Pedido { get; set; }
    
    [Required]
    public Guid MenuItemId { get; set; }
    public MenuItem? MenuItem { get; set; }
    
    [Required]
    public int Cantidad { get; set; }
    
    [Required]
    public decimal PrecioUnitario { get; set; } // Precio al momento del pedido
}
