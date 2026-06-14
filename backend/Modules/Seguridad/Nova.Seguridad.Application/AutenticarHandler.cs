using Nova.Seguridad.Domain;
using Nova.SharedKernel;

namespace Nova.Seguridad.Application;

/// <summary>
/// Caso de uso CU-SEGU-02: login local. Aplica bloqueo por intentos (RN-SEGU-12)
/// y fallo seguro: respuesta indistinguible ante usuario inexistente / credencial inválida.
/// </summary>
public sealed class AutenticarHandler(
    IUsuarioRepository usuarios,
    ICredencialRepository credenciales,
    IPasswordHasher hasher,
    IClock clock,
    ITokenService tokens,
    IAuditoriaRepository auditoria,
    IAsignacionRolAmbitoRepository asignaciones,
    IUnitOfWork uow)
{
    private static readonly TimeSpan DuracionBloqueo = TimeSpan.FromMinutes(15);
    private static readonly Error CredencialesInvalidas = Error.NoAutorizado("Credenciales inválidas.");

    public async Task<Result<LoginResponse>> HandleAsync(LoginRequest req, CancellationToken ct = default)
    {
        var usuario = await usuarios.ObtenerPorNombreAsync(req.NombreUsuario, ct);
        if (usuario is null)
            return Result.Failure<LoginResponse>(CredencialesInvalidas);

        var credencial = await credenciales.ObtenerPorUsuarioAsync(usuario.Id, ct);
        if (credencial is null)
            return Result.Failure<LoginResponse>(CredencialesInvalidas);

        if (credencial.EstaBloqueada(clock.Now))
            return Result.Failure<LoginResponse>(Error.NoAutorizado("Cuenta bloqueada temporalmente. Intente más tarde."));

        if (!usuario.PuedeIniciarSesion)
            return Result.Failure<LoginResponse>(CredencialesInvalidas);

        if (!hasher.Verify(req.Password, credencial.HashPassword))
        {
            credencial.RegistrarFallo(clock.Now, DuracionBloqueo);
            var evento = credencial.EstaBloqueada(clock.Now) ? EventoAudit.Bloqueo : EventoAudit.LoginFallido;
            await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
                evento, usuario.Id, ResultadoAudit.Fallido, clock.Now, usuario.Id), ct);
            await uow.SaveChangesAsync(ct);
            return Result.Failure<LoginResponse>(CredencialesInvalidas);
        }

        credencial.RegistrarExito();
        await auditoria.AgregarAsync(AuditoriaSeguridad.Registrar(
            EventoAudit.LoginOk, usuario.Id, ResultadoAudit.Exitoso, clock.Now, usuario.Id), ct);
        await uow.SaveChangesAsync(ct);

        var token = tokens.EmitirToken(usuario.Id, usuario.NombreUsuario);
        var hoy = DateOnly.FromDateTime(clock.Now.UtcDateTime);
        var vigentes = await asignaciones.ObtenerVigentesPorUsuarioAsync(usuario.Id, hoy, ct);
        var roles = vigentes.Select(a => a.IdRol).Distinct().ToList();
        return Result.Success(new LoginResponse(usuario.Id, usuario.NombreUsuario, credencial.RequiereCambio, token, roles));
    }
}
