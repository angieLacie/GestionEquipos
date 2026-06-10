using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>
/// Log append-only de cambios de configuración (maes.auditoria_config, RN-MAES-16/18).
/// Registra elemento, valor anterior/nuevo, vigencia, usuario y justificación.
/// </summary>
public sealed class AuditoriaMaestros : Entity
{
    private AuditoriaMaestros() { } // EF

    private AuditoriaMaestros(
        Guid id, AccionConfig accion, string elemento, string? valorAnterior, string? valorNuevo,
        DateOnly? vigenciaDesde, Guid idActor, string? justificacion) : base(id)
    {
        Accion = accion;
        Elemento = elemento;
        ValorAnterior = valorAnterior;
        ValorNuevo = valorNuevo;
        VigenciaDesde = vigenciaDesde;
        IdActor = idActor;
        Justificacion = justificacion;
        FechaHora = DateTimeOffset.UtcNow;
    }

    public AccionConfig Accion { get; private set; }
    /// <summary>Identificador del elemento modificado (clave de parámetro, código de tienda, etc.).</summary>
    public string Elemento { get; private set; } = default!;
    public string? ValorAnterior { get; private set; }
    public string? ValorNuevo { get; private set; }
    public DateOnly? VigenciaDesde { get; private set; }
    public Guid IdActor { get; private set; }
    public string? Justificacion { get; private set; }
    public DateTimeOffset FechaHora { get; private set; }

    public static AuditoriaMaestros Registrar(
        AccionConfig accion, string elemento, string? valorAnterior, string? valorNuevo,
        DateOnly? vigenciaDesde, Guid idActor, string? justificacion)
        => new(Guid.NewGuid(), accion, elemento, valorAnterior, valorNuevo, vigenciaDesde, idActor, justificacion);
}
