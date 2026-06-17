import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Perfil } from '@/lib/perfil';

/**
 * HERRAMIENTA DE DESARROLLO — Override de "Ver como" perfil.
 *
 * Permite, SOLO en `__DEV__`, previsualizar la app con cualquiera de los dos
 * perfiles ('gestion' | 'campo') usando el único usuario de pruebas (admin),
 * cuyo rol real (R-ADM) siempre resolvería a 'gestion'.
 *
 * En producción (`!__DEV__`) este override NO aplica: `previewPerfil` queda
 * forzado en `null` y el setter es un no-op, por lo que el perfil real
 * derivado de los roles SIEMPRE manda. No exponer este control fuera de dev.
 */
interface PreviewPerfilState {
  /** Override activo (solo dev). `null` = sin override → usar perfil real. */
  previewPerfil: Perfil | null;
  setPreviewPerfil: (p: Perfil | null) => void;
}

const PreviewPerfilCtx = createContext<PreviewPerfilState | undefined>(
  undefined,
);

export function PreviewPerfilProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [previewPerfil, setPreviewPerfilState] = useState<Perfil | null>(null);

  const value = useMemo<PreviewPerfilState>(() => {
    if (!__DEV__) {
      // En producción el override no existe: perfil real siempre manda.
      return { previewPerfil: null, setPreviewPerfil: () => {} };
    }
    return { previewPerfil, setPreviewPerfil: setPreviewPerfilState };
  }, [previewPerfil]);

  return (
    <PreviewPerfilCtx.Provider value={value}>
      {children}
    </PreviewPerfilCtx.Provider>
  );
}

export function usePreviewPerfil(): PreviewPerfilState {
  const ctx = useContext(PreviewPerfilCtx);
  if (!ctx) {
    throw new Error(
      'usePreviewPerfil debe usarse dentro de <PreviewPerfilProvider>.',
    );
  }
  return ctx;
}
