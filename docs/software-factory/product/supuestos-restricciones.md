# Supuestos, Restricciones y Decisiones — Sistema Nova (Gestión de Equipos)

> **Estado:** Vigente · v1.0 · 31/05/2026
> **Propósito:** Centralizar los supuestos, restricciones y decisiones del proyecto (referenciado por `alcance-nova.md` y `backlog-epicas.md`). Consolida lo decidido en la definición del alcance y en la revisión del prototipo (`design/reconciliacion-ux.md`).
> **Convención de estado:** ✅ Decidido · 🟠 Pendiente de confirmación (negocio) · 🔧 Pendiente de confirmación (TI/Arquitectura) · 📄 Pendiente de insumo (dato del negocio)

---

## 1. Supuestos generales

| ID | Supuesto | Estado |
|---|---|---|
| SUP-01 | El sistema opera para dos empresas/cadenas: **Cadena** y **Lukers**, con reglas parametrizables por empresa. | ✅ |
| SUP-02 | RMS es la **fuente de verdad** del empleado, tiendas, puestos y dotación mínima; Nova consume y no duplica esas identidades/atributos. | ✅ |
| SUP-03 | La **semana laboral es domingo → sábado** (parametrizable por empresa; hoy idéntica en ambas). | ✅ |
| SUP-04 | Plataformas: **web gerencial**, **app móvil** (colaborador/GZ) y **kiosko Windows** con lector biométrico. | ✅ |
| SUP-05 | El prototipo funcional revisado es la **fuente de verdad visual** del sistema. | ✅ |

---

## 2. Restricciones

| ID | Restricción | Origen |
|---|---|---|
| RES-01 | Integraciones externas (RMS, OFIPLAN, Firma Electrónica, POS) sujetas a contrato técnico con TI. | `architecture/contratos-integracion.md` |
| RES-02 | Parámetros de impacto económico/legal son **BLOQUEANTES** ante falla del servicio de configuración; el resto **DEGRADABLE** (caché). | `ENT-MOD-MAES-001` |
| RES-03 | Cambios retroactivos de parámetros/catálogos NO permitidos, salvo corrección de error histórico autorizada por ADM y auditada. | `ENT-MOD-MAES-001` |
| RES-04 | Escritura sobre Maestros restringida al rol **ADM** (GG solo solicita). | `ENT-MOD-MAES-001` |
| RES-05 | Toda acción con consecuencia económica/legal o de personal requiere **auditoría** (quién/cuándo/justificación). | Compliance |

---

## 3. Decisiones de la revisión del prototipo (compliance / negocio)

| ID | Decisión | Estado |
|---|---|---|
| C-01 | **Ascenso Senior** se gestiona en **Aprobaciones** (no en Gestión de Equipos). Promotor/solicitante = **Administración de Ventas (AV)**; aprueba **GG** con **GG Suplente (R-GG-SUP)** para segregación. Promoción al flag Senior con **panel obligatorio de cumplimiento de 6 meses**; sin "tienda destino" ni confirmación directa. | ✅ |
| C-02 | **Descansos, Licencias y Vacaciones** comparten un **motor único de "ausencias programadas"** con **validación de no-cruce** transversal. Licencias NO es módulo aparte (es parte de Descansos). | ✅ |
| C-03 | **Encargatura:** responsable de confirmar = **Administración Retail** (autoaprobación, sin comité). Las acciones de GZ/GG desde móvil son **solicitudes** que Admin Retail confirma. | ✅ |
| C-04 | **Marcaciones:** atribución por **huella** (no por sesión del kiosko); detección de **tardanza / marcación anticipada**; "Sin marcación" excluye ausencias programadas; **código de autorización zonal** como compuerta de excepción con **auditoría** de anulación/reprogramación. | ✅ |
| C-05 | **Semana domingo → sábado** en todos los calendarios/grillas. | ✅ |

---

## 4. Supuestos UX abiertos (pendientes de confirmación)

| ID | Punto | Estado |
|---|---|---|
| SUP-UX-05 | Inicio de semana parametrizable por empresa (hoy domingo→sábado en ambas). | 🟠 Negocio |
| SUP-UX-06 | Cortes de color de cobertura (verde/naranja/rojo) — definir umbrales en Maestros. | 🟠 Negocio |
| SUP-UX-07 | Proveedor/tipo de **SSO** corporativo (login híbrido SSO + local, ADR-001). | 🔧 TI |
| SUP-UX-08 | Datos de demostración del prototipo deben unificarse a **2026**. | ✅ (pulido) |

---

## 5. Pendientes de insumo del negocio (datos)

| ID | Insumo requerido | Para | Estado |
|---|---|---|---|
| DAT-01 | Lista oficial de **días no compensables** por empresa (Cadena/Lukers). | `ENT-MOD-MAES-001` (VAC-MAES-02) | 📄 |
| DAT-02 | Detalle de la **Tabla 04** de compensación por empresa. | `ENT-MOD-MAES-001` (VAC-MAES-06) | 📄 |
| DAT-03 | **Catálogo definitivo de puestos** y sus límites por empresa (RRHH). | `ENT-MOD-MAES-001` (VAC-MAES-07) | 📄 |

---

## 6. Pendientes de TI / Arquitectura

| ID | Punto | Referencia | Estado |
|---|---|---|---|
| TI-01 | Contrato de **sincronización RMS** (tiendas/puestos/dotación mínima) y endpoint del **flag SENIOR** + detección de descenso. | `contratos-integracion.md`, VAC-MAES-12, VAC-ASCE-06 | 🔧 |
| TI-02 | Tipo de **IdP/SSO** corporativo y mapeo de claims a `codigo_empleado`. | ADR-001 | 🔧 |
| TI-03 | Valores definitivos de la **política de seguridad** (contraseñas, sesiones, MFA). | ADR-002, VAC-MAES-17 | 🔧 |
| TI-04 | Mecanismo de **fuente única del código de autorización zonal** (generación/validación). | `ENT-MOD-MARC-001` | 🔧 |
| TI-05 | Idempotencia del lado receptor (POS/RMS/OFIPLAN) en callbacks. | ADR-003 | 🔧 |

---

## 7. Riesgos vinculados

- **R-06 (C-01):** reubicación de Ascenso y cambio de promotor a AV — requiere validación compliance.
- **R-07 (C-02):** consolidación del motor de ausencias — riesgo de inconsistencia si no se valida el no-cruce de forma transversal.
- **R-08 (C-03):** confirmación de Admin Retail como responsable de Encargatura.

> Ver detalle y propuestas de resolución en `backlog-epicas.md` (sección de Riesgos).

---

## 8. Trazabilidad

| Fuente | Documento |
|---|---|
| Alcance | `product/alcance-nova.md` |
| Backlog | `product/backlog-epicas.md` |
| Reconciliación del prototipo | `design/reconciliacion-ux.md` |
| Decisiones de arquitectura | `architecture/adr/` |
| Especificaciones funcionales | `analysis/ENT-MOD-*.md` |
