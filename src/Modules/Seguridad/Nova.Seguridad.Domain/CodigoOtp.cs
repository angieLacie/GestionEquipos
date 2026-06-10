using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

public enum EstadoOtp
{
    Activo = 1,
    Verificado = 2,
    Usado = 3,
    Invalidado = 4
}

/// <summary>
/// Código OTP de recuperación de contraseña (CU-SEGU-10). `DATO SENSIBLE`.
/// Se almacena el hash, nunca el código en claro (RN-SEGU-33). TTL RN-SEGU-34, intentos RN-SEGU-35.
/// </summary>
public sealed class CodigoOtp : Entity
{
    private CodigoOtp() { } // EF

    private CodigoOtp(Guid id, Guid idUsuario, string hashCodigo, DateTimeOffset expiraEn, int maxIntentos) : base(id)
    {
        IdUsuario = idUsuario;
        HashCodigo = hashCodigo;
        ExpiraEn = expiraEn;
        MaxIntentos = maxIntentos;
        Intentos = 0;
        Estado = EstadoOtp.Activo;
        CreadoEn = DateTimeOffset.UtcNow;
    }

    public Guid IdUsuario { get; private set; }
    public string HashCodigo { get; private set; } = default!;
    public DateTimeOffset ExpiraEn { get; private set; }
    public int Intentos { get; private set; }
    public int MaxIntentos { get; private set; }
    public EstadoOtp Estado { get; private set; }
    public DateTimeOffset CreadoEn { get; private set; }

    public static CodigoOtp Emitir(Guid idUsuario, string hashCodigo, DateTimeOffset ahora, int ttlMinutos, int maxIntentos)
        => new(Guid.NewGuid(), idUsuario, hashCodigo, ahora.AddMinutes(ttlMinutos), maxIntentos);

    public bool EsValidoParaVerificar(DateTimeOffset ahora)
        => Estado == EstadoOtp.Activo && ExpiraEn > ahora && Intentos < MaxIntentos;

    /// <summary>Resultado de un intento de verificación; controla invalidación por intentos (RN-SEGU-35).</summary>
    public Result RegistrarIntento(bool coincide, DateTimeOffset ahora)
    {
        if (!EsValidoParaVerificar(ahora))
            return Result.Failure(Error.NoAutorizado("El código no es válido. Solicita uno nuevo."));

        if (coincide)
        {
            Estado = EstadoOtp.Verificado;
            return Result.Success();
        }

        Intentos++;
        if (Intentos >= MaxIntentos)
            Estado = EstadoOtp.Invalidado;
        return Result.Failure(Error.NoAutorizado("El código ingresado no es válido."));
    }

    public void Invalidar() => Estado = EstadoOtp.Invalidado;

    public void MarcarUsado() => Estado = EstadoOtp.Usado;
}
