using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using FirebaseAdmin.Messaging;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;
using SistemaMozoQr.Infrastructure.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.Infrastructure.Services;

public class NotificacionService : INotificacionService
{
    private readonly IHubContext<RestauranteHub, IRestauranteHubClient> _hubContext;
    private readonly RestauranteDbContext _context;

    public NotificacionService(IHubContext<RestauranteHub, IRestauranteHubClient> hubContext, RestauranteDbContext context)
    {
        _hubContext = hubContext;
        _context = context;
    }

    public async Task NotificarLlamadoMozoAsync(Guid mesaId, int numeroMesa, Guid? mozoId)
    {
        await ObtenerDestinatarios(mozoId).NotificarLlamadoMozo(mesaId, numeroMesa);
        await EnviarPushADestinatariosAsync(mozoId, "🛎️ Llamado de Mesa", $"La Mesa {numeroMesa} solicita tu asistencia.");
    }

    public async Task NotificarPidiendoCuentaAsync(Guid mesaId, int numeroMesa, Guid? mozoId)
    {
        await ObtenerDestinatarios(mozoId).NotificarPidiendoCuenta(mesaId, numeroMesa);
        await EnviarPushADestinatariosAsync(mozoId, "💵 Pedido de Cuenta", $"La Mesa {numeroMesa} solicita la cuenta.");
    }

    public async Task NotificarNuevoPedidoAsync(Guid pedidoId, Guid taskId, int numeroMesa, string details, Guid? mozoId)
    {
        await ObtenerDestinatarios(mozoId).NotificarNuevoPedido(pedidoId, taskId, numeroMesa, details);
        await EnviarPushADestinatariosAsync(mozoId, "📝 Nuevo Pedido", $"La Mesa {numeroMesa} realizó un nuevo pedido.");
    }

    public async Task NotificarPedidoAprobadoAsync(Guid pedidoId, int numeroMesa, string details, Guid? mozoId)
    {
        await _hubContext.Clients.All.NotificarPedidoAprobado(pedidoId, numeroMesa, details);
        await EnviarPushADestinatariosAsync(mozoId, "✅ Pedido Aprobado", $"El pedido de la Mesa {numeroMesa} fue aprobado.");
    }

    public async Task NotificarPedidoListoAsync(Guid pedidoId, Guid taskId, int numeroMesa, Guid? mozoId)
    {
        await _hubContext.Clients.All.NotificarPedidoListo(pedidoId, taskId, numeroMesa);
        await EnviarPushADestinatariosAsync(mozoId, "🍽️ Pedido Listo", $"El pedido de la Mesa {numeroMesa} está listo para ser servido.");
    }

    public async Task NotificarTareaCompletadaAsync(Guid taskId)
    {
        await _hubContext.Clients.All.TareaCompletada(taskId.ToString());
    }

    public async Task NotificarMontoConsumoActualizadoAsync(Guid mesaId, decimal? monto)
    {
        await _hubContext.Clients.All.NotificarMontoConsumoActualizado(mesaId.ToString(), monto);
    }

    private IRestauranteHubClient ObtenerDestinatarios(Guid? mozoId)
    {
        var grupos = new List<string> { "Admin" };
        if (mozoId.HasValue)
        {
            grupos.Add($"Mozo_{mozoId.Value}");
        }
        return _hubContext.Clients.Groups(grupos);
    }

    private async Task EnviarPushADestinatariosAsync(Guid? mozoId, string title, string message)
    {
        try
        {
            if (FirebaseAdmin.FirebaseApp.DefaultInstance == null)
            {
                return;
            }

            var targetUserIds = new List<Guid>();

            // Obtener admins del restaurante actual (el Tenant Query Filter de EF Core aísla el restaurante)
            var admins = await _context.Usuarios
                .Where(u => u.Rol == SistemaMozoQr.Domain.Enums.Rol.Admin)
                .Select(u => u.Id)
                .ToListAsync();
            targetUserIds.AddRange(admins);

            // Agregar al mozo específico
            if (mozoId.HasValue)
            {
                targetUserIds.Add(mozoId.Value);
            }

            var distinctUserIds = targetUserIds.Distinct().ToList();
            if (!distinctUserIds.Any()) return;

            // Obtener tokens FCM de estos destinatarios
            var deviceTokens = await _context.UserDeviceTokens
                .Where(t => distinctUserIds.Contains(t.UsuarioId))
                .ToListAsync();

            if (!deviceTokens.Any()) return;

            var tokensList = deviceTokens.Select(t => t.Token).ToList();

            // Construir el mensaje FCM Multicast con alta prioridad para despertar pantallas bloqueadas
            var multicastMessage = new MulticastMessage()
            {
                Tokens = tokensList,
                Notification = new Notification()
                {
                    Title = title,
                    Body = message
                },
                Data = new Dictionary<string, string>()
                {
                    { "title", title },
                    { "body", message },
                    { "url", "/admin/tareas" }
                },
                Android = new AndroidConfig()
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification()
                    {
                        Sound = "default"
                    }
                },
                Apns = new ApnsConfig()
                {
                    Headers = new Dictionary<string, string>()
                    {
                        { "apns-priority", "10" } // Alta prioridad para iOS background/locked
                    },
                    Aps = new Aps()
                    {
                        Sound = "default",
                        ContentAvailable = true
                    }
                }
            };

            var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(multicastMessage);

            // Limpieza de tokens inválidos o desinstalados de forma automática
            bool needsDbSave = false;
            for (var i = 0; i < response.Responses.Count; i++)
            {
                if (!response.Responses[i].IsSuccess)
                {
                    var exception = response.Responses[i].Exception;
                    if (exception != null && 
                        (exception.MessagingErrorCode == MessagingErrorCode.Unregistered || 
                         exception.MessagingErrorCode == MessagingErrorCode.InvalidArgument))
                    {
                        var failedToken = deviceTokens[i];
                        _context.UserDeviceTokens.Remove(failedToken);
                        needsDbSave = true;
                    }
                }
            }

            if (needsDbSave)
            {
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al enviar notificaciones FCM: {ex.Message}");
        }
    }
}
