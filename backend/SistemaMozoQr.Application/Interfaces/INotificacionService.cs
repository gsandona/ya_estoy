namespace SistemaMozoQr.Application.Interfaces;

public interface INotificacionService
{
    Task NotificarLlamadoMozoAsync(Guid mesaId, int numeroMesa);
    Task NotificarPidiendoCuentaAsync(Guid mesaId, int numeroMesa);
    Task NotificarNuevoPedidoAsync(Guid pedidoId, Guid mesaId, int numeroMesa);
}
