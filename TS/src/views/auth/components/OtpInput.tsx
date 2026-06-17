import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * Grupo de N inputs de un dígito para código OTP.
 * - autofocus al primero
 * - avanza al siguiente al escribir
 * - retrocede con backspace
 * - soporta pegar el código completo
 */
const OtpInput = ({ length = 6, value, onChange, disabled }: OtpInputProps) => {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const digitos = Array.from({ length }, (_, i) => value[i] ?? '')

  function setDigito(i: number, d: string) {
    const limpio = d.replace(/\D/g, '').slice(-1)
    const arr = digitos.slice()
    arr[i] = limpio
    onChange(arr.join('').slice(0, length))
    if (limpio && i < length - 1) refs.current[i + 1]?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === 'Backspace') {
      if (digitos[i]) {
        // borra el actual
        const arr = digitos.slice()
        arr[i] = ''
        onChange(arr.join(''))
      } else if (i > 0) {
        refs.current[i - 1]?.focus()
        const arr = digitos.slice()
        arr[i - 1] = ''
        onChange(arr.join(''))
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      refs.current[i + 1]?.focus()
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pegado) return
    onChange(pegado)
    const idx = Math.min(pegado.length, length - 1)
    refs.current[idx]?.focus()
  }

  return (
    <div className="d-flex gap-2 justify-content-between" role="group" aria-label="Código de verificación de 6 dígitos">
      {digitos.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          className="form-control text-center fw-bold fs-3 p-0"
          style={{ width: 56, height: 64, color: '#0f172a', lineHeight: '64px' }}
          value={d}
          onChange={(e) => setDigito(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
          onPaste={onPaste}
          disabled={disabled}
          autoFocus={i === 0}
          aria-label={`Dígito ${i + 1}`}
        />
      ))}
    </div>
  )
}

export default OtpInput
