# Nova — Gestión de Equipos

Plataforma de gestión de equipos de tienda (retail Cadena / Lukers, ~100 tiendas). Web + móvil + biometría.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `backend/` | API .NET 8 — monolito modular + hexagonal, SQL Server + EF Core. Ver [backend/README.md](backend/README.md). |
| `frontend-web/` | App web de gestión (React + Vite). Ver [frontend-web/README.md](frontend-web/README.md). |
| `frontend-app/` | App móvil de campo (React Native + Expo). Ver [frontend-app/README.md](frontend-app/README.md). |
| `docs/` | Documentación de la software factory: producto, análisis, arquitectura (ADRs), BD, diseño UX. |
| `integraciones/` | Integraciones externas. `rms-sap/`: orquestador legacy de guías SAP→RMS. |
| `prototipo-ux/`, `prototipo-ux-v2/` | Prototipos HTML de UX (referencia de diseño). |

## Stack

- **Backend:** .NET 8 (C#), SQL Server, EF Core 8, JWT, Argon2id. Estilo: monolito modular + hexagonal (ADR-006).
- **Web:** React + Vite + TypeScript.
- **Móvil:** React Native + Expo.

## Estado

Fase 0 (cimientos) en construcción. Módulo **Seguridad** implementado (usuarios, login, RBAC scoped, autorización, auditoría, recuperación OTP). Frontends aún no inicializados.
