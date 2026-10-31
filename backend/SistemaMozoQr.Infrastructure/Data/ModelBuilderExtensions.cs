using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Enums;
using System;
using System.Collections.Generic;

namespace SistemaMozoQr.Infrastructure.Data;

public static class ModelBuilderExtensions
{
    public static readonly Guid TemplePubId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid DonatelloPizzeriaId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    // Contraseña staff: "MozoGo1234!"
    public const string DemoStaffPasswordHash = "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm";

    // Contraseña SuperAdmin ("gino" y "tiziano"): "@Manzana.2024" (con salt determinístico para EF Core HasData)
    public static readonly string SuperAdminPasswordHash = BCrypt.Net.BCrypt.HashPassword("@Manzana.2024", "$2a$11$QZiZ0I01OY9YHmu28SD3pu");

    public static List<Role> GetSeededRoles() => new()
    {
        new Role { Id = 1, Nombre = "Mozo", Descripcion = "Mozo del restaurante" },
        new Role { Id = 2, Nombre = "Admin", Descripcion = "Administrador del restaurante" },
        new Role { Id = 3, Nombre = "SuperAdmin", Descripcion = "Super Administrador global del sistema" },
        new Role { Id = 4, Nombre = "Cocina", Descripcion = "Personal de cocina" },
        new Role { Id = 5, Nombre = "Caja", Descripcion = "Cajero del restaurante" },
        new Role { Id = 6, Nombre = "MozoPortal", Descripcion = "Portal de selección para Mozos" }
    };

    public static List<RoleFeature> GetSeededRoleFeatures() => new()
    {
        // SuperAdmin (all 7 features)
        new RoleFeature { Id = Guid.Parse("f0000000-0000-0000-0000-000000000001"), RoleId = 3, FeatureKey = "Metricas", Activo = true },
        new RoleFeature { Id = Guid.Parse("f0000000-0000-0000-0000-000000000002"), RoleId = 3, FeatureKey = "MesasTareas", Activo = true },
        new RoleFeature { Id = Guid.Parse("f0000000-0000-0000-0000-000000000003"), RoleId = 3, FeatureKey = "Cocina", Activo = true },
        new RoleFeature { Id = Guid.Parse("f0000000-0000-0000-0000-000000000004"), RoleId = 3, FeatureKey = "Ventas", Activo = true },
        new RoleFeature { Id = Guid.Parse("f0000000-0000-0000-0000-000000000005"), RoleId = 3, FeatureKey = "MetricasMenu", Activo = true },
        new RoleFeature { Id = Guid.Parse("f0000000-0000-0000-0000-000000000006"), RoleId = 3, FeatureKey = "ConfigPersonal", Activo = true },
        new RoleFeature { Id = Guid.Parse("f0000000-0000-0000-0000-000000000007"), RoleId = 3, FeatureKey = "Sistema", Activo = true },

        // Admin (6 features, no 'Sistema')
        new RoleFeature { Id = Guid.Parse("e0000000-0000-0000-0000-000000000001"), RoleId = 2, FeatureKey = "Metricas", Activo = true },
        new RoleFeature { Id = Guid.Parse("e0000000-0000-0000-0000-000000000002"), RoleId = 2, FeatureKey = "MesasTareas", Activo = true },
        new RoleFeature { Id = Guid.Parse("e0000000-0000-0000-0000-000000000003"), RoleId = 2, FeatureKey = "Cocina", Activo = true },
        new RoleFeature { Id = Guid.Parse("e0000000-0000-0000-0000-000000000004"), RoleId = 2, FeatureKey = "Ventas", Activo = true },
        new RoleFeature { Id = Guid.Parse("e0000000-0000-0000-0000-000000000005"), RoleId = 2, FeatureKey = "MetricasMenu", Activo = true },
        new RoleFeature { Id = Guid.Parse("e0000000-0000-0000-0000-000000000006"), RoleId = 2, FeatureKey = "ConfigPersonal", Activo = true },

        // Mozo (only 'MesasTareas')
        new RoleFeature { Id = Guid.Parse("d0000000-0000-0000-0000-000000000001"), RoleId = 1, FeatureKey = "MesasTareas", Activo = true },

        // Cocina (only 'Cocina')
        new RoleFeature { Id = Guid.Parse("c0000000-0000-0000-0000-000000000001"), RoleId = 4, FeatureKey = "Cocina", Activo = true },

        // Caja (Cocina, Ventas, ConfigPersonal)
        new RoleFeature { Id = Guid.Parse("b0000000-0000-0000-0000-000000000001"), RoleId = 5, FeatureKey = "Cocina", Activo = true },
        new RoleFeature { Id = Guid.Parse("b0000000-0000-0000-0000-000000000002"), RoleId = 5, FeatureKey = "Ventas", Activo = true },
        new RoleFeature { Id = Guid.Parse("b0000000-0000-0000-0000-000000000003"), RoleId = 5, FeatureKey = "ConfigPersonal", Activo = true }
    };

    public static List<Restaurante> GetSeededRestaurantes() => new()
    {
        new Restaurante
        {
            Id = TemplePubId,
            Nombre = "Temple Craft Pub",
            LogoUrl = "/logo.png",
            IconoPrincipal = "🍺",
            ColorPrimario = "#18181b",
            ColorSecundario = "#d97706",
            ColorFondo = "#fafaf9",
            ImagenFondoUrl = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
            Activo = true,
            FechaCreacion = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Restaurante
        {
            Id = DonatelloPizzeriaId,
            Nombre = "Donatello Pizzería",
            LogoUrl = "/logo.png",
            IconoPrincipal = "🍕",
            ColorPrimario = "#7f1d1d",
            ColorSecundario = "#dc2626",
            ColorFondo = "#fffbeb",
            ImagenFondoUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
            Activo = true,
            FechaCreacion = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    };

    public static List<Usuario> GetSeededUsuarios() => new()
    {
        // SuperAdmins Globales
        new Usuario { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Username = "gino", PasswordHash = SuperAdminPasswordHash, NombreCompleto = "Gino Sandona", Rol = Rol.SuperAdmin, RestauranteId = TemplePubId },
        new Usuario { Id = Guid.Parse("99999999-9999-9999-9999-999999999998"), Username = "tiziano", PasswordHash = SuperAdminPasswordHash, NombreCompleto = "Tiziano", Rol = Rol.SuperAdmin, RestauranteId = TemplePubId },

        // Temple Craft Pub (@pub)
        new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), RestauranteId = TemplePubId, Username = "admin@pub", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Admin Temple Pub", Rol = Rol.Admin },
        new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), RestauranteId = TemplePubId, Username = "caja@pub", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Caja Temple Pub", Rol = Rol.Caja },
        new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), RestauranteId = TemplePubId, Username = "cocina@pub", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Cocina & Barra Pub", Rol = Rol.Cocina },
        new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), RestauranteId = TemplePubId, Username = "portal@pub", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Portal Mozos Pub", Rol = Rol.MozoPortal },
        new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), RestauranteId = TemplePubId, Username = "juan@pub", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Juan Pérez", Rol = Rol.Mozo },
        new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000006"), RestauranteId = TemplePubId, Username = "lucia@pub", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Lucía Gómez", Rol = Rol.Mozo },
        new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000007"), RestauranteId = TemplePubId, Username = "mateo@pub", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Mateo Rodríguez", Rol = Rol.Mozo },

        // Donatello Pizzería (@pizzeria)
        new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000001"), RestauranteId = DonatelloPizzeriaId, Username = "admin@pizzeria", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Admin Donatello", Rol = Rol.Admin },
        new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000002"), RestauranteId = DonatelloPizzeriaId, Username = "caja@pizzeria", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Caja Donatello", Rol = Rol.Caja },
        new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000003"), RestauranteId = DonatelloPizzeriaId, Username = "cocina@pizzeria", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Maestro Pizzero", Rol = Rol.Cocina },
        new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000004"), RestauranteId = DonatelloPizzeriaId, Username = "portal@pizzeria", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Portal Mozos Pizzería", Rol = Rol.MozoPortal },
        new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000005"), RestauranteId = DonatelloPizzeriaId, Username = "juan@pizzeria", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Juan Rossi", Rol = Rol.Mozo },
        new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000006"), RestauranteId = DonatelloPizzeriaId, Username = "sofia@pizzeria", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Sofía Bianchi", Rol = Rol.Mozo },
        new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000007"), RestauranteId = DonatelloPizzeriaId, Username = "marco@pizzeria", PasswordHash = DemoStaffPasswordHash, NombreCompleto = "Marco Conti", Rol = Rol.Mozo }
    };

    public static List<Mesa> GetSeededMesas()
    {
        var juanPubId = Guid.Parse("10000000-0000-0000-0000-000000000005");
        var luciaPubId = Guid.Parse("10000000-0000-0000-0000-000000000006");
        var mateoPubId = Guid.Parse("10000000-0000-0000-0000-000000000007");

        var juanPizzeriaId = Guid.Parse("20000000-0000-0000-0000-000000000005");
        var sofiaPizzeriaId = Guid.Parse("20000000-0000-0000-0000-000000000006");
        var marcoPizzeriaId = Guid.Parse("20000000-0000-0000-0000-000000000007");

        return new List<Mesa>
        {
            // 10 Mesas para Temple Craft Pub
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000001"), RestauranteId = TemplePubId, Numero = 1, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-1", Ubicacion = "Barra Cervecera 1 (4 pers.)", MozoId = juanPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000002"), RestauranteId = TemplePubId, Numero = 2, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-2", Ubicacion = "Barra Cervecera 2 (4 pers.)", MozoId = juanPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000003"), RestauranteId = TemplePubId, Numero = 3, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-3", Ubicacion = "Mesa Alta Ventanal (4 pers.)", MozoId = juanPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000004"), RestauranteId = TemplePubId, Numero = 4, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-4", Ubicacion = "Mesa Alta Centro (4 pers.)", MozoId = juanPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000005"), RestauranteId = TemplePubId, Numero = 5, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-5", Ubicacion = "Box Madera Izquierdo (6 pers.)", MozoId = luciaPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000006"), RestauranteId = TemplePubId, Numero = 6, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-6", Ubicacion = "Box Madera Derecho (6 pers.)", MozoId = luciaPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000007"), RestauranteId = TemplePubId, Numero = 7, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-7", Ubicacion = "Living Cuero VIP (6 pers.)", MozoId = luciaPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000008"), RestauranteId = TemplePubId, Numero = 8, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-8", Ubicacion = "Patio Cervecero 1 (4 pers.)", MozoId = mateoPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000009"), RestauranteId = TemplePubId, Numero = 9, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-9", Ubicacion = "Patio Cervecero 2 (6 pers.)", MozoId = mateoPubId },
            new Mesa { Id = Guid.Parse("11111000-0000-0000-0000-000000000010"), RestauranteId = TemplePubId, Numero = 10, Estado = EstadoMesa.Disponible, TokenQR = "qr-pub-mesa-10", Ubicacion = "Terraza Calefaccionada (6 pers.)", MozoId = mateoPubId },

            // 10 Mesas para Donatello Pizzería
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000001"), RestauranteId = DonatelloPizzeriaId, Numero = 1, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-1", Ubicacion = "Salón Frente al Horno 1 (4 pers.)", MozoId = juanPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000002"), RestauranteId = DonatelloPizzeriaId, Numero = 2, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-2", Ubicacion = "Salón Frente al Horno 2 (4 pers.)", MozoId = juanPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000003"), RestauranteId = DonatelloPizzeriaId, Numero = 3, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-3", Ubicacion = "Ventanal Calle (4 pers.)", MozoId = juanPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000004"), RestauranteId = DonatelloPizzeriaId, Numero = 4, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-4", Ubicacion = "Salón Central 1 (4 pers.)", MozoId = juanPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000005"), RestauranteId = DonatelloPizzeriaId, Numero = 5, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-5", Ubicacion = "Salón Central 2 (6 pers.)", MozoId = sofiaPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000006"), RestauranteId = DonatelloPizzeriaId, Numero = 6, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-6", Ubicacion = "Box Familiar Napolitano (6 pers.)", MozoId = sofiaPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000007"), RestauranteId = DonatelloPizzeriaId, Numero = 7, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-7", Ubicacion = "Rincón Cava de Vinos (4 pers.)", MozoId = sofiaPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000008"), RestauranteId = DonatelloPizzeriaId, Numero = 8, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-8", Ubicacion = "Pérgola Jardín 1 (4 pers.)", MozoId = marcoPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000009"), RestauranteId = DonatelloPizzeriaId, Numero = 9, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-9", Ubicacion = "Pérgola Jardín 2 (6 pers.)", MozoId = marcoPizzeriaId },
            new Mesa { Id = Guid.Parse("22222000-0000-0000-0000-000000000010"), RestauranteId = DonatelloPizzeriaId, Numero = 10, Estado = EstadoMesa.Disponible, TokenQR = "qr-pizzeria-mesa-10", Ubicacion = "Mesa Imperial Terraza (6 pers.)", MozoId = marcoPizzeriaId }
        };
    }

    public static List<MenuCategory> GetSeededMenuCategories()
    {
        var comidasId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000001");
        var bebidaAlcoholId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000002");
        var bebidaFriaId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000003");
        var postreId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000004");
        var bebidaCalienteId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000005");

        return new List<MenuCategory>
        {
            new MenuCategory { Id = comidasId, Nombre = "Comidas", Emoji = "🍔", ParentCategoryId = null },
            new MenuCategory { Id = bebidaAlcoholId, Nombre = "Bebida con alcohol", Emoji = "🍷", ParentCategoryId = null },
            new MenuCategory { Id = bebidaFriaId, Nombre = "Bebida fria", Emoji = "🥤", ParentCategoryId = null },
            new MenuCategory { Id = postreId, Nombre = "Postre", Emoji = "🍰", ParentCategoryId = null },
            new MenuCategory { Id = bebidaCalienteId, Nombre = "Bebidas calientes", Emoji = "☕", ParentCategoryId = null },

            new MenuCategory { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000011"), Nombre = "Entradas", Emoji = "🥗", ParentCategoryId = comidasId },
            new MenuCategory { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000012"), Nombre = "Platos", Emoji = "🍝", ParentCategoryId = comidasId },
            new MenuCategory { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000013"), Nombre = "Panes", Emoji = "🍞", ParentCategoryId = comidasId }
        };
    }

    public static List<MenuItem> GetSeededMenuItems()
    {
        var bebidaAlcoholId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000002");
        var bebidaFriaId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000003");
        var postreId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000004");
        var entradasId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000011");
        var platosId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000012");
        var panesId = Guid.Parse("cccccccc-cccc-cccc-cccc-000000000013");

        return new List<MenuItem>
        {
            // 12 Productos para Temple Craft Pub
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000001"), RestauranteId = TemplePubId, Categoria = "Cervezas Artesanales", Nombre = "Pinta American IPA", Descripcion = "Lúpulos cítricos intensos, notas a maracuyá y pino con amargor equilibrado (500ml - IBU 48).", Precio = 3800, MenuCategoryId = bebidaAlcoholId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000002"), RestauranteId = TemplePubId, Categoria = "Cervezas Artesanales", Nombre = "Pinta Golden Honey", Descripcion = "Rubia suave y refrescante elaborada con miel orgánica de pradera (500ml - IBU 16).", Precio = 3500, MenuCategoryId = bebidaAlcoholId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000003"), RestauranteId = TemplePubId, Categoria = "Cervezas Artesanales", Nombre = "Pinta Irish Red Ale", Descripcion = "Roja acaramelada con notas a malta tostada, toffee y final seco (500ml - IBU 22).", Precio = 3600, MenuCategoryId = bebidaAlcoholId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000004"), RestauranteId = TemplePubId, Categoria = "Cervezas Artesanales", Nombre = "Pinta Cream Stout", Descripcion = "Negra cremosa con intensos aromas a café tostado, cacao amargo y avena (500ml - IBU 30).", Precio = 3800, MenuCategoryId = bebidaAlcoholId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000005"), RestauranteId = TemplePubId, Categoria = "Hamburguesas", Nombre = "Doble Crispy Cheddar Burger", Descripcion = "Doble medallón smash 100% roast beef, cuádruple cheddar inglés, panceta ahumada crocante y salsa Temple en pan brioche.", Precio = 9800, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000006"), RestauranteId = TemplePubId, Categoria = "Hamburguesas", Nombre = "Blue Cheese & Caramelized Burger", Descripcion = "Doble medallón smash, queso azul fundido, cebolla caramelizada al stout y rúcula fresca con papas rústicas.", Precio = 10200, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000007"), RestauranteId = TemplePubId, Categoria = "Hamburguesas", Nombre = "Trufa & Hongos Smash Burger", Descripcion = "Doble carne smash, provolone grillado, salteado de portobellos a la manteca y alioli de trufa negra.", Precio = 10800, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000008"), RestauranteId = TemplePubId, Categoria = "Picadas & Tapas", Nombre = "Papas Temple con Cheddar y Panceta", Descripcion = "Bandeja para compartir de papas triple cocción con salsa cheddar artesanal, lluvia de bacon y verdeo.", Precio = 6500, MenuCategoryId = entradasId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000009"), RestauranteId = TemplePubId, Categoria = "Picadas & Tapas", Nombre = "Bastones de Muzzarella Rebozados", Descripcion = "Seis bastones gigantes de muzzarella rebozados en panko y hierbas con dip de salsa fileto picante.", Precio = 6200, MenuCategoryId = entradasId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000010"), RestauranteId = TemplePubId, Categoria = "Picadas & Tapas", Nombre = "Tabla Cervecera Caliente", Descripcion = "Tenders de pollo crispy, aros de cebolla en masa de cerveza, tequeños, papas rústicas y 3 dips caseros.", Precio = 14500, MenuCategoryId = entradasId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000011"), RestauranteId = TemplePubId, Categoria = "Tragos & Bebidas", Nombre = "Gin Tonic Botánico", Descripcion = "Gin destilado en alambique de cobre, agua tónica premium, bayas de enebro, piel de pomelo rosado y romero.", Precio = 5200, MenuCategoryId = bebidaAlcoholId, Activo = true },
            new MenuItem { Id = Guid.Parse("11111999-0000-0000-0000-000000000012"), RestauranteId = TemplePubId, Categoria = "Postres", Nombre = "Brownie Tibio con Stout Fudge", Descripcion = "Brownie húmedo de chocolate belga 70% con nueces pecan, salsa tibia de reducción de cerveza Stout y helado de crema americana.", Precio = 5400, MenuCategoryId = postreId, Activo = true },

            // 12 Productos para Donatello Pizzería
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000001"), RestauranteId = DonatelloPizzeriaId, Categoria = "Pizzas Napolitanas", Nombre = "Pizza Margherita D.O.P.", Descripcion = "Masa de fermentación lenta 48hs al horno de leña, pomodoro San Marzano, fior di latte fresca, albahaca y aceite de oliva virgen extra.", Precio = 10500, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000002"), RestauranteId = DonatelloPizzeriaId, Categoria = "Pizzas Napolitanas", Nombre = "Pizza Diavola Pepperoni", Descripcion = "Pomodoro San Marzano, fior di latte, pepperoni curado ligeramente picante, orégano fresco y miel picante.", Precio = 12200, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000003"), RestauranteId = DonatelloPizzeriaId, Categoria = "Pizzas Napolitanas", Nombre = "Pizza Prosciutto e Rucola", Descripcion = "Base blanca de fior di latte, jamón crudo tipo Parma estacionado 18 meses, rúcula selvática, lascas de Parmigiano Reggiano y oliva.", Precio = 13400, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000004"), RestauranteId = DonatelloPizzeriaId, Categoria = "Pizzas Napolitanas", Nombre = "Pizza Quattro Formaggi", Descripcion = "Fusión cremosa de fior di latte, gorgonzola italiano, fontina patagónica, Parmigiano Reggiano y pimienta negra recién molida.", Precio = 12800, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000005"), RestauranteId = DonatelloPizzeriaId, Categoria = "Pizzas Napolitanas", Nombre = "Pizza Mortadella e Pistacchio", Descripcion = "Base blanca de fior di latte, mortadela italiana con pistachos, stracciatella cremosa, pesto de pistacho de Bronte y ralladura de limón.", Precio = 13900, MenuCategoryId = platosId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000006"), RestauranteId = DonatelloPizzeriaId, Categoria = "Antipasti & Entradas", Nombre = "Burrata Pugliese con Focaccia", Descripcion = "Burrata fresca de 200g sobre colchón de rúcula, tomates cherry confitados, reducción de aceto balsámico y focaccia tibia al romero.", Precio = 8900, MenuCategoryId = entradasId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000007"), RestauranteId = DonatelloPizzeriaId, Categoria = "Antipasti & Entradas", Nombre = "Bruschetta Tradizionale", Descripcion = "Cuatro rodajas de pan de masa madre tostado al horno de leña con ajo, tomates reliquia marinados, albahaca fresca y oliva.", Precio = 5600, MenuCategoryId = entradasId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000008"), RestauranteId = DonatelloPizzeriaId, Categoria = "Antipasti & Entradas", Nombre = "Fainá Crocante al Romero", Descripcion = "Porción doble de fainá tradicional de harina de garbanzos al horno de barro con romero fresco y pimienta negra.", Precio = 3200, MenuCategoryId = panesId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000009"), RestauranteId = DonatelloPizzeriaId, Categoria = "Bebidas & Vinos", Nombre = "Limonada Siciliana con Menta", Descripcion = "Jugo de limones recién exprimidos, almíbar de jengibre orgánico, hojas de menta fresca y agua con gas (500ml).", Precio = 3400, MenuCategoryId = bebidaFriaId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000010"), RestauranteId = DonatelloPizzeriaId, Categoria = "Bebidas & Vinos", Nombre = "Copa Vino Malbec Reserva", Descripcion = "Copa de Malbec Reserva de altura (Valle de Uco), notas a frutos rojos maduros, violetas y crianza en roble francés.", Precio = 4800, MenuCategoryId = bebidaAlcoholId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000011"), RestauranteId = DonatelloPizzeriaId, Categoria = "Dolci & Postres", Nombre = "Tiramisú Tradizionale della Nonna", Descripcion = "Vainillas artesanales embebidas en espresso italiano, crema de mascarpone legítimo y cacao amargo holandés.", Precio = 5800, MenuCategoryId = postreId, Activo = true },
            new MenuItem { Id = Guid.Parse("22222999-0000-0000-0000-000000000012"), RestauranteId = DonatelloPizzeriaId, Categoria = "Dolci & Postres", Nombre = "Cannoli Siciliani", Descripcion = "Dos tubos crujientes de masa frita rellenos al momento con crema de ricotta dulce, chips de chocolate amargo y pistachos tostados.", Precio = 5400, MenuCategoryId = postreId, Activo = true }
        };
    }

    public static List<DashboardWidgetConfig> GetSeededDashboardWidgetConfigs()
    {
        var restaurants = new List<Guid> { TemplePubId, DonatelloPizzeriaId };
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
        return configs;
    }

    public static void SeedData(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasData(GetSeededRoles());
        modelBuilder.Entity<RoleFeature>().HasData(GetSeededRoleFeatures());
        modelBuilder.Entity<Restaurante>().HasData(GetSeededRestaurantes());
        modelBuilder.Entity<Usuario>().HasData(GetSeededUsuarios());
        modelBuilder.Entity<Mesa>().HasData(GetSeededMesas());
        modelBuilder.Entity<MenuCategory>().HasData(GetSeededMenuCategories());
        modelBuilder.Entity<MenuItem>().HasData(GetSeededMenuItems());
        modelBuilder.Entity<DashboardWidgetConfig>().HasData(GetSeededDashboardWidgetConfigs());
    }
}
