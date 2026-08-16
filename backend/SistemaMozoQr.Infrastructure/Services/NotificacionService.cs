using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WebPush;
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
        var mesa = await _context.Mesas.IgnoreQueryFilters().FirstOrDefaultAsync(m => m.Id == mesaId);
        var restauranteId = mesa?.RestauranteId;
        await ObtenerDestinatarios(mozoId, restauranteId).NotificarLlamadoMozo(mesaId, numeroMesa);
        await EnviarPushADestinatariosAsync(mozoId, "🛎️ Llamado de Mesa", $"La Mesa {numeroMesa} solicita tu asistencia.");
    }

    public async Task NotificarPidiendoCuentaAsync(Guid mesaId, int numeroMesa, Guid? mozoId)
    {
        var mesa = await _context.Mesas.IgnoreQueryFilters().FirstOrDefaultAsync(m => m.Id == mesaId);
        var restauranteId = mesa?.RestauranteId;
        await ObtenerDestinatarios(mozoId, restauranteId).NotificarPidiendoCuenta(mesaId, numeroMesa);
        await EnviarPushADestinatariosAsync(mozoId, "💵 Pedido de Cuenta", $"La Mesa {numeroMesa} solicita la cuenta.");
    }

    public async Task NotificarNuevoPedidoAsync(Guid pedidoId, Guid taskId, int numeroMesa, string details, Guid? mozoId)
    {
        var pedido = await _context.Pedidos.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == pedidoId);
        var restauranteId = pedido?.RestauranteId;
        await ObtenerDestinatarios(mozoId, restauranteId).NotificarNuevoPedido(pedidoId, taskId, numeroMesa, details);
        await EnviarPushADestinatariosAsync(mozoId, "📝 Nuevo Pedido", $"La Mesa {numeroMesa} realizó un nuevo pedido.");
    }

    public async Task NotificarPedidoAprobadoAsync(Guid pedidoId, int numeroMesa, string details, Guid? mozoId)
    {
        var pedido = await _context.Pedidos.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == pedidoId);
        var restauranteId = pedido?.RestauranteId;
        if (restauranteId.HasValue)
        {
            await _hubContext.Clients.Group($"Restaurante_{restauranteId.Value}").NotificarPedidoAprobado(pedidoId, numeroMesa, details);
        }
        else
        {
            await _hubContext.Clients.All.NotificarPedidoAprobado(pedidoId, numeroMesa, details);
        }
        await EnviarPushADestinatariosAsync(mozoId, "✅ Pedido Aprobado", $"El pedido de la Mesa {numeroMesa} fue aprobado.");
    }

    public async Task NotificarPedidoListoAsync(Guid pedidoId, Guid taskId, int numeroMesa, Guid? mozoId)
    {
        var pedido = await _context.Pedidos.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == pedidoId);
        var restauranteId = pedido?.RestauranteId;
        if (restauranteId.HasValue)
        {
            await _hubContext.Clients.Group($"Restaurante_{restauranteId.Value}").NotificarPedidoListo(pedidoId, taskId, numeroMesa);
        }
        else
        {
            await _hubContext.Clients.All.NotificarPedidoListo(pedidoId, taskId, numeroMesa);
        }
        await EnviarPushADestinatariosAsync(mozoId, "🍽️ Pedido Listo", $"El pedido de la Mesa {numeroMesa} está listo para ser servido.");
    }

    public async Task NotificarTareaCompletadaAsync(Guid taskId)
    {
        var task = await _context.Tasks.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == taskId);
        var restauranteId = task?.RestauranteId;
        if (restauranteId.HasValue)
        {
            await _hubContext.Clients.Group($"Restaurante_{restauranteId.Value}").TareaCompletada(taskId.ToString());
        }
        else
        {
            await _hubContext.Clients.All.TareaCompletada(taskId.ToString());
        }
    }

    public async Task NotificarMontoConsumoActualizadoAsync(Guid mesaId, decimal? monto)
    {
        var mesa = await _context.Mesas.IgnoreQueryFilters().FirstOrDefaultAsync(m => m.Id == mesaId);
        var restauranteId = mesa?.RestauranteId;
        if (restauranteId.HasValue)
        {
            await _hubContext.Clients.Group($"Restaurante_{restauranteId.Value}").NotificarMontoConsumoActualizado(mesaId.ToString(), monto);
        }
        else
        {
            await _hubContext.Clients.All.NotificarMontoConsumoActualizado(mesaId.ToString(), monto);
        }
    }

    private IRestauranteHubClient ObtenerDestinatarios(Guid? mozoId, Guid? restauranteId)
    {
        var grupos = new List<string> { "Admin" };
        if (restauranteId.HasValue)
        {
            grupos.Add($"Restaurante_{restauranteId.Value}");
        }
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
            var pubKey = await _context.SystemSettings.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.Key == "VapidPublicKey");
            var privKey = await _context.SystemSettings.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.Key == "VapidPrivateKey");
            var subject = await _context.SystemSettings.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.Key == "VapidSubject");

            if (pubKey == null || privKey == null) return;

            var vapidDetails = new VapidDetails(
                subject?.Value ?? "mailto:admin@mozogo.com",
                pubKey.Value,
                privKey.Value
            );

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

            // Obtener suscripciones push activas de estos destinatarios
            var subscriptions = await _context.PushSubscriptions
                .Where(sub => distinctUserIds.Contains(sub.UsuarioId))
                .ToListAsync();

            if (!subscriptions.Any()) return;

            var payloadObj = new
            {
                notification = new
                {
                    title = title,
                    body = message,
                    icon = "assets/icons/icon-96x96.png",
                    badge = "assets/icons/icon-72x72.png",
                    vibrate = new int[] { 200, 100, 200, 100, 200 },
                    data = new
                    {
                        url = "/admin/tareas"
                    }
                }
            };

            var payloadJson = System.Text.Json.JsonSerializer.Serialize(payloadObj);
            var webPushClient = new WebPushClient();

            foreach (var sub in subscriptions)
            {
                try
                {
                    var pushSub = new PushSubscription(sub.Endpoint, sub.P256dh, sub.Auth);
                    await webPushClient.SendNotificationAsync(pushSub, payloadJson, vapidDetails);
                }
                catch (WebPushException ex)
                {
                    if (ex.StatusCode == System.Net.HttpStatusCode.Gone || ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        _context.PushSubscriptions.Remove(sub);
                    }
                }
                catch (Exception)
                {
                    // Ignorar errores individuales
                }
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al enviar Web Push: {ex.Message}");
        }
    }
}
