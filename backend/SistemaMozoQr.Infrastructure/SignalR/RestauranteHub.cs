using Microsoft.AspNetCore.SignalR;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.Infrastructure.SignalR;

public class RestauranteHub : Hub<IRestauranteHubClient>
{
    public async Task LlamarMozo(int tableId)
    {
        await Clients.All.NotificarLlamadoMozo(Guid.NewGuid(), tableId);
    }

    public async Task PedirCuenta(int tableId)
    {
        await Clients.All.NotificarPidiendoCuenta(Guid.NewGuid(), tableId);
    }

    public async Task NuevoPedido(int tableId, string details)
    {
        await Clients.All.NotificarNuevoPedido(Guid.NewGuid(), Guid.NewGuid(), tableId);
    }

    public override Task OnConnectedAsync()
    {
        return base.OnConnectedAsync();
    }
}
