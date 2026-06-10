namespace Nova.Seguridad.Domain;

/// <summary>
/// Ámbito objetivo de una acción a autorizar (empresa/zona/tienda del objeto), CU-SEGU-05.
/// CENTRAL representa una acción sin filtro de ámbito (configuración central, flujo A1).
/// </summary>
public sealed record AmbitoObjetivo(
    TipoAmbito Tipo,
    string? IdEmpresa = null,
    Guid? IdZona = null,
    Guid? IdTienda = null)
{
    public static AmbitoObjetivo Central() => new(TipoAmbito.Central);
    public static AmbitoObjetivo Empresa(string idEmpresa) => new(TipoAmbito.Empresa, IdEmpresa: idEmpresa);
    public static AmbitoObjetivo Zona(Guid idZona, string? idEmpresa = null) => new(TipoAmbito.Zona, idEmpresa, IdZona: idZona);
    public static AmbitoObjetivo Tienda(Guid idTienda, string? idEmpresa = null) => new(TipoAmbito.Tienda, idEmpresa, IdTienda: idTienda);
}
