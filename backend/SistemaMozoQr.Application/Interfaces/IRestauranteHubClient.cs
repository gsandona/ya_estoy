namespace SistemaMozoQr.Application.Interfaces;

public interface IRestauranteHubClient
{
    Task NotificarLlamadoMozo(Guid mesaId, int numeroMesa);
    Task NotificarNuevoPedido(Guid pedidoId, Guid mesaId, int numeroMesa, string details);
    Task NotificarPidiendoCuenta(Guid mesaId, int numeroMesa);
    Task TareaReasignada(string taskId, string newMozoId);
    Task TareaCompletada(string taskId);
}
