# Lote G — Parámetros: acciones por fila (editar / estado / borrar)

Fecha: 2026-06-15 · Disciplina: frontend · Módulo: Maestros (Configuración)

## Alcance
Cerrar el CRUD por fila en la lista de Parámetros versionados. Antes: solo lectura + alta
("Nueva versión"). Ahora: editar (= nueva versión prellenada), activar/desactivar y borrar.

## Endpoints consumidos (base `/v1/maes`)
| Acción | Método | Endpoint | Body / Query | Estados manejados |
|---|---|---|---|---|
| Listar | GET | `/configuracion/parametros` | filtros qs | ahora incluye `estado` por fila |
| Cambiar estado | PATCH | `/configuracion/parametros/{id}/estado` | `{ estado, idActor }` | ok / err (Aviso) |
| Eliminar | DELETE | `/configuracion/parametros/{id}?idActor=<guid>` | — | 204 ok / 400 problem.detail → Aviso err |

`idActor` = `useAuth.getState().usuario?.idUsuario` (idéntico a `crearParametro`).

## Archivos tocados
- `TS/src/lib/config-parametros.ts`
  - `interface Parametro` += `estado: 'Activo' | 'Inactivo'`.
  - `cambiarEstadoParametro(id, estado)` (PATCH).
  - `eliminarParametro(id)` (DELETE; 204 sin body lo absorbe `api`, 400 se propaga como Error).
- `TS/src/views/config/parametros/index.tsx`
  - Import `useConfirm`, `cambiarEstadoParametro`, `eliminarParametro`.
  - `EstadoBadge` (Activo verde / Inactivo gris).
  - State `editando` + handlers `abrirEditar`, `alternarEstado`, `eliminar`.
  - Columnas nuevas: "Estado" y "Acciones" (3 iconos: `#edit-2`, `#power`, `#trash-2`).
  - Título del modal condicional: "Editar (nueva versión)" vs "Nueva versión de parámetro".
  - Badge "Vigente hasta" sin cierre: "Vigente" → "Sin cierre" (desambiguar de Estado).
  - `{confirmDialog}` renderizado.

## Reglas / convenciones respetadas
- Editar NO sobrescribe: crea nueva versión (RN-MAES-09, comportamiento de `crearParametro`).
- Borrar pide confirmación (`useConfirm`, variant danger). Editar y cambiar-estado NO confirman
  (convención del proyecto: solo eliminar/anular confirma).
- Estado y vigencia son ortogonales: columnas separadas, badges distintos.
- Iconos del sprite existente (`public/icons/sprite.svg`): `edit-2`, `power`, `trash-2`.

## Validación
- `npx tsc --noEmit` en `TS/`: sin errores.
- Verificación funcional en navegador: pendiente (backend :5109 detenido) → qa-tester.

## Pendiente para qa-tester
- Levantar `Nova.Bootstrap` (:5109, seed `admin / Nova2026!`), entrar a `/config` → Parámetros.
- Editar (modal prellenado, crea versión nueva), toggle estado, borrar versión futura (204)
  y borrar versión vigente/pasada (espera 400 con mensaje en el Aviso).
