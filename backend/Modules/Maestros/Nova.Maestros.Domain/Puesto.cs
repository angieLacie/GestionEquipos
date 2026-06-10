using Nova.SharedKernel;

namespace Nova.Maestros.Domain;

/// <summary>
/// Catálogo de puestos (maes.puesto). Base sincronizada desde RMS, enriquecida con atributos
/// operativos Nova (ratios Senior, habilitación Senior, RN-MAES-12/13).
/// </summary>
public sealed class Puesto : Entity
{
    private Puesto() { } // EF

    private Puesto(Guid id, string codigo, string nombre) : base(id)
    {
        Codigo = codigo;
        Nombre = nombre;
        Origen = OrigenDato.Rms;
    }

    public string Codigo { get; private set; } = default!;
    public string Nombre { get; private set; } = default!;
    public bool GeneraRatiosSenior { get; private set; }
    /// <summary>Consistente con ASCE_PUESTOS_HABILITADOS_SENIOR.</summary>
    public bool HabilitadoSenior { get; private set; }
    public OrigenDato Origen { get; private set; }

    public static Puesto DesdeRms(string codigo, string nombre)
        => new(Guid.NewGuid(), codigo, nombre);

    public void ConfigurarNova(bool generaRatiosSenior, bool habilitadoSenior)
    {
        GeneraRatiosSenior = generaRatiosSenior;
        HabilitadoSenior = habilitadoSenior;
        Origen = OrigenDato.Nova;
    }
}
