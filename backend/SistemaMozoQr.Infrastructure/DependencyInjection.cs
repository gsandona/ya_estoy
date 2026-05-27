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
        var connectionString = configuration.GetConnectionString("DefaultConnection")?.Trim()?.Replace("\"", "")?.Replace("'", "");

        // Parse Render's Postgres URL to ADO.NET format
        if (!string.IsNullOrEmpty(connectionString) && 
            (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) || 
             connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)))
        {
            var uri = new Uri(connectionString);
            var userInfo = uri.UserInfo.Split(':');
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.LocalPath.TrimStart('/');
            connectionString = $"Server={host};Port={port};Database={database};User Id={userInfo[0]};Password={userInfo[1]};SslMode=Prefer;Trust Server Certificate=true;";
            
            services.AddDbContext<RestauranteDbContext>(options => {
                options.UseNpgsql(connectionString);
                options.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });
        }
        else
        {
            // Fallback a SQLite local si no hay DB en la nube o si usa "Data Source="
            services.AddDbContext<RestauranteDbContext>(options => {
                options.UseSqlite(configuration.GetConnectionString("DefaultConnection")?.Contains("Data Source") == true 
                    ? configuration.GetConnectionString("DefaultConnection") 
                    : "Data Source=local.db");
                options.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });
        }

        services.AddScoped<IMesaRepository, MesaRepository>();
        services.AddScoped<IMenuItemRepository, MenuItemRepository>();
        services.AddScoped<IPedidoRepository, PedidoRepository>();
        services.AddScoped<IRestauranteRepository, RestauranteRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();

        services.AddScoped<INotificacionService, NotificacionService>();

        return services;
    }
}
