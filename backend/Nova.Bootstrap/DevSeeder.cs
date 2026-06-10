using Microsoft.EntityFrameworkCore;
using Nova.Seguridad.Application;
using Nova.Seguridad.Domain;
using Nova.Seguridad.Infrastructure;

namespace Nova.Bootstrap;

/// <summary>
/// Siembra un usuario ADM de desarrollo (solo Development) para poder iniciar sesión.
/// Idempotente. NO usar en producción.
/// </summary>
public static class DevSeeder
{
    public const string Usuario = "admin";
    public const string Password = "Nova2026!";

    public static async Task SeedAdminAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SeguridadDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        if (await db.Usuarios.AnyAsync(u => u.NombreUsuario == Usuario))
            return;

        var usuario = Nova.Seguridad.Domain.Usuario.Crear(
            Usuario, TipoUsuario.TecnicoCentral, null, "admin@nova.local", MetodoAutenticacion.Local).Value;
        usuario.Activar();
        await db.Usuarios.AddAsync(usuario);

        var credencial = new Credencial(usuario.Id, hasher.Hash(Password), requiereCambio: false);
        await db.Credenciales.AddAsync(credencial);

        var asignacion = AsignacionRolAmbito.Crear(
            usuario.Id, "R-ADM", TipoAmbito.Central, null, null, null,
            "Seed de desarrollo", DateOnly.FromDateTime(DateTime.UtcNow), null);
        if (asignacion.IsSuccess)
            await db.Asignaciones.AddAsync(asignacion.Value);

        await db.SaveChangesAsync();
    }
}
