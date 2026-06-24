using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedTiziSuperAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Email", "NombreCompleto", "PasswordHash", "RestauranteId", "Rol" },
                values: new object[] { "99999999-9999-9999-9999-999999999998", "tizi@super.com", "Tizi Super Admin", "$2a$11$zieF/dteFcfxg9Bj5LdddeUPIFuF9N3IoWtslgPMjbTNRl1ArdeL.", "11111111-1111-1111-1111-111111111111", 2 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: "99999999-9999-9999-9999-999999999998");
        }
    }
}
