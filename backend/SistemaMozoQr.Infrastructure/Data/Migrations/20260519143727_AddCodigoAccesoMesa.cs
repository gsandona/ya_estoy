using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCodigoAccesoMesa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodigoAcceso",
                table: "Mesas",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CodigoAcceso",
                value: null);

            migrationBuilder.UpdateData(
                table: "Mesas",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CodigoAcceso",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodigoAcceso",
                table: "Mesas");
        }
    }
}
