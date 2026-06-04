# Backlog de Épicas — Sistema Nova

| Campo | Valor |
|---|---|
| Documento | Backlog de Épicas (nivel producto) |
| Sistema | Nova — Gestión de Equipos |
| Versión | 1.1 |
| Fecha | 31/05/2026 |
| Elaborado por | Product Owner |
| Estado | PROPUESTA — Pendiente de validación |
| Marco de priorización | **Por valor de negocio** (impacto en la operación diaria de tienda primero), con dependencias y madurez como criterios de desempate. |

### Control de versiones

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.0 | 30/05/2026 | Product Owner | Versión inicial del backlog (10 épicas). |
| 1.1 | 31/05/2026 | Product Owner | Reconciliación UX (reconciliacion-ux.md v1.0): **C-01** EP-09 Ascenso Senior — flujo gestionado en Aprobaciones; promotor/solicitante = AV (antes GZ/GG), aprueba GG con GG Suplente; dependencia explícita de EP-00 (Seguridad) y EP-02 (Aprobaciones). **C-02** EP-05 Descansos — incorpora Licencias como parte del módulo sobre un motor único de "ausencias programadas" con no-cruce transversal compartido con EP-08 Vacaciones. **C-03** EP-06 Encargatura — confirma a Administración Retail como responsable (autoaprobación); GZ/GG solo solicitan desde móvil. |

---

## Cómo leer este backlog

- **10 épicas**, una por módulo del alcance (ver `alcance-nova.md`).
- Orden = prioridad por **valor de negocio** y dependencia de cimiento. EP-00 (Seguridad/Accesos) encabeza por ser el habilitador base del que dependen Aprobaciones y todos los módulos que asumen roles.
- "Valor de negocio" e impacto operativo se califican Alto / Medio / Bajo.
- Las historias listadas son **candidatas de referencia** (sin criterios de aceptación detallados); el desglose completo lo realizará el Analista Funcional / PO en refinamiento.
- Las dependencias indican qué debe existir antes de poder entregar la épica.

---

## Tabla resumen priorizada

| # | Épica | Módulo | Prioridad | Valor de negocio | Fase | Depende de | Madurez análisis |
|---|---|---|---|---|---|---|---|
| EP-00 | Seguridad y Control de Accesos (RBAC) | Seguridad / Accesos | Must | Alto (cimiento) | 0 | EP-01 (catálogos) | Media (v1.0 borrador) |
| EP-01 | Configuración y Maestros transversales | Maestros / Configuración | Must | Alto (habilitador) | 0 | — | Baja-Media |
| EP-02 | Motor de Aprobaciones transversal | Aprobaciones | Must | Alto (habilitador) | 0 | EP-00, EP-01 | Baja-Media |
| EP-03 | Programación del Rol de Personal | Rol de Personal | Must | Muy Alto | 1 | EP-00, EP-01, EP-02 | Alta (borrador) |
| EP-04 | Control de Marcaciones biométricas | Marcaciones | Must | Muy Alto | 1 | EP-01, EP-03 (programación) | Alta (borrador) |
| EP-05 | Gestión de Descansos, Compensaciones y Licencias | Descansos | Must | Alto | 1 | EP-02, EP-03, EP-04 | Alta (borrador) |
| EP-06 | Gestión de Encargaturas | Encargatura | Should | Medio-Alto | 2 | EP-03, EP-05 | Alta (borrador) |
| EP-07 | Gestión de Traslados | Traslados | Should | Medio-Alto | 2 | EP-04, EP-05, EP-06 | Muy Alta (validado) |
| EP-08 | Gestión de Vacaciones | Vacaciones | Should | Medio-Alto | 2 | EP-03, EP-05 (motor de ausencias/no-cruce), EP-07, OFIPLAN | Muy Alta (validado) |
| EP-09 | Ascenso a Senior | Ascenso Senior | Could | Bajo-Medio | 3 | EP-00, EP-02 (flujo en Aprobaciones), EP-03, EP-06 | Baja (12 vacíos abiertos) |

> **Nota de priorización:** EP-00, EP-01 y EP-02 son habilitadores transversales de **Fase 0**: aunque su impacto directo en el usuario es indirecto, su prioridad es Must porque sin ellos no se puede entregar el núcleo. EP-00 (Seguridad/Accesos) encabeza el backlog porque define los roles y ámbitos que el motor de Aprobaciones (EP-02) y todos los módulos consumen; se construye en paralelo con Maestros, que le aporta los catálogos de empresa/zona/tienda.

---

## EP-00 — Seguridad y Control de Accesos (RBAC)

- **Módulo:** Seguridad / Accesos
- **Objetivo de negocio:** controlar quién accede a Nova y qué puede hacer según su rol y ámbito (empresa/zona/tienda), garantizando que las aprobaciones jerárquicas (GZ→GG→GT) y las acciones sensibles se ejecuten solo por el actor autorizado, con autenticación robusta y trazabilidad completa de accesos.
- **Valor de negocio:** Alto (cimiento). Sin la gestión de roles y ámbitos, el motor de Aprobaciones y todos los módulos que asumen roles (GT, GZ, GG, AV, AR, ADM) no pueden operar de forma segura ni auditable. Habilita el flujo VAC-APRO-01.
- **Prioridad:** Must — **Fase 0**
- **Depende de:** EP-01 (catálogos de empresa, zona y tienda para definir el ámbito de cada usuario/rol).
- **Habilita a:** EP-02 (Aprobaciones, que consume roles y jerarquía) y al resto de épicas (EP-03 a EP-09) que asumen roles definidos.
- **Madurez:** Media — **v1.0 BORRADOR**, recién especificado por el Analista Funcional (`ENT-MOD-SEGU-001`, en elaboración). `⚠️ REQUIERE VALIDACIÓN COMPLIANCE` (gestión de identidades y datos personales) y validación de TI sobre el mecanismo de autenticación.
- **Historias candidatas:**
  - Administrar usuarios, roles y permisos (RBAC) con asignación de jerarquía y ámbito por empresa/zona/tienda.
  - Autenticar al usuario y autorizar cada acción según rol y ámbito efectivo.
  - Gestionar delegación/suplencia temporal de un rol (p. ej. GZ que cubre a otro GZ) con vigencia y reversión automática.
  - Registrar auditoría completa de accesos, cambios de permisos y delegaciones.

## EP-01 — Configuración y Maestros transversales

- **Módulo:** Maestros / Configuración
- **Objetivo de negocio:** disponer de los catálogos y parámetros únicos que el resto de módulos consume (feriados, tiendas, puestos, parámetros por empresa) para evitar duplicidad y garantizar consistencia entre Cadena y Lukers.
- **Valor de negocio:** Alto (habilitador). Sin él, ningún módulo puede validar reglas por empresa, feriados ni dotación.
- **Prioridad:** Must — **Fase 0**
- **Depende de:** —
- **Madurez:** Baja-Media. No existe documento de análisis propio; los requisitos están dispersos en los 7 módulos. `⚠️ Requiere consolidación por el Analista Funcional.`
- **Historias candidatas:**
  - Mantener el calendario maestro de feriados (nacionales y locales).
  - Mantener el maestro de tiendas con atributo de ubicación (CC / PC), zona y empresa.
  - Configurar parámetros por empresa (semana laboral, días no compensables, semanas de campaña/alta demanda, tolerancias, plazos/SLA).
  - Mantener catálogo de puestos y límites de descanso/trabajo por puesto.

## EP-02 — Motor de Aprobaciones transversal

- **Módulo:** Aprobaciones
- **Objetivo de negocio:** centralizar los flujos de aprobación (estados, comentarios obligatorios, notificaciones, auditoría) reutilizables por Rol, Descansos, Encargatura, Traslados, Vacaciones y Ascenso.
- **Nota (C-01):** este motor **aloja el flujo completo de Ascenso Senior** (inicio por **AV**, panel de cumplimiento de 6 meses, aprobación de **GG** con **GG Suplente** para segregación y SLA). Ver EP-09.
- **Valor de negocio:** Alto (habilitador). Estandariza el "qué aprueba quién" y evita reimplementar lógica en cada módulo.
- **Prioridad:** Must — **Fase 0**
- **Depende de:** EP-00 (roles, jerarquía y ámbito que definen "quién aprueba qué") y EP-01 (parámetros y SLAs).
- **Madurez:** Baja-Media. Referenciado por todos los módulos pero sin especificación propia. `⚠️ Requiere especificación del motor por el Analista Funcional.`
- **Historias candidatas:**
  - Definir un flujo de aprobación configurable (solicitante → aprobador, con jerarquía GZ→GG).
  - Registrar decisión de aprobación/rechazo con comentarios obligatorios y auditoría.
  - Notificar al solicitante y partes interesadas el resultado de la aprobación.
  - Gestionar SLA/plazos y escalamientos de aprobaciones pendientes.

## EP-03 — Programación del Rol de Personal

- **Módulo:** Rol de Personal
- **Objetivo de negocio:** sustituir la programación manual en hojas de cálculo por un calendario semanal centralizado, trazable y con aprobación jerárquica; es el instrumento operativo central que alimenta a todos los demás módulos.
- **Valor de negocio:** Muy Alto. Define la disponibilidad real de personal por tienda y día; es la base de marcaciones, descansos y encargaturas.
- **Prioridad:** Must — **Fase 1**
- **Depende de:** EP-00 (roles y ámbito de GT/GZ/GG), EP-01 (feriados, tiendas, puestos, parámetros) y EP-02 (flujo GZ→GG→GT).
- **Madurez:** Alta (borrador con VAC-01..25 resueltos; pendiente validación de stakeholders).
- **Historias candidatas:**
  - Visualizar y programar el calendario semanal (domingo–sábado) por tienda/puesto.
  - Ejecutar el flujo de envío y aprobación GZ → GG → GT con plazos y alertas.
  - Calcular y mostrar la cuota aproximada por asesor disponible.
  - Bloquear/desbloquear cajas (vía canal Nova-POS) por incumplimiento de plazos.

## EP-04 — Control de Marcaciones biométricas

- **Módulo:** Marcaciones
- **Objetivo de negocio:** registrar asistencia confiable por huella, integrada con las programaciones activas, con alertas proactivas de inasistencia y control de salida part-time en POS.
- **Valor de negocio:** Muy Alto. Es el control diario de presencia y el insumo de inasistencias/descansos; impacto directo en la operación de cada tienda.
- **Prioridad:** Must — **Fase 1**
- **Depende de:** EP-01 (tolerancias, parámetros), EP-03 (programación activa para validar bloqueos). Incluye el componente de integración Nova-POS.
- **Madurez:** Alta (borrador con 14 VF resueltos; pendiente validación).
- **Historias candidatas:**
  - Enrolar huella y registrar marcación de entrada/salida con validación de programación.
  - Emitir y validar códigos de autorización zonal (web y app móvil).
  - Lanzar alertas Windows de inasistencia y gestionar falta/descanso desde la alerta.
  - Enviar alertas y bloqueo individual al POS para personal part-time.

## EP-05 — Gestión de Descansos, Compensaciones y Licencias

- **Módulo:** Descansos (gestión integral de descansos, compensaciones y licencias)
- **Objetivo de negocio:** centralizar y trazar descansos laborales, compensaciones y licencias, cerrando el ciclo diario (inasistencia → falta o descanso) y controlando saldos.
- **Alcance del módulo (C-02):** **Licencias NO es un módulo aparte: es parte de Descansos.** Descansos, Licencias y Vacaciones (EP-08) comparten un **motor único de "ausencias programadas"** con una sola fuente de verdad de programaciones y **validación de no-cruce transversal**: un empleado **no puede tener dos programaciones de ausencia solapadas** (descanso, compensación, licencia o vacaciones), en web y móvil.
- **Valor de negocio:** Alto. Completa el núcleo operativo diario, evita solapamientos de ausencias y reduce errores de compensación y riesgo de incumplimiento de plazos.
- **Prioridad:** Must — **Fase 1**
- **Depende de:** EP-02 (aprobación de LSGH/LCGH), EP-03 (calendario, único canal de registro), EP-04 (origen de falta/descanso médico).
- **Habilita a:** EP-08 (Vacaciones consume el mismo motor de ausencias y la validación de no-cruce).
- **Madurez:** Alta (borrador v1.2 con 2 rondas de vacíos resueltos; pendiente validación de PO).
- **Historias candidatas:**
  - Registrar descanso laboral y sugerencia automática desde el calendario del Rol.
  - Gestionar compensaciones con propuesta de 3 fechas según Tabla 04 por empresa.
  - Ejecutar el flujo de descanso médico con validación de Bienestar.
  - Gestionar licencias (médica, LSGH, LCGH) con aprobación y firma electrónica, en web y móvil.
  - Validar no-cruce transversal de ausencias (ninguna programación solapada por empleado) antes de registrar descanso/licencia/vacaciones.

## EP-06 — Gestión de Encargaturas

- **Módulo:** Encargatura
- **Objetivo de negocio:** registrar y controlar las coberturas de tienda y por tipo de venta del personal Senior, evitando dobles asignaciones y aplicando reglas por empresa.
- **Actor responsable (C-03):** el **responsable de gestionar y confirmar la encargatura es Administración Retail (AR)**, con **autoaprobación (sin comité)** — se mantiene conforme al spec `ENT-MOD-ENCA-001`. Cualquier acción de encargatura desde la **app móvil de GZ/GG es solo una SOLICITUD** que **AR confirma**; la escritura/confirmación efectiva (programar, editar, carga masiva) permanece en AR.
- **Valor de negocio:** Medio-Alto. Da visibilidad y control sobre coberturas que impactan cuota y nómina; muy acoplado al Rol.
- **Prioridad:** Should — **Fase 2**
- **Depende de:** EP-03 (creación automática de coberturas desde el calendario, integración síncrona), EP-05 (validación de descanso activo).
- **Madurez:** Alta (borrador con VAC-01..12 resueltos; pendiente validación).
- **Historias candidatas:**
  - Crear/editar/anular encargaturas (manual y automática desde el Rol) con validaciones — ejecutadas/confirmadas por Administración Retail.
  - Solicitar encargatura desde la app móvil (GZ/GG) para que Administración Retail la confirme.
  - Carga masiva de encargaturas vía Excel con validación fila por fila (AR).
  - Transición automática de estados (Programado → En Ejecución → Culminado).
  - Vista de supervisión para GZ/GG y exportación a Excel.

## EP-07 — Gestión de Traslados

- **Módulo:** Traslados
- **Objetivo de negocio:** formalizar los movimientos de personal entre tiendas con firma de adenda, replicación de huella y sincronización con RMS/OFIPLAN, evitando conflictos con programaciones.
- **Valor de negocio:** Medio-Alto. Asegura continuidad operativa y cumplimiento legal del cambio de centro de labores.
- **Prioridad:** Should — **Fase 2**
- **Depende de:** EP-04 (replicación de huella, bloqueo/habilitación de marcación), EP-05 (validación bidireccional), EP-06 (anulación de encargaturas futuras).
- **Madurez:** Muy Alta — **VALIDADO** (VAC-TRAS-01..14 resueltos). Listo para diseño.
- **Historias candidatas:**
  - Registrar traslado temporal con validaciones y retorno automático al vencer.
  - Registrar traslado permanente con flujo de firma electrónica de adenda.
  - Replicar huella a tienda destino y gestionar bloqueo/habilitación de marcación.
  - Consultar historial de traslados con filtros y auditoría.

## EP-08 — Gestión de Vacaciones

- **Módulo:** Vacaciones
- **Objetivo de negocio:** controlar el estado vacacional (pendientes/indemnizables/truncos) desde OFIPLAN, registrar periodos con firma electrónica y mitigar el riesgo legal/económico.
- **Valor de negocio:** Medio-Alto. Reduce el riesgo de días indemnizables y garantiza dotación mínima durante periodos vacacionales.
- **Prioridad:** Should — **Fase 2**
- **Depende de:** EP-03 (reflejo en calendario), EP-05 (**motor único de ausencias programadas y validación de no-cruce transversal**), EP-07 (validación de traslados), OFIPLAN (saldos) y Firma Electrónica.
- **Nota de frontera (C-02):** Vacaciones conserva su especificidad (saldos OFIPLAN, indemnizables, Mes Obligatorio, firma) pero **se programa sobre el mismo motor/calendario de ausencias de EP-05** y respeta la misma regla de no-cruce.
- **Madurez:** Muy Alta — **VALIDADO** (VAC-VAC-01..22 resueltos). Listo para diseño.
- **Historias candidatas:**
  - Visualizar estado vacacional del personal desde OFIPLAN en tiempo real.
  - Sugerencia automática de salida según reglas (indemnizables, dotación mínima).
  - Registrar periodo de vacaciones con validación bidireccional (Traslados/Descansos) y firma electrónica.
  - Alertar por Mes Obligatorio y umbral de días indemnizables.

## EP-09 — Ascenso a Senior

- **Módulo:** Ascenso Senior
- **Objetivo de negocio:** formalizar y trazar el ascenso de asesores a Senior con evaluación de cumplimiento y aprobación de GG, actualizando el flag SENIOR en RMS.
- **Dónde vive el flujo (C-01):** el **flujo de ascenso se gestiona dentro del módulo de Aprobaciones**, **no en Gestión de Equipos**. En Gestión de Equipos solo se muestra un **badge "Senior" de solo lectura**; no hay confirmación directa ni "tienda destino".
- **Actores (C-01):** el **promotor/solicitante es Administración de Ventas (AV)** (antes se asumía GZ/GG); el **aprobador es el GG**, con **GG Suplente (R-GG-SUP)** para segregación cuando el GG sea a la vez parte interesada.
- **Valor de negocio:** Bajo-Medio. Apoya el desarrollo de talento, pero su impacto en la operación diaria de tienda es el menor de los nueve.
- **Prioridad:** Could — **Fase 3**
- **Depende de:** **EP-00** (roles/ámbito y rol GG Suplente para segregación), **EP-02** (el flujo de ascenso se aloja en Aprobaciones: panel de 6 meses, estados, comentarios, SLA, auditoría), EP-03 y EP-06 (consumen el flag Senior resultante).
- **Madurez:** Baja — INCOMPLETO. **12 vacíos ABIERTOS** (VAC-ASCE-01 a 12), varios de impacto Alto (criterio mínimo de elegibilidad, descenso/revocación). `⚠️ No priorizar para build hasta resolver los vacíos abiertos.` `⚠️ REQUIERE VALIDACIÓN COMPLIANCE` (datos de desempeño del colaborador).
- **Historias candidatas:**
  - Iniciar solicitud de ascenso desde el módulo de Aprobaciones (promotor **Administración de Ventas**).
  - Presentar a GG el panel de cumplimiento de 6 meses del candidato.
  - Aprobar/rechazar con comentarios obligatorios y segregación (GG Suplente cuando aplique); actualizar el flag SENIOR en RMS.
  - Consultar historial de solicitudes con filtros y auditoría.

---

## Riesgos y observaciones del backlog

| # | Observación | Propuesta de resolución |
|---|---|---|
| R-01 | ~~**Seguridad/Accesos** no es ninguna épica pero es bloqueante.~~ **MITIGADO / RESUELTO.** | **Resuelto por decisión de la usuaria:** Seguridad/Accesos se incorporó al alcance como **EP-00** (Fase 0, Must), se construye desde cero y se especifica en `ENT-MOD-SEGU-001`. Riesgo residual: validación COMPLIANCE del manejo de identidades y confirmación de TI sobre el mecanismo de autenticación. |
| R-02 | EP-01 y EP-02 no tienen documento de análisis propio. | El Analista Funcional debe consolidar sus requisitos a partir de los 7 módulos antes de iniciar Fase 1. |
| R-03 | EP-09 (Ascenso) tiene 12 vacíos abiertos, 4 de impacto Alto. | Resolver vacíos con stakeholders antes de cualquier estimación; mantener en Fase 3. |
| R-04 | Integraciones RMS / OFIPLAN / POS sin confirmación de TI. | `PENDIENTE APROBACIÓN TI` — confirmar endpoints y SLAs antes de fijar el roadmap definitivo. |
| R-05 | KPIs del producto sin línea base cuantificada. | Definir valor actual, meta y plazo con el sponsor en sesión de OKRs. |
| R-06 | (C-01) El flujo de Ascenso Senior pasa a vivir en Aprobaciones (EP-02) con promotor AV y segregación GG/GG Suplente; varios de los 12 vacíos de EP-09 lo afectan. | El Analista Funcional debe actualizar `ENT-MOD-ASCE-001` y `ENT-MOD-APRO-001` para alojar el flujo en Aprobaciones, fijar AV como promotor y modelar la segregación GG Suplente, antes de estimar EP-09. |
| R-07 | (C-02) El motor único de "ausencias programadas" con no-cruce transversal acopla EP-05 (Descansos/Licencias) y EP-08 (Vacaciones); su diseño debe ser único. | El Analista Funcional debe consolidar la regla de no-cruce en `ENT-MOD-DESC-001` y `ENT-MOD-VAC-001` como una sola fuente de verdad de programaciones de ausencia. |
| R-08 | (C-03) Riesgo de scope creep si la app móvil de GZ/GG ejecuta encargaturas directamente en lugar de solo solicitarlas. | Mantener a Administración Retail como único confirmador (autoaprobación); la móvil de GZ/GG solo genera solicitudes. Verificar en `ENT-MOD-ENCA-001`. |
