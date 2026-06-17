import Constants from 'expo-constants';

/**
 * Base URL de la API. Orden de resolución:
 *  1. EXPO_PUBLIC_API_URL (embebida en build / dev)
 *  2. extra.apiUrl de app.config.ts
 *  3. fallback IP LAN de ejemplo
 *
 * En dev con dispositivo físico: usar la IP LAN de la PC (ej. http://192.168.1.100:5109),
 * NO localhost. Ver docs/software-factory/frontend/app-movil-setup.md.
 */
const extraApiUrl = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? extraApiUrl ?? 'http://192.168.1.100:5109';

/** Timeout por defecto de las peticiones (ms). */
export const REQUEST_TIMEOUT = 15000;
