using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>
/// Maestro de empleados (maes.empleado). Base sincronizada desde RMS (alta/baja, datos personales,
/// puesto y ubicación son de RMS, RN-MAES-05) y enriquecida con la categoría usada por el Rol de
/// Personal. Zona/Tienda/Cargo se guardan denormalizados (texto RMS) para la grilla del rol.
/// El <see cref="Entity.Id"/> es el colaboradorId referenciado por las celdas del módulo Rol.
/// </summary>
public sealed class Empleado : Entity
{
    private Empleado() { } // EF

    private Empleado(
        Guid id, string codigo, string nombreCompleto, string idEmpresa,
        string zona, string tienda, string cargo) : base(id)
    {
        Codigo = codigo;
        NombreCompleto = nombreCompleto;
        IdEmpresa = idEmpresa;
        Zona = zona;
        Tienda = tienda;
        Cargo = cargo;
        Categoria = CategoriaRol.GtAsesores;
        Estado = EstadoEmpleado.Activo;
        Origen = OrigenDato.Rms;
    }

    /// <summary>Código/identificador del empleado en RMS (p. ej. DNI o legajo).</summary>
    public string Codigo { get; private set; } = default!;
    public string NombreCompleto { get; private set; } = default!;
    public string IdEmpresa { get; private set; } = default!;
    /// <summary>Zona (texto RMS) — agrupación de la grilla del rol.</summary>
    public string Zona { get; private set; } = default!;
    /// <summary>Tienda (texto RMS) — agrupación de la grilla del rol.</summary>
    public string Tienda { get; private set; } = default!;
    /// <summary>Cargo RMS (texto libre, p. ej. "Asesor", "Gerente Titular").</summary>
    public string Cargo { get; private set; } = default!;
    /// <summary>Categoría del rol (las 5 agrupaciones; enriquecimiento Nova).</summary>
    public CategoriaRol Categoria { get; private set; }
    public EstadoEmpleado Estado { get; private set; }
    public OrigenDato Origen { get; private set; }
    public DateTimeOffset? RmsSyncAt { get; private set; }

    /// <summary>Alta/upsert desde RMS (sincronización base, RN-MAES-07).</summary>
    public static Empleado DesdeRms(
        string codigo, string nombreCompleto, string idEmpresa,
        string zona, string tienda, string cargo, EstadoEmpleado estado,
        CategoriaRol categoria, DateTimeOffset syncAt)
        => new(Guid.NewGuid(), codigo, nombreCompleto, idEmpresa, zona, tienda, cargo)
        {
            Estado = estado,
            Categoria = categoria,
            RmsSyncAt = syncAt
        };

    /// <summary>Sincroniza atributos base provenientes de RMS sin tocar el enriquecimiento Nova.</summary>
    public void SincronizarDesdeRms(
        string nombreCompleto, string idEmpresa, string zona, string tienda,
        string cargo, EstadoEmpleado estado, DateTimeOffset syncAt)
    {
        NombreCompleto = nombreCompleto;
        IdEmpresa = idEmpresa;
        Zona = zona;
        Tienda = tienda;
        Cargo = cargo;
        Estado = estado;
        RmsSyncAt = syncAt;
    }

    /// <summary>Edita SOLO atributos operativos Nova (categoría del rol).</summary>
    public void ConfigurarNova(CategoriaRol categoria)
    {
        Categoria = categoria;
        Origen = OrigenDato.Nova;
    }
}
