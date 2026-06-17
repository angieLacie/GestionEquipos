using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nova.Maestros.Application;
using Nova.Maestros.Domain;

namespace Nova.Maestros.Infrastructure;

/// <summary>
/// Contexto EF Core del bounded context Maestros. Mapea al esquema SQL Server [maes].
/// Un esquema por módulo (ADR-006): catálogos y parámetros transversales versionados.
/// </summary>
public sealed class MaestrosDbContext(DbContextOptions<MaestrosDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public const string Schema = "maes";

    public DbSet<Empresa> Empresas => Set<Empresa>();
    public DbSet<Zona> Zonas => Set<Zona>();
    public DbSet<Tienda> Tiendas => Set<Tienda>();
    public DbSet<Puesto> Puestos => Set<Puesto>();
    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<EmpleadoRoster> Roster => Set<EmpleadoRoster>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Permiso> Permisos => Set<Permiso>();
    public DbSet<RolPermiso> RolesPermisos => Set<RolPermiso>();
    public DbSet<Feriado> Feriados => Set<Feriado>();
    public DbSet<AmbitoFeriado> AmbitosFeriado => Set<AmbitoFeriado>();
    public DbSet<Parametro> Parametros => Set<Parametro>();
    public DbSet<SemanaCampania> SemanasCampania => Set<SemanaCampania>();
    public DbSet<AuditoriaMaestros> Auditoria => Set<AuditoriaMaestros>();
    /// <summary>Read model cross-schema sobre segu.usuario: resuelve el nombre del actor en auditoría.</summary>
    public DbSet<UsuarioRef> UsuariosRef => Set<UsuarioRef>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfiguration(new EmpresaConfiguration());
        modelBuilder.ApplyConfiguration(new ZonaConfiguration());
        modelBuilder.ApplyConfiguration(new TiendaConfiguration());
        modelBuilder.ApplyConfiguration(new PuestoConfiguration());
        modelBuilder.ApplyConfiguration(new EmpleadoConfiguration());
        modelBuilder.ApplyConfiguration(new EmpleadoRosterConfiguration());
        modelBuilder.ApplyConfiguration(new RolConfiguration());
        modelBuilder.ApplyConfiguration(new PermisoConfiguration());
        modelBuilder.ApplyConfiguration(new RolPermisoConfiguration());
        modelBuilder.ApplyConfiguration(new FeriadoConfiguration());
        modelBuilder.ApplyConfiguration(new AmbitoFeriadoConfiguration());
        modelBuilder.ApplyConfiguration(new ParametroConfiguration());
        modelBuilder.ApplyConfiguration(new SemanaCampaniaConfiguration());
        modelBuilder.ApplyConfiguration(new AuditoriaMaestrosConfiguration());
        modelBuilder.ApplyConfiguration(new UsuarioRefConfiguration());

        MaestrosSeedData.Seed(modelBuilder);
    }
}

internal sealed class EmpresaConfiguration : IEntityTypeConfiguration<Empresa>
{
    public void Configure(EntityTypeBuilder<Empresa> b)
    {
        b.ToTable("empresa");
        b.HasKey(e => e.Codigo);
        b.Property(e => e.Codigo).HasColumnName("id_empresa").HasMaxLength(10);
        b.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(80).IsRequired();
        b.Property(e => e.DiaInicioSemana).HasColumnName("dia_inicio_semana").HasConversion<string>().HasMaxLength(10);
        b.Property(e => e.ExisteCoberturaTipoVenta).HasColumnName("existe_cobertura_tipo_venta");
        b.Property(e => e.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(12);
    }
}

internal sealed class ZonaConfiguration : IEntityTypeConfiguration<Zona>
{
    public void Configure(EntityTypeBuilder<Zona> b)
    {
        b.ToTable("zona");
        b.HasKey(z => z.Id);
        b.Property(z => z.Id).HasColumnName("id_zona");
        b.Property(z => z.Nombre).HasColumnName("nombre").HasMaxLength(80).IsRequired();
        b.Property(z => z.IdEmpresa).HasColumnName("id_empresa").HasMaxLength(10).IsRequired();
        b.Property(z => z.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(12);
        b.HasIndex(z => z.IdEmpresa).HasDatabaseName("idx_zona_empresa");
    }
}

internal sealed class TiendaConfiguration : IEntityTypeConfiguration<Tienda>
{
    public void Configure(EntityTypeBuilder<Tienda> b)
    {
        b.ToTable("tienda");
        b.HasKey(t => t.Id);
        b.Property(t => t.Id).HasColumnName("id_tienda");
        b.Property(t => t.Codigo).HasColumnName("codigo").HasMaxLength(30).IsRequired();
        b.HasIndex(t => t.Codigo).IsUnique().HasDatabaseName("uk_tienda_codigo");
        b.Property(t => t.Nombre).HasColumnName("nombre").HasMaxLength(120).IsRequired();
        b.Property(t => t.IdEmpresa).HasColumnName("id_empresa").HasMaxLength(10).IsRequired();
        b.Property(t => t.IdZona).HasColumnName("id_zona");
        b.Property(t => t.Ubicacion).HasColumnName("ubicacion").HasConversion<string>().HasMaxLength(2);
        b.Property(t => t.DotacionMinimaAsesores).HasColumnName("dotacion_minima_asesores");
        b.Property(t => t.FechaVigenciaDotacion).HasColumnName("fecha_vigencia_dotacion");
        b.Property(t => t.EstadoOperativo).HasColumnName("estado_operativo").HasConversion<string>().HasMaxLength(12);
        b.Property(t => t.Origen).HasColumnName("origen").HasConversion<string>().HasMaxLength(6);
        b.Property(t => t.RmsSyncAt).HasColumnName("rms_sync_at");
        b.HasIndex(t => new { t.IdEmpresa, t.EstadoOperativo }).HasDatabaseName("idx_tienda_empresa_estado");
    }
}

internal sealed class PuestoConfiguration : IEntityTypeConfiguration<Puesto>
{
    public void Configure(EntityTypeBuilder<Puesto> b)
    {
        b.ToTable("puesto");
        b.HasKey(p => p.Id);
        b.Property(p => p.Id).HasColumnName("id_puesto");
        b.Property(p => p.Codigo).HasColumnName("codigo").HasMaxLength(30).IsRequired();
        b.HasIndex(p => p.Codigo).IsUnique().HasDatabaseName("uk_puesto_codigo");
        b.Property(p => p.Nombre).HasColumnName("nombre").HasMaxLength(80).IsRequired();
        b.Property(p => p.GeneraRatiosSenior).HasColumnName("genera_ratios_senior");
        b.Property(p => p.HabilitadoSenior).HasColumnName("habilitado_senior");
        b.Property(p => p.Origen).HasColumnName("origen").HasConversion<string>().HasMaxLength(6);
    }
}

internal sealed class EmpleadoConfiguration : IEntityTypeConfiguration<Empleado>
{
    public void Configure(EntityTypeBuilder<Empleado> b)
    {
        b.ToTable("empleado");
        b.HasKey(e => e.Id);
        b.Property(e => e.Id).HasColumnName("id_empleado");
        b.Property(e => e.Codigo).HasColumnName("codigo").HasMaxLength(30).IsRequired();
        b.HasIndex(e => e.Codigo).IsUnique().HasDatabaseName("uk_empleado_codigo");
        b.Property(e => e.NombreCompleto).HasColumnName("nombre_completo").HasMaxLength(120).IsRequired();
        b.Property(e => e.IdEmpresa).HasColumnName("id_empresa").HasMaxLength(10).IsRequired();
        b.Property(e => e.Zona).HasColumnName("zona").HasMaxLength(80).IsRequired();
        b.Property(e => e.Tienda).HasColumnName("tienda").HasMaxLength(120).IsRequired();
        b.Property(e => e.Cargo).HasColumnName("cargo").HasMaxLength(60).IsRequired();
        b.Property(e => e.Categoria).HasColumnName("categoria").HasConversion<string>().HasMaxLength(16);
        b.Property(e => e.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(12);
        b.Property(e => e.Origen).HasColumnName("origen").HasConversion<string>().HasMaxLength(6);
        b.Property(e => e.RmsSyncAt).HasColumnName("rms_sync_at");
        b.HasIndex(e => new { e.IdEmpresa, e.Categoria, e.Estado }).HasDatabaseName("idx_empleado_empresa_categoria_estado");
    }
}

/// <summary>Read model de solo lectura sobre segu.usuario (otro esquema, misma BD). No se migra.</summary>
public sealed class UsuarioRef
{
    public Guid Id { get; init; }
    public string NombreUsuario { get; init; } = default!;
}

internal sealed class UsuarioRefConfiguration : IEntityTypeConfiguration<UsuarioRef>
{
    public void Configure(EntityTypeBuilder<UsuarioRef> b)
    {
        // Tabla de otro módulo (Seguridad): solo lectura, excluida de las migraciones de Maestros.
        b.HasNoKey().ToTable("usuario", "segu", t => t.ExcludeFromMigrations());
        b.Property(u => u.Id).HasColumnName("id_usuario");
        b.Property(u => u.NombreUsuario).HasColumnName("nombre_usuario");
    }
}

internal sealed class EmpleadoRosterConfiguration : IEntityTypeConfiguration<EmpleadoRoster>
{
    public void Configure(EntityTypeBuilder<EmpleadoRoster> b)
    {
        // Keyless read model sobre la vista cross-DB (script 002_vw_empleado_roster.sql).
        // EF no genera migración para vistas: se administra con el script SQL versionado.
        b.HasNoKey().ToView("vw_EmpleadoRoster", MaestrosDbContext.Schema);
        b.Property(e => e.Codigo).HasColumnName("Codigo");
        b.Property(e => e.NombreCompleto).HasColumnName("NombreCompleto");
        b.Property(e => e.PuestoCod).HasColumnName("PuestoCod");
        b.Property(e => e.PuestoDesc).HasColumnName("PuestoDesc");
        b.Property(e => e.EsSenior).HasColumnName("EsSenior");
        b.Property(e => e.TiendaCod).HasColumnName("TiendaCod");
        b.Property(e => e.Tienda).HasColumnName("Tienda");
        b.Property(e => e.ZonaCod).HasColumnName("ZonaCod");
        b.Property(e => e.Zona).HasColumnName("Zona");
        b.Property(e => e.EmpresaCod).HasColumnName("EmpresaCod");
        b.Property(e => e.Empresa).HasColumnName("Empresa");
    }
}

internal sealed class RolConfiguration : IEntityTypeConfiguration<Rol>
{
    public void Configure(EntityTypeBuilder<Rol> b)
    {
        b.ToTable("rol");
        b.HasKey(r => r.Codigo);
        b.Property(r => r.Codigo).HasColumnName("id_rol").HasMaxLength(20);
        b.Property(r => r.Nombre).HasColumnName("nombre").HasMaxLength(80).IsRequired();
        b.Property(r => r.NivelAutoridad).HasColumnName("nivel_autoridad");
        b.Property(r => r.AmbitoPermitido).HasColumnName("ambito_permitido").HasConversion<string>().HasMaxLength(10);
        b.Property(r => r.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(12);
    }
}

internal sealed class PermisoConfiguration : IEntityTypeConfiguration<Permiso>
{
    public void Configure(EntityTypeBuilder<Permiso> b)
    {
        b.ToTable("permiso");
        b.HasKey(p => p.Clave);
        b.Property(p => p.Clave).HasColumnName("clave").HasMaxLength(60);
        b.Property(p => p.Modulo).HasColumnName("modulo").HasConversion<string>().HasMaxLength(15);
        b.Property(p => p.Accion).HasColumnName("accion").HasConversion<string>().HasMaxLength(12);
    }
}

internal sealed class RolPermisoConfiguration : IEntityTypeConfiguration<RolPermiso>
{
    public void Configure(EntityTypeBuilder<RolPermiso> b)
    {
        b.ToTable("rol_permiso");
        b.HasKey(rp => new { rp.IdRol, rp.ClavePermiso });
        b.Property(rp => rp.IdRol).HasColumnName("id_rol").HasMaxLength(20);
        b.Property(rp => rp.ClavePermiso).HasColumnName("clave_permiso").HasMaxLength(60);
        b.HasOne<Rol>().WithMany().HasForeignKey(rp => rp.IdRol).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Permiso>().WithMany().HasForeignKey(rp => rp.ClavePermiso).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class FeriadoConfiguration : IEntityTypeConfiguration<Feriado>
{
    public void Configure(EntityTypeBuilder<Feriado> b)
    {
        b.ToTable("feriado");
        b.HasKey(f => f.Id);
        b.Property(f => f.Id).HasColumnName("id_feriado");
        b.Property(f => f.Fecha).HasColumnName("fecha");
        b.Property(f => f.Descripcion).HasColumnName("descripcion").HasMaxLength(120).IsRequired();
        b.Property(f => f.Alcance).HasColumnName("alcance").HasConversion<string>().HasMaxLength(10);
        b.Property(f => f.Origen).HasColumnName("origen").HasConversion<string>().HasMaxLength(16);
        b.Property(f => f.EmpresasAplicables).HasColumnName("empresas_aplicables").HasMaxLength(60);
        b.Property(f => f.Compensable).HasColumnName("compensable");
        b.Property(f => f.VigenciaDesde).HasColumnName("vigencia_desde");
        b.Property(f => f.VigenciaHasta).HasColumnName("vigencia_hasta");
        b.HasMany(f => f.Ambitos).WithOne().HasForeignKey(a => a.IdFeriado).OnDelete(DeleteBehavior.Cascade);
        b.Metadata.FindNavigation(nameof(Feriado.Ambitos))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
        b.HasIndex(f => f.Fecha).HasDatabaseName("idx_feriado_fecha");
    }
}

internal sealed class AmbitoFeriadoConfiguration : IEntityTypeConfiguration<AmbitoFeriado>
{
    public void Configure(EntityTypeBuilder<AmbitoFeriado> b)
    {
        b.ToTable("ambito_feriado");
        b.HasKey(a => new { a.IdFeriado, a.TipoAmbito, a.IdAmbito });
        b.Property(a => a.IdFeriado).HasColumnName("id_feriado");
        b.Property(a => a.TipoAmbito).HasColumnName("tipo_ambito").HasConversion<string>().HasMaxLength(8);
        b.Property(a => a.IdAmbito).HasColumnName("id_ambito");
    }
}

internal sealed class ParametroConfiguration : IEntityTypeConfiguration<Parametro>
{
    public void Configure(EntityTypeBuilder<Parametro> b)
    {
        b.ToTable("parametro");
        b.HasKey(p => p.Id);
        b.Property(p => p.Id).HasColumnName("id_parametro");
        b.Property(p => p.Clave).HasColumnName("clave").HasMaxLength(120).IsRequired();
        b.Property(p => p.Modulo).HasColumnName("modulo").HasConversion<string>().HasMaxLength(15);
        b.Property(p => p.Flujo).HasColumnName("flujo").HasMaxLength(30);
        b.Property(p => p.Nivel).HasColumnName("nivel").HasMaxLength(20);
        b.Property(p => p.NombreParametro).HasColumnName("nombre_parametro").HasMaxLength(60).IsRequired();
        b.Property(p => p.Ambito).HasColumnName("ambito").HasConversion<string>().HasMaxLength(10);
        b.Property(p => p.IdEmpresa).HasColumnName("id_empresa").HasMaxLength(10);
        b.Property(p => p.IdAmbito).HasColumnName("id_ambito").HasMaxLength(60);
        b.Property(p => p.TipoDato).HasColumnName("tipo_dato").HasConversion<string>().HasMaxLength(10);
        b.Property(p => p.Unidad).HasColumnName("unidad").HasMaxLength(20);
        b.Property(p => p.Valor).HasColumnName("valor").IsRequired(); // JSON/escalar
        b.Property(p => p.EsImpactoNegocio).HasColumnName("es_impacto_negocio");
        b.Property(p => p.CriticidadConsumo).HasColumnName("criticidad_consumo").HasConversion<string>().HasMaxLength(12);
        b.Property(p => p.VigenciaDesde).HasColumnName("vigencia_desde");
        b.Property(p => p.VigenciaHasta).HasColumnName("vigencia_hasta");
        b.Property(p => p.Justificacion).HasColumnName("justificacion");
        b.Property(p => p.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(12)
            .HasDefaultValue(EstadoParametro.Activo)
            .HasSentinel((EstadoParametro)0); // CLR default es Activo(1); 0 nunca es un valor válido
        // Resolución de valor vigente (RN-MAES-14): clave + ámbito + ventana de vigencia.
        b.HasIndex(p => new { p.Clave, p.IdEmpresa, p.IdAmbito, p.VigenciaDesde })
            .HasDatabaseName("idx_parametro_clave_ambito_vigencia");
    }
}

internal sealed class SemanaCampaniaConfiguration : IEntityTypeConfiguration<SemanaCampania>
{
    public void Configure(EntityTypeBuilder<SemanaCampania> b)
    {
        b.ToTable("semana_campania");
        b.HasKey(s => s.Id);
        b.Property(s => s.Id).HasColumnName("id_semana");
        b.Property(s => s.IdEmpresa).HasColumnName("id_empresa").HasMaxLength(10).IsRequired();
        b.Property(s => s.Desde).HasColumnName("desde");
        b.Property(s => s.Hasta).HasColumnName("hasta");
        b.HasIndex(s => new { s.IdEmpresa, s.Desde }).HasDatabaseName("idx_campania_empresa_desde");
    }
}

internal sealed class AuditoriaMaestrosConfiguration : IEntityTypeConfiguration<AuditoriaMaestros>
{
    public void Configure(EntityTypeBuilder<AuditoriaMaestros> b)
    {
        // Append-only (RN-MAES-16): inmutabilidad reforzada con DENY UPDATE/DELETE en BD.
        b.ToTable("auditoria_config");
        b.HasKey(a => a.Id);
        b.Property(a => a.Id).HasColumnName("id_log");
        b.Property(a => a.Accion).HasColumnName("accion").HasConversion<string>().HasMaxLength(24);
        b.Property(a => a.Elemento).HasColumnName("elemento").HasMaxLength(120).IsRequired();
        b.Property(a => a.ValorAnterior).HasColumnName("valor_anterior");
        b.Property(a => a.ValorNuevo).HasColumnName("valor_nuevo");
        b.Property(a => a.VigenciaDesde).HasColumnName("vigencia_desde");
        b.Property(a => a.IdActor).HasColumnName("id_actor");
        b.Property(a => a.Justificacion).HasColumnName("justificacion");
        b.Property(a => a.FechaHora).HasColumnName("fecha_hora");
        b.HasIndex(a => new { a.Elemento, a.FechaHora }).HasDatabaseName("idx_auditoria_config_elemento_fecha");
    }
}
