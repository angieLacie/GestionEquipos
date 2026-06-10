using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Application;

/// <summary>Persistencia de códigos OTP de recuperación.</summary>
public interface ICodigoOtpRepository
{
    Task<CodigoOtp?> ObtenerActivoPorUsuarioAsync(Guid idUsuario, CancellationToken ct = default);
    Task InvalidarActivosDeUsuarioAsync(Guid idUsuario, CancellationToken ct = default);
    Task AgregarAsync(CodigoOtp codigo, CancellationToken ct = default);
}

/// <summary>Genera un código OTP numérico con aleatoriedad criptográfica (RN-SEGU-33).</summary>
public interface ICodigoOtpGenerator
{
    string Generar(int longitud);
}

/// <summary>Envío de notificaciones (correo). Adaptador externo; stub hasta integrar el servicio real.</summary>
public interface INotificadorCorreo
{
    Task EnviarCodigoOtpAsync(string correo, string codigo, CancellationToken ct = default);
    Task NotificarCambioPasswordAsync(string correo, CancellationToken ct = default);
}

/// <summary>
/// Política de OTP/contraseña (parámetros SEGU_OTP_* / SEGU_PWD_* en Maestros).
/// Provisional: valores por defecto hasta que exista el módulo Maestros.
/// </summary>
public sealed class OtpPolicy
{
    public int Longitud { get; init; } = 6;        // SEGU_OTP_LONGITUD
    public int TtlMinutos { get; init; } = 10;      // SEGU_OTP_TTL_MIN
    public int MaxIntentos { get; init; } = 5;      // SEGU_OTP_MAX_INTENTOS
    public int LongitudMinPassword { get; init; } = 10; // SEGU_PWD_LONGITUD_MIN
}

/// <summary>Token de un solo uso para el paso de establecer nueva contraseña (RN-SEGU-37).</summary>
public interface IResetTokenService
{
    string EmitirTokenReset(Guid idUsuario);
    Guid? ValidarTokenReset(string token);
}
