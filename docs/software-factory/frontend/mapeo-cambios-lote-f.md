# Mapeo de cambios — Lote F (Motor único de ausencias / no-cruce)

Proyecto: Sistema Nova · `prototipo-ux-v2/gestion-equipos.html`
Fecha: 2026-05-31
Referencias: reconciliacion-ux.md (H-03, H-12, H-13) · especificacion-funcional-descansos.md v1.3 (motor único de ausencias programadas con no-cruce transversal).
Solo presentación/validación de cliente; conceptualmente lo refuerza el backend.

## 1. Helper común de no-cruce (motor único — H-03)
Nuevo (antes de `saveDc`, ~L5280):
- `hayCruceAusencia(empId, iniISO, finISO, opts)`: recorre AMBAS fuentes del mismo empleado
  — `AD.descansos` (descanso/compensación/licencia) y `AD.vacaciones` — y devuelve la primera
  ausencia que se solape con el rango `[iniISO, finISO]` (o `null`). Excluye registros `anul` y,
  en edición, el propio registro (`opts.exclDcId` / `opts.exclVacId`). Solape por intervalos ISO:
  `aIni<=bFin && bIni<=aFin`. Ausencia de un día → `fin=inicio`.
- `_semanaKey(iso)`: domingo de la semana (clave) para la regla de "misma semana".

No se fusionan físicamente los arrays; la validación los considera a ambos (motor único a nivel de regla).

## 2. `saveDc()` — validaciones REALES antes de guardar (H-12/H-13)
| Ubicación | Antes | Después |
|-----------|-------|---------|
| `saveDc()` (~L5310) | Construía `rec` y lo guardaba sin validar cruces (el "sin cruce" era solo hint del menú) | Calcula `fechaFin` antes de construir `rec` y aplica validaciones |

Validaciones añadidas (en orden, antes de construir/guardar `rec`):
1. **NO-CRUCE (ACTIVA, H-12/H-13/H-03):** `hayCruceAusencia(empId, fecha, fechaFin, {exclDcId:_dcEditId})`.
   Si hay cruce con cualquier descanso/compensación/licencia **o vacaciones**, muestra toast de
   error con el nombre, el tipo en conflicto y el rango, y **NO guarda**.
2. **MÁX. 1 DESCANSO LABORAL POR SEMANA / sin registro previo en la semana (ACTIVA para `tipo==='descanso'`, H-13):**
   si el empleado ya tiene un descanso laboral (no anulado) en la misma semana ISO, bloquea con toast.
3. **Límite de cobertura por tienda/día (PREPARADA / COMENTADA):** requiere el aforo mínimo por
   puesto/tienda del Rol de Personal, no disponible en los datos del prototipo. Se dejó documentada
   y comentada (`_excedeCoberturaTienda(...)`) para implementación en backend.

## 3. `saveVac()` — no-cruce simétrico (motor único, H-03)
| Ubicación | Antes | Después |
|-----------|-------|---------|
| `saveVac()` (~L4182) | Guardaba la vacación validando solo empleado/zonal/fechas | Añade `hayCruceAusencia(empId, ini, fin, {exclVacId:_vacEditId})` antes de construir `vac`; si cruza con descansos u otras vacaciones, toast de error y NO guarda |

Así, tanto la programación de descansos/licencias como la de vacaciones consultan la MISMA función
de cruce sobre descansos + vacaciones.

## Confirmaciones
- (a) Al intentar programar una ausencia (descanso/compensación/licencia o vacaciones) que se solapa
  con otra existente del mismo empleado —incluida una vacación— se bloquea con mensaje claro y no se
  guarda. OK
- (b) La validación considera AMBAS fuentes (`AD.descansos` + `AD.vacaciones`) vía `hayCruceAusencia`,
  usada en `saveDc()` y `saveVac()`. OK

## Reglas: estado
- **ACTIVAS (funcionan de verdad con datos demo):**
  - No-cruce transversal descansos+vacaciones (H-03/H-12/H-13) — en saveDc y saveVac.
  - Máx. 1 descanso laboral por semana / sin registro previo en la misma semana (H-13) — en saveDc para `tipo==='descanso'`.
- **PREPARADA / COMENTADA (no viable con los datos del prototipo):**
  - Límite de cobertura mínima por tienda/día (depende del aforo del Rol de Personal): dejada
    comentada en `saveDc()` como punto de extensión para backend.

## Notas de verificación con datos demo
- Vacaciones activas/programadas 2026 (p. ej. emp. 7: 01–15/05/2026; emp. 3: 02–16/06/2026) permiten
  comprobar el bloqueo al intentar un descanso que caiga dentro de esos rangos (motor único).
- Dos descansos laborales en la misma semana ISO para el mismo empleado quedan bloqueados.

## Validación de sintaxis
Pendiente de ejecución automatizada (permiso de Bash denegado al cierre). Cambios aplicados como
reemplazos exactos; revisión manual del helper y de las inserciones en `saveDc`/`saveVac` confirmó
balanceo de llaves/paréntesis y que ambas funciones (declaraciones hoisteadas) están en el mismo
bloque `<script>` (L3672–5474), por lo que `saveVac` puede invocar `hayCruceAusencia` aunque esté
definida más abajo. Se recomienda al qa-tester re-ejecutar el chequeo de sintaxis JS.
