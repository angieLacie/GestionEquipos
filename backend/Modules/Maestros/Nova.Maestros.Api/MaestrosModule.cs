using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Nova.Maestros.Application;
using Nova.Maestros.Domain;
using Nova.SharedKernel;

namespace Nova.Maestros.Api;

/// <summary>Adaptador driving (entrada) del módulo Maestros: registro de casos de uso + endpoints REST.</summary>
public static class MaestrosModule
{
    public static IServiceCollection AddMaestrosApplication(this IServiceCollection services)
    {
        services.AddScoped<LookupParametroHandler>();
        services.AddScoped<CrearParametroHandler>();
        services.AddScoped<CrearFeriadoHandler>();
        services.AddScoped<EditarTiendaHandler>();
        services.AddScoped<CargarCampaniaHandler>();
        return services;
    }

    public static IEndpointRouteBuilder MapMaestrosEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/v1/maes").WithTags("Maestros").RequireAuthorization();

        // ----------------- Catálogos (lectura) -----------------
        grupo.MapGet("/empresas", async (IEmpresaRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarAsync(ct))).WithName("ListarEmpresas");

        grupo.MapGet("/zonas", async (string? idEmpresa, EstadoCatalogo? estado, IZonaRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarAsync(idEmpresa, estado, ct))).WithName("ListarZonas");

        grupo.MapGet("/tiendas", async (
            string? idEmpresa, Guid? idZona, EstadoTienda? estadoOperativo, int? page, int? pageSize,
            ITiendaRepository repo, CancellationToken ct) =>
        {
            var (items, total) = await repo.ListarAsync(idEmpresa, idZona, estadoOperativo, page ?? 1, pageSize ?? 50, ct);
            return Results.Ok(new { items, page = page ?? 1, page_size = pageSize ?? 50, total });
        }).WithName("ListarTiendas");

        grupo.MapGet("/tiendas/{idTienda:guid}", async (Guid idTienda, ITiendaRepository repo, CancellationToken ct) =>
        {
            var tienda = await repo.ObtenerAsync(idTienda, ct);
            return tienda is null ? Results.NotFound() : Results.Ok(tienda);
        }).WithName("ObtenerTienda");

        grupo.MapGet("/puestos", async (IPuestoRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarAsync(ct))).WithName("ListarPuestos");

        grupo.MapGet("/empleados", async (
            string? idEmpresa, string? zona, string? tienda, CategoriaRol? categoria, EstadoEmpleado? estado,
            string? busqueda, int? page, int? pageSize, IEmpleadoRepository repo, CancellationToken ct) =>
        {
            var (items, total) = await repo.ListarAsync(
                idEmpresa, zona, tienda, categoria, estado, busqueda, page ?? 1, pageSize ?? 200, ct);
            return Results.Ok(new { items, page = page ?? 1, page_size = pageSize ?? 200, total });
        }).WithName("ListarEmpleados");

        grupo.MapGet("/roles", async (IRolRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarAsync(ct))).WithName("ListarRoles");

        grupo.MapGet("/permisos", async (ModuloNova? modulo, IPermisoRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarAsync(modulo, ct))).WithName("ListarPermisos");

        grupo.MapGet("/roles/{idRol}/permisos", async (string idRol, IPermisoRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarPorRolAsync(idRol, ct))).WithName("ListarPermisosDeRol");

        // ----------------- Feriados (CU-MAES-01) -----------------
        grupo.MapGet("/feriados", async (
            string? idEmpresa, int? anio, AlcanceFeriado? alcance, IFeriadoRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarAsync(idEmpresa, anio, alcance, ct))).WithName("ListarFeriados");

        grupo.MapPost("/feriados", async (CrearFeriadoRequest req, CrearFeriadoHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess
                ? Results.Created($"/v1/maes/feriados/{result.Value.Id}", result.Value)
                : ToProblem(result.Error);
        }).WithName("CrearFeriado");

        // ----------------- Configuración / parámetros (CU-MAES-03/04/06) -----------------
        grupo.MapGet("/configuracion/parametros/lookup", async (
            string clave, DateOnly fecha, string? idEmpresa, string? idAmbito,
            LookupParametroHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(clave, fecha, idEmpresa, idAmbito, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : ToProblem(result.Error);
        }).WithName("LookupParametro");

        grupo.MapGet("/configuracion/parametros", async (
            ModuloNova? modulo, string? flujo, Criticidad? criticidad, string? clave, int? page, int? pageSize,
            IParametroRepository repo, CancellationToken ct) =>
        {
            var (items, total) = await repo.ListarAsync(modulo, flujo, criticidad, clave, page ?? 1, pageSize ?? 50, ct);
            return Results.Ok(new { items, page = page ?? 1, page_size = pageSize ?? 50, total });
        }).WithName("ListarParametros");

        grupo.MapPost("/configuracion/parametros", async (CrearParametroRequest req, CrearParametroHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess
                ? Results.Created($"/v1/maes/configuracion/parametros/{result.Value.Id}", result.Value)
                : ToProblem(result.Error);
        }).WithName("CrearParametro");

        // ----------------- Tiendas (escritura, CU-MAES-02) -----------------
        grupo.MapPatch("/tiendas/{idTienda:guid}", async (
            Guid idTienda, EditarTiendaRequest req, EditarTiendaHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(idTienda, req, ct);
            return result.IsSuccess ? Results.NoContent() : ToProblem(result.Error);
        }).WithName("EditarTienda");

        // ----------------- Campaña (CU-MAES-08, RN-MAES-21) -----------------
        grupo.MapGet("/campania/semanas", async (
            string? idEmpresa, int? anio, ISemanaCampaniaRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.ListarAsync(idEmpresa, anio, ct))).WithName("ListarCampania");

        grupo.MapPost("/campania/semanas", async (CargarCampaniaRequest req, CargarCampaniaHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(req, ct);
            return result.IsSuccess ? Results.Created("/v1/maes/campania/semanas", null) : ToProblem(result.Error);
        }).WithName("CargarCampania");

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
