# Reconciliación UX — Prototipo Sistema Nova (Gestión de Equipos)

> **Estado:** Referencia oficial · v1.0
> **Propósito:** Consolidar la revisión del prototipo funcional (web + móvil + kiosko) contra el análisis funcional, la arquitectura y el design system. Este documento es la **fuente de verdad** para: (1) ajustar el prototipo, (2) actualizar las especificaciones funcionales, y (3) actualizar el alcance y el backlog.
> **Origen:** Sesión de revisión del prototipo con el Product Owner (validación pantalla por pantalla).

---

## 0. Decisión marco

El **prototipo se acepta como fuente de verdad visual** del sistema. Los documentos de UX (`design-system-nova.md`, `flujos-ux-fase1.md`, `flujos-ux-transversales.md`) se reconcilian contra él. Los cambios que afectan **reglas de negocio** se propagan a las especificaciones funcionales y al alcance.

Niveles de impacto de cada hallazgo:
- 🔴 **Obligatorio** (cambia regla/estructura; afecta specs o alcance)
- 🟠 **Confirmar contra regla** (verificar implementación de una regla ya definida)
- 🟡 **Pulido** (UX/accesibilidad/datos demo)
- ✅ **Se mantiene** (correcto, no tocar)

---

## 1. Pantallas revisadas

| Plataforma | Pantallas |
|---|---|
| Web gerencial | Rol de Personal · Alertas de Marcaciones · Descansos y Compensaciones |
| Móvil | Login · Home · Gestión de Equipos (drill-down) · Acciones rápidas (Traslado/Ascenso/Encargatura) · Vacaciones · Aprobaciones · Licencias |
| Kiosko (Windows) | Asistencia biométrica (INGRESO, código zonal, anulación, reprogramación, éxito) · Reporte de Asistencia |

---

## 2. Hallazgos OBLIGATORIOS (🔴 — afectan reglas / alcance)

### H-01 · Semana domingo → sábado (global)
- **Dónde:** Rol de Personal (web) y Descansos (web) muestran calendarios anclados en **LUNES**.
- **Regla:** el alcance define la **semana laboral domingo → sábado** (parametrizable por empresa).
- **Acción:** el prototipo debe anclar todos los calendarios/grillas a **domingo**. No cambia el alcance (lo refuerza).

### H-02 · Ascenso Senior fuera de Gestión de Equipos → vive en Aprobaciones
- **Dónde:** la acción rápida "Ascenso Senior" (★) en la lista de asesores de Gestión de Equipos abre un modal con *tienda destino + rango de fechas + temporal/permanente* y "Confirmar ascenso" directo.
- **Problema:** eso contradice el módulo Ascenso Senior (promoción al flag Senior con **panel de cumplimiento de 6 meses**, **aprobación del GG**, **segregación** y **SLA**). Un ascenso a Senior **no tiene tienda destino** ni confirmación directa.
- **Acción:**
  - Quitar la acción "Ascenso Senior" de Gestión de Equipos. A lo sumo, mostrar un **badge "Senior"** de solo lectura.
  - El flujo de ascenso se inicia y aprueba en **Aprobaciones** (con panel de 6 meses + GG + segregación).
  - **Cambio de actor:** el **promotor/solicitante es Administración de Ventas (AV)**; el aprobador es el GG (con GG Suplente para segregación). → actualizar `ENT-MOD-ASCE-001`, `alcance-nova.md`, `backlog-epicas.md`.
  - Unificar el ícono de ascenso entre web y móvil (sugerido ▲).

### H-03 · Licencias + Descansos + Vacaciones = un solo motor de "ausencias programadas"
- **Dónde:** Licencias (móvil) registra Con/Sin goce; Descansos ya incluye "Licencia con/sin goce" como tipos; Vacaciones es otro flujo.
- **Decisión del PO:** Licencias debe estar también en web, **junto con las programaciones**, y debe **validar que no exista otra programación previa** para el empleado (no-cruce).
- **Acción:** consolidar Licencias/Descansos/Vacaciones sobre un **único motor/calendario de ausencias programadas** con **validación de no-cruce transversal** (una sola fuente de verdad). → nota de frontera en `alcance-nova.md`; reglas en `ENT-MOD-DESC-001` y `ENT-MOD-VAC-001`.

### H-04 · Iconografía Senior
- La **estrella (★)** se usa como acción de ascenso, pero se lee como "favorito". Reservar un **badge "Senior" explícito** para indicar quién ya es Senior, y usar ▲ para la acción de ascenso (en Aprobaciones).

---

## 3. Confirmaciones contra reglas (🟠 — verificar implementación)

### RBAC y ámbito
- **H-05 · Recorte por rol/ámbito:** todas las vistas (Móvil Gestión de Equipos, Vacaciones, Aprobaciones, Reporte de Asistencia, Reportes) deben **recortarse según el rol y ámbito** del usuario (GG = todo; GZ = sus zonas; GT = su tienda). Confirmar contra `ENT-MOD-SEGU-001`.
- **H-06 · Segregación en Aprobaciones:** si el GG logueado es el solicitante, **no ve "Aprobar"**; solo el rol formal **GG Suplente (R-GG-SUP)** resuelve.
- **H-07 · Acciones rápidas (móvil):** Traslado/Encargatura las ejecutan **GZ y GG** según ámbito. **Encargatura:** reconciliar — el spec dice **Admin Retail**; el PO indicó GZ/GG. → confirmar en `ENT-MOD-ENCA-001` y `alcance-nova.md`.

### Flujos de aprobación / validación visibles
- **H-08 · Estados de aprobación en Descansos/Licencias:** mostrar estados intermedios **"Pendiente de aprobación"** y **"En validación Bienestar"**, no saltar directo a "Programado"/"En ejecución". Ruteo por tipo: LSGH/LCGH → **GG** (SLA 2 días); Descanso médico/Lic. médica → **Bienestar** (SLA 2 días).
- **H-09 · Anulación de vacaciones:** anular periodo activo requiere **autorización AV/GG** (regla del spec).
- **H-10 · Comentario obligatorio en rechazo:** el botón "Rechazar" en Aprobaciones (y Licencias) debe exigir **motivo obligatorio**.
- **H-11 · Confirmación de compensaciones en lote:** la acción "Confirmar descansos laborales" debe estar **gateada por rol** y **auditada**.

### Validación dura de reglas (no solo hints)
- **H-12 · Programación con reglas:** al programar Descansos/Vacaciones, **bloquear** cruces, más de un descanso por semana, exceso de días, dotación mínima bajo umbral, y respetar feriados / "Mes Obligatorio". Los hints están; falta la validación efectiva.
- **H-13 · No-cruce en Licencias:** validar que el empleado no tenga otra programación en las fechas elegidas (ver H-03).

### Marcaciones / Asistencia
- **H-14 · Atribución por huella:** la marcación se atribuye al **dueño de la huella**, no al usuario (GT) con la sesión del kiosko abierta.
- **H-15 · Código de autorización zonal:** mantener como compuerta de excepción (anulación de programación). Validar **fuente única** del mecanismo (generación por GZ) en todos los módulos que lo usan.
- **H-16 · Auditoría de anulación/reprogramación:** registrar quién/cuándo/código en cada anulación de programación.
- **H-17 · Marcación fuera de horario:** detectar y señalar **tardanza** y **marcación anticipada** (alimenta "Alertas de Marcaciones" y el Reporte de Asistencia).
- **H-18 · Distinguir ausencia justificada:** "Sin marcación" no debe contar a quien tiene **descanso/vacaciones/licencia** programada; mostrar ese estado en su lugar. La lista de alertas debe **excluir** lo ya programado.
- **H-19 · Justificación + auditoría en acciones manuales:** registrar Falta/Descanso desde "Alertas de Marcaciones" requiere **motivo + auditoría**.
- **H-20 · Certificado en licencia médica:** permitir **adjuntar certificado** y pasar por validación de Bienestar.

---

## 4. Pulidos (🟡 — UX / accesibilidad / demo)

- **P-01 · Datos demo a 2026:** unificar fechas (varias pantallas muestran 2024/2025). Los *periodos* de vacaciones (2024-2025) sí son válidos.
- **P-02 · Leyendas:** agregar leyenda de tipos de día (DL/CT/CF/CD/APO/CV/COB), de siglas en Aprobaciones ("1 ASES / 1 SEC/PT / 1 SAS/FT"), y del código de color de números (Indemn/Pend/Trunc/Tot).
- **P-03 · Accesibilidad:** `aria-label`/tooltips en controles solo-ícono (sidebar móvil, íconos de acción, handles de arrastre); `aria-live` en toasts; etiqueta para "—" en tablas; tablas ordenables con encabezados correctos.
- **P-04 · Color semántico de estados:** alinear color al significado (p. ej. "Culminado" no en amarillo de advertencia; "Aprobar" en color positivo, no negro).
- **P-05 · Umbrales de cobertura parametrizables:** definir cortes verde/naranja/rojo (en Maestros).
- **P-06 · Login con SSO:** añadir opción "Iniciar con SSO" (ADR-001) además de usuario/contraseña.
- **P-07 · Reporte de Asistencia:** columna "Horario programado" junto al real; **Exportar (Excel/CSV)**; filtros por estado/puesto; selector de fecha/rango; última actualización; formato print-friendly.
- **P-08 · Estados de error del biométrico:** "huella no reconocida / lector offline" con reintento.
- **P-09 · Bandeja de Aprobaciones:** definir si es **unificada** (web) o **por categoría** (móvil: Solicitudes/Roles/Licencias) y mantener coherencia; definir **dónde aparece Ascenso** (categoría propia o Solicitudes).
- **P-10 · Login web + recuperación de contraseña:** el login web (split-screen marca + formulario) se incluye como referencia. Debe llevar **opción SSO** (ADR-001) y un flujo de **recuperación de contraseña por código OTP de 6 dígitos** (correo → enviar código → verificar código → establecer nueva contraseña), con email enmascarado, caducidad del código, límite de intentos, reenvío con contador y anti-enumeración. Unificar el naming del producto (no "Sistema Administrativo de Tiendas"). Confirmar política de "Mantener sesión iniciada" con seguridad.

---

## 5. Lo que se mantiene (✅ — fortalezas a conservar)

- Drill-down jerárquico General → Zona → Tienda → Asesor (móvil) — alineado con ámbito/jerarquía.
- Coherencia de tipos de día entre Rol, Marcaciones y Descansos (DL/CT/CF/CD/APO).
- Compensaciones **SUGERIDO** con confirmación en lote y distinción visual sugerido/programado.
- Reglas embebidas como hints ("2 días, sin cruce, sin registro previo en la semana").
- Mecanismo de **código de autorización zonal** en el kiosko.
- Estados vacíos (Licencias en Aprobaciones) y notificación multicanal (push + correo) en marcación.
- KPIs operativos por módulo (cobertura, indemnizables, descansos, alertas).
- Doble vista Calendario/Tabla en Descansos.

---

## 6. Cambios al ALCANCE y ESPECIFICACIONES (derivados)

| ID | Cambio | Documentos a actualizar |
|---|---|---|
| C-01 | Ascenso Senior vive en Aprobaciones; **promotor = Administración de Ventas**, aprueba GG | `alcance-nova.md`, `backlog-epicas.md`, `ENT-MOD-ASCE-001`, `ENT-MOD-APRO-001` |
| C-02 | Licencias = parte del motor de Descansos (ausencias programadas) con no-cruce | `alcance-nova.md`, `ENT-MOD-DESC-001`, `ENT-MOD-VAC-001` |
| C-03 | Encargatura: confirmar rol responsable (Admin Retail vs GZ/GG) | `alcance-nova.md`, `ENT-MOD-ENCA-001` |
| C-04 | Marcaciones: atribución por huella, tardanza/fuera de horario, exclusión de ausencias justificadas, auditoría de anulación, código zonal | `ENT-MOD-MARC-001` |
| C-05 | Confirmación de semana domingo→sábado en todos los calendarios | (refuerzo; ya en alcance) |
| C-06 | Login web (SSO + local) y **recuperación de contraseña por OTP de 6 dígitos** (request → verify → set new password) | `ENT-MOD-SEGU-001`, `seguridad-api.yaml`, `flujos-ux-fase1.md` (A.0) |

---

## 7. Próximos pasos

1. Aplicar al **prototipo** los hallazgos 🔴 y 🟠 (equipo de prototipos).
2. Actualizar **especificaciones funcionales** afectadas (C-01 a C-05).
3. Actualizar **alcance y backlog** (C-01, C-02, C-03).
4. Reconciliar los **documentos de UX** para que reflejen el prototipo como fuente de verdad.
