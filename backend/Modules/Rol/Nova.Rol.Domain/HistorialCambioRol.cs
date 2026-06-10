using Nova.SharedKernel;

namespace Nova.Rol.Domain;

/// <summary>Historial append-only de eventos sobre un rol (§7.6). Trazabilidad de flujo y celdas.</summary>
public sealed class HistorialCambioRol : Entity
{
    private HistorialCambioRol() { } // EF

    private HistorialCambioRol(
        Guid id, Guid rolSemanalId, Guid? programacionDiaId, TipoEventoRol tipoEvento,
        string? estadoAnterior, string? estadoNuevo, Guid usuarioId, string? comentario) : base(id)
    {
        RolSemanalId = rolSemanalId;
        ProgramacionDiaId = programacionDiaId;
        TipoEvento = tipoEvento;
        EstadoAnterior = estadoAnterior;
        EstadoNuevo = estadoNuevo;
        UsuarioId = usuarioId;
        Comentario = comentario;
        FechaEvento = DateTimeOffset.UtcNow;
    }

    public Guid RolSemanalId { get; private set; }
    public Guid? ProgramacionDiaId { get; private set; }
    public TipoEventoRol TipoEvento { get; private set; }
    public string? EstadoAnterior { get; private set; }
    public string? EstadoNuevo { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string? Comentario { get; private set; }
    public DateTimeOffset FechaEvento { get; private set; }

    public static HistorialCambioRol Registrar(
        Guid rolSemanalId, TipoEventoRol tipoEvento, string? estadoAnterior, string? estadoNuevo,
        Guid usuarioId, string? comentario = null, Guid? programacionDiaId = null)
        => new(Guid.NewGuid(), rolSemanalId, programacionDiaId, tipoEvento, estadoAnterior, estadoNuevo, usuarioId, comentario);
}
