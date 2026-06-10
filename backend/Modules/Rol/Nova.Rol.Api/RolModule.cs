using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Nova.Rol.Application;
using Nova.Rol.Domain;
using Nova.SharedKernel;

namespace Nova.Rol.Api;

/// <summary>Adaptador driving del módulo Rol de Personal: casos de uso + endpoints REST.</summary>
public static class RolModule
{
    public static IServiceCollection AddRolApplication(this IServiceCollection services)
    {
        services.AddScoped<CrearRolHandler>();
        services.AddScoped<ProgramarDiaHandler>();
        services.AddScoped<TransicionRolHandler>();
        return services;
    }

    public static IEndpointRouteBuilder MapRolEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/v1/rol").WithTags("Rol de Personal").RequireAuthorization();

        grupo.MapGet("/roles", async (
            string? empresa, Guid? zonaId, int? anio, int? numeroSemana, EstadoRol? estado,
            int? page, int? pageSize, IRolSemanalRepository repo, CancellationToken ct) =>
        {
            var (items, total) = await repo.ListarAsync(empresa, zonaId, anio, numeroSemana, estado, page ?? 1, pageSize ?? 50, ct);
            return Results.Ok(new { items = items.Select(r => r.ToResponse()), page = page ?? 1, page_size = pageSize ?? 50, total });
        }).WithName("ListarRolesSemanales");

        grupo.MapGet("/roles/{idRol:guid}", async (Guid idRol, IRolSemanalRepository repo, CancellationToken ct) =>
        {
            var rol = await repo.ObtenerConDiasAsync(idRol, ct);
            if (rol is null) return Results.NotFound();
            return Results.Ok(new
            {
                rol = rol.ToResponse(),
                dias = rol.Dias.Select(d => new CeldaResponse(d.Id, d.ColaboradorId, d.Fecha, d.Estado, d.TiendaCoberturaId, d.TipoVenta)),
            });
        }).WithName("ObtenerRol");

        grupo.MapPost("/roles", async (CrearRolRequest req, CrearRolHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess
                ? Results.Created($"/v1/rol/roles/{result.Value.Id}", result.Value)
                : ToProblem(result.Error);
        }).WithName("CrearRol");

        grupo.MapPut("/roles/{idRol:guid}/celdas", async (Guid idRol, ProgramarDiaRequest req, ProgramarDiaHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(idRol, req, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : ToProblem(result.Error);
        }).WithName("ProgramarDia");

        grupo.MapPost("/roles/{idRol:guid}/enviar", async (Guid idRol, EnviarRolRequest req, TransicionRolHandler handler, CancellationToken ct) =>
            Devolver(await handler.EnviarAsync(idRol, req, ct))).WithName("EnviarRol");

        grupo.MapPost("/roles/{idRol:guid}/aprobar", async (Guid idRol, AprobarRolRequest req, TransicionRolHandler handler, CancellationToken ct) =>
            Devolver(await handler.AprobarAsync(idRol, req, ct))).WithName("AprobarRol");

        grupo.MapPost("/roles/{idRol:guid}/rechazar", async (Guid idRol, RechazarRolRequest req, TransicionRolHandler handler, CancellationToken ct) =>
            Devolver(await handler.RechazarAsync(idRol, req, ct))).WithName("RechazarRol");

        grupo.MapPost("/roles/{idRol:guid}/programar-gt", async (Guid idRol, ProgramarGtRequest req, TransicionRolHandler handler, CancellationToken ct) =>
            Devolver(await handler.ProgramarGtAsync(idRol, req, ct))).WithName("ProgramarGt");

        return app;
    }

    private static IResult Devolver(Result<RolResponse> result)
        => result.IsSuccess ? Results.Ok(result.Value) : ToProblem(result.Error);

    private static IResult ToProblem(Error error) => error.Code switch
    {
        "validacion" => Results.ValidationProblem(new Dictionary<string, string[]> { ["error"] = [error.Message] }),
        "no_encontrado" => Results.Problem(error.Message, statusCode: StatusCodes.Status404NotFound),
        "conflicto" => Results.Problem(error.Message, statusCode: StatusCodes.Status409Conflict),
        "no_autorizado" => Results.Problem(error.Message, statusCode: StatusCodes.Status401Unauthorized),
        _ => Results.Problem(error.Message, statusCode: StatusCodes.Status400BadRequest)
    };
}
