namespace Nova.Seguridad.Domain;

/// <summary>Tipo de usuario (RN-SEGU-01).</summary>
public enum TipoUsuario
{
    Personal = 1,
    TecnicoCentral = 2
}

/// <summary>Estado del usuario (SEGU §6.1).</summary>
public enum EstadoUsuario
{
    PendienteAsignacion = 1,
    Activo = 2,
    Bloqueado = 3,
    Desactivado = 4
}

/// <summary>Método de autenticación (VAC-SEGU-01, ADR-001).</summary>
public enum MetodoAutenticacion
{
    Local = 1,
    Sso = 2
}
