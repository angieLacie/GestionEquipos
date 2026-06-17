using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Maestros.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEstadoParametro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "estado",
                schema: "maes",
                table: "parametro",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "Activo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "estado",
                schema: "maes",
                table: "parametro");
        }
    }
}
