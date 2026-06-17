import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AsesorItem } from '@/lib/types';
import type { OpcionTienda } from '@/lib/gestion-equipos';
import {
  TIPOS_VENTA,
  type TipoConvenio,
  type TipoVenta,
  marcarSenior,
  trasladar,
  crearConvenioEncargatura,
} from '@/lib/acciones-asesor';
import { colors, fontSize, radius, spacing } from '@/theme';
import { BottomSheet } from '@/components/BottomSheet';
import { DateField, FieldLabel, Segmented, Select, fechaValida } from './AccionFields';

/** Acción por asesor disparada desde los 3 botones-ícono de AsesorRow. */
export type AccionAsesor = 'estado' | 'detalle' | 'ficha';

interface Props {
  /** Acción activa (null = ninguna hoja abierta). */
  accion: AccionAsesor | null;
  asesor: AsesorItem | null;
  /** Tiendas para los selects (zona->tienda aplanada). */
  tiendas: OpcionTienda[];
  /** id de la tienda actual del asesor (default del select TIENDA en Marcar Senior). */
  tiendaActualId?: string;
  onClose: () => void;
}

/**
 * Orquesta las 3 hojas de acción por asesor (Marcar Senior, Traslado,
 * Conv. Encargatura). El submit es MOCK: valida, llama a la función mock,
 * muestra feedback de éxito y cierra.
 *
 * // TODO: conectar a backend (módulos Encargatura/Traslados/Ascenso aún no existen)
 */
export function AccionesAsesorSheets({ accion, asesor, tiendas, tiendaActualId, onClose }: Props) {
  const nombre = asesor?.nombreCompleto ?? '';
  const opcTiendas = tiendas.map((t) => ({ value: t.id, label: t.nombre }));

  // Estado de envío y feedback de éxito (banner "✓ Registrado (demo)").
  const [submitting, setSubmitting] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  // --- Marcar Senior ---
  const [seniorTienda, setSeniorTienda] = useState<string | null>(null);
  const [seniorTipo, setSeniorTipo] = useState<TipoVenta>('ASESORIA');
  const [seniorDesde, setSeniorDesde] = useState('');
  const [seniorHasta, setSeniorHasta] = useState('');

  // --- Traslado ---
  const [trasladoTienda, setTrasladoTienda] = useState<string | null>(null);
  const [trasladoDesde, setTrasladoDesde] = useState('');
  const [trasladoHasta, setTrasladoHasta] = useState('');

  // --- Convenio Encargatura ---
  const [convTipo, setConvTipo] = useState<TipoConvenio>('ENCARGATURA');
  const [convTienda, setConvTienda] = useState<string | null>(null);
  const [convInicio, setConvInicio] = useState('');

  // Reinicia el formulario cada vez que se abre una acción para un asesor.
  useEffect(() => {
    if (!accion) return;
    setExito(null);
    setSubmitting(false);
    setSeniorTienda(tiendaActualId ?? null);
    setSeniorTipo('ASESORIA');
    setSeniorDesde('');
    setSeniorHasta('');
    setTrasladoTienda(null);
    setTrasladoDesde('');
    setTrasladoHasta('');
    setConvTipo('ENCARGATURA');
    setConvTienda(null);
    setConvInicio('');
  }, [accion, asesor?.id, tiendaActualId]);

  if (!accion || !asesor) return null;

  const cerrar = () => {
    if (submitting) return;
    onClose();
  };

  // Cada submit valida campos requeridos; deshabilitado mientras inválido.
  const seniorValido =
    !!seniorTienda && fechaValida(seniorDesde) && fechaValida(seniorHasta);
  const trasladoValido =
    !!trasladoTienda && fechaValida(trasladoDesde) && fechaValida(trasladoHasta);
  const convValido = !!convTienda && fechaValida(convInicio);

  async function ejecutar(fn: () => Promise<{ ref: string }>) {
    setSubmitting(true);
    try {
      const r = await fn();
      setExito(`✓ Registrado (demo) · ${r.ref}`);
      // Cierra tras mostrar el feedback brevemente.
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 900);
    } catch {
      setSubmitting(false);
      setExito('No se pudo registrar. Intenta nuevamente.');
    }
  }

  // === Marcar Senior ===
  if (accion === 'estado') {
    return (
      <BottomSheet
        visible
        title={`Marcar Senior — ${nombre}`}
        confirmLabel="Marcar como Senior"
        confirmDisabled={!seniorValido}
        submitting={submitting}
        onClose={cerrar}
        onConfirm={() =>
          void ejecutar(() =>
            marcarSenior({
              idAsesor: asesor.id,
              idTienda: seniorTienda!,
              tipoVenta: seniorTipo,
              desde: seniorDesde,
              hasta: seniorHasta,
            }),
          )
        }
      >
        <ExitoBanner texto={exito} />
        <View>
          <FieldLabel>TIENDA</FieldLabel>
          <Select
            options={opcTiendas}
            value={seniorTienda}
            placeholder="Seleccionar tienda…"
            onChange={setSeniorTienda}
          />
        </View>
        <View>
          <FieldLabel>TIPO DE VENTA</FieldLabel>
          <Select
            options={TIPOS_VENTA}
            value={seniorTipo}
            onChange={(v) => setSeniorTipo(v as TipoVenta)}
          />
        </View>
        <View>
          <FieldLabel>RANGO DE FECHAS</FieldLabel>
          <View style={styles.rango}>
            <DateField value={seniorDesde} placeholder="Desde" onChange={setSeniorDesde} />
            <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
            <DateField value={seniorHasta} placeholder="Hasta" onChange={setSeniorHasta} />
          </View>
        </View>
      </BottomSheet>
    );
  }

  // === Traslado ===
  if (accion === 'detalle') {
    return (
      <BottomSheet
        visible
        title={`Traslado — ${nombre}`}
        confirmLabel="Confirmar traslado"
        confirmDisabled={!trasladoValido}
        submitting={submitting}
        onClose={cerrar}
        onConfirm={() =>
          void ejecutar(() =>
            trasladar({
              idAsesor: asesor.id,
              idTiendaDestino: trasladoTienda!,
              desde: trasladoDesde,
              hasta: trasladoHasta,
            }),
          )
        }
      >
        <ExitoBanner texto={exito} />
        <View>
          <FieldLabel>TIENDA DESTINO</FieldLabel>
          <Select
            options={opcTiendas}
            value={trasladoTienda}
            placeholder="Seleccionar tienda…"
            onChange={setTrasladoTienda}
          />
        </View>
        <View>
          <FieldLabel>RANGO DE FECHAS</FieldLabel>
          <View style={styles.rango}>
            <DateField value={trasladoDesde} placeholder="Desde" onChange={setTrasladoDesde} />
            <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
            <DateField value={trasladoHasta} placeholder="Hasta" onChange={setTrasladoHasta} />
          </View>
        </View>
      </BottomSheet>
    );
  }

  // === Conv. Encargatura ===
  return (
    <BottomSheet
      visible
      title={`Conv. Encargatura — ${nombre}`}
      confirmLabel="Confirmar convenio"
      confirmDisabled={!convValido}
      submitting={submitting}
      onClose={cerrar}
      onConfirm={() =>
        void ejecutar(() =>
          crearConvenioEncargatura({
            idAsesor: asesor.id,
            tipoConvenio: convTipo,
            idTienda: convTienda!,
            fechaInicio: convInicio,
          }),
        )
      }
    >
      <ExitoBanner texto={exito} />
      <View>
        <FieldLabel>TIPO DE CONVENIO</FieldLabel>
        <Segmented
          options={[
            { value: 'ENCARGATURA', label: 'Por encargatura' },
            { value: 'SUPLENCIA', label: 'Por suplencia' },
          ]}
          value={convTipo}
          onChange={(v) => setConvTipo(v as TipoConvenio)}
        />
      </View>
      <View>
        <FieldLabel>TIENDA</FieldLabel>
        <Select
          options={opcTiendas}
          value={convTienda}
          placeholder="Seleccionar tienda…"
          onChange={setConvTienda}
        />
      </View>
      <View>
        <FieldLabel>FECHA INICIO DE CONVENIO</FieldLabel>
        <DateField value={convInicio} onChange={setConvInicio} />
      </View>
    </BottomSheet>
  );
}

function ExitoBanner({ texto }: { texto: string | null }) {
  if (!texto) return null;
  const ok = texto.startsWith('✓');
  return (
    <View style={[styles.banner, ok ? styles.bannerOk : styles.bannerError]}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'alert-circle'}
        size={18}
        color={ok ? colors.success : colors.danger}
      />
      <Text style={[styles.bannerText, { color: ok ? colors.success : colors.danger }]}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rango: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerOk: { backgroundColor: '#ecfdf5' },
  bannerError: { backgroundColor: '#fef2f2' },
  bannerText: { flex: 1, fontSize: fontSize.sm, fontWeight: '700' },
});
