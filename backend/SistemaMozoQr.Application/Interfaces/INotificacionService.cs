namespace SistemaMozoQr.Application.Interfaces;

public interface INotificacionService
{
    Task NotificarLlamadoMozoAsync(Guid mesaId, int numeroMesa, Guid? mozoId);
    Task NotificarPidiendoCuentaAsync(Guid mesaId, int numeroMesa, Guid? mozoId);
    Task NotificarNuevoPedidoAsync(Guid pedidoId, Guid taskId, int numeroMesa, string details, Guid? mozoId);
    Task NotificarPedidoAprobadoAsync(Guid pedidoId, int numeroMesa, string details, Guid? mozoId);
    Task NotificarPedidoListoAsync(Guid pedidoId, Guid taskId, int numeroMesa, Guid? mozoId);
    Task NotificarTareaCompletadaAsync(Guid taskId);
    Task NotificarMontoConsumoActualizadoAsync(Guid mesaId, decimal? monto);
}
