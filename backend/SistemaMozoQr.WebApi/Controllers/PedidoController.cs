using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Application.DTOs;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidoController : ControllerBase
{
    private readonly IPedidoService _pedidoService;

    public PedidoController(IPedidoService pedidoService)
    {
        _pedidoService = pedidoService;
    }

    [HttpPost]
    public async Task<IActionResult> CrearPedido([FromBody] CrearPedidoDto pedidoDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var pedido = await _pedidoService.CrearPedidoAsync(pedidoDto);
            return Ok(new { 
                pedidoId = pedido.Id, 
                taskId = pedido.Id, // El taskId es idéntico al pedidoId
                pedido.Estado, 
                pedido.Fecha, 
                ItemsCount = pedido.Items.Count 
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("activas")]
    [Authorize(Roles = "Admin,SuperAdmin,Cocina,Mozo")]
    public async Task<IActionResult> GetActivas()
    {
        try
        {
            var pedidos = await _pedidoService.GetActiveOrdersAsync();
            return Ok(pedidos.Select(p => new
            {
                id = p.Id,
                mesaId = p.MesaId,
                numeroMesa = p.Mesa?.Numero ?? 0,
                mozoEmail = p.Mesa?.Mozo?.Username ?? "Sin mozo",
                estado = p.Estado,
                fecha = p.Fecha,
                items = p.Items.Select(i => new
                {
                    nombre = i.MenuItem?.Nombre ?? "Item",
                    cantidad = i.Cantidad
                })
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/aprobar")]
    [Authorize(Roles = "Admin,SuperAdmin,Mozo")]
    public async Task<IActionResult> Aprobar(Guid id)
    {
        try
        {
            await _pedidoService.AprobarPedidoAsync(id);
            return Ok(new { Message = "Pedido aprobado con éxito y enviado a cocina." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/estado")]
    [Authorize(Roles = "Admin,SuperAdmin,Cocina,Mozo")]
    public async Task<IActionResult> ActualizarEstado(Guid id, [FromBody] UpdateEstadoPedidoDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _pedidoService.ActualizarEstadoPedidoAsync(id, dto.Estado);
            return Ok(new { Message = "Estado de pedido actualizado.", Estado = dto.Estado });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class UpdateEstadoPedidoDto
{
    public SistemaMozoQr.Domain.Enums.EstadoPedido Estado { get; set; }
}
