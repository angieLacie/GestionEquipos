using Nova.SharedKernel;

namespace Nova.Seguridad.Domain;

/// <summary>
/// Usuario de Nova (segu.usuario). Identidad y vínculo RMS. `DATO SENSIBLE`.
/// Raíz del agregado de identidad: estados SEGU §6.1, unicidad de empleado activo RN-SEGU-03.
/// </summary>
public sealed class Usuario : Entity
{
    private Usuario() { } // EF

    private Usuario(
        Guid id,
        string nombreUsuario,
        TipoUsuario tipo,
        string? codigoEmpleadoRms,
        string correoContacto,
        MetodoAutenticacion metodo) : base(id)
    {
        NombreUsuario = nombreUsuario;
        TipoUsuario = tipo;
        CodigoEmpleadoRms = codigoEmpleadoRms;
        CorreoContacto = correoContacto;
        MetodoAutenticacion = metodo;
        Estado = EstadoUsuario.PendienteAsignacion;
        MfaHabilitado = false;
        FechaAlta = DateTimeOffset.UtcNow;
    }

    public string NombreUsuario { get; private set; } = default!;
    public TipoUsuario TipoUsuario { get; private set; }
    public string? CodigoEmpleadoRms { get; private set; }
    public string CorreoContacto { get; private set; } = default!;
    public EstadoUsuario Estado { get; private set; }
    public MetodoAutenticacion MetodoAutenticacion { get; private set; }
    public bool MfaHabilitado { get; private set; }
    public DateTimeOffset FechaAlta { get; private set; }
    public DateTimeOffset? FechaBaja { get; private set; }

    /// <summary>Alta de usuario con validación de invariantes (RN-SEGU-01: PERSONAL exige código RMS).</summary>
    public static Result<Usuario> Crear(
        string nombreUsuario,
        TipoUsuario tipo,
        string? codigoEmpleadoRms,
        string correoContacto,
        MetodoAutenticacion metodo)
    {
        if (string.IsNullOrWhiteSpace(nombreUsuario))
            return Result.Failure<Usuario>(Error.Validacion("El nombre de usuario es obligatorio."));
        if (string.IsNullOrWhiteSpace(correoContacto))
            return Result.Failure<Usuario>(Error.Validacion("El correo de contacto es obligatorio."));
        if (tipo == TipoUsuario.Personal && string.IsNullOrWhiteSpace(codigoEmpleadoRms))
            return Result.Failure<Usuario>(Error.Validacion("Un usuario PERSONAL requiere código de empleado RMS (RN-SEGU-01)."));

        return Result.Success(new Usuario(
            Guid.NewGuid(), nombreUsuario.Trim(), tipo, codigoEmpleadoRms?.Trim(), correoContacto.Trim(), metodo));
    }

    public bool PuedeIniciarSesion => Estado == EstadoUsuario.Activo;

    public void Activar() => Estado = EstadoUsuario.Activo;

    public void Bloquear() => Estado = EstadoUsuario.Bloqueado;

    public void Desactivar()
    {
        Estado = EstadoUsuario.Desactivado;
        FechaBaja = DateTimeOffset.UtcNow;
    }
}
