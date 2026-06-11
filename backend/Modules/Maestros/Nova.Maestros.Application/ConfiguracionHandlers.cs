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
            p.Id, p.Clave, p.Modulo, p.NombreParametro, p.Valor, p.CriticidadConsumo, p.VigenciaDesde, p.VigenciaHasta));
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
