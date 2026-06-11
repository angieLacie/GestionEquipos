using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Nova.Maestros.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedTiendas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "maes",
                table: "tienda",
                columns: new[] { "id_tienda", "codigo", "dotacion_minima_asesores", "estado_operativo", "fecha_vigencia_dotacion", "id_empresa", "id_zona", "nombre", "origen", "rms_sync_at", "ubicacion" },
                values: new object[,]
                {
                    { new Guid("b2000002-0000-0000-0000-000000000001"), "T-CAD-001", 0, "Activa", null, "CADENA", null, "Mega Plaza", "Rms", null, "Cc" },
                    { new Guid("b2000002-0000-0000-0000-000000000002"), "T-CAD-002", 0, "Activa", null, "CADENA", null, "Plaza Norte", "Rms", null, "Cc" },
                    { new Guid("b2000002-0000-0000-0000-000000000003"), "T-CAD-003", 0, "Activa", null, "CADENA", null, "Jockey Plaza", "Rms", null, "Cc" },
                    { new Guid("b2000002-0000-0000-0000-000000000004"), "T-LUK-001", 0, "Activa", null, "LUKERS", null, "Mega Plaza", "Rms", null, "Cc" },
                    { new Guid("b2000002-0000-0000-0000-000000000005"), "T-LUK-002", 0, "Activa", null, "LUKERS", null, "Plaza Norte", "Rms", null, "Cc" },
                    { new Guid("b2000002-0000-0000-0000-000000000006"), "T-LUK-003", 0, "Activa", null, "LUKERS", null, "Jockey Plaza", "Rms", null, "Cc" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "maes",
                table: "tienda",
                keyColumn: "id_tienda",
                keyValue: new Guid("b2000002-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "tienda",
                keyColumn: "id_tienda",
                keyValue: new Guid("b2000002-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "tienda",
                keyColumn: "id_tienda",
                keyValue: new Guid("b2000002-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "tienda",
                keyColumn: "id_tienda",
                keyValue: new Guid("b2000002-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "tienda",
                keyColumn: "id_tienda",
                keyValue: new Guid("b2000002-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "tienda",
                keyColumn: "id_tienda",
                keyValue: new Guid("b2000002-0000-0000-0000-000000000006"));
        }
    }
}
