using Microsoft.EntityFrameworkCore;
using Nova.Rol.Application;
using Nova.Rol.Domain;

namespace Nova.Rol.Infrastructure;

internal sealed class RolSemanalRepository(RolDbContext db) : IRolSemanalRepository
{
    public Task<RolSemanal?> ObtenerAsync(Guid id, CancellationToken ct = default)
        => db.Roles.FirstOrDefaultAsync(r => r.Id == id, ct);

    public Task<RolSemanal?> ObtenerConDiasAsync(Guid id, CancellationToken ct = default)
        => db.Roles.Include(r => r.Dias).FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<(IReadOnlyList<RolSemanal> items, int total)> ListarAsync(
        string? empresa, Guid? zonaId, int? anio, int? numeroSemana, EstadoRol? estado,
        int page, int pageSize, CancellationToken ct = default)
    {
        var q = db.Roles.AsNoTracking().AsQueryable();
        if (empresa is not null) q = q.Where(r => r.Empresa == empresa);
        if (zonaId is not null) q = q.Where(r => r.ZonaId == zonaId);
        if (anio is not null) q = q.Where(r => r.Anio == anio);
        if (numeroSemana is not null) q = q.Where(r => r.NumeroSemana == numeroSemana);
        if (estado is not null) q = q.Where(r => r.Estado == estado);
        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(r => r.Anio).ThenByDescending(r => r.NumeroSemana)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task AgregarAsync(RolSemanal rol, CancellationToken ct = default)
        => await db.Roles.AddAsync(rol, ct);
}

internal sealed class HistorialRolRepository(RolDbContext db) : IHistorialRolRepository
{
    public async Task AgregarAsync(HistorialCambioRol registro, CancellationToken ct = default)
        => await db.Historial.AddAsync(registro, ct);
}

internal sealed class SystemClock : IClock
{
    public DateTimeOffset Now => DateTimeOffset.UtcNow;
    public DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);
}
