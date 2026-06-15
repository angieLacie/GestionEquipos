using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>
/// Maestro de tiendas (maes.tienda). Base sincronizada desde RMS (alta/baja, dotación mínima
/// son de RMS, RN-MAES-05/07) y enriquecida con atributos operativos Nova (ubicación, zona, estado).
/// </summary>
public sealed class Tienda : Entity
{
    private Tienda() { } // EF

    private Tienda(Guid id, string codigo, string nombre, string idEmpresa) : base(id)
    {
        Codigo = codigo;
        Nombre = nombre;
        IdEmpresa = idEmpresa;
        EstadoOperativo = EstadoTienda.Activa;
        Origen = OrigenDato.Rms;
    }

    public string Codigo { get; private set; } = default!;
    public string Nombre { get; private set; } = default!;
    public string IdEmpresa { get; private set; } = default!;
    public Guid? IdZona { get; private set; }
    public UbicacionTienda? Ubicacion { get; private set; }
    /// <summary>SOLO LECTURA — fuente RMS (RN-MAES-05). No editable en Nova.</summary>
    public int DotacionMinimaAsesores { get; private set; }
    public DateOnly? FechaVigenciaDotacion { get; private set; }
    public EstadoTienda EstadoOperativo { get; private set; }
    public OrigenDato Origen { get; private set; }
    public DateTimeOffset? RmsSyncAt { get; private set; }

    /// <summary>Upsert desde RMS (sincronización base, RN-MAES-07). No crea tiendas manualmente.</summary>
    public static Tienda DesdeRms(string codigo, string nombre, string idEmpresa, int dotacionMinima, DateTimeOffset syncAt)
    {
        var t = new Tienda(Guid.NewGuid(), codigo, nombre, idEmpresa)
        {
            DotacionMinimaAsesores = dotacionMinima,
            RmsSyncAt = syncAt
        };
        return t;
    }

    /// <summary>Sincroniza atributos base provenientes de RMS sin tocar el enriquecimiento Nova.</summary>
    public void SincronizarDesdeRms(string nombre, string idEmpresa, int dotacionMinima, DateTimeOffset syncAt)
    {
        Nombre = nombre;
        IdEmpresa = idEmpresa;
        DotacionMinimaAsesores = dotacionMinima;
        RmsSyncAt = syncAt;
    }

    /// <summary>
    /// Edita SOLO atributos operativos Nova (CU-MAES-02). La dotación mínima NO se toca (RN-MAES-05).
    /// El indicador de ubicación (CC/PC) es el atributo principal (RN-DESC-10B); la zona es opcional y,
    /// si no se envía, conserva la zona actual.
    /// </summary>
    public Result EditarAtributosNova(UbicacionTienda ubicacion, Guid? idZona, EstadoTienda estado)
    {
        Ubicacion = ubicacion;
        if (idZona.HasValue) IdZona = idZona;
        EstadoOperativo = estado;
        Origen = OrigenDato.Nova;
        return Result.Success();
    }
}
