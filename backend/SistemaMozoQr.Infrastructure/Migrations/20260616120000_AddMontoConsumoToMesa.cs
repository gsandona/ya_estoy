using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SistemaMozoQr.Infrastructure.Data;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Migrations
{
    [DbContext(typeof(RestauranteDbContext))]
    [Migration("20260616120000_AddMontoConsumoToMesa")]
    public partial class AddMontoConsumoToMesa : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MontoConsumo",
                table: "Mesas",
                type: "TEXT",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MontoConsumo",
                table: "Mesas");
        }
    }
}
