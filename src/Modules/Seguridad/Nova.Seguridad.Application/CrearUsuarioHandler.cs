using Nova.Seguridad.Domain;
using Nova.SharedKernel;

namespace Nova.Seguridad.Application;

/// <summary>Caso de uso CU-SEGU-01: alta de usuario + credencial inicial (requiere cambio).</summary>
public sealed class CrearUsuarioHandler(
    IUsuarioRepository usuarios,
    ICredencialRepository credenciales,
    IPasswordHasher hasher,
    IUnitOfWork uow)
{
    public async Task<Result<UsuarioResponse>> HandleAsync(CrearUsuarioRequest req, CancellationToken ct = default)
    {
        if (await usuarios.ExisteNombreAsync(req.NombreUsuario, ct))
            return Result.Failure<UsuarioResponse>(Error.Conflicto("El nombre de usuario ya existe."));

        var creacion = Usuario.Crear(
            req.NombreUsuario, req.TipoUsuario, req.CodigoEmpleadoRms, req.CorreoContacto, req.MetodoAutenticacion);
        if (creacion.IsFailure)
            return Result.Failure<UsuarioResponse>(creacion.Error);

        var usuario = creacion.Value;
        await usuarios.AgregarAsync(usuario, ct);

        if (req.MetodoAutenticacion == MetodoAutenticacion.Local)
        {
            var credencial = new Credencial(usuario.Id, hasher.Hash(req.PasswordInicial), requiereCambio: true);
            await credenciales.AgregarAsync(credencial, ct);
        }

        await uow.SaveChangesAsync(ct);
        return Result.Success(new UsuarioResponse(usuario.Id, usuario.NombreUsuario, usuario.TipoUsuario, usuario.Estado));
    }
}
