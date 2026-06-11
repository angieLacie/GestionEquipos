/*
  Parámetro ROL_MAPEO_PUESTO_CATEGORIA — mapeo puesto RMS → categoría del rol.

  Reemplaza el hardcode de puestoACategoría que vivía en el front. Fuente única,
  versionada y editable vía Maestros (CU-MAES-03/04). Categoría en vocabulario
  canónico PuestoRol (Seniors/GtAsesores/Secretarias/Auxiliares/Sastres) — Senior
  NO va aquí: se determina por el flag EsSenior del roster.

  Vive en Nova (maes.parametro). Consumido vía
  GET /v1/maes/configuracion/parametros/lookup?clave=ROL_MAPEO_PUESTO_CATEGORIA&fecha=...
  Idempotente.
*/

USE Nova;
GO

IF NOT EXISTS (SELECT 1 FROM maes.parametro WHERE clave = 'ROL_MAPEO_PUESTO_CATEGORIA')
BEGIN
    INSERT INTO maes.parametro
        (id_parametro, clave, modulo, flujo, nivel, nombre_parametro, ambito,
         id_empresa, id_ambito, tipo_dato, unidad, valor, es_impacto_negocio,
         criticidad_consumo, vigencia_desde, vigencia_hasta, justificacion)
    VALUES
        (NEWID(), 'ROL_MAPEO_PUESTO_CATEGORIA', 'Rol', NULL, NULL,
         'MAPEO_PUESTO_CATEGORIA', 'Global', NULL, NULL, 'Lista', NULL,
         N'[
           {"puesto":"ASESOR","categoria":"GtAsesores"},
           {"puesto":"GERENTE DE TIENDA","categoria":"GtAsesores"},
           {"puesto":"GERENTE DE TIENDA JUNIOR","categoria":"GtAsesores"},
           {"puesto":"SASTRE","categoria":"Sastres"},
           {"puesto":"SASTRE - AUXILIAR","categoria":"Sastres"},
           {"puesto":"AUXILIAR DE TIENDA","categoria":"Auxiliares"},
           {"puesto":"AUXILIAR DE ALMACEN","categoria":"Auxiliares"},
           {"puesto":"SECRETARIA - CAJERA","categoria":"Secretarias"}
         ]',
         0, 'Degradable', '2020-01-01', NULL, NULL);
END
GO

SELECT clave, tipo_dato, ambito, vigencia_desde FROM maes.parametro WHERE clave = 'ROL_MAPEO_PUESTO_CATEGORIA';
GO
