using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Application;

/// <summary>Persistencia de asignaciones rol-ámbito.</summary>
public interface IAsignacionRolAmbitoRepository
{
    Task<IReadOnlyList<AsignacionRolAmbito>> ObtenerVigentesPorUsuarioAsync(
        Guid idUsuario, DateOnly fecha, CancellationToken ct = default);
    Task AgregarAsync(AsignacionRolAmbito asignacion, CancellationToken ct = default);
}

/// <summary>
/// Resuelve los permisos de un rol (rol→permisos vive en maes.rol_permiso, ADR de frontera).
/// Puerto: mientras el módulo Maestros no exista, lo cubre un adaptador con catálogo semilla.
/// </summary>
public interface IPermisoResolver
{
    Task<IReadOnlySet<string>> PermisosDeRolesAsync(IEnumerable<string> idRoles, CancellationToken ct = default);
}

/// <summary>Emisión de token de sesión (JWT) tras login (CU-SEGU-02).</summary>
public interface ITokenService
{
    string EmitirToken(Guid idUsuario, string nombreUsuario);
}
