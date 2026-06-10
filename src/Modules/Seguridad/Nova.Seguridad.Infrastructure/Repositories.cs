using Microsoft.EntityFrameworkCore;
using Nova.Seguridad.Application;
using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Infrastructure;

internal sealed class UsuarioRepository(SeguridadDbContext db) : IUsuarioRepository
{
    public Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default)
        => db.Usuarios.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<Usuario?> ObtenerPorNombreAsync(string nombreUsuario, CancellationToken ct = default)
        => db.Usuarios.FirstOrDefaultAsync(u => u.NombreUsuario == nombreUsuario, ct);

    public Task<bool> ExisteNombreAsync(string nombreUsuario, CancellationToken ct = default)
        => db.Usuarios.AnyAsync(u => u.NombreUsuario == nombreUsuario, ct);

    public async Task AgregarAsync(Usuario usuario, CancellationToken ct = default)
        => await db.Usuarios.AddAsync(usuario, ct);
}

internal sealed class AsignacionRolAmbitoRepository(SeguridadDbContext db) : IAsignacionRolAmbitoRepository
{
    public async Task<IReadOnlyList<AsignacionRolAmbito>> ObtenerVigentesPorUsuarioAsync(
        Guid idUsuario, DateOnly fecha, CancellationToken ct = default)
    {
        var candidatas = await db.Asignaciones
            .Where(a => a.IdUsuario == idUsuario && a.Estado == EstadoVigencia.Vigente)
            .ToListAsync(ct);

        // Filtro de vigencia temporal en memoria (regla de dominio EstaVigente).
        return candidatas.Where(a => a.EstaVigente(fecha)).ToList();
    }

    public async Task AgregarAsync(AsignacionRolAmbito asignacion, CancellationToken ct = default)
        => await db.Asignaciones.AddAsync(asignacion, ct);
}

internal sealed class CredencialRepository(SeguridadDbContext db) : ICredencialRepository
{
    public Task<Credencial?> ObtenerPorUsuarioAsync(Guid idUsuario, CancellationToken ct = default)
        => db.Credenciales.FirstOrDefaultAsync(c => c.IdUsuario == idUsuario, ct);

    public async Task AgregarAsync(Credencial credencial, CancellationToken ct = default)
        => await db.Credenciales.AddAsync(credencial, ct);
}
