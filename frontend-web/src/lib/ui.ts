import { create } from 'zustand'

export type ToastTipo = 'ok' | 'error' | 'info'
export interface Toast {
  id: number
  msg: string
  tipo: ToastTipo
}

interface ToastState {
  toasts: Toast[]
  push: (msg: string, tipo: ToastTipo) => void
  dismiss: (id: number) => void
}

let seq = 0

/** Store global de notificaciones (toasts) animadas. */
export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (msg, tipo) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts, { id, msg, tipo }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3800)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Helper de uso rápido: toast.ok('...'), toast.error('...'), toast.info('...'). */
export const toast = {
  ok: (m: string) => useToasts.getState().push(m, 'ok'),
  error: (m: string) => useToasts.getState().push(m, 'error'),
  info: (m: string) => useToasts.getState().push(m, 'info'),
}
