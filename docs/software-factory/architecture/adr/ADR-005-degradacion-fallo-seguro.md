# ADR-005: Estrategia de degradación y fallo seguro (enforcement de seguridad y servicio de configuración)

| Campo | Valor |
|---|---|
| Estado | **Propuesto** — `⚠️ PENDIENTE APROBACIÓN TI` (política de disponibilidad vs seguridad) |
| Fecha | 30/05/2026 |
| Vacío que resuelve | VAC-SEGU-13 (degradación del enforcement) y criticidad BLOQUEANTE/DEGRADABLE de Maestros (VAC-MAES-08 / RN-MAES-19) |
| Decisores | Arquitecto de Software, Seguridad TI, PO |
| Documentos | ENT-MOD-SEGU-001 CU-SEGU-05 E1, ENT-MOD-MAES-001 RN-MAES-19 / CU-MAES-06 E1, arquitectura-nova.md §3.4/§7 |

## Contexto

Dos servicios transversales son consultados en el camino de casi toda operación:

- **Servicio de Autorización (Seguridad, CU-SEGU-05):** responde si un usuario puede ejecutar una acción sobre un ámbito. VAC-SEGU-13 pregunta qué hacer si **no responde**: ¿denegar todo (fallo seguro) o permitir con caché? Tensión disponibilidad vs seguridad.
- **Servicio de Configuración (Maestros, CU-MAES-06):** devuelve parámetros vigentes. El PO ya decidió criticidad **MIXTA** (RN-MAES-19, VAC-MAES-08): parámetros de impacto económico/legal = **BLOQUEANTE**; el resto = **DEGRADABLE**. Falta el patrón técnico que lo implemente coherentemente.

Ambos comparten el mismo dilema: degradar disponibilidad sin comprometer la integridad de negocio.

## Opciones consideradas

1. **Fallo abierto (permitir todo si el servicio no responde).**
   - Pros: máxima disponibilidad.
   - Contras: inaceptable para autorización (cualquiera podría aprobar/configurar) y para parámetros de impacto legal (bloqueo de cajas, tope de cuota). Descartado.

2. **Fallo cerrado total (denegar/bloquear todo siempre).**
   - Pros: máxima seguridad/integridad.
   - Contras: una caída del servicio paraliza incluso operaciones de lectura inofensivas → mala disponibilidad. Demasiado rígido.

3. **Degradación diferenciada por tipo de operación / criticidad del dato (recomendado).**
   - Pros: equilibra: fallo seguro donde importa (escritura/aprobación, parámetros BLOQUEANTES), caché donde es aceptable (lectura, parámetros DEGRADABLES).
   - Contras: requiere clasificar operaciones y parámetros; más lógica.

## Decisión

**Adoptar degradación diferenciada (opción 3) con fallo seguro por defecto en lo crítico.**

### A) Servicio de Autorización (VAC-SEGU-13)

- **Contexto de seguridad cacheado por sesión** (permisos + ámbito consolidado) en Redis con TTL corto, cargado al autenticar (CU-SEGU-02 paso 7) e invalidado ante cambio de rol/ámbito. La mayoría de las autorizaciones se resuelven contra este caché, no contra una llamada en vivo → reduce la dependencia.
- Si el servicio/caché **no puede resolver** la decisión:
  - **Acciones de escritura, aprobación, configuración, exportación de datos sensibles, cambio de roles → FALLO SEGURO: DENEGAR** (CU-SEGU-05 E1). No se ejecuta la acción.
  - **Acciones de solo lectura no sensibles → se permite con el contexto cacheado** si existe y no ha expirado; si no hay caché → denegar también (no se asume acceso).
- Todo denegado por degradación se **audita** (RN-SEGU-23) e idealmente alerta a operaciones.

### B) Servicio de Configuración (VAC-MAES-08 / RN-MAES-19)

Implementa la criticidad MIXTA ya decidida por el PO:

- **Parámetro BLOQUEANTE** (impacto económico/legal: `ROL_PLAZO_*`, `ROL_TOPE_CUOTA_ASESOR`, `DESC_DIAS_NO_COMPENSABLES`, límites por puesto, etc.): si el servicio no entrega el **valor vigente**, el módulo consumidor **NO ejecuta la operación** y muestra error claro. No se usa caché potencialmente desactualizado para decisiones de impacto legal.
- **Parámetro DEGRADABLE** (resto): el consumidor **usa el último valor en caché** (Redis / caché local del consumidor) y continúa, registrando que operó en modo degradado.
- La clasificación vive en el atributo `criticidad_consumo` del parámetro (ADR-004), no hardcodeada.
- **Vigencia:** el caché respeta la dimensión temporal (RN-MAES-14): se cachea el valor vigente a la fecha de referencia, no "el último valor sin fecha".

### Principio rector

> **Fallo seguro por defecto en operaciones que mutan estado o tienen impacto legal/económico; degradación con caché solo en lectura no sensible y en parámetros DEGRADABLES.** La disponibilidad nunca se compra a costa de la integridad de negocio o del control de acceso.

## Consecuencias

**Positivas:**
- Ninguna acción crítica se ejecuta sin autorización confirmada ni con un parámetro de impacto legal desactualizado.
- Las lecturas y operaciones DEGRADABLES siguen disponibles ante caídas parciales → buena disponibilidad percibida.
- Coherente con la decisión del PO (RN-MAES-19) y con el comportamiento ya especificado (CU-SEGU-05 E1, CU-MAES-06 E1).

**Negativas / trade-offs:**
- Ante una caída del servicio de autorización, las operaciones de escritura/aprobación quedan bloqueadas (es el comportamiento deseado, pero impacta la operación si la caída es prolongada → exige alta disponibilidad de Seguridad y monitoreo).
- Requiere mantener la clasificación de criticidad de parámetros al día.
- Caché de contexto de seguridad introduce ventana de invalidación (mitigada con TTL corto + invalidación por evento de cambio de rol/ámbito).

## Pendiente de confirmación de TI

- Confirmar el **principio fallo-seguro** para escritura/aprobación como política corporativa (disponibilidad vs seguridad). `⚠️ PENDIENTE APROBACIÓN TI`.
- TTL del caché de contexto de seguridad y SLA de disponibilidad objetivo del servicio de autorización (coordinar con DevOps / `requisitos-no-funcionales.md`).

## Revisión en

Tras definir los SLOs de disponibilidad con DevOps, o si la operación reporta bloqueos excesivos por degradación.
