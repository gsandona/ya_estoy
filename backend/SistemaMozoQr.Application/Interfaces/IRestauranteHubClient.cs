namespace SistemaMozoQr.Application.Interfaces;

public interface IRestauranteHubClient
{
    Task NotificarLlamadoMozo(Guid mesaId, int numeroMesa);
    Task NotificarNuevoPedido(Guid pedidoId, Guid mesaId, int numeroMesa);
    Task NotificarPidiendoCuenta(Guid mesaId, int numeroMesa);
}
