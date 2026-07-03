using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPgSolidDbEngineeringAndNewRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ventas_RestauranteId",
                table: "Ventas");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_RestauranteId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Mesas_RestauranteId",
                table: "Mesas");

            migrationBuilder.InsertData(
                table: "DashboardWidgetConfigs",
                columns: new[] { "Id", "Activo", "Orden", "RestauranteId", "WidgetKey" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000043"), true, 1, new Guid("77777777-7777-7777-7777-777777777777"), "KPI_Ventas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000044"), true, 2, new Guid("77777777-7777-7777-7777-777777777777"), "KPI_Pedidos" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000045"), true, 3, new Guid("77777777-7777-7777-7777-777777777777"), "KPI_Llamados" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000046"), true, 4, new Guid("77777777-7777-7777-7777-777777777777"), "KPI_Alertas" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000047"), true, 5, new Guid("77777777-7777-7777-7777-777777777777"), "StaffPerformance" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000048"), true, 6, new Guid("77777777-7777-7777-7777-777777777777"), "TopTables" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000049"), true, 7, new Guid("77777777-7777-7777-7777-777777777777"), "PeakHours" }
                });

            migrationBuilder.InsertData(
                table: "Restaurantes",
                columns: new[] { "Id", "Activo", "FechaCreacion", "IconoPrincipal", "LogoUrl", "Nombre", "ParentRestauranteId" },
                values: new object[] { new Guid("77777777-7777-7777-7777-777777777777"), true, new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "🍕", null, "TuRestaurante", null });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 5, "Cajero del restaurante", "Caja" },
                    { 6, "Portal de selección para Mozos", "MozoPortal" }
                });

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Activo", "Categoria", "Descripcion", "MenuCategoryId", "Nombre", "Precio", "RestauranteId" },
                values: new object[,]
                {
                    { new Guid("77777000-0000-0000-0000-000000000011"), true, "Comidas", "Salsa de tomate, muzzarella y abundante pepperoni premium", new Guid("cccccccc-cccc-cccc-cccc-000000000012"), "Pizza Pepperoni", 750m, new Guid("77777777-7777-7777-7777-777777777777") },
                    { new Guid("77777000-0000-0000-0000-000000000012"), true, "Comidas", "Doble carne smash, queso cheddar, panceta crujiente y salsa secreta", new Guid("cccccccc-cccc-cccc-cccc-000000000012"), "Hamburguesa Especial", 680m, new Guid("77777777-7777-7777-7777-777777777777") },
                    { new Guid("77777000-0000-0000-0000-000000000013"), true, "Comidas", "Papas horneadas con romero y alioli casero", new Guid("cccccccc-cccc-cccc-cccc-000000000011"), "Papas Rústicas", 350m, new Guid("77777777-7777-7777-7777-777777777777") },
                    { new Guid("77777000-0000-0000-0000-000000000014"), true, "Bebidas", "Medida pinta, sabor lúpulo intenso", new Guid("cccccccc-cccc-cccc-cccc-000000000002"), "Cerveza IPA Artesanal", 420m, new Guid("77777777-7777-7777-7777-777777777777") },
                    { new Guid("77777000-0000-0000-0000-000000000015"), true, "Bebidas", "Botella individual fría", new Guid("cccccccc-cccc-cccc-cccc-000000000003"), "Refresco Cola 500ml", 250m, new Guid("77777777-7777-7777-7777-777777777777") },
                    { new Guid("77777000-0000-0000-0000-000000000016"), true, "Postres", "Con helado de crema americana", new Guid("cccccccc-cccc-cccc-cccc-000000000004"), "Volcán de Chocolate", 480m, new Guid("77777777-7777-7777-7777-777777777777") },
                    { new Guid("77777000-0000-0000-0000-000000000017"), true, "Bebidas", "Con espuma de leche y canela", new Guid("cccccccc-cccc-cccc-cccc-000000000005"), "Café Capuccino", 290m, new Guid("77777777-7777-7777-7777-777777777777") }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "NombreCompleto", "PasswordHash", "RestauranteId", "Rol", "RolId", "Username" },
                values: new object[,]
                {
                    { new Guid("70000000-0000-0000-0000-000000000000"), "Admin TuRestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 2, 2, "admin_turestaurante" },
                    { new Guid("70000000-0000-0000-0000-000000000001"), "Juan Pérez", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 1, 1, "mozo_juan" },
                    { new Guid("70000000-0000-0000-0000-000000000002"), "Pedro Gómez", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 1, 1, "mozo_pedro" },
                    { new Guid("70000000-0000-0000-0000-000000000003"), "María López", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 1, 1, "mozo_maria" },
                    { new Guid("70000000-0000-0000-0000-000000000004"), "Ana Silva", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 1, 1, "mozo_ana" },
                    { new Guid("70000000-0000-0000-0000-000000000005"), "Caja TuRestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 5, 5, "caja_turestaurante" },
                    { new Guid("70000000-0000-0000-0000-000000000006"), "Cocina TuRestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 4, 4, "cocina_turestaurante" },
                    { new Guid("70000000-0000-0000-0000-000000000007"), "Portal Mozo TuRestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", new Guid("77777777-7777-7777-7777-777777777777"), 6, 6, "mozo_portal_turestaurante" }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "CodigoAcceso", "Estado", "MontoConsumo", "MozoId", "Numero", "RestauranteId", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("77777000-0000-0000-0000-000000000001"), null, 0, null, new Guid("70000000-0000-0000-0000-000000000001"), 1, new Guid("77777777-7777-7777-7777-777777777777"), "TURESTAURANTE_QR_1", "Terraza Vista Calle" },
                    { new Guid("77777000-0000-0000-0000-000000000002"), null, 0, null, new Guid("70000000-0000-0000-0000-000000000002"), 2, new Guid("77777777-7777-7777-7777-777777777777"), "TURESTAURANTE_QR_2", "Salón Principal Ventana" },
                    { new Guid("77777000-0000-0000-0000-000000000003"), null, 0, null, new Guid("70000000-0000-0000-0000-000000000003"), 3, new Guid("77777777-7777-7777-7777-777777777777"), "TURESTAURANTE_QR_3", "Salón Centro" },
                    { new Guid("77777000-0000-0000-0000-000000000004"), null, 0, null, new Guid("70000000-0000-0000-0000-000000000004"), 4, new Guid("77777777-7777-7777-7777-777777777777"), "TURESTAURANTE_QR_4", "VIP Box" },
                    { new Guid("77777000-0000-0000-0000-000000000005"), null, 0, null, new Guid("70000000-0000-0000-0000-000000000001"), 5, new Guid("77777777-7777-7777-7777-777777777777"), "TURESTAURANTE_QR_5", "Barra Alta" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_RestauranteId_FechaHora",
                table: "Ventas",
                columns: new[] { "RestauranteId", "FechaHora" });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_RestauranteId_Status",
                table: "Tasks",
                columns: new[] { "RestauranteId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_MesaId_Estado",
                table: "Pedidos",
                columns: new[] { "MesaId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_RestauranteId_Numero",
                table: "Mesas",
                columns: new[] { "RestauranteId", "Numero" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_TokenQR",
                table: "Mesas",
                column: "TokenQR");

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_RestauranteId_Nombre",
                table: "MenuItems",
                columns: new[] { "RestauranteId", "Nombre" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ventas_RestauranteId_FechaHora",
                table: "Ventas");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_RestauranteId_Status",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_MesaId_Estado",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Mesas_RestauranteId_Numero",
                table: "Mesas");

            migrationBuilder.DropIndex(
                name: "IX_Mesas_TokenQR",
                table: "Mesas");

            migrationBuilder.DropIndex(
                name: "IX_MenuItems_RestauranteId_Nombre",
                table: "MenuItems");

            migrationBuilder.DeleteData(
                table: "DashboardWidgetConfigs",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000043"));

            migrationBuilder.DeleteData(
                table: "DashboardWidgetConfigs",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000044"));

            migrationBuilder.DeleteData(
                table: "DashboardWidgetConfigs",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000045"));

            migrationBuilder.DeleteData(
                table: "DashboardWidgetConfigs",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000046"));

            migrationBuilder.DeleteData(
                table: "DashboardWidgetConfigs",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000047"));

            migrationBuilder.DeleteData(
                table: "DashboardWidgetConfigs",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000048"));

            migrationBuilder.DeleteData(
                table: "DashboardWidgetConfigs",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-000000000049"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("77777000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000000"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("70000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"));

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_RestauranteId",
                table: "Ventas",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_RestauranteId",
                table: "Tasks",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_RestauranteId",
                table: "Mesas",
                column: "RestauranteId");
        }
    }
}
