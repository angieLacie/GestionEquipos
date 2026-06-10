using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Seguridad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAsignacionRolAmbito : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "asignacion_rol_ambito",
                schema: "segu",
                columns: table => new
                {
                    id_asignacion = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_usuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_rol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    tipo_ambito = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    id_empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    id_tienda = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    justificacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    vigencia_desde = table.Column<DateOnly>(type: "date", nullable: false),
                    vigencia_hasta = table.Column<DateOnly>(type: "date", nullable: true),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    zonas = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asignacion_rol_ambito", x => x.id_asignacion);
                    table.ForeignKey(
                        name: "FK_asignacion_rol_ambito_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalSchema: "segu",
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_asignacion_usuario_estado",
                schema: "segu",
                table: "asignacion_rol_ambito",
                columns: new[] { "id_usuario", "estado" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asignacion_rol_ambito",
                schema: "segu");
        }
    }
}
