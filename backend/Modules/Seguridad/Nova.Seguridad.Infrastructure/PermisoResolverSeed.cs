using Nova.Seguridad.Application;

namespace Nova.Seguridad.Infrastructure;

/// <summary>
/// Adaptador temporal de <see cref="IPermisoResolver"/> con catálogo semilla en memoria.
/// Rol→permisos vive en maes.rol_permiso; se reemplazará por consulta a Maestros cuando exista.
/// </summary>
internal sealed class PermisoResolverSeed : IPermisoResolver
{
    // Subconjunto ilustrativo alineado a los roles del catálogo (maes.rol_catalogo) y
    // permisos MODULO.RECURSO.ACCION (SEGU §7.4). No es el catálogo definitivo.
    private static readonly Dictionary<string, string[]> RolPermisos = new(StringComparer.OrdinalIgnoreCase)
    {
        ["R-ADM"] = ["SEGU.USUARIO.CREAR", "SEGU.USUARIO.LEER", "SEGU.ROL.CONFIGURAR", "APRO.TAREA.APROBAR"],
        ["R-GG"]  = ["ROLP.ROL.ENVIAR", "ROLP.ROL.LEER", "APRO.TAREA.APROBAR"],
        ["R-GZ"]  = ["ROLP.ROL.ENVIAR", "ROLP.ROL.LEER", "APRO.TAREA.APROBAR"],
        ["R-GT"]  = ["ROLP.ROL.LEER", "MARC.MARCACION.LEER"],
        ["R-EMP"] = ["MARC.MARCACION.LEER"]
    };

    public Task<IReadOnlySet<string>> PermisosDeRolesAsync(IEnumerable<string> idRoles, CancellationToken ct = default)
    {
        var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var rol in idRoles)
            if (RolPermisos.TryGetValue(rol, out var permisos))
                set.UnionWith(permisos);

        return Task.FromResult<IReadOnlySet<string>>(set);
    }
}
