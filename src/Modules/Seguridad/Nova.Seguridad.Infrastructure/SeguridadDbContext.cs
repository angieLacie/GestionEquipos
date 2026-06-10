using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nova.Seguridad.Application;
using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Infrastructure;

/// <summary>
/// Contexto EF Core del bounded context Seguridad. Mapea al esquema SQL Server [segu].
/// Un esquema por módulo (ADR-006): aquí solo viven identidades (segu.usuario, segu.credencial).
/// </summary>
public sealed class SeguridadDbContext(DbContextOptions<SeguridadDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public const string Schema = "segu";

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Credencial> Credenciales => Set<Credencial>();
    public DbSet<AsignacionRolAmbito> Asignaciones => Set<AsignacionRolAmbito>();
    public DbSet<AuditoriaSeguridad> Auditoria => Set<AuditoriaSeguridad>();
    public DbSet<CodigoOtp> CodigosOtp => Set<CodigoOtp>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfiguration(new UsuarioConfiguration());
        modelBuilder.ApplyConfiguration(new CredencialConfiguration());
        modelBuilder.ApplyConfiguration(new AsignacionRolAmbitoConfiguration());
        modelBuilder.ApplyConfiguration(new AuditoriaSeguridadConfiguration());
        modelBuilder.ApplyConfiguration(new CodigoOtpConfiguration());
    }
}

internal sealed class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> b)
    {
        b.ToTable("usuario");
        b.HasKey(u => u.Id);
        b.Property(u => u.Id).HasColumnName("id_usuario");
        // citext (Postgres) -> SQL Server: colación case-insensitive, accent-insensitive.
        b.Property(u => u.NombreUsuario).HasColumnName("nombre_usuario")
            .HasMaxLength(80).UseCollation("SQL_Latin1_General_CP1_CI_AI").IsRequired();
        b.HasIndex(u => u.NombreUsuario).IsUnique().HasDatabaseName("uk_usuario_nombre");
        b.Property(u => u.TipoUsuario).HasColumnName("tipo_usuario").HasConversion<string>().HasMaxLength(20);
        b.Property(u => u.CodigoEmpleadoRms).HasColumnName("codigo_empleado_rms").HasMaxLength(30);
        b.Property(u => u.CorreoContacto).HasColumnName("correo_contacto")
            .HasMaxLength(160).UseCollation("SQL_Latin1_General_CP1_CI_AI").IsRequired();
        b.Property(u => u.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(25);
        b.Property(u => u.MetodoAutenticacion).HasColumnName("metodo_autenticacion").HasConversion<string>().HasMaxLength(10);
        b.Property(u => u.MfaHabilitado).HasColumnName("mfa_habilitado");
        b.Property(u => u.FechaAlta).HasColumnName("fecha_alta");
        b.Property(u => u.FechaBaja).HasColumnName("fecha_baja");
    }
}

internal sealed class AsignacionRolAmbitoConfiguration : IEntityTypeConfiguration<AsignacionRolAmbito>
{
    public void Configure(EntityTypeBuilder<AsignacionRolAmbito> b)
    {
        b.ToTable("asignacion_rol_ambito");
        b.HasKey(a => a.Id);
        b.Property(a => a.Id).HasColumnName("id_asignacion");
        b.Property(a => a.IdUsuario).HasColumnName("id_usuario").IsRequired();
        b.Property(a => a.IdRol).HasColumnName("id_rol").HasMaxLength(20).IsRequired();
        b.Property(a => a.TipoAmbito).HasColumnName("tipo_ambito").HasConversion<string>().HasMaxLength(10);
        b.Property(a => a.IdEmpresa).HasColumnName("id_empresa").HasMaxLength(10);
        b.Property(a => a.IdTienda).HasColumnName("id_tienda");
        b.Property(a => a.Justificacion).HasColumnName("justificacion");
        b.Property(a => a.VigenciaDesde).HasColumnName("vigencia_desde");
        b.Property(a => a.VigenciaHasta).HasColumnName("vigencia_hasta");
        b.Property(a => a.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(12);

        // TODO(maes): normalizar a segu.asignacion_zona (1:N) para FK a maes.zona e índice inverso
        // de resolución de aprobador por zona (modelo-datos-fase0 §3). Provisional: colección JSON.
        b.PrimitiveCollection<List<Guid>>("_zonas").HasColumnName("zonas");
        b.Ignore(a => a.Zonas);

        b.HasOne<Usuario>().WithMany().HasForeignKey(a => a.IdUsuario).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(a => new { a.IdUsuario, a.Estado }).HasDatabaseName("idx_asignacion_usuario_estado");
    }
}

internal sealed class AuditoriaSeguridadConfiguration : IEntityTypeConfiguration<AuditoriaSeguridad>
{
    public void Configure(EntityTypeBuilder<AuditoriaSeguridad> b)
    {
        // Append-only (RN-SEGU-25): la inmutabilidad se refuerza con privilegios DENY UPDATE/DELETE en BD.
        b.ToTable("auditoria_seguridad");
        b.HasKey(a => a.Id);
        b.Property(a => a.Id).HasColumnName("id_log");
        b.Property(a => a.Evento).HasColumnName("evento").HasConversion<string>().HasMaxLength(30);
        b.Property(a => a.IdActor).HasColumnName("id_actor");
        b.Property(a => a.IdObjeto).HasColumnName("id_objeto");
        b.Property(a => a.Resultado).HasColumnName("resultado").HasConversion<string>().HasMaxLength(10);
        b.Property(a => a.Detalle).HasColumnName("detalle"); // JSON
        b.Property(a => a.FechaHora).HasColumnName("fecha_hora");
        b.HasIndex(a => new { a.IdActor, a.FechaHora }).HasDatabaseName("idx_auditoria_actor_fecha");
    }
}

internal sealed class CodigoOtpConfiguration : IEntityTypeConfiguration<CodigoOtp>
{
    public void Configure(EntityTypeBuilder<CodigoOtp> b)
    {
        b.ToTable("codigo_otp");
        b.HasKey(c => c.Id);
        b.Property(c => c.Id).HasColumnName("id_codigo");
        b.Property(c => c.IdUsuario).HasColumnName("id_usuario").IsRequired();
        b.Property(c => c.HashCodigo).HasColumnName("hash_codigo").IsRequired(); // DATO SENSIBLE
        b.Property(c => c.ExpiraEn).HasColumnName("expira_en");
        b.Property(c => c.Intentos).HasColumnName("intentos");
        b.Property(c => c.MaxIntentos).HasColumnName("max_intentos");
        b.Property(c => c.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(12);
        b.Property(c => c.CreadoEn).HasColumnName("creado_en");
        b.HasIndex(c => new { c.IdUsuario, c.Estado }).HasDatabaseName("idx_otp_usuario_estado");
    }
}

internal sealed class CredencialConfiguration : IEntityTypeConfiguration<Credencial>
{
    public void Configure(EntityTypeBuilder<Credencial> b)
    {
        b.ToTable("credencial");
        b.HasKey(c => c.Id);
        b.Property(c => c.Id).HasColumnName("id_credencial");
        b.Property(c => c.IdUsuario).HasColumnName("id_usuario").IsRequired();
        b.HasIndex(c => c.IdUsuario).IsUnique().HasDatabaseName("uk_credencial_usuario"); // 1:1
        b.Property(c => c.HashPassword).HasColumnName("hash_password").IsRequired();
        b.Property(c => c.Algoritmo).HasColumnName("algoritmo").HasMaxLength(20);
        b.Property(c => c.FechaUltimoCambio).HasColumnName("fecha_ultimo_cambio");
        b.Property(c => c.RequiereCambio).HasColumnName("requiere_cambio");
        b.Property(c => c.IntentosFallidos).HasColumnName("intentos_fallidos");
        b.Property(c => c.BloqueadoHasta).HasColumnName("bloqueado_hasta");
        b.HasOne<Usuario>().WithOne().HasForeignKey<Credencial>(c => c.IdUsuario).OnDelete(DeleteBehavior.Cascade);
    }
}
