# Contratos de Integración — Sistema Nova

| Campo | Valor |
|---|---|
| Documento | Contratos de integración con sistemas externos |
| Sistema | Nova — Gestión de Equipos (Cadena / Lukers, ~100 tiendas) |
| Versión | 1.0 |
| Fecha | 30/05/2026 |
| Elaborado por | Arquitecto de Software |
| Estado | PROPUESTA — `⚠️ PENDIENTE APROBACIÓN TI` en todas las integraciones externas |
| Documentos base | arquitectura-nova.md v1.0, ENT-MOD-ASCE-001 v1.2, ENT-MOD-MAES-001 v1.2, ENT-MOD-SEGU-001 v1.0, ENT-MOD-VAC-001, ENT-MOD-TRAS-001, ENT-MOD-MARC-001, ENT-MOD-ROLP-001 |
| ADRs relacionados | ADR-003 (idempotencia callbacks), ADR-005 (degradación) |

> Nota de cumplimiento (rol Arquitecto): ninguna integración externa documentada aquí está confirmada por TI. Todas se marcan `⚠️ PENDIENTE APROBACIÓN TI` y no deben fijarse en contratos formales hasta confirmación documental de TI y del equipo dueño de cada sistema (RMS, OFIPLAN, POS, Firma, IdP). Los endpoints, métodos, payloads y nombres de campo son **propuestas** del Arquitecto a validar/ajustar con cada equipo. No se incluyen credenciales, IPs ni hosts reales: se referencian como variables de entorno (`${RMS_BASE_URL}`, etc.).

---

## 0. Principios transversales de integración

Aplican a todas las integraciones (consistentes con arquitectura-nova.md §1.1 y §4):

1. **Aislamiento por adaptador (hexagonal).** Cada sistema externo vive detrás de un puerto de salida con su adaptador. El dominio nunca conoce el contrato externo; un cambio de RMS/OFIPLAN no se propaga al núcleo.
2. **Asíncrono fuera del path de usuario.** Las escrituras a sistemas externos (RMS, OFIPLAN, POS) pasan por el **Outbox transaccional + cola de integración + workers** (arquitectura-nova.md §4), salvo cuando el negocio exige confirmación síncrona en línea (escritura SENIOR en ASCE, ver §2).
3. **Idempotencia obligatoria en toda escritura.** Toda llamada de escritura lleva una **clave de idempotencia** (`Idempotency-Key`) generada por Nova; el adaptador trata el reintento como seguro. Detalle en ADR-003.
4. **Reintentos con backoff exponencial + jitter** y **tope de reintentos**; al agotarse, la operación queda en estado `FALLIDA_PROPAGACION` con alerta al ADM (consistente con RN-APRO-14).
5. **Seguridad en tránsito:** TLS obligatorio; autenticación de servicio mediante OAuth2 client-credentials o API Key gestionada en el gestor de secretos. Nunca en código.
6. **Auditoría:** toda llamada saliente/entrante registra `correlation_id`, sistema, operación, resultado (EXITOSO/FALLIDO), timestamp y reintentos.
7. **Versionado de contrato:** prefijo de versión en la ruta (`/v1/...`) para tolerar evolución sin romper consumidores.

| Sistema | Patrón | Dirección | Síncrono/Asíncrono | Criticidad |
|---|---|---|---|---|
| RMS | API REST + sincronización | Bidireccional | Mixto | ALTA |
| OFIPLAN | BOT (migración diferida) + lectura saldos | Bidireccional | Asíncrono | ALTA |
| POS | Canal de eventos Nova-POS (a construir) | Nova → POS | Asíncrono | ALTA |
| Firma Electrónica Nova | Servicio interno | Bidireccional | Asíncrono (con callback) | ALTA |
| IdP corporativo | OIDC | Nova ← IdP | Síncrono (login) | ALTA |
| Biométrico | SDK fabricante (local en tienda) | Local | Síncrono local | ALTA |

---

## 1. RMS — visión general del contrato

RMS es la **fuente de verdad de empleados, puestos, tiendas, programaciones y flag SENIOR**. Nova lo consume (lectura) y le escribe estados (SENIOR, descanso médico, LSGH/LCGH, vacaciones, traslado).

| Aspecto | Propuesta |
|---|---|
| Protocolo | HTTPS / REST / JSON |
| Base URL | `${RMS_BASE_URL}/v1` (variable de entorno) |
| Autenticación | OAuth2 client-credentials (`${RMS_CLIENT_ID}` / secreto en gestor de secretos) o API Key según lo que exponga RMS. `⚠️ PENDIENTE APROBACIÓN TI` |
| Formato de fechas | ISO 8601 UTC |
| Identificador de empleado | `codigo_empleado` (string) — clave de vinculación con Nova |
| Idempotencia escritura | Header `Idempotency-Key` (UUID por operación de negocio) |
| Trazabilidad | Header `X-Correlation-Id` |

Las tres operaciones críticas (VAC-ASCE-06, VAC-MAES-12, VAC-SEGU-10) se detallan a continuación. Las escrituras de estado de Traslados y Vacaciones se modelan con el mismo patrón de escritura idempotente (§6).

---

## 2. VAC-ASCE-06 — Escritura del flag SENIOR y detección del descenso (RMS)

Resuelve el comportamiento de RN-ASCE-07, RN-ASCE-12, RN-ASCE-20, RN-ASCE-27, RN-ASCE-29. Componente dueño: módulo **Ascenso Senior**; usa el adaptador RMS.

### 2.1 Actualizar flag SENIOR al aprobar el ascenso (escritura)

Característica clave del negocio: **la aprobación en Nova y la escritura en RMS son atómicas** (RN-ASCE-07): si RMS falla, la solicitud NO pasa a "Aprobada". Por eso esta escritura es **síncrona en línea** (excepción al principio 0.2), dentro del caso de uso CU-ASCE-02.

**Endpoint propuesto**

```
PUT ${RMS_BASE_URL}/v1/empleados/{codigo_empleado}/flag-senior
Headers:
  Authorization: Bearer <token client-credentials>
  Idempotency-Key: <uuid_solicitud_ascenso>   # estable por solicitud (RN-ASCE-12 reintento manual)
  X-Correlation-Id: <correlation_id>
  Content-Type: application/json
```

**Payload (request)**

```json
{
  "flag_senior": "SI",
  "origen": "NOVA_ASCENSO",
  "id_solicitud_ascenso": "ASCE-2026-000123",
  "id_aprobador": "<codigo_empleado_GG_o_suplente>",
  "fecha_aprobacion": "2026-05-30T15:42:00Z"
}
```

**Respuesta — éxito (200/204)**

```json
{
  "codigo_empleado": "EMP00045",
  "flag_senior": "SI",
  "flag_senior_anterior": "NO",
  "aplicado": true,
  "timestamp_rms": "2026-05-30T15:42:01Z",
  "idempotency_key": "ASCE-...-uuid"
}
```

**Respuesta — error (4xx/5xx)**

```json
{
  "codigo_error": "RMS_EMPLEADO_NO_ENCONTRADO | RMS_ESTADO_INVALIDO | RMS_INTERNO",
  "mensaje": "Descripción técnica del error",
  "reintentable": true
}
```

**Reglas de comportamiento (Nova)**

| Aspecto | Definición |
|---|---|
| Atomicidad | La transacción local de aprobación se confirma SOLO tras respuesta de éxito de RMS. Si RMS devuelve error o timeout, se hace rollback del cambio de estado a "Aprobada"; la solicitud permanece "Pendiente de Aprobación" (RN-ASCE-12). |
| Idempotencia | `Idempotency-Key = id_solicitud_ascenso` (estable). Un reintento manual del GG (RN-ASCE-12 punto 4) reenvía la misma clave: si RMS ya aplicó el cambio, responde el mismo resultado sin doble efecto. `flag_senior_anterior` permite a Nova detectar reaplicación. |
| Reintentos | En línea, NO automático silencioso: el GG reintenta manualmente (RN-ASCE-12). Timeout recomendado de la llamada: `${RMS_WRITE_TIMEOUT_MS}` (p. ej. 8000 ms). |
| Auditoría | Éxito y fallo se registran en el log de auditoría de ASCE/Aprobaciones con timestamp, usuario, idempotency-key y `codigo_error` (RN-ASCE-12 punto 3). |
| Disponibilidad RMS | Si RMS no disponible al aprobar → bloquea la aprobación con mensaje de integración (RN-ASCE E1). No se permite aprobar sin confirmación. |

### 2.2 Detección del descenso (flag SENIOR → NO gestionado externamente en RMS)

Nova **no inicia** el descenso (VAC-ASCE-01 Opción A); solo lo **detecta, registra y notifica** (CU-ASCE-05, RN-ASCE-27/28). Hay dos mecanismos posibles; el Arquitecto **recomienda el modelo push con fallback a pull**.

| Mecanismo | Descripción | Recomendación |
|---|---|---|
| **A) Push (webhook de RMS → Nova)** | RMS notifica a Nova cada cambio del flag SENIOR. Detección casi en tiempo real. | **PREFERIDO** si RMS puede emitir eventos. |
| **B) Pull (consulta programada de Nova → RMS)** | Un worker de Nova consulta periódicamente el flag de los empleados marcados Senior y detecta el cambio. | **FALLBACK** si RMS no emite webhooks. |

> El mecanismo final depende de las capacidades de RMS. `⚠️ PENDIENTE APROBACIÓN TI`. Nova implementa el adaptador para que ambos modos converjan al mismo evento de dominio interno `FlagSeniorCambiado`.

**Opción A — Webhook entrante (RMS → Nova)**

```
POST ${NOVA_BASE_URL}/v1/integraciones/rms/eventos-flag-senior
Headers:
  X-RMS-Signature: <HMAC del cuerpo con secreto compartido>   # verificación de origen
  X-Idempotency-Key: <id_evento_rms>                          # dedup de eventos
Body:
{
  "codigo_empleado": "EMP00045",
  "flag_senior_anterior": "SI",
  "flag_senior_nuevo": "NO",
  "fecha_cambio_rms": "2026-06-15T09:00:00Z",
  "origen": "RMS_RRHH"
}
```

- Nova **verifica la firma HMAC** y **deduplica** por `X-Idempotency-Key` (un mismo evento reentregado no genera doble registro de descenso).
- Responde `202 Accepted`; el procesamiento (registrar evento, inhabilitar nuevas asignaciones Senior RN-ASCE-20, cerrar solicitud pendiente RN-ASCE-27 A2, notificar GZ/GG RN-ASCE-28) es asíncrono vía bus de eventos interno.

**Opción B — Consulta programada (pull)**

```
POST ${RMS_BASE_URL}/v1/empleados/flag-senior:batch-consulta
Body: { "codigos_empleado": ["EMP00045","EMP00046", ...] }   # solo los marcados Senior en Nova
Respuesta: [ { "codigo_empleado":"EMP00045", "flag_senior":"NO", "fecha_ultimo_cambio":"2026-06-15T09:00:00Z" }, ... ]
```

| Aspecto | Definición |
|---|---|
| Frecuencia (pull) | `${ASCE_SYNC_FLAG_SENIOR_CRON}` — recomendado cada 1 h (o diario nocturno si RMS lo limita). El negocio tolera detección diferida porque la inhabilitación real ocurre en tiempo real al consultar el flag en cada asignación (RN-ASCE-20). |
| Idempotencia (detección) | Nova compara el flag recibido con el último flag conocido por empleado; solo genera `Descenso detectado` en la transición SI→NO. Reprocesar el mismo estado no duplica el evento. |
| Reintentos | Si RMS no responde en la sincronización: backoff y reintento (RN-ASCE-27/CU-ASCE-05 E1); se registra el reintento en logs y se alerta antigüedad si supera umbral. |
| Auditoría | Cada descenso detectado: `codigo_empleado`, fecha/hora detección, flag anterior (SI), flag nuevo (NO), origen "RMS (externo)" (CU-ASCE-05 paso 2). |
| Efecto secundario | Si existe solicitud "Pendiente de Aprobación" → se cierra con motivo "Flag Senior modificado externamente" (RN-ASCE-27 A2). La inhabilitación de nuevas asignaciones es automática porque Rol/Encargatura consultan el flag en tiempo real (RN-ASCE-20). |

`⚠️ PENDIENTE APROBACIÓN TI` — Mecanismo (push vs pull), capacidad de webhook de RMS, frecuencia del pull y secreto HMAC a coordinar con el equipo de RMS.

---

## 3. VAC-MAES-12 — Sincronización RMS de tiendas, puestos y dotación mínima

Resuelve RN-MAES-05 y la sección 9.1 de MAES-001. Componente dueño: módulo **Maestros/Configuración**; usa el adaptador RMS. RMS es fuente de verdad del **maestro base de tiendas, puestos y la dotación mínima**; Nova los enriquece con atributos operativos propios (CC/PC, zona Nova, límites por puesto) **excepto la dotación mínima**, que es de solo lectura desde RMS.

### 3.1 Modo y frecuencia (recomendación)

| Dato | Modo recomendado | Frecuencia | Justificación |
|---|---|---|---|
| Maestro de tiendas (base) | Pull batch (full o delta) | Diaria nocturna + on-demand por ADM | Cambia poco; tolera diferido (RN-MAES E1 opera con última versión). |
| Maestro de puestos | Pull batch | Diaria nocturna + on-demand | Catálogo estable. |
| **Dotación mínima por tienda** | Pull batch (con el maestro de tiendas) **+ webhook opcional si cambia** | Diaria; idealmente push ante cambio | Tiene impacto operativo (Vacaciones/Descansos/Encargatura); cuanto más fresco, mejor, pero el valor se consume **vigente a la fecha del evento** (RN-MAES-05/14). |

> Recomendación del Arquitecto: **sincronización diaria nocturna por defecto + endpoint on-demand para el ADM** (botón "Sincronizar ahora", consistente con CU-MAES-01). Si RMS soporta delta/webhook, activarlo para la dotación mínima. `⚠️ PENDIENTE APROBACIÓN TI`.

### 3.2 Contrato — consulta batch (pull)

```
GET ${RMS_BASE_URL}/v1/maestros/tiendas?desde={fecha_ultima_sync}&empresa={CADENA|LUKERS}
Headers: Authorization, X-Correlation-Id
```

**Respuesta (propuesta)**

```json
{
  "fecha_generacion": "2026-05-30T03:00:00Z",
  "modo": "DELTA",
  "tiendas": [
    {
      "codigo_tienda": "T0100",
      "nombre": "Tienda Centro",
      "empresa": "CADENA",
      "estado_rms": "ACTIVA",
      "dotacion_minima_asesores": 6,
      "fecha_vigencia_dotacion": "2026-05-01"
    }
  ]
}
```

```
GET ${RMS_BASE_URL}/v1/maestros/puestos?desde={fecha_ultima_sync}
Respuesta:
{
  "puestos": [
    { "codigo_puesto": "ASE", "nombre": "Asesor", "estado_rms": "ACTIVO" },
    { "codigo_puesto": "SEN", "nombre": "Senior", "estado_rms": "ACTIVO" }
  ]
}
```

### 3.3 Reglas de comportamiento (Nova / Maestros)

| Aspecto | Definición |
|---|---|
| Sentido | Solo lectura desde RMS. Nova NO crea/edita tiendas ni puestos ni dotación; los enriquece con atributos propios (CC/PC, zona Nova, límites por puesto) — la dotación mínima NO se enriquece (RN-MAES-05). |
| Idempotencia | Upsert por `codigo_tienda` / `codigo_puesto`. Reprocesar el mismo lote no duplica filas ni altera versiones si no hay cambio de valor. |
| Vigencia | El valor de dotación se almacena con `fecha_vigencia`; el servicio de configuración devuelve el valor **vigente a la fecha de referencia** del evento consumidor (RN-MAES-14). |
| Indisponibilidad RMS | Nova opera con la última versión sincronizada vigente y **alerta al ADM de la antigüedad** (CU-MAES-01 E1, RN-MAES integración 9.1). No se bloquea la operación general por falta de sincronización (la criticidad se evalúa al consumir el parámetro, RN-MAES-19 / ADR-005). |
| Coherencia de catálogo | Una tienda/zona desactivada en RMS/Maestros invalida asignaciones de ámbito inconsistentes en la siguiente sincronización (consistente con SEGU §9.1). |
| Auditoría | La sincronización se registra como acción `IMPORTACION` en el log de configuración (MAES §7.7). |

`⚠️ PENDIENTE APROBACIÓN TI` — Modo (full/delta/webhook), frecuencia, esquema exacto de campos y disponibilidad del filtro `desde` a coordinar con RMS.

---

## 4. VAC-SEGU-10 — Vínculo de identidades Seguridad↔RMS y detección de baja

Resuelve RN-SEGU-02, RN-SEGU-03, RN-SEGU-22, RN-SEGU-26 y la sección 9.4 de SEGU-001. Componente dueño: módulo **Seguridad/Accesos**; usa el adaptador RMS. Seguridad **NO almacena datos personales como fuente de verdad**: guarda solo el vínculo (`codigo_empleado`) y consulta RMS cuando los necesita (RN-SEGU-26).

### 4.1 Vinculación al crear usuario (lectura síncrona)

Dentro de CU-SEGU-01, al crear un usuario PERSONAL, Seguridad valida contra RMS en línea.

```
GET ${RMS_BASE_URL}/v1/empleados/{codigo_empleado}
Respuesta:
{
  "codigo_empleado": "EMP00045",
  "nombre": "Nombre Apellido",      // referencial, NO se persiste como fuente de verdad
  "puesto": "ASE",
  "tienda_base": "T0100",
  "estado": "ACTIVO",                // ACTIVO | BAJA | SUSPENDIDO | INACTIVO
  "flag_senior": "NO"
}
```

| Regla | Comportamiento |
|---|---|
| RN-SEGU-02 | Solo se vincula si `estado == ACTIVO`. Si BAJA/INACTIVO → bloquea la creación. |
| RN-SEGU-03 | Nova verifica en su propia base que no exista otro usuario ACTIVO con el mismo `codigo_empleado`. |
| RN-SEGU-26 | Los datos de RMS se muestran como referencia; Nova persiste únicamente `codigo_empleado` (el vínculo). |

### 4.2 Detección de baja del empleado (desactivación automática del usuario)

Igual que en §2.2, **dos mecanismos** convergentes a un evento de dominio `EmpleadoBajaDetectada`; recomendación **push + fallback pull**.

**Opción A — Webhook entrante (RMS → Nova)**

```
POST ${NOVA_BASE_URL}/v1/integraciones/rms/eventos-empleado
Headers: X-RMS-Signature (HMAC), X-Idempotency-Key
Body:
{
  "codigo_empleado": "EMP00045",
  "estado_anterior": "ACTIVO",
  "estado_nuevo": "BAJA",
  "fecha_cambio_rms": "2026-06-20T00:00:00Z"
}
```

**Opción B — Consulta programada (pull)**

```
POST ${RMS_BASE_URL}/v1/empleados/estados:batch-consulta
Body: { "codigos_empleado": [ <todos los vinculados a usuarios ACTIVOS de Nova> ] }
Respuesta: [ { "codigo_empleado":"EMP00045", "estado":"BAJA" }, ... ]
```

| Aspecto | Definición |
|---|---|
| Frecuencia (pull) | `${SEGU_SYNC_BAJA_CRON}` — recomendado cada 1 h (o nocturno si RMS lo limita). El control de acceso real ocurre en login: un usuario cuyo empleado está de baja recibe acceso denegado (RN-SEGU-22). |
| Efecto | Al detectar BAJA/INACTIVO → el usuario vinculado se **desactiva automáticamente** (estado DESACTIVADO), conservando el registro para auditoría (RN-SEGU-22). Las sesiones activas se cierran. |
| Idempotencia | Solo la transición ACTIVO→(BAJA/INACTIVO) dispara la desactivación; reprocesar el mismo estado no genera nuevos eventos. Dedup por `X-Idempotency-Key` en push. |
| Reintentos | Backoff ante indisponibilidad de RMS; alerta de antigüedad de sincronización al ADM. |
| Verificación en login | Defensa adicional: en cada login de usuario PERSONAL, el servicio de autenticación puede revalidar el estado del empleado (RN-SEGU-22 / CU-SEGU-02 E2), de modo que aunque el evento de baja se retrase, el acceso queda denegado. |
| Seguridad del webhook | Firma HMAC con secreto compartido; rechazo de eventos sin firma válida. |

`⚠️ PENDIENTE APROBACIÓN TI` — Mecanismo de notificación de baja (push vs pull), webhook de RMS y secreto HMAC. Coherente con el contrato de §2 y §3 (mismo adaptador RMS, mismo patrón de eventos entrantes).

---

## 5. OFIPLAN — migración diferida (BOT) y lectura de saldos vacacionales

OFIPLAN es la **fuente de verdad de saldos vacacionales y planilla**. Nova **no construye** OFIPLAN (EX-01 del alcance). La integración es asíncrona vía **BOT** (proceso de migración diferida) y lectura de saldos.

| Aspecto | Propuesta |
|---|---|
| Patrón | Migración diferida vía BOT (Nova → OFIPLAN) + lectura de saldos (OFIPLAN → Nova). Asíncrono. |
| Módulos | Rol, Descansos, Traslados, Vacaciones, Encargatura. |
| Tiempos de migración | Parametrizables en Maestros (`TRAS_TIEMPO_MIGRACION_OFIPLAN`, tiempos de migración de vacaciones, etc.). |

### 5.1 Lectura de saldos vacacionales (Vacaciones)

```
GET ${OFIPLAN_BASE_URL}/v1/colaboradores/{codigo_empleado}/saldo-vacacional
Respuesta:
{
  "codigo_empleado": "EMP00045",
  "dias_pendientes": 18,
  "dias_indemnizables": 5,
  "dias_truncos": 2.5,
  "mes_obligatorio": "2026-08",
  "fecha_corte": "2026-05-30"
}
```

- Los umbrales de alerta (indemnizables, mes obligatorio) son parámetros de Maestros (`VAC_UMBRAL_*`). Nova **consume** el dato; no recalcula saldos (exclusión VAC-001).
- Si OFIPLAN no responde: el listado de Vacaciones muestra el último dato disponible con marca de antigüedad (degradable). El cálculo es responsabilidad de OFIPLAN.

### 5.2 Migración diferida (Nova → OFIPLAN, BOT)

Patrón **Outbox + cola de integración** (principio 0.2): al confirmarse el evento de negocio (rol aprobado, traslado permanente confirmado, periodo de vacaciones registrado), Nova encola un registro de migración. El BOT lo consume en el tiempo parametrizado.

```json
{
  "tipo_migracion": "VACACIONES | TRASLADO | ROL | DESCANSO",
  "codigo_empleado": "EMP00045",
  "id_evento_nova": "VAC-2026-000789",
  "idempotency_key": "VAC-2026-000789",
  "payload": { "...campos específicos por tipo..." },
  "fecha_programada_migracion": "2026-06-01T00:00:00Z"
}
```

| Aspecto | Definición |
|---|---|
| Idempotencia | `idempotency_key = id_evento_nova`; el BOT/OFIPLAN debe ignorar duplicados (reintentos). |
| Reintentos | Backoff; al agotar → `FALLIDA_PROPAGACION` + alerta ADM. |
| Confirmación | OFIPLAN/BOT confirma la migración; Nova marca el registro como migrado y audita. |
| Tiempos | Parametrizables por Maestros. |

`⚠️ PENDIENTE APROBACIÓN TI` — Mecanismo del BOT (cola, archivo, API), formato exacto del payload por tipo, y contrato de lectura de saldos a coordinar con el equipo de OFIPLAN.

---

## 6. POS — canal de integración Nova-POS (a construir dentro de Marcaciones)

El **sistema POS es externo** (EX-02), pero el **canal de integración Nova↔POS** sí forma parte del build (alojado en Marcaciones, reutilizado por Rol). Eventos salientes Nova → POS, asíncronos.

| Evento | Origen | Disparo | Efecto en POS |
|---|---|---|---|
| Alerta de salida part-time | Marcaciones | 10, 5 y 1 min antes del horario teórico de salida (RN-MARC) | Alerta emergente NO bloqueante |
| Bloqueo individual de venta | Marcaciones | Part-time sin marcación de salida | Bloqueo de venta del empleado |
| Desbloqueo individual | Marcaciones | Marcación de salida registrada / autorización | Desbloqueo de venta |
| Bloqueo por incumplimiento de plazo del Rol | Rol (vía callback del motor, ADR-003) | Vencimiento de `ROL_PLAZO_*` (consecuencia CALLBACK_MODULO=BLOQUEAR_CAJAS) | Bloqueo de cajas de la(s) tienda(s) del GZ |
| Desbloqueo por regularización del Rol | Rol | Rol enviado/aprobado dentro de plazo extendido | Desbloqueo de cajas |

**Contrato de evento (propuesta)**

```
POST ${POS_BASE_URL}/v1/eventos
Headers: Authorization, Idempotency-Key, X-Correlation-Id
Body:
{
  "tipo_evento": "ALERTA_PART_TIME | BLOQUEO_INDIVIDUAL | DESBLOQUEO_INDIVIDUAL | BLOQUEO_CAJAS | DESBLOQUEO_CAJAS",
  "codigo_tienda": "T0100",
  "codigo_empleado": "EMP00045",      // null en bloqueo de cajas a nivel tienda
  "id_evento_nova": "MARC-2026-...",
  "idempotency_key": "MARC-2026-...",
  "timestamp": "2026-05-30T20:55:00Z"
}
```

| Aspecto | Definición |
|---|---|
| Idempotencia (CRÍTICA) | Toda señal de bloqueo/desbloqueo lleva `Idempotency-Key`. **Evita el doble bloqueo de cajas** — directamente ligado a VAC-APRO-13 (ADR-003). Un reintento del mismo `BLOQUEAR_CAJAS` no re-aplica el efecto. |
| Reintentos | Backoff con tope; alerta ADM si el POS no confirma. |
| Reconciliación | Estado deseado (bloqueado/desbloqueado) versionado en Nova; ante duda, Nova reenvía el estado deseado, no un delta. Esto hace el efecto convergente e idempotente por naturaleza. |
| Auditoría | Cada envío y confirmación se audita (Marcaciones). |

`⚠️ PENDIENTE APROBACIÓN TI` — El canal Nova-POS se construye, pero el contrato concreto del endpoint POS, autenticación y confirmación dependen del equipo de POS.

---

## 7. Firma Electrónica Nova — servicio interno

Servicio interno de Nova (no se construye dentro de un módulo de negocio; es transversal). Firma con **selfie + GPS + código por correo**. Lo consumen Traslados (adenda), Vacaciones (documento) y Descansos (licencias).

| Aspecto | Propuesta |
|---|---|
| Patrón | Solicitud de firma (Nova → Firma) + callback de resultado (Firma → Nova), asíncrono con la app móvil del colaborador. |
| Parámetros | `FIRMA_INTENTOS_MAX`, `FIRMA_EXPIRACION_CODIGO` (Maestros). |
| Correo | Lo provee Seguridad como canal de contacto del usuario (SEGU §9.6). |

**Iniciar firma**

```
POST ${FIRMA_BASE_URL}/v1/solicitudes-firma
Body:
{
  "tipo_documento": "ADENDA_TRASLADO | DOC_VACACIONES | LICENCIA",
  "id_documento_nova": "TRAS-2026-000321",
  "codigo_empleado": "EMP00045",
  "correo_destino": "<correo del usuario, provisto por SEGU>",
  "callback_url": "${NOVA_BASE_URL}/v1/integraciones/firma/callback",
  "idempotency_key": "TRAS-2026-000321"
}
```

**Callback de resultado (Firma → Nova)**

```
POST ${NOVA_BASE_URL}/v1/integraciones/firma/callback
Headers: X-Firma-Signature (HMAC), X-Idempotency-Key
Body:
{
  "id_documento_nova": "TRAS-2026-000321",
  "resultado": "FIRMADO | RECHAZADO | EXPIRADO",
  "evidencia": { "selfie_ref": "...", "gps": {"lat": -12.04, "lng": -77.04}, "fecha_firma": "..." }
}
```

| Aspecto | Definición |
|---|---|
| Idempotencia | `idempotency_key = id_documento_nova`; callback deduplicado por `X-Idempotency-Key`. Un callback reentregado no avanza dos veces el flujo (p. ej. no habilita marcación en destino dos veces, Traslados). |
| Atomicidad de efecto | El efecto de negocio del callback (habilitar marcación en tienda destino, migrar a OFIPLAN, etc.) se ejecuta con la misma garantía de idempotencia que los callbacks del motor de Aprobaciones (ADR-003). |
| Seguridad | Firma HMAC del callback; verificación de origen. |
| Auditoría | La evidencia de firma (selfie/GPS/código) se conserva como `⚠️ DATO SENSIBLE` con acceso restringido. |

`⚠️ PENDIENTE APROBACIÓN TI` — Confirmar que Firma Electrónica Nova expone el contrato solicitud+callback y soporta `callback_url` y firma HMAC.

---

## 8. IdP corporativo (OIDC) — autenticación federada

Detalle de la decisión en **ADR-001**. Resumen del contrato:

| Aspecto | Propuesta |
|---|---|
| Protocolo | OpenID Connect (Authorization Code + PKCE) sobre OAuth2. |
| Flujo | Nova (web/móvil) redirige al IdP; recibe `id_token` + `access_token`; mapea el `sub`/`email`/`employeeId` del token al usuario de Nova (CU-SEGU-02 A1). |
| Mapeo | El claim de identidad (p. ej. `employeeId`) se mapea al `codigo_empleado` vinculado en Seguridad; Nova **conserva su propio modelo de roles/ámbito** (no delega autorización al IdP). |
| Activación | Controlada por `SEGU_AUTENTICACION_METODO` (LOCAL / SSO). |
| MFA | Si el IdP provee MFA, se reutiliza para R-ADM/R-GG (baseline §6). |

`⚠️ PENDIENTE APROBACIÓN TI` — Disponibilidad y tipo de IdP corporativo (Entra ID / Keycloak / otro), claims disponibles y mapeo a `codigo_empleado`.

---

## 9. Biométrico — SDK del fabricante (local en tienda)

| Aspecto | Propuesta |
|---|---|
| Patrón | SDK/API del fabricante ejecutado por el **Agente Windows** local de cada tienda (arquitectura-nova.md §4). Plantillas biométricas **locales por tienda**. |
| Operaciones | Enrolar huella, validar marcación entrada/salida, replicar plantilla a tienda destino (traslados, instruido por Traslados→Marcaciones). |
| Comunicación | El agente reporta marcaciones validadas al backend (vía API Gateway, TLS). |
| Replicación | En traslados, Marcaciones instruye la replicación de la plantilla al dispositivo de la tienda destino (RN-TRAS / RN-MARC). |
| Datos | La plantilla biométrica es `⚠️ DATO SENSIBLE`; se conserva local en tienda; el backend guarda referencias, no la biometría cruda (a confirmar con el SDK). |

`⚠️ PENDIENTE APROBACIÓN TI / fabricante` — El contrato exacto depende del SDK del dispositivo biométrico instalado; el adaptador aísla el dominio del SDK.

---

## 10. Resumen de eventos entrantes a Nova (webhooks) y seguridad

| Endpoint entrante | Origen | Seguridad | Idempotencia |
|---|---|---|---|
| `/v1/integraciones/rms/eventos-flag-senior` | RMS | HMAC `X-RMS-Signature` | `X-Idempotency-Key` |
| `/v1/integraciones/rms/eventos-empleado` | RMS | HMAC | `X-Idempotency-Key` |
| `/v1/integraciones/firma/callback` | Firma Nova | HMAC `X-Firma-Signature` | `X-Idempotency-Key` |

Todos verifican firma de origen, deduplican por idempotency-key, responden `202 Accepted` y procesan de forma asíncrona vía el bus de eventos interno. Coherente con ADR-003 (idempotencia) y ADR-005 (degradación).
