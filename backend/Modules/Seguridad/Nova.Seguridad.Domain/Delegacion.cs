using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

/// <summary>Alcance de una delegación (SEGU §7.6, RN-SEGU-27).</summary>
public enum AlcanceDelegacion
{
    RolCompleto = 1,
    AccionesEspecificas = 2,
    TiposFlujo = 3
}

/// <summary>
/// Delegación temporal de facultad (segu.delegacion). `REQUIERE VALIDACION COMPLIANCE`.
/// Compatibilidad por autoridad RN-SEGU-28; vigencia y revocación RN-SEGU-27/29.
/// </summary>
public sealed class Delegacion : Entity
{
    private Delegacion() { } // EF

    private Delegacion(
        Guid id, Guid idTitular, Guid idDelegado, AlcanceDelegacion alcance, string? detalleAlcance,
        TipoAmbito tipoAmbito, Guid? idAmbito, DateOnly vigenciaDesde, DateOnly? vigenciaHasta) : base(id)
    {
        IdTitular = idTitular;
        IdDelegado = idDelegado;
        Alcance = alcance;
        DetalleAlcance = detalleAlcance;
        TipoAmbito = tipoAmbito;
        IdAmbito = idAmbito;
        VigenciaDesde = vigenciaDesde;
        VigenciaHasta = vigenciaHasta;
        Estado = EstadoVigencia.Vigente;
    }

    public Guid IdTitular { get; private set; }
    public Guid IdDelegado { get; private set; }
    public AlcanceDelegacion Alcance { get; private set; }
    public string? DetalleAlcance { get; private set; } // JSON: acciones o tipos de flujo
    public TipoAmbito TipoAmbito { get; private set; }
    public Guid? IdAmbito { get; private set; }
    public DateOnly VigenciaDesde { get; private set; }
    public DateOnly? VigenciaHasta { get; private set; }
    public EstadoVigencia Estado { get; private set; }

    /// <summary>
    /// Alta con validación de compatibilidad: el delegado no puede tener menor autoridad
    /// que la requerida por la facultad delegada (RN-SEGU-28).
    /// </summary>
    public static Result<Delegacion> Crear(
        Guid idTitular, Guid idDelegado, AlcanceDelegacion alcance, string? detalleAlcance,
        TipoAmbito tipoAmbito, Guid? idAmbito, DateOnly vigenciaDesde, DateOnly? vigenciaHasta,
        int nivelAutoridadDelegado, int nivelAutoridadRequerido)
    {
        if (idTitular == idDelegado)
            return Result.Failure<Delegacion>(Error.Validacion("El titular y el delegado no pueden ser el mismo usuario."));
        if (nivelAutoridadDelegado < nivelAutoridadRequerido)
            return Result.Failure<Delegacion>(Error.Validacion("El delegado tiene un rol de menor autoridad que la facultad delegada (RN-SEGU-28)."));
        if (vigenciaHasta is not null && vigenciaHasta < vigenciaDesde)
            return Result.Failure<Delegacion>(Error.Validacion("La vigencia hasta no puede ser anterior a la vigencia desde."));
        if (alcance != AlcanceDelegacion.RolCompleto && string.IsNullOrWhiteSpace(detalleAlcance))
            return Result.Failure<Delegacion>(Error.Validacion("El alcance acotado requiere detalle (acciones o tipos de flujo)."));

        return Result.Success(new Delegacion(
            Guid.NewGuid(), idTitular, idDelegado, alcance, detalleAlcance, tipoAmbito, idAmbito, vigenciaDesde, vigenciaHasta));
    }

    public bool EstaVigente(DateOnly fecha)
        => Estado == EstadoVigencia.Vigente && VigenciaDesde <= fecha && (VigenciaHasta is null || VigenciaHasta >= fecha);

    public void Revocar() => Estado = EstadoVigencia.Revocada; // A1: la facultad vuelve al titular
}
