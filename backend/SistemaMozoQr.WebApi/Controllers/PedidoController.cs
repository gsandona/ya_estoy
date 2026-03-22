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
            // Evitar ciclos de referencia en la respuesta si no se maneja DTO correctamente
            return Ok(new { pedido.Id, pedido.Estado, pedido.Fecha, ItemsCount = pedido.Items.Count });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
