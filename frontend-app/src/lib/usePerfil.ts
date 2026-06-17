import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePreviewPerfil } from '@/context/PreviewPerfilContext';
import { perfilDeRoles, type Perfil } from '@/lib/perfil';

interface PerfilInfo {
  /** Perfil derivado de los roles reales del usuario. */
  perfilReal: Perfil;
  /** Perfil que la UI debe usar (real, o el override de dev si está activo). */
  perfilEfectivo: Perfil;
  /** true si se está mostrando un perfil distinto al real (solo dev). */
  enPreview: boolean;
}

/**
 * Resuelve el perfil efectivo para la UI. Fuera de `__DEV__` el override de
 * preview es siempre `null`, por lo que `perfilEfectivo === perfilReal`.
 */
export function usePerfil(): PerfilInfo {
  const { sesion } = useAuth();
  const { previewPerfil } = usePreviewPerfil();

  return useMemo(() => {
    const perfilReal = perfilDeRoles(sesion?.roles ?? []);
    const perfilEfectivo = previewPerfil ?? perfilReal;
    return {
      perfilReal,
      perfilEfectivo,
      enPreview: previewPerfil !== null && previewPerfil !== perfilReal,
    };
  }, [sesion?.roles, previewPerfil]);
}

/**
 * Alias semántico solicitado por el contrato del módulo. Devuelve el perfil
 * que la UI debe usar: el override de preview (solo en `__DEV__` y si está
 * activo) o, en su defecto, el perfil real derivado de los roles.
 */
export function usePerfilActivo(): PerfilInfo {
  return usePerfil();
}
