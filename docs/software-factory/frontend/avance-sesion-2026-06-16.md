# Avance de sesión — UI + Parámetros (2026-06-16)

**Stack:** React + Vite + TS sobre plantilla SmartAdmin (Bootstrap + SASS), carpeta `TS/`. Backend .NET 8 + SQL Server (módulo Maestros).
**Rama:** `develop`. **Sin commit aún.** Backend `:5109` (seed `admin / Nova2026!`), frontend nova-web `:5174`.

> Sesión enfocada en: capacidades CRUD de Parámetros (full-stack), pulido global de KPIs, arreglos del menú lateral colapsado, header fijo y rediseño completo del login + flujo de recuperación.

---

## 1. Parámetros del Sistema — editar / activar-desactivar / borrar (full-stack)

Decisiones de diseño (respetan versionado inmutable RN-MAES-09):
- **Editar** = abre el modal "Nueva versión" prellenado → crea versión nueva, NO sobrescribe.
- **Activar/Desactivar** = campo `estado` (Activo/Inactivo) **explícito y ortogonal a la vigencia** (no usa `CerrarVigencia`).
- **Borrar** = solo versiones futuras no consumidas (`vigenciaDesde > hoy`); vigentes/pasadas → 400 (se desactivan). Con `useConfirm`.

**Backend (Maestros):**
- Dominio `Parametro`: campo `Estado` (enum `EstadoParametro` Activo/Inactivo) + `Activar()`/`Desactivar()` idempotentes.
- Lookup de valor vigente ahora filtra `estado=Activo` además de vigencia (`EsResoluble`).
- Handlers `ActivarParametroHandler`, `DesactivarParametroHandler`, `EliminarParametroHandler`.
- Endpoints: `PATCH /v1/maes/configuracion/parametros/{id}/estado {estado,idActor}` · `DELETE /v1/maes/configuracion/parametros/{id}?idActor`.
- `GET /configuracion/parametros` ahora incluye `estado`. Auditoría: `AccionConfig.CambioEstado=6`, `Eliminacion=7`.
- Migración `20260615214019_AddEstadoParametro` (col `maes.parametro.estado nvarchar(12) default 'Activo'`) — **aplicada** a la BD dev.

**Frontend (`views/config/parametros/index.tsx` + `lib/config-parametros.ts`):**
- Columna **Estado** (badge Activo verde / Inactivo gris), ortogonal a "Vigente hasta" (este pasó a "Sin cierre").
- Columna **Acciones**: Editar (modal prellenado) · Activar/Desactivar (sin confirmación) · Borrar (con `useConfirm`, muestra el 400 en aviso).
- Lib: `cambiarEstadoParametro`, `eliminarParametro` (+ `estado` en el type).

Verificado en preview: toggle estado round-trip real contra backend.

## 2. KpiCard — estilo compacto global

- `KpiCard` ahora **`size='sm'` por defecto** (afecta TODAS las pantallas): padding reducido, número `fs-4`, burbuja de ícono "tile" pastel (acento @15%) con ícono teñido del acento. `size='md'` = versión grande opt-in.
- **Gotcha**: `.sa-icon` no usa `currentColor`; usa vars `--sa-icon-color`/`--sa-icon-fill` (en `assets/sass/app/_icons.scss`). Para teñir hay que sobreescribir esas vars.
- Descansos: KPIs con acentos vivos (indigo/naranja/cian/rosa/verde) y labels cortos sin subtítulos.

## 3. Menú lateral (`nova-overrides.scss`)

- **Hover** ya no desplaza a la derecha (quitado `padding-left:20px` + `translateX`); solo tinte + leve escala del ícono.
- **Íconos visibles**: el tema `set-nav-dark` los pintaba a `rgba(255,255,255,.4)` (casi invisibles); subidos a `.82` con `.primary-nav` para ganar especificidad.
- **Colapsado**: el `<a>` mide 210px (ancho expandido); se convirtió en **tile de 44px centrado** (margin negativo que compensa el offset ~21px del simplebar) → ícono y sombreado centrados en la barra de 62px. Oculto el bloque `.ms-auto` (badge/chevron) que descentraba "Dashboards".
- **Sombreado activo**: de `box-shadow inset 999px` animado (lento) → `background-color` (instantáneo); transición reducida a `.15s`.

## 4. Header fijo

- `useLayoutContext.tsx`: `headerFixed: true` por defecto → usa la clase `set-header-fixed` de la plantilla (`.app-header { position:fixed }`). Config previa en localStorage migrada en el browser de dev.

## 5. Login pro + flujo de recuperación (mock) — Lote G/H

- **Login reescrito** (`views/auth/login`): split-screen marca Nova, campo "Usuario o correo", Recordarme funcional, ¿Olvidaste tu contraseña? Login real (`/v1/segu/auth/login`) intacto. **Cuentas de demostración eliminadas** (a pedido). Copy del panel con palabras clave en **negrita**.
- **Flujo recuperación MOCK** (`views/auth/forgot-password`, 4 pasos en una ruta): Restablecer (correo) → Verifica identidad (OTP 6 dígitos + countdown 60s) → Nueva contraseña (checklist requisitos en vivo) → Listo.
- Componentes nuevos: `views/auth/components/AuthBrandPanel.tsx`, `AuthShell.tsx`, `OtpInput.tsx`. Libs: `lib/password-rules.ts`, `lib/auth-recovery.ts` (mock, seam para backend — NO existe módulo email/código).
- Verificado en preview las 5 pantallas end-to-end.

---

## Pendientes / notas
- **Commit pendiente** de toda la sesión (backend params + migración, frontend params, KpiCard, estilos menú/header, login + recuperación).
- Recuperación de contraseña es **UI mock**; conectar a backend Seguridad cuando exista servicio de email/código.
- `headerFixed` default nuevo solo aplica a navegadores sin config previa guardada; otros requieren reset de ajustes.
- Pendientes heredados siguen vigentes (módulos de Gestión mock sin backend, etc.).
