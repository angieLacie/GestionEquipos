namespace Nova.Maestros.Domain;

/// <summary>
/// Empresa/cadena del grupo (Cadena, Lukers). Catálogo con clave natural (código).
/// Fuente de las reglas diferenciales por empresa (RN-MAES-06/13).
/// </summary>
public sealed class Empresa
{
    private Empresa() { } // EF

    public Empresa(string codigo, string nombre, DiaSemana diaInicioSemana, bool existeCoberturaTipoVenta)
    {
        Codigo = codigo;
        Nombre = nombre;
        DiaInicioSemana = diaInicioSemana;
        ExisteCoberturaTipoVenta = existeCoberturaTipoVenta;
        Estado = EstadoCatalogo.Vigente;
    }

    /// <summary>Clave natural: CADENA, LUKERS.</summary>
    public string Codigo { get; private set; } = default!;
    public string Nombre { get; private set; } = default!;
    public DiaSemana DiaInicioSemana { get; private set; }
    /// <summary>true en Lukers por defecto (RN-MAES-13).</summary>
    public bool ExisteCoberturaTipoVenta { get; private set; }
    public EstadoCatalogo Estado { get; private set; }
}

/// <summary>Día de inicio de la semana laboral (semana domingo-sábado por defecto).</summary>
public enum DiaSemana
{
    Domingo = 0,
    Lunes = 1,
    Martes = 2,
    Miercoles = 3,
    Jueves = 4,
    Viernes = 5,
    Sabado = 6
}
