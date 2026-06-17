# Estado del proyecto Nova — avances y brechas

| Campo | Valor |
|---|---|
| Fecha | 2026-06-17 |
| Estado | Vivo — resumen de lo construido vs. lo que falta |
| Alcance | Backend, frontend-web, integraciones, datos, infra |

> Resumen ejecutivo. NO es auditoría línea por línea del repo; es la foto a partir de docs + estado actual. Para checklist exacto, correr auditoría de endpoints/vistas vs. spec.

---

## 0. Lo construido (avance)

### Arquitectura / stack
- Decisión de stack: **.NET 8 + SQL Server** (desvía del ADR-007 que proponía Postgres), monolito **modular hexagonal**.
- Frontend-web: **React + Vite + TS** sobre plantilla **SmartAdmin** (Bootstrap + SASS), carpeta `TS/`, server `:5174`. Backend `Nova.Bootstrap` `:5109`. Seed `admin / Nova2026!`.

### Backend (3 módulos)
- **Seguridad**: autenticación JWT (`/v1/segu/auth/login`), RBAC, jerarquía.
- **Maestros** (config transversal, esquema `maes`): empresas/zonas/tiendas/puestos/empleados, roles/permisos, **Feriados** (CRUD), **Tiendas** (PATCH atributos Nova), **Campaña** (semanas), **Parámetros versionados** (listar/crear + **estado Activo/Inactivo** + **borrar versiones futuras** + migración `AddEstadoParametro`), **Auditoría de config**, **roster RMS** (vista cross-DB `vw_EmpleadoRoster`, solo lectura).
- **Rol**: slice con roster real + mapa puesto→categoría.

### Frontend-web
- **Auth pro**: login split-screen corporativo (marca Nova, gradiente navy + glow, inputs flotantes, botón gradiente, pie de confianza) + **flujo de recuperación** completo en 4 pasos (correo → código OTP 6 díg → nueva contraseña con checklist en vivo → listo) — *mock*. Mensajes de error claros en `api.ts`.
- **Topbar**: notificaciones + perfil reales (usuario/rol desde sesión, logout real), sin demo SmartAdmin.
- **Navegación**: menú lateral pulido — íconos visibles y centrados en modo colapsado, hover sin desplazamiento, sombreado del activo centrado e instantáneo; **header fijo** por defecto.
- **KpiCard**: estilo compacto + ícono pastel-vivo como default global.
- **Módulo Configuración COMPLETO (8 pantallas)**: Mapeo Puestos, Tabla de Puestos, Feriados, Maestro de Tiendas, Semanas de Campaña, **Parámetros del Sistema** (editar = nueva versión, activar/desactivar, borrar), Historial de Cambios, Flujos de Aprobación.
- **Módulos de Gestión** (UI lista, datos mock salvo Rol): **Rol de Personal** (calendario semanal con roster real, programación, pendientes), Marcaciones, Ascenso Senior, Encargatura, Vacaciones, **Descansos** (calendario/tabla/resumen, toolbar estilo Rol), Reportes.
- **Patrón estado + historial** (sesión 2026-06-16/17): chip de estado + drawer de historial (timeline con antes→después). Chip+drawer en **Rol, Ascenso Senior, Vacaciones**; solo drawer en **Descansos, Encargatura, Marcaciones**. *Datos mock, forma = backend (CU-14).*

### App-móvil — INICIADA v1 (sesión 2026-06-17)
- **Stack**: React Native + **Expo (SDK 56)** + TS + **expo-router**, store-ready. Identidad "Gestión de Equipos" / `com.tandemeje.gestionequipos`. **EAS** configurado (dev/preview/production). Verificada en **emulador Android** real (login real + navegación).
- **Auth real** (`POST /v1/segu/auth/login`) + token en `expo-secure-store` + guard de rutas.
- **Perfiles por rol** (una sola app): **Gestión** (R-ADM/GG/GZ/GT) y **Campo** (colaborador). Home muestra tiles distintos por perfil; selector "Ver como" solo en dev.
- **Gestión de Equipos** (drill-down): zona → tienda → asesores desde el **roster real**; KPIs por zona/tienda; **buscador** (tiendas+empleados); **detalle de tienda**; fila de asesor con badge Senior + vigencia.
- **Acciones por asesor** (bottom-sheets, submit mock): **Marcar Senior**, **Traslado**, **Conv. Encargatura**.
- **Placeholder/mock**: tiles Vacaciones/Ampliaciones/Aprobaciones/Licencias y pantallas de Campo (Mi marcación, Mi rol, Mis solicitudes, Notificaciones); resumen por zona (DM/VAC/LIC/cobertura) cae a mock si el backend no expone endpoint; firma electrónica (selfie+código+fecha+GPS) aún no construida.
- **Pendiente publicación**: `eas init` (projectId) + URL API real desplegada; `eas build`/`eas submit` los corre la usuaria con cuentas Apple/Google.

---

## 1. Backend — la brecha principal

Módulos construidos: **Maestros, Rol, Seguridad** (.NET 8 + SQL Server, monolito modular hexagonal, `:5109`).

**Sin backend (hoy solo mock en frontend):**
- Marcaciones
- Ascenso Senior
- Encargatura
- Vacaciones
- Descansos y Compensaciones
- **Traslados** (además, sin vista frontend)
- **Aprobaciones** (motor transversal Fase 0) — no existe módulo; los flujos viven como parámetro `APRO_FLUJOS`. Sin él, el flujo GZ→GG→GT no opera de verdad.
- Notificaciones

## 2. Funcionalidad a medio construir

- **Estado + historial** (Rol, Ascensos, Vacaciones, Descansos, Encargatura, Marcaciones): la UI está (chip de estado + drawer de historial), pero los **datos son mock**. Falta: persistencia del estado del documento, log de cambios (CU-14) y el **set de acciones por estado** (Enviar / Aprobar / Rechazar con comentario / Editar→versión en revisión) — aún no existen ni en UI.
- **Recuperación de contraseña**: flujo completo en UI (correo → código 6 dígitos → nueva contraseña → listo) pero **mock**; no hay servicio de email/código en Seguridad.

## 3. Datos / Maestros

- **Tiendas**: 0 zonas en seed y sin endpoint POST de zonas. El indicador CC/PC se setea en Nova; `idZona` es opcional en el PATCH.
- Sin maestro de empleados propio: depende de la vista RMS `vw_EmpleadoRoster` (solo lectura).

## 4. Integraciones externas (definidas, NO construidas)

| Integración | Estado |
|---|---|
| RMS | Parcial (solo lectura del roster vía vista cross-DB) |
| OFIPLAN (BOT, migración diferida) | No |
| POS / Cajas (bloqueo por incumplimiento) | No (canal reutilizable definido) |
| Firma Electrónica | No |
| Biométrico ZKTeco | No |
| Agente Windows | No |
| PowerApps | No |

## 5. Infra / calidad

- Sin **CI/CD**, sin observabilidad/monitoreo.
- Sin **pruebas** automatizadas (QA pendiente).
- **App móvil** (React Native / Expo): **iniciada v1** (auth real + perfiles + Gestión de Equipos); falta `eas init` + API desplegada para publicar a tiendas.
- Backend host **no persiste** entre ejecuciones (se cae). Falta `dotnet watch` o ejecutarlo como servicio/terminal fija.

## 6. Fases (referencia de roadmap)

- **F0** cimientos: Seguridad ✅ · Maestros ✅ · **Aprobaciones ❌**.
- **F1** núcleo: Rol (slice real + UI estado/historial) · Marcaciones (mock) · Descansos (mock).
- **F2** movilidad: Encargatura (mock) · **Traslados (sin vista)** · Vacaciones (mock).
- **F3** talento: Ascenso Senior (mock; análisis con vacíos).

## 7. Inmediato

- **Commit pendiente** de la sesión 2026-06-16/17 (params backend + migración, KpiCard, estilos menú/header, login + recuperación, toolbar Descansos estilo Rol, estado+historial en 6 módulos, mejora de mensajes de error en `api.ts`).

---

## Prioridad sugerida

1. **Módulo Aprobaciones** (F0) — desbloquea los flujos de estado de todos los demás.
2. **Conectar estado + historial a backend** (empezando por Rol, que ya tiene módulo).
3. **Acciones por estado** (Enviar/Aprobar/Rechazar/Editar) en UI + backend.
4. Backend de los módulos operativos (Descansos/Marcaciones/Encargatura/Vacaciones) por fase.
5. Traslados (vista + backend).
6. Integraciones reales (RMS escritura, OFIPLAN, POS) y CI/CD + QA.
