# ADR-003: Patrón del motor de Aprobaciones e idempotencia de callbacks

| Campo | Valor |
|---|---|
| Estado | **Aceptado** |
| Fecha | 30/05/2026 |
| Vacío que resuelve | VAC-APRO-13 (idempotencia de callbacks); soporta RN-APRO-14/17/19, VAC-APRO-03/VAC-MAES-16 |
| Decisores | Arquitecto de Software, Backend, PO |
| Documentos | ENT-MOD-APRO-001 (§4-§7), arquitectura-nova.md §3.4/§10, contratos-integracion.md §6/§7 |

## Contexto

El motor de Aprobaciones es transversal (Fase 0) y lo consumen 7 módulos. Modela flujos configurables con niveles, SLA, escalamiento y **callbacks al módulo solicitante** en cada transición relevante (aprobado/rechazado/vencido) para que el módulo ejecute su **efecto de negocio** (RN-APRO-14/15/19): bloqueo de cajas en POS, escritura en RMS/OFIPLAN, cambio de estado del objeto.

El riesgo central (VAC-APRO-13) es el **doble efecto**: un callback reintentado tras un fallo parcial podría **bloquear las cajas dos veces**, escribir dos veces en RMS, etc. El análisis ya prevé (RN-APRO-14) que si el callback falla, la decisión se conserva pero la propagación queda PENDIENTE y se reintenta. Falta definir el patrón técnico que garantice **at-least-once con idempotencia** (efecto exactly-once de negocio).

## Opciones consideradas

1. **Callback síncrono dentro de la transacción de la decisión.**
   - Pros: simple, efecto inmediato.
   - Contras: acopla la decisión del aprobador a la disponibilidad del POS/RMS; si el efecto externo falla, ¿se revierte la aprobación? Frágil y no escalable; viola el principio de no acoplar el path de usuario a integraciones lentas.

2. **Callback asíncrono "fire-and-forget".**
   - Pros: desacopla.
   - Contras: sin garantía de entrega ni de no-duplicación → exactamente el doble bloqueo que VAC-APRO-13 quiere evitar. Descartado.

3. **Outbox transaccional + cola + consumidor idempotente (recomendado).**
   - Pros: at-least-once garantizado (el evento se persiste en la misma transacción que la decisión), reintentos seguros, idempotencia en el consumidor evita doble efecto, auditable.
   - Contras: requiere infraestructura de outbox y disciplina de idempotency keys.

## Decisión

**Patrón del motor:** máquina de estados explícita (la de ENT-MOD-APRO-001 §6.1) sobre una **solicitud** con sus **niveles/tareas**, persistida en PostgreSQL. Las transiciones que producen efecto se publican como **eventos de dominio** mediante **Outbox transaccional**.

**Idempotencia de callbacks (VAC-APRO-13):**

1. **Outbox transaccional.** La decisión (aprobar/rechazar/vencer) y el registro del evento de callback se escriben en **una sola transacción** local. Garantiza que no hay decisión sin evento ni evento sin decisión.
2. **Idempotency key estable por efecto.** Cada evento de callback lleva una clave determinista:
   `idempotency_key = {id_solicitud}:{id_nivel}:{tipo_transicion}:{accion_callback}`.
   El mismo efecto reintentado genera siempre la misma clave.
3. **Consumidor idempotente con tabla de "efectos aplicados".** Antes de ejecutar el efecto, el módulo dueño verifica/inserta la `idempotency_key` en una tabla `efecto_callback_aplicado` con restricción de unicidad. Si ya existe → **no reejecuta** (no-op) y devuelve éxito. Esto convierte at-least-once en exactly-once de negocio.
4. **Estado deseado convergente para efectos externos.** Para POS (bloqueo/desbloqueo de cajas) y similares, el efecto se modela como **estado deseado** (BLOQUEADO/DESBLOQUEADO) versionado, no como delta. Reenviar el estado deseado es idempotente por naturaleza (contratos-integracion.md §6). El propio adaptador POS reenvía `Idempotency-Key`.
5. **Reintentos con backoff y tope.** El worker de despacho reintenta el callback con backoff exponencial + jitter. Al agotar reintentos: la propagación queda en `PENDIENTE`/`FALLIDA_PROPAGACION`, se notifica al módulo y al **ADM** (RN-APRO-14), y la decisión NO se pierde.
6. **Auditoría inmutable.** Cada intento de callback (éxito/fallo/reintento) se registra en el log de aprobaciones (RN-APRO-25, evento `CALLBACK`).

**Relación con VAC-MAES-16 / plazos del Rol:** el Rol gestiona internamente sus deadlines de calendario (`ROL_PLAZO_*`) pero reutiliza este mecanismo: arma un nivel del flujo FL_ROL con consecuencia `CALLBACK_MODULO = BLOQUEAR_CAJAS`, de modo que el bloqueo de cajas pasa por el mismo callback idempotente (decisión registrada en arquitectura-nova.md §10).

## Consecuencias

**Positivas:**
- Elimina el doble efecto (doble bloqueo de cajas, doble escritura RMS) — resuelve VAC-APRO-13.
- Desacopla la decisión del aprobador de la disponibilidad de los sistemas externos.
- Reintentos seguros y trazables; ninguna decisión se pierde.
- Bandeja unificada y auditoría centralizada (RN-APRO-21/25).

**Negativas / trade-offs:**
- Cada módulo consumidor debe implementar el handler idempotente (tabla de efectos aplicados). Se mitiga con una librería/base común del núcleo.
- Latencia eventual del efecto (no instantáneo), aceptable para el negocio.
- El worker de outbox es un componente operativo a monitorizar (profundidad/edad de cola — arquitectura-nova.md §8).

## Pendiente de confirmación de TI

- La idempotencia del **lado receptor externo** (POS, RMS, OFIPLAN) debe confirmarse con cada equipo: idealmente el receptor también respeta `Idempotency-Key`. Mientras tanto, el patrón de estado deseado convergente protege a Nova. `⚠️ PENDIENTE APROBACIÓN TI`.

## Revisión en

Tras el piloto de Fase 0/1, evaluar métricas de reintentos de callback y ajustar backoff/tope.
