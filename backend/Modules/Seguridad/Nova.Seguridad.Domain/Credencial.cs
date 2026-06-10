using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

/// <summary>
/// Credencial local 1:1 con <see cref="Usuario"/> (segu.credencial). Argon2id (ADR-002).
/// El hash nunca se expone (RN-SEGU-10). Controla expiración y bloqueo por intentos (RN-SEGU-12).
/// </summary>
public sealed class Credencial : Entity
{
    public const int MaxIntentosFallidos = 5;

    private Credencial() { } // EF

    public Credencial(Guid idUsuario, string hashPassword, bool requiereCambio = true)
        : base(Guid.NewGuid())
    {
        IdUsuario = idUsuario;
        HashPassword = hashPassword;
        Algoritmo = "argon2id";
        FechaUltimoCambio = DateTimeOffset.UtcNow;
        RequiereCambio = requiereCambio;
        IntentosFallidos = 0;
    }

    public Guid IdUsuario { get; private set; }
    public string HashPassword { get; private set; } = default!;
    public string Algoritmo { get; private set; } = "argon2id";
    public DateTimeOffset FechaUltimoCambio { get; private set; }
    public bool RequiereCambio { get; private set; }
    public int IntentosFallidos { get; private set; }
    public DateTimeOffset? BloqueadoHasta { get; private set; }

    public bool EstaBloqueada(DateTimeOffset ahora)
        => BloqueadoHasta is not null && BloqueadoHasta > ahora;

    /// <summary>Registra intento fallido; bloquea temporalmente al alcanzar el tope (RN-SEGU-12).</summary>
    public void RegistrarFallo(DateTimeOffset ahora, TimeSpan duracionBloqueo)
    {
        IntentosFallidos++;
        if (IntentosFallidos >= MaxIntentosFallidos)
            BloqueadoHasta = ahora.Add(duracionBloqueo);
    }

    public void RegistrarExito()
    {
        IntentosFallidos = 0;
        BloqueadoHasta = null;
    }

    public void CambiarHash(string nuevoHash)
    {
        HashPassword = nuevoHash;
        FechaUltimoCambio = DateTimeOffset.UtcNow;
        RequiereCambio = false;
        RegistrarExito();
    }
}
