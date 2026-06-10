namespace Nova.Maestros.Domain;

/// <summary>
/// Catálogo de roles funcionales (maes.rol). Maestros DEFINE el catálogo; Seguridad lo
/// operacionaliza (asignación usuario-rol-ámbito vive en Seguridad, EX-SEGU-02).
/// nivel_autoridad respalda delegación/suplencia (RN-SEGU-28/31) — desbloquea NivelAutoridadResolver.
/// </summary>
public sealed class Rol
{
    private Rol() { } // EF

    public Rol(string codigo, string nombre, int nivelAutoridad, AmbitoRol ambitoPermitido)
    {
        Codigo = codigo;
        Nombre = nombre;
        NivelAutoridad = nivelAutoridad;
        AmbitoPermitido = ambitoPermitido;
        Estado = EstadoCatalogo.Vigente;
    }

    /// <summary>Clave natural: R-ADM, R-GG, R-GZ, R-GT, R-AV, R-AR, R-BIEN, R-SENIOR, R-EMP, R-GG-SUP.</summary>
    public string Codigo { get; private set; } = default!;
    public string Nombre { get; private set; } = default!;
    public int NivelAutoridad { get; private set; }
    public AmbitoRol AmbitoPermitido { get; private set; }
    public EstadoCatalogo Estado { get; private set; }
}

/// <summary>Ámbito permitido para un rol.</summary>
public enum AmbitoRol
{
    Central = 1,
    Empresa = 2,
    Zona = 3,
    Tienda = 4
}
