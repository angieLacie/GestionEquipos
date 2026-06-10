using Nova.Maestros.Domain;

namespace Nova.Maestros.Application;

/// <summary>
/// Superficie pública del módulo Maestros para consumo cross-module (ADR-006, frontera de módulo).
/// Otros módulos (Seguridad, Aprobaciones, funcionales) dependen de esta abstracción, no de la
/// infraestructura interna. Maestros es Fase 0 y no depende de ningún otro módulo (sin ciclos).
/// </summary>
public interface IConfiguracionMaestros
{
    /// <summary>Permisos (MODULO.RECURSO.ACCION) que componen los roles indicados (maes.rol_permiso).</summary>
    Task<IReadOnlySet<string>> PermisosDeRolesAsync(IEnumerable<string> idRoles, CancellationToken ct = default);

    /// <summary>Nivel de autoridad de un rol (maes.rol.nivel_autoridad, RN-SEGU-28/31). 0 si no existe.</summary>
    Task<int> NivelDeRolAsync(string idRol, CancellationToken ct = default);

    /// <summary>Valor vigente de un parámetro por clave y fecha (CU-MAES-06, RN-MAES-14). null si no resoluble.</summary>
    Task<ParametroValor?> LookupParametroAsync(
        string clave, DateOnly fecha, string? idEmpresa = null, string? idAmbito = null, CancellationToken ct = default);
}
