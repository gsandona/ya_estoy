using SistemaMozoQr.Domain.Interfaces;
using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class Valoracion : IMustHaveTenant
{
    public Guid Id { get; set; }
    
    public Guid RestauranteId { get; set; }
    public Restaurante? Restaurante { get; set; }

    public Guid? MesaId { get; set; }
    public Mesa? Mesa { get; set; }

    public Guid? MozoId { get; set; }
    public Usuario? Mozo { get; set; }

    public int PuntajeGeneral { get; set; } // 1 to 5
    public int PuntajeComida { get; set; } // 1 to 5
    public int PuntajeMozo { get; set; } // 1 to 5
    public int PuntajeServicio { get; set; } // 1 to 5

    [MaxLength(500)]
    public string? Comentario { get; set; }

    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
}
