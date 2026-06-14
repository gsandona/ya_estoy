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

    public TareasController(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    [HttpGet("pendientes")]
    public async Task<IActionResult> GetPendientes()
    {
        var tasks = await _taskRepository.GetPendingTasksAsync();
        return Ok(tasks.Select(t => new {
            id = t.Id,
            tableId = t.TableId,
            type = t.Type,
            details = t.Details,
            status = t.Status,
            timestamp = t.CreatedAt,
            assignedMozoId = t.AssignedMozoId
        }));
    }

    [HttpGet("estadisticas")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetEstadisticas()
    {
        var stats = await _taskRepository.GetAnalyticsStatsAsync();
        return Ok(stats);
    }
}
