using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nova.Rol.Application;

namespace Nova.Rol.Infrastructure;

/// <summary>Composición de infraestructura del módulo Rol de Personal (adaptadores driven).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddRolInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Nova")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'Nova'.");

        services.AddDbContext<RolDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", RolDbContext.Schema)));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<RolDbContext>());
        services.AddScoped<IRolSemanalRepository, RolSemanalRepository>();
        services.AddScoped<IHistorialRolRepository, HistorialRolRepository>();
        services.AddSingleton<IClock, SystemClock>();

        return services;
    }
}
