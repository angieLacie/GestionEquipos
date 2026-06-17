import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Config dinámica de la app "Gestión de Equipos" (Nova).
 *
 * La URL del backend se lee de la variable de entorno EXPO_PUBLIC_API_URL.
 * - En dev: el backend corre en la PC en :5109. Desde un dispositivo físico
 *   `localhost` NO funciona; hay que usar la IP LAN de la PC (ej. http://192.168.x.x:5109)
 *   o un túnel (expo start --tunnel). Ver docs/software-factory/frontend/app-movil-setup.md.
 * - En prod: definir EXPO_PUBLIC_API_URL en el perfil de EAS Build (eas.json).
 *
 * Las variables EXPO_PUBLIC_* quedan embebidas en el bundle del cliente: NO usar
 * para secretos. Aquí solo va la base URL pública de la API.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.100:5109';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Gestión de Equipos',
  slug: 'gestion-equipos',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'gestionequipos',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tandemeje.gestionequipos',
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.tandemeje.gestionequipos',
    adaptiveIcon: {
      backgroundColor: '#4f46e5',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#4f46e5',
      },
    ],
  ],
  extra: {
    apiUrl: API_URL,
    eas: {
      // El usuario debe ejecutar `eas init` para generar este projectId.
      // projectId: '00000000-0000-0000-0000-000000000000',
    },
  },
});
