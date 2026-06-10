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

internal sealed class CredencialRepository(SeguridadDbContext db) : ICredencialRepository
{
    public Task<Credencial?> ObtenerPorUsuarioAsync(Guid idUsuario, CancellationToken ct = default)
        => db.Credenciales.FirstOrDefaultAsync(c => c.IdUsuario == idUsuario, ct);

    public async Task AgregarAsync(Credencial credencial, CancellationToken ct = default)
        => await db.Credenciales.AddAsync(credencial, ct);
}
