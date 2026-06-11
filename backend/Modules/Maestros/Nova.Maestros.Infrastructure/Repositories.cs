using Microsoft.EntityFrameworkCore;
using Nova.Maestros.Application;
using Nova.Maestros.Domain;

namespace Nova.Maestros.Infrastructure;

internal sealed class EmpresaRepository(MaestrosDbContext db) : IEmpresaRepository
{
    public async Task<IReadOnlyList<Empresa>> ListarAsync(CancellationToken ct = default)
        => await db.Empresas.AsNoTracking().ToListAsync(ct);

    public Task<Empresa?> ObtenerAsync(string codigo, CancellationToken ct = default)
        => db.Empresas.FirstOrDefaultAsync(e => e.Codigo == codigo, ct);
}

internal sealed class ZonaRepository(MaestrosDbContext db) : IZonaRepository
{
    public async Task<IReadOnlyList<Zona>> ListarAsync(string? idEmpresa, EstadoCatalogo? estado, CancellationToken ct = default)
    {
        var q = db.Zonas.AsNoTracking().AsQueryable();
        if (idEmpresa is not null) q = q.Where(z => z.IdEmpresa == idEmpresa);
        if (estado is not null) q = q.Where(z => z.Estado == estado);
        return await q.ToListAsync(ct);
    }

    public async Task AgregarAsync(Zona zona, CancellationToken ct = default)
        => await db.Zonas.AddAsync(zona, ct);
}

internal sealed class TiendaRepository(MaestrosDbContext db) : ITiendaRepository
{
    public async Task<(IReadOnlyList<Tienda> items, int total)> ListarAsync(
        string? idEmpresa, Guid? idZona, EstadoTienda? estado, int page, int pageSize, CancellationToken ct = default)
    {
        var q = db.Tiendas.AsNoTracking().AsQueryable();
        if (idEmpresa is not null) q = q.Where(t => t.IdEmpresa == idEmpresa);
        if (idZona is not null) q = q.Where(t => t.IdZona == idZona);
        if (estado is not null) q = q.Where(t => t.EstadoOperativo == estado);
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(t => t.Codigo).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public Task<Tienda?> ObtenerAsync(Guid id, CancellationToken ct = default)
        => db.Tiendas.FirstOrDefaultAsync(t => t.Id == id, ct);

    public Task<Tienda?> ObtenerPorCodigoAsync(string codigo, CancellationToken ct = default)
        => db.Tiendas.FirstOrDefaultAsync(t => t.Codigo == codigo, ct);

    public async Task AgregarAsync(Tienda tienda, CancellationToken ct = default)
        => await db.Tiendas.AddAsync(tienda, ct);
}

internal sealed class PuestoRepository(MaestrosDbContext db) : IPuestoRepository
{
    public async Task<IReadOnlyList<Puesto>> ListarAsync(CancellationToken ct = default)
        => await db.Puestos.AsNoTracking().ToListAsync(ct);
}

internal sealed class EmpleadoRepository(MaestrosDbContext db) : IEmpleadoRepository
{
    public async Task<(IReadOnlyList<Empleado> items, int total)> ListarAsync(
        string? idEmpresa, string? zona, string? tienda, CategoriaRol? categoria, EstadoEmpleado? estado,
        string? busqueda, int page, int pageSize, CancellationToken ct = default)
    {
        var q = db.Empleados.AsNoTracking().AsQueryable();
        if (idEmpresa is not null) q = q.Where(e => e.IdEmpresa == idEmpresa);
        if (zona is not null) q = q.Where(e => e.Zona == zona);
        if (tienda is not null) q = q.Where(e => e.Tienda == tienda);
        if (categoria is not null) q = q.Where(e => e.Categoria == categoria);
        if (estado is not null) q = q.Where(e => e.Estado == estado);
        if (!string.IsNullOrWhiteSpace(busqueda))
            q = q.Where(e => e.NombreCompleto.Contains(busqueda) || e.Cargo.Contains(busqueda));
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(e => e.Zona).ThenBy(e => e.Tienda).ThenBy(e => e.NombreCompleto)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public Task<Empleado?> ObtenerAsync(Guid id, CancellationToken ct = default)
        => db.Empleados.FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task AgregarAsync(Empleado empleado, CancellationToken ct = default)
        => await db.Empleados.AddAsync(empleado, ct);
}

internal sealed class EmpleadoRosterRepository(MaestrosDbContext db) : IEmpleadoRosterRepository
{
    public async Task<(IReadOnlyList<EmpleadoRoster> items, int total)> ListarAsync(
        string? empresa, string? zona, string? tienda, bool? soloSenior, string? busqueda,
        int page, int pageSize, CancellationToken ct = default)
    {
        var q = db.Roster.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(empresa)) q = q.Where(e => e.EmpresaCod == empresa);
        if (!string.IsNullOrWhiteSpace(zona)) q = q.Where(e => e.Zona == zona);
        if (!string.IsNullOrWhiteSpace(tienda)) q = q.Where(e => e.Tienda == tienda);
        if (soloSenior is not null) q = q.Where(e => e.EsSenior == soloSenior);
        if (!string.IsNullOrWhiteSpace(busqueda))
            q = q.Where(e => e.NombreCompleto.Contains(busqueda) || e.PuestoDesc!.Contains(busqueda));
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(e => e.Zona).ThenBy(e => e.Tienda).ThenBy(e => e.NombreCompleto)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }
}

internal sealed class RolRepository(MaestrosDbContext db) : IRolRepository
{
    public async Task<IReadOnlyList<Rol>> ListarAsync(CancellationToken ct = default)
        => await db.Roles.AsNoTracking().ToListAsync(ct);

    public Task<Rol?> ObtenerAsync(string codigo, CancellationToken ct = default)
        => db.Roles.FirstOrDefaultAsync(r => r.Codigo == codigo, ct);
}

internal sealed class PermisoRepository(MaestrosDbContext db) : IPermisoRepository
{
    public async Task<IReadOnlyList<Permiso>> ListarAsync(ModuloNova? modulo, CancellationToken ct = default)
    {
        var q = db.Permisos.AsNoTracking().AsQueryable();
        if (modulo is not null) q = q.Where(p => p.Modulo == modulo);
        return await q.ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Permiso>> ListarPorRolAsync(string idRol, CancellationToken ct = default)
        => await (from rp in db.RolesPermisos.AsNoTracking()
                  join p in db.Permisos.AsNoTracking() on rp.ClavePermiso equals p.Clave
                  where rp.IdRol == idRol
                  select p).ToListAsync(ct);
}

internal sealed class FeriadoRepository(MaestrosDbContext db) : IFeriadoRepository
{
    public async Task<IReadOnlyList<Feriado>> ListarAsync(
        string? idEmpresa, int? anio, AlcanceFeriado? alcance, CancellationToken ct = default)
    {
        var q = db.Feriados.AsNoTracking().Include(f => f.Ambitos).AsQueryable();
        if (anio is not null) q = q.Where(f => f.Fecha.Year == anio);
        if (alcance is not null) q = q.Where(f => f.Alcance == alcance);
        if (idEmpresa is not null) q = q.Where(f => f.EmpresasAplicables.Contains(idEmpresa));
        return await q.OrderBy(f => f.Fecha).ToListAsync(ct);
    }

    public async Task AgregarAsync(Feriado feriado, CancellationToken ct = default)
        => await db.Feriados.AddAsync(feriado, ct);
}

internal sealed class ParametroRepository(MaestrosDbContext db) : IParametroRepository
{
    public async Task<Parametro?> ObtenerVigenteAsync(
        string clave, DateOnly fecha, string? idEmpresa, string? idAmbito, CancellationToken ct = default)
    {
        var candidatos = await db.Parametros.AsNoTracking()
            .Where(p => p.Clave == clave
                && (idEmpresa == null || p.IdEmpresa == idEmpresa)
                && (idAmbito == null || p.IdAmbito == idAmbito))
            .ToListAsync(ct);

        // Filtro de vigencia en memoria (EstaVigente); el más específico/reciente gana.
        return candidatos
            .Where(p => p.EstaVigente(fecha))
            .OrderByDescending(p => p.VigenciaDesde)
            .FirstOrDefault();
    }

    public async Task<(IReadOnlyList<Parametro> items, int total)> ListarAsync(
        ModuloNova? modulo, string? flujo, Criticidad? criticidad, string? clave, int page, int pageSize, CancellationToken ct = default)
    {
        var q = db.Parametros.AsNoTracking().AsQueryable();
        if (modulo is not null) q = q.Where(p => p.Modulo == modulo);
        if (flujo is not null) q = q.Where(p => p.Flujo == flujo);
        if (criticidad is not null) q = q.Where(p => p.CriticidadConsumo == criticidad);
        if (clave is not null) q = q.Where(p => p.Clave == clave);
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(p => p.Clave).ThenByDescending(p => p.VigenciaDesde)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public Task<Parametro?> ObtenerAsync(Guid id, CancellationToken ct = default)
        => db.Parametros.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task AgregarAsync(Parametro parametro, CancellationToken ct = default)
        => await db.Parametros.AddAsync(parametro, ct);
}

internal sealed class SemanaCampaniaRepository(MaestrosDbContext db) : ISemanaCampaniaRepository
{
    public async Task<IReadOnlyList<SemanaCampania>> ListarAsync(string? idEmpresa, int? anio, CancellationToken ct = default)
    {
        var q = db.SemanasCampania.AsNoTracking().AsQueryable();
        if (idEmpresa is not null) q = q.Where(s => s.IdEmpresa == idEmpresa);
        if (anio is not null) q = q.Where(s => s.Desde.Year == anio || s.Hasta.Year == anio);
        return await q.OrderBy(s => s.Desde).ToListAsync(ct);
    }

    public async Task AgregarAsync(SemanaCampania semana, CancellationToken ct = default)
        => await db.SemanasCampania.AddAsync(semana, ct);
}

internal sealed class AuditoriaMaestrosRepository(MaestrosDbContext db) : IAuditoriaMaestrosRepository
{
    public async Task AgregarAsync(AuditoriaMaestros registro, CancellationToken ct = default)
        => await db.Auditoria.AddAsync(registro, ct);
}
