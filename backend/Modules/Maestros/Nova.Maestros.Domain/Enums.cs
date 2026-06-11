namespace Nova.Maestros.Domain;

/// <summary>Estado de vigencia de un catálogo (ADR-006).</summary>
public enum EstadoCatalogo
{
    Vigente = 1,
    Desactivado = 2
}

/// <summary>Estado operativo de una tienda (RN-MAES-07).</summary>
public enum EstadoTienda
{
    Activa = 1,
    Suspendida = 2,
    Cerrada = 3
}

/// <summary>Ubicación de tienda (RN-MAES-04).</summary>
public enum UbicacionTienda
{
    /// <summary>Centro Comercial.</summary>
    Cc = 1,
    /// <summary>Pie de Calle.</summary>
    Pc = 2
}

/// <summary>Origen del dato: RMS (fuente de verdad) o enriquecido por Nova (RN-MAES-05/07).</summary>
public enum OrigenDato
{
    Rms = 1,
    Nova = 2
}

/// <summary>Criticidad de consumo de un parámetro (ADR-005, RN-MAES-19).</summary>
public enum Criticidad
{
    /// <summary>Si no se resuelve el valor vigente, el consumidor NO ejecuta la operación.</summary>
    Bloqueante = 1,
    /// <summary>El consumidor usa el último valor en caché.</summary>
    Degradable = 2
}

/// <summary>Tipo de dato de un parámetro (RN-MAES-08).</summary>
public enum TipoDato
{
    Entero = 1,
    Decimal = 2,
    Boolean = 3,
    Fecha = 4,
    Hora = 5,
    Texto = 6,
    Lista = 7,
    Rango = 8
}

/// <summary>Ámbito de aplicación de un parámetro.</summary>
public enum AmbitoParam
{
    Global = 1,
    Empresa = 2,
    Zona = 3,
    Tienda = 4,
    Puesto = 5
}

/// <summary>Alcance de un feriado (RN-MAES-01).</summary>
public enum AlcanceFeriado
{
    Nacional = 1,
    Local = 2
}

/// <summary>Origen del feriado (modelo híbrido, RN-MAES-01).</summary>
public enum OrigenFeriado
{
    RegionalOficial = 1,
    ManualAdm = 2
}

/// <summary>Tipo de ámbito local de un feriado (RN-MAES-01).</summary>
public enum TipoAmbitoFeriado
{
    Zona = 1,
    Tienda = 2
}

/// <summary>Situación operativa de un empleado (base RMS, RN-MAES-05).</summary>
public enum EstadoEmpleado
{
    Activo = 1,
    Descanso = 2,
    Vacaciones = 3,
    Licencia = 4,
    Cesado = 5
}

/// <summary>Categoría del empleado para el Rol de Personal (las 5 agrupaciones del rol).</summary>
public enum CategoriaRol
{
    Seniors = 1,
    GtAsesores = 2,
    Secretarias = 3,
    Auxiliares = 4,
    Sastres = 5
}

/// <summary>Acción de auditoría de configuración (RN-MAES-16).</summary>
public enum AccionConfig
{
    Alta = 1,
    Modificacion = 2,
    Desactivacion = 3,
    CambioVigencia = 4,
    CorreccionRetroactiva = 5
}
