/*
  Override DEMO de empleados Senior (DATOS DE PRUEBA).

  RMS aún no marca qué empleados son Senior (los puestos SENIOR existen pero no
  están asignados). Mientras llega ese dato real, esta tabla en Nova marca a mano
  algunos empleados como Senior para poder probar el módulo Rol. NO toca BD_RETAIL.

  La vista maes.vw_EmpleadoRoster combina: EsSenior = (puesto LIKE '% SENIOR')
  OR (código presente en esta tabla). Para quitar la demo: TRUNCATE de la tabla
  y reponer la vista sin el LEFT JOIN (o dejar la tabla vacía).

  Idempotente.
*/

USE Nova;
GO

IF OBJECT_ID('maes.empleado_senior_demo') IS NULL
BEGIN
    CREATE TABLE maes.empleado_senior_demo (
        Codigo varchar(20) NOT NULL CONSTRAINT PK_empleado_senior_demo PRIMARY KEY
    );
END
GO

/* Seed: 1 empleado Senior por tienda, entre puestos elegibles (ASESOR, SASTRE,
   AUXILIAR DE TIENDA, SECRETARIA - CAJERA). Solo si la tabla está vacía. */
IF NOT EXISTS (SELECT 1 FROM maes.empleado_senior_demo)
BEGIN
    INSERT INTO maes.empleado_senior_demo (Codigo)
    SELECT Codigo FROM (
        SELECT e.Empleado AS Codigo,
               ROW_NUMBER() OVER (PARTITION BY e.TiendaActual ORDER BY e.Empleado) AS rn
        FROM BD_RETAIL.SEGURIDAD.Empleado e
        JOIN BD_RETAIL.SEGURIDAD.Puesto p ON CAST(p.Puesto AS varchar(20)) = e.Puesto
        WHERE e.EstadoEmpleado = 'A'
          AND e.TiendaActual IS NOT NULL AND e.TiendaActual <> ''
          AND p.Descripcion IN ('ASESOR','SASTRE','AUXILIAR DE TIENDA','SECRETARIA - CAJERA')
    ) x
    WHERE x.rn = 1;
END
GO

/* Vista con override de Senior demo. */
CREATE OR ALTER VIEW maes.vw_EmpleadoRoster AS
SELECT
    e.Empleado                                   AS Codigo,
    e.NombreCompleto                             AS NombreCompleto,
    e.Puesto                                     AS PuestoCod,
    p.Descripcion                                AS PuestoDesc,
    CAST(CASE WHEN p.Descripcion LIKE '% SENIOR' OR sd.Codigo IS NOT NULL
              THEN 1 ELSE 0 END AS bit)          AS EsSenior,
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
LEFT JOIN maes.empleado_senior_demo   sd ON sd.Codigo = e.Empleado
WHERE e.EstadoEmpleado = 'A'
  AND e.TiendaActual IS NOT NULL
  AND e.TiendaActual <> '';
GO
