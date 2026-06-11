using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Nova.Maestros.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEmpleado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "empleado",
                schema: "maes",
                columns: table => new
                {
                    id_empleado = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    codigo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    nombre_completo = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    id_empresa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    zona = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    tienda = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    cargo = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    categoria = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    estado = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    origen = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    rms_sync_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empleado", x => x.id_empleado);
                });

            migrationBuilder.InsertData(
                schema: "maes",
                table: "empleado",
                columns: new[] { "id_empleado", "cargo", "categoria", "codigo", "estado", "id_empresa", "nombre_completo", "origen", "rms_sync_at", "tienda", "zona" },
                values: new object[,]
                {
                    { new Guid("a1000001-0000-0000-0000-000000000001"), "Gerente Titular", "GtAsesores", "E-0001", "Activo", "CADENA", "Ana Torres", "Rms", null, "Mega Plaza", "Zona Lima Norte" },
                    { new Guid("a1000001-0000-0000-0000-000000000002"), "Asesor", "GtAsesores", "E-0002", "Activo", "CADENA", "Luis Ramos", "Rms", null, "Mega Plaza", "Zona Lima Norte" },
                    { new Guid("a1000001-0000-0000-0000-000000000003"), "Asesor Senior", "Seniors", "E-0003", "Activo", "CADENA", "María Díaz", "Rms", null, "Mega Plaza", "Zona Lima Norte" },
                    { new Guid("a1000001-0000-0000-0000-000000000004"), "Asesor", "GtAsesores", "E-0004", "Vacaciones", "CADENA", "Jorge Vega", "Rms", null, "Plaza Norte", "Zona Lima Norte" },
                    { new Guid("a1000001-0000-0000-0000-000000000005"), "Secretaria", "Secretarias", "E-0005", "Activo", "CADENA", "Sofía Núñez", "Rms", null, "Plaza Norte", "Zona Lima Norte" },
                    { new Guid("a1000001-0000-0000-0000-000000000006"), "Asesor Senior", "Seniors", "E-0006", "Activo", "CADENA", "Carlos Pérez", "Rms", null, "Jockey Plaza", "Zona Lima Sur" },
                    { new Guid("a1000001-0000-0000-0000-000000000007"), "Asesor", "GtAsesores", "E-0007", "Descanso", "CADENA", "Lucía Flores", "Rms", null, "Jockey Plaza", "Zona Lima Sur" },
                    { new Guid("a1000001-0000-0000-0000-000000000008"), "Auxiliar", "Auxiliares", "E-0008", "Activo", "CADENA", "Diego Salas", "Rms", null, "Jockey Plaza", "Zona Lima Sur" },
                    { new Guid("a1000001-0000-0000-0000-000000000009"), "Sastre", "Sastres", "E-0009", "Activo", "LUKERS", "Rosa Campos", "Rms", null, "Jockey Plaza", "Zona Lima Sur" },
                    { new Guid("a1000001-0000-0000-0000-00000000000a"), "Asesor", "GtAsesores", "E-0010", "Activo", "LUKERS", "Pedro Quispe", "Rms", null, "Plaza Norte", "Zona Lima Norte" },
                    { new Guid("a1000001-0000-0000-0000-00000000000b"), "Asesor Senior", "Seniors", "E-0011", "Licencia", "LUKERS", "Elena Ríos", "Rms", null, "Plaza Norte", "Zona Lima Norte" },
                    { new Guid("a1000001-0000-0000-0000-00000000000c"), "Auxiliar", "Auxiliares", "E-0012", "Activo", "LUKERS", "Marco Aguilar", "Rms", null, "Mega Plaza", "Zona Lima Norte" }
                });

            migrationBuilder.CreateIndex(
                name: "idx_empleado_empresa_categoria_estado",
                schema: "maes",
                table: "empleado",
                columns: new[] { "id_empresa", "categoria", "estado" });

            migrationBuilder.CreateIndex(
                name: "uk_empleado_codigo",
                schema: "maes",
                table: "empleado",
                column: "codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "empleado",
                schema: "maes");
        }
    }
}
