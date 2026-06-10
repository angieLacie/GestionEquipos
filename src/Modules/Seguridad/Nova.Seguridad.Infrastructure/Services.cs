using Isopoh.Cryptography.Argon2;
using Nova.Seguridad.Application;

namespace Nova.Seguridad.Infrastructure;

/// <summary>Hasher Argon2id (ADR-002). Sal y parámetros embebidos en el hash codificado.</summary>
internal sealed class Argon2PasswordHasher : IPasswordHasher
{
    public string Hash(string password) => Argon2.Hash(password);

    public bool Verify(string password, string hash) => Argon2.Verify(hash, password);
}

internal sealed class SystemClock : IClock
{
    public DateTimeOffset Now => DateTimeOffset.UtcNow;
}
