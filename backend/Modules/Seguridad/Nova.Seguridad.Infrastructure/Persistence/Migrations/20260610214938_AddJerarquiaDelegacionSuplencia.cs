using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Seguridad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJerarquiaDelegacionSuplencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "delegacion",
                schema: "segu",
                columns: table => new
                {
                    id_delegacion = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_titular = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_delegado = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    alcance = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    detalle_alcance = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    tipo_ambito = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    id_ambito = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    vigencia_desde = table.Column<DateOnly>(type: "date", nullable: false),
                    vigencia_hasta = table.Column<DateOnly>(type: "date", nullable: true),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delegacion", x => x.id_delegacion);
                });

            migrationBuilder.CreateTable(
                name: "nodo_jerarquia",
                schema: "segu",
                columns: table => new
                {
                    id_nodo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_rol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    tipo_ambito = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    id_ambito = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    id_nodo_superior = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nodo_jerarquia", x => x.id_nodo);
                    table.ForeignKey(
                        name: "FK_nodo_jerarquia_nodo_jerarquia_id_nodo_superior",
                        column: x => x.id_nodo_superior,
                        principalSchema: "segu",
                        principalTable: "nodo_jerarquia",
                        principalColumn: "id_nodo");
                });

            migrationBuilder.CreateTable(
                name: "suplencia",
                schema: "segu",
                columns: table => new
                {
                    id_suplencia = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_rol_titular = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    id_usuario_titular = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    id_usuario_suplente = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    tipo_ambito = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    id_ambito = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    vigencia_desde = table.Column<DateOnly>(type: "date", nullable: false),
                    vigencia_hasta = table.Column<DateOnly>(type: "date", nullable: true),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_suplencia", x => x.id_suplencia);
                });

            migrationBuilder.CreateIndex(
                name: "idx_delegacion_delegado_estado",
                schema: "segu",
                table: "delegacion",
                columns: new[] { "id_delegado", "estado" });

            migrationBuilder.CreateIndex(
                name: "IX_nodo_jerarquia_id_nodo_superior",
                schema: "segu",
                table: "nodo_jerarquia",
                column: "id_nodo_superior");

            migrationBuilder.CreateIndex(
                name: "idx_suplencia_suplente_estado",
                schema: "segu",
                table: "suplencia",
                columns: new[] { "id_usuario_suplente", "estado" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "delegacion",
                schema: "segu");

            migrationBuilder.DropTable(
                name: "nodo_jerarquia",
                schema: "segu");

            migrationBuilder.DropTable(
                name: "suplencia",
                schema: "segu");
        }
    }
}
