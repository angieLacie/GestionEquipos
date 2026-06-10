using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>
/// Parámetro de configuración versionado (maes.parametro). Fuente única, vigencia temporal y
/// criticidad de consumo (RN-MAES-08/09/14, ADR-004/005). Una nueva versión NO sobrescribe la
/// anterior (RN-MAES-03/09); el servicio devuelve el valor vigente a la fecha de referencia.
/// </summary>
public sealed class Parametro : Entity
{
    private Parametro() { } // EF

    private Parametro(
        Guid id, string clave, ModuloNova modulo, string? flujo, string? nivel, string nombreParametro,
        AmbitoParam ambito, string? idEmpresa, string? idAmbito, TipoDato tipoDato, string? unidad,
        string valor, bool esImpactoNegocio, Criticidad criticidad, DateOnly vigenciaDesde) : base(id)
    {
        Clave = clave;
        Modulo = modulo;
        Flujo = flujo;
        Nivel = nivel;
        NombreParametro = nombreParametro;
        Ambito = ambito;
        IdEmpresa = idEmpresa;
        IdAmbito = idAmbito;
        TipoDato = tipoDato;
        Unidad = unidad;
        Valor = valor;
        EsImpactoNegocio = esImpactoNegocio;
        CriticidadConsumo = criticidad;
        VigenciaDesde = vigenciaDesde;
    }

    /// <summary>Clave lógica derivada (ADR-004).</summary>
    public string Clave { get; private set; } = default!;
    public ModuloNova Modulo { get; private set; }
    public string? Flujo { get; private set; }
    public string? Nivel { get; private set; }
    public string NombreParametro { get; private set; } = default!;
    public AmbitoParam Ambito { get; private set; }
    public string? IdEmpresa { get; private set; }
    public string? IdAmbito { get; private set; }
    public TipoDato TipoDato { get; private set; }
    public string? Unidad { get; private set; }
    /// <summary>Valor serializado (JSON/escalar). Soporta ENTERO/DECIMAL/BOOLEAN/LISTA/RANGO.</summary>
    public string Valor { get; private set; } = default!;
    public bool EsImpactoNegocio { get; private set; }
    public Criticidad CriticidadConsumo { get; private set; }
    public DateOnly VigenciaDesde { get; private set; }
    public DateOnly? VigenciaHasta { get; private set; }
    public string? Justificacion { get; private set; }

    /// <summary>Deriva la clave lógica de módulo/flujo/nivel/nombre (ADR-004).</summary>
    public static string DerivarClave(ModuloNova modulo, string? flujo, string? nivel, string nombre)
    {
        var prefijo = modulo switch
        {
            ModuloNova.Aprobaciones => "APRO",
            ModuloNova.Seguridad => "SEGU",
            ModuloNova.Rol => "ROL",
            ModuloNova.Marc => "MARC",
            ModuloNova.Desc => "DESC",
            ModuloNova.Enca => "ENCA",
            ModuloNova.Tras => "TRAS",
            ModuloNova.Vac => "VAC",
            ModuloNova.Asce => "ASCE",
            _ => modulo.ToString().ToUpperInvariant()
        };
        var partes = new[] { prefijo, nombre, flujo, nivel }
            .Where(p => !string.IsNullOrWhiteSpace(p));
        return string.Join('_', partes);
    }

    /// <summary>
    /// Crea una nueva versión vigente (CU-MAES-03/04). Justificación obligatoria si es de impacto de
    /// negocio (RN-MAES-17). No retroactivo salvo corrección de error (RN-MAES-10/20).
    /// </summary>
    public static Result<Parametro> CrearVersion(
        ModuloNova modulo, string? flujo, string? nivel, string nombreParametro, AmbitoParam ambito,
        string? idEmpresa, string? idAmbito, TipoDato tipoDato, string? unidad, string valor,
        bool esImpactoNegocio, Criticidad criticidad, string? justificacion, DateOnly vigenciaDesde,
        bool esCorreccionRetroactiva, DateOnly hoy)
    {
        if (string.IsNullOrWhiteSpace(nombreParametro))
            return Result.Failure<Parametro>(Error.Validacion("El nombre del parámetro es obligatorio."));
        if (string.IsNullOrWhiteSpace(valor))
            return Result.Failure<Parametro>(Error.Validacion("El valor del parámetro es obligatorio."));
        if (esImpactoNegocio && string.IsNullOrWhiteSpace(justificacion))
            return Result.Failure<Parametro>(Error.Validacion("Un parámetro de impacto de negocio exige justificación (RN-MAES-17)."));
        if (vigenciaDesde < hoy && !esCorreccionRetroactiva)
            return Result.Failure<Parametro>(Error.Validacion("No se permite vigencia retroactiva ordinaria (RN-MAES-10/20)."));

        var clave = DerivarClave(modulo, flujo, nivel, nombreParametro);
        return Result.Success(new Parametro(
            Guid.NewGuid(), clave, modulo, flujo, nivel, nombreParametro.Trim(), ambito, idEmpresa, idAmbito,
            tipoDato, unidad, valor, esImpactoNegocio, criticidad, vigenciaDesde)
        {
            Justificacion = justificacion?.Trim()
        });
    }

    /// <summary>Vigente a la fecha de referencia (RN-MAES-14).</summary>
    public bool EstaVigente(DateOnly fecha)
        => VigenciaDesde <= fecha && (VigenciaHasta is null || fecha <= VigenciaHasta);

    /// <summary>Cierra/ajusta la vigencia de esta versión (CAMBIO_VIGENCIA).</summary>
    public Result CerrarVigencia(DateOnly vigenciaHasta)
    {
        if (vigenciaHasta < VigenciaDesde)
            return Result.Failure(Error.Validacion("La vigencia_hasta no puede ser anterior a vigencia_desde."));
        VigenciaHasta = vigenciaHasta;
        return Result.Success();
    }
}
