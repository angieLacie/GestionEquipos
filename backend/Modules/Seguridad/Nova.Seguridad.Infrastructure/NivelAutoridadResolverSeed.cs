using Nova.Seguridad.Application;

namespace Nova.Seguridad.Infrastructure;

/// <summary>
/// Niveles de autoridad por rol (maes.rol_catalogo.nivel_autoridad). Semilla provisional
/// hasta que exista Maestros. Mayor número = mayor autoridad (RN-SEGU-28/31).
/// </summary>
internal sealed class NivelAutoridadResolverSeed(IAsignacionRolAmbitoRepository asignaciones) : INivelAutoridadResolver
{
    private static readonly Dictionary<string, int> Niveles = new(StringComparer.OrdinalIgnoreCase)
    {
        ["R-EMP"] = 10,
        ["R-SENIOR"] = 20,
        ["R-GT"] = 30,
        ["R-AR"] = 35,
        ["R-AV"] = 40,
        ["R-GZ"] = 50,
        ["R-GG-SUP"] = 60,
        ["R-GG"] = 70,
        ["R-BIEN"] = 70,
        ["R-ADM"] = 100
    };

    public Task<int> NivelDeRolAsync(string idRol, CancellationToken ct = default)
        => Task.FromResult(Niveles.TryGetValue(idRol, out var n) ? n : 0);

    public async Task<int> NivelMaximoDeUsuarioAsync(Guid idUsuario, DateOnly fecha, CancellationToken ct = default)
    {
        var vigentes = await asignaciones.ObtenerVigentesPorUsuarioAsync(idUsuario, fecha, ct);
        return vigentes
            .Select(a => Niveles.TryGetValue(a.IdRol, out var n) ? n : 0)
            .DefaultIfEmpty(0)
            .Max();
    }
}
