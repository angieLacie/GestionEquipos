using Nova.Seguridad.Domain;
using Nova.SharedKernel;

namespace Nova.Seguridad.Application;

public sealed record AutorizarRequest(Guid IdUsuario, string Permiso, AmbitoObjetivo Ambito);

public enum DecisionAutorizacion { Permitido, Denegado }

public sealed record AutorizarResponse(DecisionAutorizacion Decision, string? Motivo = null);

/// <summary>
/// Caso de uso CU-SEGU-05: enforcement permiso + ámbito (RN-SEGU-21/22).
/// Fallo seguro: cualquier error o ausencia de cobertura deniega (E1).
/// </summary>
public sealed class AutorizarHandler(
    IAsignacionRolAmbitoRepository asignaciones,
    IPermisoResolver permisos,
    IClock clock)
{
    public async Task<AutorizarResponse> HandleAsync(AutorizarRequest req, CancellationToken ct = default)
    {
        var hoy = DateOnly.FromDateTime(clock.Now.UtcDateTime);
        var vigentes = await asignaciones.ObtenerVigentesPorUsuarioAsync(req.IdUsuario, hoy, ct);
        if (vigentes.Count == 0)
            return new(DecisionAutorizacion.Denegado, "El usuario no tiene asignaciones vigentes.");

        // Solo las asignaciones cuyo ámbito cubre el objetivo pueden otorgar el permiso (RN-SEGU-22).
        var rolesQueCubren = vigentes
            .Where(a => a.CubreAmbito(req.Ambito))
            .Select(a => a.IdRol)
            .Distinct()
            .ToList();

        if (rolesQueCubren.Count == 0)
            return new(DecisionAutorizacion.Denegado, "Ámbito objetivo fuera del alcance del usuario.");

        var permisosUsuario = await permisos.PermisosDeRolesAsync(rolesQueCubren, ct);
        return permisosUsuario.Contains(req.Permiso)
            ? new(DecisionAutorizacion.Permitido)
            : new(DecisionAutorizacion.Denegado, $"Permiso ausente: {req.Permiso}.");
    }
}
