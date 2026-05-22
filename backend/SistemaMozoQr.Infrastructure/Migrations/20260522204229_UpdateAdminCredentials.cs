using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaMozoQr.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin", "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin@r.com", "$2a$11$eGPDhy51VNdhBOm9/5zoBeTPuPW9QSYI7UIloW4dm1iyq.NYrK7eO" });
        }
    }
}
