using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

/// <summary>Eventos auditables de seguridad (SEGU §7.8). Lista parcial en uso.</summary>
public enum EventoAudit
{
    LoginOk = 1,
    LoginFallido = 2,
    Logout = 3,
    Bloqueo = 4,
    DenegacionAcceso = 5,
    AsignacionRol = 6,
    RecupPwdSolicitud = 7,
    RecupPwdVerificacion = 8,
    RecupPwdCambio = 9,
    RecupPwdBloqueo = 10
}

public enum ResultadoAudit
{
    Exitoso = 1,
    Fallido = 2,
    Denegado = 3
}

/// <summary>Registro inmutable de auditoría (segu.auditoria_seguridad) — append-only (RN-SEGU-25).</summary>
public sealed class AuditoriaSeguridad : Entity
{
    private AuditoriaSeguridad() { } // EF

    private AuditoriaSeguridad(
        Guid id, EventoAudit evento, Guid idActor, Guid? idObjeto,
        ResultadoAudit resultado, string? detalle, DateTimeOffset fechaHora) : base(id)
    {
        Evento = evento;
        IdActor = idActor;
        IdObjeto = idObjeto;
        Resultado = resultado;
        Detalle = detalle;
        FechaHora = fechaHora;
    }

    public EventoAudit Evento { get; private set; }
    public Guid IdActor { get; private set; }
    public Guid? IdObjeto { get; private set; }
    public ResultadoAudit Resultado { get; private set; }
    public string? Detalle { get; private set; } // JSON, sin credenciales (RN-SEGU-25)
    public DateTimeOffset FechaHora { get; private set; }

    public static AuditoriaSeguridad Registrar(
        EventoAudit evento, Guid idActor, ResultadoAudit resultado,
        DateTimeOffset fechaHora, Guid? idObjeto = null, string? detalle = null)
        => new(Guid.NewGuid(), evento, idActor, idObjeto, resultado, detalle, fechaHora);
}
