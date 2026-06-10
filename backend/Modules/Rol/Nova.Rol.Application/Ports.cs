using Nova.Rol.Domain;

namespace Nova.Rol.Application;

/// <summary>Unidad de trabajo del módulo Rol.</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

/// <summary>Reloj inyectable (UTC).</summary>
public interface IClock
{
    DateTimeOffset Now { get; }
    DateOnly Today { get; }
}

/// <summary>Persistencia del agregado RolSemanal (incluye sus celdas).</summary>
public interface IRolSemanalRepository
{
    Task<RolSemanal?> ObtenerAsync(Guid id, CancellationToken ct = default);
    Task<RolSemanal?> ObtenerConDiasAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<RolSemanal> items, int total)> ListarAsync(
        string? empresa, Guid? zonaId, int? anio, int? numeroSemana, EstadoRol? estado,
        int page, int pageSize, CancellationToken ct = default);
    Task AgregarAsync(RolSemanal rol, CancellationToken ct = default);
}

/// <summary>Persistencia del historial append-only de cambios de rol.</summary>
public interface IHistorialRolRepository
{
    Task AgregarAsync(HistorialCambioRol registro, CancellationToken ct = default);
}
