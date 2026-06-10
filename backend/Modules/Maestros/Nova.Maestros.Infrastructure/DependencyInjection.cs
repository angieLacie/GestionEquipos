using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nova.Maestros.Application;

namespace Nova.Maestros.Infrastructure;

/// <summary>Composición de infraestructura del módulo Maestros (adaptadores driven).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddMaestrosInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Nova")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'Nova'.");

        services.AddDbContext<MaestrosDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", MaestrosDbContext.Schema)));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<MaestrosDbContext>());
        services.AddScoped<IEmpresaRepository, EmpresaRepository>();
        services.AddScoped<IZonaRepository, ZonaRepository>();
        services.AddScoped<ITiendaRepository, TiendaRepository>();
        services.AddScoped<IPuestoRepository, PuestoRepository>();
        services.AddScoped<IRolRepository, RolRepository>();
        services.AddScoped<IPermisoRepository, PermisoRepository>();
        services.AddScoped<IFeriadoRepository, FeriadoRepository>();
        services.AddScoped<IParametroRepository, ParametroRepository>();
        services.AddScoped<ISemanaCampaniaRepository, SemanaCampaniaRepository>();
        services.AddScoped<IAuditoriaMaestrosRepository, AuditoriaMaestrosRepository>();
        services.AddSingleton<IClock, SystemClock>();

        return services;
    }
}
