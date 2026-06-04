using Microsoft.AspNetCore.SignalR;
using SistemaMozoQr.Application.Interfaces;

using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Infrastructure.SignalR;

using System.Collections.Concurrent;

public class RestauranteHub : Hub<IRestauranteHubClient>
{
    private readonly IMesaRepository _mesaRepository;
    private readonly ITaskRepository _taskRepository;
    private static readonly ConcurrentDictionary<Guid, DateTime> _lastCalls = new();

    public RestauranteHub(IMesaRepository mesaRepository, ITaskRepository taskRepository)
    {
        _mesaRepository = mesaRepository;
        _taskRepository = taskRepository;
    }

    private async Task<(IRestauranteHubClient Clients, string? AssignedMozoId, Guid RestauranteId, int Numero)> GetClientsForMesa(Guid mesaId)
    {
        var mesa = await _mesaRepository.GetByIdAsync(mesaId);
        
        var grupos = new List<string> { "Admin" };
        string? assignedMozoId = null;
        Guid restauranteId = Guid.Empty;
        int numero = 0;
        if (mesa != null)
        {
            numero = mesa.Numero;
            restauranteId = mesa.RestauranteId;
            if (mesa.MozoId.HasValue)
            {
                assignedMozoId = mesa.MozoId.Value.ToString();
                grupos.Add($"Mozo_{assignedMozoId}");
            }
        }
        return (Clients.Groups(grupos), assignedMozoId, restauranteId, numero);
    }

    private bool IsSpamming(Guid mesaId)
    {
        var now = DateTime.UtcNow;
        if (_lastCalls.TryGetValue(mesaId, out var lastCall))
        {
            if ((now - lastCall).TotalSeconds < 15) return true; // Bloquear si fue hace menos de 15 segundos
        }
        _lastCalls[mesaId] = now;
        return false;
    }

    private async Task<bool> IsMesaActive(Guid mesaId)
    {
        var mesa = await _mesaRepository.GetByIdAsync(mesaId);
        return mesa != null && mesa.Estado == SistemaMozoQr.Domain.Enums.EstadoMesa.Ocupada && !string.IsNullOrEmpty(mesa.CodigoAcceso);
    }

    private async Task<bool> IsDuplicateAlert(Guid mesaId, string type)
    {
        var mesa = await _mesaRepository.GetByIdAsync(mesaId);
        if (mesa == null) return false;
        var pendingTasks = await _taskRepository.GetPendingTasksIgnoreQueryFiltersAsync();
        return pendingTasks.Any(t => t.TableId == mesa.Numero && t.Type == type && t.RestauranteId == mesa.RestauranteId);
    }

    public async Task LlamarMozo(Guid mesaId)
    {
        if (IsSpamming(mesaId) || !await IsMesaActive(mesaId) || await IsDuplicateAlert(mesaId, "Llamado")) return;
        var (clients, assignedMozoId, restauranteId, tableNumero) = await GetClientsForMesa(mesaId);
        var taskId = Guid.NewGuid();
        await _taskRepository.AddAsync(new SistemaMozoQr.Domain.Entities.MesaTask 
        { 
            Id = taskId, 
            TableId = tableNumero, 
            Type = "Llamado", 
            AssignedMozoId = assignedMozoId,
            RestauranteId = restauranteId
        });
        await clients.NotificarLlamadoMozo(taskId, tableNumero);
    }

    public async Task PedirCuenta(Guid mesaId)
    {
        if (IsSpamming(mesaId) || !await IsMesaActive(mesaId) || await IsDuplicateAlert(mesaId, "Cuenta")) return;
        var (clients, assignedMozoId, restauranteId, tableNumero) = await GetClientsForMesa(mesaId);
        var taskId = Guid.NewGuid();
        await _taskRepository.AddAsync(new SistemaMozoQr.Domain.Entities.MesaTask 
        { 
            Id = taskId, 
            TableId = tableNumero, 
            Type = "Cuenta", 
            AssignedMozoId = assignedMozoId,
            RestauranteId = restauranteId
        });
        await clients.NotificarPidiendoCuenta(taskId, tableNumero);
    }

    public async Task NuevoPedido(Guid mesaId, string details)
    {
        if (IsSpamming(mesaId) || !await IsMesaActive(mesaId)) return;
        var (clients, assignedMozoId, restauranteId, tableNumero) = await GetClientsForMesa(mesaId);
        var taskId = Guid.NewGuid();
        await _taskRepository.AddAsync(new SistemaMozoQr.Domain.Entities.MesaTask 
        { 
            Id = taskId, 
            TableId = tableNumero, 
            Type = "Pedido", 
            Details = details, 
            AssignedMozoId = assignedMozoId,
            RestauranteId = restauranteId
        });
        await clients.NotificarNuevoPedido(Guid.NewGuid(), taskId, tableNumero, details);
    }

    public async Task ReasignarTarea(string taskId, string newMozoId)
    {
        if (Guid.TryParse(taskId, out Guid parsedTaskId))
        {
            var task = await _taskRepository.GetByIdIgnoreQueryFiltersAsync(parsedTaskId);
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
            var task = await _taskRepository.GetByIdIgnoreQueryFiltersAsync(parsedTaskId);
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
        if (role == "Admin" || role == "SuperAdmin")
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
