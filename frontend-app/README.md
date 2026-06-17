# Gestión de Equipos — App móvil (Nova)

App de campo para personal de tienda. Construida con **React Native + Expo (managed) + TypeScript** y **expo-router** (file-based routing). Autenticación **JWT Bearer** con token en **expo-secure-store** (Keychain/Keystore).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React Native 0.85 + Expo SDK 56 + TypeScript (strict) |
| Routing | expo-router (file-based) con guard de auth |
| Auth | JWT Bearer (`POST /v1/segu/auth/login`) |
| Token | expo-secure-store (Keychain iOS / Keystore Android) |
| UI | @expo/vector-icons, expo-linear-gradient, safe-area-context |
| Build/Distribución | EAS Build + EAS Submit |

## Identidad

- Nombre visible: **Gestión de Equipos** · slug `gestion-equipos`
- Bundle/Package: `com.tandemeje.gestionequipos`
- Versión 1.0.0 · orientación portrait · marca índigo→azul (`#4f46e5`→`#2563eb`)

## Correr en desarrollo

```bash
npm install
# Define la URL del backend (IP LAN de tu PC, NO localhost):
EXPO_PUBLIC_API_URL=http://192.168.X.X:5109 npx expo start
```

El backend de dev corre en la PC en `:5109`. Desde un dispositivo físico o Expo Go,
`localhost` apunta al teléfono, no a tu PC: usa la **IP LAN** o `npx expo start --tunnel`.

## Estructura

```
app/                      # rutas expo-router
  _layout.tsx             # AuthProvider + guard (login vs tabs)
  (auth)/login.tsx        # login real
  (tabs)/                 # área autenticada con tab bar
    index.tsx             # Home
    buscar.tsx · perfil.tsx
  gestion-equipos.tsx     # detalle (stack)
src/
  lib/      # api, config, secure-storage, types, format, gestion-equipos
  context/  # AuthContext
  theme/    # colores de marca, spacing
```

## Publicación

Ver `docs/software-factory/frontend/app-movil-setup.md` para los pasos completos de
`eas build` / `eas submit` (requieren cuentas Apple Developer / Google Play del usuario).
