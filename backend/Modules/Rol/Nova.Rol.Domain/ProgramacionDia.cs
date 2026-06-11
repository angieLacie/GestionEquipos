using Nova.SharedKernel;

namespace Nova.Rol.Domain;

/// <summary>
/// Estado programado de un colaborador en un día específico (celda del calendario, §7.2).
/// Entidad hija del agregado <see cref="RolSemanal"/>.
/// </summary>
public sealed class ProgramacionDia : Entity
{
    private ProgramacionDia() { } // EF

    private ProgramacionDia(
        Guid id, Guid rolSemanalId, Guid colaboradorId, DateOnly fecha, EstadoCelda estado,
        Guid? tiendaCoberturaId, string? tipoVenta, Guid? conceptoCompensacionId, bool esSugerencia,
        Guid registradoPor) : base(id)
    {
        RolSemanalId = rolSemanalId;
        ColaboradorId = colaboradorId;
        Fecha = fecha;
        Estado = estado;
        TiendaCoberturaId = tiendaCoberturaId;
        TipoVenta = tipoVenta;
        ConceptoCompensacionId = conceptoCompensacionId;
        EsSugerenciaSistema = esSugerencia;
        RegistradoPor = registradoPor;
        FechaRegistro = DateTimeOffset.UtcNow;
    }

    public Guid RolSemanalId { get; private set; }
    public Guid ColaboradorId { get; private set; }
    public DateOnly Fecha { get; private set; }
    public EstadoCelda Estado { get; private set; }
    public Guid? TiendaCoberturaId { get; private set; }
    public string? TipoVenta { get; private set; }
    public Guid? ConceptoCompensacionId { get; private set; }
    public bool EsSugerenciaSistema { get; private set; }
    public Guid RegistradoPor { get; private set; }
    public DateTimeOffset FechaRegistro { get; private set; }

    public static ProgramacionDia Crear(
        Guid rolSemanalId, Guid colaboradorId, DateOnly fecha, EstadoCelda estado,
        Guid? tiendaCoberturaId, string? tipoVenta, Guid? conceptoCompensacionId, Guid registradoPor)
        => new(Guid.NewGuid(), rolSemanalId, colaboradorId, fecha, estado,
            tiendaCoberturaId, tipoVenta, conceptoCompensacionId, false, registradoPor);

    public void Reasignar(EstadoCelda estado, Guid? tiendaCoberturaId, string? tipoVenta, Guid? conceptoCompensacionId, Guid registradoPor)
    {
        Estado = estado;
        TiendaCoberturaId = tiendaCoberturaId;
        TipoVenta = tipoVenta;
        ConceptoCompensacionId = conceptoCompensacionId;
        RegistradoPor = registradoPor;
        EsSugerenciaSistema = false;
        FechaRegistro = DateTimeOffset.UtcNow;
    }
}
