# App móvil "Gestión de Equipos" — Setup, dev y publicación

App React Native + Expo (managed) + TypeScript con expo-router. Código en `frontend-app/`.

## 1. Stack y decisiones

| Aspecto | Decisión | Justificación |
|---|---|---|
| Framework | React Native + **Expo managed** SDK 56 | App de campo, un solo codebase iOS+Android, OTA y EAS Build sin Xcode/Android Studio locales. |
| Lenguaje | TypeScript **strict** | `tsc --noEmit` en CI; tipos compartidos del dominio Nova. |
| Routing | **expo-router** (file-based) | Deep links nativos, guards declarativos, layouts anidados. |
| Auth | JWT Bearer | Login real `POST /v1/segu/auth/login`. |
| Token | **expo-secure-store** | Keychain (iOS) / Keystore (Android). Nunca AsyncStorage ni texto plano. |
| Plataformas mínimas | iOS 15.1+ / Android 7.0 (API 24)+ | Mínimos por defecto de Expo SDK 56. |

> Nota: `react-native-reanimated` se omitió en v1 porque su versión actual aún no
> declara soporte para RN 0.85; v1 no usa animaciones complejas. Reintroducir cuando
> publiquen la versión compatible.

## 2. Estructura

```
frontend-app/
  app.config.ts            # identidad app + lee EXPO_PUBLIC_API_URL
  eas.json                 # perfiles development / preview / production + submit
  app/                     # rutas (expo-router)
    _layout.tsx            # AuthProvider + SafeAreaProvider + guard de rutas
    (auth)/login.tsx       # login real
    (tabs)/{index,buscar,perfil}.tsx + _layout.tsx (tab bar)
    gestion-equipos.tsx    # pantalla de detalle (stack)
  src/
    context/AuthContext.tsx
    lib/{api,config,secure-storage,types,format,gestion-equipos}.ts
    theme/{colors,index}.ts
```

## 3. Variable de entorno de la API

La base URL se lee de `EXPO_PUBLIC_API_URL` (las `EXPO_PUBLIC_*` quedan embebidas en el
bundle del cliente → solo URLs públicas, **nunca secretos**). Resolución en `src/lib/config.ts`:
`EXPO_PUBLIC_API_URL` → `extra.apiUrl` de `app.config.ts` → fallback IP de ejemplo.

## 4. Correr en desarrollo

```bash
cd frontend-app
npm install
EXPO_PUBLIC_API_URL=http://192.168.X.X:5109 npx expo start
```

- El backend de dev corre en la PC en `:5109`.
- **`localhost` NO funciona desde un dispositivo/Expo Go**: en el teléfono `localhost`
  es el propio teléfono. Usa la **IP LAN de la PC** (`ipconfig` → IPv4) o un túnel:
  `npx expo start --tunnel`.
- Asegúrate de que el firewall de Windows permita conexiones entrantes al puerto 5109
  y que PC y teléfono estén en la **misma red Wi-Fi**.
- Expo Go alcanza para v1 (no hay módulos nativos custom). Si se agregan, usar dev client.

### Credenciales de prueba
Usuario seed del backend: `admin` / `Nova2026!` (según entorno de dev de Nova).

## 5. Validación local

```bash
npm run typecheck     # tsc --noEmit (debe pasar limpio)
npx expo export -p ios    # valida que Metro bundlea (genera dist/)
npx expo export -p android
```

## 6. Publicación con EAS

Requiere **cuentas del usuario**: Apple Developer Program (99 USD/año) y/o
Google Play Console (25 USD único). Anthropic/CLI no provee estas cuentas ni credenciales.

### 6.1 Setup inicial (una vez)
```bash
npm i -g eas-cli
eas login                       # cuenta Expo
cd frontend-app
eas init                        # crea el projectId → pégalo en app.config.ts (extra.eas.projectId)
```

### 6.2 Builds
```bash
# Desarrollo (dev client, distribución interna)
eas build -p android --profile development
eas build -p ios     --profile development

# Preview (APK Android + simulador iOS, para QA/beta interno)
eas build -p android --profile preview     # genera APK
eas build -p ios     --profile preview     # build de simulador

# Producción (store)
eas build -p android --profile production  # AAB
eas build -p ios     --profile production  # IPA (EAS gestiona la firma/credenciales tras eas login)
```

Ajustar `EXPO_PUBLIC_API_URL` por perfil en `eas.json` (hoy hay placeholders de
staging/producción que el usuario debe reemplazar por las URLs reales).

### 6.3 Submit a las stores
```bash
# Google Play (requiere service account JSON con permisos en Play Console)
#   -> guardar como frontend-app/google-service-account.json (ya está en .gitignore)
eas submit -p android --profile production --latest

# App Store / TestFlight (requiere Apple ID + App Store Connect App ID + Team ID)
#   -> completar los placeholders en eas.json > submit.production.ios
eas submit -p ios --profile production --latest
```

### 6.4 Distribución beta
- **TestFlight** (iOS): tras `eas submit -p ios`, invitar testers desde App Store Connect.
- **Internal testing** (Android): `track: internal` en `eas.json`; invitar testers en Play Console.
- Builds `preview` con `distribution: internal` generan un enlace de instalación directa de EAS.

## 7. Cumplimiento (pendientes antes de publicar)

- **iOS Privacy Manifest** y **Android Data Safety**: declarar que la app guarda
  credenciales en Keychain/Keystore y consume la API. Completar al añadir cámara/GPS/push.
- `usesNonExemptEncryption: false` ya declarado (solo HTTPS estándar).
- Política de privacidad publicada (URL requerida por ambas stores).
- Sin secretos en el código fuente del cliente: confirmado (solo URL pública vía env).

## 8. Estado de las pantallas (v1)

| Pantalla | Estado | Datos |
|---|---|---|
| Login | Completa | **Real** (`/v1/segu/auth/login`) |
| Home | Completa | Sesión real; tiles salvo "Gestión Equipos" → "Próximamente" |
| Gestión de Equipos | Completa | Intenta `GET /v1/maes/empleados/roster` y agrega por zona; cae a **mock** si el endpoint no existe o el shape no alcanza (seam `// TODO: backend resumen por zona` en `src/lib/gestion-equipos.ts`) |
| Buscar / Perfil | Placeholder / Perfil con logout | — |
