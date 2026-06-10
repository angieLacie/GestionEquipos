using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>
/// Semana de campaña / alta demanda (maes.semana_campania). Carga manual anticipada del ADM por
/// empresa y rango de fechas (RN-MAES-21). Los módulos consumidores leen las vigentes a la fecha del evento.
/// </summary>
public sealed class SemanaCampania : Entity
{
    private SemanaCampania() { } // EF

    private SemanaCampania(Guid id, string idEmpresa, DateOnly desde, DateOnly hasta) : base(id)
    {
        IdEmpresa = idEmpresa;
        Desde = desde;
        Hasta = hasta;
    }

    public string IdEmpresa { get; private set; } = default!;
    public DateOnly Desde { get; private set; }
    public DateOnly Hasta { get; private set; }

    public static Result<SemanaCampania> Crear(string idEmpresa, DateOnly desde, DateOnly hasta)
    {
        if (string.IsNullOrWhiteSpace(idEmpresa))
            return Result.Failure<SemanaCampania>(Error.Validacion("La empresa es obligatoria."));
        if (hasta < desde)
            return Result.Failure<SemanaCampania>(Error.Validacion("El rango de la campaña es inválido (hasta < desde)."));
        return Result.Success(new SemanaCampania(Guid.NewGuid(), idEmpresa.Trim(), desde, hasta));
    }
}
