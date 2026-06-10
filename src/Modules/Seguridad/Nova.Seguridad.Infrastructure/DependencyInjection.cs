using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nova.Seguridad.Application;

namespace Nova.Seguridad.Infrastructure;

/// <summary>Composición de infraestructura del módulo Seguridad (adaptadores driven).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddSeguridadInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Nova")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'Nova'.");

        services.AddDbContext<SeguridadDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", SeguridadDbContext.Schema)));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<SeguridadDbContext>());
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ICredencialRepository, CredencialRepository>();
        services.AddScoped<IAsignacionRolAmbitoRepository, AsignacionRolAmbitoRepository>();
        services.AddSingleton<IPasswordHasher, Argon2PasswordHasher>();
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<IPermisoResolver, PermisoResolverSeed>();

        var jwt = configuration.GetSection("Jwt").Get<JwtOptions>()
            ?? throw new InvalidOperationException("Falta la sección de configuración 'Jwt'.");
        services.AddSingleton(jwt);
        services.AddSingleton<ITokenService, JwtTokenService>();

        return services;
    }
}
