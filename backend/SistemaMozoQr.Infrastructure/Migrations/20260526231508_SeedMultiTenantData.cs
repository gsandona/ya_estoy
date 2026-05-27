using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedMultiTenantData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"));

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Activo", "Categoria", "Descripcion", "Nombre", "Precio", "RestauranteId" },
                values: new object[,]
                {
                    { new Guid("88888888-8888-8888-8888-000000000014"), true, "Bebidas", null, "Agua M.", 1500m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("88888888-8888-8888-8888-000000000015"), true, "Platos", null, "Milanesa", 8500m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("88888888-8888-8888-8888-000000000016"), true, "Pizzas", null, "Muzzarella", 9000m, new Guid("22222222-2222-2222-2222-222222222222") }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "CodigoAcceso", "Estado", "MozoId", "Numero", "RestauranteId", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("11111000-0000-0000-0000-000000000001"), null, 0, null, 1, new Guid("11111111-1111-1111-1111-111111111111"), "MESA1_R1_QR", null },
                    { new Guid("11111000-0000-0000-0000-000000000002"), null, 0, null, 2, new Guid("11111111-1111-1111-1111-111111111111"), "MESA2_R1_QR", null },
                    { new Guid("22222000-0000-0000-0000-000000000001"), null, 0, null, 1, new Guid("22222222-2222-2222-2222-222222222222"), "MESA1_R2_QR", null }
                });

            migrationBuilder.InsertData(
                table: "Restaurantes",
                columns: new[] { "Id", "Activo", "ColorPrincipal", "FechaCreacion", "LogoUrl", "Nombre" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), true, "#ffc107", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "La Pasiva" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), true, "#ff6b6b", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "La Merienda" },
                    { new Guid("55555555-5555-5555-5555-555555555555"), true, "#10b981", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Bella Italia" },
                    { new Guid("66666666-6666-6666-6666-666666666666"), true, "#f59e0b", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Cordon Beer" }
                });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId", "Rol" },
                values: new object[] { "mario@bellaitalia.com", "Mario", new Guid("55555555-5555-5555-5555-555555555555"), 1 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId" },
                values: new object[] { "luigi@bellaitalia.com", "Luigi", new Guid("55555555-5555-5555-5555-555555555555") });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId", "Rol" },
                values: new object[] { "bartender1@cordonbeer.com", "Bartender 1", new Guid("66666666-6666-6666-6666-666666666666"), 1 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId" },
                values: new object[] { "bartender2@cordonbeer.com", "Bartender 2", new Guid("66666666-6666-6666-6666-666666666666") });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                columns: new[] { "NombreCompleto", "PasswordHash" },
                values: new object[] { "Super Admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta" });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Email", "NombreCompleto", "PasswordHash", "RestauranteId", "Rol" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "admin@sabor.com", "Admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("11111111-1111-1111-1111-111111111111"), 0 },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "mozo@sabor.com", "Mozo", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("11111111-1111-1111-1111-111111111111"), 1 },
                    { new Guid("20000000-0000-0000-0000-000000000001"), "admin@roma.com", "Admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("22222222-2222-2222-2222-222222222222"), 0 },
                    { new Guid("20000000-0000-0000-0000-000000000002"), "mozo@roma.com", "Mozo", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("22222222-2222-2222-2222-222222222222"), 1 }
                });

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Activo", "Categoria", "Descripcion", "Nombre", "Precio", "RestauranteId" },
                values: new object[,]
                {
                    { new Guid("88888888-8888-8888-8888-000000000017"), true, "Pizzas", "Clásica porción fina", "Pizza Servilleta", 250m, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("88888888-8888-8888-8888-000000000018"), true, "Clásicos", null, "Panchos con mostaza", 350m, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("88888888-8888-8888-8888-000000000019"), true, "Bebidas", null, "Cerveza Patricia 1L", 450m, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("88888888-8888-8888-8888-000000000020"), true, "Cafetería", null, "Café de Especialidad", 280m, new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("88888888-8888-8888-8888-000000000021"), true, "Dulces", null, "Medialunas Rellenas", 320m, new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("88888888-8888-8888-8888-000000000022"), true, "Salados", null, "Tostado de Campo", 450m, new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("88888888-8888-8888-8888-000000000023"), true, "Pastas", null, "Ravioles de espinaca", 800m, new Guid("55555555-5555-5555-5555-555555555555") },
                    { new Guid("88888888-8888-8888-8888-000000000024"), true, "Pizzas", null, "Pizza Margherita", 700m, new Guid("55555555-5555-5555-5555-555555555555") },
                    { new Guid("88888888-8888-8888-8888-000000000025"), true, "Cervezas", null, "IPA Cordon", 350m, new Guid("66666666-6666-6666-6666-666666666666") },
                    { new Guid("88888888-8888-8888-8888-000000000026"), true, "Comidas", null, "Hamburguesa Completa", 650m, new Guid("66666666-6666-6666-6666-666666666666") },
                    { new Guid("88888888-8888-8888-8888-000000000027"), true, "Comidas", null, "Papas Cheddar y Bacon", 450m, new Guid("66666666-6666-6666-6666-666666666666") }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "CodigoAcceso", "Estado", "MozoId", "Numero", "RestauranteId", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("88888888-8888-8888-8888-000000000009"), null, 0, new Guid("50000000-0000-0000-0000-000000000001"), 1, new Guid("55555555-5555-5555-5555-555555555555"), "ITALIA_QR_1", "Mesa romantica" },
                    { new Guid("88888888-8888-8888-8888-000000000010"), null, 0, new Guid("50000000-0000-0000-0000-000000000002"), 2, new Guid("55555555-5555-5555-5555-555555555555"), "ITALIA_QR_2", "Mesa central" },
                    { new Guid("88888888-8888-8888-8888-000000000011"), null, 0, new Guid("60000000-0000-0000-0000-000000000001"), 1, new Guid("66666666-6666-6666-6666-666666666666"), "BEER_QR_1", "Barra 1" }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Email", "NombreCompleto", "PasswordHash", "RestauranteId", "Rol" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000000"), "admin@lapasiva.com", "Admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 0 },
                    { new Guid("30000000-0000-0000-0000-000000000001"), "mozo1@lapasiva.com", "Mozo 1", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000002"), "mozo2@lapasiva.com", "Mozo 2", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000003"), "mozo3@lapasiva.com", "Mozo 3", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000004"), "mozo4@lapasiva.com", "Mozo 4", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000005"), "mozo5@lapasiva.com", "Mozo 5", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000006"), "mozo6@lapasiva.com", "Mozo 6", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000007"), "mozo7@lapasiva.com", "Mozo 7", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000008"), "mozo8@lapasiva.com", "Mozo 8", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000009"), "mozo9@lapasiva.com", "Mozo 9", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("30000000-0000-0000-0000-000000000010"), "mozo10@lapasiva.com", "Mozo 10", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("40000000-0000-0000-0000-000000000000"), "admin@lamerienda.com", "Admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("44444444-4444-4444-4444-444444444444"), 0 },
                    { new Guid("40000000-0000-0000-0000-000000000001"), "lucia@lamerienda.com", "Lucia", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("44444444-4444-4444-4444-444444444444"), 1 },
                    { new Guid("40000000-0000-0000-0000-000000000002"), "mateo@lamerienda.com", "Mateo", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("44444444-4444-4444-4444-444444444444"), 1 },
                    { new Guid("40000000-0000-0000-0000-000000000003"), "sofia@lamerienda.com", "Sofia", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("44444444-4444-4444-4444-444444444444"), 1 },
                    { new Guid("50000000-0000-0000-0000-000000000000"), "admin@bellaitalia.com", "Admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("55555555-5555-5555-5555-555555555555"), 0 },
                    { new Guid("60000000-0000-0000-0000-000000000000"), "admin@cordonbeer.com", "Admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("66666666-6666-6666-6666-666666666666"), 0 },
                    { new Guid("60000000-0000-0000-0000-000000000003"), "mesero1@cordonbeer.com", "Mesero 1", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("66666666-6666-6666-6666-666666666666"), 1 },
                    { new Guid("60000000-0000-0000-0000-000000000004"), "mesero2@cordonbeer.com", "Mesero 2", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("66666666-6666-6666-6666-666666666666"), 1 },
                    { new Guid("60000000-0000-0000-0000-000000000005"), "mesero3@cordonbeer.com", "Mesero 3", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("66666666-6666-6666-6666-666666666666"), 1 }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "CodigoAcceso", "Estado", "MozoId", "Numero", "RestauranteId", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("88888888-8888-8888-8888-000000000001"), null, 0, new Guid("30000000-0000-0000-0000-000000000001"), 1, new Guid("33333333-3333-3333-3333-333333333333"), "PASIVA_QR_1", "Mesa principal entrada" },
                    { new Guid("88888888-8888-8888-8888-000000000002"), null, 0, new Guid("30000000-0000-0000-0000-000000000001"), 2, new Guid("33333333-3333-3333-3333-333333333333"), "PASIVA_QR_2", "Mesa redonda en el centro" },
                    { new Guid("88888888-8888-8888-8888-000000000003"), null, 0, new Guid("30000000-0000-0000-0000-000000000002"), 3, new Guid("33333333-3333-3333-3333-333333333333"), "PASIVA_QR_3", "Box familiar derecha" },
                    { new Guid("88888888-8888-8888-8888-000000000004"), null, 0, new Guid("30000000-0000-0000-0000-000000000002"), 4, new Guid("33333333-3333-3333-3333-333333333333"), "PASIVA_QR_4", "Ambiente intimo al fondo" },
                    { new Guid("88888888-8888-8888-8888-000000000005"), null, 0, new Guid("30000000-0000-0000-0000-000000000003"), 5, new Guid("33333333-3333-3333-3333-333333333333"), "PASIVA_QR_5", "Sector fumadores terraza" },
                    { new Guid("88888888-8888-8888-8888-000000000006"), null, 0, new Guid("40000000-0000-0000-0000-000000000001"), 1, new Guid("44444444-4444-4444-4444-444444444444"), "MERIENDA_QR_1", "Ventana luminosa" },
                    { new Guid("88888888-8888-8888-8888-000000000007"), null, 0, new Guid("40000000-0000-0000-0000-000000000002"), 2, new Guid("44444444-4444-4444-4444-444444444444"), "MERIENDA_QR_2", "Sofa grande" },
                    { new Guid("88888888-8888-8888-8888-000000000008"), null, 0, new Guid("40000000-0000-0000-0000-000000000003"), 3, new Guid("44444444-4444-4444-4444-444444444444"), "MERIENDA_QR_3", "Rincon lectura" },
                    { new Guid("88888888-8888-8888-8888-000000000012"), null, 0, new Guid("60000000-0000-0000-0000-000000000003"), 2, new Guid("66666666-6666-6666-6666-666666666666"), "BEER_QR_2", "Mesa Alta" },
                    { new Guid("88888888-8888-8888-8888-000000000013"), null, 0, new Guid("60000000-0000-0000-0000-000000000005"), 3, new Guid("66666666-6666-6666-6666-666666666666"), "BEER_QR_3", "Sector Pool" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000014"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000015"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000016"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000017"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000018"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000019"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000020"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000021"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000022"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000023"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000024"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000025"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000026"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000027"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("11111000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("11111000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("22222000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000001"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000002"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000003"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000004"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000005"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000006"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000007"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000008"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000009"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000010"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000011"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000012"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000013"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000000"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000000"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000000"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000000"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"));

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Activo", "Categoria", "Descripcion", "Nombre", "Precio", "RestauranteId" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000001"), true, "Bebidas", null, "Agua M.", 1500m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("30000000-0000-0000-0000-000000000002"), true, "Platos", null, "Milanesa", 8500m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("40000000-0000-0000-0000-000000000001"), true, "Pizzas", null, "Muzzarella", 9000m, new Guid("22222222-2222-2222-2222-222222222222") }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "CodigoAcceso", "Estado", "MozoId", "Numero", "RestauranteId", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), null, 0, null, 1, new Guid("11111111-1111-1111-1111-111111111111"), "MESA1_R1_QR", null },
                    { new Guid("10000000-0000-0000-0000-000000000002"), null, 0, null, 2, new Guid("11111111-1111-1111-1111-111111111111"), "MESA2_R1_QR", null },
                    { new Guid("20000000-0000-0000-0000-000000000001"), null, 0, null, 1, new Guid("22222222-2222-2222-2222-222222222222"), "MESA1_R2_QR", null }
                });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId", "Rol" },
                values: new object[] { "admin@sabor.com", "", new Guid("11111111-1111-1111-1111-111111111111"), 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId" },
                values: new object[] { "mozo@sabor.com", "", new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId", "Rol" },
                values: new object[] { "admin@roma.com", "", new Guid("22222222-2222-2222-2222-222222222222"), 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "NombreCompleto", "RestauranteId" },
                values: new object[] { "mozo@roma.com", "", new Guid("22222222-2222-2222-2222-222222222222") });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                columns: new[] { "NombreCompleto", "PasswordHash" },
                values: new object[] { "", "$2a$11$Z6n8yP..T08G5k5xOQ5B2ea6bM3oE8o1F5o.U4U.Qo.K5Zq6B.z.m" });
        }
    }
}
