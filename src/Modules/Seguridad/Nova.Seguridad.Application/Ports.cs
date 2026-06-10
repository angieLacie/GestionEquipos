using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Application;

/// <summary>Puerto de persistencia de usuarios (driven port, hexagonal).</summary>
public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
    Task<Usuario?> ObtenerPorNombreAsync(string nombreUsuario, CancellationToken ct = default);
    Task<bool> ExisteNombreAsync(string nombreUsuario, CancellationToken ct = default);
    Task AgregarAsync(Usuario usuario, CancellationToken ct = default);
}

/// <summary>Puerto de persistencia de credenciales.</summary>
public interface ICredencialRepository
{
    Task<Credencial?> ObtenerPorUsuarioAsync(Guid idUsuario, CancellationToken ct = default);
    Task AgregarAsync(Credencial credencial, CancellationToken ct = default);
}

/// <summary>Hasher de contraseñas (Argon2id, ADR-002). El dominio nunca conoce la implementación.</summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

/// <summary>Reloj inyectable (testabilidad; UTC).</summary>
public interface IClock
{
    DateTimeOffset Now { get; }
}

/// <summary>Unidad de trabajo: confirma la transacción del módulo.</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
