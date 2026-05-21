using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SistemaMozoQr.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixStaticSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("37ccadfb-4f6e-415f-8f50-f38d52ab07d5"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("7bf63217-308d-480d-8d6f-4e972d14be48"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("09166452-1e63-4b0a-91e2-d81f4ef6bdc8"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("e458adbe-2dba-4cbc-83f5-b2119368acb1"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("f40eca01-3eea-4248-bcf0-27800ef6eac7"));

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Activo", "Categoria", "Descripcion", "Nombre", "Precio" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), true, "Bebidas", null, "Agua M.", 1500m },
                    { new Guid("44444444-4444-4444-4444-444444444444"), true, "Platos Principales", null, "Milanesa con Papas", 8500m }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "Estado", "MozoId", "Numero", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), 0, null, 1, "MESA1_QR_TOKEN", null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), 0, null, 2, "MESA2_QR_TOKEN", null }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { new Guid("55555555-5555-5555-5555-555555555555"), "admin@r.com", "Administrador", "$2a$11$eGPDhy51VNdhBOm9/5zoBeTPuPW9QSYI7UIloW4dm1iyq.NYrK7eO", 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"));

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Activo", "Categoria", "Descripcion", "Nombre", "Precio" },
                values: new object[,]
                {
                    { new Guid("37ccadfb-4f6e-415f-8f50-f38d52ab07d5"), true, "Bebidas", null, "Agua M.", 1500m },
                    { new Guid("7bf63217-308d-480d-8d6f-4e972d14be48"), true, "Platos Principales", null, "Milanesa con Papas", 8500m }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "Estado", "MozoId", "Numero", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("09166452-1e63-4b0a-91e2-d81f4ef6bdc8"), 0, null, 2, "MESA2_QR_TOKEN", null },
                    { new Guid("e458adbe-2dba-4cbc-83f5-b2119368acb1"), 0, null, 1, "MESA1_QR_TOKEN", null }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Email", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[] { new Guid("f40eca01-3eea-4248-bcf0-27800ef6eac7"), "admin@r.com", "Administrador", "$2a$11$8xTbO1kBpjLsgQxuvoeE3uAAAXrB2I4mYhhPHyGwdcFSlcgd7BwMu", 0 });
        }
    }
}
