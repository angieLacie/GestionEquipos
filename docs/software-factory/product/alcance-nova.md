# Documento de Alcance Global — Sistema Nova

| Campo | Valor |
|---|---|
| Documento | Alcance Global del Producto |
| Sistema | Nova — Gestión de Equipos |
| Organización | Grupo retail peruano (cadenas Cadena / Lukers) |
| Versión | 1.1 |
| Fecha | 31/05/2026 |
| Elaborado por | Product Owner |
| Estado | PROPUESTA — Pendiente de validación de la usuaria/sponsor |
| Documentos base | ENT-MOD-MARC-001 v1.1, ENT-MOD-DESC-001 v1.2, ENT-MOD-ROLP-001 v1.1, ENT-MOD-ENCA-001 v1.1, ENT-MOD-TRAS-001 v1.1, ENT-MOD-VAC-001 v1.1, ENT-MOD-ASCE-001 v1.0, ENT-MOD-SEGU-001 v1.0 (en elaboración), reconciliacion-ux.md v1.0 |

### Control de versiones

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.0 | 30/05/2026 | Product Owner | Versión inicial del alcance global (10 módulos, 3 fases + Fase 0). |
| 1.1 | 31/05/2026 | Product Owner | Reconciliación UX (reconciliacion-ux.md v1.0): **C-01** Ascenso Senior se gestiona en el módulo de Aprobaciones; promotor/solicitante = Administración de Ventas (AV), aprueba GG con GG Suplente para segregación. **C-02** Licencias/Descansos/Vacaciones comparten un motor único de "ausencias programadas" con validación de no-cruce transversal; Licencias es parte del módulo de Descansos. **C-03** Encargatura: se confirma que el responsable de gestionar/confirmar es Administración Retail (autoaprobación, sin comité); las acciones desde la app móvil de GZ/GG son solo solicitudes. |

---

## 1. Visión del producto

> **Para** las gerencias de tienda, zonales y la administración central del grupo retail peruano (Cadena y Lukers, ~100 tiendas), **que** necesitan programar, controlar y trazar la operación diaria de su personal de forma centralizada, **Nova** es una **plataforma de gestión de equipos de tienda** (web + móvil + biometría) **que** integra en un solo sistema la programación del rol, las marcaciones biométricas, los descansos, las encargaturas, los traslados, las vacaciones y los ascensos, con flujos de aprobación y firma electrónica trazables. **A diferencia de** la gestión actual fragmentada en hojas de cálculo, correos y un control biométrico aislado, **Nova** automatiza las validaciones de negocio en tiempo real, sincroniza con los sistemas corporativos (RMS, OFIPLAN, POS) y garantiza la auditoría completa de cada decisión operativa.

---

## 2. Objetivos del producto

| # | Objetivo de negocio | Indicador asociado |
|---|---|---|
| OBJ-01 | Centralizar la programación semanal del personal y eliminar la gestión en hojas de cálculo. | % de tiendas operando el rol en Nova |
| OBJ-02 | Asegurar el control de asistencia confiable e integrado con las programaciones activas. | % de marcaciones validadas contra programación |
| OBJ-03 | Reducir el riesgo operativo de sub/sobre-dotación de tienda mediante validaciones automáticas. | N.º de incidencias de dotación mínima incumplida |
| OBJ-04 | Garantizar trazabilidad y auditoría completa de descansos, traslados, encargaturas y vacaciones. | % de eventos con registro de auditoría completo |
| OBJ-05 | Controlar el riesgo legal/económico de vacaciones indemnizables y de firmas pendientes. | Días indemnizables a la vista / firmados en plazo |
| OBJ-06 | Estandarizar los flujos de aprobación jerárquica (GZ → GG → GT) con plazos y consecuencias. | % de aprobaciones dentro de plazo |

**Nota de KPIs:** los indicadores anteriores deben ser cuantificados (valor actual, meta y plazo) durante la fase de OKRs con el sponsor. Hoy NO se dispone de la línea base; queda registrado como supuesto en `supuestos-restricciones.md`.

---

## 3. Alcance incluido (10 módulos)

El sistema Nova se construye con **10 módulos**: los 7 módulos especificados funcionalmente más **3 módulos transversales** decididos por la usuaria (Aprobaciones, Maestros/Configuración y Seguridad/Accesos).

### 3.1 Módulos funcionales (7)

| # | Módulo | Propósito resumido | Documento |
|---|---|---|---|
| 1 | **Rol de Personal** | Calendario semanal de programación (domingo–sábado), flujo de aprobación GZ→GG→GT, cuota por asesor, único canal de registro de descansos/compensaciones y de cobertura de tienda. | ENT-MOD-ROLP-001 |
| 2 | **Marcaciones** | Enrolamiento y registro biométrico de entrada/salida, bloqueo por programación activa, autorización zonal, alertas Windows, alertas/bloqueo POS para part-time. | ENT-MOD-MARC-001 |
| 3 | **Descansos (gestión integral de descansos, compensaciones y licencias)** | Descansos laborales, compensaciones y **licencias (médica, LSGH, LCGH)** sobre un **motor único de "ausencias programadas"** compartido con Vacaciones, con **validación de no-cruce transversal**, flujo Bienestar y firma electrónica. Sin calendario propio (se registra desde el Rol). **Licencias NO es un módulo aparte: es parte de Descansos.** | ENT-MOD-DESC-001 |
| 4 | **Encargatura** | Registro y control de coberturas de tienda y por tipo de venta del personal Senior, con validaciones y carga masiva. **Responsable de gestionar/confirmar: Administración Retail (AR)**, con autoaprobación (sin comité). Las acciones desde la app móvil de GZ/GG son solo **solicitudes** que AR confirma. | ENT-MOD-ENCA-001 |
| 5 | **Traslados** | Traslados temporales y permanentes, firma de adenda, replicación de huella, retorno automático, anulación de encargaturas futuras. | ENT-MOD-TRAS-001 |
| 6 | **Vacaciones** | Estado vacacional desde OFIPLAN (pendientes/indemnizables/truncos), registro con firma electrónica, alertas de riesgo legal. | ENT-MOD-VAC-001 |
| 7 | **Ascenso Senior** | Flujo de solicitud, evaluación y aprobación del ascenso a Senior; actualización del flag SENIOR en RMS. **El flujo se gestiona dentro del módulo de Aprobaciones** (panel de cumplimiento de 6 meses, SLA y segregación), **no en Gestión de Equipos**. **Promotor/solicitante: Administración de Ventas (AV)**; **aprueba el GG** (con GG Suplente para segregación). En Gestión de Equipos solo se muestra un badge "Senior" de solo lectura. | ENT-MOD-ASCE-001 |

### 3.2 Módulos transversales (3) — decisión de la usuaria

| # | Módulo | Propósito resumido | Por qué entra al build |
|---|---|---|---|
| 8 | **Aprobaciones** | Motor/flujo transversal de aprobaciones reutilizable por Traslados, Vacaciones, Encargatura, Ascenso, Descansos (LSGH/LCGH) y Rol de Personal. Centraliza estados, comentarios obligatorios, notificaciones y auditoría de aprobaciones. **Aloja el flujo completo de Ascenso Senior** (inicio por AV, panel de cumplimiento de 6 meses, aprobación de GG con segregación vía GG Suplente y SLA). | Los 7 módulos referencian repetidamente "el módulo de Aprobaciones" y flujos GZ→GG. Construirlo una sola vez evita duplicar lógica y asegura consistencia. |
| 9 | **Maestros / Configuración** | Catálogos y parámetros transversales: feriados nacionales/locales, maestro de tiendas (tipo CC/PC, zona, empresa), puestos, parámetros por empresa (Cadena/Lukers), semanas de campaña/alta demanda, tolerancias, plazos y SLAs. | Casi todos los módulos consumen feriados, parámetros por empresa, atributo CC/PC de tienda y umbrales configurables. Es prerrequisito técnico-funcional transversal. |
| 10 | **Seguridad / Accesos (RBAC)** | Gestión de identidades y control de acceso basado en roles: usuarios, roles, permisos, jerarquía y ámbito por empresa/zona/tienda, autenticación, delegación/suplencia y auditoría de accesos. `⚠️ REQUIERE VALIDACIÓN COMPLIANCE` (manejo de identidades). | **Decisión de la usuaria:** se construye desde cero. Todos los módulos asumen roles (GT, GZ, GG, AV, AR, ADM) y ámbitos; antes era una exclusión pendiente y ahora es habilitador de Fase 0. Desbloquea el motor de Aprobaciones (VAC-APRO-01) y resuelve el bloqueante de roles. Especificado por el Analista Funcional en `ENT-MOD-SEGU-001`. |

---

## 4. Exclusiones explícitas

Los siguientes elementos **NO se construyen dentro de Nova**. Se tratan como sistemas externos, integraciones o decisiones pendientes.

> **Nota sobre Seguridad/Accesos:** anteriormente listado como exclusión EX-01 (pendiente de decisión). **Por decisión de la usuaria, Seguridad/Accesos pasó al ALCANCE INCLUIDO** (módulo 10, ver sección 3.2) y se construye desde cero como habilitador de Fase 0. Ya no es una exclusión.

| # | Elemento | Tratamiento | Justificación |
|---|---|---|---|
| EX-01 | **Nómina / OFIPLAN** | **Integración externa** (no se construye). Nova escribe/lee vía BOT y API. | OFIPLAN es el sistema corporativo de planilla. Todos los módulos lo declaran fuera de alcance; Nova solo migra datos diferidos vía BOT. |
| EX-02 | **POS / Cajas** | **Integración externa** (no se construye el POS). Nova envía eventos de alerta/bloqueo a través del canal de integración Nova-POS. | El POS es sistema de tienda existente. Nova solo consume el canal para alertas part-time (Marcaciones) y bloqueo por incumplimiento de plazos (Rol). El canal de integración Nova-POS sí es un componente a desarrollar dentro de Marcaciones. |

> **Aclaración importante sobre el POS:** el *sistema POS* es externo y queda fuera de alcance, pero el **componente de integración Nova↔POS** (envío de eventos, bloqueo/desbloqueo) sí forma parte del build, alojado en el módulo de Marcaciones y reutilizado por el Rol de Personal.

---

## 4.bis Notas de frontera entre módulos

Estas notas precisan **dónde vive** cada capacidad y **quién es el actor responsable**, para evitar duplicidad de lógica y solapamiento de alcance. Derivan de la reconciliación del prototipo (`design/reconciliacion-ux.md` v1.0, sección 6).

### NF-01 · Ascenso Senior vive en Aprobaciones (C-01)
- El **flujo de ascenso a Senior se gestiona dentro del módulo de Aprobaciones**, no en Gestión de Equipos. Incluye el panel de cumplimiento de 6 meses, el SLA y la segregación de funciones.
- El **promotor/solicitante del ascenso es Administración de Ventas (AV)** (antes se asumía GZ/GG). El **aprobador es el GG**, con **GG Suplente (R-GG-SUP)** cuando aplica segregación (el solicitante no puede ser a la vez aprobador).
- En **Gestión de Equipos** solo se muestra un **badge "Senior" de solo lectura**; no existe acción de "Confirmar ascenso" directa ni "tienda destino" (eso correspondía erróneamente al prototipo).
- **Frontera:** Ascenso Senior (módulo funcional) define el "qué/por qué" del ascenso y la actualización del flag SENIOR en RMS; **Aprobaciones** aloja el "cómo se aprueba" (estados, segregación, comentarios, auditoría). `⚠️ REQUIERE VALIDACIÓN COMPLIANCE` (datos de desempeño del colaborador).

### NF-02 · Motor único de ausencias programadas: Descansos + Licencias + Vacaciones (C-02)
- **Descansos, Licencias y Vacaciones comparten un MOTOR ÚNICO de "ausencias programadas"** con una sola fuente de verdad de programaciones del empleado.
- **Licencias NO es un módulo aparte: es parte del módulo de Descansos** (gestión integral de descansos, compensaciones y licencias —médica, LSGH, LCGH—).
- **Regla de no-cruce transversal:** un empleado **no puede tener dos programaciones de ausencia solapadas** (descanso, compensación, licencia o vacaciones). El motor valida el no-cruce de forma transversal antes de registrar cualquier programación, en web y móvil.
- **Frontera:** Vacaciones conserva su especificidad (saldos OFIPLAN, indemnizables, Mes Obligatorio, firma), pero se programa sobre el mismo calendario/motor de ausencias y respeta la misma validación de no-cruce. Reglas detalladas en `ENT-MOD-DESC-001` y `ENT-MOD-VAC-001`.

### NF-03 · Encargatura: responsable = Administración Retail (C-03)
- Se **mantiene** que el **responsable de gestionar y confirmar la encargatura es Administración Retail (AR)**, con **autoaprobación (sin comité)**, tal como el spec `ENT-MOD-ENCA-001`. **El actor responsable no cambia.**
- Cualquier acción de encargatura iniciada desde la **app móvil por GZ/GG es solo una SOLICITUD** que **Administración Retail confirma**. La confirmación efectiva (escritura, edición, carga masiva) permanece en AR.
- **Frontera:** GZ/GG pueden **solicitar** desde móvil según su ámbito; **AR** es el único con escritura/confirmación sobre encargaturas.

---

## 5. Actores principales

| Actor | Código | Ámbito | Rol resumido en Nova |
|---|---|---|---|
| Gerente de Tienda | GT | Tienda | Programa el rol de su tienda, gestiona inasistencias, registra descansos, enrola huellas. |
| Gerente Zonal / de Ventas | GZ | Zona (multi-tienda) | Programa y envía el rol de zona, emite autorizaciones/códigos, registra traslados y vacaciones, solicita licencias. **Solicita encargaturas desde móvil (la confirma AR).** Ya **no** es el promotor del ascenso Senior (pasa a AV). |
| Gerencia General | GG | Central / multi-zona | Aprueba roles, licencias LSGH/LCGH y **ascensos Senior** (con **GG Suplente** para segregación); supervisión ejecutiva. |
| Administración de Ventas | AV | Central | Modifica marcaciones (semana en curso), supervisa, autoriza anulaciones, recibe escalamientos. **Promotor/solicitante del ascenso a Senior** (flujo en Aprobaciones). |
| Administración Retail | AR | Central | Escritura/confirmación sobre encargaturas (programa, edita, carga masiva, **confirma solicitudes de GZ/GG**), con autoaprobación (sin comité). |
| Senior | — | Tienda | Sujeto de programación, encargatura y ascenso. No opera módulos directamente. |
| Empleado / Colaborador | EMP | Tienda / Central | Marca por huella, sube sustentos médicos, firma documentos en app móvil. |
| Área de Bienestar | — | Central | Valida documentos de descanso médico (SLA 2 días hábiles). |
| Administrador del Sistema | ADM | Central | Configura parámetros transversales y de cada módulo. |
| Sistema Nova (automatismos) | — | Sistema | Ejecuta jobs, sincronizaciones, transiciones de estado y notificaciones. |

---

## 6. Integraciones externas

| Sistema | Tipo | Datos / función | Criticidad | Módulos que la usan |
|---|---|---|---|---|
| **RMS** | API REST (fuente de verdad de empleados) | Empleados, programaciones, horarios teóricos, cuotas, flag Senior, tipo part/full-time. Escritura de estados (descanso médico, LSGH/LCGH, vacaciones, traslado, SENIOR). | ALTA | Todos |
| **OFIPLAN** | BOT (migración diferida) + lectura de saldos | Migración diferida de roles, descansos, traslados, vacaciones; fuente de saldos vacacionales (pendientes/indemnizables/truncos). | ALTA | Descansos, Traslados, Vacaciones, Rol, Encargatura |
| **Firma Electrónica Nova** | Servicio interno Nova | Firma con selfie + GPS + código por correo. Adendas de traslado, licencias, documento de vacaciones. | ALTA | Traslados, Vacaciones, Descansos |
| **POS / Cajas** | Canal de integración Nova-POS (a desarrollar) | Alertas part-time, bloqueo/desbloqueo individual; bloqueo por incumplimiento de plazos del rol. | ALTA | Marcaciones, Rol de Personal |
| **Dispositivo biométrico** | SDK/API del fabricante | Captura/validación de huella, plantillas locales por tienda, replicación en traslados. | ALTA | Marcaciones |
| **Agente Windows** | Servicio en máquinas de tienda | Alertas nativas de inasistencia. | MEDIA | Marcaciones |
| **PowerApps** | Sincronización periódica | Dato "Gerente Titular de Tienda" para notificaciones. | BAJA | Marcaciones |

---

## 7. Supuestos y restricciones clave

- **Semana laboral:** domingo a sábado, parametrizable por empresa. Consistente en todos los módulos.
- **Dos empresas:** Cadena y Lukers, con reglas diferenciales (días no compensables, ubicación CC/PC, semanas de campaña). Parametrizables vía Maestros/Configuración.
- **RMS es la fuente de verdad** de empleados y programaciones; Nova no da de alta/baja empleados.
- **OFIPLAN es la fuente de verdad** de saldos vacacionales y de planilla.
- **Plataformas:** web + app móvil Nova + dispositivos biométricos por tienda (~100 tiendas).
- El módulo de **Seguridad/Accesos (RBAC) se construye desde cero** dentro de Nova (decisión de la usuaria): es habilitador de Fase 0 y prerrequisito de Aprobaciones y de todos los módulos que asumen roles/ámbito. Especificación en `ENT-MOD-SEGU-001` (en elaboración por el Analista Funcional). `⚠️ REQUIERE VALIDACIÓN COMPLIANCE`.
- Las integraciones con RMS, OFIPLAN y POS **requieren aprobación y coordinación técnica de TI** antes de fijarse en el roadmap definitivo → marcadas como `PENDIENTE APROBACIÓN TI` mientras no exista confirmación documental.
- **Ascenso Senior (C-01):** el flujo se gestiona dentro de **Aprobaciones**; el **promotor/solicitante es Administración de Ventas (AV)** y el **aprobador es el GG** (con **GG Suplente** para segregación). Ver NF-01.
- **Ausencias programadas (C-02):** Descansos, Licencias y Vacaciones comparten un **motor único** con **validación de no-cruce transversal**; **Licencias es parte de Descansos**, no un módulo aparte. Ver NF-02.
- **Encargatura (C-03):** el **responsable de gestionar/confirmar es Administración Retail (AR)** con autoaprobación; las acciones de GZ/GG desde móvil son solo **solicitudes** que AR confirma. Ver NF-03.

> El detalle de supuestos, restricciones y riesgos regulatorios se mantiene en `docs/software-factory/product/supuestos-restricciones.md`.

---

## 8. Mapa de fases / releases

**Criterio de fase:** valor de negocio en la operación diaria de tienda primero, respetando dependencias técnicas y madurez del análisis.

### Fase 0 — Cimientos transversales (habilitadores)
Se construyen en paralelo / como prerrequisito de la Fase 1, porque el resto depende de ellos.

- **Seguridad / Accesos (RBAC)** (usuarios, roles, permisos, jerarquía y ámbito por empresa/zona/tienda, autenticación, delegación/suplencia, auditoría). **Base de Aprobaciones** y de todos los módulos que asumen roles → debe construirse primero o en paralelo temprano.
- **Maestros / Configuración** (feriados, tiendas CC/PC, puestos, parámetros por empresa).
- **Aprobaciones** (motor base usado por el Rol y los módulos posteriores; consume roles/ámbito de Seguridad).

### Fase 1 — Núcleo operativo (primer release) — DECISIÓN DE LA USUARIA
El corazón de la operación diaria de tienda.

- **Rol de Personal** — instrumento operativo central; alimenta a todos.
- **Marcaciones** — control de asistencia y canal de integración Nova-POS.
- **Descansos** (incluye **Licencias** sobre el motor único de ausencias programadas con no-cruce) — se registra desde el calendario del Rol; cierra el ciclo diario (inasistencia → falta/descanso).

**Criterio de avance a Fase 2:** Fase 1 estable en producción con tiendas piloto operando el rol completo, marcaciones biométricas confiables y descansos laborales/compensaciones funcionando.

### Fase 2 — Movilidad y cobertura del personal
Módulos que dependen del núcleo (rol, marcaciones, descansos) ya operativo y que tienen el análisis maduro.

- **Encargatura** — gestionada/confirmada por **Administración Retail** (autoaprobación; GZ/GG solo solicitan desde móvil); depende del Rol (creación automática de coberturas) y de Descansos (validación de disponibilidad).
- **Traslados** — VALIDADO; depende de Marcaciones (huella, bloqueo), Encargatura (anulación) y Descansos (validación).
- **Vacaciones** — VALIDADO; depende de Traslados, Descansos, Rol y de OFIPLAN.

**Criterio de avance a Fase 3:** Fase 2 en producción con traslados, encargaturas y vacaciones operando con firma electrónica estable.

### Fase 3 — Desarrollo de talento
- **Ascenso Senior** — flujo alojado en **Aprobaciones** (promotor **AV**, aprueba **GG** con **GG Suplente** para segregación; depende de Aprobaciones y Seguridad). Análisis INCOMPLETO (12 vacíos abiertos). Es el de menor impacto en la operación diaria y el menos maduro. Se pospone hasta resolver sus vacíos y consolidar el flag Senior usado por Rol y Encargatura.

**Justificación de la distribución:**
1. **Fase 1** entrega el valor diario imprescindible: sin rol, marcaciones y descansos no hay operación de tienda.
2. **Fase 2** agrega movilidad/cobertura, que depende del núcleo y ya está madura (Traslados y Vacaciones VALIDADOS; Encargatura en borrador avanzado y muy acoplada al Rol).
3. **Fase 3** queda para Ascenso Senior por su menor impacto operativo diario y su análisis incompleto.

---

## 9. Estado de madurez por módulo

| Módulo | Fase | Estado del análisis | Madurez | Riesgo |
|---|---|---|---|---|
| Seguridad / Accesos (RBAC) | 0 | **v1.0 BORRADOR** — recién especificado (ENT-MOD-SEGU-001, en elaboración) | Media (borrador inicial) | Habilita Aprobaciones y los roles que todos los módulos asumen. `⚠️ REQUIERE VALIDACIÓN COMPLIANCE`. |
| Maestros / Configuración | 0 | Sin documento propio (requisitos dispersos en los 7 módulos) | Baja-Media | Requiere consolidación de catálogos y parámetros. |
| Aprobaciones | 0 | Sin documento propio (referenciado por todos) | Baja-Media | Requiere especificar el motor transversal. |
| Rol de Personal | 1 | BORRADOR (VAC-01..25 resueltos) | Alta | Pendiente validación de stakeholders. |
| Marcaciones | 1 | BORRADOR (14 VF resueltos) | Alta | Pendiente validación de stakeholders. |
| Descansos | 1 | BORRADOR v1.2 (2 rondas de vacíos resueltos) | Alta | Pendiente validación de Product Owner. |
| Encargatura | 2 | BORRADOR (VAC-01..12 resueltos) | Alta | Pendiente validación de stakeholders. |
| Traslados | 2 | **VALIDADO** (VAC-TRAS-01..14 resueltos) | Muy alta | Listo para diseño. |
| Vacaciones | 2 | **VALIDADO** (VAC-VAC-01..22 resueltos) | Muy alta | Listo para diseño. |
| Ascenso Senior | 3 | INCOMPLETO (12 vacíos ABIERTOS) | Baja | No priorizar hasta resolver vacíos. |

---

## 10. Resumen ejecutivo del alcance

- **10 módulos** en el build: 7 funcionales + Aprobaciones + Maestros/Configuración + Seguridad/Accesos (RBAC).
- **2 exclusiones:** Nómina/OFIPLAN (externo) y POS (externo; solo se construye el canal de integración). Seguridad/Accesos dejó de ser exclusión: ahora se construye desde cero.
- **3 fases** de entrega (más una Fase 0 de cimientos): Núcleo operativo → Movilidad/cobertura → Desarrollo de talento.
- **Habilitadores de Fase 0:** Seguridad/Accesos (base de roles y de Aprobaciones), Maestros y Aprobaciones. El antiguo bloqueante crítico (Seguridad fuera de alcance) queda **resuelto** al incorporarse al build.
- **Siguiente paso:** validación del alcance por la usuaria/sponsor y traspaso al **Analista Funcional** para consolidar Seguridad/Accesos, Maestros y Aprobaciones, y resolver los 12 vacíos de Ascenso Senior.
