using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Application.DTOs;

public class CrearPedidoDto
{
    [Required]
    public Guid MesaId { get; set; }
    
    [Required]
    [MinLength(1, ErrorMessage = "El pedido debe contener al menos un item.")]
    public List<PedidoItemDto> Items { get; set; } = new();
}

public class PedidoItemDto
{
    [Required]
    public Guid MenuItemId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0.")]
    public int Cantidad { get; set; }
}
