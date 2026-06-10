using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Nova.Maestros.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedCatalogosBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "maes",
                table: "empresa",
                columns: new[] { "id_empresa", "dia_inicio_semana", "estado", "existe_cobertura_tipo_venta", "nombre" },
                values: new object[,]
                {
                    { "CADENA", "Domingo", "Vigente", false, "Cadena" },
                    { "LUKERS", "Domingo", "Vigente", true, "Lukers" }
                });

            migrationBuilder.InsertData(
                schema: "maes",
                table: "permiso",
                columns: new[] { "clave", "accion", "modulo" },
                values: new object[,]
                {
                    { "APRO.TAREA.APROBAR", "Aprobar", "Aprobaciones" },
                    { "MAES.CATALOGO.LEER", "Leer", "Maestros" },
                    { "MAES.PARAMETRO.CONFIGURAR", "Configurar", "Maestros" },
                    { "MARC.MARCACION.LEER", "Leer", "Marc" },
                    { "ROL.ROL.ENVIAR", "Enviar", "Rol" },
                    { "ROL.ROL.LEER", "Leer", "Rol" },
                    { "SEGU.ROL.CONFIGURAR", "Configurar", "Seguridad" },
                    { "SEGU.USUARIO.CREAR", "Crear", "Seguridad" },
                    { "SEGU.USUARIO.LEER", "Leer", "Seguridad" }
                });

            migrationBuilder.InsertData(
                schema: "maes",
                table: "rol",
                columns: new[] { "id_rol", "ambito_permitido", "estado", "nivel_autoridad", "nombre" },
                values: new object[,]
                {
                    { "R-ADM", "Central", "Vigente", 100, "Administrador del Sistema" },
                    { "R-AR", "Central", "Vigente", 35, "Administración Retail" },
                    { "R-AV", "Central", "Vigente", 40, "Administración de Ventas" },
                    { "R-BIEN", "Central", "Vigente", 70, "Bienestar" },
                    { "R-EMP", "Tienda", "Vigente", 10, "Empleado" },
                    { "R-GG", "Central", "Vigente", 70, "Gerencia General" },
                    { "R-GG-SUP", "Central", "Vigente", 60, "GG Suplente" },
                    { "R-GT", "Tienda", "Vigente", 30, "Gerente Titular" },
                    { "R-GZ", "Zona", "Vigente", 50, "Gerente de Zona" },
                    { "R-SENIOR", "Tienda", "Vigente", 20, "Senior" }
                });

            migrationBuilder.InsertData(
                schema: "maes",
                table: "rol_permiso",
                columns: new[] { "clave_permiso", "id_rol" },
                values: new object[,]
                {
                    { "APRO.TAREA.APROBAR", "R-ADM" },
                    { "MAES.CATALOGO.LEER", "R-ADM" },
                    { "MAES.PARAMETRO.CONFIGURAR", "R-ADM" },
                    { "SEGU.ROL.CONFIGURAR", "R-ADM" },
                    { "SEGU.USUARIO.CREAR", "R-ADM" },
                    { "SEGU.USUARIO.LEER", "R-ADM" },
                    { "MARC.MARCACION.LEER", "R-EMP" },
                    { "APRO.TAREA.APROBAR", "R-GG" },
                    { "MAES.CATALOGO.LEER", "R-GG" },
                    { "ROL.ROL.ENVIAR", "R-GG" },
                    { "ROL.ROL.LEER", "R-GG" },
                    { "MARC.MARCACION.LEER", "R-GT" },
                    { "ROL.ROL.LEER", "R-GT" },
                    { "APRO.TAREA.APROBAR", "R-GZ" },
                    { "ROL.ROL.ENVIAR", "R-GZ" },
                    { "ROL.ROL.LEER", "R-GZ" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "maes",
                table: "empresa",
                keyColumn: "id_empresa",
                keyValue: "CADENA");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "empresa",
                keyColumn: "id_empresa",
                keyValue: "LUKERS");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-AR");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-AV");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-BIEN");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-GG-SUP");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-SENIOR");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "APRO.TAREA.APROBAR", "R-ADM" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "MAES.CATALOGO.LEER", "R-ADM" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "MAES.PARAMETRO.CONFIGURAR", "R-ADM" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "SEGU.ROL.CONFIGURAR", "R-ADM" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "SEGU.USUARIO.CREAR", "R-ADM" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "SEGU.USUARIO.LEER", "R-ADM" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "MARC.MARCACION.LEER", "R-EMP" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "APRO.TAREA.APROBAR", "R-GG" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "MAES.CATALOGO.LEER", "R-GG" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "ROL.ROL.ENVIAR", "R-GG" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "ROL.ROL.LEER", "R-GG" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "MARC.MARCACION.LEER", "R-GT" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "ROL.ROL.LEER", "R-GT" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "APRO.TAREA.APROBAR", "R-GZ" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "ROL.ROL.ENVIAR", "R-GZ" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol_permiso",
                keyColumns: new[] { "clave_permiso", "id_rol" },
                keyValues: new object[] { "ROL.ROL.LEER", "R-GZ" });

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "APRO.TAREA.APROBAR");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "MAES.CATALOGO.LEER");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "MAES.PARAMETRO.CONFIGURAR");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "MARC.MARCACION.LEER");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "ROL.ROL.ENVIAR");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "ROL.ROL.LEER");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "SEGU.ROL.CONFIGURAR");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "SEGU.USUARIO.CREAR");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "permiso",
                keyColumn: "clave",
                keyValue: "SEGU.USUARIO.LEER");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-ADM");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-EMP");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-GG");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-GT");

            migrationBuilder.DeleteData(
                schema: "maes",
                table: "rol",
                keyColumn: "id_rol",
                keyValue: "R-GZ");
        }
    }
}
