using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>Zona geográfica/comercial de una empresa. Catálogo Nova (maes.zona).</summary>
public sealed class Zona : Entity
{
    private Zona() { } // EF

    private Zona(Guid id, string nombre, string idEmpresa) : base(id)
    {
        Nombre = nombre;
        IdEmpresa = idEmpresa;
        Estado = EstadoCatalogo.Vigente;
    }

    public string Nombre { get; private set; } = default!;
    public string IdEmpresa { get; private set; } = default!;
    public EstadoCatalogo Estado { get; private set; }

    public static Result<Zona> Crear(string nombre, string idEmpresa)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            return Result.Failure<Zona>(Error.Validacion("El nombre de la zona es obligatorio."));
        if (string.IsNullOrWhiteSpace(idEmpresa))
            return Result.Failure<Zona>(Error.Validacion("La empresa de la zona es obligatoria (RN-MAES-06)."));
        return Result.Success(new Zona(Guid.NewGuid(), nombre.Trim(), idEmpresa.Trim()));
    }

    public void Desactivar() => Estado = EstadoCatalogo.Desactivado;
}
