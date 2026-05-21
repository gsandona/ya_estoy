using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Enums;
using SistemaMozoQr.Domain.Interfaces;

namespace SistemaMozoQr.Application.Services;

public class MesaService : IMesaService
{
    private readonly IMesaRepository _mesaRepository;
    private readonly INotificacionService _notificacionService;

    public MesaService(IMesaRepository mesaRepository, INotificacionService notificacionService)
    {
        _mesaRepository = mesaRepository;
        _notificacionService = notificacionService;
    }

    public async Task<Mesa?> RegistrarEscaneoQrAsync(string tokenQR)
    {
        var mesa = await _mesaRepository.GetByTokenQRAsync(tokenQR);
        if (mesa == null)
            return null;

        // Si la mesa estaba disponible, pasa a ocupada (abriendo sesión)
        if (mesa.Estado == EstadoMesa.Disponible)
        {
            mesa.Estado = EstadoMesa.Ocupada;
            await _mesaRepository.UpdateAsync(mesa);
        }

        return mesa;
    }

    public async Task<bool> LlamarMozoAsync(Guid mesaId)
    {
        var mesa = await _mesaRepository.GetByIdAsync(mesaId);
        if (mesa == null)
            return false;

        if (mesa.Estado != EstadoMesa.LlamandoMozo)
        {
            mesa.Estado = EstadoMesa.LlamandoMozo;
            await _mesaRepository.UpdateAsync(mesa);
        }

        // Notificar en tiempo real al dashboard
        await _notificacionService.NotificarLlamadoMozoAsync(mesa.Id, mesa.Numero, mesa.MozoId);

        return true;
    }

    public async Task<bool> PedirCuentaAsync(Guid mesaId)
    {
        var mesa = await _mesaRepository.GetByIdAsync(mesaId);
        if (mesa == null)
            return false;

        if (mesa.Estado != EstadoMesa.PidiendoCuenta)
        {
            mesa.Estado = EstadoMesa.PidiendoCuenta;
            await _mesaRepository.UpdateAsync(mesa);
        }

        // Notificar en tiempo real al dashboard
        await _notificacionService.NotificarPidiendoCuentaAsync(mesa.Id, mesa.Numero, mesa.MozoId);

        return true;
    }
}
