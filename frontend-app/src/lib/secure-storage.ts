import * as SecureStore from 'expo-secure-store';
import type { Sesion } from './types';

const SESSION_KEY = 'nova.sesion';
// El usuario recordado se guarda aparte: es solo el nombre de usuario (no sensible),
// pero lo mantenemos en SecureStore por simplicidad y consistencia.
const REMEMBERED_USER_KEY = 'nova.usuario_recordado';

/**
 * Almacenamiento seguro de la sesión.
 * El token JWT y los datos de sesión van a Keychain (iOS) / Keystore (Android)
 * vía expo-secure-store. NUNCA en AsyncStorage ni archivos sin cifrar.
 */
export const secureStorage = {
  async saveSession(sesion: Sesion): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sesion));
  },

  async loadSession(): Promise<Sesion | null> {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Sesion;
    } catch {
      // Dato corrupto: lo limpiamos.
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },

  async getRememberedUser(): Promise<string | null> {
    return SecureStore.getItemAsync(REMEMBERED_USER_KEY);
  },

  async setRememberedUser(usuario: string | null): Promise<void> {
    if (usuario) {
      await SecureStore.setItemAsync(REMEMBERED_USER_KEY, usuario);
    } else {
      await SecureStore.deleteItemAsync(REMEMBERED_USER_KEY);
    }
  },
};
