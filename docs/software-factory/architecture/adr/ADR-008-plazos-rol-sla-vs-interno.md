# ADR-008: Plazos del Rol de Personal — SLA del motor vs gestión interna

| Campo | Valor |
|---|---|
| Estado | **Aceptado** |
| Fecha | 30/05/2026 |
| Vacío que resuelve | VAC-MAES-16 (plazos del Rol como SLA del motor) y VAC-APRO-03 (alineado) |
| Decisores | Arquitecto de Software, Backend, PO |
| Documentos | ENT-MOD-MAES-001 §7.6 (nota VAC-MAES-16), ENT-MOD-APRO-001 (FL_ROL, RN-APRO-13/19), arquitectura-nova.md §10, ADR-003 |

## Contexto

El Rol de Personal tiene plazos operativos (`ROL_PLAZO_ENVIO_GZ` jueves 23:59, `ROL_PLAZO_EXTENDIDO_GZ` viernes mediodía, `ROL_PLAZO_APROBACION_GG` sábado 10:00, `ROL_PLAZO_PROGRAMACION_GT` domingo mediodía), todos BLOQUEANTES porque pueden disparar el bloqueo de cajas en POS. VAC-MAES-16/VAC-APRO-03 preguntan si estos plazos se exponen como SLA del motor de Aprobaciones (`APRO_SLA_FL_ROL_*`) y los gestiona el motor, o el Rol los gestiona internamente.

Diferencia clave: el motor modela SLA como **duración relativa al inicio del nivel** ("2 días hábiles desde la solicitud", RN-APRO-13). Los plazos del Rol son **deadlines de calendario absoluto** atados a la semana operativa domingo-sábado.

## Opciones consideradas

1. **Exponer los plazos como `APRO_SLA_FL_ROL_*` y dejar que el motor los gestione.**
   - Pros: un solo mecanismo de SLA para todos los flujos.
   - Contras: fuerza deadlines de calendario absoluto dentro de un modelo de duración relativa → casos especiales y distorsión del motor; el SLA del motor no encaja con "sábado 10:00 de esta semana".

2. **El Rol gestiona internamente sus plazos; el motor solo decide la aprobación del GG y ejecuta el efecto vía callback (recomendado).**
   - Pros: respeta la naturaleza de calendario absoluto de los plazos del Rol; reutiliza la idempotencia y auditoría del motor para el efecto (bloqueo de cajas) sin distorsionar el modelo de SLA.
   - Contras: el Rol implementa su propio cron de vencimientos (lógica adicional en el módulo).

## Decisión

**El Rol de Personal gestiona internamente sus plazos horarios (`ROL_PLAZO_*`) mediante un cron/scheduler propio, y reutiliza el motor de Aprobaciones solo para: (a) la decisión jerárquica del GG (flujo FL_ROL nivel GG), y (b) la ejecución del efecto del vencimiento vía callback idempotente.**

- **NO se crean claves `APRO_SLA_FL_ROL_*`** en Maestros. Se conservan los `ROL_PLAZO_*` existentes (BLOQUEANTE), modelados en el esquema de parámetros con `flujo = null` (ADR-004).
- Al vencer un `ROL_PLAZO_*`, el Rol arma/transiciona el nivel correspondiente del flujo FL_ROL con consecuencia `CALLBACK_MODULO = BLOQUEAR_CAJAS` (RN-APRO-19), de modo que el bloqueo de cajas pasa por el **callback idempotente** del motor (ADR-003) → sin doble bloqueo, con auditoría centralizada.
- El nivel de **decisión** del GG (aprobar/rechazar el rol) sí es un nivel normal del motor con su tarea y bandeja unificada (RN-APRO-21).

Resultado: cronología propia del Rol (calendario absoluto) + idempotencia/auditoría centralizada del motor para el efecto. VAC-APRO-03 queda alineado con esta misma decisión.

## Consecuencias

**Positivas:**
- El modelo de SLA del motor permanece coherente (duración relativa) para los demás flujos.
- El efecto de bloqueo de cajas hereda la idempotencia y auditoría del motor (ADR-003).
- Sin claves de parámetro redundantes en Maestros.

**Negativas / trade-offs:**
- El Rol implementa su propio scheduler de vencimientos de calendario (lógica de módulo, no del motor).

## Revisión en

Si en el futuro otro módulo necesita deadlines de calendario absoluto, evaluar extraer ese scheduler a un componente transversal.
