using Nova.Maestros.Domain;

namespace Nova.Maestros.Application;

/// <summary>Unidad de trabajo: confirma la transacción del módulo Maestros.</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

/// <summary>Reloj inyectable (testabilidad; UTC).</summary>
public interface IClock
{
    DateTimeOffset Now { get; }
    DateOnly Today { get; }
}

public interface IEmpresaRepository
{
    Task<IReadOnlyList<Empresa>> ListarAsync(CancellationToken ct = default);
    Task<Empresa?> ObtenerAsync(string codigo, CancellationToken ct = default);
}

public interface IZonaRepository
{
    Task<IReadOnlyList<Zona>> ListarAsync(string? idEmpresa, EstadoCatalogo? estado, CancellationToken ct = default);
    Task AgregarAsync(Zona zona, CancellationToken ct = default);
}

public interface ITiendaRepository
{
    Task<(IReadOnlyList<Tienda> items, int total)> ListarAsync(
        string? idEmpresa, Guid? idZona, EstadoTienda? estado, int page, int pageSize, CancellationToken ct = default);
    Task<Tienda?> ObtenerAsync(Guid id, CancellationToken ct = default);
    Task<Tienda?> ObtenerPorCodigoAsync(string codigo, CancellationToken ct = default);
    Task AgregarAsync(Tienda tienda, CancellationToken ct = default);
}

public interface IPuestoRepository
{
    Task<IReadOnlyList<Puesto>> ListarAsync(CancellationToken ct = default);
}

public interface IEmpleadoRepository
{
    Task<(IReadOnlyList<Empleado> items, int total)> ListarAsync(
        string? idEmpresa, string? zona, string? tienda, CategoriaRol? categoria, EstadoEmpleado? estado,
        string? busqueda, int page, int pageSize, CancellationToken ct = default);
    Task<Empleado?> ObtenerAsync(Guid id, CancellationToken ct = default);
    Task AgregarAsync(Empleado empleado, CancellationToken ct = default);
}

/// <summary>Roster de empleados leído en vivo desde RMS (vista cross-DB). Solo lectura.</summary>
public interface IEmpleadoRosterRepository
{
    Task<(IReadOnlyList<EmpleadoRoster> items, int total)> ListarAsync(
        string? empresa, string? zona, string? tienda, bool? soloSenior, string? busqueda,
        int page, int pageSize, CancellationToken ct = default);
}

public interface IRolRepository
{
    Task<IReadOnlyList<Rol>> ListarAsync(CancellationToken ct = default);
    Task<Rol?> ObtenerAsync(string codigo, CancellationToken ct = default);
}

public interface IPermisoRepository
{
    Task<IReadOnlyList<Permiso>> ListarAsync(ModuloNova? modulo, CancellationToken ct = default);
    Task<IReadOnlyList<Permiso>> ListarPorRolAsync(string idRol, CancellationToken ct = default);
}

public interface IFeriadoRepository
{
    Task<IReadOnlyList<Feriado>> ListarAsync(string? idEmpresa, int? anio, AlcanceFeriado? alcance, CancellationToken ct = default);
    /// <summary>Carga con tracking (incluye ámbitos) para editar/eliminar (CU-MAES-01).</summary>
    Task<Feriado?> ObtenerAsync(Guid id, CancellationToken ct = default);
    Task AgregarAsync(Feriado feriado, CancellationToken ct = default);
    Task EliminarAsync(Feriado feriado, CancellationToken ct = default);
}

public interface IParametroRepository
{
    Task<Parametro?> ObtenerVigenteAsync(string clave, DateOnly fecha, string? idEmpresa, string? idAmbito, CancellationToken ct = default);
    /// <summary>Igual que ObtenerVigenteAsync pero con tracking, para cerrar su vigencia (CU-MAES-04).</summary>
    Task<Parametro?> ObtenerVigenteParaCierreAsync(string clave, DateOnly fecha, string? idEmpresa, string? idAmbito, CancellationToken ct = default);
    Task<(IReadOnlyList<Parametro> items, int total)> ListarAsync(
        ModuloNova? modulo, string? flujo, Criticidad? criticidad, string? clave, int page, int pageSize, CancellationToken ct = default);
    Task<Parametro?> ObtenerAsync(Guid id, CancellationToken ct = default);
    Task AgregarAsync(Parametro parametro, CancellationToken ct = default);
}

public interface ISemanaCampaniaRepository
{
    Task<IReadOnlyList<SemanaCampania>> ListarAsync(string? idEmpresa, int? anio, CancellationToken ct = default);
    Task<SemanaCampania?> ObtenerAsync(Guid id, CancellationToken ct = default);
    Task AgregarAsync(SemanaCampania semana, CancellationToken ct = default);
    Task EliminarAsync(SemanaCampania semana, CancellationToken ct = default);
}

public interface IAuditoriaMaestrosRepository
{
    Task AgregarAsync(AuditoriaMaestros registro, CancellationToken ct = default);
    /// <summary>Historial de cambios de configuración con nombre de usuario resuelto (CU-MAES-07).</summary>
    Task<(IReadOnlyList<AuditoriaResponse> items, int total)> ListarAsync(
        string? elemento, AccionConfig? accion, DateOnly? desde, DateOnly? hasta,
        int page, int pageSize, CancellationToken ct = default);
}
