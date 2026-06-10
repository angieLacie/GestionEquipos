using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

/// <summary>
/// Suplencia de rol (segu.suplencia, base GG Suplente). `REQUIERE VALIDACION COMPLIANCE`.
/// Compatibilidad de rol RN-SEGU-31; vigencia abierta o acotada (VAC-SEGU-08).
/// </summary>
public sealed class Suplencia : Entity
{
    private Suplencia() { } // EF

    private Suplencia(
        Guid id, string idRolTitular, Guid? idUsuarioTitular, Guid idUsuarioSuplente,
        TipoAmbito tipoAmbito, Guid? idAmbito, DateOnly vigenciaDesde, DateOnly? vigenciaHasta) : base(id)
    {
        IdRolTitular = idRolTitular;
        IdUsuarioTitular = idUsuarioTitular;
        IdUsuarioSuplente = idUsuarioSuplente;
        TipoAmbito = tipoAmbito;
        IdAmbito = idAmbito;
        VigenciaDesde = vigenciaDesde;
        VigenciaHasta = vigenciaHasta;
        Estado = EstadoVigencia.Vigente;
    }

    public string IdRolTitular { get; private set; } = default!; // ref maes.rol_catalogo (p.ej. R-GG)
    public Guid? IdUsuarioTitular { get; private set; }          // NULL si por rol/ámbito
    public Guid IdUsuarioSuplente { get; private set; }
    public TipoAmbito TipoAmbito { get; private set; }
    public Guid? IdAmbito { get; private set; }
    public DateOnly VigenciaDesde { get; private set; }
    public DateOnly? VigenciaHasta { get; private set; }
    public EstadoVigencia Estado { get; private set; }

    /// <summary>Alta con validación de compatibilidad del rol del suplente con el titular (RN-SEGU-31).</summary>
    public static Result<Suplencia> Crear(
        string idRolTitular, Guid? idUsuarioTitular, Guid idUsuarioSuplente,
        TipoAmbito tipoAmbito, Guid? idAmbito, DateOnly vigenciaDesde, DateOnly? vigenciaHasta,
        int nivelAutoridadSuplente, int nivelAutoridadTitular)
    {
        if (string.IsNullOrWhiteSpace(idRolTitular))
            return Result.Failure<Suplencia>(Error.Validacion("El rol titular es obligatorio."));
        if (idUsuarioTitular == idUsuarioSuplente)
            return Result.Failure<Suplencia>(Error.Validacion("El titular y el suplente no pueden ser el mismo usuario."));
        if (nivelAutoridadSuplente < nivelAutoridadTitular)
            return Result.Failure<Suplencia>(Error.Validacion("El rol del suplente no es compatible con el rol titular (RN-SEGU-31)."));
        if (vigenciaHasta is not null && vigenciaHasta < vigenciaDesde)
            return Result.Failure<Suplencia>(Error.Validacion("La vigencia hasta no puede ser anterior a la vigencia desde."));

        return Result.Success(new Suplencia(
            Guid.NewGuid(), idRolTitular, idUsuarioTitular, idUsuarioSuplente, tipoAmbito, idAmbito, vigenciaDesde, vigenciaHasta));
    }

    public bool EstaVigente(DateOnly fecha)
        => Estado == EstadoVigencia.Vigente && VigenciaDesde <= fecha && (VigenciaHasta is null || VigenciaHasta >= fecha);

    public void Revocar() => Estado = EstadoVigencia.Revocada;
}
