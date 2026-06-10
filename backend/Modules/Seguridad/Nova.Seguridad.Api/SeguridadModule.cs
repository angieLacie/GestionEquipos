using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Nova.Seguridad.Application;
using Nova.SharedKernel;

namespace Nova.Seguridad.Api;

/// <summary>Adaptador driving (entrada) del módulo Seguridad: registro de casos de uso + endpoints REST.</summary>
public static class SeguridadModule
{
    public static IServiceCollection AddSeguridadApplication(this IServiceCollection services)
    {
        services.AddScoped<CrearUsuarioHandler>();
        services.AddScoped<AutenticarHandler>();
        services.AddScoped<AsignarRolHandler>();
        services.AddScoped<AutorizarHandler>();
        services.AddScoped<SolicitarOtpHandler>();
        services.AddScoped<VerificarOtpHandler>();
        services.AddScoped<RestablecerPasswordHandler>();
        return services;
    }

    public static IEndpointRouteBuilder MapSeguridadEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/v1/segu").WithTags("Seguridad");

        grupo.MapPost("/usuarios", async (CrearUsuarioRequest req, CrearUsuarioHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess
                ? Results.Created($"/v1/segu/usuarios/{result.Value.Id}", result.Value)
                : ToProblem(result.Error);
        })
        .WithName("CrearUsuario");

        grupo.MapPost("/auth/login", async (LoginRequest req, AutenticarHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : ToProblem(result.Error);
        })
        .WithName("Login")
        .AllowAnonymous();

        grupo.MapPost("/asignaciones", async (AsignarRolRequest req, AsignarRolHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess
                ? Results.Created($"/v1/segu/asignaciones/{result.Value.Id}", result.Value)
                : ToProblem(result.Error);
        })
        .WithName("AsignarRol")
        .RequireAuthorization();

        grupo.MapPost("/autorizar", async (AutorizarRequest req, AutorizarHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return Results.Ok(result);
        })
        .WithName("Autorizar")
        .RequireAuthorization();

        // --- Recuperación de contraseña por OTP (CU-SEGU-10), endpoints anónimos ---
        var recup = grupo.MapGroup("/auth/recuperacion").AllowAnonymous();

        recup.MapPost("/solicitar", async (SolicitarOtpRequest req, SolicitarOtpHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(req, ct))) // siempre genérico (anti-enumeración)
            .WithName("SolicitarOtp");

        recup.MapPost("/verificar", async (VerificarOtpRequest req, VerificarOtpHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : ToProblem(result.Error);
        })
        .WithName("VerificarOtp");

        recup.MapPost("/restablecer", async (RestablecerPasswordRequest req, RestablecerPasswordHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess ? Results.NoContent() : ToProblem(result.Error);
        })
        .WithName("RestablecerPassword");

        return app;
    }

    private static IResult ToProblem(Error error) => error.Code switch
    {
        "validacion" => Results.ValidationProblem(
            new Dictionary<string, string[]> { ["error"] = [error.Message] }),
        "no_encontrado" => Results.Problem(error.Message, statusCode: StatusCodes.Status404NotFound),
        "conflicto" => Results.Problem(error.Message, statusCode: StatusCodes.Status409Conflict),
        "no_autorizado" => Results.Problem(error.Message, statusCode: StatusCodes.Status401Unauthorized),
        _ => Results.Problem(error.Message, statusCode: StatusCodes.Status400BadRequest)
    };
}
