using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Application;

public sealed record CrearUsuarioRequest(
    string NombreUsuario,
    TipoUsuario TipoUsuario,
    string? CodigoEmpleadoRms,
    string CorreoContacto,
    MetodoAutenticacion MetodoAutenticacion,
    string PasswordInicial);

public sealed record UsuarioResponse(
    Guid Id,
    string NombreUsuario,
    TipoUsuario TipoUsuario,
    EstadoUsuario Estado);

public sealed record LoginRequest(string NombreUsuario, string Password);

public sealed record LoginResponse(
    Guid IdUsuario,
    string NombreUsuario,
    bool RequiereCambioPassword,
    string Token);
