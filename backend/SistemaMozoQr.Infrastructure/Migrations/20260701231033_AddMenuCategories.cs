using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMenuCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MenuCategoryId",
                table: "MenuItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MenuCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Emoji = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ParentCategoryId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MenuCategories_MenuCategories_ParentCategoryId",
                        column: x => x.ParentCategoryId,
                        principalTable: "MenuCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "MenuCategories",
                columns: new[] { "Id", "Emoji", "Nombre", "ParentCategoryId" },
                values: new object[,]
                {
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000001"), "🍔", "Comidas", null },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000002"), "🍷", "Bebida con alcohol", null },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000003"), "🥤", "Bebida fria", null },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000004"), "🍰", "Postre", null },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000005"), "☕", "Bebidas calientes", null }
                });

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000014"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000015"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000016"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000017"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000018"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000019"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000020"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000021"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000022"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000023"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000024"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000025"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000026"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-000000000027"),
                column: "MenuCategoryId",
                value: null);

            migrationBuilder.InsertData(
                table: "MenuCategories",
                columns: new[] { "Id", "Emoji", "Nombre", "ParentCategoryId" },
                values: new object[,]
                {
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000011"), "🥗", "Entradas", new Guid("cccccccc-cccc-cccc-cccc-000000000001") },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000012"), "🍝", "Platos", new Guid("cccccccc-cccc-cccc-cccc-000000000001") },
                    { new Guid("cccccccc-cccc-cccc-cccc-000000000013"), "🍞", "Panes", new Guid("cccccccc-cccc-cccc-cccc-000000000001") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_MenuCategoryId",
                table: "MenuItems",
                column: "MenuCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuCategories_ParentCategoryId",
                table: "MenuCategories",
                column: "ParentCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_MenuItems_MenuCategories_MenuCategoryId",
                table: "MenuItems",
                column: "MenuCategoryId",
                principalTable: "MenuCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MenuItems_MenuCategories_MenuCategoryId",
                table: "MenuItems");

            migrationBuilder.DropTable(
                name: "MenuCategories");

            migrationBuilder.DropIndex(
                name: "IX_MenuItems_MenuCategoryId",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "MenuCategoryId",
                table: "MenuItems");
        }
    }
}
