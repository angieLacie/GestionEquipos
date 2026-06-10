using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Application;

public interface IDelegacionRepository
{
    Task AgregarAsync(Delegacion delegacion, CancellationToken ct = default);
    Task<Delegacion?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
}

public interface ISuplenciaRepository
{
    Task AgregarAsync(Suplencia suplencia, CancellationToken ct = default);
    Task<Suplencia?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
}

public interface INodoJerarquiaRepository
{
    Task AgregarAsync(NodoJerarquia nodo, CancellationToken ct = default);
    Task<NodoJerarquia?> ObtenerSuperiorAsync(Guid idNodo, CancellationToken ct = default);
}

/// <summary>
/// Nivel de autoridad de un rol (maes.rol_catalogo.nivel_autoridad, RN-SEGU-28/31).
/// Provisional: catálogo semilla hasta que exista el módulo Maestros.
/// </summary>
public interface INivelAutoridadResolver
{
    Task<int> NivelDeRolAsync(string idRol, CancellationToken ct = default);
    Task<int> NivelMaximoDeUsuarioAsync(Guid idUsuario, DateOnly fecha, CancellationToken ct = default);
}
