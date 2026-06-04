# Mapeo exacto de cambios — Lote B

Proyecto: Sistema Nova · `prototipo-ux-v2/gestion-equipos.html`
Fecha: 2026-05-31
Objetivo: Todas las semanas de calendarios/grillas/selectores arrancan en DOMINGO (antes LUNES).
Más: alinear a 2026 la data demo de COBERTURA y VACACIONES de contexto actual.
Fuera de alcance (no tocado): login, ascenso, marcación biométrica.

## A. Semana DOMINGO → SÁBADO

### 1. Grilla ROL DE PERSONAL
| Línea | Antes | Después |
|------|-------|---------|
| 4209 | `baseLun.setDate(today.getDate()-(dow===0?6:dow-1));` | `baseLun.setDate(today.getDate()-dow); // semana inicia DOMINGO` |
| 4232 | `const dayLabels=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];` | `const dayLabels=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];` |
| 1857-1863 | thead hardcodeado `Lun, Mar, Mié, Jue, Vie, Sáb, Dom` | `Dom, Lun, Mar, Mié, Jue, Vie, Sáb` |

Nota: el `<tbody>` del rol (celdas de día, ~4308) se genera desde `weekDates`, que deriva de
`lunes` (ahora anclado a domingo) en el bucle `for(i=0;i<7;i++)`. Por tanto las celdas de datos
se reordenan automáticamente a domingo-primero, en sincronía con los nuevos labels y `weekLabels`.
Se conservó el nombre de variable `baseLun`/`lunes` (renombrar era riesgo innecesario); solo
cambió la aritmética del offset.

### 2. Calendario de DESCANSOS
| Línea | Antes | Después |
|------|-------|---------|
| 4794 | `ws.setDate(today.getDate()-(dow===0?6:dow-1)+(_dcCalOffset*7));` | `ws.setDate(today.getDate()-dow+(_dcCalOffset*7));` |
| 4527 | `lunes.setDate(today.getDate() - (dow===0?6:dow-1) + (_dcCalOffset*7));` (generarSugerencias) | `... - dow + ...` |
| 4607 | `lunes.setDate(today.getDate() - (dow===0?6:dow-1) + (_dcCalOffset*7));` (generarSugerenciasComp) | `... - dow + ...` |

Nota: las cabeceras de día del calendario de descansos usan `_dcDays[d.getDay()]`
(`['DOM','LUN',...]`, indexado por getDay()=0=DOM), por lo que se auto-corrigen al iniciar el
window en domingo. Las ventanas de sugerencias (4527/4607) usan el MISMO `_dcCalOffset` que el
render (4794); se alinearon para que sugerencias y grilla mostrada coincidan.

### 3. REPORTE (Detalle por Colaborador, tabla estática ~2870)
| Línea | Antes | Después |
|------|-------|---------|
| 2870 | thead `... Lun, Mar, Mié, Jue, Vie, Sáb, Dom ...` | `... Dom, Lun, Mar, Mié, Jue, Vie, Sáb ...` |
| 2873-2886 (13 filas) | celdas de día `[Lun,Mar,Mié,Jue,Vie,Sáb,Dom]` (Dom siempre `—`) | `[Dom,Lun,Mar,Mié,Jue,Vie,Sáb]` (Dom=`—` al inicio) |

Para cada fila se movió la última celda de día (Dom, valor `—` en todas) al inicio, manteniendo
el conteo de 12 columnas y los totales H.Laboradas/H.Ley/Diferencia sin cambio.

### 4. Otros selectores de semana visibles (coherencia domingo→sábado)
| Línea | Contexto | Antes | Después |
|------|----------|-------|---------|
| 3185 | `openRepCobertura()` — opciones de semana del reporte Índice de Cobertura | `lun.setDate(t.getDate()-(dow===0?6:dow-1));` | `lun.setDate(t.getDate()-dow);` |
| 3203 | `rcobRender()` — rango de semana del reporte de cobertura | `ws.setDate(t.getDate()-(dow===0?6:dow-1)+wOff*7);` | `ws.setDate(t.getDate()-dow+wOff*7);` |
| 3841 | `_encFillSemanas()` — selector de semana en modal de Encargatura | `lun.setDate(t.getDate()-(dow===0?6:dow-1));` | `lun.setDate(t.getDate()-dow);` |

### Verificado SIN cambios (correctos o fuera de alcance)
- L4078 `_rolDays=['Dom','Lun',...]`: ya domingo-primero; usado como mapa por nombre de día (orden-independiente).
- L4775 `_dcDays=['DOM','LUN',...]` y L5003 `DOW=['Dom','Lun',...]`: indexados por `getDay()` (0=DOM), auto-correctos.
- L5003 grid del modal de descanso individual: anclado a una fecha específica (no a inicio de semana); no requiere cambio.
- Lógica de marcación biométrica: NO tocada (otro lote).

## B. Alineación de data demo a 2026

### Cobertura (`encargaturas`, líneas 3588-3592)
Todas las fechas `desde`/`hasta`/`fechaCreacion`/`fechaModif` pasaron de mayo 2025 a mayo 2026
(bump de año, conservando día/mes/hora). Quedan coherentes con `descansos`/marcaciones (ya en 2026).

### Vacaciones (`vacaciones`, líneas 3595-3606)
- IDs 1-10 y 12 (`anio:'2025'`, contexto actual): `inicio`/`fin`/`anio` 2025 → 2026.
  - Quedan: activas mayo 2026, programadas jun-sep 2026, culminadas mar 2026, anulada abr 2026.
- ID 11 (era `anio:'2024'`, histórico): se desplazó a 2025 (`inicio/fin/anio` nov-2024 → nov-2025)
  para que siga siendo el registro del año ANTERIOR al actual (2026), conservando su rol histórico.
- NO se tocaron periodos vacacionales históricos en rango (2020-2025) — esos viven en `app.html`
  (tabla L1097-1109), que es de otro archivo y se conservó intacto en Lote A.

### Filtros y defaults de Año de Vacaciones (coherencia)
| Línea | Antes | Después |
|------|-------|---------|
| 2110 | `<option>2025</option><option>2024</option>` | `<option>2026</option><option>2025</option><option>2024</option>` |
| 2167 | `<option>2025</option><option>2024</option><option>2023</option>` | `<option>2026</option>...2025/2024/2023` |
| 4030 | `value=v.anio||'2025'` | `value=v.anio||'2026'` |
| 4037 | `.value='2025'` (default nuevo registro) | `.value='2026'` |

## Confirmación de inicio de semana en DOMINGO (todas las vistas)
- Rol de Personal: offset `-dow` + labels Dom→Sáb + thead Dom→Sáb + body derivado de `weekDates`.  OK
- Calendario de Descansos (render + sugerencias x2): offset `-dow`; cabeceras por `getDay()`.  OK
- Reporte Índice de Cobertura (selector + render): offset `-dow`.  OK
- Selector de semana Encargatura: offset `-dow`.  OK
- Reporte Detalle por Colaborador (tabla estática): columnas Dom→Sáb.  OK

## Validación de sintaxis
Pendiente de ejecución automatizada (permiso de Bash denegado al cierre). Cambios aplicados como
reemplazos exactos que preservan la sintaxis circundante; revisión manual de regiones clave
(4206-4218, 2870-2873) confirmó balanceo de expresiones, literales de array y etiquetas HTML, y
conteo de columnas (12) consistente entre thead y filas del reporte. Se recomienda al qa-tester
re-ejecutar el chequeo de sintaxis JS.
