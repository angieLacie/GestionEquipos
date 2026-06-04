# Mapeo de cambios — Lote C (Login y recuperación de contraseña)

Proyecto: Sistema Nova · `prototipo-ux-v2/gestion-equipos.html` (web) y `app.html` (móvil)
Fecha: 2026-05-31
Referencias: reconciliacion-ux.md (P-06/P-10/C-06) · ENT-MOD-SEGU-001 (CU-SEGU-10, RN-SEGU-32..39, RN-SEGU-10) · flujos-ux-fase1.md (A.0 web / B.0 móvil) · ADR-001 (login híbrido).
Solo presentación: ambos flujos llaman conceptualmente a `/auth/password-recovery/{request,verify,reset}`. No se duplica lógica de negocio.

## A) Login WEB — `gestion-equipos.html`

### A.1 Botón "Iniciar con SSO" (login híbrido, ADR-001)
- CSS añadido (tras `.lsc-btn:active`, ~L1136): `.lsc-or` (divisor "O"), `.lsc-sso` (botón secundario) y `.lsc-pwlist`/`.lsc-pwlist li.ok` (checklist de política).
- P1 login (~L1238): tras `<button class="lsc-btn">Ingresar al sistema</button>` se añadió divisor `O` + `<button class="lsc-sso" onclick="lscSSO()">Iniciar con SSO</button>`.

### A.2 Paso faltante "ESTABLECER NUEVA CONTRASEÑA" (P-06 / C-06)
Antes: el flujo OTP iba P1 correo → P2 → P3 código → **P4 "Código verificado → iniciando sesión"
(auto-login a P5 perfil)**, saltándose el cambio de contraseña.
Después: tras verificar el código se entra a un nuevo paso de nueva contraseña y, al guardar, a un
éxito que vuelve al login (SIN auto-login), conforme a RN-SEGU-38/CU-SEGU-10 paso 10.

| Ubicación | Antes | Después |
|-----------|-------|---------|
| Markup tras P5 (~L1326) | — | Nuevos paneles **P6** (nueva contraseña + confirmar + checklist en vivo) y **P7** (éxito + botón "Volver al inicio de sesión" → `lscGo(1)`) |
| `lscGo(n)` (~L3477) | itera `[1,2,3,4,5]` | itera `[1,2,3,4,5,6,7]` |
| `lscVerify()` (~L3584) | `lscGo(4); setTimeout(lscDoLogin, 2100);` (auto-login) | `lscGo(6); lscPwCheck(); focus()` (va a nueva contraseña; NO auto-login) |
| JS nuevo | — | `lscSSO()`, `lscTogglePw2(id)`, `_lscPwRules()`, `lscPwCheck()` (checklist en vivo), `lscSavePw()` (valida política + coincidencia → `lscGo(7)`) |

Checklist de política (RN-SEGU-10/38, SEGU_PWD_*): ≥8 caracteres, mayúscula, minúscula, número,
símbolo, y coincidencia de confirmación. Se actualiza en vivo (verde al cumplir).
Nota: el panel P4 (éxito+auto-login antiguo) queda en el DOM pero ya NO se referencia desde el flujo
de recuperación (markup muerto inofensivo; no se eliminó por no aportar y tener riesgo nulo).

## B) Login MÓVIL — `app.html`

### B.1 Botón "Iniciar con SSO"
- CSS añadido (tras `.login-btn:disabled`, ~L56): `.login-or`, `.login-sso` y los estilos del flujo
  de recuperación (`.rec-screen`, `.rec-hdr`, `.rec-back`, `.rec-body`, `.rec-ttl`, `.rec-sub`,
  `.rec-code-row`, `.rec-cb`, `.rec-resend`, `.rec-ok-*`, `.rec-pwlist`).
- Tarjeta de login (~L539): tras `<button class="login-btn">Iniciar sesión</button>` se añadió
  divisor `O` + `<button class="login-sso" onclick="loginSSO()">Iniciar con SSO</button>`.

### B.2 "¿Olvidaste tu contraseña?" — de texto muerto a flujo OTP de 3 pasos
| Ubicación | Antes | Después |
|-----------|-------|---------|
| `.login-forgot` (~L535) | `<div class="login-forgot">¿Olvidaste tu contraseña?</div>` (sin onclick = texto muerto) | `<div class="login-forgot" onclick="go('s-recover')">…</div>` |
| Markup tras `s-login` (~L574) | — | 4 pantallas full-screen nuevas: `s-recover` (correo), `s-recover-code` (OTP), `s-recover-pw` (nueva contraseña), `s-recover-done` (éxito) |
| `updateHomeBar()` (~L2058) | ocultaba bnav solo en `s-login` | también en pantallas `s-recover*` (la barra inferior no aparece durante la recuperación) |
| JS nuevo (~tras `doLogin`) | — | `loginSSO()`, `recSendCode()`, `recAdv/recBack` (inputs OTP), `recVerify()`, `recStartTimer/recResend` (contador + reenvío), `recTogglePw()`, `_recPwRules/recPwCheck/recSavePw`, `recToLogin()` |

Detalles de los 3 pasos (adaptados a móvil, mismo patrón de pantallas del prototipo, navegación con `go()`/`back()`):
- **Paso 1 (s-recover):** input correo → "Enviar código". Anti-enumeración (RN-SEGU-32): toast
  genérico "Si el correo está registrado, enviaremos un código.".
- **Paso 2 (s-recover-code):** 6 inputs con `inputmode="numeric"` y `autocomplete="one-time-code"`;
  email enmascarado (`j***@…`); auto-avance/retroceso entre cajas; contador de reenvío (60s, link
  deshabilitado mientras corre); límite de intentos (RN-SEGU-35): el código demo `000000` simula
  inválido y descuenta "Intentos restantes" hasta bloquear.
- **Paso 3 (s-recover-pw):** nueva contraseña + confirmar con checklist en vivo (mismas 6 reglas que
  la web); al guardar (todas OK) → `s-recover-done`.
- **Éxito (s-recover-done):** mensaje + "Volver al inicio de sesión" → `recToLogin()` (resetea stack
  y campos; SIN auto-login).

## Confirmaciones
- (a) Botón SSO presente en web (`lsc-sso` / `lscSSO`) y móvil (`login-sso` / `loginSSO`). OK
- (b) Paso "nueva contraseña" en la web: nuevo P6 con checklist en vivo + P7 éxito → vuelve al login
  sin auto-login; `lscVerify` redirige a P6. OK
- (c) Flujo OTP de 3 pasos funcional en móvil: `s-recover` → `s-recover-code` → `s-recover-pw` →
  `s-recover-done`, con anti-enumeración, OTP numérico/one-time-code, enmascarado, reenvío con
  contador, límite de intentos y checklist de política. OK
- Sin onclicks colgando: verificado que todas las funciones nuevas (web: lscSSO/lscPwCheck/lscSavePw/
  lscTogglePw2; móvil: loginSSO/recSendCode/recAdv/recBack/recVerify/recResend/recTogglePw/recPwCheck/
  recSavePw/recToLogin) están definidas y referenciadas.

## Validación de sintaxis
Pendiente de ejecución automatizada (permiso de Bash denegado al cierre). Cambios aplicados como
reemplazos exactos; revisión manual de los bloques JS nuevos (web ~L3540-3621, móvil ~L1946-2056) y
de la estructura HTML (4 pantallas de recuperación como hermanas entre `s-login` y `s-home`; paneles
P6/P7 en `lsc-right-inner`) confirmó balanceo de llaves, template literals cerrados y etiquetas
balanceadas. Se recomienda al qa-tester re-ejecutar el chequeo de sintaxis JS.
