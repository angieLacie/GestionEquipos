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
    }
}
