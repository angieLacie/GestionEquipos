/**
 * Helper puro y reutilizable para validar requisitos de contraseña.
 * Coherente con las reglas funcionales del módulo de Seguridad.
 */

export interface ReglaPassword {
  label: string
  cumple: boolean
}

export interface ResultadoPassword {
  ok: boolean
  reglas: ReglaPassword[]
}

/**
 * Evalúa una contraseña (y su confirmación) contra los requisitos en vivo.
 * @param password contraseña nueva
 * @param confirmar confirmación (opcional; si no se pasa, no se evalúa la coincidencia)
 */
export function evaluarPassword(password: string, confirmar?: string): ResultadoPassword {
  const reglas: ReglaPassword[] = [
    { label: 'Mínimo 8 caracteres', cumple: password.length >= 8 },
    { label: 'Una letra mayúscula', cumple: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', cumple: /[a-z]/.test(password) },
    { label: 'Un número', cumple: /\d/.test(password) },
    { label: 'Un carácter especial', cumple: /[^A-Za-z0-9]/.test(password) },
  ]

  if (confirmar !== undefined) {
    reglas.push({
      label: 'Las contraseñas coinciden',
      cumple: password.length > 0 && password === confirmar,
    })
  }

  return { ok: reglas.every((r) => r.cumple), reglas }
}
