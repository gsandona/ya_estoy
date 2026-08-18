namespace SistemaMozoQr.Application.Interfaces;

public interface IRestauranteHubClient
{
    Task NotificarLlamadoMozo(Guid mesaId, int numeroMesa, string? details);
    Task NotificarNuevoPedido(Guid pedidoId, Guid taskId, int numeroMesa, string details);
    Task NotificarPidiendoCuenta(Guid mesaId, int numeroMesa, string? details);
    Task TareaReasignada(string taskId, string newMozoId);
    Task TareaCompletada(string taskId);
    Task NotificarPedidoAprobado(Guid pedidoId, int numeroMesa, string details);
    Task NotificarPedidoListo(Guid pedidoId, Guid taskId, int numeroMesa);
    Task NotificarMontoConsumoActualizado(string mesaId, decimal? monto);
}
