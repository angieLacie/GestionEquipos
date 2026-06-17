# Mapeo de contratos — Maestros / Parámetros (estado + eliminación)

| Endpoint | Método | Handler | Caso de uso | Regla |
|---|---|---|---|---|
| `/v1/maes/configuracion/parametros/{id:guid}/estado` | PATCH | `CambiarEstadoParametroHandler` | CU-MAES-04 | RN-MAES-09, RN-MAES-16 |
| `/v1/maes/configuracion/parametros/{id:guid}` | DELETE | `EliminarParametroHandler` | CU-MAES-04 | RN-MAES-09, RN-MAES-16 |
| `/v1/maes/configuracion/parametros` (GET) | GET | `IParametroRepository.ListarAsync` | CU-MAES-04 | incluye `estado` en la fila |

## PATCH .../{id}/estado

**Request body (`CambiarEstadoParametroRequest`):**
```json
{ "estado": "Activo" | "Inactivo", "idActor": "<guid>" }
```
- 200 OK → `ParametroResponse` (shape abajo).
- 404 → parámetro no encontrado.
- Idempotente: re-aplicar el mismo estado devuelve 200 sin auditar.

## DELETE .../{id}?idActor=<guid>

- 204 No Content → eliminado.
- 400 (validation problem) → `"Solo se pueden eliminar versiones futuras no consumidas; las vigentes/pasadas se desactivan."` (vigencia_desde <= hoy).
- 404 → no encontrado.

## Shape JSON de fila de parámetro (GET lista y entidad)

La lista devuelve la entidad `Parametro` serializada. Campos relevantes para el front:
```
id_parametro (Id), clave (Clave), modulo (Modulo), flujo, nivel,
nombreParametro (NombreParametro), ambito (Ambito), idEmpresa, idAmbito,
tipoDato (TipoDato), unidad, valor (Valor), esImpactoNegocio (EsImpactoNegocio),
criticidadConsumo (CriticidadConsumo), vigenciaDesde (VigenciaDesde),
vigenciaHasta (VigenciaHasta), justificacion, estado (Estado)  <-- NUEVO
```
> Nota: la serialización JSON usa los nombres de propiedad C# en camelCase (p. ej. `vigenciaDesde`, `estado`), no los nombres de columna SQL.

**`ParametroResponse` (POST create y PATCH estado):**
```json
{
  "id": "<guid>",
  "clave": "string",
  "modulo": "Rol|Marc|...",
  "nombreParametro": "string",
  "valor": "string",
  "criticidadConsumo": "Bloqueante|Degradable",
  "vigenciaDesde": "2026-06-15",
  "vigenciaHasta": null,
  "estado": "Activo|Inactivo"
}
```

## Enum Estado

`EstadoParametro` → valores serializados como string: `"Activo"`, `"Inactivo"`. Default `Activo`.
