using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAuthAndDashboardParams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_MenuItems_MenuItemId",
                table: "PedidoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_Pedidos_PedidoId",
                table: "PedidoItems");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Usuarios",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "UsuarioEmail",
                table: "Auditorias",
                newName: "UsuarioUsername");

            migrationBuilder.AddColumn<int>(
                name: "RolId",
                table: "Usuarios",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "DashboardWidgetConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    WidgetKey = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Orden = table.Column<int>(type: "INTEGER", nullable: false),
                    Activo = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DashboardWidgetConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "DashboardWidgetConfigs",
                columns: new[] { "Id", "Activo", "Orden", "RestauranteId", "WidgetKey" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000001"), true, 1, new Guid("11111111-1111-1111-1111-111111111111"), "KPI_Ventas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000002"), true, 2, new Guid("11111111-1111-1111-1111-111111111111"), "KPI_Pedidos" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000003"), true, 3, new Guid("11111111-1111-1111-1111-111111111111"), "KPI_Llamados" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000004"), true, 4, new Guid("11111111-1111-1111-1111-111111111111"), "KPI_Alertas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000005"), true, 5, new Guid("11111111-1111-1111-1111-111111111111"), "StaffPerformance" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000006"), true, 6, new Guid("11111111-1111-1111-1111-111111111111"), "TopTables" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000007"), true, 7, new Guid("11111111-1111-1111-1111-111111111111"), "PeakHours" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000008"), true, 1, new Guid("22222222-2222-2222-2222-222222222222"), "KPI_Ventas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000009"), true, 2, new Guid("22222222-2222-2222-2222-222222222222"), "KPI_Pedidos" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000010"), true, 3, new Guid("22222222-2222-2222-2222-222222222222"), "KPI_Llamados" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000011"), true, 4, new Guid("22222222-2222-2222-2222-222222222222"), "KPI_Alertas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000012"), true, 5, new Guid("22222222-2222-2222-2222-222222222222"), "StaffPerformance" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000013"), true, 6, new Guid("22222222-2222-2222-2222-222222222222"), "TopTables" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000014"), true, 7, new Guid("22222222-2222-2222-2222-222222222222"), "PeakHours" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000015"), true, 1, new Guid("33333333-3333-3333-3333-333333333333"), "KPI_Ventas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000016"), true, 2, new Guid("33333333-3333-3333-3333-333333333333"), "KPI_Pedidos" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000017"), true, 3, new Guid("33333333-3333-3333-3333-333333333333"), "KPI_Llamados" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000018"), true, 4, new Guid("33333333-3333-3333-3333-333333333333"), "KPI_Alertas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000019"), true, 5, new Guid("33333333-3333-3333-3333-333333333333"), "StaffPerformance" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000020"), true, 6, new Guid("33333333-3333-3333-3333-333333333333"), "TopTables" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000021"), true, 7, new Guid("33333333-3333-3333-3333-333333333333"), "PeakHours" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000022"), true, 1, new Guid("44444444-4444-4444-4444-444444444444"), "KPI_Ventas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000023"), true, 2, new Guid("44444444-4444-4444-4444-444444444444"), "KPI_Pedidos" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000024"), true, 3, new Guid("44444444-4444-4444-4444-444444444444"), "KPI_Llamados" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000025"), true, 4, new Guid("44444444-4444-4444-4444-444444444444"), "KPI_Alertas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000026"), true, 5, new Guid("44444444-4444-4444-4444-444444444444"), "StaffPerformance" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000027"), true, 6, new Guid("44444444-4444-4444-4444-444444444444"), "TopTables" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000028"), true, 7, new Guid("44444444-4444-4444-4444-444444444444"), "PeakHours" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000029"), true, 1, new Guid("55555555-5555-5555-5555-555555555555"), "KPI_Ventas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000030"), true, 2, new Guid("55555555-5555-5555-5555-555555555555"), "KPI_Pedidos" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000031"), true, 3, new Guid("55555555-5555-5555-5555-555555555555"), "KPI_Llamados" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000032"), true, 4, new Guid("55555555-5555-5555-5555-555555555555"), "KPI_Alertas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000033"), true, 5, new Guid("55555555-5555-5555-5555-555555555555"), "StaffPerformance" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000034"), true, 6, new Guid("55555555-5555-5555-5555-555555555555"), "TopTables" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000035"), true, 7, new Guid("55555555-5555-5555-5555-555555555555"), "PeakHours" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000036"), true, 1, new Guid("66666666-6666-6666-6666-666666666666"), "KPI_Ventas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000037"), true, 2, new Guid("66666666-6666-6666-6666-666666666666"), "KPI_Pedidos" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000038"), true, 3, new Guid("66666666-6666-6666-6666-666666666666"), "KPI_Llamados" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000039"), true, 4, new Guid("66666666-6666-6666-6666-666666666666"), "KPI_Alertas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000040"), true, 5, new Guid("66666666-6666-6666-6666-666666666666"), "StaffPerformance" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000041"), true, 6, new Guid("66666666-6666-6666-6666-666666666666"), "TopTables" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000042"), true, 7, new Guid("66666666-6666-6666-6666-666666666666"), "PeakHours" }
                });

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000014"),
                column: "Nombre",
                value: "Agua Mineral");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000015"),
                column: "Nombre",
                value: "Milanesa con Papas Fritas");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000016"),
                column: "Nombre",
                value: "Pizza Muzzarella");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000023"),
                column: "Nombre",
                value: "Ravioles de espinaca con salsa");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000025"),
                column: "Nombre",
                value: "Cerveza IPA Cordon");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000026"),
                column: "Nombre",
                value: "Hamburguesa Completa con Fritas");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 1, "Mozo del restaurante", "Mozo" },
                    { 2, "Administrador del restaurante", "Admin" },
                    { 3, "Super Administrador global del sistema", "SuperAdmin" },
                    { 4, "Personal de cocina", "Cocina" }
                });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "NombreCompleto", "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "Admin Sabor", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 2, 2, "adminsabor" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "NombreCompleto", "PasswordHash", "RolId", "Username" },
                values: new object[] { "Mozo Sabor", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozosabor" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                columns: new[] { "NombreCompleto", "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "Admin Roma", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 2, 2, "adminroma" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                columns: new[] { "NombreCompleto", "PasswordHash", "RolId", "Username" },
                values: new object[] { "Mozo Roma", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozoroma" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000000"),
                columns: new[] { "NombreCompleto", "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "Admin Pasiva", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 2, 2, "adminlapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo1lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo2lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000003"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo3lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000004"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo4lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000005"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo5lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000006"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo6lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000007"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo7lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000008"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo8lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000009"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo9lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000010"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mozo10lapasiva" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000000"),
                columns: new[] { "NombreCompleto", "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "Admin Merienda", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 2, 2, "adminlamerienda" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000001"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "lucialamerienda" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000002"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mateolamerienda" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000003"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "sofialamerienda" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000000"),
                columns: new[] { "NombreCompleto", "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "Admin Bella Italia", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 2, 2, "adminbellaitalia" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000001"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mariobellaitalia" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000002"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "luigibellaitalia" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000000"),
                columns: new[] { "NombreCompleto", "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "Admin Cordon Beer", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 2, 2, "admincordonbeer" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000001"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "bartender1cordonbeer" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000002"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "bartender2cordonbeer" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000003"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mesero1cordonbeer" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000004"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mesero2cordonbeer" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000005"),
                columns: new[] { "PasswordHash", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, "mesero3cordonbeer" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999998"),
                columns: new[] { "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 3, 3, "tizisuper" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                columns: new[] { "PasswordHash", "Rol", "RolId", "Username" },
                values: new object[] { "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 3, 3, "supergino" });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_RolId",
                table: "Usuarios",
                column: "RolId");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_MenuItems_MenuItemId",
                table: "PedidoItems",
                column: "MenuItemId",
                principalTable: "MenuItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_Pedidos_PedidoId",
                table: "PedidoItems",
                column: "PedidoId",
                principalTable: "Pedidos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Roles_RolId",
                table: "Usuarios",
                column: "RolId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_MenuItems_MenuItemId",
                table: "PedidoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_Pedidos_PedidoId",
                table: "PedidoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Roles_RolId",
                table: "Usuarios");

            migrationBuilder.DropTable(
                name: "DashboardWidgetConfigs");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_RolId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "RolId",
                table: "Usuarios");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "Usuarios",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "UsuarioUsername",
                table: "Auditorias",
                newName: "UsuarioEmail");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000014"),
                column: "Nombre",
                value: "Agua M.");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000015"),
                column: "Nombre",
                value: "Milanesa");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000016"),
                column: "Nombre",
                value: "Muzzarella");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000023"),
                column: "Nombre",
                value: "Ravioles de espinaca");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000025"),
                column: "Nombre",
                value: "IPA Cordon");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000026"),
                column: "Nombre",
                value: "Hamburguesa Completa");

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { "admin@sabor.com", "Admin", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa", 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash" },
                values: new object[] { "mozo@sabor.com", "Mozo", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { "admin@roma.com", "Admin", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa", 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash" },
                values: new object[] { "mozo@roma.com", "Mozo", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000000"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { "admin@lapasiva.com", "Admin", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa", 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo1@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo2@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000003"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo3@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000004"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo4@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000005"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo5@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000006"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo6@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000007"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo7@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000008"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo8@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000009"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo9@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000010"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mozo10@lapasiva.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000000"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { "admin@lamerienda.com", "Admin", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa", 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "lucia@lamerienda.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mateo@lamerienda.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000003"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "sofia@lamerienda.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000000"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { "admin@bellaitalia.com", "Admin", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa", 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mario@bellaitalia.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "luigi@bellaitalia.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000000"),
                columns: new[] { "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { "admin@cordonbeer.com", "Admin", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa", 0 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000001"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "bartender1@cordonbeer.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000002"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "bartender2@cordonbeer.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000003"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mesero1@cordonbeer.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000004"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mesero2@cordonbeer.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("60000000-0000-0000-0000-000000000005"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "mesero3@cordonbeer.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999998"),
                columns: new[] { "Email", "PasswordHash", "Rol" },
                values: new object[] { "tizi@super.com", "$2a$11$zieF/dteFcfxg9Bj5LdddeUPIFuF9N3IoWtslgPMjbTNRl1ArdeL.", 2 });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                columns: new[] { "Email", "PasswordHash", "Rol" },
                values: new object[] { "super@gino.com", "$2a$11$.bOXz4wVNeNh2KImM1g79O/TmlQsZ44j0ZvBrSSp2GRn0pFys2jpa", 2 });

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_MenuItems_MenuItemId",
                table: "PedidoItems",
                column: "MenuItemId",
                principalTable: "MenuItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_Pedidos_PedidoId",
                table: "PedidoItems",
                column: "PedidoId",
                principalTable: "Pedidos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
