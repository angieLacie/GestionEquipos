using Nova.Maestros.Application;
using Nova.Seguridad.Application;

namespace Nova.Seguridad.Infrastructure;

/// <summary>
/// Adaptador de <see cref="IPermisoResolver"/> que delega en la superficie pública de Maestros
/// (maes.rol_permiso). Reemplaza al catálogo semilla en memoria.
/// </summary>
internal sealed class PermisoResolverMaestros(IConfiguracionMaestros maestros) : IPermisoResolver
{
    public Task<IReadOnlySet<string>> PermisosDeRolesAsync(IEnumerable<string> idRoles, CancellationToken ct = default)
        => maestros.PermisosDeRolesAsync(idRoles, ct);
}

/// <summary>
/// Adaptador de <see cref="INivelAutoridadResolver"/> que toma el nivel de autoridad del catálogo
/// de roles de Maestros (maes.rol.nivel_autoridad, RN-SEGU-28/31) y combina con las asignaciones
/// vigentes del usuario (que viven en Seguridad).
/// </summary>
internal sealed class NivelAutoridadResolverMaestros(
    IConfiguracionMaestros maestros,
    IAsignacionRolAmbitoRepository asignaciones) : INivelAutoridadResolver
{
    public Task<int> NivelDeRolAsync(string idRol, CancellationToken ct = default)
        => maestros.NivelDeRolAsync(idRol, ct);

    public async Task<int> NivelMaximoDeUsuarioAsync(Guid idUsuario, DateOnly fecha, CancellationToken ct = default)
    {
        var vigentes = await asignaciones.ObtenerVigentesPorUsuarioAsync(idUsuario, fecha, ct);
        var nivelMax = 0;
        foreach (var a in vigentes)
            nivelMax = Math.Max(nivelMax, await maestros.NivelDeRolAsync(a.IdRol, ct));
        return nivelMax;
    }
}
