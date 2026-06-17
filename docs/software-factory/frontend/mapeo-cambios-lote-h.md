# Mapeo de cambios — Lote H — Login pro + recuperación de contraseña (mock)

Fecha: 2026-06-15
Branch: develop
Módulo: Seguridad / Auth (frontend-web, plantilla SmartAdmin, `TS/`)

## Resumen
Reescritura del login con estilo split-screen pro + cuentas de demostración, y construcción del
flujo COMPLETO de recuperación de contraseña en 4 pasos (1 sola ruta, estado interno). Recuperación
es MOCK (no existe backend de email/código). El login usa el `login()` real (`/v1/segu/auth/login`).

## Archivos creados
| Archivo | Propósito |
|---|---|
| `TS/src/views/auth/components/AuthBrandPanel.tsx` | Panel de marca izquierdo compartido (gradiente azul, anillos, líneas, pills, logo Nova). |
| `TS/src/views/auth/components/AuthShell.tsx` | Wrapper overlay `position-fixed` split 50/50 (marca + columna derecha). |
| `TS/src/views/auth/components/OtpInput.tsx` | 6 inputs OTP (autofocus, avance, backspace, flechas, pegar). |
| `TS/src/lib/password-rules.ts` | Helper puro `evaluarPassword()` → `{ ok, reglas[] }`. |
| `TS/src/lib/auth-recovery.ts` | Mock `enviarCodigo`/`validarCodigo`/`resetPassword` con delays + SEAM backend. |

## Archivos modificados
| Archivo | Cambio |
|---|---|
| `TS/src/views/auth/login/index.tsx` | Reescrito sobre `AuthShell`: subtítulo corporativo, "Usuario o correo", cuentas de demostración (Administrador real entra; demos prellenan). Mantiene auth real. |
| `TS/src/views/auth/forgot-password/index.tsx` | Reescrito como wizard de 4 pasos (Restablecer → Verificar → Nueva contraseña → Listo) sobre `AuthShell`. |

## APIs consumidas
| Vista | Endpoint | Estados manejados |
|---|---|---|
| Login | `POST /v1/segu/auth/login` (real, vía `login()`) | carga (spinner "Ingresando…"), error (`alert role=alert`), éxito (`setSesion` + `navigate('/')`). |
| Recuperación | MOCK (`auth-recovery.ts`, sin red real) | carga por paso, error (`role=alert`), éxito (avance de paso). |

## Trazabilidad pantalla → componente
| Pantalla mockup | Ruta / paso | Componentes |
|---|---|---|
| Login | `/auth/login` | `AuthShell` + `AuthBrandPanel` + form + tarjetas demo |
| Restablecer contraseña | `/auth/forgot-password` paso 1 | `AuthShell` + form correo |
| Verifica tu identidad | paso 2 | `AuthShell` + `OtpInput` + countdown |
| Nueva contraseña | paso 3 | `AuthShell` + checklist `evaluarPassword` |
| Listo | paso 4 | `AuthShell` + estado de éxito |

## Iconos
Todos presentes en `public/icons/sprite.svg`. Ninguno faltó. Usados: user, lock, mail, eye,
eye-off, arrow-right, chevron-left, chevron-right, alert-circle, alert-triangle, check-circle,
circle, info.

## Validación
- `npx tsc --noEmit` en `TS/` → sin errores.
- Dev server :5174 responde 200 en `/auth/login`.
- Verificación visual en navegador: pendiente para qa-tester.
