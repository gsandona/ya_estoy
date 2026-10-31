using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaMozoQr.Infrastructure.Data;

public static class DatabaseSeeder
{
    private static readonly HashSet<string> LegacyRestaurantNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "El Gran Sabor",
        "La Parrilla de Juan",
        "La Pasiva",
        "La Merienda",
        "Bella Italia",
        "Cordon Beer",
        "TuRestaurante",
        "Sistema Global"
    };

    private static readonly HashSet<Guid> LegacyRestaurantIds = new()
    {
        Guid.Parse("33333333-3333-3333-3333-333333333333"),
        Guid.Parse("44444444-4444-4444-4444-444444444444"),
        Guid.Parse("55555555-5555-5555-5555-555555555555"),
        Guid.Parse("66666666-6666-6666-6666-666666666666"),
        Guid.Parse("77777777-7777-7777-7777-777777777777")
    };

    private static readonly HashSet<string> LegacyUsernames = new(StringComparer.OrdinalIgnoreCase)
    {
        "supergino",
        "tizisuper",
        "ginosandona",
        "adminsabor",
        "adminlapasiva",
        "admin_turestaurante"
    };

    public static async Task EnsureCleanDemoDataAsync(RestauranteDbContext context)
    {
        var ginoExists = await context.Usuarios
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Username.ToLower() == "gino");

        var allRestaurants = await context.Restaurantes
            .IgnoreQueryFilters()
            .Select(r => new { r.Id, r.Nombre })
            .ToListAsync();

        bool hasLegacyRestaurants = allRestaurants.Any(r =>
            LegacyRestaurantNames.Contains(r.Nombre) || LegacyRestaurantIds.Contains(r.Id));

        var allUsernames = await context.Usuarios
            .IgnoreQueryFilters()
            .Select(u => u.Username)
            .ToListAsync();

        bool hasLegacyUsers = allUsernames.Any(u => LegacyUsernames.Contains(u));

        // Si ya existe el SuperAdmin "gino" y no quedan restaurantes ni usuarios basura antiguos, no tocamos nada.
        if (ginoExists && !hasLegacyRestaurants && !hasLegacyUsers)
        {
            return;
        }

        Console.WriteLine("[DatabaseSeeder] Limpiando datos antiguos e inicializando base de datos limpia de demostración...");

        // 1. Eliminar todas las tablas dependientes en orden seguro de claves foráneas
        await context.Valoraciones.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.PedidoItems.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.Pedidos.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.Tasks.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.Ventas.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.Auditorias.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.ErrorLogs.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.PushSubscriptions.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.Mesas.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.MenuItems.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.DashboardWidgetConfigs.IgnoreQueryFilters().ExecuteDeleteAsync();
        await context.Usuarios.IgnoreQueryFilters().ExecuteDeleteAsync();

        // Eliminar sucursales hijas antes de restaurantes padres (por DeleteBehavior.Restrict en ParentRestauranteId)
        await context.Restaurantes.IgnoreQueryFilters().Where(r => r.ParentRestauranteId != null).ExecuteDeleteAsync();
        await context.Restaurantes.IgnoreQueryFilters().ExecuteDeleteAsync();

        // Eliminar subcategorías antes de categorías raíz
        await context.MenuCategories.IgnoreQueryFilters().Where(c => c.ParentCategoryId != null).ExecuteDeleteAsync();
        await context.MenuCategories.IgnoreQueryFilters().ExecuteDeleteAsync();

        context.ChangeTracker.Clear();

        // 2. Asegurar Roles y RoleFeatures
        var existingRoleIds = await context.Roles.IgnoreQueryFilters().Select(r => r.Id).ToListAsync();
        var missingRoles = ModelBuilderExtensions.GetSeededRoles().Where(r => !existingRoleIds.Contains(r.Id)).ToList();
        if (missingRoles.Any())
        {
            await context.Roles.AddRangeAsync(missingRoles);
            await context.SaveChangesAsync();
        }

        var existingFeatureIds = await context.RoleFeatures.IgnoreQueryFilters().Select(rf => rf.Id).ToListAsync();
        var missingFeatures = ModelBuilderExtensions.GetSeededRoleFeatures().Where(rf => !existingFeatureIds.Contains(rf.Id)).ToList();
        if (missingFeatures.Any())
        {
            await context.RoleFeatures.AddRangeAsync(missingFeatures);
            await context.SaveChangesAsync();
        }

        // 3. Insertar categorías de menú (raíz primero, luego subcategorías)
        var allSeededCategories = ModelBuilderExtensions.GetSeededMenuCategories();
        var rootCategories = allSeededCategories.Where(c => c.ParentCategoryId == null).ToList();
        var subCategories = allSeededCategories.Where(c => c.ParentCategoryId != null).ToList();

        await context.MenuCategories.AddRangeAsync(rootCategories);
        await context.SaveChangesAsync();

        await context.MenuCategories.AddRangeAsync(subCategories);
        await context.SaveChangesAsync();

        // 4. Insertar los 2 restaurantes de demostración
        await context.Restaurantes.AddRangeAsync(ModelBuilderExtensions.GetSeededRestaurantes());
        await context.SaveChangesAsync();

        // 5. Insertar los 2 SuperAdmins y los 14 usuarios de locales (@pub y @pizzeria)
        await context.Usuarios.AddRangeAsync(ModelBuilderExtensions.GetSeededUsuarios());
        await context.SaveChangesAsync();

        // 6. Insertar las 20 mesas (10 por local)
        await context.Mesas.AddRangeAsync(ModelBuilderExtensions.GetSeededMesas());
        await context.SaveChangesAsync();

        // 7. Insertar los 24 productos del menú (12 por local)
        await context.MenuItems.AddRangeAsync(ModelBuilderExtensions.GetSeededMenuItems());
        await context.SaveChangesAsync();

        // 8. Insertar la configuración de widgets del dashboard para ambos locales
        await context.DashboardWidgetConfigs.AddRangeAsync(ModelBuilderExtensions.GetSeededDashboardWidgetConfigs());
        await context.SaveChangesAsync();

        Console.WriteLine("[DatabaseSeeder] Base de datos inicializada exitosamente con Temple Craft Pub y Donatello Pizzería.");
    }
}
