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
