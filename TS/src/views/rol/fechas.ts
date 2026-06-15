// Utilidades de semana para el calendario del Rol (semana Dom→Sáb).

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Domingo (00:00) de la semana que contiene a `d`. */
export function inicioSemana(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  r.setDate(r.getDate() - r.getDay()) // getDay(): 0=Dom
  return r
}

export function sumarDias(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function mismaSemana(a: Date, b: Date): boolean {
  return inicioSemana(a).getTime() === inicioSemana(b).getTime()
}

/** Los 7 días (Dom→Sáb) a partir del domingo `dom`. */
export function diasDeSemana(dom: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const f = sumarDias(dom, i)
    return { dia: DIAS[i], fecha: `${f.getDate()}/${MESES[f.getMonth()]}`, date: f }
  })
}

/** Número de semana ISO-8601. */
export function numeroSemanaISO(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dia = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - dia)
  const inicioAnio = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t.getTime() - inicioAnio.getTime()) / 86400000 + 1) / 7)
}

/** Etiqueta "Sem 23 — 7 jun al 13 jun 2026". */
export function etiquetaSemana(dom: Date): string {
  const sab = sumarDias(dom, 6)
  const n = numeroSemanaISO(dom)
  const fmt = (f: Date) => `${f.getDate()} ${MESES[f.getMonth()]}`
  return `Sem ${n} — ${fmt(dom)} al ${fmt(sab)} ${sab.getFullYear()}`
}
