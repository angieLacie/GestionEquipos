# Notas de implementación — Lote A (bajo riesgo)

Proyecto: Sistema Nova · Prototipos UX v2
Fecha: 2026-05-31
Alcance: SOLO Lote A. NO se tocó lógica de calendarios, ascenso, login ni marcaciones.

## Cambios aplicados

### CAMBIO 1 — Naming del producto (P-10)
- `gestion-equipos.html` línea 1239: footer del login.
  - Antes: `v2.4.1 · Sistema Administrativo de Tiendas`
  - Después: `v2.4.1 · Nova · Gestión de Equipos`
- Verificado: "Sistema Administrativo de Tiendas" NO aparece en ningún otro lugar de los 3 archivos.
- Títulos de pestaña `<title>` se conservaron sin cambios (requisito).

### CAMBIO 2 — Fechas demo a contexto 2026 (P-01)
Estrategia de coherencia: el contexto "actual" del demo se mueve de Abril 2025 a Abril 2026
(bump de año, conservando día/mes), alineado con la fecha de hoy 31/05/2026. Las tarjetas
"Semana 23" que estaban en 2024 se llevaron a 2026 conservando semana/día/mes.

Validación post-cambio: sintaxis JS OK en los 3 archivos (todos los bloques `<script>`).

## Lo que NO se tocó (fuera de Lote A) y por qué
- **gestion-equipos.html**: arrays JS de cobertura (`coberturas`, líneas ~3588-3592) y de
  vacaciones (`vacaciones`, ~3595-3606). Alimentan render de tablas/calendario → dominio de
  calendarios. La data de marcaciones (~3619-3639) ya estaba en 2026.
- **gestion-equipos.html**: módulo de marcación/compensación (`am-*`, líneas 2419, 2563,
  2571-2581). Las fechas propuestas tienen día de semana exacto (Vie/Lun/Sáb) → marcaciones.
- **gestion-equipos.html**: filtros de "Año de Vacaciones" (2110, 2167) y defaults JS
  (4030, 4037) → periodos vacacionales + lógica de calendario.
- **app.html**: tabla de periodos vacacionales históricos (1097-1109: 2024-2025, 2023-2024,
  2022-2023, 2021-2022, 2020-2021) y sus fechas F.INICIO/F.FIN → periodos legítimos.
- **asistencia-app.html**: `updateClock()` (líneas 440-451) usa `new Date()` real; no se
  modificó. Sobrescribe en runtime los valores estáticos de fecha (cosmético).

---

## Sesión 2026-06-15c — Parámetros: editar / activar-desactivar / borrar por fila (Lote G)

Pantalla `src/views/config/parametros/index.tsx` + lib `src/lib/config-parametros.ts`.
Antes la tabla solo leía + botón "Nueva versión". Se cierran las operaciones por fila.

### Lib `config-parametros.ts`
- `interface Parametro`: nuevo campo `estado: 'Activo' | 'Inactivo'` (el GET ya lo devuelve).
- `cambiarEstadoParametro(id, estado)` → `PATCH /v1/maes/configuracion/parametros/{id}/estado`,
  body `{ estado, idActor }` (idActor desde `useAuth.getState().usuario?.idUsuario`, igual que
  `crearParametro`). Devuelve la fila.
- `eliminarParametro(id)` → `DELETE /v1/maes/configuracion/parametros/{id}?idActor=<guid>`.
  204 sin body → el helper `api` ya devuelve `undefined` en 204; el 400 (vigenciaDesde <= hoy)
  se propaga como `Error.message` vía `leerError` (problem.detail). No hay manejo especial extra.

### UI `index.tsx`
- **Columna "Estado"**: `EstadoBadge` — Activo (verde, `bg-success-subtle`) / Inactivo
  (gris, `bg-secondary-subtle text-muted`). Ortogonal a "Vigente hasta".
- Para evitar confusión Estado vs Vigencia, el badge de "Vigente hasta" sin cierre pasó de
  decir "Vigente" (verde) a "Sin cierre" (info/azul). La vigencia es temporal; el estado es activación.
- **Columna "Acciones"** (centrada, `btn-sm btn-icon rounded-circle`, mismo patrón que feriados):
  - Editar (`#edit-2`) → abre el modal EXISTENTE prellenado (modulo, nombreParametro, valor,
    criticidadConsumo) sobre `formInicial()` para el resto. NO sobrescribe: crea nueva versión
    (comportamiento de `crearParametro`). Título del modal pasa a "Editar (nueva versión)"
    (flag `editando`); alta desde cero mantiene "Nueva versión de parámetro".
  - Activar/Desactivar (`#power`, warning si activo / success si inactivo) → `cambiarEstadoParametro`,
    refresca y muestra Aviso. SIN confirmación (no destructivo, convención del proyecto).
  - Borrar (`#trash-2`, danger) → `useConfirm` (variant danger). Al confirmar `eliminarParametro`;
    el 400 del backend (versión ya vigente/pasada) cae en el catch y se muestra en el Aviso de error.
- `{confirmDialog}` renderizado al final del componente.

### Validación
- `npx tsc --noEmit` en `TS/` → sin errores.
- Backend :5109 detenido al cierre de sesión; no se levantó (no obligatorio para implementar).
  Verificación funcional en navegador pendiente para qa-tester con el host Nova.Bootstrap arriba.

---

## Lote H — Login pro + flujo completo de recuperación de contraseña (mock) — 2026-06-15

### Objetivo
Rehacer el login (split-screen pro con cuentas demo) y construir el flujo COMPLETO de
recuperación de contraseña en 4 pasos dentro de una sola ruta. Identidad **Nova / Gestión de
Equipos**. Recuperación = MOCK (no hay backend de email/código). Login usa el `login()` real.

### Arquitectura
- `src/views/auth/components/AuthBrandPanel.tsx` — panel de marca izquierdo compartido: logo
  "Nova · Gestión de Equipos / Sistema de Control · Asistencia y Accesos", copy marketing, pills
  [Marcaciones, OFIPLAN, Multi-empresa, Auditoría], 3 anillos concéntricos + 2 líneas diagonales
  decorativas, footer copyright. `d-none d-lg-flex`.
- `src/views/auth/components/AuthShell.tsx` — wrapper overlay `position-fixed` zIndex 1050,
  `row g-0 min-vh-100`, panel de marca fijo + columna derecha centrada (maxWidth 440). Reutilizado
  por login y recuperación, así no dependen del fondo Vanta del AuthLayout.
- `src/views/auth/components/OtpInput.tsx` — 6 inputs de 1 dígito: autofocus, avanzar al escribir,
  backspace retrocede, flechas izq/der, pegar 6 dígitos. Controlado (`value`/`onChange`).
- `src/lib/password-rules.ts` — helper puro `evaluarPassword(password, confirmar?)` → `{ ok, reglas[] }`.
  Reglas: 8+ chars, mayúscula, minúscula, número, especial, coinciden.
- `src/lib/auth-recovery.ts` — MOCK con delays: `enviarCodigo`, `validarCodigo` (acepta cualquier
  6 dígitos / `CODIGO_DEMO=123456`), `resetPassword`. Cada función comentada como SEAM para backend.

### Login (`/auth/login`, reescrito)
- Título "Iniciar sesión" + subtítulo corporativo. Campo "Usuario o correo" (placeholder admin) +
  "Contraseña" con toggle ojo y aviso Bloq Mayús. "Recordarme" (localStorage `nova-usuario-recordado`)
  + link a forgot-password. Botón "Ingresar ›".
- Separador "CUENTAS DE DEMOSTRACIÓN" + tarjetas clickeables (avatar iniciales en círculo de color,
  nombre, rol·usuario, chevron). `Administrador` (admin/Nova2026!) prellena Y entra con `login()` real.
  `Supervisor`/`Encargado` solo prellenan usuario y avisan que requieren backend.
- Mantiene `login()` real → `setSesion` → `navigate('/')`.

### Recuperación (`/auth/forgot-password`, reescrito como wizard de 4 pasos, estado interno)
1. **Restablecer contraseña**: input correo + "Enviar código de verificación" + caja info. `enviarCodigo`.
2. **Verifica tu identidad**: muestra correo, `OtpInput`, "Reenviar en 60s" (countdown → habilita
   "Reenviar código"), "Validar código" (disabled hasta 6 dígitos). `validarCodigo`.
3. **Nueva contraseña**: 2 campos con toggle ojo + caja REQUISITOS con checklist en vivo (check-circle
   verde / circle gris). Botón disabled hasta `pwd.ok`. `resetPassword`.
4. **Listo**: check-circle en círculo verde + "Volver al inicio de sesión".
- El panel de marca queda fijo; solo cambia la columna derecha. "‹ Volver" en pasos 1 (→login) y 2 (→paso1).

### Accesibilidad
- `role="alert"` en errores, `role="note"` en caja info, `role="group"`/`aria-label` en OTP y por dígito.
- Labels asociados, `aria-label` en toggles ojo y tarjetas demo, `autoComplete` apropiados
  (username/current-password/email/new-password/one-time-code), foco visible nativo Bootstrap.

### Iconos
Todos los usados existen en `public/icons/sprite.svg`: user, lock, mail, eye, eye-off, arrow-right,
chevron-left, chevron-right, alert-circle, alert-triangle, check-circle, circle, info. No faltó ninguno.

### Validación
- `npx tsc --noEmit` en `TS/` → sin errores.
- Dev server activo en :5174 (200 OK en /auth/login). Verificación visual en navegador pendiente
  para qa-tester (Chrome MCP no disponible en esta sesión).

---

# Lote I — Chip de estado + drawer de historial en Ascenso Senior y Vacaciones

Fecha: 2026-06-16
Alcance: Replicar EXACTAMENTE el patrón "chip de estado + drawer de historial" de
`src/views/rol/index.tsx` (molde) en Ascenso Senior y Vacaciones. NO se modificó la
lógica/datos existentes de cada vista; solo se agregó: import scss + consts mock
(estados, colores, HistItem, HISTORIAL) + estado `histOpen` + chip + botón Historial + drawer.

Reutiliza las clases globales de `rol.scss` vía `import '@/views/rol/rol.scss'`
(mismo enfoque que `descansos/index.tsx`). Iconos del sprite: clock, x, arrow-right.

## Ascenso Senior (`src/views/ascensos/index.tsx`)
- `import '@/views/rol/rol.scss'`.
- Estados del flujo: `'En evaluación' | 'Enviado a GG' | 'Aprobado' | 'Rechazado' | 'Promovido'`.
  Mapa `ESTADO_ASCENSO_COLOR` (En evaluación #64748b, Enviado a GG #6366f1, Aprobado #16a34a,
  Rechazado #ef4444, Promovido #0d9488). `ESTADO_ACTUAL_ASCENSO = 'En evaluación'`.
- `const [histOpen, setHistOpen] = useState(false)`.
- **Ubicación del chip:** barra de tabs/filtros (fila `d-flex` con tabs de estado y selects de
  zona/tienda), dentro del grupo `ms-auto`, justo antes del botón Historial y los selects.
- **Botón Historial:** `btn btn-sm btn-light rol-btn-ghost` con ícono `clock`, junto al chip.
- **Drawer:** bloque `rol-hist-ov` con header (título "Historial de ascensos"), sección
  `rol-hist-estado` (chip + "Estado actual del documento") y timeline `HISTORIAL_ASCENSO`
  (5 items: documento "Creó solicitud"/"Adjuntó cumplimiento"/"Envió a aprobación" + celda
  "Actualizó evaluación" 98.0%→103.5% y "Cambió decisión" Enviado a GG→En evaluación).
  Roles GT/GZ/GG con nombres verosímiles (L. Paredes, M. Rojas, A. Campos).

## Vacaciones (`src/views/vacaciones/index.tsx`)
- `import '@/views/rol/rol.scss'`.
- Estados del flujo: `'Solicitada' | 'Aprobada por GT' | 'Aprobada por GG' | 'Rechazada' |
  'Programada' | 'En goce' | 'Concluida'`. Mapa `ESTADO_VAC_COLOR` (Solicitada #0ea5e9,
  Aprobada GT #6366f1, Aprobada GG #16a34a, Rechazada #ef4444, Programada #0d9488,
  En goce #f59e0b, Concluida #94a3b8). `ESTADO_ACTUAL_VAC = 'Solicitada'`.
- `const [histOpen, setHistOpen] = useState(false)`.
- **Ubicación del chip:** dentro de la Card de filtros (input de búsqueda + selects), en el
  grupo `ms-auto` que antes solo tenía el contador "N empleados"; ahora chip + botón Historial
  + contador.
- **Botón Historial:** `btn btn-sm btn-light rol-btn-ghost` con ícono `clock`.
- **Drawer:** título "Historial de vacaciones", sección `rol-hist-estado` y timeline
  `HISTORIAL_VAC` (5 items: documento "Creó solicitud"/"Envió a aprobación" + celda
  "Editó fechas" 12/07→15/07, "Cambió estado" Solicitada→Aprobada por GT, "Revirtió decisión").
  Roles GT/GZ/GG (C. Salas, M. Rojas, A. Campos).

## Validación
- `npx tsc --noEmit` en `TS/` → sin errores.
- Clases SCSS (`rol-estado-chip`, `rol-estado-dot`, `rol-hist-*`, `rol-hist-estado-txt`) y
  iconos del sprite (clock, x, arrow-right) verificados presentes.
- Dev server activo en :5174. Rutas `/ascensos` y `/vacaciones` bajo `RequireRoles` (requieren
  sesión); verificación visual autenticada para qa-tester.

---

# Lote J — Drawer de historial (sin chip) en Encargatura y Marcaciones

Fecha: 2026-06-17
Alcance: SOLO se agregó el "drawer de historial" (sin chip de estado), replicando el molde
ya implementado en `src/views/descansos/index.tsx`. No se tocó lógica/datos existentes.

## Patrón replicado (molde: descansos)
Por módulo se agregó: import `@/views/rol/rol.scss`, tipo `HistItem`, array mock `HISTORIAL`,
estado `histOpen`, botón "Historial" (`btn btn-sm btn-light rol-btn-ghost` + ícono `clock`),
y el bloque drawer `{histOpen && (<div className="rol-hist-ov">…)}` (versión sin sección de estado,
solo título + subtítulo + timeline). Iconos del sprite: `clock`, `x`, `arrow-right` (verificados).

### Encargatura — `src/views/encargaturas/index.tsx`
- Botón "Historial": en la toolbar de filtros (Card), dentro del grupo `ms-auto`, antes de "Exportar".
- HISTORIAL (5 ítems): Programó cobertura (documento), Asignó encargado (celda — → Encargado: Luis Quispe),
  Editó tienda (Centro Cívico → Plaza Norte), Cambió estado (Programado → En ejecución),
  Anuló encargatura (Programado → Anulado). Roles GZ/GT/GG.
- Drawer: título "Historial de encargaturas", subtítulo "Programaciones de cobertura · últimos movimientos".

### Marcaciones — `src/views/marcaciones/index.tsx`
- Botón "Historial": en la toolbar de filtros (Card), dentro del grupo `ms-auto`, antes de "Limpiar".
- HISTORIAL (5 ítems): Corrigió marcación (08:15 tarde → 08:00 justificada), Justificó tardanza (documento),
  Registró marca manual (documento), Anuló marca duplicada (Doble marca → Eliminada),
  Validó asistencia (documento). Roles GT/GZ.
- Drawer: título "Historial de marcaciones", subtítulo "Correcciones y justificaciones · últimos movimientos".

## Verificación
- `npx tsc --noEmit` en `TS/` → sin errores.
- NO se agregó chip de estado (ambos módulos muestran estado por registro en su tabla).
- Sin cambios en lógica, datos, filtros ni acciones existentes.
