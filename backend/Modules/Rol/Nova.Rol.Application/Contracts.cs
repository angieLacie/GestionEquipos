using Nova.Rol.Domain;

namespace Nova.Rol.Application;

public sealed record CrearRolRequest(
    string Empresa,
    Guid ZonaId,
    Guid? TiendaId,
    int Anio,
    int NumeroSemana,
    DateOnly FechaInicio,
    PuestoRol Puesto,
    Guid CreadoPor);

public sealed record RolResponse(
    Guid Id,
    string Empresa,
    Guid ZonaId,
    Guid? TiendaId,
    int Anio,
    int NumeroSemana,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    PuestoRol Puesto,
    EstadoRol Estado,
    int Version);

public sealed record ProgramarDiaRequest(
    Guid ColaboradorId,
    DateOnly Fecha,
    EstadoCelda Estado,
    Guid RegistradoPor,
    Guid? TiendaCoberturaId,
    string? TipoVenta,
    Guid? ConceptoCompensacionId);

public sealed record CeldaResponse(
    Guid Id,
    Guid ColaboradorId,
    DateOnly Fecha,
    EstadoCelda Estado,
    Guid? TiendaCoberturaId,
    string? TipoVenta);

public sealed record EnviarRolRequest(Guid GzId);
public sealed record AprobarRolRequest(Guid GgId);
public sealed record RechazarRolRequest(Guid GgId, string Comentario);
public sealed record ProgramarGtRequest(Guid GtId);

public static class RolMapper
{
    public static RolResponse ToResponse(this RolSemanal r) => new(
        r.Id, r.Empresa, r.ZonaId, r.TiendaId, r.Anio, r.NumeroSemana,
        r.FechaInicio, r.FechaFin, r.Puesto, r.Estado, r.Version);
}
