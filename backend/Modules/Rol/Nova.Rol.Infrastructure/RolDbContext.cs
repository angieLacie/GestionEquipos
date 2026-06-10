using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nova.Rol.Application;
using Nova.Rol.Domain;

namespace Nova.Rol.Infrastructure;

/// <summary>Contexto EF Core del bounded context Rol de Personal. Esquema SQL Server [rol] (ADR-006).</summary>
public sealed class RolDbContext(DbContextOptions<RolDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public const string Schema = "rol";

    public DbSet<RolSemanal> Roles => Set<RolSemanal>();
    public DbSet<ProgramacionDia> Programaciones => Set<ProgramacionDia>();
    public DbSet<HistorialCambioRol> Historial => Set<HistorialCambioRol>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfiguration(new RolSemanalConfiguration());
        modelBuilder.ApplyConfiguration(new ProgramacionDiaConfiguration());
        modelBuilder.ApplyConfiguration(new HistorialCambioRolConfiguration());
    }
}

internal sealed class RolSemanalConfiguration : IEntityTypeConfiguration<RolSemanal>
{
    public void Configure(EntityTypeBuilder<RolSemanal> b)
    {
        b.ToTable("rol_semanal");
        b.HasKey(r => r.Id);
        b.Property(r => r.Id).HasColumnName("id_rol");
        b.Property(r => r.Empresa).HasColumnName("empresa").HasMaxLength(10).IsRequired();
        b.Property(r => r.ZonaId).HasColumnName("id_zona");
        b.Property(r => r.TiendaId).HasColumnName("id_tienda");
        b.Property(r => r.Anio).HasColumnName("anio");
        b.Property(r => r.NumeroSemana).HasColumnName("numero_semana");
        b.Property(r => r.FechaInicio).HasColumnName("fecha_inicio");
        b.Property(r => r.FechaFin).HasColumnName("fecha_fin");
        b.Property(r => r.Puesto).HasColumnName("puesto").HasConversion<string>().HasMaxLength(20);
        b.Property(r => r.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(24);
        b.Property(r => r.Version).HasColumnName("version");
        b.Property(r => r.VersionVigenteId).HasColumnName("id_version_vigente");
        b.Property(r => r.CreadoPor).HasColumnName("creado_por");
        b.Property(r => r.FechaCreacion).HasColumnName("fecha_creacion");
        b.Property(r => r.EnviadoPorGz).HasColumnName("enviado_por_gz");
        b.Property(r => r.FechaEnvioGz).HasColumnName("fecha_envio_gz");
        b.Property(r => r.AprobadoPorGg).HasColumnName("aprobado_por_gg");
        b.Property(r => r.FechaAprobacionGg).HasColumnName("fecha_aprobacion_gg");
        b.Property(r => r.ProgramadoPorGt).HasColumnName("programado_por_gt");
        b.Property(r => r.FechaProgramacionGt).HasColumnName("fecha_programacion_gt");

        b.HasMany(r => r.Dias).WithOne().HasForeignKey(d => d.RolSemanalId).OnDelete(DeleteBehavior.Cascade);
        b.Metadata.FindNavigation(nameof(RolSemanal.Dias))!.SetPropertyAccessMode(PropertyAccessMode.Field);

        b.HasIndex(r => new { r.Empresa, r.ZonaId, r.Anio, r.NumeroSemana, r.Puesto })
            .HasDatabaseName("idx_rol_semana");
    }
}

internal sealed class ProgramacionDiaConfiguration : IEntityTypeConfiguration<ProgramacionDia>
{
    public void Configure(EntityTypeBuilder<ProgramacionDia> b)
    {
        b.ToTable("programacion_dia");
        b.HasKey(d => d.Id);
        b.Property(d => d.Id).HasColumnName("id_programacion");
        b.Property(d => d.RolSemanalId).HasColumnName("id_rol");
        b.Property(d => d.ColaboradorId).HasColumnName("id_colaborador");
        b.Property(d => d.Fecha).HasColumnName("fecha");
        b.Property(d => d.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(32);
        b.Property(d => d.TiendaCoberturaId).HasColumnName("id_tienda_cobertura");
        b.Property(d => d.TipoVenta).HasColumnName("tipo_venta").HasMaxLength(40);
        b.Property(d => d.ConceptoCompensacionId).HasColumnName("id_concepto_compensacion");
        b.Property(d => d.EsSugerenciaSistema).HasColumnName("es_sugerencia_sistema");
        b.Property(d => d.RegistradoPor).HasColumnName("registrado_por");
        b.Property(d => d.FechaRegistro).HasColumnName("fecha_registro");
        b.HasIndex(d => new { d.RolSemanalId, d.ColaboradorId, d.Fecha })
            .IsUnique().HasDatabaseName("uk_programacion_colaborador_fecha");
    }
}

internal sealed class HistorialCambioRolConfiguration : IEntityTypeConfiguration<HistorialCambioRol>
{
    public void Configure(EntityTypeBuilder<HistorialCambioRol> b)
    {
        // Append-only (§7.6).
        b.ToTable("historial_cambio_rol");
        b.HasKey(h => h.Id);
        b.Property(h => h.Id).HasColumnName("id_historial");
        b.Property(h => h.RolSemanalId).HasColumnName("id_rol");
        b.Property(h => h.ProgramacionDiaId).HasColumnName("id_programacion");
        b.Property(h => h.TipoEvento).HasColumnName("tipo_evento").HasConversion<string>().HasMaxLength(20);
        b.Property(h => h.EstadoAnterior).HasColumnName("estado_anterior").HasMaxLength(24);
        b.Property(h => h.EstadoNuevo).HasColumnName("estado_nuevo").HasMaxLength(32);
        b.Property(h => h.UsuarioId).HasColumnName("id_usuario");
        b.Property(h => h.Comentario).HasColumnName("comentario");
        b.Property(h => h.FechaEvento).HasColumnName("fecha_evento");
        b.HasIndex(h => new { h.RolSemanalId, h.FechaEvento }).HasDatabaseName("idx_historial_rol_fecha");
    }
}
