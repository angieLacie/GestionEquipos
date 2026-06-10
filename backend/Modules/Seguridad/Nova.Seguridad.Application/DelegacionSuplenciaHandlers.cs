using Nova.Seguridad.Domain;
using Nova.SharedKernel;

namespace Nova.Seguridad.Application;

public sealed record DelegarRequest(
    Guid IdTitular,
    Guid IdDelegado,
    string IdRolFacultad,
    AlcanceDelegacion Alcance,
    string? DetalleAlcance,
    TipoAmbito TipoAmbito,
    Guid? IdAmbito,
    DateOnly VigenciaDesde,
    DateOnly? VigenciaHasta);

public sealed record DesignarSuplenteRequest(
    string IdRolTitular,
    Guid? IdUsuarioTitular,
    Guid IdUsuarioSuplente,
    TipoAmbito TipoAmbito,
    Guid? IdAmbito,
    DateOnly VigenciaDesde,
    DateOnly? VigenciaHasta);

public sealed record VigenciaResponse(Guid Id, EstadoVigencia Estado);

/// <summary>CU-SEGU-06: delegar facultad temporalmente, con compatibilidad por autoridad (RN-SEGU-28).</summary>
public sealed class DelegarHandler(
    IUsuarioRepository usuarios,
    IDelegacionRepository delegaciones,
    INivelAutoridadResolver autoridad,
    IAuditoriaRepository auditoria,
    IClock clock,
    IUnitOfWork uow)
{
    public async Task<Result<VigenciaResponse>> HandleAsync(DelegarRequest req, CancellationToken ct = default)
    {
        if (await usuarios.ObtenerPorIdAsync(req.IdDelegado, ct) is null)
            return Result.Failure<VigenciaResponse>(Error.NoEncontrado("Usuario delegado no encontrado."));

        var hoy = DateOnly.FromDateTime(clock.Now.UtcDateTime);
        var nivelRequerido = await autoridad.NivelDeRolAsync(req.IdRolFacultad, ct);
        var nivelDelegado = await autoridad.NivelMaximoDeUsuarioAsync(req.IdDelegado, hoy, ct);

        var creacion = Delegacion.Crear(
            req.IdTitular, req.IdDelegado, req.Alcance, req.DetalleAlcance, req.TipoAmbito, req.IdAmbito,
            req.VigenciaDesde, req.VigenciaHasta, nivelDelegado, nivelRequerido);
        if (creacion.IsFailure)
            return Result.Failure<VigenciaResponse>(creacion.Error);

        var delegacion = creacion.Value;
        await delegaciones.AgregarAsync(delegacion, ct);
        await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
            EventoAudit.AsignacionRol, req.IdTitular, ResultadoAudit.Exitoso, clock.Now, delegacion.Id), ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new VigenciaResponse(delegacion.Id, delegacion.Estado));
    }
}

/// <summary>CU-SEGU-07: designar suplente de un rol, con compatibilidad de autoridad (RN-SEGU-31).</summary>
public sealed class DesignarSuplenteHandler(
    IUsuarioRepository usuarios,
    ISuplenciaRepository suplencias,
    INivelAutoridadResolver autoridad,
    IAuditoriaRepository auditoria,
    IClock clock,
    IUnitOfWork uow)
{
    public async Task<Result<VigenciaResponse>> HandleAsync(DesignarSuplenteRequest req, CancellationToken ct = default)
    {
        if (await usuarios.ObtenerPorIdAsync(req.IdUsuarioSuplente, ct) is null)
            return Result.Failure<VigenciaResponse>(Error.NoEncontrado("Usuario suplente no encontrado."));

        var hoy = DateOnly.FromDateTime(clock.Now.UtcDateTime);
        var nivelTitular = await autoridad.NivelDeRolAsync(req.IdRolTitular, ct);
        var nivelSuplente = await autoridad.NivelMaximoDeUsuarioAsync(req.IdUsuarioSuplente, hoy, ct);

        var creacion = Suplencia.Crear(
            req.IdRolTitular, req.IdUsuarioTitular, req.IdUsuarioSuplente, req.TipoAmbito, req.IdAmbito,
            req.VigenciaDesde, req.VigenciaHasta, nivelSuplente, nivelTitular);
        if (creacion.IsFailure)
            return Result.Failure<VigenciaResponse>(creacion.Error);

        var suplencia = creacion.Value;
        await suplencias.AgregarAsync(suplencia, ct);
        await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
            EventoAudit.AsignacionRol, req.IdUsuarioSuplente, ResultadoAudit.Exitoso, clock.Now, suplencia.Id), ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new VigenciaResponse(suplencia.Id, suplencia.Estado));
    }
}
