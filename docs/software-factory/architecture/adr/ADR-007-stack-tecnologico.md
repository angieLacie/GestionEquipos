# ADR-007: Stack tecnológico

| Campo | Valor |
|---|---|
| Estado | **Propuesto** — `⚠️ PENDIENTE APROBACIÓN TI` (lenguaje base y stack de cliente) |
| Fecha | 30/05/2026 |
| Decisores | Arquitecto de Software, TI, Backend, Frontend |
| Documentos | arquitectura-nova.md §2, ADR-006 |

## Contexto

El estilo (ADR-006) es independiente del lenguaje, pero hay que proponer un stack concreto coherente con: dominio altamente relacional y transaccional, integración con AD/Entra ID para SSO (ADR-001), app web rica (calendario del Rol, bandejas), app móvil de campo (marcar/firmar), agente Windows en tienda con SDK biométrico, y operación enterprise de larga vida.

## Opciones consideradas

- **Backend:** .NET 8 (C#) vs Java 21 (Spring Boot) vs Node.js/TypeScript.
  - .NET/Java: ecosistema enterprise, LTS largo, ORM maduro, integración nativa con Entra ID, fuerte en transaccional. .NET además natural para el **Agente Windows** (worker service).
  - Node: ágil, pero menos idóneo para dominio transaccional pesado y agente Windows.
- **Base de datos:** PostgreSQL vs SQL Server vs Oracle. Relacional ACID obligatorio.
- **Cliente web:** Angular vs React (SPA rica).
- **Móvil:** Flutter vs React Native vs nativo.

## Decisión (propuesta)

| Capa | Propuesta | Justificación |
|---|---|---|
| Backend | **.NET 8 (LTS) / C#** (o Java 21 / Spring Boot 3 según skills de TI) | Enterprise, LTS, transaccional, integración Entra ID, natural para el Agente Windows. |
| Base de datos | **PostgreSQL 16** | ACID, relacional, JSONB para parámetros (LISTA/RANGO), réplicas de lectura. |
| Caché | **Redis** | Config, contexto de seguridad, rate limit, soporte degradación (ADR-005). |
| Mensajería interna | **Outbox transaccional (PostgreSQL) + worker** | Eventos at-least-once sin broker externo (ADR-003/006). |
| API | **REST + OpenAPI 3.0** | Contratos versionados (`api-contracts/`). |
| Web | **SPA (Angular o React)** | App de gestión rica. |
| Móvil | **Flutter o React Native** | Cámara (selfie firma), GPS, push, offline parcial. |
| Agente de tienda | **.NET Worker Service (Windows)** + cliente SDK biométrico | Alertas nativas + puente biométrico/POS local. |
| Identidad | **OIDC (Entra ID / Keycloak)** + local fallback | ADR-001. |
| Observabilidad | **Logs estructurados + OpenTelemetry** | Trazas de cadenas Nova→externos (arquitectura-nova.md §8). |

La decisión del lenguaje base (.NET vs Java) y del framework de cliente debe alinearse con los **skills del equipo de TI**; la arquitectura no depende de ello.

## Consecuencias

**Positivas:** stack enterprise probado, soporte LTS largo, integración natural con identidad corporativa y con el agente Windows.

**Negativas / trade-offs:** si TI carece de skills .NET/Java, hay coste de adopción; la elección final puede cambiar el detalle (no la arquitectura).

## Pendiente de confirmación de TI

- Lenguaje base (.NET vs Java) según skills internos.
- Motor de BD si la organización ya tiene licencia/estándar (SQL Server/Oracle) — el modelo relacional es portable.
- Framework de SPA y de móvil.

## Revisión en

Antes del inicio de construcción de Fase 0, tras confirmar skills y estándares de TI.
