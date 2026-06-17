import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, ApiError } from '@/lib/api';
import { secureStorage } from '@/lib/secure-storage';
import type { Sesion } from '@/lib/types';

interface AuthState {
  sesion: Sesion | null;
  /** true mientras se rehidrata la sesión desde SecureStore al arrancar. */
  inicializando: boolean;
  signIn: (
    nombreUsuario: string,
    password: string,
    recordar: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  usuarioRecordado: string | null;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [inicializando, setInicializando] = useState(true);
  const [usuarioRecordado, setUsuarioRecordado] = useState<string | null>(null);

  // Rehidratación al arrancar.
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [s, recordado] = await Promise.all([
          secureStorage.loadSession(),
          secureStorage.getRememberedUser(),
        ]);
        if (!activo) return;
        setSesion(s);
        setUsuarioRecordado(recordado);
      } finally {
        if (activo) setInicializando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const signIn = useCallback(
    async (nombreUsuario: string, password: string, recordar: boolean) => {
      const res = await api.login(nombreUsuario.trim(), password);
      const nueva: Sesion = {
        token: res.token,
        idUsuario: res.idUsuario,
        nombreUsuario: res.nombreUsuario,
        requiereCambioPassword: res.requiereCambioPassword,
        roles: res.roles ?? [],
      };
      await secureStorage.saveSession(nueva);
      await secureStorage.setRememberedUser(recordar ? nombreUsuario.trim() : null);
      setUsuarioRecordado(recordar ? nombreUsuario.trim() : null);
      setSesion(nueva);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await secureStorage.clearSession();
    setSesion(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ sesion, inicializando, signIn, signOut, usuarioRecordado }),
    [sesion, inicializando, signIn, signOut, usuarioRecordado],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}

export { ApiError };
