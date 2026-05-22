using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Infrastructure.Data;
using SistemaMozoQr.Infrastructure.Repositories;
using SistemaMozoQr.Infrastructure.Services;
using Microsoft.Extensions.Configuration;

namespace SistemaMozoQr.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<RestauranteDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IMesaRepository, MesaRepository>();
        services.AddScoped<IMenuItemRepository, MenuItemRepository>();
        services.AddScoped<IPedidoRepository, PedidoRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();

        services.AddScoped<INotificacionService, NotificacionService>();

        return services;
    }
}
