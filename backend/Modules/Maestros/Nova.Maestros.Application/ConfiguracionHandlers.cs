using Nova.Maestros.Domain;
using Nova.SharedKernel;

namespace Nova.Maestros.Application;

/// <summary>Resuelve el valor vigente de un parámetro por clave y fecha (CU-MAES-06, RN-MAES-14).</summary>
public sealed class LookupParametroHandler(IParametroRepository parametros)
{
    public async Task<Result<ParametroValor>> HandleAsync(
        string clave, DateOnly fecha, string? idEmpresa, string? idAmbito, CancellationToken ct = default)
    {
        var p = await parametros.ObtenerVigenteAsync(clave, fecha, idEmpresa, idAmbito, ct);
        if (p is null)
            return Result.Failure<ParametroValor>(
                Error.NoEncontrado($"No existe parámetro vigente para '{clave}' al {fecha:yyyy-MM-dd}."));

        return Result.Success(new ParametroValor(
            p.Clave, p.TipoDato, p.Unidad, p.Valor, p.CriticidadConsumo, p.VigenciaDesde));
    }
}

/// <summary>Crea una nueva versión vigente de un parámetro (CU-MAES-03/04, RN-MAES-09/17).</summary>
public sealed class CrearParametroHandler(
    IParametroRepository parametros,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow,
    IClock clock)
{
    public async Task<Result<ParametroResponse>> HandleAsync(CrearParametroRequest req, CancellationToken ct = default)
    {
        var result = Parametro.CrearVersion(
            req.Modulo, req.Flujo, req.Nivel, req.NombreParametro, req.Ambito, req.IdEmpresa, req.IdAmbito,
            req.TipoDato, req.Unidad, req.Valor, req.EsImpactoNegocio, req.CriticidadConsumo, req.Justificacion,
            req.VigenciaDesde, req.EsCorreccionRetroactiva, clock.Today);

        if (result.IsFailure)
            return Result.Failure<ParametroResponse>(result.Error);

        var p = result.Value;

        // Cierra la versión anterior vigente (vigencia_hasta = nueva vigencia - 1 día).
        var anterior = await parametros.ObtenerVigenteParaCierreAsync(p.Clave, req.VigenciaDesde, req.IdEmpresa, req.IdAmbito, ct);
        if (anterior is not null && anterior.VigenciaDesde < req.VigenciaDesde)
            anterior.CerrarVigencia(req.VigenciaDesde.AddDays(-1));

        await parametros.AgregarAsync(p, ct);
        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            req.EsCorreccionRetroactiva ? AccionConfig.CorreccionRetroactiva : AccionConfig.Alta,
            p.Clave, anterior?.Valor, p.Valor, p.VigenciaDesde, req.IdActor, req.Justificacion), ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new ParametroResponse(
            p.Id, p.Clave, p.Modulo, p.NombreParametro, p.Valor, p.CriticidadConsumo, p.VigenciaDesde, p.VigenciaHasta, p.Estado));
    }
}

/// <summary>
/// Activa o desactiva explícitamente un parámetro (CU-MAES-04, RN-MAES-09). Idempotente.
/// Es un ESTADO, NO un cierre de vigencia: la versión permanece inmutable y, si queda Inactiva,
/// deja de resolverse en el lookup.
/// </summary>
public sealed class CambiarEstadoParametroHandler(
    IParametroRepository parametros,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow)
{
    public async Task<Result<ParametroResponse>> HandleAsync(Guid id, CambiarEstadoParametroRequest req, CancellationToken ct = default)
    {
        var p = await parametros.ObtenerAsync(id, ct);
        if (p is null)
            return Result.Failure<ParametroResponse>(Error.NoEncontrado("Parámetro no encontrado."));

        var estadoAnterior = p.Estado;
        var result = req.Estado == EstadoParametro.Activo ? p.Activar() : p.Desactivar();
        if (result.IsFailure)
            return Result.Failure<ParametroResponse>(result.Error);

        // Solo audita cuando hubo transición real (idempotente).
        if (estadoAnterior != p.Estado)
        {
            await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
                AccionConfig.CambioEstado, p.Clave, estadoAnterior.ToString(), p.Estado.ToString(),
                p.VigenciaDesde, req.IdActor, null), ct);
            await uow.SaveChangesAsync(ct);
        }

        return Result.Success(new ParametroResponse(
            p.Id, p.Clave, p.Modulo, p.NombreParametro, p.Valor, p.CriticidadConsumo, p.VigenciaDesde, p.VigenciaHasta, p.Estado));
    }
}

/// <summary>
/// Elimina físicamente SOLO una versión futura no consumida (vigencia_desde &gt; hoy), nunca vigente
/// (RN-MAES-09). Para versiones vigentes/pasadas la vía es Desactivar.
/// </summary>
public sealed class EliminarParametroHandler(
    IParametroRepository parametros,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow,
    IClock clock)
{
    public async Task<Result> HandleAsync(Guid id, Guid idActor, CancellationToken ct = default)
    {
        var p = await parametros.ObtenerAsync(id, ct);
        if (p is null)
            return Result.Failure(Error.NoEncontrado("Parámetro no encontrado."));
        if (!p.PuedeEliminarse(clock.Today))
            return Result.Failure(Error.Validacion(
                "Solo se pueden eliminar versiones futuras no consumidas; las vigentes/pasadas se desactivan."));

        await parametros.EliminarAsync(p, ct);
        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            AccionConfig.Eliminacion, p.Clave, p.Valor, null, p.VigenciaDesde, idActor, null), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

/// <summary>Carga manual de un feriado (CU-MAES-01, origen MANUAL_ADM, RN-MAES-01).</summary>
public sealed class CrearFeriadoHandler(
    IFeriadoRepository feriados,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow,
    IClock clock)
{
    public async Task<Result<FeriadoResponse>> HandleAsync(CrearFeriadoRequest req, CancellationToken ct = default)
    {
        var ambitos = (req.Ambitos ?? [])
            .Select(a => (a.TipoAmbito, a.IdAmbito))
            .ToList();

        var result = Feriado.CrearManual(
            req.Fecha, req.Descripcion, req.Alcance, req.EmpresasAplicables, req.Compensable,
            req.VigenciaDesde, ambitos, clock.Today);

        if (result.IsFailure)
            return Result.Failure<FeriadoResponse>(result.Error);

        var f = result.Value;
        await feriados.AgregarAsync(f, ct);
        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            AccionConfig.Alta, $"FERIADO:{f.Fecha:yyyy-MM-dd}", null, f.Descripcion, f.VigenciaDesde, req.IdActor, null), ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new FeriadoResponse(
            f.Id, f.Fecha, f.Descripcion, f.Alcance, f.Origen, f.Compensable, f.VigenciaDesde));
    }
}

/// <summary>Corrige un feriado de carga manual (CU-MAES-01). No aplica a feriados oficiales.</summary>
public sealed class EditarFeriadoHandler(
    IFeriadoRepository feriados,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow,
    IClock clock)
{
    public async Task<Result<FeriadoResponse>> HandleAsync(Guid id, EditarFeriadoRequest req, CancellationToken ct = default)
    {
        var f = await feriados.ObtenerAsync(id, ct);
        if (f is null)
            return Result.Failure<FeriadoResponse>(Error.NoEncontrado("Feriado no encontrado."));

        var ambitos = (req.Ambitos ?? [])
            .Select(a => (a.TipoAmbito, a.IdAmbito))
            .ToList();

        var descripcionAnterior = f.Descripcion;
        var result = f.Editar(
            req.Fecha, req.Descripcion, req.Alcance, req.EmpresasAplicables, req.Compensable,
            req.VigenciaDesde, ambitos, clock.Today);
        if (result.IsFailure)
            return Result.Failure<FeriadoResponse>(result.Error);

        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            AccionConfig.Modificacion, $"FERIADO:{f.Fecha:yyyy-MM-dd}", descripcionAnterior, f.Descripcion,
            f.VigenciaDesde, req.IdActor, null), ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new FeriadoResponse(
            f.Id, f.Fecha, f.Descripcion, f.Alcance, f.Origen, f.Compensable, f.VigenciaDesde));
    }
}

/// <summary>Elimina un feriado cargado manualmente por error (CU-MAES-01). No borra feriados oficiales.</summary>
public sealed class EliminarFeriadoHandler(
    IFeriadoRepository feriados,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow)
{
    public async Task<Result> HandleAsync(Guid id, Guid idActor, CancellationToken ct = default)
    {
        var f = await feriados.ObtenerAsync(id, ct);
        if (f is null)
            return Result.Failure(Error.NoEncontrado("Feriado no encontrado."));
        if (!f.EsManual)
            return Result.Failure(Error.Validacion("Solo se pueden eliminar feriados de carga manual."));

        await feriados.EliminarAsync(f, ct);
        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            AccionConfig.Desactivacion, $"FERIADO:{f.Fecha:yyyy-MM-dd}", f.Descripcion, null,
            f.VigenciaDesde, idActor, null), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

/// <summary>Edita atributos operativos Nova de una tienda (CU-MAES-02, RN-MAES-05).</summary>
public sealed class EditarTiendaHandler(
    ITiendaRepository tiendas,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow)
{
    public async Task<Result> HandleAsync(Guid idTienda, EditarTiendaRequest req, CancellationToken ct = default)
    {
        var tienda = await tiendas.ObtenerAsync(idTienda, ct);
        if (tienda is null)
            return Result.Failure(Error.NoEncontrado("Tienda no encontrada."));

        var estadoAnterior = tienda.EstadoOperativo.ToString();
        var result = tienda.EditarAtributosNova(req.Ubicacion, req.IdZona, req.EstadoOperativo);
        if (result.IsFailure)
            return result;

        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            AccionConfig.Modificacion, $"TIENDA:{tienda.Codigo}", estadoAnterior,
            tienda.EstadoOperativo.ToString(), null, req.IdActor, null), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

/// <summary>Carga manual anticipada de semanas de campaña por empresa (CU-MAES-08, RN-MAES-21).</summary>
public sealed class CargarCampaniaHandler(
    ISemanaCampaniaRepository semanas,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow)
{
    public async Task<Result> HandleAsync(CargarCampaniaRequest req, CancellationToken ct = default)
    {
        if (req.Rangos.Count == 0)
            return Result.Failure(Error.Validacion("Debe indicar al menos un rango de fechas."));

        foreach (var rango in req.Rangos)
        {
            var result = SemanaCampania.Crear(req.IdEmpresa, rango.Desde, rango.Hasta);
            if (result.IsFailure)
                return result;
            await semanas.AgregarAsync(result.Value, ct);
        }

        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            AccionConfig.Alta, $"CAMPANA:{req.IdEmpresa}", null,
            $"{req.Rangos.Count} rango(s)", null, req.IdActor, null), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

/// <summary>Elimina una semana de campaña cargada por error (CU-MAES-08).</summary>
public sealed class EliminarCampaniaHandler(
    ISemanaCampaniaRepository semanas,
    IAuditoriaMaestrosRepository auditoria,
    IUnitOfWork uow)
{
    public async Task<Result> HandleAsync(Guid id, Guid idActor, CancellationToken ct = default)
    {
        var semana = await semanas.ObtenerAsync(id, ct);
        if (semana is null)
            return Result.Failure(Error.NoEncontrado("Semana de campaña no encontrada."));

        await semanas.EliminarAsync(semana, ct);
        await auditoria.AgregarAsync(AuditoriaMaestros.Registrar(
            AccionConfig.Desactivacion, $"CAMPANA:{semana.IdEmpresa}",
            $"{semana.Desde:yyyy-MM-dd}..{semana.Hasta:yyyy-MM-dd}", null, null, idActor, null), ct);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
