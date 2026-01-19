using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmSaas.Api.Data.Migrations.Master
{
    /// <inheritdoc />
    public partial class MoveToDefaultSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Tenants",
                schema: "master",
                newName: "Tenants");

            migrationBuilder.RenameTable(
                name: "Permissions",
                schema: "master",
                newName: "Permissions");

            migrationBuilder.RenameTable(
                name: "AuditLogs",
                schema: "master",
                newName: "AuditLogs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "master");

            migrationBuilder.RenameTable(
                name: "Tenants",
                newName: "Tenants",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "Permissions",
                newName: "Permissions",
                newSchema: "master");

            migrationBuilder.RenameTable(
                name: "AuditLogs",
                newName: "AuditLogs",
                newSchema: "master");
        }
    }
}
