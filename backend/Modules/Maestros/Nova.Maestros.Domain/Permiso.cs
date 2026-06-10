namespace Nova.Maestros.Domain;

/// <summary>
/// Catálogo de permisos granulares (maes.permiso) con clave MODULO.RECURSO.ACCION.
/// Compone los roles (RN-SEGU-04/21) — desbloquea PermisoResolver de Seguridad.
/// </summary>
public sealed class Permiso
{
    private Permiso() { } // EF

    public Permiso(string clave, ModuloNova modulo, AccionPermiso accion)
    {
        Clave = clave;
        Modulo = modulo;
        Accion = accion;
    }

    /// <summary>Clave natural: ej. "APRO.TAREA.APROBAR", "MAES.PARAMETRO.CONFIGURAR".</summary>
    public string Clave { get; private set; } = default!;
    public ModuloNova Modulo { get; private set; }
    public AccionPermiso Accion { get; private set; }
}

/// <summary>Relación rol-permiso (maes.rol_permiso). Define qué permisos compone cada rol.</summary>
public sealed class RolPermiso
{
    private RolPermiso() { } // EF

    public RolPermiso(string idRol, string clavePermiso)
    {
        IdRol = idRol;
        ClavePermiso = clavePermiso;
    }

    public string IdRol { get; private set; } = default!;
    public string ClavePermiso { get; private set; } = default!;
}

/// <summary>Módulos de Nova (consistente con el contrato maestros-api).</summary>
public enum ModuloNova
{
    Rol = 1,
    Marc = 2,
    Desc = 3,
    Enca = 4,
    Tras = 5,
    Vac = 6,
    Asce = 7,
    Aprobaciones = 8,
    Seguridad = 9,
    Maestros = 10,
    Transversal = 11
}

/// <summary>Acción de un permiso granular.</summary>
public enum AccionPermiso
{
    Crear = 1,
    Leer = 2,
    Editar = 3,
    Eliminar = 4,
    Enviar = 5,
    Aprobar = 6,
    Rechazar = 7,
    Autorizar = 8,
    Exportar = 9,
    Configurar = 10
}
