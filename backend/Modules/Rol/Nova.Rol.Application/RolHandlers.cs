using Nova.Rol.Domain;
using Nova.SharedKernel;

namespace Nova.Rol.Application;

/// <summary>CU-ROLP-01: el GZ crea/abre la programación semanal (estado En Edición).</summary>
public sealed class CrearRolHandler(IRolSemanalRepository roles, IHistorialRolRepository historial, IUnitOfWork uow)
{
    public async Task<Result<RolResponse>> HandleAsync(CrearRolRequest req, CancellationToken ct = default)
    {
        var result = RolSemanal.Crear(
            req.Empresa, req.ZonaId, req.TiendaId, req.Anio, req.NumeroSemana, req.FechaInicio, req.Puesto, req.CreadoPor);
        if (result.IsFailure)
            return Result.Failure<RolResponse>(result.Error);

        var rol = result.Value;
        await roles.AgregarAsync(rol, ct);
        await historial.AgregarAsync(HistorialCambioRol.Registrar(
            rol.Id, TipoEventoRol.Creacion, null, rol.Estado.ToString(), req.CreadoPor), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success(rol.ToResponse());
    }
}

/// <summary>CU-ROLP-03: programar/reasignar la celda de un colaborador en un día.</summary>
public sealed class ProgramarDiaHandler(IRolSemanalRepository roles, IHistorialRolRepository historial, IUnitOfWork uow)
{
    public async Task<Result<CeldaResponse>> HandleAsync(Guid idRol, ProgramarDiaRequest req, CancellationToken ct = default)
    {
        var rol = await roles.ObtenerAsync(idRol, ct);
        if (rol is null)
            return Result.Failure<CeldaResponse>(Error.NoEncontrado("Rol no encontrado."));

        var validacion = rol.ValidarCelda(req.Fecha, req.Estado, req.TiendaCoberturaId);
        if (validacion.IsFailure)
            return Result.Failure<CeldaResponse>(validacion.Error);

        // Upsert de la celda como entidad propia (evita conflictos de tracking del agregado).
        var dia = await roles.ObtenerCeldaAsync(idRol, req.ColaboradorId, req.Fecha, ct);
        if (dia is null)
        {
            dia = ProgramacionDia.Crear(
                idRol, req.ColaboradorId, req.Fecha, req.Estado,
                req.TiendaCoberturaId, req.TipoVenta, req.ConceptoCompensacionId, req.RegistradoPor);
            await roles.AgregarCeldaAsync(dia, ct);
        }
        else
        {
            dia.Reasignar(req.Estado, req.TiendaCoberturaId, req.TipoVenta, req.ConceptoCompensacionId, req.RegistradoPor);
        }

        await historial.AgregarAsync(HistorialCambioRol.Registrar(
            rol.Id, TipoEventoRol.Modificacion, null, req.Estado.ToString(), req.RegistradoPor, programacionDiaId: dia.Id), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success(new CeldaResponse(
            dia.Id, dia.ColaboradorId, dia.Fecha, dia.Estado, dia.TiendaCoberturaId, dia.TipoVenta));
    }
}

/// <summary>Transiciones del flujo de aprobación GZ → GG → GT (§6.2).</summary>
public sealed class TransicionRolHandler(IRolSemanalRepository roles, IHistorialRolRepository historial, IUnitOfWork uow)
{
    public Task<Result<RolResponse>> EnviarAsync(Guid idRol, EnviarRolRequest req, CancellationToken ct = default)
        => AplicarAsync(idRol, r => r.Enviar(req.GzId), TipoEventoRol.Envio, req.GzId, null, ct);

    public Task<Result<RolResponse>> AprobarAsync(Guid idRol, AprobarRolRequest req, CancellationToken ct = default)
        => AplicarAsync(idRol, r => r.Aprobar(req.GgId), TipoEventoRol.Aprobacion, req.GgId, null, ct);

    public Task<Result<RolResponse>> RechazarAsync(Guid idRol, RechazarRolRequest req, CancellationToken ct = default)
        => AplicarAsync(idRol, r => r.Rechazar(req.GgId, req.Comentario), TipoEventoRol.Rechazo, req.GgId, req.Comentario, ct);

    public Task<Result<RolResponse>> ProgramarGtAsync(Guid idRol, ProgramarGtRequest req, CancellationToken ct = default)
        => AplicarAsync(idRol, r => r.ProgramarGt(req.GtId), TipoEventoRol.ProgramacionGt, req.GtId, null, ct);

    private async Task<Result<RolResponse>> AplicarAsync(
        Guid idRol, Func<RolSemanal, Result> transicion, TipoEventoRol evento, Guid actor, string? comentario, CancellationToken ct)
    {
        var rol = await roles.ObtenerAsync(idRol, ct);
        if (rol is null)
            return Result.Failure<RolResponse>(Error.NoEncontrado("Rol no encontrado."));

        var estadoAnterior = rol.Estado.ToString();
        var result = transicion(rol);
        if (result.IsFailure)
            return Result.Failure<RolResponse>(result.Error);

        await historial.AgregarAsync(HistorialCambioRol.Registrar(
            rol.Id, evento, estadoAnterior, rol.Estado.ToString(), actor, comentario), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success(rol.ToResponse());
    }
}
