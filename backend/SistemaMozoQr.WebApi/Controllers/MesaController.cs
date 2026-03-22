using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MesaController : ControllerBase
{
    private readonly IMesaService _mesaService;

    public MesaController(IMesaService mesaService)
    {
        _mesaService = mesaService;
    }

    [HttpPost("escanear/{tokenQR}")]
    public async Task<IActionResult> EscanearQr(string tokenQR)
    {
        var mesa = await _mesaService.RegistrarEscaneoQrAsync(tokenQR);
        if (mesa == null)
            return NotFound("Código QR no válido o mesa no encontrada.");

        return Ok(mesa);
    }

    [HttpPost("{mesaId:guid}/llamar-mozo")]
    public async Task<IActionResult> LlamarMozo(Guid mesaId)
    {
        var result = await _mesaService.LlamarMozoAsync(mesaId);
        if (!result)
            return NotFound("Mesa no encontrada.");

        return Ok("Se ha llamado al mozo con éxito.");
    }

    [HttpPost("{mesaId:guid}/pedir-cuenta")]
    public async Task<IActionResult> PedirCuenta(Guid mesaId)
    {
        var result = await _mesaService.PedirCuentaAsync(mesaId);
        if (!result)
            return NotFound("Mesa no encontrada.");

        return Ok("Se ha pedido la cuenta con éxito.");
    }
}
