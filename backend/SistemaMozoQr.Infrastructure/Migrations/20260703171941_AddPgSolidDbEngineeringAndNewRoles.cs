using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPgSolidDbEngineeringAndNewRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Crear Índices Únicos y de Rendimiento
            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios",
                column: "Username",
                unique: true);

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
                name: "IX_Pedidos_RestauranteId",
                table: "Pedidos",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_MesaId",
                table: "Pedidos",
                column: "MesaId");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_RestauranteId_FechaHora",
                table: "Ventas",
                columns: new[] { "RestauranteId", "FechaHora" });

            // 2. Insertar Semillas de TuRestaurante
            var rest7Id = new Guid("77777777-7777-7777-7777-777777777777");

            migrationBuilder.InsertData(
                table: "Restaurantes",
                columns: new[] { "Id", "Nombre", "IconoPrincipal", "Activo", "FechaCreacion", "LogoUrl", "ParentRestauranteId" },
                values: new object[] { rest7Id, "TuRestaurante", "🍕", true, new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc), null, null });

            // Categorías de Menú
            migrationBuilder.InsertData(
                table: "MenuCategories",
                columns: new[] { "Id", "Nombre", "Emoji", "ParentCategoryId" },
                values: new object[,]
                {
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000011"), "Entradas", "🥗", new Guid("cccccccc-cccc-cccc-cccc-000000000001") },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000012"), "Platos", "🍝", new Guid("cccccccc-cccc-cccc-cccc-000000000001") },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000013"), "Panes", "🍞", new Guid("cccccccc-cccc-cccc-cccc-000000000001") }
                });

            // MenuItems
            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "RestauranteId", "Categoria", "Nombre", "Descripcion", "Precio", "Activo", "MenuCategoryId" },
                values: new object[,]
                {
                    { new Guid("77777000-0000-0000-0000-000000000011"), rest7Id, "Comidas", "Pizza Pepperoni", "Salsa de tomate, muzzarella y abundante pepperoni premium", 750m, true, new Guid("cccccccc-cccc-cccc-cccc-000000000012") },
                    { new Guid("77777000-0000-0000-0000-000000000012"), rest7Id, "Comidas", "Hamburguesa Especial", "Doble carne smash, queso cheddar, panceta crujiente y salsa secreta", 680m, true, new Guid("cccccccc-cccc-cccc-cccc-000000000012") },
                    { new Guid("77777000-0000-0000-0000-000000000013"), rest7Id, "Comidas", "Papas Rústicas", "Papas horneadas con romero y alioli casero", 350m, true, new Guid("cccccccc-cccc-cccc-cccc-000000000011") },
                    { new Guid("77777000-0000-0000-0000-000000000014"), rest7Id, "Bebidas", "Cerveza IPA Artesanal", "Medida pinta, sabor lúpulo intenso", 420m, true, null },
                    { new Guid("77777000-0000-0000-0000-000000000015"), rest7Id, "Bebidas", "Refresco Cola 500ml", "Botella individual fría", 250m, true, null },
                    { new Guid("77777000-0000-0000-0000-000000000016"), rest7Id, "Postres", "Volcán de Chocolate", "Con helado de crema americana", 480m, true, null },
                    { new Guid("77777000-0000-0000-0000-000000000017"), rest7Id, "Bebidas", "Café Capuccino", "Con espuma de leche y canela", 290m, true, null }
                });

            // Usuarios (Admin, Mozos, Caja, Cocina, Portal)
            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "NombreCompleto", "Username", "PasswordHash", "Rol", "RolId", "RestauranteId" },
                values: new object[,]
                {
                    { new Guid("70000000-0000-0000-0000-000000000000"), "Admin TuRestaurante", "admin_turestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 2, 2, rest7Id },
                    { new Guid("70000000-0000-0000-0000-000000000001"), "Juan Pérez", "mozo_juan", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, 1, rest7Id },
                    { new Guid("70000000-0000-0000-0000-000000000002"), "Pedro Gómez", "mozo_pedro", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, 1, rest7Id },
                    { new Guid("70000000-0000-0000-0000-000000000003"), "María López", "mozo_maria", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, 1, rest7Id },
                    { new Guid("70000000-0000-0000-0000-000000000004"), "Ana Silva", "mozo_ana", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 1, 1, rest7Id },
                    { new Guid("70000000-0000-0000-0000-000000000005"), "Caja TuRestaurante", "caja_turestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 5, 5, rest7Id },
                    { new Guid("70000000-0000-0000-0000-000000000006"), "Cocina TuRestaurante", "cocina_turestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 4, 4, rest7Id },
                    { new Guid("70000000-0000-0000-0000-000000000007"), "Portal Mozo TuRestaurante", "mozo_portal_turestaurante", "$2a$11$QZiZ0I01OY9YHmu28SD3puogxLv8eZr0bbrj8pUvL/eoVHeZRUgJm", 6, 6, rest7Id }
                });

            // Mesas
            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "Numero", "TokenQR", "Estado", "RestauranteId", "MozoId", "MontoConsumo", "CodigoAcceso", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("77777000-0000-0000-0000-000000000001"), 1, "MESA1_R7_QR", 0, rest7Id, null, null, null, null },
                    { new Guid("77777000-0000-0000-0000-000000000002"), 2, "MESA2_R7_QR", 0, rest7Id, null, null, null, null },
                    { new Guid("77777000-0000-0000-0000-000000000003"), 3, "MESA3_R7_QR", 0, rest7Id, null, null, null, null },
                    { new Guid("77777000-0000-0000-0000-000000000004"), 4, "MESA4_R7_QR", 0, rest7Id, null, null, null, null },
                    { new Guid("77777000-0000-0000-0000-000000000005"), 5, "MESA5_R7_QR", 0, rest7Id, null, null, null, null }
                });

            // DashboardWidgetConfigs
            migrationBuilder.InsertData(
                table: "DashboardWidgetConfigs",
                columns: new[] { "Id", "RestauranteId", "WidgetKey", "Orden", "Activo" },
                values: new object[,]
                {
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000001"), rest7Id, "ActiveTablesCount", 1, true },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000002"), rest7Id, "PendingTasksCount", 2, true },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000003"), rest7Id, "TopTables", 3, true },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000004"), rest7Id, "BusyTablesCount", 4, true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Usuarios_Username", table: "Usuarios");
            migrationBuilder.DropIndex(name: "IX_Mesas_RestauranteId_Numero", table: "Mesas");
            migrationBuilder.DropIndex(name: "IX_Mesas_TokenQR", table: "Mesas");
            migrationBuilder.DropIndex(name: "IX_Pedidos_RestauranteId", table: "Pedidos");
            migrationBuilder.DropIndex(name: "IX_Pedidos_MesaId", table: "Pedidos");
            migrationBuilder.DropIndex(name: "IX_Ventas_RestauranteId_FechaHora", table: "Ventas");

            var rest7Id = new Guid("77777777-7777-7777-7777-777777777777");
            migrationBuilder.DeleteData(table: "Restaurantes", keyColumn: "Id", keyValue: rest7Id);
        }
    }
}
