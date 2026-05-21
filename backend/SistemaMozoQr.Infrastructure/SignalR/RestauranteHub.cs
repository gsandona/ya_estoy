using Microsoft.AspNetCore.SignalR;
using SistemaMozoQr.Application.Interfaces;

using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Infrastructure.SignalR;

using System.Collections.Concurrent;

public class RestauranteHub : Hub<IRestauranteHubClient>
{
    private readonly IMesaRepository _mesaRepository;
    private readonly ITaskRepository _taskRepository;
    private static readonly ConcurrentDictionary<int, DateTime> _lastCalls = new();

    public RestauranteHub(IMesaRepository mesaRepository, ITaskRepository taskRepository)
    {
        _mesaRepository = mesaRepository;
        _taskRepository = taskRepository;
    }

    private async Task<(IRestauranteHubClient Clients, string? AssignedMozoId)> GetClientsForTable(int tableId)
    {
        var mesas = await _mesaRepository.GetAllAsync();
        var mesa = mesas.FirstOrDefault(m => m.Numero == tableId);
        
        var grupos = new List<string> { "Admin" };
        string? assignedMozoId = null;
        if (mesa != null && mesa.MozoId.HasValue)
        {
            assignedMozoId = mesa.MozoId.Value.ToString();
            grupos.Add($"Mozo_{assignedMozoId}");
        }
        return (Clients.Groups(grupos), assignedMozoId);
    }

    private bool IsSpamming(int tableId)
    {
        var now = DateTime.UtcNow;
        if (_lastCalls.TryGetValue(tableId, out var lastCall))
        {
            if ((now - lastCall).TotalSeconds < 15) return true; // Bloquear si fue hace menos de 15 segundos
        }
        _lastCalls[tableId] = now;
        return false;
    }

    private async Task<bool> IsMesaActive(int tableId)
    {
        var mesas = await _mesaRepository.GetAllAsync();
        var mesa = mesas.FirstOrDefault(m => m.Numero == tableId);
        return mesa != null && mesa.Estado == SistemaMozoQr.Domain.Enums.EstadoMesa.Ocupada && !string.IsNullOrEmpty(mesa.CodigoAcceso);
    }

    public async Task LlamarMozo(int tableId)
    {
        if (IsSpamming(tableId) || !await IsMesaActive(tableId)) return;
        var (clients, assignedMozoId) = await GetClientsForTable(tableId);
        var taskId = Guid.NewGuid();
        await _taskRepository.AddAsync(new SistemaMozoQr.Domain.Entities.MesaTask { Id = taskId, TableId = tableId, Type = "Llamado", AssignedMozoId = assignedMozoId });
        await clients.NotificarLlamadoMozo(taskId, tableId);
    }

    public async Task PedirCuenta(int tableId)
    {
        if (IsSpamming(tableId) || !await IsMesaActive(tableId)) return;
        var (clients, assignedMozoId) = await GetClientsForTable(tableId);
        var taskId = Guid.NewGuid();
        await _taskRepository.AddAsync(new SistemaMozoQr.Domain.Entities.MesaTask { Id = taskId, TableId = tableId, Type = "Cuenta", AssignedMozoId = assignedMozoId });
        await clients.NotificarPidiendoCuenta(taskId, tableId);
    }

    public async Task NuevoPedido(int tableId, string details)
    {
        if (IsSpamming(tableId) || !await IsMesaActive(tableId)) return;
        var (clients, assignedMozoId) = await GetClientsForTable(tableId);
        var taskId = Guid.NewGuid();
        await _taskRepository.AddAsync(new SistemaMozoQr.Domain.Entities.MesaTask { Id = taskId, TableId = tableId, Type = "Pedido", Details = details, AssignedMozoId = assignedMozoId });
        await clients.NotificarNuevoPedido(Guid.NewGuid(), taskId, tableId, details);
    }

    public async Task ReasignarTarea(string taskId, string newMozoId)
    {
        if (Guid.TryParse(taskId, out Guid parsedTaskId))
        {
            var task = await _taskRepository.GetByIdAsync(parsedTaskId);
            if (task != null)
            {
                task.AssignedMozoId = newMozoId;
                await _taskRepository.UpdateAsync(task);
            }
        }
        // Broadcast to everyone to update their local UI task assignment
        await Clients.All.TareaReasignada(taskId, newMozoId);
    }

    public async Task CompletarTarea(string taskId)
    {
        if (Guid.TryParse(taskId, out Guid parsedTaskId))
        {
            var task = await _taskRepository.GetByIdAsync(parsedTaskId);
            if (task != null)
            {
                task.Status = "Completed";
                await _taskRepository.UpdateAsync(task);
            }
        }
        await Clients.All.TareaCompletada(taskId);
    }

    public async Task JoinGroup(string role, string? userId)
    {
        if (role == "Admin")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admin");
        }
        else if (role == "Mozo" && !string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Mozo_{userId}");
        }
    }

    public override Task OnConnectedAsync()
    {
        return base.OnConnectedAsync();
    }
}
