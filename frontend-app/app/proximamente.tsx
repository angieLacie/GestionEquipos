import { useLocalSearchParams } from 'expo-router';
import { Placeholder } from '@/components/Placeholder';
import { colors } from '@/theme';

/**
 * Placeholder genérico parametrizado por título. Usado por las acciones por
 * asesor (estado/marcación, detalle, ficha/rol) aún no definidas.
 * TODO: definir acciones por asesor con la usuaria.
 */
export default function ProximamenteScreen() {
  const { titulo } = useLocalSearchParams<{ titulo?: string }>();
  return (
    <Placeholder
      titulo={titulo ?? 'Próximamente'}
      icon="construct-outline"
      color={colors.tile.aprobaciones}
    />
  );
}
