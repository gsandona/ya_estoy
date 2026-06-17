using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TareasController : ControllerBase
{
    private readonly ITaskRepository _taskRepository;
    private readonly IPedidoRepository _pedidoRepository;

    public TareasController(ITaskRepository taskRepository, IPedidoRepository pedidoRepository)
    {
        _taskRepository = taskRepository;
        _pedidoRepository = pedidoRepository;
    }

    [HttpGet("pendientes")]
    public async Task<IActionResult> GetPendientes()
    {
        var tasks = await _taskRepository.GetPendingTasksAsync();
        var result = new System.Collections.Generic.List<object>();

        foreach (var t in tasks)
        {
            string? pedidoEstado = null;
            if (t.Type == "Pedido")
            {
                var order = await _pedidoRepository.GetByIdAsync(t.Id);
                if (order != null)
                {
                    pedidoEstado = order.Estado.ToString();
                }
            }

            result.Add(new {
                id = t.Id,
                tableId = t.TableId,
                type = t.Type,
                details = t.Details,
                status = t.Status,
                timestamp = t.CreatedAt,
                assignedMozoId = t.AssignedMozoId,
                pedidoEstado = pedidoEstado
            });
        }

        return Ok(result);
    }

    [HttpGet("estadisticas")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetEstadisticas()
    {
        var stats = await _taskRepository.GetAnalyticsStatsAsync();
        return Ok(stats);
    }
}
