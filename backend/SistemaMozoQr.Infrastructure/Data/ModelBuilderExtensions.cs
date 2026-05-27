using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Infrastructure.Data;

public static class ModelBuilderExtensions
{
    public static void SeedData(this ModelBuilder modelBuilder)
    {
        var passHash = "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa"; // 1234
        
        var rest1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var rest2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var rest3Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var rest4Id = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var rest5Id = Guid.Parse("55555555-5555-5555-5555-555555555555");
        var rest6Id = Guid.Parse("66666666-6666-6666-6666-666666666666");

        modelBuilder.Entity<Restaurante>().HasData(
            new Restaurante { Id = rest1Id, Nombre = "El Gran Sabor", IconoPrincipal = "🍽️", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest2Id, Nombre = "La Parrilla de Juan", IconoPrincipal = "🥩", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest3Id, Nombre = "La Pasiva", IconoPrincipal = "🌭", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest4Id, Nombre = "La Merienda", IconoPrincipal = "☕", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest5Id, Nombre = "Bella Italia", IconoPrincipal = "🍕", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Restaurante { Id = rest6Id, Nombre = "Cordon Beer", IconoPrincipal = "🍺", Activo = true, FechaCreacion = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Usuario>().HasData(
            new Usuario { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Email = "super@gino.com", PasswordHash = passHash, NombreCompleto = "Super Admin", Rol = SistemaMozoQr.Domain.Enums.Rol.SuperAdmin, RestauranteId = rest1Id },
            
            // Rest 1 & 2
            new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), RestauranteId = rest1Id, Email = "admin@sabor.com", PasswordHash = passHash, NombreCompleto = "Admin", Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), RestauranteId = rest1Id, Email = "mozo@sabor.com", PasswordHash = passHash, NombreCompleto = "Mozo", Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000001"), RestauranteId = rest2Id, Email = "admin@roma.com", PasswordHash = passHash, NombreCompleto = "Admin", Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("20000000-0000-0000-0000-000000000002"), RestauranteId = rest2Id, Email = "mozo@roma.com", PasswordHash = passHash, NombreCompleto = "Mozo", Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // La Pasiva (Rest3) - 1 Admin, 10 Mozos
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000000"), Email = "admin@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Admin", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000001"), Email = "mozo1@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 1", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000002"), Email = "mozo2@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 2", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000003"), Email = "mozo3@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 3", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000004"), Email = "mozo4@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 4", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000005"), Email = "mozo5@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 5", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000006"), Email = "mozo6@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 6", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000007"), Email = "mozo7@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 7", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000008"), Email = "mozo8@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 8", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000009"), Email = "mozo9@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 9", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("30000000-0000-0000-0000-000000000010"), Email = "mozo10@lapasiva.com", PasswordHash = passHash, NombreCompleto = "Mozo 10", RestauranteId = rest3Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // La Merienda (Rest4) - 1 Admin, 3 Mozos
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000000"), Email = "admin@lamerienda.com", PasswordHash = passHash, NombreCompleto = "Admin", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000001"), Email = "lucia@lamerienda.com", PasswordHash = passHash, NombreCompleto = "Lucia", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000002"), Email = "mateo@lamerienda.com", PasswordHash = passHash, NombreCompleto = "Mateo", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("40000000-0000-0000-0000-000000000003"), Email = "sofia@lamerienda.com", PasswordHash = passHash, NombreCompleto = "Sofia", RestauranteId = rest4Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // Bella Italia (Rest5) - 1 Admin, 2 Mozos
            new Usuario { Id = Guid.Parse("50000000-0000-0000-0000-000000000000"), Email = "admin@bellaitalia.com", PasswordHash = passHash, NombreCompleto = "Admin", RestauranteId = rest5Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("50000000-0000-0000-0000-000000000001"), Email = "mario@bellaitalia.com", PasswordHash = passHash, NombreCompleto = "Mario", RestauranteId = rest5Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("50000000-0000-0000-0000-000000000002"), Email = "luigi@bellaitalia.com", PasswordHash = passHash, NombreCompleto = "Luigi", RestauranteId = rest5Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },

            // Cordon Beer (Rest6) - 1 Admin, 5 Mozos
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000000"), Email = "admin@cordonbeer.com", PasswordHash = passHash, NombreCompleto = "Admin", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Admin },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000001"), Email = "bartender1@cordonbeer.com", PasswordHash = passHash, NombreCompleto = "Bartender 1", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000002"), Email = "bartender2@cordonbeer.com", PasswordHash = passHash, NombreCompleto = "Bartender 2", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000003"), Email = "mesero1@cordonbeer.com", PasswordHash = passHash, NombreCompleto = "Mesero 1", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000004"), Email = "mesero2@cordonbeer.com", PasswordHash = passHash, NombreCompleto = "Mesero 2", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo },
            new Usuario { Id = Guid.Parse("60000000-0000-0000-0000-000000000005"), Email = "mesero3@cordonbeer.com", PasswordHash = passHash, NombreCompleto = "Mesero 3", RestauranteId = rest6Id, Rol = SistemaMozoQr.Domain.Enums.Rol.Mozo }
        );

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

        modelBuilder.Entity<MenuItem>().HasData(
            // Rest 1 & 2
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000014"), RestauranteId = rest1Id, Categoria = "Bebidas", Nombre = "Agua M.", Precio = 1500, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000015"), RestauranteId = rest1Id, Categoria = "Platos", Nombre = "Milanesa", Precio = 8500, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000016"), RestauranteId = rest2Id, Categoria = "Pizzas", Nombre = "Muzzarella", Precio = 9000, Activo = true },

            // Pasiva
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000017"), RestauranteId = rest3Id, Categoria = "Pizzas", Nombre = "Pizza Servilleta", Descripcion = "Clásica porción fina", Precio = 250, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000018"), RestauranteId = rest3Id, Categoria = "Clásicos", Nombre = "Panchos con mostaza", Precio = 350, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000019"), RestauranteId = rest3Id, Categoria = "Bebidas", Nombre = "Cerveza Patricia 1L", Precio = 450, Activo = true },

            // Merienda
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000020"), RestauranteId = rest4Id, Categoria = "Cafetería", Nombre = "Café de Especialidad", Precio = 280, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000021"), RestauranteId = rest4Id, Categoria = "Dulces", Nombre = "Medialunas Rellenas", Precio = 320, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000022"), RestauranteId = rest4Id, Categoria = "Salados", Nombre = "Tostado de Campo", Precio = 450, Activo = true },

            // Italia
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000023"), RestauranteId = rest5Id, Categoria = "Pastas", Nombre = "Ravioles de espinaca", Precio = 800, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000024"), RestauranteId = rest5Id, Categoria = "Pizzas", Nombre = "Pizza Margherita", Precio = 700, Activo = true },

            // Beer
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000025"), RestauranteId = rest6Id, Categoria = "Cervezas", Nombre = "IPA Cordon", Precio = 350, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000026"), RestauranteId = rest6Id, Categoria = "Comidas", Nombre = "Hamburguesa Completa", Precio = 650, Activo = true },
            new MenuItem { Id = Guid.Parse("88888888-8888-8888-8888-000000000027"), RestauranteId = rest6Id, Categoria = "Comidas", Nombre = "Papas Cheddar y Bacon", Precio = 450, Activo = true }
        );
    }
}
