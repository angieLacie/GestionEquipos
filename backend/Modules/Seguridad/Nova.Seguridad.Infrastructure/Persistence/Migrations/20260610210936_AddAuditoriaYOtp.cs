using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nova.Seguridad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditoriaYOtp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "auditoria_seguridad",
                schema: "segu",
                columns: table => new
                {
                    id_log = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    evento = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    id_actor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_objeto = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    resultado = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    detalle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fecha_hora = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditoria_seguridad", x => x.id_log);
                });

            migrationBuilder.CreateTable(
                name: "codigo_otp",
                schema: "segu",
                columns: table => new
                {
                    id_codigo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    id_usuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    hash_codigo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    expira_en = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    intentos = table.Column<int>(type: "int", nullable: false),
                    max_intentos = table.Column<int>(type: "int", nullable: false),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    creado_en = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_codigo_otp", x => x.id_codigo);
                });

            migrationBuilder.CreateIndex(
                name: "idx_auditoria_actor_fecha",
                schema: "segu",
                table: "auditoria_seguridad",
                columns: new[] { "id_actor", "fecha_hora" });

            migrationBuilder.CreateIndex(
                name: "idx_otp_usuario_estado",
                schema: "segu",
                table: "codigo_otp",
                columns: new[] { "id_usuario", "estado" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "auditoria_seguridad",
                schema: "segu");

            migrationBuilder.DropTable(
                name: "codigo_otp",
                schema: "segu");
        }
    }
}
