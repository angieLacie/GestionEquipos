using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>
/// Feriado del calendario maestro (maes.feriado). Modelo híbrido REGIONAL_OFICIAL / MANUAL_ADM
/// (RN-MAES-01). Versionado por vigencia; la edición no altera eventos pasados (RN-MAES-03).
/// </summary>
public sealed class Feriado : Entity
{
    private readonly List<AmbitoFeriado> _ambitos = [];

    private Feriado() { } // EF

    private Feriado(
        Guid id, DateOnly fecha, string descripcion, AlcanceFeriado alcance,
        OrigenFeriado origen, IReadOnlyCollection<string> empresas, bool compensable, DateOnly vigenciaDesde) : base(id)
    {
        Fecha = fecha;
        Descripcion = descripcion;
        Alcance = alcance;
        Origen = origen;
        EmpresasAplicables = string.Join(',', empresas);
        Compensable = compensable;
        VigenciaDesde = vigenciaDesde;
    }

    public DateOnly Fecha { get; private set; }
    public string Descripcion { get; private set; } = default!;
    public AlcanceFeriado Alcance { get; private set; }
    public OrigenFeriado Origen { get; private set; }
    /// <summary>CSV de códigos de empresa aplicables (CADENA,LUKERS).</summary>
    public string EmpresasAplicables { get; private set; } = default!;
    public bool Compensable { get; private set; }
    public DateOnly VigenciaDesde { get; private set; }
    public DateOnly? VigenciaHasta { get; private set; }
    public IReadOnlyList<AmbitoFeriado> Ambitos => _ambitos;

    /// <summary>Alta manual del ADM (origen MANUAL_ADM, RN-MAES-01). LOCAL exige >=1 ámbito.</summary>
    public static Result<Feriado> CrearManual(
        DateOnly fecha, string descripcion, AlcanceFeriado alcance,
        IReadOnlyCollection<string> empresas, bool compensable, DateOnly vigenciaDesde,
        IReadOnlyCollection<(TipoAmbitoFeriado tipo, Guid id)> ambitos, DateOnly hoy)
    {
        if (string.IsNullOrWhiteSpace(descripcion))
            return Result.Failure<Feriado>(Error.Validacion("La descripción del feriado es obligatoria."));
        if (empresas.Count == 0)
            return Result.Failure<Feriado>(Error.Validacion("Debe indicar al menos una empresa aplicable."));
        if (vigenciaDesde < hoy)
            return Result.Failure<Feriado>(Error.Validacion("No se permite vigencia retroactiva de feriados (RN-MAES-03)."));
        if (alcance == AlcanceFeriado.Local && ambitos.Count == 0)
            return Result.Failure<Feriado>(Error.Validacion("Un feriado LOCAL exige al menos una zona o tienda (RN-MAES-01)."));

        var feriado = new Feriado(
            Guid.NewGuid(), fecha, descripcion.Trim(), alcance,
            OrigenFeriado.ManualAdm, empresas, compensable, vigenciaDesde);

        if (alcance == AlcanceFeriado.Local)
            foreach (var (tipo, idAmbito) in ambitos)
                feriado._ambitos.Add(new AmbitoFeriado(feriado.Id, tipo, idAmbito));

        return Result.Success(feriado);
    }

    /// <summary>Solo los feriados de carga manual (MANUAL_ADM) son editables/eliminables (RN-MAES-01).</summary>
    public bool EsManual => Origen == OrigenFeriado.ManualAdm;

    /// <summary>
    /// Corrección de un feriado cargado manualmente (CU-MAES-01). No aplica a feriados de origen
    /// REGIONAL_OFICIAL. Mantiene las mismas validaciones que el alta (LOCAL exige ámbito, no retroactivo).
    /// </summary>
    public Result Editar(
        DateOnly fecha, string descripcion, AlcanceFeriado alcance,
        IReadOnlyCollection<string> empresas, bool compensable, DateOnly vigenciaDesde,
        IReadOnlyCollection<(TipoAmbitoFeriado tipo, Guid id)> ambitos, DateOnly hoy)
    {
        if (!EsManual)
            return Result.Failure(Error.Validacion("Solo se pueden editar feriados de carga manual."));
        if (string.IsNullOrWhiteSpace(descripcion))
            return Result.Failure(Error.Validacion("La descripción del feriado es obligatoria."));
        if (empresas.Count == 0)
            return Result.Failure(Error.Validacion("Debe indicar al menos una empresa aplicable."));
        if (vigenciaDesde < hoy)
            return Result.Failure(Error.Validacion("No se permite vigencia retroactiva de feriados (RN-MAES-03)."));
        if (alcance == AlcanceFeriado.Local && ambitos.Count == 0)
            return Result.Failure(Error.Validacion("Un feriado LOCAL exige al menos una zona o tienda (RN-MAES-01)."));

        Fecha = fecha;
        Descripcion = descripcion.Trim();
        Alcance = alcance;
        EmpresasAplicables = string.Join(',', empresas);
        Compensable = compensable;
        VigenciaDesde = vigenciaDesde;

        _ambitos.Clear();
        if (alcance == AlcanceFeriado.Local)
            foreach (var (tipo, idAmbito) in ambitos)
                _ambitos.Add(new AmbitoFeriado(Id, tipo, idAmbito));

        return Result.Success();
    }
}

/// <summary>Ámbito local de un feriado (zona/tienda). RN-MAES-01.</summary>
public sealed class AmbitoFeriado
{
    private AmbitoFeriado() { } // EF

    public AmbitoFeriado(Guid idFeriado, TipoAmbitoFeriado tipoAmbito, Guid idAmbito)
    {
        IdFeriado = idFeriado;
        TipoAmbito = tipoAmbito;
        IdAmbito = idAmbito;
    }

    public Guid IdFeriado { get; private set; }
    public TipoAmbitoFeriado TipoAmbito { get; private set; }
    public Guid IdAmbito { get; private set; }
}
