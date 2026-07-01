using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using System;
using System.Collections.Generic;

namespace SistemaMozoQr.Infrastructure.Data;

public static class ModelBuilderExtensions
{
    public static void SeedData(this ModelBuilder modelBuilder)
    {
        // Contraseña fuerte: "MozoGo1234!"
        var passHash = "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm";
        
        var rest1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var rest2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var rest3Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var rest4Id = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var rest5Id = Guid.Parse("55555555-5555-5555-5555-555555555555");
        var rest6Id = Guid.Parse("66666666-6666-6666-6666-666666666666");

        // Seed Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Nombre = "Mozo", Descripcion = "Mozo del restaurante" },
            new Role { Id = 2, Nombre = "Admin", Descripcion = "Administrador del restaurante" },
            new Role { Id = 3, Nombre = "SuperAdmin", Descripcion = "Super Administrador global del sistema" },
            new Role { Id = 4, Nombre = "Cocina", Descripcion = "Personal de cocina" }
        );

        // Seed Restaurantes
        modelBuilder.Entity<Restaurante>().HasData(
            new Restaurante { Id = rest1Id, Nombre = "El Gran Sabor", IconoPrincipal = "🍽️", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest2Id, Nombre = "La Parrilla de Juan", IconoPrincipal = "🥩", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest3Id, Nombre = "La Pasiva", IconoPrincipal = "🌭", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest4Id, Nombre = "La Merienda", IconoPrincipal = "☕", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest5Id, Nombre = "Bella Italia", IconoPrincipal = "🍕", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest6Id, Nombre = "Cordon Beer", IconoPrincipal = "🍺", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Seed Usuarios (Email -> Username)
        modelBuilder.Entity<Usuario>().HasData(
            new Usuario { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Username = "supergino", PasswordHash = passHash, NombreCompleto = "Super Admin", Rol = SistemaMozoQr.Domain.Enums.Rol.SuperAdmin, RestauranteId = rest1Id },
            new Usuario { Id = Guid.Parse("99999999-9999-9999-9999-999999999998"), Username = "tizisuper", PasswordHash = passHash, NombreCompleto = "Tizi Super Admin", Rol = SistemaMozoQr.Domain.Enums.Rol.SuperAdmin, RestauranteId = rest1Id },
            
            // Rest 1 & 2
            new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), RestauranteId = rest1Id, Username = "adminsabor", PasswordHash = passHash, NombreCompleto = "Admin Sabor", Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), RestauranteId = rest1Id, Username = "mozosabor", PasswordHash = passHash, NombreCompleto = "Mozo Sabor", Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000001"), RestauranteId = rest2Id, Username = "adminroma", PasswordHash = passHash, NombreCompleto = "Admin Roma", Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000002"), RestauranteId = rest2Id, Username = "mozoroma", PasswordHash = passHash, NombreCompleto = "Mozo Roma", Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // La Pasiva (Rest3) - 1 Admin, 10 Mozos
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000000"), Username = "adminlapasiva", PasswordHash = passHash, NombreCompleto = "Admin Pasiva", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000001"), Username = "mozo1lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 1", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000002"), Username = "mozo2lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 2", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000003"), Username = "mozo3lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 3", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000004"), Username = "mozo4lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 4", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000005"), Username = "mozo5lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 5", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000006"), Username = "mozo6lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 6", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000007"), Username = "mozo7lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 7", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000008"), Username = "mozo8lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 8", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000009"), Username = "mozo9lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 9", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000010"), Username = "mozo10lapasiva", PasswordHash = passHash, NombreCompleto = "Mozo 10", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // La Merienda (Rest4) - 1 Admin, 3 Mozos
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000000"), Username = "adminlamerienda", PasswordHash = passHash, NombreCompleto = "Admin Merienda", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000001"), Username = "lucialamerienda", PasswordHash = passHash, NombreCompleto = "Lucia", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000002"), Username = "mateolamerienda", PasswordHash = passHash, NombreCompleto = "Mateo", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000003"), Username = "sofialamerienda", PasswordHash = passHash, NombreCompleto = "Sofia", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // Bella Italia (Rest5) - 1 Admin, 2 Mozos
            new Usuario { Id = Guid.Parse("50000000-0000-0000-0000-000000000000"), Username = "adminbellaitalia", PasswordHash = passHash, NombreCompleto = "Admin Bella Italia", RestauranteId = rest5Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("50000000-0000-0000-0000-000000000001"), Username = "mariobellaitalia", PasswordHash = passHash, NombreCompleto = "Mario", RestauranteId = rest5Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("50000000-0000-0000-0000-000000000002"), Username = "luigibellaitalia", PasswordHash = passHash, NombreCompleto = "Luigi", RestauranteId = rest5Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // Cordon Beer (Rest6) - 1 Admin, 5 Mozos
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000000"), Username = "admincordonbeer", PasswordHash = passHash, NombreCompleto = "Admin Cordon Beer", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000001"), Username = "bartender1cordonbeer", PasswordHash = passHash, NombreCompleto = "Bartender 1", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000002"), Username = "bartender2cordonbeer", PasswordHash = passHash, NombreCompleto = "Bartender 2", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000003"), Username = "mesero1cordonbeer", PasswordHash = passHash, NombreCompleto = "Mesero 1", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000004"), Username = "mesero2cordonbeer", PasswordHash = passHash, NombreCompleto = "Mesero 2", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000005"), Username = "mesero3cordonbeer", PasswordHash = passHash, NombreCompleto = "Mesero 3", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo }
        );

        // Seed Mesas
        modelBuilder.Entity<Mesa>().HasData(
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000001"), RestauranteId = rest1Id, Numero = 1, TokenQR = "MESA1_R1_QR" },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000002"), RestauranteId = rest1Id, Numero = 2, TokenQR = "MESA2_R1_QR" },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000001"), RestauranteId = rest2Id, Numero = 1, TokenQR = "MESA1_R2_QR" },

            // Pasiva
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000001"), Numero = 1, RestauranteId = rest3Id, TokenQR = "PASIVA_QR_1", Ubicacion = "Mesa principal entrada", MozoId = Guid.Parse("30000000-0000-0000-0000-000000000001") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000002"), Numero = 2, RestauranteId = rest3Id, TokenQR = "PASIVA_QR_2", Ubicacion = "Mesa redonda en el centro", MozoId = Guid.Parse("30000000-0000-0000-0000-000000000001") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000003"), Numero = 3, RestauranteId = rest3Id, TokenQR = "PASIVA_QR_3", Ubicacion = "Box familiar derecha", MozoId = Guid.Parse("30000000-0000-0000-0000-000000000002") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000004"), Numero = 4, RestauranteId = rest3Id, TokenQR = "PASIVA_QR_4", Ubicacion = "Ambiente intimo al fondo", MozoId = Guid.Parse("30000000-0000-0000-0000-000000000002") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000005"), Numero = 5, RestauranteId = rest3Id, TokenQR = "PASIVA_QR_5", Ubicacion = "Sector fumadores terraza", MozoId = Guid.Parse("30000000-0000-0000-0000-000000000003") },
            
            // Merienda
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000006"), Numero = 1, RestauranteId = rest4Id, TokenQR = "MERIENDA_QR_1", Ubicacion = "Ventana luminosa", MozoId = Guid.Parse("40000000-0000-0000-0000-000000000001") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000007"), Numero = 2, RestauranteId = rest4Id, TokenQR = "MERIENDA_QR_2", Ubicacion = "Sofa grande", MozoId = Guid.Parse("40000000-0000-0000-0000-000000000002") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000008"), Numero = 3, RestauranteId = rest4Id, TokenQR = "MERIENDA_QR_3", Ubicacion = "Rincon lectura", MozoId = Guid.Parse("40000000-0000-0000-0000-000000000003") },
            
            // Italia
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000009"), Numero = 1, RestauranteId = rest5Id, TokenQR = "ITALIA_QR_1", Ubicacion = "Mesa romantica", MozoId = Guid.Parse("50000000-0000-0000-0000-000000000001") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000010"), Numero = 2, RestauranteId = rest5Id, TokenQR = "ITALIA_QR_2", Ubicacion = "Mesa central", MozoId = Guid.Parse("50000000-0000-0000-0000-000000000002") },
            
            // Beer
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000011"), Numero = 1, RestauranteId = rest6Id, TokenQR = "BEER_QR_1", Ubicacion = "Barra 1", MozoId = Guid.Parse("60000000-0000-0000-0000-000000000001") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000012"), Numero = 2, RestauranteId = rest6Id, TokenQR = "BEER_QR_2", Ubicacion = "Mesa Alta", MozoId = Guid.Parse("60000000-0000-0000-0000-000000000003") },
            new Mesa { Id = Guid.Parse("88888888-8888-8888-8888-000000000013"), Numero = 3, RestauranteId = rest6Id, TokenQR = "BEER_QR_3", Ubicacion = "Sector Pool", MozoId = Guid.Parse("60000000-0000-0000-0000-000000000005") }
        );

        // Seed MenuItems
        modelBuilder.Entity<MenuItem>().HasData(
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000014"), RestauranteId = rest1Id, Categoria = "Bebidas", Nombre = "Agua Mineral", Precio = 1500, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000015"), RestauranteId = rest1Id, Categoria = "Platos", Nombre = "Milanesa con Papas Fritas", Precio = 8500, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000016"), RestauranteId = rest2Id, Categoria = "Pizzas", Nombre = "Pizza Muzzarella", Precio = 9000, Activo = true },

            // Pasiva
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000017"), RestauranteId = rest3Id, Categoria = "Pizzas", Nombre = "Pizza Servilleta", Descripcion = "Clásica porción fina", Precio = 250, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000018"), RestauranteId = rest3Id, Categoria = "Clásicos", Nombre = "Panchos con mostaza", Precio = 350, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000019"), RestauranteId = rest3Id, Categoria = "Bebidas", Nombre = "Cerveza Patricia 1L", Precio = 450, Activo = true },

            // Merienda
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000020"), RestauranteId = rest4Id, Categoria = "Cafetería", Nombre = "Café de Especialidad", Precio = 280, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000021"), RestauranteId = rest4Id, Categoria = "Dulces", Nombre = "Medialunas Rellenas", Precio = 320, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000022"), RestauranteId = rest4Id, Categoria = "Salados", Nombre = "Tostado de Campo", Precio = 450, Activo = true },

            // Italia
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000023"), RestauranteId = rest5Id, Categoria = "Pastas", Nombre = "Ravioles de espinaca con salsa", Precio = 800, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000024"), RestauranteId = rest5Id, Categoria = "Pizzas", Nombre = "Pizza Margherita", Precio = 700, Activo = true },

            // Beer
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000025"), RestauranteId = rest6Id, Categoria = "Cervezas", Nombre = "Cerveza IPA Cordon", Precio = 350, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000026"), RestauranteId = rest6Id, Categoria = "Comidas", Nombre = "Hamburguesa Completa con Fritas", Precio = 650, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000027"), RestauranteId = rest6Id, Categoria = "Comidas", Nombre = "Papas Cheddar y Bacon", Precio = 450, Activo = true }
        );

        // Seed Default DashboardWidgetConfigs for all 6 Restaurants
        var restaurants = new List<Guid> { rest1Id, rest2Id, rest3Id, rest4Id, rest5Id, rest6Id };
        var widgets = new List<string> { "KPI_Ventas", "KPI_Pedidos", "KPI_Llamados", "KPI_Alertas", "StaffPerformance", "TopTables", "PeakHours" };

        var configs = new List<DashboardWidgetConfig>();
        int widgetSeedCounter = 1;
        foreach (var rId in restaurants)
        {
            for (int i = 0; i < widgets.Count; i++)
            {
                configs.Add(new DashboardWidgetConfig
                {
                    Id = Guid.Parse($"aaaaaaaa-aaaa-aaaa-aaaa-{widgetSeedCounter:D12}"),
                    RestauranteId = rId,
                    WidgetKey = widgets[i],
                    Orden = i + 1,
                    Activo = true
                });
                widgetSeedCounter++;
            }
        }
        modelBuilder.Entity<DashboardWidgetConfig>().HasData(configs);

        // Seed Menu Categories & Subcategories
        var comidasId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000001");
        var bebidaAlcoholId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000002");
        var bebidaFriaId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000003");
        var postreId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000004");
        var bebidaCalienteId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000005");

        modelBuilder.Entity<MenuCategory>().HasData(
            new MenuCategory { Id = comidasId, Nombre = "Comidas", Emoji = "🍔", ParentCategoryId = null },
            new MenuCategory { Id = bebidaAlcoholId, Nombre = "Bebida con alcohol", Emoji = "🍷", ParentCategoryId = null },
            new MenuCategory { Id = bebidaFriaId, Nombre = "Bebida fria", Emoji = "🥤", ParentCategoryId = null },
            new MenuCategory { Id = postreId, Nombre = "Postre", Emoji = "🍰", ParentCategoryId = null },
            new MenuCategory { Id = bebidaCalienteId, Nombre = "Bebidas calientes", Emoji = "☕", ParentCategoryId = null },

            new MenuCategory { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000011"), Nombre = "Entradas", Emoji = "🥗", ParentCategoryId = comidasId },
            new MenuCategory { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000012"), Nombre = "Platos", Emoji = "🍝", ParentCategoryId = comidasId },
            new MenuCategory { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000013"), Nombre = "Panes", Emoji = "🍞", ParentCategoryId = comidasId }
        );
    }
}
