namespace Nova.Maestros.Domain;

/// <summary>
/// Vista de solo lectura del roster de empleados (maes.vw_EmpleadoRoster), leída en vivo
/// desde RMS (BD_RETAIL.SEGURIDAD) vía consulta cross-database. Entidad keyless: no se
/// persiste ni edita desde Nova; refleja la fuente legada. Consumida por el módulo Rol.
/// </summary>
public sealed class EmpleadoRoster
{
    public string Codigo { get; private set; } = default!;
    public string NombreCompleto { get; private set; } = default!;
    public string? PuestoCod { get; private set; }
    public string? PuestoDesc { get; private set; }
    public bool EsSenior { get; private set; }
    public string? TiendaCod { get; private set; }
    public string? Tienda { get; private set; }
    public int? ZonaCod { get; private set; }
    public string? Zona { get; private set; }
    public string? EmpresaCod { get; private set; }
    public string? Empresa { get; private set; }
}
