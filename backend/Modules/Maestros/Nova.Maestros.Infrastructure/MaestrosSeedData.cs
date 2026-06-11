using Microsoft.EntityFrameworkCore;
using Nova.Maestros.Domain;

namespace Nova.Maestros.Infrastructure;

/// <summary>
/// Catálogos base de Fase 0 (datos estáticos del negocio): empresas, roles funcionales con su
/// nivel de autoridad (RN-SEGU-28/31), permisos granulares y composición rol→permiso (RN-SEGU-04/21).
/// Sembrados vía HasData para que Seguridad resuelva RBAC y jerarquía contra Maestros.
/// </summary>
internal static class MaestrosSeedData
{
    public static void Seed(ModelBuilder b)
    {
        b.Entity<Empresa>().HasData(
            new { Codigo = "CADENA", Nombre = "Cadena", DiaInicioSemana = DiaSemana.Domingo, ExisteCoberturaTipoVenta = false, Estado = EstadoCatalogo.Vigente },
            new { Codigo = "LUKERS", Nombre = "Lukers", DiaInicioSemana = DiaSemana.Domingo, ExisteCoberturaTipoVenta = true, Estado = EstadoCatalogo.Vigente });

        // Roles funcionales (nivel: mayor número = mayor autoridad).
        (string cod, string nom, int nivel, AmbitoRol ambito)[] roles =
        [
            ("R-EMP", "Empleado", 10, AmbitoRol.Tienda),
            ("R-SENIOR", "Senior", 20, AmbitoRol.Tienda),
            ("R-GT", "Gerente Titular", 30, AmbitoRol.Tienda),
            ("R-AR", "Administración Retail", 35, AmbitoRol.Central),
            ("R-AV", "Administración de Ventas", 40, AmbitoRol.Central),
            ("R-GZ", "Gerente de Zona", 50, AmbitoRol.Zona),
            ("R-GG-SUP", "GG Suplente", 60, AmbitoRol.Central),
            ("R-GG", "Gerencia General", 70, AmbitoRol.Central),
            ("R-BIEN", "Bienestar", 70, AmbitoRol.Central),
            ("R-ADM", "Administrador del Sistema", 100, AmbitoRol.Central),
        ];
        b.Entity<Rol>().HasData(roles.Select(r => new
        {
            Codigo = r.cod,
            Nombre = r.nom,
            NivelAutoridad = r.nivel,
            AmbitoPermitido = r.ambito,
            Estado = EstadoCatalogo.Vigente
        }).ToArray());

        // Permisos granulares (MODULO.RECURSO.ACCION).
        (string clave, ModuloNova modulo, AccionPermiso accion)[] permisos =
        [
            ("SEGU.USUARIO.CREAR", ModuloNova.Seguridad, AccionPermiso.Crear),
            ("SEGU.USUARIO.LEER", ModuloNova.Seguridad, AccionPermiso.Leer),
            ("SEGU.ROL.CONFIGURAR", ModuloNova.Seguridad, AccionPermiso.Configurar),
            ("MAES.PARAMETRO.CONFIGURAR", ModuloNova.Maestros, AccionPermiso.Configurar),
            ("MAES.CATALOGO.LEER", ModuloNova.Maestros, AccionPermiso.Leer),
            ("APRO.TAREA.APROBAR", ModuloNova.Aprobaciones, AccionPermiso.Aprobar),
            ("ROL.ROL.ENVIAR", ModuloNova.Rol, AccionPermiso.Enviar),
            ("ROL.ROL.LEER", ModuloNova.Rol, AccionPermiso.Leer),
            ("MARC.MARCACION.LEER", ModuloNova.Marc, AccionPermiso.Leer),
        ];
        b.Entity<Permiso>().HasData(permisos.Select(p => new
        {
            Clave = p.clave,
            Modulo = p.modulo,
            Accion = p.accion
        }).ToArray());

        // Composición rol → permiso.
        (string rol, string permiso)[] rolPermisos =
        [
            ("R-ADM", "SEGU.USUARIO.CREAR"),
            ("R-ADM", "SEGU.USUARIO.LEER"),
            ("R-ADM", "SEGU.ROL.CONFIGURAR"),
            ("R-ADM", "MAES.PARAMETRO.CONFIGURAR"),
            ("R-ADM", "MAES.CATALOGO.LEER"),
            ("R-ADM", "APRO.TAREA.APROBAR"),
            ("R-GG", "ROL.ROL.ENVIAR"),
            ("R-GG", "ROL.ROL.LEER"),
            ("R-GG", "APRO.TAREA.APROBAR"),
            ("R-GG", "MAES.CATALOGO.LEER"),
            ("R-GZ", "ROL.ROL.ENVIAR"),
            ("R-GZ", "ROL.ROL.LEER"),
            ("R-GZ", "APRO.TAREA.APROBAR"),
            ("R-GT", "ROL.ROL.LEER"),
            ("R-GT", "MARC.MARCACION.LEER"),
            ("R-EMP", "MARC.MARCACION.LEER"),
        ];
        b.Entity<RolPermiso>().HasData(rolPermisos.Select(rp => new
        {
            IdRol = rp.rol,
            ClavePermiso = rp.permiso
        }).ToArray());

        // Empleados demo (base RMS) para poblar la grilla del Rol de Personal.
        // Guids fijos para que HasData sea determinista entre migraciones.
        (string id, string cod, string nom, string emp, string zona, string tienda, string cargo, CategoriaRol cat, EstadoEmpleado est)[] empleados =
        [
            ("a1000001-0000-0000-0000-000000000001", "E-0001", "Ana Torres",      "CADENA", "Zona Lima Norte", "Mega Plaza",   "Gerente Titular", CategoriaRol.GtAsesores,  EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-000000000002", "E-0002", "Luis Ramos",      "CADENA", "Zona Lima Norte", "Mega Plaza",   "Asesor",          CategoriaRol.GtAsesores,  EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-000000000003", "E-0003", "María Díaz",      "CADENA", "Zona Lima Norte", "Mega Plaza",   "Asesor Senior",   CategoriaRol.Seniors,     EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-000000000004", "E-0004", "Jorge Vega",      "CADENA", "Zona Lima Norte", "Plaza Norte",  "Asesor",          CategoriaRol.GtAsesores,  EstadoEmpleado.Vacaciones),
            ("a1000001-0000-0000-0000-000000000005", "E-0005", "Sofía Núñez",     "CADENA", "Zona Lima Norte", "Plaza Norte",  "Secretaria",      CategoriaRol.Secretarias, EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-000000000006", "E-0006", "Carlos Pérez",    "CADENA", "Zona Lima Sur",   "Jockey Plaza", "Asesor Senior",   CategoriaRol.Seniors,     EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-000000000007", "E-0007", "Lucía Flores",    "CADENA", "Zona Lima Sur",   "Jockey Plaza", "Asesor",          CategoriaRol.GtAsesores,  EstadoEmpleado.Descanso),
            ("a1000001-0000-0000-0000-000000000008", "E-0008", "Diego Salas",     "CADENA", "Zona Lima Sur",   "Jockey Plaza", "Auxiliar",        CategoriaRol.Auxiliares,  EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-000000000009", "E-0009", "Rosa Campos",     "LUKERS", "Zona Lima Sur",   "Jockey Plaza", "Sastre",          CategoriaRol.Sastres,     EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-00000000000a", "E-0010", "Pedro Quispe",    "LUKERS", "Zona Lima Norte", "Plaza Norte",  "Asesor",          CategoriaRol.GtAsesores,  EstadoEmpleado.Activo),
            ("a1000001-0000-0000-0000-00000000000b", "E-0011", "Elena Ríos",      "LUKERS", "Zona Lima Norte", "Plaza Norte",  "Asesor Senior",   CategoriaRol.Seniors,     EstadoEmpleado.Licencia),
            ("a1000001-0000-0000-0000-00000000000c", "E-0012", "Marco Aguilar",   "LUKERS", "Zona Lima Norte", "Mega Plaza",   "Auxiliar",        CategoriaRol.Auxiliares,  EstadoEmpleado.Activo),
        ];
        b.Entity<Empleado>().HasData(empleados.Select(e => new
        {
            Id = Guid.Parse(e.id),
            Codigo = e.cod,
            NombreCompleto = e.nom,
            IdEmpresa = e.emp,
            Zona = e.zona,
            Tienda = e.tienda,
            Cargo = e.cargo,
            Categoria = e.cat,
            Estado = e.est,
            Origen = OrigenDato.Rms,
            RmsSyncAt = (DateTimeOffset?)null
        }).ToArray());
    }
}
