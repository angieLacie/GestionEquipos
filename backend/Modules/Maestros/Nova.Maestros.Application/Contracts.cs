using Nova.Maestros.Domain;

namespace Nova.Maestros.Application;

// ---------------- Configuración (servicio centralizado, CU-MAES-06) ----------------

/// <summary>Vista de consumo del lookup vigente (RN-MAES-14).</summary>
public sealed record ParametroValor(
    string Clave,
    TipoDato TipoDato,
    string? Unidad,
    string Valor,
    Criticidad CriticidadConsumo,
    DateOnly VigenciaDesde);

public sealed record CrearParametroRequest(
    ModuloNova Modulo,
    string? Flujo,
    string? Nivel,
    string NombreParametro,
    AmbitoParam Ambito,
    string? IdEmpresa,
    string? IdAmbito,
    TipoDato TipoDato,
    string? Unidad,
    string Valor,
    bool EsImpactoNegocio,
    Criticidad CriticidadConsumo,
    string? Justificacion,
    DateOnly VigenciaDesde,
    bool EsCorreccionRetroactiva,
    Guid IdActor);

public sealed record ParametroResponse(
    Guid Id,
    string Clave,
    ModuloNova Modulo,
    string NombreParametro,
    string Valor,
    Criticidad CriticidadConsumo,
    DateOnly VigenciaDesde,
    DateOnly? VigenciaHasta,
    EstadoParametro Estado);

/// <summary>Cambio de estado explícito Activo/Inactivo de un parámetro (CU-MAES-04, RN-MAES-09).</summary>
public sealed record CambiarEstadoParametroRequest(
    EstadoParametro Estado,
    Guid IdActor);

// ---------------- Auditoría / historial de cambios (CU-MAES-07) ----------------

public sealed record AuditoriaResponse(
    Guid Id,
    AccionConfig Accion,
    string Elemento,
    string? ValorAnterior,
    string? ValorNuevo,
    DateOnly? VigenciaDesde,
    string? Usuario,
    string? Justificacion,
    DateTimeOffset FechaHora);

// ---------------- Feriados (CU-MAES-01) ----------------

public sealed record AmbitoFeriadoDto(TipoAmbitoFeriado TipoAmbito, Guid IdAmbito);

public sealed record CrearFeriadoRequest(
    DateOnly Fecha,
    string Descripcion,
    AlcanceFeriado Alcance,
    IReadOnlyList<string> EmpresasAplicables,
    bool Compensable,
    DateOnly VigenciaDesde,
    IReadOnlyList<AmbitoFeriadoDto>? Ambitos,
    Guid IdActor);

public sealed record EditarFeriadoRequest(
    DateOnly Fecha,
    string Descripcion,
    AlcanceFeriado Alcance,
    IReadOnlyList<string> EmpresasAplicables,
    bool Compensable,
    DateOnly VigenciaDesde,
    IReadOnlyList<AmbitoFeriadoDto>? Ambitos,
    Guid IdActor);

public sealed record FeriadoResponse(
    Guid Id,
    DateOnly Fecha,
    string Descripcion,
    AlcanceFeriado Alcance,
    OrigenFeriado Origen,
    bool Compensable,
    DateOnly VigenciaDesde);

// ---------------- Tiendas (CU-MAES-02) ----------------

public sealed record EditarTiendaRequest(
    UbicacionTienda Ubicacion,
    Guid? IdZona,
    EstadoTienda EstadoOperativo,
    Guid IdActor);

// ---------------- Campaña (CU-MAES-08, RN-MAES-21) ----------------

public sealed record RangoFechasDto(DateOnly Desde, DateOnly Hasta);

public sealed record CargarCampaniaRequest(
    string IdEmpresa,
    IReadOnlyList<RangoFechasDto> Rangos,
    Guid IdActor);
