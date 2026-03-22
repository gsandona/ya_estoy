using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Application.Interfaces;

public interface IPedidoService
{
    Task<Pedido> CrearPedidoAsync(CrearPedidoDto pedidoDto);
}
