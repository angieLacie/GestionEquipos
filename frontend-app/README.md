# Nova — Frontend App (móvil)

App de campo para personal de tienda: marcación, firma (selfie), consultas, notificaciones.

## Stack previsto

| Capa | Tecnología |
|---|---|
| Framework | **React Native + Expo + TypeScript** |
| Hardware | cámara (selfie firma), GPS, push, offline parcial |
| API client | generado desde OpenAPI (compartido con `frontend-web`) |
| Auth | JWT Bearer (token de `/v1/segu/auth/login`) |

## Pendiente

- `npx create-expo-app@latest . -t expo-template-blank-typescript`
- Cliente API tipado compartido.
- Flujos de marcación / firma.

> Aún no inicializado. Comparte tipos / API client con `frontend-web` (no UI; RN usa componentes nativos).
