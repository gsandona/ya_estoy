using Microsoft.Extensions.DependencyInjection;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Application.Services;

namespace SistemaMozoQr.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IMesaService, MesaService>();
        services.AddScoped<IPedidoService, PedidoService>();
        return services;
    }
}
