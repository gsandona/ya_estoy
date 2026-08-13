using Microsoft.AspNetCore.SignalR;
using SistemaMozoQr.Application.Interfaces;

using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Infrastructure.SignalR;

using System.Collections.Concurrent;

public class RestauranteHub : Hub<IRestauranteHubClient>
{
    private readonly IMesaRepository _mesaRepository;
    private readonly ITaskRepository _taskRepository;
    private static readonly ConcurrentDictionary<(Guid MesaId, string Type), DateTime> _lastCalls = new();

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
            grupos.Add($"Restaurante_{mesa.RestauranteId}");
            if (mesa.MozoId.HasValue)
            {
                assignedMozoId = mesa.MozoId.Value.ToString();
                grupos.Add($"Mozo_{assignedMozoId}");
            }
        }
        return (Clients.Groups(grupos), assignedMozoId, restauranteId, numero);
    }

    private bool IsSpamming(Guid mesaId, string type)
    {
        var now = DateTime.UtcNow;
        var key = (mesaId, type);
        if (_lastCalls.TryGetValue(key, out var lastCall))
        {
            if ((now - lastCall).TotalSeconds < 5) return true; // Bloquear si fue hace menos de 5 segundos
        }
        _lastCalls[key] = now;
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

    public async Task<Guid> LlamarMozo(Guid mesaId)
    {
        if (IsSpamming(mesaId, "Llamado") || !await IsMesaActive(mesaId) || await IsDuplicateAlert(mesaId, "Llamado")) return Guid.Empty;
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
        return taskId;
    }

    public async Task<Guid> PedirCuenta(Guid mesaId)
    {
        if (IsSpamming(mesaId, "Cuenta") || !await IsMesaActive(mesaId) || await IsDuplicateAlert(mesaId, "Cuenta")) return Guid.Empty;
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
        return taskId;
    }

    public async Task<Guid> NuevoPedido(Guid mesaId, string details)
    {
        if (IsSpamming(mesaId, "Pedido") || !await IsMesaActive(mesaId)) return Guid.Empty;
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
        return taskId;
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

                // Update the mesa's assigned waiter in the database as well
                if (Guid.TryParse(newMozoId, out Guid parsedMozoId))
                {
                    var mesa = await _mesaRepository.GetByRestauranteIdAndNumeroIgnoreQueryFiltersAsync(task.RestauranteId, task.TableId);
                    if (mesa != null)
                    {
                        mesa.MozoId = parsedMozoId;
                        await _mesaRepository.UpdateAsync(mesa);
                    }
                }
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

    public async Task CancelarTarea(string taskId)
    {
        if (Guid.TryParse(taskId, out Guid parsedTaskId))
        {
            var task = await _taskRepository.GetByIdIgnoreQueryFiltersAsync(parsedTaskId);
            if (task != null && task.Status == "Pending")
            {
                task.Status = "Completed"; // set to Completed to remove it from all pending lists
                await _taskRepository.UpdateAsync(task);
            }
        }
        await Clients.All.TareaCompletada(taskId);
    }

    public async Task JoinGroup(string role, string? userId, string? restauranteId)
    {
        if (!string.IsNullOrEmpty(restauranteId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Restaurante_{restauranteId}");
        }

        if (role == "Admin" || role == "SuperAdmin")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admin");
        }
        else if (role == "Cocina")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Cocina");
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
