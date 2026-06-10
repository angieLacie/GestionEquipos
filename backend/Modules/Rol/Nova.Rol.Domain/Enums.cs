namespace Nova.Rol.Domain;

/// <summary>Estados del documento de Rol (flujo de aprobación, ENT-MOD-ROLP-001 §6.1).</summary>
public enum EstadoRol
{
    EnEdicion = 1,
    PendienteEnvio = 2,
    EnviadoGG = 3,
    RechazadoGG = 4,
    AprobadoGG = 5,
    ProgramadoGT = 6,
    VersionEnRevision = 7,
    Vigente = 8,
    Historico = 9,
    Bloqueado = 10,
    BloqueadoDefinitivo = 11,
    BloqueadoGT = 12,
    BloqueadoDefinitivoGT = 13
}

/// <summary>Grupo de puesto sobre el que se arma un rol semanal (§7.1).</summary>
public enum PuestoRol
{
    Seniors = 1,
    GtAsesores = 2,
    Secretarias = 3,
    Auxiliares = 4,
    Sastres = 5
}

/// <summary>Estado programado de una celda del calendario (§6.3).</summary>
public enum EstadoCelda
{
    Vacio = 0,
    DescansoLaboral = 1,
    CoberturaTienda = 2,
    CompensacionFeriadoLaborado = 3,
    CompensacionDescansoNoGozado = 4,
    CoberturaTipoVenta = 5
}

/// <summary>Motivo de bloqueo de tienda por incumplimiento de plazo (§7.5).</summary>
public enum MotivoBloqueo
{
    VencimientoGZ = 1,
    VencimientoGG = 2,
    VencimientoGT = 3
}

/// <summary>Tipo de evento del historial de cambios (§7.6).</summary>
public enum TipoEventoRol
{
    Creacion = 1,
    Modificacion = 2,
    Eliminacion = 3,
    Envio = 4,
    Aprobacion = 5,
    Rechazo = 6,
    Bloqueo = 7,
    Desbloqueo = 8,
    ProgramacionGt = 9
}
