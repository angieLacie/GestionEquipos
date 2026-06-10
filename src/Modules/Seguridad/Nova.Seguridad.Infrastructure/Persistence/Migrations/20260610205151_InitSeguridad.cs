using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Seguridad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitSeguridad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "segu");

            migrationBuilder.CreateTable(
                name: "usuario",
                schema: "segu",
                columns: table => new
                {
                    id_usuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    nombre_usuario = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false, collation: "SQL_Latin1_General_CP1_CI_AI"),
                    tipo_usuario = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    codigo_empleado_rms = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    correo_contacto = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false, collation: "SQL_Latin1_General_CP1_CI_AI"),
                    estado = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    metodo_autenticacion = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    mfa_habilitado = table.Column<bool>(type: "bit", nullable: false),
                    fecha_alta = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    fecha_baja = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuario", x => x.id_usuario);
                });

            migrationBuilder.CreateTable(
                name: "credencial",
                schema: "segu",
                columns: table => new
                {
                    id_credencial = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_usuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    hash_password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    algoritmo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    fecha_ultimo_cambio = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    requiere_cambio = table.Column<bool>(type: "bit", nullable: false),
                    intentos_fallidos = table.Column<int>(type: "int", nullable: false),
                    bloqueado_hasta = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_credencial", x => x.id_credencial);
                    table.ForeignKey(
                        name: "FK_credencial_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalSchema: "segu",
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "uk_credencial_usuario",
                schema: "segu",
                table: "credencial",
                column: "id_usuario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uk_usuario_nombre",
                schema: "segu",
                table: "usuario",
                column: "nombre_usuario",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "credencial",
                schema: "segu");

            migrationBuilder.DropTable(
                name: "usuario",
                schema: "segu");
        }
    }
}
