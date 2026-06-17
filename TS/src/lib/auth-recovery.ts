/**
 * Flujo de recuperación de contraseña — IMPLEMENTACIÓN MOCK.
 *
 * No existe (todavía) un módulo backend de envío de email / generación de código
 * de verificación. Estas funciones simulan la latencia de red y devuelven
 * resultados predecibles para poder construir y probar la UI completa.
 *
 * SEAM para backend real: cuando exista el módulo de recuperación
 * (p.ej. POST /v1/segu/auth/forgot, /verify-code, /reset), reemplazar el
 * cuerpo de cada función por la llamada a `api(...)` correspondiente,
 * manteniendo las mismas firmas.
 */

/** Código demo aceptado por el mock (cualquier 6 dígitos también es válido). */
export const CODIGO_DEMO = '123456'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface RecoveryResultado {
  ok: boolean
  mensaje?: string
}

/**
 * Paso 1 — envía (simula) un código de verificación al correo corporativo.
 * SEAM: api('/v1/segu/auth/forgot', { method:'POST', body: JSON.stringify({ correo }) })
 */
export async function enviarCodigo(correo: string): Promise<RecoveryResultado> {
  await delay(900)
  if (!EMAIL_RE.test(correo.trim())) {
    return { ok: false, mensaje: 'Ingresa un correo válido.' }
  }
  return { ok: true }
}

/**
 * Paso 2 — valida (simula) el código de 6 dígitos.
 * Mock: acepta el código demo o cualquier secuencia de 6 dígitos.
 * SEAM: api('/v1/segu/auth/verify-code', { method:'POST', body: JSON.stringify({ correo, codigo }) })
 */
export async function validarCodigo(_correo: string, codigo: string): Promise<RecoveryResultado> {
  await delay(800)
  if (!/^\d{6}$/.test(codigo)) {
    return { ok: false, mensaje: 'El código debe tener 6 dígitos.' }
  }
  return { ok: true }
}

/**
 * Paso 3 — restablece (simula) la contraseña.
 * SEAM: api('/v1/segu/auth/reset', { method:'POST', body: JSON.stringify({ correo, password }) })
 */
export async function resetPassword(_correo: string, _nuevaPassword: string): Promise<RecoveryResultado> {
  await delay(900)
  return { ok: true }
}
