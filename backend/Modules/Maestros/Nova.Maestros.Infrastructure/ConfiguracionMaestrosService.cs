using Nova.Maestros.Application;

namespace Nova.Maestros.Infrastructure;

/// <summary>
/// Implementación de la superficie pública de Maestros (<see cref="IConfiguracionMaestros"/>).
/// Lee de los repositorios internos del módulo; es el único punto de entrada cross-module.
/// </summary>
internal sealed class ConfiguracionMaestrosService(
    IPermisoRepository permisos,
    IRolRepository roles,
    IParametroRepository parametros) : IConfiguracionMaestros
{
    public async Task<IReadOnlySet<string>> PermisosDeRolesAsync(
        IEnumerable<string> idRoles, CancellationToken ct = default)
    {
        var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var idRol in idRoles.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var perms = await permisos.ListarPorRolAsync(idRol, ct);
            foreach (var p in perms)
                set.Add(p.Clave);
        }
        return set;
    }

    public async Task<int> NivelDeRolAsync(string idRol, CancellationToken ct = default)
    {
        var rol = await roles.ObtenerAsync(idRol, ct);
        return rol?.NivelAutoridad ?? 0;
    }

    public async Task<ParametroValor?> LookupParametroAsync(
        string clave, DateOnly fecha, string? idEmpresa = null, string? idAmbito = null, CancellationToken ct = default)
    {
        var p = await parametros.ObtenerVigenteAsync(clave, fecha, idEmpresa, idAmbito, ct);
        return p is null
            ? null
            : new ParametroValor(p.Clave, p.TipoDato, p.Unidad, p.Valor, p.CriticidadConsumo, p.VigenciaDesde);
    }
}
