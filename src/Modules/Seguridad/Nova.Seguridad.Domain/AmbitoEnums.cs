namespace Nova.Seguridad.Domain;

/// <summary>Tipo de ámbito de una asignación / objetivo de autorización (RN-SEGU-05).</summary>
public enum TipoAmbito
{
    Central = 1,
    Empresa = 2,
    Zona = 3,
    Tienda = 4
}

/// <summary>Estado de vigencia de asignación, delegación y suplencia (SEGU §6.3).</summary>
public enum EstadoVigencia
{
    Vigente = 1,
    Programada = 2,
    Revocada = 3,
    Expirada = 4
}
