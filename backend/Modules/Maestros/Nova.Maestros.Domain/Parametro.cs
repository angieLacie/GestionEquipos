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

    /// <summary>
    /// Estado explícito Activo/Inactivo (default Activo). Ortogonal a la vigencia (RN-MAES-09):
    /// un parámetro Inactivo no se resuelve en el lookup aunque esté dentro de su ventana.
    /// </summary>
    public EstadoParametro Estado { get; private set; } = EstadoParametro.Activo;

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

    /// <summary>Resoluble en el lookup: Activo y dentro de su ventana de vigencia (RN-MAES-14).</summary>
    public bool EsResoluble(DateOnly fecha)
        => Estado == EstadoParametro.Activo && EstaVigente(fecha);

    /// <summary>Activa el parámetro (idempotente). No altera versiones ni vigencia (RN-MAES-09).</summary>
    public Result Activar()
    {
        Estado = EstadoParametro.Activo;
        return Result.Success();
    }

    /// <summary>
    /// Desactiva el parámetro (idempotente). Es un ESTADO, NO un cierre de vigencia: la versión
    /// permanece inmutable y deja de resolverse en el lookup (RN-MAES-09).
    /// </summary>
    public Result Desactivar()
    {
        Estado = EstadoParametro.Inactivo;
        return Result.Success();
    }

    /// <summary>
    /// Solo es eliminable una versión FUTURA que nunca estuvo vigente (vigencia_desde &gt; hoy).
    /// Las versiones vigentes/pasadas son inmutables: la vía para retirarlas es Desactivar.
    /// </summary>
    public bool PuedeEliminarse(DateOnly hoy) => VigenciaDesde > hoy;

    /// <summary>Cierra/ajusta la vigencia de esta versión (CAMBIO_VIGENCIA).</summary>
    public Result CerrarVigencia(DateOnly vigenciaHasta)
    {
        if (vigenciaHasta < VigenciaDesde)
            return Result.Failure(Error.Validacion("La vigencia_hasta no puede ser anterior a vigencia_desde."));
        VigenciaHasta = vigenciaHasta;
        return Result.Success();
    }
}
