/*
  Vista de roster de empleados para el módulo Rol de Personal.

  Vive en la base Nova (esquema maes) pero LEE en vivo de BD_RETAIL.SEGURIDAD
  vía consulta cross-database (misma instancia PANO977\SQLEXPRESS). Sin ETL:
  los datos siempre reflejan RMS. Si la fuente migra de servidor, solo cambia
  esta vista — el backend/EF no se entera.

  Cadena: Empleado.TiendaActual → Tienda → Tienda.Zona → Zona
          Empleado.Puesto       → Puesto
          Empleado.EmpresaOrigen→ Empresa

  Solo empleados activos CON tienda asignada (los programables en el rol).
  Idempotente: CREATE OR ALTER.
*/

USE Nova;
GO

CREATE OR ALTER VIEW maes.vw_EmpleadoRoster AS
SELECT
    e.Empleado                                   AS Codigo,
    e.NombreCompleto                             AS NombreCompleto,
    e.Puesto                                     AS PuestoCod,
    p.Descripcion                                AS PuestoDesc,
    CAST(CASE WHEN p.Descripcion LIKE '% SENIOR' THEN 1 ELSE 0 END AS bit) AS EsSenior,
    e.TiendaActual                               AS TiendaCod,
    t.Descripcion                                AS Tienda,
    t.Zona                                       AS ZonaCod,
    z.Descripcion                                AS Zona,
    t.Empresa                                    AS EmpresaCod,
    em.Razon_social                              AS Empresa
FROM BD_RETAIL.SEGURIDAD.Empleado e
LEFT JOIN BD_RETAIL.SEGURIDAD.Tienda  t  ON t.Tienda = e.TiendaActual
LEFT JOIN BD_RETAIL.SEGURIDAD.Zona    z  ON z.Zona = t.Zona
LEFT JOIN BD_RETAIL.SEGURIDAD.Puesto  p  ON CAST(p.Puesto AS varchar(20)) = e.Puesto
LEFT JOIN BD_RETAIL.SEGURIDAD.Empresa em ON em.Empresa = t.Empresa
WHERE e.EstadoEmpleado = 'A'
  AND e.TiendaActual IS NOT NULL
  AND e.TiendaActual <> '';
GO
