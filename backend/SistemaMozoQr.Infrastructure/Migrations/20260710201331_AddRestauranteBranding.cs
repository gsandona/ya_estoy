using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRestauranteBranding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorFondo",
                table: "Restaurantes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ColorPrimario",
                table: "Restaurantes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ColorSecundario",
                table: "Restaurantes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagenFondoUrl",
                table: "Restaurantes",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ColorFondo", "ColorPrimario", "ColorSecundario", "ImagenFondoUrl" },
                values: new object[] { "#f4f9f4", "#0f5132", "#198754", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "ColorFondo", "ColorPrimario", "ColorSecundario", "ImagenFondoUrl" },
                values: new object[] { "#f4f9f4", "#0f5132", "#198754", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "ColorFondo", "ColorPrimario", "ColorSecundario", "ImagenFondoUrl" },
                values: new object[] { "#fef2f2", "#b91c1c", "#dc2626", "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "ColorFondo", "ColorPrimario", "ColorSecundario", "ImagenFondoUrl" },
                values: new object[] { "#f4f9f4", "#0f5132", "#198754", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "ColorFondo", "ColorPrimario", "ColorSecundario", "ImagenFondoUrl" },
                values: new object[] { "#f4f9f4", "#0f5132", "#198754", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "ColorFondo", "ColorPrimario", "ColorSecundario", "ImagenFondoUrl" },
                values: new object[] { "#f4f9f4", "#0f5132", "#198754", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                columns: new[] { "ColorFondo", "ColorPrimario", "ColorSecundario", "IconoPrincipal", "ImagenFondoUrl" },
                values: new object[] { "#f4f9f4", "#0f5132", "#198754", "🍔", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorFondo",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "ColorPrimario",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "ColorSecundario",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "ImagenFondoUrl",
                table: "Restaurantes");

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "IconoPrincipal",
                value: "🍕");
        }
    }
}
