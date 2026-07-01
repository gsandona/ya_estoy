using SistemaMozoQr.Domain.Interfaces;
using System;

namespace SistemaMozoQr.Domain.Entities;

public class Venta : IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid RestauranteId { get; set; }
    public Restaurante? Restaurante { get; set; }
    
    public int MesaNumero { get; set; }
    
    public string CodigoAcceso { get; set; } = string.Empty;
    
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
    
    public decimal Total { get; set; }
    
    public string DetallesJson { get; set; } = string.Empty;
    
    public string? MozoNombre { get; set; }
}
