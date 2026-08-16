using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddValoracionesAndRoleFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RoleFeatures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    FeatureKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleFeatures_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Valoraciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "uuid", nullable: false),
                    MesaId = table.Column<Guid>(type: "uuid", nullable: true),
                    MozoId = table.Column<Guid>(type: "uuid", nullable: true),
                    PuntajeGeneral = table.Column<int>(type: "integer", nullable: false),
                    PuntajeComida = table.Column<int>(type: "integer", nullable: false),
                    PuntajeMozo = table.Column<int>(type: "integer", nullable: false),
                    PuntajeServicio = table.Column<int>(type: "integer", nullable: false),
                    Comentario = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Valoraciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Valoraciones_Mesas_MesaId",
                        column: x => x.MesaId,
                        principalTable: "Mesas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Valoraciones_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Valoraciones_Usuarios_MozoId",
                        column: x => x.MozoId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "RoleFeatures",
                columns: new[] { "Id", "Activo", "FeatureKey", "RoleId" },
                values: new object[,]
                {
                    { new Guid("b0000000-0000-0000-0000-000000000001"), true, "Cocina", 5 },
                    { new Guid("b0000000-0000-0000-0000-000000000002"), true, "Ventas", 5 },
                    { new Guid("b0000000-0000-0000-0000-000000000003"), true, "ConfigPersonal", 5 },
                    { new Guid("c0000000-0000-0000-0000-000000000001"), true, "Cocina", 4 },
                    { new Guid("d0000000-0000-0000-0000-000000000001"), true, "MesasTareas", 1 },
                    { new Guid("e0000000-0000-0000-0000-000000000001"), true, "Metricas", 2 },
                    { new Guid("e0000000-0000-0000-0000-000000000002"), true, "MesasTareas", 2 },
                    { new Guid("e0000000-0000-0000-0000-000000000003"), true, "Cocina", 2 },
                    { new Guid("e0000000-0000-0000-0000-000000000004"), true, "Ventas", 2 },
                    { new Guid("e0000000-0000-0000-0000-000000000005"), true, "MetricasMenu", 2 },
                    { new Guid("e0000000-0000-0000-0000-000000000006"), true, "ConfigPersonal", 2 },
                    { new Guid("f0000000-0000-0000-0000-000000000001"), true, "Metricas", 3 },
                    { new Guid("f0000000-0000-0000-0000-000000000002"), true, "MesasTareas", 3 },
                    { new Guid("f0000000-0000-0000-0000-000000000003"), true, "Cocina", 3 },
                    { new Guid("f0000000-0000-0000-0000-000000000004"), true, "Ventas", 3 },
                    { new Guid("f0000000-0000-0000-0000-000000000005"), true, "MetricasMenu", 3 },
                    { new Guid("f0000000-0000-0000-0000-000000000006"), true, "ConfigPersonal", 3 },
                    { new Guid("f0000000-0000-0000-0000-000000000007"), true, "Sistema", 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoleFeatures_RoleId_FeatureKey",
                table: "RoleFeatures",
                columns: new[] { "RoleId", "FeatureKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Valoraciones_MesaId",
                table: "Valoraciones",
                column: "MesaId");

            migrationBuilder.CreateIndex(
                name: "IX_Valoraciones_MozoId",
                table: "Valoraciones",
                column: "MozoId");

            migrationBuilder.CreateIndex(
                name: "IX_Valoraciones_RestauranteId",
                table: "Valoraciones",
                column: "RestauranteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoleFeatures");

            migrationBuilder.DropTable(
                name: "Valoraciones");
        }
    }
}
