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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfiguration(new UsuarioConfiguration());
        modelBuilder.ApplyConfiguration(new CredencialConfiguration());
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
