# Flujos UX y Wireframes — Transversales (Aprobaciones y Ascenso Senior)

| Campo | Valor |
|---|---|
| Documento | Flujos de experiencia y wireframes descritos — Transversales |
| Sistema | Nova — Gestión de Equipos (retail Cadena / Lukers) |
| Versión | 2.0 |
| Fecha | 31/05/2026 |
| Elaborado por | UX/UI Designer Senior |
| Estado | RECONCILIADO con prototipo (fuente de verdad visual) — pendiente de validación con PO |
| Documentos base | reconciliacion-ux.md v1.0 (fuente de verdad visual), ENT-MOD-APRO-001 v1.0, ENT-MOD-ASCE-001 v1.2, ENT-MOD-SEGU-001 v1.0, design-system-nova.md v2.0 |
| Alcance | (a) Bandeja de Aprobaciones (unificada web / por categoría móvil), (b) Panel de Ascenso Senior con panel de 6 meses + segregación de funciones |

> Wireframes descritos en texto (layout, secciones, componentes, comportamiento por estado y por rol). Usan tokens, componentes y badges de `design-system-nova.md` v2.0. WCAG 2.1 AA. Terminología funcional: GZ, GG, GT, Senior, R-GG-SUP, AV, AR, Bienestar. Datos de ejemplo ficticios (2026 — P-01).

---

## Changelog

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 30/05/2026 | Versión inicial (bandeja de Aprobaciones + panel de Ascenso Senior). |
| 2.0 | 31/05/2026 | Reconciliación con prototipo. **(H-02)** El ascenso Senior **vive en Aprobaciones**, no en Gestión de Equipos: se retira la acción de Gestión de Equipos (solo badge "Senior" de solo lectura allá); el **promotor/solicitante pasa a ser Administración de Ventas (AV)** y el aprobador es el GG (GG Suplente por segregación). El **panel obligatorio de cumplimiento de 6 meses + segregación** vive aquí. **(H-04)** Ícono de la acción de ascenso unificado a **▲** (se elimina la ★, que se leía como "favorito"). **(H-06)** Segregación visible reforzada: el solicitante **no ve "Aprobar"**. **(H-10)** Comentario obligatorio en rechazo. **(P-04)** "Aprobar" en color positivo, estados terminales con color semántico. **(P-09)** Definición explícita: bandeja **unificada en web** / **por categoría en móvil** (Solicitudes / Roles / Licencias), con Ascenso dentro de Solicitudes. **(H-01)** SLA y fechas a 2026 / semana domingo→sábado donde aplica. Conserva fortalezas (estados vacíos, KPIs, drill-down). |

---

# (a) BANDEJA UNIFICADA DE APROBACIONES

## Mapa de experiencia

```
Módulo solicitante inicia flujo ──► Tarea entra a la bandeja del aprobador resuelto
   (Rol, LSGH/LCGH, médico,             │  (por rol + ámbito vía Seguridad)
    vacaciones-anulación, ascenso)       ▼
                              Aprobador abre detalle ──► Aprobar / Rechazar (comentario oblig. en rechazo)
                                            │                     │
                              Delegación/Suplencia vigente         ▼ callback al módulo (efecto de negocio)
                              redirige la tarea al delegado/suplente
```

**(P-09) Presentación de la bandeja:**
- **Web:** bandeja **unificada** — una sola lista por aprobador con tareas de todos los módulos (Rol, LSGH/LCGH, descanso médico, vacaciones-anulación, **Ascenso Senior**) (RN-APRO-21).
- **Móvil:** bandeja **por categoría** — secciones/pestañas **Solicitudes · Roles · Licencias**, con **Ascenso Senior dentro de "Solicitudes"**. Es la misma fuente de datos, solo categorizada; coherencia total con la web.

El acceso y los datos visibles se restringen por **rol + ámbito (RBAC, H-05)** (GZ: su zona; GG/AV: todas) — RN-APRO-23.

**(H-02) Ascenso Senior:** la acción de **iniciar** un ascenso (▲) y el **panel de cumplimiento de 6 meses + segregación** viven aquí (no en Gestión de Equipos). El **promotor/solicitante es Administración de Ventas (AV)**; el aprobador es el GG (con GG Suplente para segregación).

---

## T.1 — Pantalla: Bandeja de pendientes (lista)

```
Ruta: /aprobaciones      Roles: Aprobador (GG, GZ, AV, Bienestar, R-GG-SUP), Delegado
Relacionado: CU-APRO-06 | RN-APRO-21, RN-APRO-23
Objetivo: ver y operar todas las tareas de aprobación pendientes desde un único punto.
```

**Layout (desktop md/lg — split view):**
```
┌───────────────────────────────────────────────────────────────────────────┐
│ Aprobaciones                                  [Pendientes ▸] [Historial]    │
├──────────────────────────────────┬────────────────────────────────────────┤
│ FILTROS (sticky)                 │  DETALLE de la tarea seleccionada (T.2)  │
│  Tipo de flujo ▾  Módulo ▾       │  ───────────────────────────────────────│
│  Antigüedad ▾     Criticidad ▾   │  (split: lista izquierda, detalle dcha)  │
│  [ Buscar ]                      │                                          │
├──────────────────────────────────┤                                          │
│ LISTA DE TAREAS                  │                                          │
│ ┌──────────────────────────────┐ │                                          │
│ │● Rol semanal · Zona Lima Sur │ │  ← criticidad (punto color) + título     │
│ │  Solicita: GZ M. Soto        │ │                                          │
│ │  Ingresó: hace 3 h           │ │                                          │
│ │  SLA: vence hoy 10:00 [warn] │ │                                          │
│ ├──────────────────────────────┤ │                                          │
│ │  LSGH · J. Ramos (T-Lima01)  │ │                                          │
│ │  SLA: 1 día hábil restante   │ │                                          │
│ ├──────────────────────────────┤ │                                          │
│ │  Ascenso Senior · A. Pérez   │ │                                          │
│ │  [VENCIDA] SLA superado [dgr] │ │                                          │
│ └──────────────────────────────┘ │                                          │
└──────────────────────────────────┴────────────────────────────────────────┘
```

**Componentes — item de tarea (molécula "item de lista de tarea"):**
- **Tipo de flujo + objeto** (Rol semanal / LSGH / LCGH / Descanso médico / Anulación de vacaciones / Ascenso Senior) + ámbito (zona/tienda/colaborador, según privacidad mínima).
- **Solicitante**, **fecha de ingreso** (relativa: "hace 3 h").
- **SLA restante** con color escalonado: >50% neutral, 25–50% warning, <25%/vencido danger + texto explícito ("vence hoy 10:00", "vencida hace 2 h").
- **Criticidad** (punto de color + texto en `aria-label`).
- Badge "VENCIDA" cuando el SLA se superó (sigue siendo accionable).
- **Selección múltiple** (checkbox por fila) para aprobación en lote si está habilitada (ver T.4 / VUX-T-02).

**Filtros:** tipo de flujo, módulo, antigüedad, criticidad. Chips de filtros activos removibles.

**Estados de pantalla:**
- Carga: skeleton de items.
- Vacío: estado accionable "No tiene tareas pendientes. Todo al día." (ícono neutro, sin alarma).
- Con datos: lista ordenada por urgencia de SLA por defecto (vencidas y próximas a vencer arriba).
- Error de carga: banner danger + Reintentar.

**Accesibilidad:**
- Lista como `role="list"`; cada item `role="listitem"` con título accesible que resume tipo + objeto + SLA.
- El SLA no se comunica solo por color: incluye texto y, en vencidas, badge "VENCIDA".
- Selección de un item mueve el foco al panel de detalle (en split view) o navega a la pantalla de detalle (móvil); el orden de foco es lógico.
- `aria-live="polite"` anuncia cuando una tarea desaparece de la lista (resuelta por otro aprobador del mismo nivel — concurrencia, CU-APRO-03 E1).

**Responsive:**
- xs/sm: lista a pantalla completa → al tocar un item, navega a la **pantalla de detalle** (T.2) con botón "Volver"; las acciones Aprobar/Rechazar van fijas al pie (tap targets ≥ 44px). Pensado para que GG/GZ resuelvan desde el móvil.
- md/lg: split view (lista + detalle simultáneos).

---

## T.2 — Pantalla/Panel: Detalle de tarea de aprobación

```
Ruta: /aprobaciones/{idSolicitud}   Roles: Aprobador / Delegado / Suplente / Observador
Relacionado: CU-APRO-03 | RN-APRO-07, RN-APRO-08, RN-APRO-09, RN-APRO-11, RN-APRO-25
Objetivo: revisar el objeto, ver el historial del flujo y decidir.
```

**Layout (panel de detalle — organismo genérico):**
```
┌─────────────────────────────────────────────────────────┐
│ [Badge estado] Ascenso Senior · A. Pérez (T-Lima01)      │
│ Solicitante: GZ M. Soto · Ingresó: 28-MAY 09:14          │
│ SLA: vencida hace 2 h  [danger]                          │
├─────────────────────────────────────────────────────────┤
│ RESUMEN DEL OBJETO (provisto por el módulo solicitante)  │
│  · Datos clave del objeto (periodo, colaborador, etc.)   │
│  · [Para Ascenso: panel de cumplimiento 6 meses → T.6]   │
├─────────────────────────────────────────────────────────┤
│ HISTORIAL DEL FLUJO                                       │
│  N1 GZ envió · 28-MAY 09:14                               │
│  N2 GG (pendiente) — usted                                │
│  (decisiones, comentarios, delegación, escalamiento)      │
├─────────────────────────────────────────────────────────┤
│ ACCIONES (condicionadas por rol y segregación)            │
│  [ Rechazar ]                         [ Aprobar ]         │
└─────────────────────────────────────────────────────────┘
```

**Secciones:**
1. **Cabecera:** badge de estado (catálogo del design system), tipo de flujo, objeto, solicitante, fecha de ingreso, SLA restante (color + texto). Si VENCIDA, marca explícita.
2. **Resumen del objeto:** contenido que aporta el módulo solicitante (p. ej., resumen del rol semanal de la zona, periodo de licencia, periodo de vacaciones a anular, o el panel de cumplimiento del ascenso — T.6). Solo el mínimo necesario para decidir (privacidad por defecto).
3. **Historial del flujo:** niveles en orden con su estado, decisiones, comentarios, delegaciones y escalamientos (timeline accesible).

**Acciones por comportamiento:**
- **Aprobar:** botón en **color positivo (success)** — no negro/neutro (P-04). Si la plantilla del nivel exige comentario, lo pide como obligatorio; si no, comentario opcional. Confirmación con texto que nombra la acción concreta ("Aprobar solicitud"). Al confirmar → callback al módulo (efecto de negocio) → toast success (`aria-live`) → la tarea sale de la bandeja.
- **Rechazar (H-10):** abre campo **"Motivo del rechazo" (obligatorio)** con contador de caracteres; el botón "Confirmar Rechazo" permanece **deshabilitado** hasta que haya texto (error inline, no alert). Al confirmar → política de reenvío del flujo (p. ej., Rol = REINICIO total al GZ) → notificación al solicitante con el motivo. Aplica a todos los flujos: Rol, LSGH/LCGH, descanso médico, **anulación de vacaciones (H-09)** y Ascenso.
- **Cancelar** (solicitante/módulo, CU-APRO-07): disponible solo para el solicitante de su propia solicitud en curso; exige motivo obligatorio; retira las tareas pendientes de las bandejas.

**Segregación de funciones visible (H-06, transversal — refuerza RN-APRO-12 y, en Ascenso, RN-ASCE-18):**
- Si el usuario actual **es el solicitante** de la tarea, las acciones Aprobar/Rechazar **no se muestran** — el solicitante **no ve "Aprobar"**; en su lugar, banner informativo + detalle en modo lectura que explica **quién** debe resolver. Ver T.5/T.6 (Ascenso) para el caso de auto-solicitud del GG y el rol R-GG-SUP. Para Ascenso el solicitante es **AV** (H-02): AV inicia, no resuelve.

**Estados de pantalla:**
- Pendiente (mío): acciones activas.
- Pendiente (no mío / observador): detalle en lectura, sin acciones, con nota de a quién corresponde.
- Resuelta por otro (concurrencia, E1): al intentar decidir, mensaje "Esta tarea ya fue resuelta. Estado actual: [estado]." y refresco.
- Callback del módulo falla (E2, RN-APRO-14): la decisión se conserva; banner warning "La decisión se registró. La aplicación del efecto está pendiente y se reintentará." (no se pierde la decisión).
- Vencida (SLA superado): badge danger; sigue siendo aprobable/rechazable.

**Accesibilidad:**
- El panel es una región con `aria-label` del objeto; el historial es una lista/timeline navegable.
- Modal de confirmación = `dialog` con foco atrapado, título y descripción asociados; al cerrar, foco vuelve al botón origen.
- El campo de motivo de rechazo usa `aria-required="true"` y `aria-describedby` para el contador y el error; al intentar confirmar vacío, el foco va al campo y se anuncia el error.

---

## T.3 — Delegación y suplencia (CU-APRO-05; base en Seguridad ENT-MOD-SEGU-001)

```
Ruta: /aprobaciones/delegaciones   Roles: Aprobador titular (sobre sí), ADM (en nombre de)
Relacionado: RN-APRO-15, RN-APRO-20 ; Seguridad: delegación/suplencia
Objetivo: transferir temporalmente la facultad de decidir.
```

**Pantalla — gestión de delegaciones:**
```
┌──────────────────────────────────────────────────────────┐
│ Delegaciones de aprobación                                │
├──────────────────────────────────────────────────────────┤
│ [ + Nueva delegación ]                                    │
│ Delegado        │ Alcance         │ Vigencia       │ Estado│
│ R-GG-SUP J. Vela│ Todos los flujos│ 01–07 JUN      │ Activa│  [Revocar]
│ Bienestar L. Ríos│ Descanso médico│ 03 JUN         │ Activa│  [Revocar]
└──────────────────────────────────────────────────────────┘
```

**Formulario "Nueva delegación":**
- **Delegado** (buscador de usuario) · **Alcance** (Todos los flujos / Tipos específicos → multiselección de tipos) · **Vigencia** (fecha desde / fecha hasta).
- Validación de **compatibilidad de rol** (RN-APRO-20): si el delegado no tiene rol compatible con el nivel delegado, error inline "El usuario seleccionado no tiene un rol compatible con esta delegación."
- Confirmación → la delegación queda Activa; el delegado es notificado; las nuevas tareas (y, según configuración, las pendientes) aparecen en su bandeja.
- **Revocar:** confirmación → las tareas vuelven al titular.

**Suplencia (GG Suplente — R-GG-SUP):**
- La **asignación y vigencia del rol R-GG-SUP** se administran en el módulo de **Seguridad** (no en esta pantalla). Aquí se refleja como una delegación/suplencia vigente que enruta tareas al suplente.
- Indicador visible en la bandeja del suplente: cada tarea recibida por suplencia muestra una etiqueta "Como GG Suplente" para transparencia y auditoría.
- Toda decisión tomada por delegado/suplente queda en auditoría identificando a titular + actor efectivo (RN-APRO-25, RN-ASCE-19).

**Accesibilidad:** tabla semántica; estados con texto + color; el badge de vigencia incluye fechas explícitas (no solo "Activa").

> **Nota de cumplimiento:** delegación y suplencia pueden eludir el control de "aprobador titular" si se configuran mal. La UI muestra siempre alcance + vigencia y exige confirmación; la activación para flujos de aprobación requiere validación PO/TI (ver `REQUIERE VALIDACIÓN COMPLIANCE` en Seguridad/Aprobaciones).

---

## T.4 — Historial de aprobaciones (CU-APRO-08)

```
Roles: GZ (su zona), GG, AV, ADM | RN-APRO-23, RN-APRO-24
```
- Tabla con filtros: tipo de flujo, módulo, estado, solicitante, aprobador, rango de fechas. Ámbito por rol aplicado automáticamente (GZ filtrado a su zona).
- Clic en una solicitud → traza completa (niveles, decisiones, comentarios, delegaciones, escalamientos, consecuencias, callbacks).
- **Exportar a Excel** respetando filtros y ámbito; la exportación queda auditada.
- Estado vacío: "No se encontraron solicitudes para los criterios seleccionados."

> **VUX-T-02 — Aprobaciones en lote:** el documento funcional deja abierto (VAC-APRO-15) si el GG aprueba varias solicitudes a la vez. La UI está **preparada** (checkbox de selección múltiple en T.1 + barra de acción "Aprobar seleccionadas"), pero el lote y el manejo de comentarios por lote requiere decisión del PO antes de activarlo.

---

# (b) PANEL DE ASCENSO SENIOR

> **(H-02/H-04) Reubicación y actor.** El ascenso a Senior **ya NO se inicia desde Gestión de Equipos**. Se inicia y resuelve dentro de **Aprobaciones**. El **promotor/solicitante es Administración de Ventas (AV)**; el aprobador es el **GG** (con **GG Suplente R-GG-SUP** para segregación). En las listas de personal de Gestión de Equipos solo aparece un **badge "Senior" de solo lectura** (no una acción). El ícono de la acción de ascenso es **▲** (unificado web + móvil); la **estrella ★ queda eliminada** (se confundía con "favorito"). Un ascenso a Senior **no tiene tienda destino ni confirmación directa**: es promoción al flag Senior sujeta al panel de 6 meses + aprobación GG + segregación + SLA.

## Mapa de experiencia

```
AV inicia solicitud de ascenso (▲, en Aprobaciones) ──► snapshot 6 meses ──► "Pendiente de Aprobación"
                                                                                      │
                          GG (o GG Suplente) revisa ──► panel cumplimiento 6 meses ──┘ (obligatorio)
                                                            │
                          Segregación (H-06): solicitante (AV) NO resuelve;
                          auto-solicitud de GG → solo R-GG-SUP resuelve
                                                            ▼
                                            Aprobar (RMS SENIOR=SI) / Rechazar (motivo oblig.)
```

---

## T.5 — Iniciar solicitud de ascenso desde Aprobaciones (H-02/H-04)

```
Plataforma: web (Aprobaciones) + app móvil (categoría "Solicitudes")   Actor solicitante: Administración de Ventas (AV)
Relacionado: CU-ASCE-01 | RN-ASCE-01..06, RN-ASCE-23, RN-ASCE-24, RN-ASCE-30, ENT-MOD-ASCE-001 (actor=AV)
Objetivo: iniciar la solicitud de ascenso a Senior de un asesor desde Aprobaciones (no desde Gestión de Equipos).
```

> **(H-02) Cambio respecto a v1.0:** la acción **ya no está en el perfil del asesor de Gestión de Equipos**. En Gestión de Equipos el asesor solo muestra el **badge "Senior" de solo lectura** (cuando aplica). El inicio del ascenso vive en **Aprobaciones**, lo ejecuta **AV** mediante la acción **▲ "Solicitar ascenso a Senior"**.

**Layout — nueva solicitud de ascenso (Aprobaciones, web/móvil):**
```
┌─────────────────────────────────────────────┐
│ Aprobaciones › Solicitudes › Nuevo ascenso   │
│ ─────────────────────────────────────────────│
│ Candidato:  [ 🔍 Buscar asesor… ]            │   ← buscador recortado por ámbito (RBAC)
│   A. Pérez · Asesor · T-Lima01 · Cadena      │
│   [Senior: NO]   (badge solo lectura)        │
│ ─────────────────────────────────────────────│
│   [ ▲ Solicitar ascenso a Senior ]           │   ← acción ▲ (NO ★)
│ ─────────────────────────────────────────────│
│ (Al confirmar: snapshot de cumplimiento 6m)  │
└─────────────────────────────────────────────┘
```

**Acción ▲ — condiciones de visibilidad (RN-ASCE-05, RN-ASCE-04, RN-ASCE-01):**
- **Se muestra/habilita** solo si: el usuario es **AV** (promotor) dentro de su ámbito, candidato **activo** en RMS, **flag Senior = NO**, **puesto habilitado** (catálogo de Maestros), y no se supera el límite de pendientes si está activo.
- **No se muestra** si el puesto no está habilitado (RN-ASCE-04 / A5) o si el flag ya es Senior (en ese caso solo se ve el badge "Senior").
- El ícono es **▲** (unificado web + móvil — H-04). La **★ no se usa**.

**Flujo:**
1. AV busca al candidato (buscador recortado por ámbito — RBAC, H-05) y pulsa **▲ "Solicitar ascenso a Senior"**.
2. **Diálogo de confirmación:** *"¿Desea solicitar el ascenso a Senior para A. Pérez? Esta acción generará una solicitud para Gerencia General."* → "Confirmar" / "Cancelar".
3. Al confirmar, validaciones en tiempo real contra RMS; si OK, se captura el **snapshot del historial de cumplimiento de los últimos 6 meses** y se crea la solicitud en estado "Pendiente de Aprobación", visible en la bandeja del GG.
4. Mensaje de éxito: *"La solicitud de ascenso ha sido enviada a Gerencia General correctamente."*

**Mensajes y errores (microcopy literal del análisis):**
- Ya es Senior (A1): "El colaborador ya cuenta con la categoría Senior. No es posible generar una nueva solicitud."
- Ya hay pendiente (A2): "Ya existe una solicitud de ascenso pendiente para este colaborador. Espere la resolución antes de generar una nueva."
- Inactivo (A4): "El colaborador no está activo en el sistema. No es posible generar una solicitud de ascenso."
- Puesto no habilitado (A5): "El puesto del colaborador no está habilitado para el ascenso a Senior."
- Límite de pendientes (A6): "Ha alcanzado el número máximo de solicitudes de ascenso pendientes permitidas. Espere la resolución de las solicitudes en curso."
- RMS no responde (E1): "No es posible validar el estado del colaborador en este momento. Intente nuevamente más tarde."

**Privacidad / cumplimiento:** `⚠️ DATO SENSIBLE` — el historial de cumplimiento es dato de desempeño personal; solo accesible a GG, R-GG-SUP, GZ del ámbito del candidato y AV, y exclusivamente para la decisión de ascenso. No se exporta fuera del módulo.

**Accesibilidad móvil:** botón ▲ con `aria-label` "Solicitar ascenso a Senior para A. Pérez"; diálogo `role="dialog"` con foco atrapado; tap targets ≥ 44px. El badge "Senior" de solo lectura se anuncia como estado, no como control.

> **Nota de iconografía (H-04):** la acción de ascenso usa **▲** en web y móvil. La **estrella ★ queda retirada** de cualquier acción de ascenso (se interpretaba como "favorito"). En Gestión de Equipos no existe ningún control de ascenso; solo el badge "Senior".

---

## T.6 — Detalle de solicitud + panel de cumplimiento (6 meses) + resolución

```
Plataforma: web (resolución cómoda) + app móvil    Actores: GG, R-GG-SUP, GZ/AV (lectura)
Relacionado: CU-ASCE-02, CU-ASCE-03, CU-ASCE-04 | RN-ASCE-06, RN-ASCE-18, RN-ASCE-19, RN-ASCE-25, RN-ASCE-26, RN-ASCE-21
Objetivo: revisar el cumplimiento del candidato y resolver (aprobar/rechazar) con segregación de funciones.
```

**Layout (web):**
```
┌───────────────────────────────────────────────────────────────────┐
│ [Badge: Pendiente de Aprobación]   Ascenso Senior · A. Pérez       │
│ Candidato: A. Pérez · Asesor · T-Lima01 · Cadena                   │
│ Solicitante: AV C. Díaz · 28-MAY 2026 09:14                        │
│ SLA: vence en 2 días hábiles  [warn]   (o [VENCIDA] danger)        │
├───────────────────────────────────────────────────────────────────┤
│ HISTORIAL DE CUMPLIMIENTO — ÚLTIMOS 6 MESES  (OBLIGATORIO, no ocultable)│
│ Snapshot capturado: 28-MAY 2026 09:14   [ Actualizar historial ]   │
│ ┌─────────┬────────┬────────┬───────────┬──────────┐               │
│ │ Mes     │ % Cuota│ % Senior│ % Asesoría*│ % Tesoro*│  *solo Lukers │
│ │ DIC 25  │ 98.4 🔴│ s/hist  │            │          │               │
│ │ ENE 26  │101.2 🔵│ 100.5 🔵│            │          │               │
│ │ ...     │        │        │            │          │               │
│ │ MAY 26  │103.0 🔵│  99.1 🔴│            │          │               │
│ └─────────┴────────┴────────┴───────────┴──────────┘               │
│ Leyenda (P-02): 🔵 ≥100% · 🔴 <100% · s/hist = sin historial Senior │
├───────────────────────────────────────────────────────────────────┤
│ ACCIONES (segregación de funciones H-06)                           │
│   [ Rechazar ]   [ Comentarios (opcional) ]   [ Aprobar ◗verde◗ ]  │
└───────────────────────────────────────────────────────────────────┘
```

**Panel de cumplimiento (OBLIGATORIO — H-02/RN-ASCE-23, RN-ASCE-06, RN-ASCE-25):**
- Siempre visible, **no ocultable**, en la vista de solicitud y de evaluación. **Vive exclusivamente en Aprobaciones** (no en Gestión de Equipos) y es el sustento de la decisión del GG.
- Junto al panel se muestra la **leyenda del color de números** (P-02): 🔵 ≥100% / 🔴 <100% / "s/hist" sin historial Senior.
- Tabla mensual de los **últimos 6 meses** (ventana fija). Por mes:
  - **% cumplimiento de cuota como Asesor**.
  - **% cumplimiento como Senior** (si tuvo roles/encargaturas Senior previas; si no, "Sin historial Senior", no 0%).
  - **Lukers además:** **% Asesoría** y **% Tesoro** (consistente con tipo de venta). En Cadena estas columnas no aparecen.
- Formato: **1 decimal**; **≥100% en azul** (`color.info.fg` 🔵) / **<100% en rojo** (`color.danger.fg` 🔴), siempre con el valor numérico (no solo color) — consistente con los ratios del Rol.
- **Snapshot:** se muestra el dato congelado al momento de la solicitud, indicando la **fecha de captura**. Botón **"Actualizar historial"** refresca a datos frescos de RMS (reemplaza el snapshot, deja traza en auditoría).
- No hay umbral automático de bloqueo: la **decisión es del GG** con base en este panel.

**Resolución — segregación de funciones (RN-ASCE-18, RN-ASCE-19) — comportamiento por rol:**

| Caso | Quién ve la solicitud | Botones Aprobar/Rechazar |
|---|---|---|
| Solicitud creada por **AV** (caso normal, H-02) | GG (distinto del solicitante), AV (solicitante, **lectura**), GZ ámbito (lectura) | **GG titular** ve Aprobar/Rechazar activos |
| Solicitud creada por **GG** (auto-solicitud excepcional) | GG titular (incluido el solicitante) y AV en **modo lectura**; **R-GG-SUP** puede resolver | **Solo R-GG-SUP** ve Aprobar/Rechazar activos |
| Usuario = **solicitante** de la tarea (AV o GG) | Detalle en lectura | Acciones **no se muestran** (H-06: el solicitante no ve "Aprobar") |

- El **solicitante (AV)** ve el detalle en **modo lectura** con banner: *"Usted generó esta solicitud. La resolución corresponde a Gerencia General."*
- Cuando la solicitud fue originada por un GG, los GG titulares (y el propio solicitante) ven el detalle en **modo lectura** con **banner informativo**: *"Esta solicitud fue generada por Gerencia General. Debe ser resuelta por un Gerente General Suplente (R-GG-SUP)."*
- El usuario con rol **R-GG-SUP** ve los botones activos y, al resolver, queda registrado en auditoría con la condición "como GG Suplente".

**Aprobar (CU-ASCE-02):**
- Botón "Aprobar" en **color positivo (success/verde)** (P-04) → campo opcional "Comentarios" → diálogo de confirmación *"¿Confirma la aprobación del ascenso a Senior para A. Pérez?"*.
- Al confirmar, operación **atómica con RMS** (RN-ASCE-07): si RMS responde OK → estado "Aprobada", flag SENIOR=SI, notificación al **solicitante AV** (y GZ del ámbito) y **al colaborador** (felicitación), mensaje "El ascenso ha sido aprobado. El colaborador ya está habilitado como Senior en el sistema." El badge "Senior" de solo lectura aparece a partir de ese momento en Gestión de Equipos.
- Si RMS falla (A1/E1): no cambia el estado; banner danger *"No fue posible actualizar el estado Senior en RMS. La solicitud permanece pendiente."* + opción de reintento; el intento queda en auditoría.
- No hay "Deshacer aprobación" (RN-ASCE-08): el descenso se gestiona externamente en RMS y Nova solo lo refleja (T.7).

**Rechazar (CU-ASCE-03):**
- Botón "Rechazar" → campo **"Motivo del rechazo" (obligatorio)** + contador (máx. parametrizable); "Confirmar Rechazo" deshabilitado hasta texto.
- Sin motivo (A1): "El motivo del rechazo es obligatorio. Por favor ingrese un comentario."
- Al confirmar → estado "Rechazada", notificación al **solicitante AV** con el motivo; AV puede generar una nueva solicitud en el futuro.

**Estados de la solicitud (badges del catálogo del design system):**
- **Pendiente de Aprobación** (warning) — resoluble.
- **Pendiente de Aprobación (Vencida)** (danger, ⏱) — superó el SLA (5 días hábiles por defecto); **sigue siendo resoluble**; al aprobar/rechazar fuera de plazo se audita "fuera de SLA". Alerta automática a GG/GZ/AV.
- **Aprobada** (success) — terminal, solo lectura.
- **Rechazada** (danger) — terminal, solo lectura, regenerable a futuro.
- **Cerrada por cambio externo** (neutral, ⊘) — RMS modificó el flag durante la pendencia; cierre automático con motivo "Flag Senior modificado externamente".

**Accesibilidad:**
- La tabla de cumplimiento es `<table>` semántica con `caption` "Historial de cumplimiento — últimos 6 meses"; los porcentajes incluyen texto del valor (el color rojo/azul es refuerzo, no único canal); las celdas "Sin historial Senior" se anuncian como tal.
- Banner de segregación con `role="status"`; cuando las acciones no se muestran, se explica por qué (no se deja al usuario adivinar).
- Diálogos de confirmación con foco atrapado; campo de motivo con `aria-required` y error asociado.

**Responsive:**
- web (md/lg): tabla de 6 meses cómoda; split o pantalla completa.
- móvil (xs/sm): la solicitud puede iniciarse (por AV, dentro de la categoría "Solicitudes") y resolverse desde móvil; la tabla de 6 meses se presenta con scroll horizontal o como lista por mes (mes → métricas), manteniendo el valor numérico y el color de refuerzo. Acciones fijas al pie.

---

## T.7 — Historial de solicitudes de ascenso (CU-ASCE-04) y descenso (CU-ASCE-05)

```
Roles: GZ (su zona), GG, AV | RN-ASCE-14..17
```
- **Listado** por defecto: solicitudes del mes en curso, orden descendente por fecha. Filtros: empresa, tienda, código de empleado, **solicitante (AV)**, estado, rango de fechas (combinables).
- Columnas: Empresa · Tienda base · Código · Nombre · Puesto · **Solicitante (AV)** · Fecha solicitud · Estado · Fecha resolución. (H-02: el promotor es AV, no GZ.)
- Ámbito por perfil (GZ: solo su zona / sus solicitudes; GG y AV: todas). **Exportar a Excel** respeta filtros y ámbito.
- Desde el detalle de una pendiente, GG/R-GG-SUP (no solicitante) acceden directo a Aprobar/Rechazar (T.6).
- **Descenso (CU-ASCE-05):** Nova **no inicia** descensos; los **refleja**. En el historial/auditoría del colaborador se registra "Descenso detectado" (flag SI→NO, origen RMS, fecha) y se notifica a GZ/GG si está habilitado. La UI muestra el evento como entrada de auditoría de solo lectura; el colaborador deja de estar disponible para nuevas asignaciones Senior automáticamente.

**Accesibilidad / privacidad:** el listado y el detalle respetan el ámbito por rol; el historial de cumplimiento no se expone fuera del módulo ni en exportaciones que excedan el ámbito.

---

## Vacíos de UX transversales que requieren decisión del PO

| ID | Pregunta |
|---|---|
| VUX-T-01 | Confirmar que la bandeja es **única transversal** para GG/AV (VAC-APRO-06) — el diseño la asume única; si cada módulo mantiene su vista, cambia la IA. |
| VUX-T-02 | ¿Se habilita **aprobación en lote** desde la bandeja (VAC-APRO-15)? El diseño deja la afordancia preparada (selección múltiple) pero desactivada hasta decisión. |
| VUX-T-03 | Para Ascenso, autoaprobación GG está descartada (se exige R-GG-SUP). Confirmar que **siempre** existirá al menos un R-GG-SUP vigente; si no, definir el comportamiento UX cuando no haya suplente disponible para resolver una auto-solicitud del GG. |
| VUX-T-04 | Definir las "partes interesadas" notificadas por flujo (VAC-APRO-11) para el centro de notificaciones in-app. |
| VUX-T-05 | ¿La resolución de tareas en móvil aplica a **todos** los flujos o solo a los de campo (Rol, Ascenso, códigos), dejando los demás a web? |
| VUX-T-06 | Microcopy/branding de notificaciones push y correo por flujo (pendiente de plantillas de marca). |
