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

## Perfiles (multi-perfil por rol)

La app es **una sola** pero adapta navegación y contenido al **perfil** derivado del rol del usuario autenticado. No hay dos apps ni dos builds: el mismo binario sirve a ambos públicos.

### Mapeo rol → perfil

`src/lib/perfil.ts`:

- `Perfil = 'gestion' | 'campo'`
- `perfilDeRoles(roles: string[]): Perfil` → `'gestion'` si los roles del usuario **intersectan** `ROLES_GESTION`; en caso contrario `'campo'`. Comparación case-insensitive y tolerante a espacios.
- `ROLES_GESTION = ['R-ADM', 'R-GG', 'R-GZ', 'R-GT']`

| Rol (id) | Significado | Perfil |
|---|---|---|
| `R-ADM` | Administrador / Admin de Ventas (confirmado) | Gestión |
| `R-GG` | Gerente General (por convención) | Gestión |
| `R-GZ` | Gerente de Zona (por convención) | Gestión |
| `R-GT` | Gerente de Tienda (por convención) | Gestión |
| cualquier otro | Senior / colaborador / empleado | Campo |

> **TODO:** confirmar ids de rol reales con Seguridad. Hoy solo `R-ADM` está confirmado; `R-GG/R-GZ/R-GT` son por convención (marcado con `// TODO` en `perfil.ts`).

### Tiles por perfil (Home — `app/(tabs)/index.tsx`)

El Home elige set de tiles, saludo y label de perfil ("Perfil: Gestión" / "Perfil: Campo") según el **perfil activo** (`usePerfilActivo` / `usePerfil`).

**GESTIÓN** (gerentes/supervisores):

| Tile | Ruta | Estado |
|---|---|---|
| Gestión Equipos (azul) | `/gestion-equipos` | Pantalla existente (real + fallback mock) |
| Vacaciones | — | Alert "Próximamente" |
| Ampliaciones | — | Alert "Próximamente" |
| Aprobaciones | — | Alert "Próximamente" |
| Licencias | — | Alert "Próximamente" |

**CAMPO** (colaborador de tienda) — rutas nuevas placeholder, sin backend:

| Tile | Ícono | Ruta | Estado |
|---|---|---|---|
| Mi marcación | `finger-print` | `/mi-marcacion` | Placeholder "Próximamente" |
| Mi rol y descansos | `calendar` | `/mi-rol` | Placeholder "Próximamente" |
| Mis solicitudes | `document-text` | `/mis-solicitudes` | Placeholder "Próximamente" |
| Notificaciones | `notifications` | `/notificaciones` | Placeholder "Próximamente" |

Las pantallas de Campo usan el componente reutilizable `src/components/Placeholder.tsx` (header con back + ícono grande + nombre de módulo + "Próximamente"), mismo estilo de marca que los tiles de gestión sin backend.

### Pantalla Perfil (`app/(tabs)/perfil.tsx`)

Muestra nombre, rol(es), **perfil resuelto** (real) y un chip "Perfil: …" del perfil activo. Conserva el cerrar-sesión real (`signOut` de `AuthContext`).

### Override de preview — SOLO desarrollo

Para poder ver ambos perfiles con el único usuario de pruebas (`admin`, cuyo rol real `R-ADM` siempre resuelve a `gestion`):

- `src/context/PreviewPerfilContext.tsx` — `PreviewPerfilProvider` envuelve la zona autenticada (montado en `app/_layout.tsx` dentro de `AuthProvider`). Expone `previewPerfil` y `setPreviewPerfil`.
- En **producción** (`!__DEV__`) el provider fuerza `previewPerfil = null` y el setter es no-op: **el perfil real siempre manda**.
- `src/lib/usePerfil.ts` — hook `usePerfil()` y alias semántico `usePerfilActivo()`. Devuelven `{ perfilReal, perfilEfectivo, enPreview }`. `perfilEfectivo = previewPerfil ?? perfilReal`.
- En **Perfil**, dentro de `__DEV__`, hay un selector segmentado "Ver como: Real / Gestión / Campo" (marcado como herramienta de desarrollo). Cambiar el override re-renderiza el Home con el set de tiles del perfil seleccionado. Este bloque **no se renderiza** en producción.

## Gestión de Equipos (drill-down + buscador + detalle tienda)

Evolución del módulo Gestión de Equipos a 3 pantallas con jerarquía **zona → tienda → asesores**, replicando el diseño objetivo. Estilo nativo existente (gradiente índigo en headers, `@expo/vector-icons`, safe-area, `src/theme`).

### Pantallas y rutas
- `app/gestion-equipos.tsx` — **Lista con drill-down**. Header gradiente con back + lupa (abre el buscador modal) + título "GESTIÓN DE EQUIPOS". Tira de 6 KPIs globales. Lista por **zona expandible** (chevron) → al abrir muestra sus **tiendas expandibles** → al abrir muestra sus **asesores inline** (`AsesorRow`). Footer fijo "TOTAL GENERAL · plantilla · activos · tiendas · DM/VAC/LIC" + cobertura% global.
- `app/tienda/[id].tsx` — **Detalle de tienda** (ruta stack, sin tab bar). Header gradiente con back + nombre tienda + subtítulo "Detalle de la tienda" + menú "…" (placeholder). 6 KPIs de esa tienda + "Listado de asesores" (mismas filas `AsesorRow`). Recarga el roster y localiza la tienda por `id` con `buscarTienda()`.
- `app/proximamente.tsx` — Placeholder genérico parametrizado por `titulo` (reusa `components/Placeholder`). Destino temporal de las acciones por asesor y del menú "…".

Rutas registradas en `app/_layout.tsx` (`tienda/[id]`, `proximamente`) con animación `slide_from_right`.

### Componentes reutilizables nuevos (`src/components/gestion/`)
- `KpiStrip.tsx` — `KpiStrip`, `Chip`, `ChipsEstado` (tira de 6 KPIs + chips DM/VAC/LIC). Compartido por la lista y el detalle de tienda.
- `AsesorRow.tsx` — fila de asesor: avatar de iniciales, nombre, **badge "Senior"** (morado), línea "Vigencia: dd/mm/aaaa – dd/mm/aaaa" cuando existe, y **3 botones-ícono**: (a) estado/marcación (círculo, ámbar si activo), (b) detalle (flecha →), (c) ficha/rol (documento). Usada en drill-down y detalle de tienda.
- `BuscadorModal.tsx` — modal de búsqueda combinada: tiendas (ícono tienda, "Tienda · {encargado}") + empleados (avatar iniciales, puesto · tienda), filtrado en vivo. Tocar tienda → detalle de tienda; tocar empleado → placeholder.

### Datos: real vs mock (`src/lib/gestion-equipos.ts`)
- **Real** (desde `GET /v1/maes/empleados/roster`): jerarquía zona → tienda → asesores. Por asesor se leen `nombreCompleto`, `puesto`, `esSenior` (o puesto que contenga "SENIOR"), `estado` (ACTIVO/DM/VAC/LIC) y `vigenciaDesde/Hasta` (acepta ISO o dd/mm/aaaa). Activos, cobertura% y DM/VAC/LIC se **agregan** desde los asesores reales (`kpisDesdeAsesores` → `kpisDesdeTiendas` → `kpisDesdeZonas`).
- **Mock con seam** (`// TODO: backend resumen`):
  - **Encargado de tienda**: el roster no trae un campo dedicado; se toma el primer senior o el primer asesor de la tienda. Si el backend lo expone, usarlo.
  - **Vigencia por asesor**: si el roster no la trae, queda sin mostrar (real) o se mockea en el fallback completo.
  - **Fallback completo**: si el endpoint no responde (404/5xx/shape insuficiente) se genera una jerarquía de ejemplo determinista (PRNG por hash de zona/tienda) y se muestra el banner "Datos de ejemplo". Errores de red/401 se propagan a la UI (no se enmascaran).
- `aResumenZonas()` y `buscarTienda()` exportados como helpers (compat agregado por zona y lookup de tienda).

### Acciones por asesor — PENDIENTES de definir con la usuaria
Los **3 botones-ícono** (estado/marcación, detalle, ficha/rol) y el menú "…" de tienda abren hoy el placeholder `app/proximamente.tsx` con el texto de la acción. Marcado en código con `// TODO: definir acciones por asesor con la usuaria` en `gestion-equipos.tsx` y `tienda/[id].tsx`. Falta acordar: destino del detalle del asesor, qué muestra "ficha/rol" y el comportamiento del botón de estado/marcación.

### Verificación
- `npx tsc --noEmit` — pasa sin errores.
- `npx expo export --platform android` — bundle OK (`dist/`, ~3.1MB hbc).
- Auth/perfiles y demás pantallas intactos (solo se añadieron rutas nuevas; no se tocó el guard de sesión).
