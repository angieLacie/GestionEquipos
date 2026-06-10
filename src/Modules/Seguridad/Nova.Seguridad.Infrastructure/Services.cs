using System.Security.Cryptography;
using Isopoh.Cryptography.Argon2;
using Microsoft.Extensions.Logging;
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

/// <summary>Genera OTP numérico con aleatoriedad criptográfica (RN-SEGU-33).</summary>
internal sealed class CodigoOtpGenerator : ICodigoOtpGenerator
{
    public string Generar(int longitud)
    {
        var digitos = new char[longitud];
        for (var i = 0; i < longitud; i++)
            digitos[i] = (char)('0' + RandomNumberGenerator.GetInt32(0, 10));
        return new string(digitos);
    }
}

/// <summary>Notificador por correo provisional: registra en log; NUNCA loguea el OTP en producción.</summary>
internal sealed class NotificadorCorreoLog(ILogger<NotificadorCorreoLog> logger) : INotificadorCorreo
{
    public Task EnviarCodigoOtpAsync(string correo, string codigo, CancellationToken ct = default)
    {
        // ⚠️ Solo desarrollo: el código se loguea para pruebas. Reemplazar por servicio de correo real.
        logger.LogWarning("[DEV] OTP para {Correo}: {Codigo}", correo, codigo);
        return Task.CompletedTask;
    }

    public Task NotificarCambioPasswordAsync(string correo, CancellationToken ct = default)
    {
        logger.LogInformation("Notificación de cambio de contraseña enviada a {Correo}.", correo);
        return Task.CompletedTask;
    }
}
