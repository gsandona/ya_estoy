using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveColorAndAddIconAndParent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorPrincipal",
                table: "Restaurantes");

            migrationBuilder.AddColumn<string>(
                name: "IconoPrincipal",
                table: "Restaurantes",
                
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentRestauranteId",
                table: "Restaurantes",
                
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "IconoPrincipal", "ParentRestauranteId" },
                values: new object[] { "???", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "IconoPrincipal", "ParentRestauranteId" },
                values: new object[] { "??", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "IconoPrincipal", "ParentRestauranteId" },
                values: new object[] { "??", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "IconoPrincipal", "ParentRestauranteId" },
                values: new object[] { "?", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "IconoPrincipal", "ParentRestauranteId" },
                values: new object[] { "??", null });

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "IconoPrincipal", "ParentRestauranteId" },
                values: new object[] { "??", null });

            migrationBuilder.CreateIndex(
                name: "IX_Restaurantes_ParentRestauranteId",
                table: "Restaurantes",
                column: "ParentRestauranteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Restaurantes_Restaurantes_ParentRestauranteId",
                table: "Restaurantes",
                column: "ParentRestauranteId",
                principalTable: "Restaurantes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Restaurantes_Restaurantes_ParentRestauranteId",
                table: "Restaurantes");

            migrationBuilder.DropIndex(
                name: "IX_Restaurantes_ParentRestauranteId",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "IconoPrincipal",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "ParentRestauranteId",
                table: "Restaurantes");

            migrationBuilder.AddColumn<string>(
                name: "ColorPrincipal",
                table: "Restaurantes",
                
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "ColorPrincipal",
                value: "#1E3A8A");

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "ColorPrincipal",
                value: "#B91C1C");

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "ColorPrincipal",
                value: "#ffc107");

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "ColorPrincipal",
                value: "#ff6b6b");

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "ColorPrincipal",
                value: "#10b981");

            migrationBuilder.UpdateData(
                table: "Restaurantes",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "ColorPrincipal",
                value: "#f59e0b");
        }
    }
}
