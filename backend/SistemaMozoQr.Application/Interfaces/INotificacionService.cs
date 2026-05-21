namespace SistemaMozoQr.Application.Interfaces;

public interface INotificacionService
{
    Task NotificarLlamadoMozoAsync(Guid mesaId, int numeroMesa, Guid? mozoId);
    Task NotificarPidiendoCuentaAsync(Guid mesaId, int numeroMesa, Guid? mozoId);
    Task NotificarNuevoPedidoAsync(Guid pedidoId, Guid mesaId, int numeroMesa, string details, Guid? mozoId);
}
