# Avance de sesión — Frontend Nova (2026-06-15)

**Stack:** React + Vite + TS sobre plantilla SmartAdmin (Bootstrap + SASS), carpeta `TS/`.
**Commit:** `e5f01d6` (rama `develop`, no pusheado).
**Backend:** Nova.Bootstrap `:5109` · Frontend nova-web `:5174` · seed `admin / Nova2026!`.

---

## 1. Configuración `/config` — COMPLETO (8 pantallas, backend real Maestros)

| Pantalla | Ruta | Notas |
|---|---|---|
| Mapeo Puestos | `/config/mapeo-puestos` | preexistente |
| Tabla de Puestos | `/config/parametros-puestos` | límites por puesto (días descanso/trabajo, horas PT/FT/refrigerio), RN-DESC-02; param `ROL_PARAMETROS_PUESTO` |
| Feriados | `/config/feriados` | CRUD; CU-MAES-01 |
| Maestro de Tiendas | `/config/tiendas` | read-only RMS + edita CC/PC, zona, estado |
| Semanas de Campaña | `/config/campania` | CU-MAES-08; lista + alta + delete |
| Parámetros del Sistema | `/config/parametros` | editor genérico versionado (CU-MAES-03/04), solo R-ADM |
| Historial de Cambios | `/config/historial` | log append-only (CU-MAES-07), solo R-ADM |
| Flujos de Aprobación | `/config/flujos-aprobacion` | param `APRO_FLUJOS` (no hay módulo Aprobaciones backend) |

### Cambios backend (módulo Maestros)
- `PUT /v1/maes/feriados/{id}` + `DELETE /v1/maes/feriados/{id}` — handlers `EditarFeriadoHandler`/`EliminarFeriadoHandler`, dominio `Feriado.Editar`/`EsManual` (solo origen ManualAdm).
- `DELETE /v1/maes/campania/semanas/{id}` — `EliminarCampaniaHandler`.
- `GET /v1/maes/configuracion/auditoria` — `IAuditoriaMaestrosRepository.ListarAsync` con LEFT JOIN a `segu.usuario` vía read model keyless `UsuarioRef` (ToTable `usuario`/`segu`, ExcludeFromMigrations).
- `PATCH /tiendas/{id}`: `idZona` ahora **opcional** (antes Guid obligatorio bloqueaba setear CC/PC).

---

## 2. Gestión — 6 módulos nuevos (DATOS MOCK, sin backend, seam para fuente real)

Cada uno tiene banner "⚠️ Datos de ejemplo". Para conectar backend: cambiar solo el `lib/*.ts`.

| Módulo | Ruta | Destacado |
|---|---|---|
| Marcaciones | `/marcaciones` | bitácora biométrica, KPIs, filtros, export CSV |
| Ascenso Senior | `/ascensos` | tarjetas, segregación autosolicitud (R-GG-SUP), panel cumplimiento 6 meses |
| Encargatura | `/encargaturas` | tabla + modal Nueva/Editar con selector de semana (auto-rellena fechas) |
| Vacaciones | `/vacaciones` | lista por empleado expandible, mes obligatorio, anular con confirm |
| Descansos y Compensaciones | `/descansos` | 3 tabs (Calendario/Tabla/Resumen), sugerencia automática, modal 14 tipos |
| Reportes | `/reportes` | hub de tarjetas + 4 reportes detallados (Programadas, Pendientes, Cobertura, Horas Extras) |

---

## 3. Auth
- **Login rediseñado** a split-screen (panel marca Nova + formulario, toggle ojo de contraseña). Lógica de login intacta.
- Gotcha resuelto: `_authentication.scss` `.hero-section { color:#fff }` se heredaba → título/labels invisibles; fix con color oscuro explícito en el panel derecho.

---

## 4. Pendientes / próximos pasos
- Conectar los 6 módulos mock a backend real cuando existan los módulos (Marc, Asce, Enca, Vac, Desc, Aprobaciones).
- Tiendas: seed sin zonas (0 registros) y sin endpoint POST de zonas.
- Login: "Recordarme" sin lógica; campo es **Usuario** (no email, backend autentica por `nombreUsuario`); `BackgroundAnimation` (vanta) del AuthLayout sigue corriendo detrás del login.
- Commit `e5f01d6` **no pusheado**.

> Módulos backend existentes: **Maestros, Rol, Seguridad**. NO existen: Marc, Asce, Enca, Vac, Desc, Aprobaciones (todo eso es mock en frontend).
