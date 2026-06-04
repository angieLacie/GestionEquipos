# ADR-006: Estilo arquitectónico — Monolito modular + Hexagonal + Event-Driven interno

| Campo | Valor |
|---|---|
| Estado | **Aceptado** |
| Fecha | 30/05/2026 |
| Decisores | Arquitecto de Software, Backend, DBA |
| Documentos | arquitectura-nova.md §1.1/§3, alcance-nova.md §3/§8 |

## Contexto

Nova tiene 10 módulos con fuerte transversalidad (Seguridad, Maestros, Aprobaciones consumidos por todos), efectos de negocio con impacto legal/económico que exigen consistencia transaccional, integraciones externas heterogéneas y poco maduras, y un volumen acotado (~100 tiendas, un equipo de producto entregando por fases). Hay que elegir el estilo arquitectónico.

## Opciones consideradas

1. **Microservicios (un servicio por módulo).**
   - Pros: escalado/despliegue independiente, aislamiento fuerte.
   - Contras: introduce consistencia distribuida y transacciones distribuidas justo donde el negocio penaliza la inconsistencia (bloqueo de cajas, SENIOR en RMS, días indemnizables); coste operativo (observabilidad, despliegue, red) desproporcionado para el volumen; latencia de red en las llamadas transversales constantes (autorizar, leer parámetro). Sobre-ingeniería para esta fase.

2. **Monolito tradicional en capas (sin límites de módulo fuertes).**
   - Pros: simple de empezar.
   - Contras: sin fronteras claras, los módulos se acoplan; difícil trabajar en paralelo; difícil extraer un módulo a futuro.

3. **Monolito modular + hexagonal por módulo + event-driven interno (recomendado).**
   - Pros: límites de bounded context explícitos (DDD) sin coste de red; transaccionalidad local fuerte; adaptadores aíslan integraciones externas; eventos internos desacoplan reacciones; preserva la ruta de extracción a servicio si un módulo lo necesita.
   - Contras: requiere disciplina para no romper las fronteras de módulo dentro del mismo proceso.

## Decisión

**Adoptar monolito modular, con cada módulo diseñado como bounded context hexagonal (puertos/adaptadores) y comunicación interna síncrona por contrato donde hay dependencia transaccional y asíncrona por eventos de dominio (outbox) donde es reacción/notificación.**

- Comunicación **síncrona por contrato interno**: autorizar (SEGU), leer parámetro (MAES), resolver aprobador (SEGU←APRO).
- Comunicación **asíncrona por eventos**: `AscensoAprobado` → habilitar Senior en Rol/Encargatura; `FlagSeniorCambiado`; vencimientos de SLA; callbacks de efecto (ADR-003).
- Las integraciones externas viven detrás de **adaptadores** (contratos-integracion.md); el dominio no las conoce.
- Candidato a extracción futura a servicio independiente: **Marcaciones** (pico biométrico). Su frontera hexagonal lo habilita sin reescribir el dominio.

## Consecuencias

**Positivas:**
- Consistencia transaccional fuerte donde el negocio la exige.
- Aislamiento conceptual y trabajo en paralelo por módulo contra contratos estables.
- Bajo coste operativo; ruta de extracción preservada.

**Negativas / trade-offs:**
- Disciplina arquitectónica necesaria para no acoplar módulos (mitigado con revisiones de fronteras y esquemas lógicos separados por contexto).
- Un único artefacto desplegable (mitigado: stateless + escalado horizontal, arquitectura-nova.md §7).

## Revisión en

Cuando un módulo (p. ej. Marcaciones) muestre necesidad real de escalado/despliegue independiente sostenido.
