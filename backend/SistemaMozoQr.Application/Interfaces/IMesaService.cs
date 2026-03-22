using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Application.Interfaces;

public interface IMesaService
{
    Task<Mesa?> RegistrarEscaneoQrAsync(string tokenQR);
    Task<bool> LlamarMozoAsync(Guid mesaId);
    Task<bool> PedirCuentaAsync(Guid mesaId);
}
