using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

/// <summary>
/// Asignación usuario-rol-ámbito (segu.asignacion_rol_ambito). Núcleo del scoped RBAC.
/// Coherencia ámbito↔rol RN-SEGU-05; multi-zona RN-SEGU-06 vía <see cref="Zonas"/>.
/// </summary>
public sealed class AsignacionRolAmbito : Entity
{
    private readonly List<Guid> _zonas = [];

    private AsignacionRolAmbito() { } // EF

    private AsignacionRolAmbito(
        Guid id, Guid idUsuario, string idRol, TipoAmbito tipoAmbito,
        string? idEmpresa, Guid? idTienda, string? justificacion,
        DateOnly vigenciaDesde, DateOnly? vigenciaHasta) : base(id)
    {
        IdUsuario = idUsuario;
        IdRol = idRol;
        TipoAmbito = tipoAmbito;
        IdEmpresa = idEmpresa;
        IdTienda = idTienda;
        Justificacion = justificacion;
        VigenciaDesde = vigenciaDesde;
        VigenciaHasta = vigenciaHasta;
        Estado = EstadoVigencia.Vigente;
    }

    public Guid IdUsuario { get; private set; }
    public string IdRol { get; private set; } = default!; // ref lógica maes.rol_catalogo
    public TipoAmbito TipoAmbito { get; private set; }
    public string? IdEmpresa { get; private set; }
    public Guid? IdTienda { get; private set; }
    public string? Justificacion { get; private set; }
    public DateOnly VigenciaDesde { get; private set; }
    public DateOnly? VigenciaHasta { get; private set; }
    public EstadoVigencia Estado { get; private set; }

    public IReadOnlyCollection<Guid> Zonas => _zonas.AsReadOnly();

    /// <summary>Alta con validación de coherencia ámbito↔rol (RN-SEGU-05).</summary>
    public static Result<AsignacionRolAmbito> Crear(
        Guid idUsuario, string idRol, TipoAmbito tipoAmbito,
        string? idEmpresa, Guid? idTienda, IReadOnlyCollection<Guid>? zonas,
        string? justificacion, DateOnly vigenciaDesde, DateOnly? vigenciaHasta)
    {
        if (string.IsNullOrWhiteSpace(idRol))
            return Result.Failure<AsignacionRolAmbito>(Error.Validacion("El rol es obligatorio."));

        switch (tipoAmbito)
        {
            case TipoAmbito.Tienda when idTienda is null:
                return Result.Failure<AsignacionRolAmbito>(Error.Validacion("Un rol de tienda exige exactamente una tienda (RN-SEGU-05)."));
            case TipoAmbito.Zona when zonas is null || zonas.Count == 0:
                return Result.Failure<AsignacionRolAmbito>(Error.Validacion("Un rol de zona exige al menos una zona (RN-SEGU-05)."));
            case TipoAmbito.Zona or TipoAmbito.Empresa when string.IsNullOrWhiteSpace(idEmpresa):
                return Result.Failure<AsignacionRolAmbito>(Error.Validacion("El ámbito empresa/zona exige una empresa (RN-SEGU-05)."));
            case TipoAmbito.Central when idTienda is not null || (zonas is { Count: > 0 }):
                return Result.Failure<AsignacionRolAmbito>(Error.Validacion("Un rol central no admite tienda ni zonas (RN-SEGU-05)."));
        }

        if (vigenciaHasta is not null && vigenciaHasta < vigenciaDesde)
            return Result.Failure<AsignacionRolAmbito>(Error.Validacion("La vigencia hasta no puede ser anterior a la vigencia desde."));

        var asignacion = new AsignacionRolAmbito(
            Guid.NewGuid(), idUsuario, idRol, tipoAmbito,
            tipoAmbito == TipoAmbito.Central ? null : idEmpresa,
            tipoAmbito == TipoAmbito.Tienda ? idTienda : null,
            justificacion, vigenciaDesde, vigenciaHasta);

        if (tipoAmbito == TipoAmbito.Zona)
            asignacion._zonas.AddRange(zonas!);

        return Result.Success(asignacion);
    }

    public bool EstaVigente(DateOnly fecha)
        => Estado == EstadoVigencia.Vigente
           && VigenciaDesde <= fecha
           && (VigenciaHasta is null || VigenciaHasta >= fecha);

    /// <summary>¿El ámbito de esta asignación cubre el objetivo? (RN-SEGU-22).</summary>
    public bool CubreAmbito(AmbitoObjetivo objetivo)
    {
        // CENTRAL cubre todo (GG/AV operan sobre todas las tiendas).
        if (TipoAmbito == TipoAmbito.Central)
            return true;

        // Acción sin ámbito (configuración central, A1): solo CENTRAL la cubre.
        if (objetivo.Tipo == TipoAmbito.Central)
            return false;

        return TipoAmbito switch
        {
            TipoAmbito.Empresa => IdEmpresa is not null && IdEmpresa == objetivo.IdEmpresa,
            TipoAmbito.Zona => objetivo.IdZona is not null && _zonas.Contains(objetivo.IdZona.Value),
            TipoAmbito.Tienda => objetivo.IdTienda is not null && IdTienda == objetivo.IdTienda,
            _ => false
        };
    }

    public void Revocar() => Estado = EstadoVigencia.Revocada;
}
