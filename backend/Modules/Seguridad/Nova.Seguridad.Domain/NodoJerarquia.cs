using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

/// <summary>
/// Nodo de la jerarquía organizacional para escalamiento (segu.nodo_jerarquia, RN-SEGU-18).
/// Self-FK al superior; el anti-ciclo se valida en aplicación (modelo-datos-fase0 §3).
/// </summary>
public sealed class NodoJerarquia : Entity
{
    private NodoJerarquia() { } // EF

    private NodoJerarquia(Guid id, string idRol, TipoAmbito tipoAmbito, Guid? idAmbito, Guid? idNodoSuperior) : base(id)
    {
        IdRol = idRol;
        TipoAmbito = tipoAmbito;
        IdAmbito = idAmbito;
        IdNodoSuperior = idNodoSuperior;
    }

    public string IdRol { get; private set; } = default!; // ref maes.rol_catalogo
    public TipoAmbito TipoAmbito { get; private set; }
    public Guid? IdAmbito { get; private set; }
    public Guid? IdNodoSuperior { get; private set; } // NULL en máxima autoridad

    public static Result<NodoJerarquia> Crear(string idRol, TipoAmbito tipoAmbito, Guid? idAmbito, Guid? idNodoSuperior)
    {
        if (string.IsNullOrWhiteSpace(idRol))
            return Result.Failure<NodoJerarquia>(Error.Validacion("El rol del nodo es obligatorio."));
        return Result.Success(new NodoJerarquia(Guid.NewGuid(), idRol, tipoAmbito, idAmbito, idNodoSuperior));
    }

    public void FijarSuperior(Guid? idNodoSuperior)
    {
        if (idNodoSuperior == Id)
            throw new InvalidOperationException("Un nodo no puede ser su propio superior (anti-ciclo RN-SEGU-18).");
        IdNodoSuperior = idNodoSuperior;
    }
}
