# Nova — Backend (Gestión de Equipos)

Sistema de gestión de equipos de tienda (retail Cadena / Lukers, ~100 tiendas).

## Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Runtime | **.NET 8 (C#)** | LTS. Pinneado en `global.json`. |
| Estilo | **Monolito modular + Hexagonal + Event-Driven interno** | ADR-006. Un esquema BD por módulo. |
| BD | **SQL Server** | Portado desde el modelo PostgreSQL de `docs/.../modelo-datos-fase0.md` (ver tabla de equivalencias abajo). |
| ORM | **EF Core 8 (SqlServer)** | Migraciones por módulo, historial en su propio esquema. |
| Hashing | **Argon2id** (Isopoh) | ADR-002. |
| API | **Minimal APIs + OpenAPI/Swagger** | Contratos en `docs/.../api-contracts`. |

## Estructura

```
src/
  Nova.sln
  global.json                       # pin .NET 8
  BuildingBlocks/
    Nova.SharedKernel/              # Result, Error, Entity (sin dependencias)
  Modules/
    Seguridad/                      # bounded context [segu] — Fase 0, cimiento RBAC
      Nova.Seguridad.Domain/        # entidades + reglas (sin frameworks)
      Nova.Seguridad.Application/   # casos de uso + puertos (interfaces)
      Nova.Seguridad.Infrastructure/# EF Core, repos, Argon2 (adaptadores driven)
      Nova.Seguridad.Api/           # endpoints REST (adaptador driving)
  Nova.Bootstrap/                   # composition root (host Web API)
```

Regla de dependencias (hexagonal): `Domain ← Application ← {Infrastructure, Api} ← Bootstrap`.
El dominio no conoce EF ni ASP.NET. Los módulos se comunican por contrato/eventos, nunca por join cross-schema.

## Equivalencias PostgreSQL → SQL Server

El modelo de datos (`docs/software-factory/database/modelo-datos-fase0.md`) está escrito para PostgreSQL 16. Portado a SQL Server:

| PostgreSQL | SQL Server |
|---|---|
| `uuid` + `gen_random_uuid()` | `uniqueidentifier` (Guid en app) |
| `jsonb` | `nvarchar(max)` + funciones JSON / `ISJSON` |
| `citext` | columna con `COLLATE SQL_Latin1_General_CP1_CI_AI` |
| `ENUM` nativo | string + `HasConversion<string>()` (o tabla catálogo) |
| índice parcial `WHERE` | índice filtrado |
| `timestamptz` | `datetimeoffset` |

## Cómo correr

```powershell
# 1. Aplicar migración a SQL Server (ajusta la cadena en appsettings.json)
dotnet ef database update `
  --project Modules/Seguridad/Nova.Seguridad.Infrastructure `
  --startup-project Nova.Bootstrap `
  --context SeguridadDbContext

# 2. Levantar el host
dotnet run --project Nova.Bootstrap
# Swagger en https://localhost:xxxx/swagger
```

## Endpoints (Fase 0 — Seguridad, parcial)

| Método | Ruta | Caso de uso |
|---|---|---|
| POST | `/v1/segu/usuarios` | CU-SEGU-01 alta de usuario + credencial |
| POST | `/v1/segu/auth/login` | CU-SEGU-02 login local (bloqueo RN-SEGU-12, fallo seguro) |
| GET | `/health` | Liveness |

## Pendiente (siguiente)

- Seguridad: asignación rol-ámbito (RBAC scoped), sesión/JWT, OTP recuperación, jerarquía, delegación/suplencia, auditoría.
- Módulos Maestros (`maes`) y Aprobaciones (`apro`) — requieren cerrar specs EP-01/EP-02 primero.
- Outbox transaccional + worker (ADR-003).
- Frontends: `apps/web` (React + Vite) y `apps/mobile` (Expo).
