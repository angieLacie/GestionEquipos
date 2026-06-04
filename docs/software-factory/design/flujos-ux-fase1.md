# Flujos UX y Wireframes — Fase 1 (Núcleo operativo)

| Campo | Valor |
|---|---|
| Documento | Flujos de experiencia y wireframes descritos — Fase 1 |
| Sistema | Nova — Gestión de Equipos (retail Cadena / Lukers) |
| Versión | 2.2 |
| Fecha | 31/05/2026 |
| Elaborado por | UX/UI Designer Senior |
| Estado | RECONCILIADO con prototipo (fuente de verdad visual) — pendiente de validación con PO |
| Documentos base | reconciliacion-ux.md v1.0 (fuente de verdad visual), ENT-MOD-ROLP-001 v1.1, ENT-MOD-MARC-001 v1.1, ENT-MOD-DESC-001 v1.2, design-system-nova.md v2.0 |
| Alcance | (a) Rol de Personal + ciclo GZ→GG→GT, (b) Marcación móvil + validación biométrica, (c) Gestión de ausencias programadas (Descansos + Licencias + Vacaciones, motor único) |

> Todos los wireframes se describen en texto estructurado (layout, secciones, componentes, comportamiento por estado y por rol). Usan los tokens, componentes y badges definidos en `design-system-nova.md` v2.0. Datos de ejemplo ficticios (unificados a **2026** — P-01). Cumplimiento WCAG 2.1 AA. Terminología funcional consistente (GZ, GG, GT, Senior).

---

## Changelog

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 30/05/2026 | Versión inicial de flujos y wireframes Fase 1. |
| 2.2 | 31/05/2026 | **(P-10 · C-06)** Confirmado por el PO: la **app móvil** (colaborador / GZ) también tiene login con **SSO** y **recuperación de contraseña por OTP**, coherente con la web. Se añade la sección **B.0 — Login móvil y recuperación**: **B.0.0** login full-screen (correo, contraseña con mostrar/ocultar, "¿Olvidaste tu contraseña?", "Iniciar sesión", "Iniciar con SSO"), y los 3 pasos de recuperación adaptados a móvil — **B.0.1** solicitar código, **B.0.2** ingresar 6 dígitos (teclado numérico, `autocomplete="one-time-code"`, email enmascarado, contador de caducidad, reenvío con contador, límite de intentos, anti-enumeración) y **B.0.3** establecer nueva contraseña (checklist de política en vivo). **No se duplica lógica:** B.0.x reutiliza el mismo backend, endpoints, reglas **RN-SEGU-32 a 39** y parámetros **`SEGU_OTP_*`/`SEGU_PWD_*`** de la web (A.0.x); solo cambia la presentación (full-screen, ergonomía táctil ≥ 44px, inputs 16px). Estados de error y accesibilidad móvil documentados. La sección A.0.x web se enlaza con las reglas RN-SEGU-32 a 39 (alineación con CU-SEGU-10 / ENT-MOD-SEGU-001 v1.1 y seguridad-api.yaml v1.1). |
| 2.1 | 31/05/2026 | **(P-10 · C-06)** Confirmado por el PO: login web con **SSO** y **recuperación de contraseña por OTP**. Se reescribe **A.0 — Login** como **split-screen enriquecido** (panel de marca con propuesta de valor + 3 features Rol de Personal / Control de Asistencia / Reportes Analíticos + stats dinámicos empleados/tiendas/zonas; formulario con correo, contraseña con mostrar/ocultar, "Mantener sesión iniciada", "¿Olvidaste tu contraseña?", "Ingresar al sistema" y "Iniciar con SSO"). **Naming unificado a "Gestión de Equipos / Nova"** (prohibido "Sistema Administrativo de Tiendas"). Se añade el **flujo de recuperación de contraseña por OTP en 3 pasos**: **A.0.1** solicitar código (anti-enumeración), **A.0.2** ingresar código de 6 dígitos (email enmascarado, contador de caducidad, reenvío con contador, límite de intentos, pegar/auto-avance), **A.0.3** establecer nueva contraseña (política RN-SEGU-10 con validación en vivo + confirmación). Estados de error y accesibilidad (labels, `aria-live`, foco entre dígitos) documentados; mensajes nuevos en la tabla de errores. Coherencia con login móvil del colaborador. Alineado con ENT-MOD-SEGU-001 (RN-SEGU-10/11/12/13/15, VAC-SEGU-03) y ADR-001. |
| 2.0 | 31/05/2026 | Reconciliación con prototipo. **(H-01)** Todos los calendarios/grillas anclados a **DOMINGO→SÁBADO** (encabezados, ejemplos y leyendas actualizados). **(H-03)** El módulo (c) pasa a **motor único de ausencias programadas** (Descansos + Licencias + Vacaciones) con **calendario unificado en web** y **validación de no-cruce transversal**; Licencias ahora también en web. **(H-05)** Recorte por rol/ámbito (RBAC) reforzado en cada pantalla. **(H-08)** Estados intermedios **Pendiente de aprobación** / **En validación Bienestar** visibles en Descansos/Licencias. **(H-10)** Comentario obligatorio en todo rechazo. **(H-14)** Atribución de marcación por huella. **(H-17)** Tardanza/marcación anticipada señaladas. **(H-18)** Exclusión de ausencias justificadas en alertas. **(H-15/H-16)** Código zonal con fuente única + auditoría de anulación. **(H-19)** Motivo + auditoría en acciones manuales de inasistencia. **(H-20)** Adjuntar certificado en licencia médica. **(P-01)** Datos demo a 2026. **(P-02)** Leyendas de tipos de día. **(P-04)** Color semántico de estados (Culminado en verde). **(P-05)** Umbrales de cobertura parametrizables. **(P-06)** Login con SSO. **(P-07)** Mejoras del Reporte de Asistencia (horario programado, exportar, filtros). **(P-08)** Estados de error del biométrico. Conserva fortalezas §5 de la reconciliación. |

---

## Convención de lectura de los wireframes

Cada pantalla se documenta con: **Ruta / rol / objetivo → Layout → Componentes (header, cuerpo, acciones) → Estados → Accesibilidad → Responsive → Mensajes y errores**. Las regiones se describen como un boceto ASCII de zonas, no como diseño final de píxeles.

---

# (a) ROL DE PERSONAL — programación y ciclo de aprobación GZ→GG→GT

## Mapa de experiencia del ciclo

```
GZ programa rol de zona ──► GZ "Enviar a Aprobación" ──► GG revisa y Aprueba/Rechaza
        │ (Sastres: sugerencia)         │ (jueves 23:59)            │ (sábado 10:00)
        │                                │ rechazo → REINICIO         │
        ▼                                ▼ (vuelve a GZ)             ▼ Aprobado
   Cuadro de pendientes            Bloqueo POS si vence        GT habilitado → programa
   + cuota por asesor                                          asesores (sábado) → Enviar
```

Consecuencias por incumplimiento de plazo (bloqueo/desbloqueo de cajas vía POS) y alertas de vencimiento se modelan como SLA del motor de Aprobaciones; la UI las refleja con banners y badges (ver §A.7 y `flujos-ux-transversales.md`).

---

## A.0 — Pantalla: Login (con SSO) — ENRIQUECIDO (P-06, P-10 · C-06)

```
Ruta: /login      Roles: todos (web gerencial)
Relacionado: ADR-001 (SSO) | C-06, P-06, P-10 | ENT-MOD-SEGU-001
            RN-SEGU-10 (política de contraseña), RN-SEGU-12 (bloqueo por intentos),
            RN-SEGU-13 (SSO local/IdP), RN-SEGU-15 (sesión), VAC-SEGU-03 (auto-restablecimiento)
Objetivo del usuario: autenticar y resolver su rol/ámbito (RBAC), o iniciar la recuperación de contraseña.
```

> **(P-10) Naming unificado.** El producto se nombra **"Gestión de Equipos"** (marca **Nova**) en todo el login. Queda **prohibido** el nombre legado **"Sistema Administrativo de Tiendas"** en cualquier título, logo, copy o pie. Empresa visible por etiqueta textual (Cadena / Lukers) además del theme de marca (no solo color — WCAG 1.4.1, SUP-UX-04).

**Layout — split-screen (desktop md/lg):** dos paneles a 50/50 sobre `color.bg.canvas`.

```
┌───────────────────────────────────┬───────────────────────────────────┐
│  PANEL DE MARCA (izquierda)        │  PANEL DE FORMULARIO (derecha)     │
│  fondo color.brand.primary         │  fondo color.bg.surface            │
│  ───────────────────────────────  │  ───────────────────────────────  │
│  [Logo Nova]                       │  Gestión de Equipos · Nova         │
│  Gestión de Equipos                │  "Inicia sesión para continuar"    │
│  Nova — Cadena / Lukers            │                                    │
│                                    │  Correo electrónico                │
│  Propuesta de valor:               │  [ angelica@empresa.com        ]   │
│  "Planifica el rol de personal,    │                                    │
│   controla la asistencia y         │  Contraseña                        │
│   decide con reportes en tiempo    │  [ ••••••••••••           👁 ]      │
│   real."                           │                                    │
│                                    │  [✓] Mantener sesión iniciada      │
│  Features (3 tarjetas/íconos):     │            ¿Olvidaste tu contraseña?│
│   ▦ Rol de Personal                │                                    │
│   ⏱ Control de Asistencia          │  [   Ingresar al sistema   ]       │
│   📊 Reportes Analíticos           │  ──────────  o  ──────────         │
│                                    │  [  Iniciar con SSO  ]             │
│  Stats dinámicos (vivos):          │                                    │
│   1,248 empleados · 96 tiendas     │  (zona de alerta inline de error)  │
│   · 12 zonas                       │                                    │
└───────────────────────────────────┴───────────────────────────────────┘
```

**Componentes — Panel de marca (izquierda):**
- **Logo + nombre del producto:** "Gestión de Equipos" con la marca **Nova** y etiqueta textual de empresa activa (Cadena / Lukers). Fondo `color.brand.primary`, texto `color.brand.onPrimary`.
- **Propuesta de valor:** titular corto + subtítulo (máx. 2 líneas). Copy ficticio de ejemplo: *"Planifica el rol de personal, controla la asistencia y decide con reportes en tiempo real."*
- **Features (3 ítems con ícono + título + descripción breve):**
  - **▦ Rol de Personal** — *"Programa la semana domingo→sábado y aprueba en un flujo claro."*
  - **⏱ Control de Asistencia** — *"Marcación biométrica con alertas de tardanza y ausencias."*
  - **📊 Reportes Analíticos** — *"Cobertura, indemnizables y desempeño por zona y tienda."*
- **Stats dinámicos (3 cifras vivas):** **empleados · tiendas · zonas** (cifra `2xl` mono + label). Se cargan del backend (totales del ámbito público/agregado, **no datos personales** — privacidad por defecto, principio 4). Datos demo ficticios 2026: *1,248 empleados · 96 tiendas · 12 zonas*.
  - Estado de carga de stats: skeleton de 3 cifras. Si falla, se ocultan (degradación elegante) sin romper el login.

> **(Privacidad)** El panel de stats muestra solo **agregados** (conteos), nunca nombres, fotos ni datos identificables. Es la única información que el flujo de login necesita.

**Componentes — Panel de formulario (derecha):**
- Encabezado: "Gestión de Equipos · Nova" + subtítulo "Inicia sesión para continuar".
- **Campo Correo electrónico** (`type="email"`, label visible arriba, no placeholder-as-label, `autocomplete="username"`, teclado de email en móvil).
- **Campo Contraseña** (`type="password"`, label visible, `autocomplete="current-password"`) con **botón mostrar/ocultar** (ícono 👁 / 👁‍🗨) — `aria-label="Mostrar contraseña" / "Ocultar contraseña"`, `aria-pressed`, no envía el formulario, foco mantenido en el campo.
- **Checkbox "Mantener sesión iniciada"** (`color.brand.primary`, área de toque ≥ 24px, etiqueta clicable). Tooltip/nota de seguridad: *"No la actives en equipos compartidos."* La política exacta (duración de la sesión persistente) se rige por RN-SEGU-15 y queda **a confirmar con seguridad** (ver SUP-UX-09).
- **Enlace "¿Olvidaste tu contraseña?"** (alineado a la derecha del bloque) → navega a **A.0.1** (flujo de recuperación por OTP).
- **Botón primario "Ingresar al sistema"** (ancho completo). Deshabilitado hasta que correo y contraseña tengan contenido válido en forma.
- **Separador "o"** (divisor con texto centrado).
- **Botón secundario "Iniciar con SSO"** (ancho completo, ADR-001 / RN-SEGU-13) con `aria-label="Iniciar sesión con el proveedor corporativo (SSO)"`. Si SSO no está configurado para el entorno, el botón no se muestra (no se deshabilita decorativamente — principio 5).

**Estados de la pantalla:**
- **Carga inicial:** skeleton del panel de stats; formulario interactivo de inmediato.
- **Con datos (default):** formulario listo, foco inicial en Correo.
- **Loading (al ingresar):** botón "Ingresar al sistema" con spinner + texto, deshabilitado; campos en readonly mientras valida.
- **Error de credenciales (RN-SEGU-12 E1):** alerta inline `danger` bajo el formulario: *"Correo o contraseña incorrectos."* (mensaje genérico, **no** revela si el correo existe — anti-enumeración / RN-SEGU-22 E2). Foco al primer campo.
- **Usuario bloqueado por intentos (RN-SEGU-12):** alerta `danger`: *"Tu cuenta está bloqueada temporalmente por varios intentos fallidos. Intenta de nuevo más tarde o contacta a tu administrador."*
- **Cambio de contraseña obligatorio (RN-SEGU-11):** tras autenticar, se fuerza el flujo de "Establecer nueva contraseña" (reutiliza **A.0.3**) antes de entrar.
- **Error de SSO:** alerta `danger`: *"No fue posible iniciar con SSO. Intenta con correo y contraseña o reintenta."*
- **Éxito:** redirección al inicio según rol/ámbito; toda la app se recorta por **RBAC** (H-05) — el usuario solo ve módulos, datos y acciones de su ámbito (GG = todo; GZ = sus zonas; GT = su tienda).

**Accesibilidad (WCAG 2.1 AA):**
- Orden de foco lógico: Correo → Contraseña → (mostrar/ocultar) → Mantener sesión → ¿Olvidaste? → Ingresar → SSO.
- Cada campo con `<label>` asociado; errores con `aria-describedby` y `role="alert"` en la alerta inline; foco al primer error.
- Botón mostrar/ocultar con `aria-pressed` y `aria-label` que cambia según estado.
- El panel de marca es decorativo respecto al login: ícono de features `aria-hidden`, contenido textual sí leíble; las stats con `aria-label` ("1,248 empleados").
- Contraste: texto sobre `color.brand.primary` usa `color.brand.onPrimary` (≥ 4.5:1); botones cumplen ≥ 3:1 de UI.

**Responsive:**
- **lg/md (≥1024):** split-screen 50/50.
- **sm (768):** el panel de marca se reduce (logo + propuesta de valor + stats en una franja superior); el formulario debajo, ancho cómodo centrado.
- **xs (320–767):** **el panel de marca colapsa** a una cabecera compacta (logo + nombre + stats en línea), el formulario ocupa el ancho. Inputs a 16px (evita zoom iOS), tap targets ≥ 44px. El botón mostrar/ocultar y los botones a ancho completo.

**Coherencia con el login móvil del colaborador:** el login móvil (app del colaborador / GZ) se documenta en **B.0 (B.0.0–B.0.3)** y usa los **mismos tokens, los mismos campos (correo + contraseña con mostrar/ocultar), el mismo botón SSO y el mismo enlace de recuperación**; cambia el layout (sin split-screen: logo arriba, formulario apilado, marca compacta). El flujo de recuperación por OTP es **idéntico en web (A.0.1–A.0.3) y móvil (B.0.1–B.0.3)**: misma fuente de verdad, **mismo backend y endpoints** (`/auth/password-recovery/*`), mismas reglas **RN-SEGU-32 a 39**, mismos parámetros `SEGU_OTP_*`/`SEGU_PWD_*` y mismo microcopy.

---

## A.0.1 — Pantalla: Recuperar contraseña (paso 1 de 3 — solicitar código) — NUEVO (P-10 · C-06)

```
Ruta: /recuperar-contrasena            Roles: todos (no autenticado)
Relacionado: VAC-SEGU-03 (auto-restablecimiento por código temporal) | C-06
Objetivo del usuario: solicitar un código OTP de verificación a su correo.
Paso: 1 de 3 (Correo → Código → Nueva contraseña)
```

**Layout:** mismo split-screen que A.0 (panel de marca a la izquierda intacto); a la derecha, una tarjeta de recuperación que **reemplaza** el formulario de login. En móvil, marca compacta + tarjeta.

```
┌───────────────────────────────────┐
│  ← Volver al inicio de sesión      │
│  Recuperar contraseña   (Paso 1/3) │
│  "Ingresa tu correo y te           │
│   enviaremos un código de          │
│   verificación de 6 dígitos."      │
│                                    │
│  Correo electrónico                │
│  [ angelica@empresa.com        ]   │
│                                    │
│  [   Enviar código de verificación]│
│  (zona de alerta inline)           │
└───────────────────────────────────┘
```

**Componentes:**
- **Enlace/botón "← Volver al inicio de sesión"** (tertiary), arriba a la izquierda → A.0.
- Indicador de paso **"Paso 1 de 3"** (stepper textual + visual, `aria-label="Paso 1 de 3: ingresar correo"`).
- **Campo Correo electrónico** (`type="email"`, `autocomplete="email"`, label visible).
- **Botón primario "Enviar código de verificación"** (ancho completo). Loading con spinner mientras procesa.

**Estados de la pantalla:**
- **Default:** foco en el campo Correo.
- **Validación inline de formato (en vivo):** correo mal formado → error bajo el campo *"Ingresa un correo válido (ejemplo: nombre@empresa.com)."*; el botón permanece deshabilitado hasta que el formato sea válido.
- **Loading:** botón con spinner, deshabilitado.
- **Éxito (anti-enumeración — VAC-SEGU-03 / RN-SEGU-22):** **siempre** muestra el mismo mensaje, exista o no el correo: alerta `info` *"Si el correo existe, te enviamos un código de verificación. Revisa tu bandeja de entrada y spam."* → navega automáticamente a **A.0.2**. **Nunca** se confirma ni se niega la existencia del correo.
- **Error de servicio (no de negocio):** alerta `danger` *"No pudimos procesar tu solicitud. Intenta de nuevo en unos minutos."* + botón Reintentar. (Este error es solo para fallos técnicos, no para "correo no existe".)

**Accesibilidad:** label asociado; error con `aria-describedby`; mensaje de éxito en `aria-live="polite"`; foco al campo al cargar; "Volver" alcanzable por teclado primero en el orden de foco tras el contenido.

**Responsive:** idéntico patrón A.0 (split en desktop, apilado en móvil; input 16px; tap targets ≥ 44px).

---

## A.0.2 — Pantalla: Ingresa el código (paso 2 de 3 — verificar OTP) — NUEVO (P-10 · C-06)

```
Ruta: /recuperar-contrasena/codigo     Roles: todos (no autenticado)
Relacionado: VAC-SEGU-03 | RN-SEGU-12 (límite de intentos) | C-06
Objetivo del usuario: ingresar el código OTP de 6 dígitos enviado al correo.
Paso: 2 de 3
```

**Layout:** misma tarjeta a la derecha del split-screen / apilada en móvil.

```
┌───────────────────────────────────┐
│  ← Volver                          │
│  Ingresa el código     (Paso 2/3)  │
│  "Enviamos un código de 6 dígitos  │
│   a  a***@empresa.com"             │   ← email ENMASCARADO
│                                    │
│   [ ] [ ] [ ] [ ] [ ] [ ]          │   ← 6 casillas de un dígito
│                                    │
│  El código vence en 09:48          │   ← contador de caducidad
│  ¿No llegó?  Reenviar (00:42)      │   ← reenvío con contador
│                                    │
│  [   Verificar código   ]          │
│  (zona de alerta inline)           │
└───────────────────────────────────┘
```

**Componentes:**
- **Enlace "← Volver"** → A.0.1.
- Indicador **"Paso 2 de 3"**.
- **Correo enmascarado:** muestra el destino con máscara, p. ej. **`a***@empresa.com`** (primer carácter + `***` + dominio). Texto: *"Enviamos un código de 6 dígitos a a***@empresa.com"*. Nunca el correo completo (privacidad / anti-shoulder-surfing).
- **Entrada OTP de 6 casillas** (6 inputs de un dígito, `inputmode="numeric"`, `pattern="[0-9]*"`, `maxlength="1"` cada una, `autocomplete="one-time-code"` en la primera):
  - **Auto-avance:** al escribir un dígito, el foco salta a la siguiente casilla.
  - **Borrar (Backspace):** si la casilla está vacía, retrocede a la anterior y la limpia.
  - **Pegar código:** pegar "123456" en cualquier casilla distribuye un dígito por casilla y enfoca la última (soporta pegado desde correo/SMS).
  - **Solo numérico:** ignora caracteres no numéricos.
- **Contador de caducidad:** *"El código vence en MM:SS"* (cuenta regresiva; al llegar a 0 → estado expirado). Caducidad parametrizable (default sugerido 10 min — a confirmar con seguridad, SUP-UX-10).
- **Reenviar código con contador:** enlace *"Reenviar"* deshabilitado con cuenta regresiva *"(00:42)"*; al llegar a 0 se habilita. Al reenviar: nuevo código, reinicia caducidad y contador de reenvío, anuncia *"Te enviamos un nuevo código."*
- **Botón primario "Verificar código"** (ancho completo). Deshabilitado hasta completar las 6 casillas. Loading con spinner.

**Estados de la pantalla:**
- **Default:** foco en la primera casilla.
- **Incompleto:** botón "Verificar código" deshabilitado.
- **Loading:** spinner en el botón.
- **Código incorrecto:** alerta `danger` *"El código no es correcto. Verifícalo e inténtalo de nuevo."*; las casillas se marcan en `color.danger` (borde), se limpian y el foco vuelve a la primera. Muestra intentos restantes si aplica: *"Te quedan N intentos."*
- **Código expirado:** cuando el contador llega a 0 → alerta `warning` *"El código venció. Solicita uno nuevo."* + botón "Reenviar" habilitado; casillas deshabilitadas hasta reenviar.
- **Demasiados intentos (RN-SEGU-12):** alerta `danger` *"Demasiados intentos. Por seguridad, vuelve a empezar la recuperación."* → bloquea las casillas y ofrece botón "Volver al inicio" (reinicia el flujo a A.0.1). El backend puede aplicar bloqueo temporal de la cuenta (anti-enumeración: el mensaje no confirma existencia del correo).
- **Éxito:** verificación correcta → navega a **A.0.3** (con token de verificación de un solo uso, no expuesto en UI).

**Accesibilidad:**
- Las 6 casillas forman un grupo con `role="group"` y `aria-label="Código de verificación de 6 dígitos"`; cada casilla con `aria-label="Dígito N de 6"`.
- Errores y cambios de estado (incorrecto, expirado, reenviado) en `aria-live="assertive"` para incorrecto/expirado y `polite` para reenviado.
- El contador de caducidad y de reenvío se anuncian de forma no intrusiva (`aria-live="off"` con actualización puntual al cruzar umbrales, para no saturar al lector); el texto siempre es legible.
- Pegar y auto-avance no rompen la navegación por teclado (Tab entra/sale del grupo como una unidad lógica; flechas mueven entre casillas).
- Soporte `autocomplete="one-time-code"` para autorrelleno desde el sistema operativo (iOS/Android) en móvil.

**Responsive:** las 6 casillas se mantienen en una fila; en xs reducen su ancho pero conservan tap target ≥ 44px de alto. Teclado numérico en móvil (`inputmode="numeric"`).

---

## A.0.3 — Pantalla: Establecer nueva contraseña (paso 3 de 3) — NUEVO (P-10 · C-06)

```
Ruta: /recuperar-contrasena/nueva       Roles: todos (con token de verificación de A.0.2)
Relacionado: RN-SEGU-10 (política de contraseña), RN-SEGU-11 (cambio obligatorio) | C-06
Objetivo del usuario: definir una nueva contraseña que cumpla la política de seguridad.
Paso: 3 de 3
```

> Esta pantalla se **reutiliza** también para el "cambio de contraseña obligatorio" del login (RN-SEGU-11, primer ingreso o expiración).

**Layout:** misma tarjeta del split-screen / apilada en móvil.

```
┌───────────────────────────────────┐
│  Establecer nueva contraseña (3/3) │
│  "Crea una contraseña segura para  │
│   tu cuenta."                      │
│                                    │
│  Nueva contraseña                  │
│  [ ••••••••••••           👁 ]      │
│  Requisitos (validación en vivo):  │
│   ✓ Mínimo 8 caracteres            │
│   ✓ Una mayúscula y una minúscula  │
│   ○ Un número                      │
│   ○ Un carácter especial           │
│                                    │
│  Confirmar contraseña              │
│  [ ••••••••••••           👁 ]      │
│  (✓ Las contraseñas coinciden)     │
│                                    │
│  [   Guardar nueva contraseña   ]  │
│  (zona de alerta inline)           │
└───────────────────────────────────┘
```

**Componentes:**
- Indicador **"Paso 3 de 3"**.
- **Campo "Nueva contraseña"** (`type="password"`, `autocomplete="new-password"`) con **botón mostrar/ocultar** (mismo átomo que A.0).
- **Checklist de política de seguridad (validación en vivo, RN-SEGU-10):** lista de requisitos que cambian de ○ a ✓ a medida que se cumplen, con color + ícono + texto (no solo color):
  - **Longitud mínima** (default 8 caracteres — parametrizable en Maestros, RN-SEGU-10).
  - **Complejidad:** mayúscula + minúscula, número, carácter especial (según política parametrizable).
  - *(La política exacta es parametrizable; la UI renderiza la lista de requisitos que el backend declare — no hardcodea reglas.)*
- **Campo "Confirmar contraseña"** (`type="password"`, mostrar/ocultar independiente) con validación en vivo de coincidencia: *"✓ Las contraseñas coinciden"* / *"Las contraseñas no coinciden."*
- **Botón primario "Guardar nueva contraseña"** (ancho completo). Deshabilitado hasta que **todos** los requisitos de política se cumplan **y** ambas contraseñas coincidan.

**Estados de la pantalla:**
- **Default:** foco en "Nueva contraseña"; checklist con todos los ítems en ○.
- **Validación en vivo:** cada requisito pasa a ✓ (`color.success`) al cumplirse; los pendientes permanecen neutrales (no en rojo hasta intentar enviar, para no castigar mientras se escribe).
- **No coinciden:** error inline bajo "Confirmar contraseña" *"Las contraseñas no coinciden."*; botón deshabilitado.
- **Política no cumplida (al intentar enviar):** el o los requisitos faltantes se resaltan en `color.danger`; foco al primer requisito faltante; mensaje *"Tu contraseña aún no cumple los requisitos de seguridad."*
- **Reutilización del historial (RN-SEGU-10):** si el backend rechaza por reutilizar una contraseña reciente → alerta `danger` *"No puedes reutilizar una contraseña usada recientemente. Elige una distinta."*
- **Token expirado/ inválido (sesión de recuperación caducada):** alerta `danger` *"Tu sesión de recuperación expiró. Vuelve a solicitar un código."* + botón "Volver a empezar" → A.0.1.
- **Loading:** spinner en el botón.
- **Éxito (confirmación):** pantalla/estado de éxito: ícono ✓ `color.success`, título *"Contraseña actualizada"*, texto *"Ya puedes iniciar sesión con tu nueva contraseña."* + botón primario **"Ir al inicio de sesión"** → A.0. (No inicia sesión automáticamente: el usuario reautentica, por seguridad.)

**Accesibilidad:**
- Campos con label asociado; checklist de requisitos vinculado al campo con `aria-describedby`; cada ítem usa ícono + texto (no solo color).
- Cambios de estado de los requisitos anunciados con `aria-live="polite"` de forma agrupada (evita verbosidad por tecla).
- Botones mostrar/ocultar con `aria-pressed` y `aria-label`.
- Mensaje de éxito en `role="status"`; foco al botón "Ir al inicio de sesión".
- Foco al primer requisito incumplido al intentar enviar inválido.

**Responsive:** apilado en móvil; inputs 16px; checklist de requisitos en una columna; botones a ancho completo; tap targets ≥ 44px.

---

### A.0.x — Resumen del flujo de recuperación de contraseña por OTP

```
[A.0 Login]
  │  clic "¿Olvidaste tu contraseña?"
  ▼
[A.0.1 Recuperar contraseña]  ── ingresa correo ──► "Enviar código"
  │  (anti-enumeración: "si el correo existe, te enviamos un código")
  ▼
[A.0.2 Ingresa el código]  ── 6 dígitos, email enmascarado ──► "Verificar código"
  │   ↺ Reenviar (con contador)     ⏱ caducidad     🔒 límite de intentos
  ▼
[A.0.3 Establecer nueva contraseña]  ── política en vivo + confirmar ──► "Guardar"
  │
  ▼
[Éxito]  ──► "Ir al inicio de sesión"  ──►  [A.0 Login]
```

Cada paso permite **Volver** al anterior; los mensajes de error (correo inválido, código incorrecto/expirado, demasiados intentos, política no cumplida) se describen en cada pantalla y se consolidan en la tabla de mensajes de error de Fase 1. El flujo implementa **CU-SEGU-10** y las reglas **RN-SEGU-32 a 39** (anti-enumeración, OTP de 6 dígitos, caducidad `SEGU_OTP_TTL_MIN`, intentos `SEGU_OTP_MAX_INTENTOS` + enfriamiento, reenvío `SEGU_OTP_REENVIO_ESPERA_SEG`/`SEGU_OTP_MAX_REENVIOS`, invalidación tras uso, política `SEGU_PWD_*`, cierre de sesiones y auditoría). La **variante móvil** del mismo flujo (mismo backend) está en **B.0.1–B.0.3**.

---

## A.1 — Pantalla: Acceso y filtros de programación

```
Ruta: /rol-personal      Roles: GZ, GT, GG, Administración de Ventas
Relacionado: CU-01, CU-02 | RN-01..08, RN-61, RN-62
Objetivo del usuario: ubicar la semana/tienda/puesto a programar o consultar.
```

**Layout (desktop md/lg):** barra superior de marca (theme por empresa + etiqueta textual Cadena/Lukers) · barra de filtros horizontal sticky · cuerpo con el calendario (A.2) · pie con cuadro de pendientes (A.5).

> **(H-05) Recorte por rol/ámbito:** las opciones disponibles en cada filtro y los valores por defecto se recortan por el ámbito del usuario (GG = todo; GZ = sus zonas; GT = su tienda, fija). Lo fuera de ámbito no aparece.

**Componentes — barra de filtros:**
- Selects: **Año**, **Semana** (formato **"Semana N · dom DD–sáb DD"** — H-01, ancla domingo), **Empresa**, **Zona** (opcional), **Tienda** (opcional), **Puesto**.
- Valores por defecto por perfil:
  - 1 sola tienda asignada → Año/Semana/Empresa/Zona/Tienda preseleccionados; Año y Semana editables dentro del rango.
  - Múltiples tiendas → Zona y Tienda en "Seleccione"; Puesto preseleccionado en "Seniors".
- **GT:** el selector de Tienda está fijo en su tienda (readonly) y el selector de Puesto **no muestra "Seniors"** (RN-03). No hay acceso a historial de modificaciones.
- **GZ sin tienda:** vista consolidada de todas sus tiendas/zonas. **GG/AV sin tienda:** consolidado según zona o todas.
- Botón secundario "Historial de modificaciones" (visible solo GZ de su zona, GG, AV — no GT).
- Botones de exportación (Excel / PDF) según perfil.

**Estados de pantalla:**
- Carga inicial: skeleton de barra de filtros + skeleton de grilla.
- Sin tiendas asignadas (E1): estado vacío central "No tiene tiendas asignadas. Contacte a su administrador." sin grilla.
- Semana > semana siguiente (A1): el select impide la selección y muestra alerta inline *"No se puede programar más allá de la semana siguiente a la actual."*
- Filtro Puesto = "Sastres": reemplaza el cuerpo por la vista especial de Sastres (A.6).

**Accesibilidad:** cada select con `<label>` visible; barra de filtros como `role="search"`/región con `aria-label="Filtros de programación"`; cambios de filtro anuncian "Cargando calendario…" en `aria-live="polite"`.

**Responsive:** en móvil los filtros colapsan en un botón "Filtros" que abre un drawer; el calendario no es prioritario en móvil (ver A.2 responsive).

---

## A.2 — Pantalla/Organismo: Calendario semanal de programación

```
Ruta: /rol-personal (cuerpo)     Roles: GZ, GT (su tienda), GG/AV (lectura/consolidado)
Relacionado: CU-02, CU-03, CU-04, CU-05 | RN-09..30, RN-64..68
Objetivo: ver y programar los estados diarios por colaborador.
```

**Layout (grilla — organismo "Calendario de programación" del design system):**

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [Banner contextual: "Versión en revisión" / "Solo lectura: semana pasada"] │
├──────────┬──────┬──────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬──────┤
│ Tienda   │Puesto│ Personal │ DOM │ LUN │ MAR │ MIÉ │ JUE │ VIE │ SÁB │Ratios│
│ (fija)   │(fija)│ (fija)   │28-JUN│29 │ 30  │ 01  │ 02  │ 03  │ 04🎌│      │
├──────────┼──────┼──────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼──────┤
│ T-Lima01 │Senior│ A. Pérez │ DL  │     │ CT  │     │     │     │     │ 98.4%│
│          │      │  [✓ asis]│     │     │     │     │     │     │     │ 101% │
├──────────┴──────┴──────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴──────┤
│ Cuota aprox. por asesor →   S/2.1k S/2.0k S/2.4k ...     (solo GT, Gt/Ases) │
├───────────────────────────────────────────────────────────────────────────┤
│ Leyenda (P-02): DL Descanso Laboral · CT Cobertura Tienda · CF Comp.Feriado │
│  · CD Comp.Desc.NoGozado · APO Apoyo · CV Cob.TipoVenta(Lukers) · 🎌 Feriado│
└───────────────────────────────────────────────────────────────────────────┘
   ▼ Cuadro de pendientes (A.5)
```

> **(H-01)** El eje de columnas se ancla a **DOMINGO→SÁBADO** (primera columna DOM, ejemplo 2026). El feriado se marca con **🎌** + tooltip con el nombre (la ★ ya no se usa para feriado ni como acción — ver design system §2.4/§3.1).
> **(P-02)** La **leyenda de tipos de día** es visible al pie del calendario.

**Columnas fijas izquierda (sticky):** Tienda, Puesto, Personal. En vista Seniors se añaden columnas de **ratios** (Cadena: RN-09; Lukers: RN-10, incluye % Asesoría / % Tesoro) y el **contador de saldo de compensaciones** (chip doble: "Feriados pend. · DNG pend.").
- Ratios: 1 decimal, **≥100% azul / <100% rojo** + valor numérico siempre (no solo color).
- Indicador "Nuevo ingreso" junto al nombre si el colaborador tiene < 7 días de alta en RMS.

**Encabezado de días:** "DÍA – FECHA" anclado a **domingo→sábado** (DOMINGO 28-JUN, ejemplo 2026 — H-01). Feriados resaltados con `color.warning.bg` + ícono 🎌 + tooltip con el nombre del feriado (dato del maestro de feriados). En **semana en curso**, cada celda muestra un microindicador informativo de asistencia (✓ marcó / ○ no marcó / 🛈 ausencia justificada cuando hay programación — H-18), no editable.

**Celda (gridcell):**
- Libre: fondo `color.bg.subtle`, cursor pointer, clic abre el **selector de estado** (popover) con los estados disponibles según puesto y empresa.
- Con estado: color del token de celda (`cal.descanso`, `cal.cobertura`, `cal.compFeriado`, `cal.compDNG`, `cal.tipoVenta`, `cal.apoyo`) + abreviatura (DL/CT/CF/CD/CV/APO) + texto accesible. Clic abre menú contextual con "Eliminar". Las siglas se explican en la **leyenda** (P-02).
- No editable (día pasado): `color.bg.inset`, ícono 🔒, tooltip *"No se puede modificar días pasados."*
- Sugerencia del sistema (Sastres/automática): `cal.sugerencia` + borde punteado + ícono ✦.

**Selector de estado (popover/molécula):**
1. Lista de estados disponibles (cada uno con su color/abreviatura).
2. Al elegir un estado que requiere parámetro: aparece campo extra — Compensación → feriado/semana laborada a compensar; Cobertura de Tienda → tienda destino; Cobertura por Tipo de Venta (solo Lukers) → tipo de venta.
3. Botón "Aplicar" (deshabilitado hasta que los parámetros obligatorios estén completos).
- Permisos: por defecto solo el GZ registra **Cobertura de Tienda**; si el actor no tiene el permiso, esa opción no aparece (y si se fuerza, error de permiso). Al registrar Cobertura de Tienda se crea automáticamente el registro en Encargatura (feedback toast: "Cobertura registrada. Se generó la encargatura asociada.").

**Programación múltiple (bloque):** pulsación larga sobre una celda activa modo selección múltiple **restringido al mismo colaborador**; celdas elegibles se resaltan con borde de selección; botón flotante "Aplicar estado a N celdas". Tras aplicar, toast con resumen: *"Estado aplicado en X celdas. Y omitidas: [motivo]."*

**Estados de la grilla:**
- Carga: skeleton de filas.
- Vacío (sin empleados activos para el filtro): mensaje "No hay personal activo para los filtros seleccionados." + sugerencia de cambiar filtros.
- Con datos: normal.
- Error RMS (E1): banner danger "No se pudo cargar la información del personal (RMS no responde). Reintentar." + botón Reintentar. No se muestra grilla parcial.
- Semana pasada (A3): toda la grilla en solo lectura + banner info "Solo lectura: semana cerrada." Para semanas cerradas se ofrece la vista comparación programado vs asistencia (exportable).
- Vista Seniors (A2): lista de seniors programados la semana anterior como punto de partida + botón "Agregar" (A.4).
- Versión en revisión (RN-66): banner warning "Versión en revisión. La programación vigente sigue activa." La grilla muestra los cambios en edición; los días pasados quedan bloqueados.

**Accesibilidad:**
- La grilla usa `role="grid"`, filas `role="row"`, celdas `role="gridcell"`. Navegación con flechas (roving tabindex); Enter/Espacio abre el selector de estado; Esc cierra el popover devolviendo el foco a la celda.
- Cada celda anuncia su contenido: "Domingo 29 de junio, A. Pérez, Descanso Laboral" / "celda libre, presione Enter para programar".
- Concurrencia (CU-03 E1): si otro usuario modificó la celda, `aria-live` anuncia "La celda fue actualizada por otro usuario" y se refresca con el estado vigente (bloqueo optimista).

**Responsive:**
- lg (1440): semana completa visible sin scroll.
- md (1024): scroll horizontal con columnas fijas Tienda/Puesto/Personal; pie de cuota visible.
- sm/xs: el calendario NO es el caso de uso primario. Se ofrece **consulta por colaborador** en cards apiladas (un card por colaborador con los 7 días como lista). La edición intensiva se reserva a desktop; en móvil se permiten acciones puntuales.

**Mensajes y errores clave:**
- Descanso laboral supera máximo por puesto: *"Alcanzó el máximo de días de descanso laboral. Regístrelo como compensación."*
- Compensación sin concepto disponible: *"No hay conceptos pendientes de compensar para este colaborador."*
- Permiso insuficiente (Cobertura de Tienda): *"No tiene permiso para registrar Cobertura de Tienda. Solo el Gerente Zonal puede hacerlo."*

---

## A.3 — Pie de columna: Cuota aproximada por asesor (GT, puesto Gt/Ases)

- Fila de resumen bajo cada columna de día con la cuota aproximada por asesor (cifra `2xl`, mono).
- Si algún día supera el límite parametrizable (S/3,000 para Cadena, configurable en Maestros), la cifra se muestra en `color.danger.fg` con ícono de alerta y bloquea el envío hasta corregir (ver A.7).
- **(P-05) Indicador de cobertura/dotación** por día usa los umbrales **parametrizables** `coverage.ok/warn/low` (verde/naranja/rojo definidos en Maestros), siempre con el valor numérico junto al color.
- Tooltip: cómo se calcula (cuota tienda ÷ asesores disponibles).

---

## A.4 — Acción: Agregar personal Senior a la vista (GG, GZ)

```
Relacionado: CU-06 | RN-31..34
```
- Botón "Agregar" en la barra de la vista Seniors.
- Abre modal con **buscador de empleado** (asesores, promotores, supervisores de sección de la zona, no incluidos ya en la vista).
- Estado vacío: "No hay personal disponible para agregar en esta zona."
- Al seleccionar, se añade una fila nueva con celdas libres y ratios desde RMS si existen.
- Nota de comportamiento (no es UI pero se refleja): si no se programa ningún día, no se arrastra a la semana siguiente; si se programa al menos un día, sí.

---

## A.5 — Cuadro de pendientes (compensaciones sin fecha)

```
Relacionado: CU-13 | RN-57..60
```
- Tabla compacta al pie del calendario, una fila por colaborador con saldo pendiente: **Colaborador · Feriados pend. (n) · Descansos no gozados pend. (n) · Fecha origen**.
- Se actualiza en tiempo real al programar/eliminar una compensación (descuenta/revierte el contador).
- Roles GG y AV: solo lectura.
- Estado sin pendientes: fila con "0" o vacía; si nadie tiene pendientes, mensaje "Sin compensaciones pendientes."

---

## A.6 — Vista especial de Sastres (sugerencia parametrizable)

```
Ruta: /rol-personal?puesto=Sastres     Roles: GT (edición previa), GZ (aprobación)
Relacionado: CU-12 | RN-54..56, RN-63
```
- Reemplaza el calendario normal. Agrupa a los sastres según zona/tienda.
- Las celdas sugeridas por el sistema se muestran con token `cal.sugerencia` + borde punteado + ícono ✦ + tooltip "Sugerencia del sistema (regla parametrizable). Editable."
- Acciones: aceptar sugerencia, editar (agregar/modificar/eliminar), o programar manual.
- Estado sin sugerencia (A1): banner info "Sugerencia no disponible. Programe manualmente."
- El GZ aprueba la programación de sastres; sigue el flujo normal de envío/aprobación.

---

## A.7 — Flujo de envío y aprobación (GZ → GG → GT)

### A.7.1 — GZ: Enviar a aprobación

```
Roles: GZ | CU-07 | RN-35..41, RN-71, RN-72
```
- Botón primario **"Enviar a Aprobación"** en la barra de acciones del calendario (visible solo a GZ con rol en estado "En Edición/Pendiente de Envío").
- Al pulsar, validación previa con resumen en modal:
  - Si algún día supera la cuota S/3,000 (Cadena): bloquea, lista el/los día(s) y el monto en conflicto (danger).
  - Si no todos los GZ responsables completaron su parte: bloquea con indicador "Falta: [GZ/zona]".
  - Si vencido el plazo (jueves 23:59): se permite el envío en ventana extendida (hasta viernes mediodía) pero el modal advierte que se registrará incumplimiento.
- Confirmación: modal "Se enviará la programación de la zona a Gerencia General. ¿Confirmar envío?" → botón "Enviar a Aprobación".
- Resultado (éxito): toast success + el badge del rol pasa a **"Enviado a GG"**; se programa el correo masivo por zona (jueves 23:59) y se notifica a los GT de la zona (push + correo).
- Error de sincronización RMS (E1): el estado revierte a "Pendiente de Envío" + banner danger "No se pudo sincronizar con RMS. El rol no fue enviado. Reintente."

### A.7.2 — Banner de plazo / SLA (transversal en la pantalla del Rol)

- Banner superior con el plazo vigente y tiempo restante, color escalonado (>50% neutral, 25–50% warning, <25%/vencido danger) + texto explícito.
- Alertas de vencimiento para GT (RN-48): notificación a las 11:00 ("Queda 1 hora para enviar su rol") y 11:30 ("Quedan 30 minutos…").
- Si el plazo vence sin acción → consecuencia de bloqueo de cajas (ver A.7.5).

### A.7.3 — GG: Resumen ejecutivo y aprobación

```
Roles: GG | CU-08 | RN-42..45, RN-72, RN-73
```
- **Vista resumen ejecutivo por zona** (cards/tabla): por zona → estado del rol (Pendiente/Enviado/Aprobado/Rechazado con badge), % tiendas con rol completo, alertas de plazos próximos a vencer, cajas bloqueadas activas.
- Al abrir una zona, el GG ve el calendario semanal en modo revisión (lectura) con acciones **"Aprobar"** / **"Rechazar"**.
- **Aprobar:** confirmación → badge "Aprobado por GG" → habilita a los GT a programar (A.7.4) → notificación.
- **Rechazar (A1, RN-72):** abre campo **"Motivo del rechazo" (obligatorio)** + contador de caracteres; "Confirmar Rechazo" deshabilitado hasta que haya texto. El rol vuelve a estado "En Edición" (REINICIO completo), el GZ recibe notificación con el motivo y debe corregir y reenviar todo el rol de la zona.
- Plazo (sábado 10:00): recordatorio 1 hora antes; al vencer sin aprobar → cajas bloqueadas + notificación a Administración de Ventas.

> El detalle de la tarea de aprobación del GG vive también en la **bandeja unificada de Aprobaciones** (ver `flujos-ux-transversales.md`); esta vista del Rol es la entrada contextual.

### A.7.4 — GT: Programación del rol de asesores

```
Roles: GT | CU-09 | RN-44..49
```
- Precondición: rol de la zona "Aprobado por GG". Si no, banner danger al entrar: *"El rol de su zona no ha sido aprobado aún. No puede programar su rol."* y grilla en lectura.
- Habilitado: el GT ve a sus asesores con la cuota aproximada por día; programa estados (A.2/A.4 de programación individual y bloque).
- Validación de cuota antes de enviar (Cadena). Botón **"Enviar"** → estado "Programado por GT".
- Plazo sábado; alertas 11:00/11:30; vencimiento → bloqueo de caja el domingo (A.7.5).

### A.7.5 — Bloqueo / desbloqueo de cajas (POS)

```
Roles: Sistema (auto), GZ (emite código), GT (recibe) | CU-10 | RN-38..49
```
- Cuando un plazo vence sin cumplimiento, la UI del Rol muestra banner danger persistente: *"Cajas bloqueadas por incumplimiento de plazo."* con conteo de tiendas afectadas.
- **GZ — emitir código de desbloqueo** (web o app móvil): pantalla "Códigos de desbloqueo" → lista de tiendas bloqueadas → botón "Emitir código" por tienda → muestra el código (mono, copiable) con su vigencia. El GZ lo comunica por su canal.
- **GT — recibe el código** y lo ingresa en el POS (sistema externo); la UI de Nova solo refleja el estado (Bloqueada/Desbloqueada) y el historial.
- Errores: código ya usado/vencido → "El código ya fue utilizado o venció. Solicite uno nuevo al Gerente Zonal." POS no recibe señal (E1) → alerta a operaciones (no bloquea al usuario).

---

## A.8 — Historial de modificaciones (GZ su zona, GG, AV — no GT)

```
CU-14 | RN-52, RN-61b
```
- Tabla: Usuario · Fecha · Hora · Celda (colaborador/día) · Estado anterior · Estado nuevo. Filtros por colaborador, día, usuario, rango.
- Ámbito por rol (GZ: su zona; GG/AV: todas). Exportable.
- GT: la opción no aparece en su menú.

---

# (b) MARCACIÓN MÓVIL DEL COLABORADOR Y VALIDACIÓN

> **Aclaración de alcance (MARC-001 VF-01):** La **marcación se realiza en el dispositivo biométrico físico de la tienda**, no en la app web/móvil. La app móvil del colaborador interviene en: (1) recibir notificaciones, (2) subir sustentos de descanso médico y (3) firma electrónica de documentos (Descansos). La app móvil del **GZ** sí emite códigos de autorización zonal. A continuación se diseñan: la experiencia en el **dispositivo biométrico**, la **gestión de inasistencia** del GT (web, abierta desde alerta Windows), la **emisión de código zonal** del GZ (móvil/web) y la **modificación de marcaciones** de AV (web).

## B.0 — Login móvil y recuperación de contraseña (app del colaborador / GZ) — NUEVO (P-10 · C-06)

```
Plataforma: app móvil (colaborador, GZ)     Roles: todos los usuarios de la app
Relacionado: ADR-001 (SSO) | CU-SEGU-10 | RN-SEGU-32 a 39, RN-SEGU-10/11/12/13/15
Objetivo del usuario: autenticarse en la app, o recuperar su contraseña por OTP.
```

> **(Misma fuente de verdad — no se duplica lógica)** El login y la recuperación de contraseña de la **app móvil consumen exactamente el mismo backend y el mismo flujo que la web** (A.0 / A.0.1–A.0.3): los mismos endpoints (`POST /auth/password-recovery/request|verify|reset`), las mismas reglas **RN-SEGU-32 a 39** y los mismos parámetros **`SEGU_OTP_*` / `SEGU_PWD_*`** de Maestros. Esta sección documenta **solo la presentación móvil** (layout full-screen, teclado, ergonomía táctil). Cualquier cambio de reglas, mensajes anti-enumeración, caducidad, intentos o política de contraseña se hereda de A.0.x; **no se redefine aquí**.
>
> **(Coherencia con A.0)** Tokens, microcopy, estados y comportamiento son idénticos a la web; lo que cambia es la disposición (sin split-screen; marca compacta arriba, formulario apilado a ancho completo) y la ergonomía táctil (tap targets ≥ 44px, inputs 16px, teclado numérico para el OTP).

### B.0.0 — Login móvil

**Layout (full-screen móvil, mobile-first xs 320 → sm 768):**

```
┌───────────────────────────────┐
│        [Logo Nova]            │   ← marca compacta, fondo color.brand.primary
│      Gestión de Equipos       │      (o cabecera de marca sobre surface)
│         Cadena / Lukers       │      etiqueta textual de empresa
│                               │
│  Inicia sesión para continuar │
│                               │
│  Correo electrónico           │
│  [ a******@empresa.com     ]  │
│                               │
│  Contraseña                   │
│  [ ••••••••••••        👁 ]    │
│                               │
│              ¿Olvidaste tu     │
│               contraseña?      │
│                               │
│  [     Iniciar sesión     ]   │   ← botón primario, ancho completo
│  ───────────  o  ───────────  │
│  [    Iniciar con SSO     ]   │   ← botón secundario, ancho completo
│                               │
│  (zona de alerta inline)      │
└───────────────────────────────┘
```

**Componentes (mismos átomos del design system que A.0):**
- **Cabecera de marca compacta:** logo Nova + "Gestión de Equipos" + etiqueta textual de empresa (Cadena / Lukers). Naming unificado **"Gestión de Equipos / Nova"** (prohibido "Sistema Administrativo de Tiendas" — P-10).
- **Campo Correo electrónico** (`type="email"`, `inputmode="email"`, `autocomplete="username"`, label visible, 16px para evitar zoom iOS).
- **Campo Contraseña** (`type="password"`, `autocomplete="current-password"`) con **botón mostrar/ocultar** (👁, `aria-label`/`aria-pressed`, tap target ≥ 44px, no envía el formulario).
- **Enlace "¿Olvidaste tu contraseña?"** → B.0.1.
- **Botón primario "Iniciar sesión"** (ancho completo, ≥ 44px de alto). Deshabilitado hasta que correo y contraseña tengan contenido válido.
- **Separador "o"** + **Botón secundario "Iniciar con SSO"** (ADR-001 / RN-SEGU-13), `aria-label="Iniciar sesión con el proveedor corporativo (SSO)"`. Si SSO no aplica al usuario/entorno, no se muestra (no se deshabilita decorativamente).

**Estados de la pantalla:**
- **Carga inicial / default:** formulario listo, foco inicial en Correo.
- **Loading:** botón "Iniciar sesión" con spinner + texto, deshabilitado; campos en readonly.
- **Error de credenciales (anti-enumeración, RN-SEGU-12):** alerta inline `danger` *"Correo o contraseña incorrectos."* (mensaje genérico, no revela si el correo existe).
- **Cuenta bloqueada (RN-SEGU-12):** *"Tu cuenta está bloqueada temporalmente por varios intentos fallidos. Intenta de nuevo más tarde o contacta a tu administrador."*
- **Cambio de contraseña obligatorio (RN-SEGU-11):** tras autenticar, se fuerza el formulario de nueva contraseña (reutiliza **B.0.3**) antes de entrar.
- **Error de SSO:** *"No fue posible iniciar con SSO. Intenta con correo y contraseña o reintenta."*
- **Sin conexión (específico de móvil):** alerta `danger` *"Sin conexión. Verifica tu red e inténtalo de nuevo."* + botón Reintentar.
- **Éxito:** ingreso a la app; recorte por **RBAC** (H-05) según rol/ámbito (colaborador ve sus datos; GZ ve sus zonas).

**Accesibilidad móvil (WCAG 2.1 AA):**
- Tap targets ≥ 44×44px (campos, botón mostrar/ocultar, botones, enlace).
- Orden de foco lógico: Correo → Contraseña → mostrar/ocultar → ¿Olvidaste? → Iniciar sesión → SSO.
- Labels asociados; alerta de error con `role="alert"` y `aria-describedby`; foco al primer campo en error.
- Botón mostrar/ocultar con `aria-pressed` y `aria-label` dinámico; íconos decorativos `aria-hidden`.
- Compatibilidad con lector de pantalla móvil (VoiceOver / TalkBack): la cabecera de marca es leíble; foco gestionado al navegar entre pasos.

**Responsive:** full-screen en xs/sm; en tablet (sm grande) el formulario se centra con ancho máximo cómodo. No hay split-screen en móvil (esa es la diferencia principal con A.0).

### B.0.1 — Recuperar contraseña móvil (paso 1 de 3 — solicitar código)

```
Plataforma: app móvil    Paso: 1 de 3    Relacionado: RN-SEGU-32, RN-SEGU-39 | endpoint /auth/password-recovery/request
```

```
┌───────────────────────────────┐
│ ←  Recuperar contraseña  (1/3) │
│                               │
│ Ingresa tu correo y te        │
│ enviaremos un código de       │
│ verificación de 6 dígitos.    │
│                               │
│ Correo electrónico            │
│ [ a******@empresa.com      ]  │
│                               │
│ [ Enviar código de            │
│   verificación             ]  │
│ (alerta inline)               │
└───────────────────────────────┘
```

- **Encabezado con flecha "← Volver"** (tap target ≥ 44px) → B.0.0 · indicador **"Paso 1 de 3"**.
- **Campo Correo** (`type="email"`, `inputmode="email"`, label visible).
- **Botón primario "Enviar código de verificación"** (ancho completo).
- **Validación de formato en vivo:** correo mal formado → *"Ingresa un correo válido (ejemplo: nombre@empresa.com)."*; botón deshabilitado hasta formato válido.
- **Éxito (anti-enumeración, RN-SEGU-32):** **siempre** el mismo mensaje, exista o no el correo: alerta `info` *"Si el correo existe, te enviamos un código de verificación. Revisa tu bandeja de entrada y spam."* → navega a **B.0.2**. (Para usuarios SSO, RN-SEGU-32 / A3: mismo mensaje genérico; la recuperación real ocurre en el IdP — no se distingue del caso local.)
- **Error de servicio / sin conexión:** *"No pudimos procesar tu solicitud. Intenta de nuevo en unos minutos."* / *"Sin conexión…"* + Reintentar.
- **Accesibilidad:** label asociado, error con `aria-describedby`, mensaje de éxito en `aria-live="polite"`, foco al campo al cargar.

### B.0.2 — Ingresar código móvil (paso 2 de 3 — verificar OTP)

```
Plataforma: app móvil    Paso: 2 de 3    Relacionado: RN-SEGU-33/34/35/36/37/39 | endpoint /auth/password-recovery/verify
```

```
┌───────────────────────────────┐
│ ←  Ingresa el código    (2/3)  │
│                               │
│ Enviamos un código de 6       │
│ dígitos a  a****@e****.com    │   ← email ENMASCARADO (RN-SEGU-32)
│                               │
│   [_][_][_]  [_][_][_]        │   ← 6 casillas, teclado NUMÉRICO
│                               │
│ El código vence en 09:48      │   ← caducidad (SEGU_OTP_TTL_MIN)
│ ¿No llegó?  Reenviar (00:42)  │   ← reenvío (SEGU_OTP_REENVIO_ESPERA_SEG)
│                               │
│ [     Verificar código     ]  │
│ (alerta inline)               │
└───────────────────────────────┘
```

- **"← Volver"** → B.0.1 · indicador **"Paso 2 de 3"**.
- **Correo enmascarado (RN-SEGU-32):** p. ej. `a****@e****.com` (mismo formato que la web). Nunca el correo completo.
- **Entrada OTP de 6 casillas** (numérico — RN-SEGU-33):
  - `inputmode="numeric"`, `pattern="[0-9]*"`, **teclado numérico** del SO en móvil.
  - `autocomplete="one-time-code"` en la primera casilla → **autorrelleno del OTP** desde el SMS/correo del sistema (iOS/Android).
  - **Auto-avance** al escribir, **Backspace** retrocede, **pegar "123456"** distribuye un dígito por casilla; solo numérico.
- **Contador de caducidad** *"El código vence en MM:SS"* (de `SEGU_OTP_TTL_MIN`, RN-SEGU-34); al llegar a 0 → estado expirado.
- **Reenviar con contador** *"Reenviar (MM:SS)"*, habilitado tras `SEGU_OTP_REENVIO_ESPERA_SEG` y hasta `SEGU_OTP_MAX_REENVIOS` (RN-SEGU-36); cada reenvío invalida el código anterior (RN-SEGU-37) y reinicia caducidad y contador.
- **Botón primario "Verificar código"** (ancho completo). Deshabilitado hasta completar las 6 casillas.

**Estados de error (heredados de RN-SEGU-35/34/37/36):**
- **Código incorrecto (E1):** `danger` *"El código no es correcto. Verifícalo e inténtalo de nuevo."* + casillas en `color.danger`, se limpian, foco a la primera; muestra intentos restantes (de `SEGU_OTP_MAX_INTENTOS`).
- **Código expirado (E2):** `warning` *"El código venció. Solicita uno nuevo."* + "Reenviar" habilitado.
- **Código ya usado (E3):** `danger` *"El código ya fue utilizado. Solicita uno nuevo."*
- **Demasiados intentos / enfriamiento (RN-SEGU-35):** `danger` *"Demasiados intentos. Por seguridad, vuelve a empezar la recuperación."* → bloquea casillas + botón "Volver al inicio" (cooldown `SEGU_OTP_COOLDOWN_MIN`).
- **Límite de reenvíos (E5):** `warning` *"Alcanzaste el límite de reenvíos. Intenta más tarde."*
- **Éxito:** verificación correcta → navega a **B.0.3** (con token de un solo uso, RN-SEGU-37, no expuesto en UI).

**Accesibilidad móvil:**
- Grupo de casillas `role="group"` con `aria-label="Código de verificación de 6 dígitos"`; cada casilla `aria-label="Dígito N de 6"`; tap target ≥ 44px de alto.
- Errores/expiración en `aria-live="assertive"`; reenvío en `polite`.
- `autocomplete="one-time-code"` para autorrelleno; el pegado y el auto-avance no rompen la navegación por teclado del lector.

### B.0.3 — Establecer nueva contraseña móvil (paso 3 de 3)

```
Plataforma: app móvil    Paso: 3 de 3    Relacionado: RN-SEGU-38, RN-SEGU-10/37/39 | endpoint /auth/password-recovery/reset (SEGU_PWD_*)
```

```
┌───────────────────────────────┐
│ Establecer nueva       (3/3)   │
│ contraseña                     │
│                               │
│ Nueva contraseña              │
│ [ ••••••••••••        👁 ]     │
│ Requisitos (en vivo):         │
│  ✓ Mínimo 8 caracteres        │
│  ✓ Mayúscula y minúscula      │
│  ○ Un número                  │
│  ○ Un carácter especial       │
│                               │
│ Confirmar contraseña          │
│ [ ••••••••••••        👁 ]     │
│ (✓ Coinciden)                 │
│                               │
│ [ Guardar nueva contraseña ]  │
│ (alerta inline)               │
└───────────────────────────────┘
```

- Indicador **"Paso 3 de 3"**.
- **Campo "Nueva contraseña"** (`autocomplete="new-password"`) con mostrar/ocultar.
- **Checklist de política `SEGU_PWD_*` en vivo (RN-SEGU-38 / RN-SEGU-10):** longitud mínima + complejidad (mayúscula/minúscula, número, carácter especial), no reutilización del historial, no igual a la actual. La UI renderiza **los requisitos que declare el backend** (no hardcodea), con ✓/○ + ícono + texto (no solo color).
- **Campo "Confirmar contraseña"** (mostrar/ocultar independiente) con validación en vivo de coincidencia.
- **Botón primario "Guardar nueva contraseña"** (ancho completo). Deshabilitado hasta cumplir todos los requisitos y coincidir.

**Estados de error (heredados de RN-SEGU-38/10):**
- **No coinciden:** *"Las contraseñas no coinciden."*
- **Política no cumplida (E4):** resalta requisitos faltantes en `color.danger`, foco al primero; *"Tu contraseña aún no cumple los requisitos de seguridad."* (no consume el token de un solo uso).
- **Reutilización / igual a la actual (RN-SEGU-10):** *"No puedes reutilizar una contraseña usada recientemente. Elige una distinta."*
- **Token expirado/inválido:** *"Tu sesión de recuperación expiró. Vuelve a solicitar un código."* + "Volver a empezar" → B.0.1.
- **Éxito (RN-SEGU-38):** estado de éxito (✓ `color.success`, *"Contraseña actualizada"*, *"Ya puedes iniciar sesión con tu nueva contraseña."*) + botón **"Ir al inicio de sesión"** → B.0.0. **No inicia sesión automáticamente** y, por seguridad, el backend **cierra las sesiones activas** del usuario (RN-SEGU-38); se notifica por correo el cambio.

**Accesibilidad móvil:** labels asociados; checklist vinculado por `aria-describedby`; cambios de requisitos en `aria-live="polite"` agrupado; mostrar/ocultar con `aria-pressed`; éxito en `role="status"`, foco al botón; tap targets ≥ 44px.

### B.0.x — Resumen del flujo móvil (idéntico al web, presentación full-screen)

```
[B.0.0 Login móvil]
  │  "¿Olvidaste tu contraseña?"
  ▼
[B.0.1 Recuperar contraseña]  ── correo ──► "Enviar código"   (anti-enumeración RN-SEGU-32)
  ▼
[B.0.2 Ingresa el código]  ── 6 dígitos, teclado numérico, email enmascarado ──► "Verificar"
  │   ↺ Reenviar (RN-SEGU-36)   ⏱ caducidad (RN-SEGU-34)   🔒 intentos (RN-SEGU-35)
  ▼
[B.0.3 Nueva contraseña]  ── política SEGU_PWD_* en vivo (RN-SEGU-38) ──► "Guardar"
  ▼
[Éxito]  ── cierra sesiones (RN-SEGU-38), no auto-login ──►  [B.0.0 Login móvil]
```

> **Mismo backend que web:** B.0.0–B.0.3 ↔ A.0–A.0.3 comparten endpoints, reglas y parámetros. La única diferencia es la presentación (full-screen móvil vs split-screen web).

## B.1 — Dispositivo biométrico de tienda (pantalla del lector)

```
Plataforma: dispositivo biométrico (UI kiosco, no responsive web)   Actor: Empleado
Relacionado: CU-02, CU-03, CU-04 | RN-02..06, RN-15
Objetivo: registrar entrada/salida por huella con validación de programación.
```

**Layout (pantalla simple, alto contraste, texto grande ≥ 24px):**
```
┌───────────────────────────────┐
│   NOVA · Tienda T-Lima01      │   ← marca + tienda (etiqueta empresa)
│   10:58 a. m. · Lun 30-JUN    │   ← reloj/fecha grandes
│                               │
│      [ ícono de huella ]      │   ← área central, animación al leer
│   Coloque su dedo en el lector│
│                               │
│   [zona de mensaje de estado] │   ← feedback (éxito/error) grande
└───────────────────────────────┘
```

> **(H-14) Atribución por huella:** la marcación se atribuye **al dueño de la huella leída**, nunca al usuario (GT) con la sesión del kiosko abierta. Todos los mensajes nombran al colaborador real ([Nombre]).

**Comportamiento por resultado (mensajes grandes, color + ícono + texto):**
- Entrada OK: success "Entrada registrada — [Nombre], 10:58 a. m." (verde, ✓). Auto-limpia a los ~4 s.
- Salida OK: success "Salida registrada — [Nombre]. Jornada cerrada." Calcula horas.
- **Entrada con tardanza (H-17):** success con marca warning "Entrada registrada (tardía) — [Nombre], 09:18 a. m. Horario programado: 09:00." Alimenta "Alertas de Marcaciones" y el Reporte de Asistencia.
- **Marcación anticipada / fuera de horario (H-17):** warning "Marcación anticipada — [Nombre]. Horario programado: 09:00." Se registra y se señala como fuera de horario.
- **Ausencia justificada (H-18):** si el colaborador tiene descanso/vacaciones/licencia programada, NO se trata como falta: info "[Nombre] tiene [tipo de ausencia] programada hoy. No requiere marcación." El estado se refleja como ausencia justificada (no "Sin marcación").
- Huella no reconocida (FA-02A, H-14/P-08): danger "No reconocimos su huella. Intente de nuevo o acuda a su Gerente de Tienda." con botón/gesto de **reintento**.
- **Lector biométrico offline (P-08):** danger "El lector no está disponible. Reintente en unos segundos." con reintento; si persiste, instrucción de avisar a TI. No registra.
- Sin huella registrada (FA-02C): info "No tiene huella registrada. Acuda a su Gerente de Tienda."
- Programación activa, sin autorización (CU-04): danger "Marcación no permitida. [Nombre] tiene [tipo de programación] activo. Comuníquese con su Gerente Zonal."
- Con autorización zonal vigente (FA-04A, H-15): success "Marcación autorizada (código zonal). Entrada registrada." El código zonal es la **compuerta de excepción** (fuente única: generado por GZ — ver B.3).
- Marcación duplicada (FA-02D): warning "Ya registró su entrada hoy."
- Salida sin entrada (FA-03A): danger "No registró entrada hoy. Su Gerente de Tienda debe resolverlo."
- Fuera de ventana de tolerancia (FA-02E): warning "Fuera del horario permitido. Puede marcar desde [hora]."
- RMS no responde (RN-03, fail-closed): danger "Error de conexión. Por favor reintente." — NO registra.
- Salida tardía part-time (FA-03B): success con marca "Salida registrada (tardía)." y libera bloqueo POS si estaba activo.

> **(H-16) Auditoría:** toda anulación/reprogramación y toda marcación con código zonal registra **quién, cuándo y el código** usado.

**Accesibilidad del kiosco:** texto ≥ 24px, contraste reforzado (AAA donde sea posible por uso a distancia), mensajes con ícono + color + texto, audio/beep opcional de confirmación (a definir con TI). Sin dependencia de teclado (interacción por huella).

## B.2 — Alerta de inasistencia en Windows → Gestión de inasistencia (GT, web)

```
Plataforma: notificación nativa Windows → módulo web    Actor: Gerente de Tienda
Relacionado: CU-06, CU-07 | RN-07, RN-08
Objetivo: gestionar empleados sin marcación (Falta o Descanso).
```

**Notificación Windows:** "[N] empleados sin marcación — Tienda [nombre]". Clic abre el módulo web filtrado por tienda y fecha actual.

**Pantalla web — Gestión de inasistencia:**
```
┌──────────────────────────────────────────────────────────────┐
│ Gestión de inasistencia · T-Lima01 · Lun 30-JUN              │
├──────────────────────────────────────────────────────────────┤
│ Empleado     │ Cargo   │ Turno teórico │ Estado     │ Acciones │
│ J. Ramos     │ Asesor  │ 09:00–18:00   │ Sin entrada│ [Falta][Descanso]│
│ ...                                                            │
└──────────────────────────────────────────────────────────────┘
```
- **(H-18) Exclusión de ausencias justificadas:** la lista lista solo empleados activos **sin entrada y sin programación**. Quien tiene descanso/vacaciones/licencia programada **no aparece** como inasistencia; si se muestra (vista completa), se etiqueta como **"Ausencia justificada — [tipo]"** (badge neutral 🛈), no como falta. La lista de "Alertas de Marcaciones" excluye lo ya programado.
- Dos acciones por empleado: **"Registrar Falta"** y **"Registrar Descanso"**.
- **(H-19) Motivo + auditoría:** registrar Falta o Descanso desde aquí exige **motivo obligatorio** y queda en **auditoría** (quién/cuándo/motivo). Banner "Esta acción quedará registrada en auditoría."
- Falta → confirmación con campo **motivo obligatorio** "¿Confirma registrar falta para [Nombre] el [Fecha]?" → al confirmar, actualiza estado a badge **Falta** y la fila se marca como gestionada.
- Descanso → navega al motor de ausencias programadas con el empleado pre-filtrado (B.3 / C); al volver, si se registró, la fila desaparece.
- Tiempo real (FA-07C): si el empleado marca mientras el GT mira la lista, la fila se actualiza/desaparece (`aria-live`).
- Estado vacío (FA-07B): "Todos los empleados han sido gestionados."

**Accesibilidad:** tabla semántica; cada par de botones con `aria-label` que incluye el nombre ("Registrar falta para J. Ramos"); confirmaciones en `dialog` con foco atrapado.

## B.3 — Emisión de código de autorización zonal (GZ, móvil prioritario + web)

```
Plataforma: app móvil (prioritaria) + web    Actor: GZ
Relacionado: CU-05 | RN-04
Objetivo: habilitar marcación de un empleado con programación activa.
```
> **(H-15) Fuente única del código zonal:** el mecanismo de generación del código de autorización es **único y lo genera el GZ** (esta pantalla). Todos los módulos que lo consumen (kiosko, anulación de descanso para laborar) referencian este mismo mecanismo, no implementaciones paralelas.

- Formulario: **buscador de empleado** · **tienda destino** · **fecha(s)** · **motivo (obligatorio)**.
- "Generar código" → muestra el código (mono, grande, botón "Copiar"), su vigencia y los usos (1 entrada + 1 salida por fecha). Mensaje: "Comunique este código al empleado por su canal."
- **(H-16) Auditoría:** cada emisión, uso, cancelación y expiración del código queda auditada (quién/cuándo/código/motivo).
- Lista de autorizaciones emitidas con estado (Activa/Consumida/Expirada/Cancelada) y acción "Cancelar" (propia).
- Errores: código expirado/consumido se reflejan en el estado; "Cancelar" invalida.
- Optimizado para móvil: campos a ancho completo, tap targets ≥ 44px, código copiable de un toque.

## B.4 — Modificación de marcación (Administración de Ventas, web)

```
Plataforma: web   Actor: AV   Relacionado: CU-09 | RN-14
Objetivo: corregir una marcación de la semana en curso con motivo.
```
- Historial de marcaciones filtrable por tienda/empleado/fecha → seleccionar marcación → ver datos actuales → editar (hora/tipo) + **motivo (obligatorio)** → confirmar.
- Solo semana en curso (fuera de rango: bloqueo + mensaje del rango permitido).
- Toda modificación queda en auditoría (valor anterior/nuevo/motivo) — banner informativo "Esta acción quedará registrada en auditoría."

## B.5 — Bloqueo de salida part-time en POS (visibilidad y desbloqueo manual)

```
Relacionado: CU-08 | RN-09..11
```
- Alertas previas (10/5/1 min) son emergentes en POS (externo); Nova las dispara.
- Bloqueo individual por empleado sin salida → la UI de Nova muestra, en el panel de operaciones de la tienda, los bloqueos activos (empleado, hora límite, tiempo bloqueado).
- **Desbloqueo manual** (GT/ADM, ante fallo del dispositivo): botón "Desbloquear" → **motivo obligatorio** → confirmación → queda en auditoría.
- Si el bloqueo supera el tiempo parametrizable, alerta al GZ (badge de criticidad).

## B.6 — Reporte de Asistencia (mejorado) — (P-07)

```
Plataforma: web (gerencial) + visualización en kiosko    Actores: GT, GZ, GG, AV (recorte RBAC H-05)
Relacionado: ENT-MOD-MARC-001 | RN-07, RN-08, RN-17
Objetivo: comparar la asistencia real contra lo programado y exportarla.
```

**Layout (tabla densa, web):**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Reporte de Asistencia · T-Lima01 · Dom 28-JUN 2026   Última actualización 11:02│
│ Filtros: [Estado ▾] [Puesto ▾] [Fecha/Rango 📅 dom–sáb]   [Exportar ▾ Excel/CSV]│
├──────────┬─────────┬───────────────┬─────────────┬───────────┬────────────────┤
│ Empleado │ Puesto  │ Horario progr.│ Marcación   │ Estado    │ Observación    │
│ A. Pérez │ Senior  │ 09:00–18:00   │ 09:18–18:05 │ Tardanza ⏱│ +18 min        │
│ J. Ramos │ Asesor  │ 09:00–18:00   │     —       │ Ausencia🛈│ Descanso prog. │
│ M. Soto  │ PT      │ 14:00–20:00   │ 14:00–20:12 │ Cerrada ✓ │ Salida tardía  │
└──────────┴─────────┴───────────────┴─────────────┴───────────┴────────────────┘
```

**Mejoras incorporadas (P-07):**
- **Columna "Horario programado"** junto al horario real (comparación directa) — usa la marcación atribuida por huella (H-14).
- **Exportar (Excel / CSV)** respetando filtros y ámbito (RBAC); la exportación queda auditada.
- **Filtros** por estado (Cerrada / Tardanza / Marcación anticipada / Ausencia justificada / Falta / Sin marcación), por puesto y **selector de fecha/rango** anclado a **domingo→sábado** (H-01).
- **"Última actualización"** visible.
- Formato **print-friendly**.
- **(H-17/H-18)** Estados de **tardanza**, **marcación anticipada** y **ausencia justificada** (no cuenta como falta a quien tiene programación) representados con sus badges; "—" en marcación con `aria-label` "Sin marcación".

**Estados:** loading (skeleton) · vacío ("No hay marcaciones para los filtros seleccionados") · con datos · error (banner + reintentar).

**Accesibilidad:** `<table>` semántica con `scope` en encabezados, ordenable por columna; leyenda (P-02) de estados; `aria-label` en celdas "—".

---

# (c) GESTIÓN DE AUSENCIAS PROGRAMADAS (Descansos · Licencias · Vacaciones — motor único)

> **(H-03) Motor único de ausencias programadas.** Licencias, Descansos y Vacaciones se consolidan sobre un **único motor / calendario de ausencias programadas**, con una **sola fuente de verdad** y **validación de no-cruce transversal**. Disponible en **web** (calendario unificado, junto con las programaciones) además de los registros móviles existentes. Antes de confirmar cualquier ausencia, el motor valida que el empleado **no tenga otra programación previa** en esas fechas (descanso, vacaciones o licencia) y da **feedback de validación inline**: resalta el periodo en conflicto, muestra el tipo/fechas de la programación existente y bloquea el guardado; si no hay cruce, confirma "Sin cruces".
>
> El registro de descansos laborales y compensaciones se sigue haciendo **desde el calendario del Rol de Personal** (A.2) y desde el **calendario unificado** (web). El motor aporta: registro de licencias con documentos (web + móvil), flujo de descanso médico (Bienestar), flujo LSGH/LCGH (firma electrónica), edición/anulación, listado, vista consolidada de zona y firma en app móvil.
>
> **(H-08) Estados visibles:** las ausencias muestran su estado intermedio real — **Pendiente de aprobación** y **En validación Bienestar** — y nunca saltan directo a "Programado"/"En ejecución". Ruteo por tipo: LSGH/LCGH → **GG** (SLA 2 días); Descanso médico / Lic. médica → **Bienestar** (SLA 2 días). Las acciones de aprobación se canalizan por la **bandeja de Aprobaciones** (transversal).

## C.1 — Registro de descanso laboral / compensación (desde el calendario del Rol)

```
Ruta: /rol-personal (selector de estado de celda)   Actores: GT, Administración Central
Relacionado: CU-01, CU-02, CU-03 | RN-01..15, RN-38, RN-57..60
```
- Se reutiliza el **selector de estado de celda** (A.2). Descanso Laboral y Compensaciones son estados de celda.
- **Descanso laboral:** elegir empleado+fecha; para puestos de 1 día de descanso solo fecha inicio (fecha fin bloqueada); para 2 días, rango máximo 1 día.
- **Sugerencia automática:** botón "Sugerencia Automática" en la barra del calendario → genera propuesta de descansos y, si hay saldo, una fecha de compensación (mostrando fecha origen). Las celdas sugeridas usan token `cal.sugerencia`. El usuario edita/confirma; la propuesta confirmada pasa a aprobación del GZ.
- **Compensación:** el selector muestra las **3 fechas propuestas** (Tabla 04 por empresa) con la **fecha origen** junto a cada una; el usuario elige una (o ingresa manual si tiene permiso, validada igual). Al registrar, correo al empleado + copia GV/AV.
- Contador de saldo (chip doble) y cuadro de pendientes (A.5) se actualizan en tiempo real.

**Mensajes y errores:**
- Máximo de descansos del puesto alcanzado (E1): "Alcanzó el máximo de días de descanso de la semana. Registre el día adicional como compensación."
- Fuera del rango de edición (tienda) (E2): "Solo puede editar la semana en curso y la anterior. Rango permitido: [fechas]."
- 2.º día en puesto de 1 día (E3): "Este puesto permite 1 día de descanso. Registre el día adicional como compensación."
- RMS no responde (E4): "No se pudo validar al colaborador (RMS). Intente más tarde."
- Sin asesor disponible (E5): "No queda ningún asesor disponible ese día. No se puede programar el descanso."
- Sin fecha válida de compensación (E1 CU-03): "No hay fechas disponibles que cumplan las reglas. Ajuste el criterio o escale al administrador."

## C.2 — Registrar licencia con documentos (modal) — web + móvil (H-03)

```
Actores: GT (descanso/compensación), Central/GZ (todas las licencias)   CU-04 | RN-16..18
```
- **(H-03) Disponible también en web**, integrado al motor/calendario unificado de ausencias programadas (no solo en móvil).
- Modal: **empleado · tipo de licencia** (vacaciones, descanso médico, LSGH, LCGH) **· fechas inicio/fin (selector domingo→sábado, H-01) · carga de documentos · comentarios** (obligatorios para LSGH/LCGH).
- **(H-13/H-03) Validación de no-cruce transversal:** verifica que el empleado no tenga **otra programación previa** (descanso, vacaciones u otra licencia) en esas fechas. Feedback inline: marca el periodo en conflicto, muestra el tipo/fechas existentes y bloquea hasta resolver. Confirmación "Sin cruces" cuando es válido.
- **(H-20) Certificado en licencia médica:** para descanso médico / licencia médica se permite **adjuntar certificado**; al registrar, la solicitud pasa por **validación de Bienestar** (estado "En validación Bienestar", H-08) antes de ejecutarse.
- Errores: documentos obligatorios faltantes → lista qué falta; solapamiento → fechas en conflicto y bloqueo.
- Al registrar, dispara el flujo correspondiente (C.3 médico / C.4 LSGH-LCGH) y la ausencia queda en estado **Pendiente de aprobación** / **En validación Bienestar** (no salta a Programado).
- Privacidad: la carga de documentos médicos es dato sensible; visible solo al flujo (GT/empleado/Bienestar según corresponda) y recortada por RBAC (H-05).

## C.3 — Flujo de descanso médico (empleado app + Bienestar)

```
Actores: GT/Senior (registra falta), Empleado (app), Bienestar   CU-05 | RN-19..23, RN-46, RN-65
```
**App móvil del colaborador — subir sustento:**
```
┌─────────────────────────────┐
│ Descanso médico             │
│ Fechas: [inicio]–[fin]      │
│ Documentos de sustento      │
│ [ + Adjuntar archivo ]      │
│ [lista de adjuntos]         │
│ [ Enviar a Bienestar ]      │
└─────────────────────────────┘
```
- Tras registrar la falta (GT/Senior en B.2), el empleado sube documentos/**certificado** (H-20) en la app indicando fechas.
- Estados visibles para el empleado (H-08): **"En validación Bienestar"**, "Observado" (con detalle y botón "Volver a enviar"), "Aprobado", "Caso cerrado" (tras 3 rechazos). El estado no salta directo a terminal.
- **Bienestar (web):** bandeja de revisión (SLA 2 días hábiles) → ver documentos/certificado → Aprobar / **Rechazar con observación obligatoria** (H-10). Contador de rechazos visible; al 3.º rechazo, cierre automático + notificación a GT y empleado.
- Aprobado → Nova escribe "DESCANSO MÉDICO" en RMS (tiempo real) + migración OFIPLAN diferida; estado **"Culminado" en color success/verde** (P-04, no amarillo de advertencia).
- Feriado dentro del rango (A2): se cuenta como día de descanso médico, no se compensa.
- Escalamientos: empleado no sube en plazo → alerta a GT; Bienestar no revisa en 2 días → alerta a Administración de Ventas.

## C.4 — Flujo LSGH / LCGH (GZ solicita → GG aprueba → firma)

```
Actores: GZ (solicita), GG (aprueba en bandeja), Empleado (firma app)   CU-06 | RN-24..27, RN-48, RN-49
```
- GZ crea la solicitud (empleado, tipo, periodo, **comentarios obligatorios**), con validación de no-cruce (H-03) → entra a la **bandeja de Aprobaciones** del GG en estado **Pendiente de aprobación** (H-08; ver transversales).
- GG aprueba/rechaza (**rechazo con comentario obligatorio** — H-10; notifica a GZ y empleado).
- Aprobado → documento al servicio de **Firma Electrónica Nova**; el empleado firma en app (selfie + GPS + código por correo), plazo parametrizable (3 días hábiles por defecto).
- **App móvil — firmar:** pantalla con el documento, botón "Firmar" → captura selfie + ubicación + ingreso de código recibido por correo → confirmación.
- Si no firma en plazo → 24 h de gracia → si no firma, se **bloquea el beneficio** y se notifica al GZ.
- Firmado → escritura en RMS (tiempo real) + migración OFIPLAN; estado **"Culminado" en color success/verde** (P-04).

## C.5 — Editar / anular descanso o compensación

```
Actores: GT, GZ (autoriza), Central   CU-07, CU-08, CU-09 | RN-28..35, RN-53..55, RN-59, RN-61
```
- **Editar:** desde el listado o arrastrando la programación en el calendario a otra fecha; confirmación previa; valida contra reglas (Tabla 04, dotación, solapamiento); si no cumple, bloquea con motivo. Compensación editada → correo al empleado (cambio de fecha). Estado pasa a "Modificado".
- **Anular:**
  - Compensación de la semana en curso: el GT anula directamente.
  - Semanas anteriores (dentro del rango): requiere **autorización del GZ** (web o app móvil) antes de proceder.
  - **(H-09) Anulación de periodo de vacaciones activo:** requiere **autorización de Administración de Ventas o Gerencia General**. La UI presenta el **paso de autorización AV/GG** (no es anulación directa); registra quién autorizó. Sin esa autorización, la acción queda bloqueada con mensaje "La anulación de vacaciones requiere autorización de Administración de Ventas o Gerencia General."
  - **(H-10)** Si la anulación implica rechazo de una solicitud, exige **motivo obligatorio**.
  - Confirmación con advertencia → estado "Anulado" → correo al empleado → reprograma automáticamente en nueva fecha válida (o queda en saldo pendiente si no hay fecha) + correo de la nueva programación.
  - **(H-16)** Toda anulación/reprogramación queda en **auditoría** (quién/cuándo/autorizó/código si aplica).
- **Anular para que el empleado labore (CU-09):** primero el sistema pide registrar nueva fecha de descanso en la misma semana; solo si el GT declina, el GZ emite el **código de autorización** (B.3). En semana de campaña, los códigos se exoneran.
- Estados que bloquean edición/anulación: "En ejecución", "Ejecutado", "Anulado" → mensajes específicos.

## C.6 — Listado y vista consolidada de zona (GZ)

```
CU-10 | RN-62 ; listado con filtros diferenciados tienda/central
```
- **Listado:** una pantalla con filtros (empresa, tienda, empleado, tipo, estado, rango), badges de estado del catálogo, acciones contextuales (editar/anular según permisos/semana). Comportamiento diferenciado por perfil (Central ve todo sin restricción de semana; Tienda ve su tienda y semanas permitidas) — **misma pantalla**.
- **Consolidado de zona (GZ):** panel con total de compensaciones pendientes por tienda, descansos de la semana, empleados sin descanso asignado, alertas de compensaciones por vencer. Filtros por tienda/semana/tipo. **Exportar a Excel**.

---

## Resumen de mensajes de error críticos — Fase 1 (referencia rápida)

| Contexto | Mensaje |
|---|---|
| Semana fuera de rango (Rol) | "No se puede programar más allá de la semana siguiente a la actual." |
| Día pasado (Rol) | "No se puede modificar días pasados." |
| Cuota excedida (Cadena) | "La cuota por asesor del [día] supera el límite (S/[monto]). Corrija antes de enviar." |
| Rechazo de rol (GG) | "El motivo del rechazo es obligatorio." |
| RMS caído (marcación) | "Error de conexión. Por favor reintente." |
| Programación activa (marcación) | "Marcación no permitida. [Nombre] tiene [programación] activo. Comuníquese con su Gerente Zonal." |
| Rol no aprobado (GT) | "El rol de su zona no ha sido aprobado aún. No puede programar su rol." |
| Sin asesor disponible (Descanso) | "No queda ningún asesor disponible ese día. No se puede programar el descanso." |
| Sin fecha de compensación válida | "No hay fechas disponibles que cumplan las reglas. Ajuste el criterio o escale al administrador." |
| Cruce de ausencias (H-03/H-13) | "El colaborador ya tiene [tipo] programado del [fecha] al [fecha]. No se puede registrar una ausencia que se cruce." |
| Anulación de vacaciones sin autorización (H-09) | "La anulación de vacaciones requiere autorización de Administración de Ventas o Gerencia General." |
| Lector biométrico offline (P-08) | "El lector no está disponible. Reintente en unos segundos." |
| Falta/Descanso manual sin motivo (H-19) | "Indique el motivo. Esta acción quedará registrada en auditoría." |
| Login — credenciales (anti-enumeración, A.0) | "Correo o contraseña incorrectos." |
| Login — cuenta bloqueada (RN-SEGU-12, A.0) | "Tu cuenta está bloqueada temporalmente por varios intentos fallidos. Intenta de nuevo más tarde o contacta a tu administrador." |
| Login — error de SSO (A.0) | "No fue posible iniciar con SSO. Intenta con correo y contraseña o reintenta." |
| Recuperación — correo con formato inválido (A.0.1) | "Ingresa un correo válido (ejemplo: nombre@empresa.com)." |
| Recuperación — solicitud enviada (anti-enumeración, A.0.1) | "Si el correo existe, te enviamos un código de verificación. Revisa tu bandeja de entrada y spam." |
| Recuperación — código incorrecto (A.0.2) | "El código no es correcto. Verifícalo e inténtalo de nuevo." |
| Recuperación — código expirado (A.0.2) | "El código venció. Solicita uno nuevo." |
| Recuperación — demasiados intentos (RN-SEGU-12, A.0.2) | "Demasiados intentos. Por seguridad, vuelve a empezar la recuperación." |
| Nueva contraseña — no coinciden (A.0.3) | "Las contraseñas no coinciden." |
| Nueva contraseña — política no cumplida (RN-SEGU-10, A.0.3) | "Tu contraseña aún no cumple los requisitos de seguridad." |
| Nueva contraseña — reutilización (RN-SEGU-10, A.0.3) | "No puedes reutilizar una contraseña usada recientemente. Elige una distinta." |
| Recuperación — sesión expirada (A.0.3) | "Tu sesión de recuperación expiró. Vuelve a solicitar un código." |
| Recuperación — código ya usado (B.0.2 / RN-SEGU-37) | "El código ya fue utilizado. Solicita uno nuevo." |
| Recuperación — límite de reenvíos (B.0.2 / RN-SEGU-36) | "Alcanzaste el límite de reenvíos. Intenta más tarde." |
| Login móvil — sin conexión (B.0.0) | "Sin conexión. Verifica tu red e inténtalo de nuevo." |

> Los mensajes de login/recuperación son **compartidos por web (A.0.x) y móvil (B.0.x)** salvo "Sin conexión", que es propio de la app móvil. El microcopy se mantiene idéntico entre plataformas.

---

## Vacíos de UX de Fase 1 que requieren decisión del PO

| ID | Pregunta |
|---|---|
| VUX-F1-01 | ¿La consulta del calendario del Rol en móvil (cards por colaborador) es suficiente, o se requiere edición móvil completa? (impacta esfuerzo). |
| VUX-F1-02 | ¿El dispositivo biométrico requiere confirmación sonora/visual adicional por accesibilidad o ruido de tienda? |
| VUX-F1-03 | Formato exacto y branding de los correos (compensación, rechazo, firma) — pendiente de plantillas de marca. |
| VUX-F1-04 | ¿La "vista comparación programado vs asistencia" (semanas cerradas) es pantalla propia o pestaña del calendario? |
| VUX-F1-05 | Prioridad de pantallas para el piloto (¿qué tiendas/empresa primero define el theme inicial Cadena/Lukers?). |
| VUX-F1-06 | (SUP-UX-09) Política de **"Mantener sesión iniciada"**: ¿duración de la sesión persistente y restricción en equipos compartidos/kiosko? — confirmar con seguridad (RN-SEGU-15). |
| VUX-F1-07 | (SUP-UX-10) **Caducidad del código OTP** (default propuesto 10 min), **N.º de dígitos** (6 confirmado), **límite de intentos** y **ventana de reenvío** (default propuesto 45 s) — confirmar valores con seguridad (VAC-SEGU-03 / RN-SEGU-12). |
| VUX-F1-08 | ¿El canal del OTP es solo **correo** en Fase 1, o también SMS? (impacta copy "revisa tu bandeja" y `autocomplete="one-time-code"`). |
