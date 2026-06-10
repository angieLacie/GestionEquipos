using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Maestros.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitMaestros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "maes");

            migrationBuilder.CreateTable(
                name: "auditoria_config",
                schema: "maes",
                columns: table => new
                {
                    id_log = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    accion = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    elemento = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    valor_anterior = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    valor_nuevo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    vigencia_desde = table.Column<DateOnly>(type: "date", nullable: true),
                    id_actor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    justificacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fecha_hora = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditoria_config", x => x.id_log);
                });

            migrationBuilder.CreateTable(
                name: "empresa",
                schema: "maes",
                columns: table => new
                {
                    id_empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    dia_inicio_semana = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    existe_cobertura_tipo_venta = table.Column<bool>(type: "bit", nullable: false),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empresa", x => x.id_empresa);
                });

            migrationBuilder.CreateTable(
                name: "feriado",
                schema: "maes",
                columns: table => new
                {
                    id_feriado = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    alcance = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    origen = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    empresas_aplicables = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    compensable = table.Column<bool>(type: "bit", nullable: false),
                    vigencia_desde = table.Column<DateOnly>(type: "date", nullable: false),
                    vigencia_hasta = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_feriado", x => x.id_feriado);
                });

            migrationBuilder.CreateTable(
                name: "parametro",
                schema: "maes",
                columns: table => new
                {
                    id_parametro = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    clave = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    modulo = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    flujo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    nivel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    nombre_parametro = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    ambito = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    id_empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    id_ambito = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    tipo_dato = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    unidad = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    valor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    es_impacto_negocio = table.Column<bool>(type: "bit", nullable: false),
                    criticidad_consumo = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    vigencia_desde = table.Column<DateOnly>(type: "date", nullable: false),
                    vigencia_hasta = table.Column<DateOnly>(type: "date", nullable: true),
                    justificacion = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_parametro", x => x.id_parametro);
                });

            migrationBuilder.CreateTable(
                name: "permiso",
                schema: "maes",
                columns: table => new
                {
                    clave = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    modulo = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    accion = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permiso", x => x.clave);
                });

            migrationBuilder.CreateTable(
                name: "puesto",
                schema: "maes",
                columns: table => new
                {
                    id_puesto = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    codigo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    genera_ratios_senior = table.Column<bool>(type: "bit", nullable: false),
                    habilitado_senior = table.Column<bool>(type: "bit", nullable: false),
                    origen = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_puesto", x => x.id_puesto);
                });

            migrationBuilder.CreateTable(
                name: "rol",
                schema: "maes",
                columns: table => new
                {
                    id_rol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    nivel_autoridad = table.Column<int>(type: "int", nullable: false),
                    ambito_permitido = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rol", x => x.id_rol);
                });

            migrationBuilder.CreateTable(
                name: "semana_campania",
                schema: "maes",
                columns: table => new
                {
                    id_semana = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    desde = table.Column<DateOnly>(type: "date", nullable: false),
                    hasta = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_semana_campania", x => x.id_semana);
                });

            migrationBuilder.CreateTable(
                name: "tienda",
                schema: "maes",
                columns: table => new
                {
                    id_tienda = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    codigo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    id_empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    id_zona = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ubicacion = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    dotacion_minima_asesores = table.Column<int>(type: "int", nullable: false),
                    fecha_vigencia_dotacion = table.Column<DateOnly>(type: "date", nullable: true),
                    estado_operativo = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    origen = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    rms_sync_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tienda", x => x.id_tienda);
                });

            migrationBuilder.CreateTable(
                name: "zona",
                schema: "maes",
                columns: table => new
                {
                    id_zona = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    id_empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_zona", x => x.id_zona);
                });

            migrationBuilder.CreateTable(
                name: "ambito_feriado",
                schema: "maes",
                columns: table => new
                {
                    id_feriado = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    tipo_ambito = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    id_ambito = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ambito_feriado", x => new { x.id_feriado, x.tipo_ambito, x.id_ambito });
                    table.ForeignKey(
                        name: "FK_ambito_feriado_feriado_id_feriado",
                        column: x => x.id_feriado,
                        principalSchema: "maes",
                        principalTable: "feriado",
                        principalColumn: "id_feriado",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "rol_permiso",
                schema: "maes",
                columns: table => new
                {
                    id_rol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    clave_permiso = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rol_permiso", x => new { x.id_rol, x.clave_permiso });
                    table.ForeignKey(
                        name: "FK_rol_permiso_permiso_clave_permiso",
                        column: x => x.clave_permiso,
                        principalSchema: "maes",
                        principalTable: "permiso",
                        principalColumn: "clave",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_rol_permiso_rol_id_rol",
                        column: x => x.id_rol,
                        principalSchema: "maes",
                        principalTable: "rol",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_auditoria_config_elemento_fecha",
                schema: "maes",
                table: "auditoria_config",
                columns: new[] { "elemento", "fecha_hora" });

            migrationBuilder.CreateIndex(
                name: "idx_feriado_fecha",
                schema: "maes",
                table: "feriado",
                column: "fecha");

            migrationBuilder.CreateIndex(
                name: "idx_parametro_clave_ambito_vigencia",
                schema: "maes",
                table: "parametro",
                columns: new[] { "clave", "id_empresa", "id_ambito", "vigencia_desde" });

            migrationBuilder.CreateIndex(
                name: "uk_puesto_codigo",
                schema: "maes",
                table: "puesto",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_rol_permiso_clave_permiso",
                schema: "maes",
                table: "rol_permiso",
                column: "clave_permiso");

            migrationBuilder.CreateIndex(
                name: "idx_campania_empresa_desde",
                schema: "maes",
                table: "semana_campania",
                columns: new[] { "id_empresa", "desde" });

            migrationBuilder.CreateIndex(
                name: "idx_tienda_empresa_estado",
                schema: "maes",
                table: "tienda",
                columns: new[] { "id_empresa", "estado_operativo" });

            migrationBuilder.CreateIndex(
                name: "uk_tienda_codigo",
                schema: "maes",
                table: "tienda",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_zona_empresa",
                schema: "maes",
                table: "zona",
                column: "id_empresa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ambito_feriado",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "auditoria_config",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "empresa",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "parametro",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "puesto",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "rol_permiso",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "semana_campania",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "tienda",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "zona",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "feriado",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "permiso",
                schema: "maes");

            migrationBuilder.DropTable(
                name: "rol",
                schema: "maes");
        }
    }
}
