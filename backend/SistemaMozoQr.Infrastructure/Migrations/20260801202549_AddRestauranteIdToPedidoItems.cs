using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRestauranteIdToPedidoItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RestauranteId",
                table: "PedidoItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.Sql("UPDATE \"PedidoItems\" SET \"RestauranteId\" = (SELECT \"RestauranteId\" FROM \"Pedidos\" WHERE \"Pedidos\".\"Id\" = \"PedidoItems\".\"PedidoId\");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RestauranteId",
                table: "PedidoItems");
        }
    }
}
