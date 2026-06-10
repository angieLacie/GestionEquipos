# Nova — Frontend Web

App de gestión (escritorio) para administración, bandejas de aprobación, Rol de personal, descansos, etc.

## Stack previsto

| Capa | Tecnología |
|---|---|
| Framework | **React + Vite + TypeScript** |
| Estado | (a definir: Zustand / TanStack Query) |
| API client | generado desde OpenAPI (`docs/software-factory/architecture/api-contracts`) |
| Auth | JWT Bearer (token de `/v1/segu/auth/login`) |

## Pendiente

- `npm create vite@latest . -- --template react-ts`
- Cliente API tipado desde los contratos OpenAPI.
- Migrar pantallas del prototipo (`prototipo-ux-v2/`) a componentes React.

> Aún no inicializado. Comparte tipos / API client con `frontend-app` (no UI).
