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
backend/                            # (raíz del repo tiene global.json — pin .NET 8)
  Nova.sln
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

| Método | Ruta | Caso de uso | Auth |
|---|---|---|---|
| POST | `/v1/segu/usuarios` | CU-SEGU-01 alta de usuario + credencial | — |
| POST | `/v1/segu/auth/login` | CU-SEGU-02 login local (bloqueo RN-SEGU-12, fallo seguro, emite JWT) | anónimo |
| POST | `/v1/segu/asignaciones` | CU-SEGU-03 asignar rol con ámbito (coherencia RN-SEGU-05) | Bearer |
| POST | `/v1/segu/autorizar` | CU-SEGU-05 enforcement permiso+ámbito (RN-SEGU-21/22, fallo seguro) | Bearer |
| POST | `/v1/segu/auth/recuperacion/solicitar` | CU-SEGU-10 solicitar OTP (anti-enumeración RN-SEGU-32) | anónimo |
| POST | `/v1/segu/auth/recuperacion/verificar` | CU-SEGU-10 verificar OTP → token un-uso (RN-SEGU-35/37) | anónimo |
| POST | `/v1/segu/auth/recuperacion/restablecer` | CU-SEGU-10 nueva contraseña con token (RN-SEGU-38) | anónimo |
| POST | `/v1/segu/delegaciones` | CU-SEGU-06 delegar facultad (compatibilidad RN-SEGU-28) | Bearer |
| POST | `/v1/segu/suplencias` | CU-SEGU-07 designar suplente (compatibilidad RN-SEGU-31) | Bearer |
| GET | `/health` | Liveness | — |

Sesión por **JWT** (HS256); configurar `Jwt:SecretKey` en producción (mín. 32 bytes).
**Auditoría** append-only (`segu.auditoria_seguridad`): login OK/fallido, bloqueo, denegación de acceso, fases de recuperación. Inmutabilidad real requiere DENY UPDATE/DELETE en BD.
**OTP**: código numérico cripto, hasheado (Argon2id), nunca expuesto; notificador en log solo en dev (`NotificadorCorreoLog`).

## Pendiente (siguiente)

- Seguridad: normalizar `segu.asignacion_zona` (hoy JSON), store de sesión + cierre en cambio de contraseña (RN-SEGU-38), historial no-reuso de contraseña (RN-SEGU-10), DENY UPDATE/DELETE en tablas de auditoría, anti-ciclo de jerarquía en alta de nodos.
- Política OTP/PWD: hoy `OtpPolicy` con defaults; migrar a parámetros `SEGU_OTP_*`/`SEGU_PWD_*` de Maestros.
- Permisos y niveles de autoridad: hoy `PermisoResolverSeed` y `NivelAutoridadResolverSeed` (catálogos en memoria); migrar a `maes.rol_permiso` / `maes.rol_catalogo` cuando exista Maestros.
- Notificador de correo real (reemplazar stub).
- Próximo módulo: **Maestros** (`maes`) — desbloquea los resolvers provisionales.
- Módulos Maestros (`maes`) y Aprobaciones (`apro`) — requieren cerrar specs EP-01/EP-02 primero.
- Outbox transaccional + worker (ADR-003).
- Frontends: `../frontend-web` (React + Vite) y `../frontend-app` (Expo).
