using Nova.Seguridad.Domain;
using Nova.SharedKernel;

namespace Nova.Seguridad.Application;

public sealed record SolicitarOtpRequest(string Correo);
public sealed record VerificarOtpRequest(string Correo, string Codigo);
public sealed record VerificarOtpResponse(string TokenReset);
public sealed record RestablecerPasswordRequest(string TokenReset, string NuevaPassword);

/// <summary>Mensaje genérico anti-enumeración (RN-SEGU-32), idéntico exista o no el correo.</summary>
public sealed record MensajeGenerico(string Mensaje)
{
    public static readonly MensajeGenerico Recuperacion =
        new("Si el correo está registrado, enviaremos un código de verificación.");
}

/// <summary>CU-SEGU-10 paso 1-3: solicitar código. Siempre responde genérico (anti-enumeración).</summary>
public sealed class SolicitarOtpHandler(
    IUsuarioRepository usuarios,
    ICodigoOtpRepository codigos,
    ICodigoOtpGenerator generador,
    IPasswordHasher hasher,
    INotificadorCorreo notificador,
    IAuditoriaRepository auditoria,
    OtpPolicy policy,
    IClock clock,
    IUnitOfWork uow)
{
    public async Task<MensajeGenerico> HandleAsync(SolicitarOtpRequest req, CancellationToken ct = default)
    {
        var usuario = await usuarios.ObtenerPorCorreoAsync(req.Correo, ct);

        // Solo usuario ACTIVO + LOCAL recibe código; el resto NO se distingue (A2/A3, RN-SEGU-32).
        if (usuario is { Estado: EstadoUsuario.Activo, MetodoAutenticacion: MetodoAutenticacion.Local })
        {
            await codigos.InvalidarActivosDeUsuarioAsync(usuario.Id, ct); // RN-SEGU-37

            var codigoPlano = generador.Generar(policy.Longitud);
            var otp = CodigoOtp.Emitir(usuario.Id, hasher.Hash(codigoPlano), clock.Now, policy.TtlMinutos, policy.MaxIntentos);
            await codigos.AgregarAsync(otp, ct);
            await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
                EventoAudit.RecupPwdSolicitud, usuario.Id, ResultadoAudit.Exitoso, clock.Now, usuario.Id), ct);
            await uow.SaveChangesAsync(ct);

            await notificador.EnviarCodigoOtpAsync(usuario.CorreoContacto, codigoPlano, ct);
        }

        return MensajeGenerico.Recuperacion;
    }
}

/// <summary>CU-SEGU-10 paso 6: verificar código; emite token de un solo uso si es válido.</summary>
public sealed class VerificarOtpHandler(
    IUsuarioRepository usuarios,
    ICodigoOtpRepository codigos,
    IPasswordHasher hasher,
    IResetTokenService resetTokens,
    IAuditoriaRepository auditoria,
    IClock clock,
    IUnitOfWork uow)
{
    private static readonly Error Invalido = Error.NoAutorizado("El código ingresado no es válido.");

    public async Task<Result<VerificarOtpResponse>> HandleAsync(VerificarOtpRequest req, CancellationToken ct = default)
    {
        var usuario = await usuarios.ObtenerPorCorreoAsync(req.Correo, ct);
        if (usuario is null)
            return Result.Failure<VerificarOtpResponse>(Invalido);

        var otp = await codigos.ObtenerActivoPorUsuarioAsync(usuario.Id, ct);
        if (otp is null)
            return Result.Failure<VerificarOtpResponse>(Invalido);

        var coincide = hasher.Verify(req.Codigo, otp.HashCodigo);
        var intento = otp.RegistrarIntento(coincide, clock.Now);

        if (intento.IsFailure)
        {
            var evento = otp.Estado == EstadoOtp.Invalidado ? EventoAudit.RecupPwdBloqueo : EventoAudit.RecupPwdVerificacion;
            await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
                evento, usuario.Id, ResultadoAudit.Fallido, clock.Now, usuario.Id), ct);
            await uow.SaveChangesAsync(ct);
            return Result.Failure<VerificarOtpResponse>(intento.Error);
        }

        var token = resetTokens.EmitirTokenReset(usuario.Id);
        await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
            EventoAudit.RecupPwdVerificacion, usuario.Id, ResultadoAudit.Exitoso, clock.Now, usuario.Id), ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new VerificarOtpResponse(token));
    }
}

/// <summary>CU-SEGU-10 paso 8-9: establecer nueva contraseña con el token de un solo uso.</summary>
public sealed class RestablecerPasswordHandler(
    ICredencialRepository credenciales,
    ICodigoOtpRepository codigos,
    IUsuarioRepository usuarios,
    IResetTokenService resetTokens,
    IPasswordHasher hasher,
    INotificadorCorreo notificador,
    IAuditoriaRepository auditoria,
    OtpPolicy policy,
    IClock clock,
    IUnitOfWork uow)
{
    public async Task<Result> HandleAsync(RestablecerPasswordRequest req, CancellationToken ct = default)
    {
        var idUsuario = resetTokens.ValidarTokenReset(req.TokenReset);
        if (idUsuario is null)
            return Result.Failure(Error.NoAutorizado("Token de restablecimiento inválido o expirado."));

        // Política SEGU_PWD_* (provisional: longitud mínima; historial/complejidad pendientes — RN-SEGU-10/38).
        if (string.IsNullOrWhiteSpace(req.NuevaPassword) || req.NuevaPassword.Length < policy.LongitudMinPassword)
            return Result.Failure(Error.Validacion($"La contraseña debe tener al menos {policy.LongitudMinPassword} caracteres."));

        var otp = await codigos.ObtenerActivoPorUsuarioAsync(idUsuario.Value, ct);
        if (otp is null || otp.Estado != EstadoOtp.Verificado)
            return Result.Failure(Error.NoAutorizado("No hay una verificación de código válida."));

        var credencial = await credenciales.ObtenerPorUsuarioAsync(idUsuario.Value, ct);
        if (credencial is null)
            return Result.Failure(Error.NoEncontrado("Credencial no encontrada."));

        credencial.CambiarHash(hasher.Hash(req.NuevaPassword)); // reinicia intentos fallidos de login
        otp.MarcarUsado(); // RN-SEGU-37: invalida el código tras uso
        // TODO(sesiones): cerrar sesiones activas del usuario (RN-SEGU-38) al existir el store de sesión.

        await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
            EventoAudit.RecupPwdCambio, idUsuario.Value, ResultadoAudit.Exitoso, clock.Now, idUsuario.Value), ct);
        await uow.SaveChangesAsync(ct);

        var usuario = await usuarios.ObtenerPorIdAsync(idUsuario.Value, ct);
        if (usuario is not null)
            await notificador.NotificarCambioPasswordAsync(usuario.CorreoContacto, ct);

        return Result.Success();
    }
}
