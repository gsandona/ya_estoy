using Microsoft.AspNetCore.SignalR;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Infrastructure.SignalR;

namespace SistemaMozoQr.Infrastructure.Services;

public class NotificacionService : INotificacionService
{
    private readonly IHubContext<RestauranteHub, IRestauranteHubClient> _hubContext;

    public NotificacionService(IHubContext<RestauranteHub, IRestauranteHubClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotificarLlamadoMozoAsync(Guid mesaId, int numeroMesa)
    {
        await _hubContext.Clients.All.NotificarLlamadoMozo(mesaId, numeroMesa);
    }

    public async Task NotificarPidiendoCuentaAsync(Guid mesaId, int numeroMesa)
    {
        await _hubContext.Clients.All.NotificarPidiendoCuenta(mesaId, numeroMesa);
    }

    public async Task NotificarNuevoPedidoAsync(Guid pedidoId, Guid mesaId, int numeroMesa)
    {
        await _hubContext.Clients.All.NotificarNuevoPedido(pedidoId, mesaId, numeroMesa);
    }
}
