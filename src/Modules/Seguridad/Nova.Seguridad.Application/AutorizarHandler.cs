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
    IAuditoriaRepository auditoria,
    IClock clock,
    IUnitOfWork uow)
{
    public async Task<AutorizarResponse> HandleAsync(AutorizarRequest req, CancellationToken ct = default)
    {
        var hoy = DateOnly.FromDateTime(clock.Now.UtcDateTime);
        var vigentes = await asignaciones.ObtenerVigentesPorUsuarioAsync(req.IdUsuario, hoy, ct);
        if (vigentes.Count == 0)
            return await DenegarAsync(req, "El usuario no tiene asignaciones vigentes.", ct);

        // Solo las asignaciones cuyo ámbito cubre el objetivo pueden otorgar el permiso (RN-SEGU-22).
        var rolesQueCubren = vigentes
            .Where(a => a.CubreAmbito(req.Ambito))
            .Select(a => a.IdRol)
            .Distinct()
            .ToList();

        if (rolesQueCubren.Count == 0)
            return await DenegarAsync(req, "Ámbito objetivo fuera del alcance del usuario.", ct);

        var permisosUsuario = await permisos.PermisosDeRolesAsync(rolesQueCubren, ct);
        if (!permisosUsuario.Contains(req.Permiso))
            return await DenegarAsync(req, $"Permiso ausente: {req.Permiso}.", ct);

        return new(DecisionAutorizacion.Permitido);
    }

    // Las denegaciones sobre acciones críticas quedan auditadas (RN-SEGU-23).
    private async Task<AutorizarResponse> DenegarAsync(AutorizarRequest req, string motivo, CancellationToken ct)
    {
        await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
            EventoAudit.DenegacionAcceso, req.IdUsuario, ResultadoAudit.Denegado, clock.Now,
            detalle: $"{{\"permiso\":\"{req.Permiso}\",\"motivo\":\"{motivo}\"}}"), ct);
        await uow.SaveChangesAsync(ct);
        return new(DecisionAutorizacion.Denegado, motivo);
    }
}
