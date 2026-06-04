# Design System Nova — Base (v2.0)

| Campo | Valor |
|---|---|
| Documento | Design System base de Nova |
| Sistema | Nova — Gestión de Equipos (retail Cadena / Lukers) |
| Versión | 2.0 |
| Fecha | 31/05/2026 |
| Elaborado por | UX/UI Designer Senior |
| Estado | RECONCILIADO con prototipo (fuente de verdad visual) — pendiente de validación de marca con PO |
| Documentos base | reconciliacion-ux.md v1.0 (fuente de verdad visual), alcance-nova.md, ENT-MOD-ROLP-001 v1.1, ENT-MOD-MARC-001 v1.1, ENT-MOD-DESC-001 v1.2, ENT-MOD-APRO-001 v1.0, ENT-MOD-ASCE-001 v1.2, ENT-MOD-SEGU-001 v1.0 |

> **Nota de marca (supuesto a validar — SUP-UX-01):** El análisis no define identidad visual corporativa ni paleta de Cadena ni de Lukers. Los tokens de color de marca de este documento son una **propuesta neutra profesional** y deben validarse con el PO / equipo de marca. La arquitectura de tokens está preparada para soportar **theming dual por empresa** (Cadena / Lukers) cambiando solo los tokens de marca, sin tocar componentes. Todos los datos de ejemplo son ficticios.

> **Nota de reconciliación (v2.0):** Este documento se reconcilió contra el **prototipo funcional aceptado como fuente de verdad visual** (ver `reconciliacion-ux.md`). Los cambios incorporados están listados en el Changelog (§0).

---

## 0. Changelog

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 30/05/2026 | Versión inicial (tokens, componentes, patrones, accesibilidad). |
| 2.0 | 31/05/2026 | Reconciliación con prototipo. **(H-01)** Semana global **domingo→sábado** como token de patrón en todos los calendarios/grillas y en el selector de fecha/rango. **(H-04)** Nuevo átomo **Badge "Senior"** de solo lectura e ícono unificado **▲** para la acción de ascenso (se retira el uso de ★ como acción). **(H-02)** El ascenso Senior deja de ser acción de Gestión de Equipos: en listas de personal solo badge de solo lectura; la acción ▲ y el panel de cumplimiento viven en Aprobaciones. **(H-03)** Nuevo organismo **Calendario unificado de ausencias programadas** (Licencias + Descansos + Vacaciones) con validación de no-cruce. **(H-05/H-06)** Patrón **RBAC/recorte por rol-ámbito** y **segregación visible** elevados a patrón transversal. **(H-08)** Nuevos badges de estado **"Pendiente de aprobación"** y **"En validación Bienestar"** en Descansos/Licencias. **(H-10)** Patrón de **comentario obligatorio en rechazo** reforzado. **(H-14 a H-19)** Nuevos badges de marcación (atribución por huella, tardanza, marcación anticipada, ausencia justificada, error del biométrico). **(P-01)** Datos demo a **2026**. **(P-02)** Componente **Leyenda** (tipos de día, siglas, color de números). **(P-03)** `aria-label`/`aria-live` reforzados. **(P-04)** Color semántico de estados alineado al significado. **(P-05)** Umbrales de cobertura **parametrizables** (verde/naranja/rojo). **(P-06)** Botón **SSO** en login. Conserva fortalezas §5 de la reconciliación. |

---

## 1. Principios de diseño

Nova es una herramienta operativa de uso intensivo y diario (gerentes en web, colaboradores en móvil). El diseño se rige por estos principios, en orden de prioridad:

1. **Claridad operativa sobre estética.** El calendario del Rol, la bandeja de Aprobaciones y las marcaciones se consultan muchas veces al día. La información crítica (estado, plazo, ratio, alerta de bloqueo) debe leerse de un vistazo, sin ambigüedad.
2. **Densidad legible.** Las grillas manejan ~100 tiendas, semanas completas y múltiples colaboradores. Se prioriza densidad de datos controlada con jerarquía tipográfica y espaciado, evitando el scroll innecesario, pero sin sacrificar el área de toque mínima.
3. **El estado siempre visible.** Toda entidad con ciclo de vida (rol, solicitud, descanso, marcación, tarea de aprobación) muestra su estado con un badge consistente. Nunca se infiere el estado por color solo (se acompaña de texto/ícono — accesibilidad).
4. **Privacidad por defecto.** Solo se muestran los datos que el flujo requiere. Datos sensibles (historial de cumplimiento del candidato a Senior, marcaciones, identidad de aprobadores) se exponen únicamente al rol y ámbito autorizado. Ver `accesibilidad.md` y notas de compliance por pantalla.
5. **Adaptación por rol y ámbito.** La misma pantalla cambia según rol (GT/GZ/GG/AV/AR/ADM) y ámbito (empresa/zona/tienda). Lo no permitido no se muestra deshabilitado de forma decorativa: se oculta o se explica con microcopy.
6. **Acciones reversibles y confirmadas.** Las acciones críticas o irreversibles (aprobar ascenso, rechazar rol, anular descanso, bloquear/desbloquear POS) exigen confirmación explícita y, cuando corresponde, comentario obligatorio.
7. **Mobile-first para el colaborador, desktop-first para la gestión.** El colaborador opera exclusivamente en móvil (firma, sustentos, push). El gerente opera grillas complejas en web; el GZ además emite códigos y aprueba desde móvil.
8. **Consistencia transversal.** Estados, badges, plazos/SLA, comentarios obligatorios y patrones de aprobación se diseñan una sola vez (motor de Aprobaciones) y se reutilizan en todos los módulos.

---

## 2. Tokens de diseño

Los tokens son la fuente única de verdad. Se nombran semánticamente (no por valor) para permitir theming por empresa y modo claro/oscuro futuro.

### 2.1 Color — paleta base (neutros y semánticos)

| Token | Valor propuesto (hex) | Uso |
|---|---|---|
| `color.bg.canvas` | #F4F6F8 | Fondo de aplicación |
| `color.bg.surface` | #FFFFFF | Tarjetas, tablas, modales |
| `color.bg.subtle` | #ECEFF3 | Filas alternas, encabezados de tabla, celdas vacías |
| `color.bg.inset` | #E2E7ED | Campos, zonas de input, celdas no editables |
| `color.border.default` | #D5DBE2 | Bordes de tabla, divisores |
| `color.border.strong` | #AEB8C4 | Bordes de foco no interactivo, separadores fuertes |
| `color.text.primary` | #1B2733 | Texto principal (contraste 13.6:1 sobre surface) |
| `color.text.secondary` | #5A6472 | Texto secundario, labels (contraste 5.3:1) |
| `color.text.disabled` | #97A0AD | Texto deshabilitado (uso no informativo) |
| `color.text.inverse` | #FFFFFF | Texto sobre fondos de marca/oscuros |

### 2.2 Color — marca (theming por empresa) — PROPUESTA a validar

| Token | Cadena (propuesta) | Lukers (propuesta) | Uso |
|---|---|---|---|
| `color.brand.primary` | #1F5FA6 (azul) | #7A3FA0 (morado) | Barra superior, botón primario, enlaces, foco de marca |
| `color.brand.primary.hover` | #19507F | #663485 | Hover de elementos primarios |
| `color.brand.onPrimary` | #FFFFFF | #FFFFFF | Texto/íconos sobre primary |
| `color.brand.accent` | #0E9AA8 | #C0568A | Acento secundario, chips activos |

> El componente "selector de empresa" o el dato de empresa del usuario determina el theme activo. Cadena y Lukers se distinguen además con etiqueta textual visible (no solo color) en el encabezado, para no depender del color (WCAG 1.4.1).

### 2.3 Color — feedback semántico (estados)

| Token | Valor (hex) | Contraste texto | Uso |
|---|---|---|---|
| `color.success.fg` / `.bg` | #1E7A46 / #E4F4EA | AA sobre bg | Éxito, aprobado, jornada cerrada, **Culminado / Ejecutado**, ratio ≥ 100%, **"Aprobar" (color positivo)** |
| `color.warning.fg` / `.bg` | #9A6B00 / #FBF1D9 | AA sobre bg | Advertencia, próximo a vencer, salida tardía, **tardanza / marcación anticipada** |
| `color.danger.fg` / `.bg` | #B3261E / #FBE7E5 | AA sobre bg | Error, rechazo, bloqueo POS, ratio < 100%, SLA vencido, **error del biométrico** |
| `color.info.fg` / `.bg` | #1F5FA6 / #E6EEF7 | AA sobre bg | Informativo, en revisión, **Pendiente de aprobación**, **En validación Bienestar** |
| `color.neutral.fg` / `.bg` | #5A6472 / #ECEFF3 | AA sobre bg | Estado neutro, borrador, sin marcación, **ausencia justificada** |

> **Regla de cumplimiento de ratios (RN-ROLP / RN-ASCE-25):** los ratios de rendimiento se muestran `≥ 100% en azul` (`color.info.fg`) y `< 100% en rojo` (`color.danger.fg`) con **1 decimal**, acompañados del valor numérico siempre (no se codifica el cumplimiento solo por color). En tablas con números codificados por significado (panel 6 meses, columnas Indemn/Pend/Trunc/Tot de vacaciones), se incluye **leyenda del color de los números** (ver §3.5 Leyenda) — P-02.

> **Regla de color semántico de estados (P-04, alineado al prototipo):** el color de cada estado debe corresponder a su **significado**, nunca a una convención visual arbitraria.
> - "**Culminado / Ejecutado**" usa **success (verde)**, **no** el amarillo de advertencia que mostraba el prototipo.
> - La acción "**Aprobar**" usa color **positivo (success)**, **no** negro/neutro.
> - "**Pendiente de aprobación**" y "**En validación Bienestar**" usan **info/warning** según urgencia, nunca el color de "Programado/Ejecutado" (evita saltar visualmente a estado terminal — H-08).

### 2.3.1 Umbrales de cobertura parametrizables (P-05)

Los cortes de color de los indicadores de **cobertura/dotación** son **parametrizables en Maestros** (no hardcodeados). Se exponen como tokens semánticos resueltos en runtime contra el umbral configurado por empresa:

| Token | Default | Significado | Color |
|---|---|---|---|
| `coverage.ok` | ≥ umbral verde (def. 100%) | Cobertura suficiente | `color.success.fg` (verde) |
| `coverage.warn` | umbral naranja ≤ x < verde (def. 85–99.9%) | Cobertura ajustada | `color.warning.fg` (naranja) |
| `coverage.low` | < umbral naranja (def. < 85%) | Cobertura bajo mínimo | `color.danger.fg` (rojo) |

> Los tres cortes (verde/naranja/rojo) se definen en el **maestro de parámetros por empresa**. El valor numérico de cobertura siempre se muestra junto al color (no solo color — WCAG 1.4.1). La leyenda de cobertura (§3.5) explica los cortes vigentes.

### 2.4 Color — estados de celda del calendario del Rol (tokens dedicados)

Cada estado programable tiene un token de relleno + texto + un patrón/ícono de respaldo (no solo color):

| Estado de celda | Token bg | Ícono/abreviatura | Notas |
|---|---|---|---|
| Descanso Laboral | `cal.descanso` #DCE9F7 | DL | Azul claro |
| Cobertura de Tienda | `cal.cobertura` #E5E0F5 | CT | Morado claro; crea registro en Encargatura |
| Compensación feriado laborado | `cal.compFeriado` #FCEBD6 | CF | Naranja claro |
| Compensación descanso no gozado | `cal.compDNG` #F7E6F0 | CD | Rosa claro |
| Cobertura por Tipo de Venta (solo Lukers) | `cal.tipoVenta` #DBF0EC | CV | Verde-azulado (sigla **CV** unificada con la leyenda P-02; antes "TV") |
| Apoyo | `cal.apoyo` #E8EDE2 | APO | Verde-grisáceo claro |
| Sugerencia del sistema (Sastres / automática) | `cal.sugerencia` #FFF8DC + borde punteado | ✦ | Marca visual "sugerencia" editable |
| Celda libre | `color.bg.subtle` | — | Clic para programar |
| Celda no editable (día pasado) | `color.bg.inset` + cursor not-allowed | 🔒 | Tooltip "No se puede modificar días pasados" |
| Cobertura de dotación (indicador) | `coverage.*` (§2.3.1) | COB | Color por umbral parametrizable + valor numérico |
| Feriado (encabezado de columna) | `color.warning.bg` + ícono | 🎌 | Tomado del maestro de feriados (NO usar ★, reservada — ver §3.1) |

> **(H-01) Semana global domingo→sábado.** Toda grilla/calendario que use estos tokens se ancla a la **semana laboral domingo→sábado** (parametrizable por empresa en Maestros). El primer eje de columnas es siempre **DOM** y el último **SÁB**. Aplica a: calendario del Rol, calendario unificado de ausencias programadas, vista de Sastres, comparaciones programado-vs-asistencia y cualquier selector de rango (§3.2). El ícono ★ deja de usarse para feriado: feriado se marca con 🎌 + texto; la ★ no se usa en celdas de calendario.

> **Leyenda de tipos de día (obligatoria — P-02).** Todo calendario que muestre abreviaturas de estado expone una **leyenda visible** (componente §3.5) con: **DL** Descanso Laboral · **CT** Cobertura de Tienda · **CF** Compensación feriado laborado · **CD** Compensación descanso no gozado · **APO** Apoyo · **CV** Cobertura por Tipo de Venta (Lukers) · **COB** Indicador de cobertura. Cada sigla con su color y su significado completo.

### 2.5 Tipografía

| Token | Valor | Uso |
|---|---|---|
| `font.family.base` | Inter / Segoe UI / system-ui, sans-serif | Toda la UI (alta legibilidad en pantalla) |
| `font.family.mono` | "JetBrains Mono", Consolas, monospace | Códigos de autorización, montos, timestamps |
| `font.size.xs` | 12px | Metadatos, leyendas de celda, captions |
| `font.size.sm` | 14px | Cuerpo denso (tablas, calendario) |
| `font.size.md` | 16px | Cuerpo base (móvil mínimo para inputs, evita zoom iOS) |
| `font.size.lg` | 20px | Títulos de sección |
| `font.size.xl` | 24px | Título de pantalla |
| `font.size.2xl` | 30px | Cifras destacadas (cuota diaria, contadores) |
| `font.weight.regular` | 400 | Cuerpo |
| `font.weight.medium` | 500 | Labels, encabezados de tabla |
| `font.weight.semibold` | 600 | Títulos, valores clave, badges |
| `line.height.tight` | 1.25 | Títulos |
| `line.height.base` | 1.5 | Cuerpo (legibilidad WCAG 1.4.12) |

### 2.6 Espaciado (escala base 4px)

`space.0=0` · `space.1=4` · `space.2=8` · `space.3=12` · `space.4=16` · `space.5=24` · `space.6=32` · `space.8=48` · `space.10=64`

- Padding de celda de calendario: `space.2` vertical / `space.2` horizontal.
- Gutter de formularios: `space.4`. Separación entre grupos de campos: `space.5`.

### 2.7 Radios, elevación, foco

| Token | Valor | Uso |
|---|---|---|
| `radius.sm` | 4px | Inputs, celdas, chips |
| `radius.md` | 8px | Tarjetas, botones, modales |
| `radius.full` | 999px | Badges, avatares, toggles |
| `elevation.0` | none | Tablas planas |
| `elevation.1` | 0 1px 2px rgba(0,0,0,.08) | Tarjetas |
| `elevation.2` | 0 4px 12px rgba(0,0,0,.12) | Menús contextuales, popovers |
| `elevation.3` | 0 12px 32px rgba(0,0,0,.18) | Modales, drawers |
| `focus.ring` | 0 0 0 3px rgba(31,95,166,.45) | Anillo de foco visible (≥ 3px, contraste ≥ 3:1) |

### 2.8 Breakpoints (mobile-first)

| Token | Ancho | Contexto típico |
|---|---|---|
| `bp.xs` | 320px | Móvil pequeño (colaborador, firma) |
| `bp.sm` | 768px | Tablet / móvil grande (GZ emite códigos, aprueba) |
| `bp.md` | 1024px | Laptop gerencial (calendario en scroll horizontal) |
| `bp.lg` | 1440px | Desktop tienda/central (calendario completo, sin scroll) |

---

## 3. Componentes base

Cada componente declara todos sus **estados**: default, hover, focus, active, disabled, error, loading, vacío, éxito (cuando aplica). Atomic Design: tokens → átomos → moléculas → organismos.

### 3.1 Átomos

- **Botón.** Variantes: `primary`, `secondary`, `tertiary/ghost`, `danger`. Tamaños `sm/md/lg`. Estados: default, hover, focus (anillo `focus.ring`), active, disabled (no usar para ocultar permisos: ver principio 5), loading (spinner + texto, botón no clicable). Altura mínima de toque 44×44px en móvil. Ícono opcional a la izquierda. Texto siempre presente (no solo ícono salvo con `aria-label`).
- **Input de texto / textarea.** Label arriba (siempre visible, no placeholder-as-label). Estados: default, focus, error (borde `danger.fg` + mensaje debajo con ícono), disabled, readonly. Contador de caracteres cuando hay máximo parametrizable (motivo de rechazo, comentarios). `aria-describedby` para errores.
- **Select / Combobox.** Búsqueda integrada para listas largas (empleados, tiendas). Estado vacío "Seleccione". Navegable por teclado.
- **Checkbox / Radio / Toggle.** Área de toque 24px mínimo, etiqueta clicable, foco visible.
- **Badge de estado.** `radius.full`, color semántico + ícono + texto. Ver catálogo de estados en §3.4.
- **Badge "Senior" (solo lectura) — NUEVO (H-02/H-04).** `radius.full`, fondo `color.info.bg`, texto `color.info.fg`, ícono ⬣ + texto literal "Senior". **Es indicador, no acción**: no es clicable, no abre flujo. Aparece junto al nombre del colaborador en listas de personal, buscador de empleado y perfil cuando `flag Senior = SÍ`. **El ascenso a Senior NO se inicia desde estas listas** (ver §4 patrón RBAC y `flujos-ux-transversales.md`).
  - Reglas de iconografía: la **estrella ★ queda prohibida como acción de ascenso** (se leía como "favorito"). La acción de ascenso usa exclusivamente el **ícono ▲** y vive solo en Aprobaciones / panel de ascenso. La ★ tampoco se usa para feriado (ver §2.4).
- **Botón de acción "Ascenso" (▲) — NUEVO (H-04).** Ícono **▲ unificado web + móvil** con `aria-label="Solicitar ascenso a Senior para [Nombre]"`. Solo se renderiza en el contexto de Aprobaciones / panel de ascenso y bajo las condiciones de visibilidad por rol (ver transversales T.5). Nunca en Gestión de Equipos.
- **Chip / Tag.** Filtros activos, removibles con `×` (con `aria-label="Quitar filtro X"`).
- **Avatar / Iniciales.** Para listas de personal; con nombre asociado visible.
- **Tooltip.** Activable por hover y por foco de teclado. No contiene acciones (solo info). Para el caso "día pasado" y "sugerencia del sistema".
- **Indicador de carga.** Spinner (acciones puntuales) y skeleton (carga de grilla/lista).

### 3.2 Moléculas

- **Campo de formulario** (label + input + ayuda + error + contador).
- **Selector de fecha / rango.** **(H-01)** La grilla del mes/semana se ancla a **domingo→sábado** (primera columna DOM); bloquea fechas no permitidas (Tabla 04 de Descansos, días pasados). Muestra feriados con 🎌. Para el motor de ausencias programadas (H-03) ejecuta **validación de no-cruce** en línea: al elegir un rango que solape otra programación del empleado, marca las fechas en conflicto con `color.danger.bg` y muestra mensaje accionable bajo el campo (`aria-describedby`), sin permitir confirmar.
- **Buscador de empleado.** Input + resultados con código, nombre, puesto, tienda; indicador "Nuevo ingreso" (< 7 días) y **badge "Senior" de solo lectura** si aplica (H-02: el resultado muestra el badge, no una acción de ascenso).
- **Leyenda — NUEVO (P-02).** Bloque compacto, colapsable, anclado al pie o cabecera de calendarios y tablas con códigos. Tres tipos:
  1. **Tipos de día:** pares color+sigla+significado completo (DL/CT/CF/CD/APO/CV/COB) — ver §2.4.
  2. **Siglas de cobertura/dotación en Aprobaciones** (del prototipo): "1 ASES = 1 Asesor · 1 SEC/PT = 1 Secretaria/Part-time · 1 SAS/FT = 1 Sastre/Full-time".
  3. **Color de números:** explica el código cromático de cifras (Indemn = indemnizable · Pend = pendiente · Trunc = truncado · Tot = total) y el azul ≥100% / rojo <100% de ratios.
  - Accesibilidad: cada entrada de leyenda usa texto + muestra de color con `aria-label`; la leyenda es navegable por teclado y referenciada por `aria-describedby` desde la tabla/calendario que documenta.
- **Selector de estado de celda** (popover): lista de estados disponibles por puesto/empresa, con sus colores/abreviaturas; abre campos extra según estado (tienda destino, tipo de venta, feriado a compensar).
- **Contador de saldo de compensaciones** (chip doble): "Feriados pend.: N · DNG pend.: M", con fecha origen en tooltip.
- **Alerta inline** (banner): info/warning/danger/success, con ícono, texto y acción opcional. Para "Versión en revisión", "Rol de zona no aprobado", "SLA vencido".
- **Card de resumen / KPI.** Cifra grande (`2xl`) + label + tendencia. Para cuota diaria, % tiendas con rol completo, cajas bloqueadas.
- **Item de lista de tarea** (bandeja de aprobaciones): tipo de flujo, módulo, objeto, solicitante, fecha ingreso, SLA restante (con color según urgencia), criticidad.

### 3.3 Organismos clave

#### a) Tabla de datos
- Encabezado fijo (sticky) al hacer scroll vertical; primera(s) columna(s) fijas al scroll horizontal (clave en calendario).
- Orden por columna, filtros por columna, selección múltiple (para aprobaciones en lote — VAC-APRO-15).
- Densidad `compacta` (calendario) y `cómoda` (listados).
- Estados: loading (skeleton de filas), vacío (mensaje + acción sugerida), error (banner + reintentar), con datos.
- Paginación o scroll virtual para listados largos (~100 tiendas). Exportación a Excel/PDF según perfil.
- Accesible: `<table>` semántica, `scope` en th, `caption` o `aria-label`, navegación por teclado celda a celda en el calendario (roving tabindex).

#### b) Grilla/Calendario de programación (Rol de Personal)
- **(H-01)** Eje filas = colaboradores; eje columnas = días anclados a **DOMINGO→SÁBADO** (primera columna DOM, última SÁB) con cabecera "DÍA – FECHA" y resalte de feriado 🎌. Esto reemplaza cualquier anclado a LUNES del prototipo.
- Columnas fijas a la izquierda: Tienda, Puesto, Personal (+ ratios para Seniors, + saldo de compensaciones).
- Celda = intersección día×colaborador; muestra el estado con color+abreviatura; clic abre selector; pulsación larga activa selección múltiple (mismo colaborador).
- Pie de columna: cuota aproximada por asesor (vista Gt/Ases del GT).
- Pie de grilla: cuadro de pendientes (compensaciones sin fecha).
- Indicador "Versión en revisión" como banner superior sin bloquear la vista vigente.
- Indicador de asistencia (solo semana en curso, informativo, no editable).
- Modo solo lectura para semanas pasadas y para roles fuera del ámbito/rol del usuario.

#### b.2) Calendario unificado de ausencias programadas — NUEVO (H-03)
- **Motor único** que consolida **Licencias + Descansos + Vacaciones** como "ausencias programadas". Disponible en **web** (calendario unificado) junto con las programaciones, además de los registros móviles existentes.
- Eje filas = colaboradores; columnas = días **domingo→sábado** (H-01). Cada ausencia se pinta con su token de tipo (DL, CF, CD, licencias con/sin goce, vacaciones, descanso médico) + sigla + texto.
- **Validación de no-cruce transversal (H-03/H-13):** una sola fuente de verdad valida que el empleado no tenga otra programación previa en las fechas elegidas (descanso, vacaciones, licencia). Al detectar cruce, **feedback de validación inline**: resalta el periodo en conflicto, muestra el tipo y fechas de la programación existente, y bloquea el guardado con mensaje accionable. El éxito muestra confirmación ("Sin cruces. Ausencia registrada.").
- Estados visibles de cada ausencia (no salta a "Programado"): **Pendiente de aprobación** / **En validación Bienestar** / Programado / En ejecución / Ejecutado-Culminado / Anulado (badges §3.4).
- Estados del organismo: loading (skeleton), vacío ("Sin ausencias programadas en el periodo"), con datos, error (banner + reintentar).
- Doble vista **Calendario / Tabla** (fortaleza conservada §5 reconciliación).

#### c) Bandeja de tareas (Aprobaciones) — (P-09) unificada web / por categoría móvil
- **(P-09) Definición de bandeja:**
  - **Web:** **bandeja unificada** — una sola lista con tareas pendientes de todos los módulos (Rol, LSGH/LCGH, descanso médico, vacaciones-anulación, **Ascenso Senior**), con filtros por tipo de flujo, módulo, antigüedad, criticidad. Split view (lista + detalle).
  - **Móvil:** **bandeja por categoría** — pestañas/secciones "Solicitudes · Roles · Licencias", con **Ascenso Senior** dentro de la categoría **Solicitudes** (afordancia de filtro equivalente a la web). Coherencia de contenido entre ambas: la categorización móvil es una presentación de la misma fuente, no datos distintos.
- **(H-02)** Aquí (no en Gestión de Equipos) vive la **acción de ascenso ▲** y el **panel obligatorio de cumplimiento de 6 meses + segregación**.
- **(H-08)** Muestra estados intermedios **Pendiente de aprobación** y **En validación Bienestar** en tareas de Descansos/Licencias; nunca salta directo a terminal.

#### d) Panel de detalle de solicitud (genérico)
- Resumen del objeto + historial del flujo (niveles, decisiones, comentarios, delegación, escalamiento) + acciones (Aprobar / Rechazar con comentario) condicionadas por rol y segregación de funciones.

#### e) Wizard / Modal de registro
- Pasos para licencias con documentos, emisión de código zonal, registro de descanso/compensación. Cierre con confirmación si hay cambios sin guardar.

### 3.4 Catálogo de badges de estado (transversal)

| Dominio | Estado | Token | Ícono |
|---|---|---|---|
| Rol | En Edición / Pendiente de Envío | neutral | ✎ |
| Rol | Enviado a GG | info | ➤ |
| Rol | Aprobado por GG | success | ✓ |
| Rol | Rechazado | danger | ✕ |
| Rol | Programado por GT | info | ✓ |
| Rol | Versión en revisión | warning | ⟳ |
| Marcación | Sin marcación | neutral | ○ |
| Marcación | Entrada registrada | info | → |
| Marcación | Jornada cerrada | success | ✓ |
| Marcación | Falta | danger | ! |
| Marcación | Descanso | info | DL |
| Marcación | Bloqueado por programación | warning | 🔒 |
| Marcación | Autorizado zonal (código) | success | 🔑 |
| Marcación | Salida tardía / Tardanza (H-17) | warning | ⏱ |
| Marcación | Marcación anticipada / fuera de horario (H-17) | warning | ↧ |
| Marcación | Ausencia justificada (H-18: tiene descanso/vac./licencia) | neutral | 🛈 |
| Marcación | Huella no reconocida (H-14/P-08) | danger | ✕ |
| Marcación | Lector biométrico offline (P-08) | danger | ⚠ |
| Descanso/Ausencia | Pendiente de aprobación (H-08) | info | … |
| Descanso/Ausencia | En validación Bienestar (H-08) | info | 🩺 |
| Descanso/Ausencia | Programado | info | ● |
| Descanso/Ausencia | Modificado | warning | ✎ |
| Descanso/Ausencia | En ejecución | success | ▶ |
| Descanso/Ausencia | Ejecutado / Culminado (P-04: verde, no amarillo) | success | ✓ |
| Descanso/Ausencia | Anulado | neutral | ✕ |
| Aprobación | En curso | info | … |
| Aprobación | Escalada | warning | ↑ |
| Aprobación | Aprobada | success | ✓ |
| Aprobación | Rechazada | danger | ✕ |
| Aprobación | Cancelada | neutral | ⊘ |
| Ascenso | Pendiente de Aprobación | warning | … |
| Ascenso | Pendiente (Vencida) | danger | ⏱ |
| Ascenso | Aprobada | success | ✓ |
| Ascenso | Rechazada | danger | ✕ |
| Ascenso | Cerrada por cambio externo | neutral | ⊘ |
| Personal | **Senior (indicador de solo lectura)** (H-02/H-04) | info | ⬣ |

> Todo badge combina **color + ícono + texto**. Nunca solo color (WCAG 1.4.1).
> El badge "Senior" es **indicador de estado del colaborador, no acción** (no clicable). La acción de ascenso es el botón **▲** y existe solo en Aprobaciones (ver §3.1 y transversales).

---

## 4. Patrones de interacción

- **Plazos y SLA visibles.** Tiempo restante con color escalonado: > 50% del SLA neutral, 25–50% warning, < 25% o vencido danger. Acompañado siempre del texto ("Vence hoy 11:59" / "Vencida hace 2h"). Recordatorios push y correo según Maestros.
- **Recorte por rol y ámbito (RBAC) — patrón transversal (H-05).** **Toda** vista (Gestión de Equipos móvil, Vacaciones, Aprobaciones, Reporte de Asistencia, Reportes, calendarios) **recorta datos y acciones según rol + ámbito** resuelto por Seguridad (`ENT-MOD-SEGU-001`): **GG** = todo · **GZ** = sus zonas · **GT** = su tienda. Lo no permitido **no se muestra** (no se deshabilita decorativamente). El recorte aplica también a filtros (valores por defecto y opciones disponibles) y a exportaciones (no exceder el ámbito).
- **Estados de aprobación/validación siempre visibles (H-08).** Las solicitudes muestran su estado intermedio real — **Pendiente de aprobación**, **En validación Bienestar** — y nunca saltan directo a "Programado"/"En ejecución". Ruteo visible por tipo: LSGH/LCGH → GG (SLA 2 días); Descanso médico/Lic. médica → Bienestar (SLA 2 días).
- **Comentario obligatorio en rechazo (H-10).** En **todo** rechazo (Rol, Ascenso, LSGH/LCGH, Licencias, anulaciones) el campo "Motivo del rechazo" es **obligatorio**: el botón "Confirmar Rechazo" permanece deshabilitado hasta que haya texto; el error es inline (`aria-describedby`), no en alert; al intentar confirmar vacío el foco va al campo.
- **Autorización AV/GG en anulación de vacaciones (H-09).** Anular un periodo de vacaciones activo exige **autorización de Administración de Ventas o Gerencia General**: la UI presenta el paso de autorización (no es una anulación directa) y registra quién autorizó en auditoría.
- **Segregación de funciones visible (H-06).** Cuando el usuario es el **solicitante** (o un GG titular ante auto-solicitud de GG en Ascenso), los botones Aprobar/Rechazar **no se muestran como activos** — el solicitante **no ve "Aprobar"**: se muestra el detalle en modo lectura con banner explicativo de quién debe resolver (R-GG-SUP cuando aplica). Ver `flujos-ux-transversales.md`.
- **Confirmación de acciones irreversibles.** Modal con resumen del impacto. Texto del botón nombra la acción concreta ("Aprobar ascenso", no "Aceptar").
- **Edición optimista con detección de concurrencia.** En el calendario, si otro usuario modificó la celda, se notifica el estado actualizado (bloqueo optimista, CU-ROLP-03 E1).
- **Autoguardado vs envío.** La programación se guarda incrementalmente; el "Enviar a aprobación" es una acción deliberada con validación previa (cuota, completitud).
- **Filtros con valores por defecto por perfil.** El usuario aterriza con filtros preseleccionados (año, semana, empresa, zona, tienda según ámbito).
- **Notificaciones.** Push (app móvil) + correo + alerta nativa Windows (inasistencias). Centro de notificaciones in-app con badge de no leídas. Los toasts usan `aria-live="polite"` (P-03) para anunciarse a lectores de pantalla.
- **Acceso con SSO (P-06, ADR-001).** La pantalla de login ofrece, además de usuario/contraseña, un botón **"Iniciar con SSO"** (proveedor corporativo). Ambos caminos llevan al mismo recorte por rol/ámbito (RBAC). El botón SSO tiene `aria-label` explícito y orden de foco lógico.
- **Atribución de marcación por huella (H-14).** En todo módulo de marcación, el registro se atribuye al **dueño de la huella leída**, no a la sesión del kiosko (GT) abierta. La UI siempre nombra al colaborador real de la marcación.
- **Estados vacíos accionables.** Todo estado vacío sugiere la siguiente acción ("No hay tareas pendientes" / "No hay personal para agregar en esta zona").

---

## 5. Responsividad (web gerencial + móvil colaborador)

| Patrón | xs (320) | sm (768) | md (1024) | lg (1440) |
|---|---|---|---|---|
| Calendario del Rol | No prioritario en móvil (solo consulta resumida por colaborador en cards apiladas) | Scroll horizontal con columnas fijas | Scroll horizontal, columnas fijas, pie de cuota | Semana completa visible sin scroll |
| Bandeja de Aprobaciones | Lista → detalle en pantalla completa (navegación) | Lista → detalle | Split view (lista + detalle) | Split view amplio |
| Emisión de código zonal (GZ) | Optimizado móvil (caso de uso real GZ en campo) | Idem | Disponible web | Disponible web |
| Marcación / dispositivo | Pantalla de dispositivo biométrico (no responsive web) | — | Gestión de inasistencia web | Idem |
| Firma / sustentos (colaborador) | App móvil prioritaria | App móvil | — | — |
| Ascenso (solicitud, ▲ en Aprobaciones — H-02) | App móvil: **promotor = Administración de Ventas** inicia desde Aprobaciones (no desde Gestión de Equipos) | App móvil | Inicio en web (Aprobaciones) | Idem |
| Ascenso (resolución GG) | App móvil posible | App móvil | Web (panel 6 meses + segregación cómodo) | Web |

- **Tap targets** ≥ 44×44px en móvil. **Texto base** 16px en inputs móviles (evita zoom automático iOS).
- Tablas densas en móvil colapsan a **cards** (lista de pares etiqueta–valor) cuando no son el caso de uso primario.
- El calendario completo es una experiencia de **escritorio**; el móvil ofrece consulta y acciones puntuales (emitir código, aprobar, firmar).

---

## 6. Lineamientos de accesibilidad (resumen — detalle en accesibilidad.md)

Objetivo: **WCAG 2.1 AA** en todas las pantallas.

- **Contraste:** texto normal ≥ 4.5:1, texto grande/iconografía/UI ≥ 3:1. Los tokens de §2 cumplen estos mínimos sobre sus fondos declarados.
- **No depender del color:** estados con color + ícono + texto (badges, ratios, celdas, feriados).
- **Teclado:** toda función operable por teclado; orden de foco lógico; foco visible (`focus.ring`); calendario navegable con flechas (roving tabindex) y Enter para abrir el selector de estado.
- **Lectores de pantalla:** roles ARIA correctos (`grid`/`gridcell` en calendario, `dialog` en modales con foco atrapado, `status`/`alert` para feedback, `tablist` para pestañas), labels en todos los controles, anuncios de cambios dinámicos (registro guardado, error).
- **Texto alternativo:** íconos informativos con `aria-label`; íconos decorativos `aria-hidden`.
- **Objetivos de toque:** ≥ 44px móvil.
- **Tamaño y reflujo:** zoom 200% sin pérdida de contenido; reflujo a 320px sin scroll en dos ejes (salvo el calendario, que documenta el scroll horizontal como excepción controlada con columnas fijas).
- **Formularios:** errores identificados por texto, asociados con `aria-describedby`, foco al primer error.

---

## 7. Tono de voz y microcopy (resumen — detalle en guias-interaccion.md)

- **Claro, directo, en español, formal-cercano.** Terminología funcional consistente: GZ, GG, GT, Senior, Cobertura de Tienda, Compensación, Descanso Laboral, etc.
- **Errores accionables:** explican qué pasó y qué hacer ("No se puede programar más allá de la semana siguiente a la actual").
- **Sin jerga técnica** en mensajes al usuario final.

---

## 8. Supuestos de diseño a validar con el PO

| ID | Supuesto |
|---|---|
| SUP-UX-01 | No hay identidad de marca definida; la paleta es propuesta neutra con theming dual Cadena/Lukers preparado. |
| SUP-UX-02 | Idioma único español (Perú). No se contempla i18n en Fase 1. |
| SUP-UX-03 | El navegador objetivo de tienda soporta CSS grid/sticky (a confirmar con TI por parque de equipos Windows). |
| SUP-UX-04 | La diferenciación visual Cadena/Lukers se hace por theme + etiqueta textual, no solo por color. |
| SUP-UX-05 | (H-01) La semana laboral domingo→sábado es el default global; el inicio de semana es parametrizable por empresa en Maestros. |
| SUP-UX-06 | (P-05) Los cortes de umbral de cobertura (verde/naranja/rojo) se administran en el maestro de parámetros por empresa. |
| SUP-UX-07 | (P-06) El proveedor de SSO corporativo y el flujo exacto (OIDC/SAML) se definen con TI según ADR-001. |
| SUP-UX-08 | (P-01) Todos los datos demo se unifican a **2026**; los periodos de vacaciones 2024-2025 sí son válidos como periodo de devengue. |
