# Mapeo de cambios — Lote D (Ascenso Senior)

Proyecto: Sistema Nova · `prototipo-ux-v2/app.html`
Fecha: 2026-05-31
Referencias: reconciliacion-ux.md (H-02, H-04) · ENT-MOD-ASCE-001 v1.3 (C-01/H-02/H-04, RN-ASCE-05/06/18/19/23/25).
Fuera de alcance (no tocado): login, ascenso "lógica de calendarios", marcación biométrica.

## Resumen de correctitud
- (a) Se RETIRÓ la acción de ascenso (botón estrella `aact-sr` + `openSenior`) de la lista de
  asesores de Gestión de Equipos. Los asesores que ya son Senior muestran un BADGE "Senior"
  de SOLO LECTURA (ícono hexágono, no estrella, no clickeable).
- (b) El ascenso ahora VIVE en Aprobaciones, en un nuevo segmento "Ascensos", con: promotor =
  Administración de Ventas (AV), panel obligatorio de cumplimiento de 6 meses, Aprobar/Rechazar
  (rechazo con motivo obligatorio) y segregación (R-GG-SUP) cuando el GG es el solicitante.

---

## 1. Lista de asesores (pantalla gest-store) — retiro de la acción de ascenso

### CSS añadido (tras `.aact-cv.act`, ~L142)
- `.sr-badge` (badge Senior de solo lectura, color índigo, no clickeable).
- Estilos del panel de ascensos: `.asc-prom`, `.asc-panel-btn`, `.asc-seg-note`,
  `.liccard-apr:disabled`, `.cmp-tbl`, `.cmp-ok`, `.cmp-low`, `.cmp-nh`.

### Filas de asesores (8 filas, antes L903-910 → ahora ~L921-928)
Para CADA fila se eliminó el `<button class="aact aact-sr" onclick="openSenior('...')">` con su
`<svg>` de estrella (`<polygon points="12 2 15.09 8.26 ...">`).

| Asesor | Antes | Después |
|--------|-------|---------|
| Ana Torres | tr + estrella(sr) + cv | tr + cv |
| Carlos Gómez | tr + estrella(sr) + cv | tr + cv |
| Lucía Prado | tr + estrella(sr `.act`) + cv | tr + cv + **badge "Senior" (hexágono) de solo lectura** en el bloque de nombre |
| Jorge Ruiz | tr + estrella(sr) + cv | tr + cv |
| María Flores | tr + estrella(sr) + cv | tr + cv |
| Pedro Sánchez | tr + estrella(sr `.act`) + cv | tr + cv + **badge "Senior" (hexágono) de solo lectura** |
| Valeria Castillo | tr + estrella(sr) + cv | tr + cv |
| Diego Salazar | tr + estrella(sr) + cv | tr + cv |

Nota: los Seniors se identificaron por la estrella RELLENA `aact-sr act` (Lucía Prado y Pedro
Sánchez). El badge usa `<polygon points="6 3 18 3 22 12 18 21 6 21 2 12">` (hexágono), nunca estrella.

### Limpieza de JS (sin referencias colgando)
| Ubicación | Antes | Después |
|-----------|-------|---------|
| `openSenior()` + `selectSrType()` (~L2197-2219) | modal de ascenso con "tipo (temp/perm)", "tienda destino" y "rango de fechas" | ELIMINADAS; reemplazadas por comentario que apunta a Aprobaciones > Ascensos |
| `submitBSheet()` rama `bType==='sr'` (~L2128-2133) | guardaba `actionData[name].sr={tipo,tienda,desde,hasta}` | ELIMINADA |
| `rowClick()` guard | `if(!data.tr && !data.sr && !data.cv) return;` | `if(!data.tr && !data.cv) return;` |
| `rowClick()` bloque detalle `if(data.sr){...}` (~L2162-2170) | sección "Ascenso Senior" con tipo/tienda/desde/hasta | ELIMINADA |
| `actionData` (~L2083-2090) | precarga `sr` para Lucía Prado y Pedro Sánchez (tipo/tienda/fechas) | `const actionData = {};` (su condición Senior ahora la refleja el badge de solo lectura) |

CSS `.dtl-tag.dtl-sr` (~L187) queda sin uso pero inofensivo; se conserva (eliminar CSS es
cosmético y sin riesgo).

---

## 2. Aprobaciones — nuevo segmento "Ascensos"

### Segmento (control seg, ~L1481)
Antes: 3 botones (Solicitudes / Roles / Licencias).
Después: se añadió `<button class="seg-btn" id="atab-asc" onclick="switchAprobTab('asc')">Ascensos</button>`.
`switchAprobTab(type)` es genérico (`atab-${type}` / `aprob-panel-${type}`), por lo que el nuevo
segmento funciona sin tocar esa función.

### Panel `aprob-panel-asc` (insertado tras `/panel-lic`, ~L1671-1760)
- Sub-tabs (Todas/Pendientes/Aprobadas/Rechazadas) reutilizando `switchStab` (lee `data-status`).
- 3 tarjetas demo reutilizando el componente visual `liccard` (mismo estilo que Licencias):
  - `asc1` Ramos Martínez, Elmer Jhon (EL TACNA · Asesor).
  - `asc2` Chira Sotil, Mayra Carla (EL LARCO · Asesor) — variante Lukers en el panel (añade % Asesoría / % Tesoro).
  - `asc3` Huapaya Ruiz, Hugo Sandro (LUKERS MENDIOLA · Asesor) — **caso de SEGREGACIÓN**.
- Cada tarjeta muestra: candidato + tienda + puesto, **"Promotor / solicitante: Administración
  de Ventas (AV)"**, botón **"Ver cumplimiento (últimos 6 meses)"** (`openAscPanel`), y acciones
  Aprobar/Rechazar con área de rechazo inline (`rej-area` + textarea obligatoria), igual patrón
  que Licencias.
- NO hay "tienda destino" ni "rango de fechas" ni "confirmación directa" (correctitud H-02).
- Segregación (`asc3`): botón **APROBAR deshabilitado** (`disabled` + title "Requiere GG Suplente
  (segregación)") y nota visible: "Por segregación de funciones, esta solicitud debe ser resuelta
  por un Gerente General Suplente (R-GG-SUP)." El botón Rechazar sí queda activo.
- Banner informativo al pie aclarando el flujo (AV inicia, GG/GG Suplente resuelve, sin tienda
  destino ni fechas).

### JS añadido (antes de `toast`, ~L2355-2420)
- `_ascMeses` (Dic 2025 → May 2026, ventana fija de 6 meses) y `_ascData` (datos demo ficticios;
  `std` y `lukers`).
- `_ascPct(v)`: formatea con 1 decimal; ≥100% en azul (`cmp-ok`), <100% en rojo (`cmp-low`);
  `null` → "Sin hist. Senior" (`cmp-nh`), conforme a RN-ASCE-25.
- `openAscPanel(name, variante)`: abre el bottom-sheet existente (`showBSheet`) con la tabla de
  cumplimiento de 6 meses (mes / % cuota asesor / % senior; +% asesoría/% tesoro si Lukers) y nota
  de panel obligatorio. Apoyo a decisión informada del GG; sin bloqueo automático (RN-ASCE-23).
- `approveAsc(id,name)`: marca la tarjeta como "✓ Ascenso aprobado", actualiza badge y `data-status`.
- `startRejectAsc(id)` / `confirmRejectAsc(id,name)`: rechazo con **motivo obligatorio**
  (si vacío, toast de aviso y no resuelve), mismo patrón que `startRejectLic`/`confirmRejectLic`.

---

## Verificación funcional (manual)
- (a) En la lista de asesores ya NO existe `aact-sr` ni `openSenior` ni ícono estrella; los
  Seniors (Lucía Prado, Pedro Sánchez) muestran badge "Senior" hexágono de solo lectura. OK
- (b) Aprobaciones > Ascensos existe, con promotor=AV, panel de 6 meses (`openAscPanel`),
  Aprobar/Rechazar (motivo obligatorio) y segregación (asc3: Aprobar deshabilitado + aviso
  R-GG-SUP). OK
- Sin onclick colgando: todas las nuevas funciones (`openAscPanel`, `approveAsc`, `startRejectAsc`,
  `confirmRejectAsc`) están definidas; `switchAprobTab('asc')` resuelve a ids existentes. OK
- Sin referencias rotas tras retirar el ascenso: `openSenior`/`selectSrType`/rama `sr` eliminadas
  de forma consistente (markup + submitBSheet + rowClick + actionData). OK

## Validación de sintaxis
Pendiente de ejecución automatizada (permiso de Bash denegado al cierre). Cambios aplicados como
reemplazos exactos; revisión manual de las regiones editadas (bloque JS Ascensos 2355-2420, panel
HTML 1671-1760, filas de asesores) confirmó balanceo de llaves, template literals cerrados y
etiquetas HTML balanceadas. Se recomienda al qa-tester re-ejecutar el chequeo de sintaxis JS.
