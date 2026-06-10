using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Rol.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitRol : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "rol");

            migrationBuilder.CreateTable(
                name: "historial_cambio_rol",
                schema: "rol",
                columns: table => new
                {
                    id_historial = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_rol = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_programacion = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    tipo_evento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    estado_anterior = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: true),
                    estado_nuevo = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    id_usuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    comentario = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fecha_evento = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_historial_cambio_rol", x => x.id_historial);
                });

            migrationBuilder.CreateTable(
                name: "rol_semanal",
                schema: "rol",
                columns: table => new
                {
                    id_rol = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    id_zona = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_tienda = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    anio = table.Column<int>(type: "int", nullable: false),
                    numero_semana = table.Column<int>(type: "int", nullable: false),
                    fecha_inicio = table.Column<DateOnly>(type: "date", nullable: false),
                    fecha_fin = table.Column<DateOnly>(type: "date", nullable: false),
                    puesto = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    estado = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    version = table.Column<int>(type: "int", nullable: false),
                    id_version_vigente = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    creado_por = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    fecha_creacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    enviado_por_gz = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    fecha_envio_gz = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    aprobado_por_gg = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    fecha_aprobacion_gg = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    programado_por_gt = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    fecha_programacion_gt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rol_semanal", x => x.id_rol);
                });

            migrationBuilder.CreateTable(
                name: "programacion_dia",
                schema: "rol",
                columns: table => new
                {
                    id_programacion = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_rol = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_colaborador = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    estado = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    id_tienda_cobertura = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    tipo_venta = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    id_concepto_compensacion = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    es_sugerencia_sistema = table.Column<bool>(type: "bit", nullable: false),
                    registrado_por = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    fecha_registro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_programacion_dia", x => x.id_programacion);
                    table.ForeignKey(
                        name: "FK_programacion_dia_rol_semanal_id_rol",
                        column: x => x.id_rol,
                        principalSchema: "rol",
                        principalTable: "rol_semanal",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_historial_rol_fecha",
                schema: "rol",
                table: "historial_cambio_rol",
                columns: new[] { "id_rol", "fecha_evento" });

            migrationBuilder.CreateIndex(
                name: "uk_programacion_colaborador_fecha",
                schema: "rol",
                table: "programacion_dia",
                columns: new[] { "id_rol", "id_colaborador", "fecha" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_rol_semana",
                schema: "rol",
                table: "rol_semanal",
                columns: new[] { "empresa", "id_zona", "anio", "numero_semana", "puesto" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "historial_cambio_rol",
                schema: "rol");

            migrationBuilder.DropTable(
                name: "programacion_dia",
                schema: "rol");

            migrationBuilder.DropTable(
                name: "rol_semanal",
                schema: "rol");
        }
    }
}
