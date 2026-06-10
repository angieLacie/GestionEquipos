using Nova.SharedKernel;

namespace Nova.Rol.Domain;

/// <summary>
/// Rol semanal de programación de personal (agregado raíz, ENT-MOD-ROLP-001 §7.1).
/// Encapsula la máquina de estados del flujo de aprobación GZ → GG → GT (§6) y las celdas
/// programadas (<see cref="ProgramacionDia"/>). La semana es domingo→sábado.
/// </summary>
public sealed class RolSemanal : Entity
{
    private readonly List<ProgramacionDia> _dias = [];

    private RolSemanal() { } // EF

    private RolSemanal(
        Guid id, string empresa, Guid zonaId, Guid? tiendaId, int anio, int numeroSemana,
        DateOnly fechaInicio, DateOnly fechaFin, PuestoRol puesto, Guid creadoPor) : base(id)
    {
        Empresa = empresa;
        ZonaId = zonaId;
        TiendaId = tiendaId;
        Anio = anio;
        NumeroSemana = numeroSemana;
        FechaInicio = fechaInicio;
        FechaFin = fechaFin;
        Puesto = puesto;
        Estado = EstadoRol.EnEdicion;
        Version = 1;
        CreadoPor = creadoPor;
        FechaCreacion = DateTimeOffset.UtcNow;
    }

    public string Empresa { get; private set; } = default!;
    public Guid ZonaId { get; private set; }
    public Guid? TiendaId { get; private set; }
    public int Anio { get; private set; }
    public int NumeroSemana { get; private set; }
    public DateOnly FechaInicio { get; private set; }
    public DateOnly FechaFin { get; private set; }
    public PuestoRol Puesto { get; private set; }
    public EstadoRol Estado { get; private set; }
    public int Version { get; private set; }
    public Guid? VersionVigenteId { get; private set; }
    public Guid CreadoPor { get; private set; }
    public DateTimeOffset FechaCreacion { get; private set; }
    public Guid? EnviadoPorGz { get; private set; }
    public DateTimeOffset? FechaEnvioGz { get; private set; }
    public Guid? AprobadoPorGg { get; private set; }
    public DateTimeOffset? FechaAprobacionGg { get; private set; }
    public Guid? ProgramadoPorGt { get; private set; }
    public DateTimeOffset? FechaProgramacionGt { get; private set; }

    public IReadOnlyList<ProgramacionDia> Dias => _dias;

    /// <summary>Crea un rol en estado En Edición. fechaInicio debe ser domingo y abarcar 7 días (§7.1).</summary>
    public static Result<RolSemanal> Crear(
        string empresa, Guid zonaId, Guid? tiendaId, int anio, int numeroSemana,
        DateOnly fechaInicio, PuestoRol puesto, Guid creadoPor)
    {
        if (string.IsNullOrWhiteSpace(empresa))
            return Result.Failure<RolSemanal>(Error.Validacion("La empresa es obligatoria."));
        if (fechaInicio.DayOfWeek != DayOfWeek.Sunday)
            return Result.Failure<RolSemanal>(Error.Validacion("La semana laboral inicia en domingo (RN-ROLP)."));
        if (numeroSemana is < 1 or > 53)
            return Result.Failure<RolSemanal>(Error.Validacion("Número de semana inválido."));

        var fechaFin = fechaInicio.AddDays(6);
        return Result.Success(new RolSemanal(
            Guid.NewGuid(), empresa.Trim(), zonaId, tiendaId, anio, numeroSemana, fechaInicio, fechaFin, puesto, creadoPor));
    }

    private bool EsEditable => Estado is EstadoRol.EnEdicion or EstadoRol.PendienteEnvio
        or EstadoRol.RechazadoGG or EstadoRol.VersionEnRevision;

    /// <summary>Programa (o reasigna) la celda de un colaborador en una fecha (§6.3).</summary>
    public Result<ProgramacionDia> ProgramarDia(
        Guid colaboradorId, DateOnly fecha, EstadoCelda estado, Guid registradoPor,
        Guid? tiendaCoberturaId = null, string? tipoVenta = null, Guid? conceptoCompensacionId = null)
    {
        if (!EsEditable)
            return Result.Failure<ProgramacionDia>(Error.Conflicto($"El rol en estado {Estado} no admite edición de celdas."));
        if (fecha < FechaInicio || fecha > FechaFin)
            return Result.Failure<ProgramacionDia>(Error.Validacion("La fecha está fuera de la semana del rol."));
        if (estado == EstadoCelda.CoberturaTipoVenta && !Empresa.Equals("LUKERS", StringComparison.OrdinalIgnoreCase))
            return Result.Failure<ProgramacionDia>(Error.Validacion("Cobertura por Tipo de Venta solo aplica a Lukers (RN-MAES-13)."));
        if (estado == EstadoCelda.CoberturaTienda && tiendaCoberturaId is null)
            return Result.Failure<ProgramacionDia>(Error.Validacion("Cobertura de Tienda requiere la tienda a cubrir."));

        var existente = _dias.FirstOrDefault(d => d.ColaboradorId == colaboradorId && d.Fecha == fecha);
        if (existente is not null)
        {
            existente.Reasignar(estado, tiendaCoberturaId, tipoVenta, conceptoCompensacionId, registradoPor);
            return Result.Success(existente);
        }

        var dia = new ProgramacionDia(
            Guid.NewGuid(), Id, colaboradorId, fecha, estado, tiendaCoberturaId, tipoVenta, conceptoCompensacionId, false, registradoPor);
        _dias.Add(dia);
        return Result.Success(dia);
    }

    /// <summary>GZ envía el rol a GG (§6.2). Válido desde edición o tras rechazo.</summary>
    public Result Enviar(Guid gzId)
    {
        if (Estado is not (EstadoRol.EnEdicion or EstadoRol.PendienteEnvio or EstadoRol.RechazadoGG or EstadoRol.Bloqueado or EstadoRol.VersionEnRevision))
            return Result.Failure(Error.Conflicto($"No se puede enviar un rol en estado {Estado}."));
        Estado = EstadoRol.EnviadoGG;
        EnviadoPorGz = gzId;
        FechaEnvioGz = DateTimeOffset.UtcNow;
        return Result.Success();
    }

    /// <summary>GG aprueba el rol; habilita la programación del GT (§6.2).</summary>
    public Result Aprobar(Guid ggId)
    {
        if (Estado != EstadoRol.EnviadoGG)
            return Result.Failure(Error.Conflicto($"Solo se aprueba un rol Enviado a GG (actual: {Estado})."));
        Estado = EstadoRol.AprobadoGG;
        AprobadoPorGg = ggId;
        FechaAprobacionGg = DateTimeOffset.UtcNow;
        return Result.Success();
    }

    /// <summary>GG rechaza con comentario obligatorio; el rol regresa a edición del GZ (§6.1).</summary>
    public Result Rechazar(Guid ggId, string comentario)
    {
        if (Estado != EstadoRol.EnviadoGG)
            return Result.Failure(Error.Conflicto($"Solo se rechaza un rol Enviado a GG (actual: {Estado})."));
        if (string.IsNullOrWhiteSpace(comentario))
            return Result.Failure(Error.Validacion("El rechazo del GG exige comentario obligatorio (RN-ROLP)."));
        Estado = EstadoRol.RechazadoGG;
        AprobadoPorGg = ggId;
        return Result.Success();
    }

    /// <summary>GT completa la programación de asesores tras la aprobación de GG (§6.2).</summary>
    public Result ProgramarGt(Guid gtId)
    {
        if (Estado != EstadoRol.AprobadoGG)
            return Result.Failure(Error.Conflicto($"El GT solo programa sobre un rol Aprobado por GG (actual: {Estado})."));
        Estado = EstadoRol.ProgramadoGT;
        ProgramadoPorGt = gtId;
        FechaProgramacionGt = DateTimeOffset.UtcNow;
        return Result.Success();
    }

    /// <summary>Bloqueo automático por vencimiento de plazo (§6.2, ejecutado por proceso programado).</summary>
    public Result Bloquear()
    {
        if (Estado is EstadoRol.Vigente or EstadoRol.Historico or EstadoRol.BloqueadoDefinitivo)
            return Result.Failure(Error.Conflicto($"No se puede bloquear un rol en estado {Estado}."));
        Estado = EstadoRol.Bloqueado;
        return Result.Success();
    }
}
