# Datos Sensibles — Clasificación y Tratamiento (Fase 0)

| Campo | Valor |
|---|---|
| Sistema | Nova — PostgreSQL 16 |
| Fecha | 30/05/2026 |
| Elaborado por | DBA, a coordinar con Seguridad TI |
| Estado | PROPUESTA — el cifrado y la retención requieren confirmación de Seguridad TI / Compliance |

Clasificación desde el modelado (responsabilidad de cumplimiento del rol DBA). Marco: GDPR (privacidad), PCI-DSS (no aplica directamente — no hay tarjetas en Fase 0), ISO 27001, y política peruana de datos personales.

## 1. Clasificación de campos

| Tabla.campo | Clasificación | Sensibilidad | Tratamiento propuesto |
|---|---|---|---|
| `segu.credencial.hash_password` | Credencial | `⚠️ DATO SENSIBLE` (crítico) | **Hash Argon2id** (ADR-002), nunca en claro, nunca expuesto en logs/exports. Columna `algoritmo` para rotación. |
| `segu.credencial_historial.hash_password` | Credencial | `⚠️ DATO SENSIBLE` | Igual; cantidad limitada por `SEGURIDAD_PWD_HISTORIAL_NO_REUSO`; purga del resto. |
| `segu.usuario.codigo_empleado_rms` | Identidad / vínculo RMS | `⚠️ DATO SENSIBLE` | Único vínculo RMS persistido (RN-SEGU-26). Acceso restringido por ámbito + auditado. Evaluar cifrado a nivel columna (pgcrypto) — ver §3. |
| `segu.usuario.correo_contacto` | Dato personal | `⚠️ DATO SENSIBLE` | Restringido a ADM y consulta por ámbito (RN-SEGU-24). |
| `segu.usuario.nombre_usuario` | Identidad | Sensible | Login; no es secreto pero revela identidad. Acceso por ámbito. |
| `apro.solicitud.id_colaborador_afectado` | Identidad del sujeto | `⚠️ DATO SENSIBLE` | Sujeto de licencias/vacaciones/ascensos. Acceso por ámbito. Referencia lógica, no dato personal almacenado. |
| `segu.asignacion_rol_ambito` (conjunto) | Estructura organizacional | `⚠️ DATO SENSIBLE` | Revela quién tiene qué poder sobre qué. Consulta/edición restringida a ADM, consulta GG/AV por ámbito (SEGU §3.2). Auditada. |
| `segu.auditoria_seguridad.detalle` | Traza | Sensible | NO debe contener credenciales (RN-SEGU-25). Validación aplicativa antes de insertar. |

> Nova NO almacena datos personales del empleado (nombre, puesto, tienda base) como fuente de verdad (RN-SEGU-26); los consulta a RMS bajo demanda. Esto minimiza la superficie de dato personal en Nova: solo `codigo_empleado_rms` + `correo_contacto`.

## 2. Controles de acceso (mínimo privilegio)

- **RBAC con ámbito** (el propio módulo SEGU): la lectura del listado de usuarios y asignaciones se restringe a ADM (todo) y GG/AV (su ámbito), con filtrado automático (RN-SEGU-24).
- **Roles de base de datos** segregados por esquema (ver `respaldo-retencion.md` §6). `apro` no tiene SELECT directo sobre `segu.usuario`: resuelve identidades por servicio (preserva frontera y minimiza exposición).
- **Auditoría de acceso a datos sensibles:** exportaciones y denegaciones críticas se registran (RN-SEGU-23/25).

## 3. Cifrado

| Capa | Propuesta | Estado |
|---|---|---|
| En tránsito | TLS extremo a extremo (arquitectura §4) | Responsabilidad DevOps/TI |
| En reposo (volumen) | **TDE / cifrado de disco** del clúster PostgreSQL | `⚠️ PENDIENTE` — decisión de infraestructura TI |
| En reposo (columna) | `pgcrypto` para `codigo_empleado_rms` (evaluar) | Propuesta; coordinar con Seguridad TI. Trade-off: cifrar la columna impide su uso como índice de búsqueda directa (la unicidad `uk_usuario_emp_activo` requiere el valor o un hash determinista). Recomendación: **hash determinista (HMAC) para el índice de unicidad + valor cifrado** si TI exige cifrado de columna; si TDE de volumen es suficiente para el marco regulatorio, mantener la columna en claro dentro del clúster cifrado. **Requiere decisión de Seguridad TI.** |
| Credenciales | Argon2id (no es cifrado reversible, es hash) | Resuelto (ADR-002) |

## 4. Seudonimización / enmascaramiento

- **Entornos no productivos:** los dumps para dev/test se generan con **enmascaramiento** de `correo_contacto` (p.ej. `usuario+masked@ejemplo.local`) y `codigo_empleado_rms` (códigos ficticios), y con `hash_password` reseteado a una credencial de prueba con `requiere_cambio=true`. Nunca se copian credenciales ni identidades reales a entornos inferiores.
- **Exportaciones a Excel** (SEGU/MAES/APRO §8): respetan el ámbito del consultor y quedan auditadas; no incluyen hashes.

## 5. Retención y derecho al olvido

- Baja de usuario = **baja lógica** (estado DESACTIVADO), se conserva para auditoría (SEGU §6.2, RN-SEGU-22). No hay borrado físico de identidades por defecto.
- La eventual eliminación definitiva (derecho de supresión) se trata como migración destructiva: requiere validación de Compliance, rollback documentado y registro de auditoría del propio borrado.
- Retención de auditoría: ver `respaldo-retencion.md` §3 (VAC-SEGU-16, abierto).

## 6. Puntos para Seguridad TI / Compliance

1. Confirmar cifrado de columna (`codigo_empleado_rms`) vs. TDE de volumen (§3).
2. Confirmar parámetros Argon2id (memoria/iteraciones/paralelismo) — VAC-SEGU-09.
3. Confirmar retención de auditoría — VAC-SEGU-16.
4. Confirmar política de seudonimización en entornos inferiores.
5. Confirmar baseline de política de contraseñas (arquitectura §6, PENDIENTE TI) que se carga como parámetros `SEGURIDAD_*`.
