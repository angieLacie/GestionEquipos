# Mapeo de cambios — Lote E (Marcaciones / Asistencia)

Proyecto: Sistema Nova · `prototipo-ux-v2/asistencia-app.html` (kiosko) y `gestion-equipos.html` (alertas web)
Fecha: 2026-05-31
Referencias: reconciliacion-ux.md (H-14..H-19, P-07, P-08) · ENT-MOD-MARC-001 v1.2 (RN-17 atribución por huella, RN-18 tardanza/anticipada, RN-19 exclusión ausencias, RN-04 código zonal).
Solo presentación: el comportamiento conceptual corresponde al SDK del lector y a los endpoints de marcación.

## A) Kiosko — `asistencia-app.html`

### A.1 H-14 Atribución por huella
Antes: `_saveMarcacion` usaba `const empId=1; // simplificado`; el escaneo era cosmético y siempre tenía éxito.
Después:
- CSS nuevo: `.fp-detected`, `.fp-sim`, `.fp-error*`, `.sn-item.audit`, badges de reporte y `.rpt-horario`/`.rpt-flag`.
- MODAL 1 (huella): se añadió selector `#fp-emp` "Huella detectada (demo)" + comentario H-14.
- `_rptEmps` ahora incluye `horario`, `hEntrada`, `ausencia`; `_fillFpEmpSelect()` puebla el selector.
- `startFlow()` ya NO auto-avanza; el resultado lo resuelve `fpResult()`.
- `fpResult('ok')` toma `#fp-emp` como `_detectedEmpId` (dueño de la huella) y abre el modal de programación con su nombre/puesto/horario.
- `_saveMarcacion(tipo)` usa `_detectedEmpId` (no `1`).
- La pantalla de éxito muestra el NOMBRE del empleado que marcó (`#succ-emp`, `#succ-emp2`).

### A.2 P-08 Estados de error del lector
- MODAL 1: nuevo sub-estado de error (`#fp-error-body`/`#fp-error-footer`) + botones demo `fpResult('ok'|'nomatch'|'offline')`.
- `fpResult('nomatch')` → "Huella no reconocida"; `fpResult('offline')` → "Lector biométrico offline"; ambos con botón **Reintentar** (`fpRetry()` → `_fpShowScan()`).

### A.3 H-16 Auditoría de anulación/reprogramación
- `goToConfirm()` captura el código zonal ingresado (`_auditCode`).
- `goToSuccess()` arma y muestra una línea de auditoría visible (`.sn-item.audit`): código zonal (enmascarado), registrado por la sesión del kiosko (`_KIOSK_USER`) y fecha/hora.
- MODAL 2 muestra "Empleado (dueño de la huella)" para reforzar la atribución.

### A.4 H-17 Tardanza/anticipada y H-18 ausencia en el reporte
- Nuevas funciones `_horaToMin()` + `_TOL_ENTRADA_MIN=5`.
- `renderReport()`:
  - Si el empleado tiene `ausencia` programada → badge de su estado (Descanso/Vacaciones) y NO se cuenta como "Sin marcación" (H-18).
  - Si marcó ingreso, clasifica **Tardanza** (entrada > teórico + tolerancia) o **Anticipada** (< teórico − tolerancia) con `.rpt-flag` (H-17).
  - Demo: emp. 6 (08:22) y 7 (09:00) → Tardanza; emp. 8 → Descanso; emp. 10 → Vacaciones.

### A.5 P-07 Reporte: columna "Horario programado" + Exportar
- `<th>Horario programado</th>` añadido a la tabla (colspan de carga 7 → 8).
- Botón **"⬇ Exportar"** junto a Imprimir → `exportReport()` genera CSV (con BOM para Excel) desde `_rptExport`.
- Cada fila muestra el horario programado (`.rpt-horario`).

## B) Alertas de Marcaciones web — `gestion-equipos.html`

### B.1 H-17 Tardanza/anticipada en la lista
- CSS nuevo: `.am-tardanza`, `.am-anticipada`, `.am-ausencia`, `.am-req`, `.am-audit-note`.
- Filas estáticas: Cristian Monteagudo → "Tardanza · ingresó 08:22"; Susy Rodríguez → "Anticipada · ingresó 07:41" (antes ambas "No marcó").

### B.2 H-18 Excluir ausencias programadas de "no marcó"
- Gabriel Suarez → "Descanso (programado)" con horario "—" y acción "Ausencia justificada" (sin botón de falta).
- KPIs: "No marcaron" 5 → 2 (excluye ausencia programada); "Sí marcaron" 20 → 22; etiqueta aclaratoria + nota informativa H-18; toast 5 → 2.

### B.3 H-19 Falta con motivo obligatorio + auditoría
Antes: `amGoFalta()` usaba el `_confirm` genérico (sin motivo); el botón del modal `am-ov2` llamaba a `amConfirmFalta()` que NO existía (onclick colgado).
Después:
- MODAL `am-ov2` reconstruido: textarea **Motivo de la falta \*** (obligatorio) + mensaje de error + nota de auditoría (`.am-audit-note`).
- `amGoFalta()` ahora abre `am-ov2`, fija el nombre y precarga la traza de auditoría (`_amCurrentUser()` + fecha/hora).
- Nueva `amConfirmFalta()`: valida motivo obligatorio (si vacío, muestra error y no registra); al confirmar, toast con la falta registrada y su traza de auditoría.
- `_amCurrentUser()`: deriva el usuario para la traza desde `_perfil` (Gerente de Tienda / Administración de Ventas).

## Confirmaciones
- Huella (H-14): atribución al dueño; éxito muestra el nombre. OK
- Error lector (P-08): "no reconocida" y "offline" con Reintentar. OK
- Auditoría (H-16): código zonal + quién/cuándo en el éxito. OK
- Tardanza/anticipada (H-17): clasificadas en reporte (kiosko) y en lista (web). OK
- Exclusión ausencias (H-18): ausencia programada mostrada y excluida de "no marcó" en reporte y alertas. OK
- Reporte columnas/exportar (P-07): columna "Horario programado" + botón Exportar CSV. OK
- Alertas web: tardanza/anticipada, exclusión de ausencias y Falta con motivo obligatorio + auditoría. OK
- Sin onclicks colgando: `fpResult/fpRetry/exportReport` (kiosko) y `amConfirmFalta` (web, antes roto) ahora definidos y referenciados.

## Validación de sintaxis
Pendiente de ejecución automatizada (permiso de Bash denegado al cierre). Cambios aplicados como
reemplazos exactos; revisión manual de los bloques JS modificados confirmó balanceo de llaves,
template literals cerrados, etiquetas HTML balanceadas, conteo de columnas del reporte (8) y la
declaración de `_rptExport` movida al tope del script para evitar TDZ. Se recomienda al qa-tester
re-ejecutar el chequeo de sintaxis JS.
