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

    public async Task NotificarLlamadoMozoAsync(Guid mesaId, int numeroMesa, Guid? mozoId)
    {
        await ObtenerDestinatarios(mozoId).NotificarLlamadoMozo(mesaId, numeroMesa);
    }

    public async Task NotificarPidiendoCuentaAsync(Guid mesaId, int numeroMesa, Guid? mozoId)
    {
        await ObtenerDestinatarios(mozoId).NotificarPidiendoCuenta(mesaId, numeroMesa);
    }

    public async Task NotificarNuevoPedidoAsync(Guid pedidoId, Guid mesaId, int numeroMesa, string details, Guid? mozoId)
    {
        await ObtenerDestinatarios(mozoId).NotificarNuevoPedido(pedidoId, mesaId, numeroMesa, details);
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
}
