using Nova.Seguridad.Domain;
using Nova.SharedKernel;

namespace Nova.Seguridad.Application;

public sealed record AsignarRolRequest(
    Guid IdUsuario,
    string IdRol,
    TipoAmbito TipoAmbito,
    string? IdEmpresa,
    Guid? IdTienda,
    IReadOnlyList<Guid>? Zonas,
    string? Justificacion,
    DateOnly VigenciaDesde,
    DateOnly? VigenciaHasta);

public sealed record AsignacionResponse(Guid Id, string IdRol, TipoAmbito TipoAmbito, EstadoVigencia Estado);

/// <summary>Caso de uso CU-SEGU-03: asignar rol con ámbito a un usuario.</summary>
public sealed class AsignarRolHandler(
    IUsuarioRepository usuarios,
    IAsignacionRolAmbitoRepository asignaciones,
    IUnitOfWork uow)
{
    public async Task<Result<AsignacionResponse>> HandleAsync(AsignarRolRequest req, CancellationToken ct = default)
    {
        var usuario = await usuarios.ObtenerPorIdAsync(req.IdUsuario, ct);
        if (usuario is null)
            return Result.Failure<AsignacionResponse>(Error.NoEncontrado("Usuario no encontrado."));

        var creacion = AsignacionRolAmbito.Crear(
            req.IdUsuario, req.IdRol, req.TipoAmbito, req.IdEmpresa, req.IdTienda,
            req.Zonas, req.Justificacion, req.VigenciaDesde, req.VigenciaHasta);
        if (creacion.IsFailure)
            return Result.Failure<AsignacionResponse>(creacion.Error);

        var asignacion = creacion.Value;
        await asignaciones.AgregarAsync(asignacion, ct);

        // Primera asignación activa al usuario (sale de PENDIENTE_ASIGNACION).
        if (usuario.Estado == EstadoUsuario.PendienteAsignacion)
            usuario.Activar();

        await uow.SaveChangesAsync(ct);
        return Result.Success(new AsignacionResponse(asignacion.Id, asignacion.IdRol, asignacion.TipoAmbito, asignacion.Estado));
    }
}
