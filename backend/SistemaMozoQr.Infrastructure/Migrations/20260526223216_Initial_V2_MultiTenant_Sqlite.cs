using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial_V2_MultiTenant_Sqlite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Restaurantes",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Nombre = table.Column<string>(nullable: false),
                    ColorPrincipal = table.Column<string>(nullable: false),
                    LogoUrl = table.Column<string>(nullable: true),
                    Activo = table.Column<bool>(nullable: false),
                    FechaCreacion = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Restaurantes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Key = table.Column<string>(nullable: false),
                    Value = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "Auditorias",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UsuarioEmail = table.Column<string>(nullable: true),
                    Accion = table.Column<string>(nullable: false),
                    Entidad = table.Column<string>(nullable: false),
                    EntidadId = table.Column<string>(nullable: false),
                    Detalles = table.Column<string>(nullable: false),
                    FechaHora = table.Column<DateTime>(nullable: false),
                    RestauranteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auditorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auditorias_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ErrorLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Mensaje = table.Column<string>(nullable: false),
                    StackTrace = table.Column<string>(nullable: false),
                    RutaAPI = table.Column<string>(nullable: false),
                    UsuarioInvolucrado = table.Column<string>(nullable: true),
                    FechaHora = table.Column<DateTime>(nullable: false),
                    RestauranteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErrorLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ErrorLogs_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MenuItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Categoria = table.Column<string>(maxLength: 100, nullable: false),
                    Nombre = table.Column<string>(maxLength: 200, nullable: false),
                    Precio = table.Column<decimal>(nullable: false),
                    Descripcion = table.Column<string>(maxLength: 500, nullable: true),
                    Activo = table.Column<bool>(nullable: false),
                    RestauranteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MenuItems_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    TableId = table.Column<int>(nullable: false),
                    Type = table.Column<string>(nullable: false),
                    Details = table.Column<string>(nullable: false),
                    Status = table.Column<string>(nullable: false),
                    CreatedAt = table.Column<DateTime>(nullable: false),
                    AssignedMozoId = table.Column<string>(nullable: true),
                    RestauranteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    NombreCompleto = table.Column<string>(maxLength: 100, nullable: false),
                    Email = table.Column<string>(maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(nullable: false),
                    Rol = table.Column<int>(nullable: false),
                    RestauranteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Mesas",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Numero = table.Column<int>(nullable: false),
                    Estado = table.Column<int>(nullable: false),
                    TokenQR = table.Column<string>(nullable: true),
                    Ubicacion = table.Column<string>(maxLength: 250, nullable: true),
                    MozoId = table.Column<Guid>(nullable: true),
                    CodigoAcceso = table.Column<string>(maxLength: 10, nullable: true),
                    RestauranteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mesas_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Mesas_Usuarios_MozoId",
                        column: x => x.MozoId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Pedidos",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    MesaId = table.Column<Guid>(nullable: false),
                    Estado = table.Column<int>(nullable: false),
                    Fecha = table.Column<DateTime>(nullable: false),
                    RestauranteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pedidos_Mesas_MesaId",
                        column: x => x.MesaId,
                        principalTable: "Mesas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Pedidos_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PedidoItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    PedidoId = table.Column<Guid>(nullable: false),
                    MenuItemId = table.Column<Guid>(nullable: false),
                    Cantidad = table.Column<int>(nullable: false),
                    PrecioUnitario = table.Column<decimal>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PedidoItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PedidoItems_MenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "MenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PedidoItems_Pedidos_PedidoId",
                        column: x => x.PedidoId,
                        principalTable: "Pedidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Restaurantes",
                columns: new[] { "Id", "Activo", "ColorPrincipal", "FechaCreacion", "LogoUrl", "Nombre" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), true, "#1E3A8A", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "El Gran Sabor" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), true, "#B91C1C", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "La Parrilla de Juan" }
                });

            migrationBuilder.InsertData(
                table: "SystemSettings",
                columns: new[] { "Key", "Value" },
                values: new object[] { "CleanupJobIntervalHours", "24" });

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Activo", "Categoria", "Descripcion", "Nombre", "Precio", "RestauranteId" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000001"), true, "Bebidas", null, "Agua M.", 1500m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("30000000-0000-0000-0000-000000000002"), true, "Platos", null, "Milanesa", 8500m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("40000000-0000-0000-0000-000000000001"), true, "Pizzas", null, "Muzzarella", 9000m, new Guid("22222222-2222-2222-2222-222222222222") }
                });

            migrationBuilder.InsertData(
                table: "Mesas",
                columns: new[] { "Id", "CodigoAcceso", "Estado", "MozoId", "Numero", "RestauranteId", "TokenQR", "Ubicacion" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), null, 0, null, 1, new Guid("11111111-1111-1111-1111-111111111111"), "MESA1_R1_QR", null },
                    { new Guid("10000000-0000-0000-0000-000000000002"), null, 0, null, 2, new Guid("11111111-1111-1111-1111-111111111111"), "MESA2_R1_QR", null },
                    { new Guid("20000000-0000-0000-0000-000000000001"), null, 0, null, 1, new Guid("22222222-2222-2222-2222-222222222222"), "MESA1_R2_QR", null }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Email", "NombreCompleto", "PasswordHash", "RestauranteId", "Rol" },
                values: new object[,]
                {
                    { new Guid("50000000-0000-0000-0000-000000000001"), "admin@sabor.com", "", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("11111111-1111-1111-1111-111111111111"), 0 },
                    { new Guid("50000000-0000-0000-0000-000000000002"), "mozo@sabor.com", "", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("11111111-1111-1111-1111-111111111111"), 1 },
                    { new Guid("60000000-0000-0000-0000-000000000001"), "admin@roma.com", "", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("22222222-2222-2222-2222-222222222222"), 0 },
                    { new Guid("60000000-0000-0000-0000-000000000002"), "mozo@roma.com", "", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", new Guid("22222222-2222-2222-2222-222222222222"), 1 },
                    { new Guid("99999999-9999-9999-9999-999999999999"), "super@gino.com", "", "$2a$11$Z6n8yP..T08G5k5xOQ5B2ea6bM3oE8o1F5o.U4U.Qo.K5Zq6B.z.m", new Guid("11111111-1111-1111-1111-111111111111"), 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Auditorias_RestauranteId",
                table: "Auditorias",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLogs_RestauranteId",
                table: "ErrorLogs",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_RestauranteId",
                table: "MenuItems",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_MozoId",
                table: "Mesas",
                column: "MozoId");

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_RestauranteId",
                table: "Mesas",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItems_MenuItemId",
                table: "PedidoItems",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItems_PedidoId",
                table: "PedidoItems",
                column: "PedidoId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_MesaId",
                table: "Pedidos",
                column: "MesaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_RestauranteId",
                table: "Pedidos",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_RestauranteId",
                table: "Tasks",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_RestauranteId",
                table: "Usuarios",
                column: "RestauranteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Auditorias");

            migrationBuilder.DropTable(
                name: "ErrorLogs");

            migrationBuilder.DropTable(
                name: "PedidoItems");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "MenuItems");

            migrationBuilder.DropTable(
                name: "Pedidos");

            migrationBuilder.DropTable(
                name: "Mesas");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Restaurantes");
        }
    }
}
