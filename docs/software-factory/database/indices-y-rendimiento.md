# Índices y Rendimiento — Fase 0

| Campo | Valor |
|---|---|
| Sistema | Nova — Fase 0 (segu, maes, apro) |
| Motor | PostgreSQL 16 |
| Fecha | 30/05/2026 |
| Elaborado por | DBA |

Este documento justifica cada índice por el patrón de consulta real derivado de los casos de uso. Los índices están en `esquema/schema-fase0.sql`.

## 1. Patrones de consulta críticos (de los casos de uso)

| # | Patrón | Origen | Solución de indexación |
|---|---|---|---|
| P1 | Resolución de aprobador por **rol + ámbito (zona)** | CU-SEGU-04 §2.a (JERARQUIA_POR_ZONA) | `idx_asignacion_zona_zona` (zona→asignación) + `idx_asig_rol_empresa`/`idx_asig_rol_tienda`. Join: `asignacion_zona JOIN asignacion_rol_ambito WHERE id_zona=? AND id_rol=? AND estado='VIGENTE'`. |
| P2 | Resolución de aprobador por **rol + empresa** | CU-SEGU-04 §2.b | `idx_asig_rol_empresa(id_rol, id_empresa) WHERE estado='VIGENTE'`. |
| P3 | **Bandeja de pendientes** por usuario | CU-APRO bandeja, APRO §8 "Ver bandeja" | `idx_tarea_bandeja(id_aprobador_titular) WHERE estado='PENDIENTE'` (índice parcial: solo filas calientes). |
| P4 | **Lookup de parámetro vigente** por clave + fecha | CU-MAES-06, RN-MAES-14 | `idx_param_clave_vigencia(clave, vigencia_desde DESC) INCLUDE(valor, criticidad_consumo)` → index-only scan para el caso común. |
| P5 | **Feriados por tienda/zona y fecha** | RN-MAES-01/03, consumo Rol/Vac/Desc | `idx_feriado_fecha(fecha) WHERE vigencia_hasta IS NULL`, `idx_feriado_empresas_gin` (empresas_aplicables), `idx_feriado_ambito_ambito` (LOCAL por tienda/zona). |
| P6 | **Worker de SLA**: tareas próximas a vencer | RN-APRO-13/18 | `idx_tarea_sla(fecha_vencimiento_sla) WHERE estado='PENDIENTE'`. |
| P7 | **Worker de outbox**: eventos a despachar/reintentar | ADR-003 | `idx_outbox_pendiente(proximo_intento_en) WHERE estado_despacho IN ('PENDIENTE','FALLIDA_PROPAGACION')`. |
| P8 | Solicitudes en **PENDIENTE_RESOLUCION_APROBADOR** (jerarquía incompleta) | RN-SEGU-17, monitoreo arq §8 | `idx_solicitud_pend_resol(estado) WHERE estado='PENDIENTE_RESOLUCION_APROBADOR'`. |
| P9 | Roles vigentes de un usuario (contexto de seguridad) | CU-SEGU-02 §7, RN-SEGU-07 | `idx_asig_usuario_vigente(id_usuario) WHERE estado='VIGENTE'`. |
| P10 | Login por nombre de usuario | CU-SEGU-02 | `uk_usuario_login(nombre_usuario)` (citext, único). |
| P11 | Delegado/suplente vigente de un titular/rol | CU-SEGU-04 §4, RN-SEGU-20 | `idx_delegacion_delegado_vig`, `idx_delegacion_titular_vig`, `idx_suplencia_rol_vig`, `idx_suplencia_suplente_vig` (parciales WHERE estado='VIGENTE'). |
| P12 | Superior jerárquico para escalamiento | RN-SEGU-18 | `idx_jerarquia_rol_ambito`, `idx_jerarquia_superior`. |
| P13 | Idempotencia de efecto de callback (exactly-once) | ADR-003 paso 3 | `uk_efecto_idempotency(idempotency_key)` + `uk_outbox_idempotency`. |

## 2. Estrategia de índices parciales

Las tablas con estados (asignaciones, tareas, sesiones, delegaciones, outbox) usan **índices parciales** sobre el estado "caliente" (`VIGENTE`/`PENDIENTE`/`ACTIVA`). Razón: el grueso de las consultas operativas solo toca filas activas; el índice parcial reduce tamaño, mejora cache-hit y evita escanear el histórico expirado (que crece sin límite por ser append-only).

## 3. Tipos de índice por caso

- **B-Tree** (por defecto): claves, vigencias, lookups por igualdad/rango. Mayoría de los índices.
- **GIN** (`idx_feriado_empresas_gin`): contención sobre el JSONB `empresas_aplicables` (`empresas_aplicables @> '["LUKERS"]'`). Igual patrón aplicable a futuro sobre `valor` de parámetros LISTA si surge consulta por contenido.
- **Covering / INCLUDE** (`idx_param_clave_vigencia`): el lookup de configuración es altísima frecuencia (todos los módulos, RNF de latencia); incluir `valor` y `criticidad_consumo` permite index-only scan sin tocar el heap.

## 4. Unicidad funcional (integridad de negocio)

| Restricción | Regla | Mecanismo |
|---|---|---|
| Un usuario ACTIVO por empleado RMS | RN-SEGU-03 | índice único parcial `uk_usuario_emp_activo WHERE estado='ACTIVO'` |
| Un valor de parámetro vigente por clave/ámbito/fecha | ADR-004 | índice único `uk_parametro_logico` |
| Un evento de outbox por efecto | ADR-003 | `uk_outbox_idempotency` |
| Un efecto aplicado por idempotency_key | ADR-003 | `uk_efecto_idempotency` |
| Login único | RN-SEGU | `uk_usuario_login` |
| Código de tienda único (upsert RMS) | contratos §3 | `uk_tienda_codigo` |

> Pendiente de afinar con datos reales: el feriado NACIONAL único por (fecha, empresa) de RN-MAES-02 no se puede expresar como índice único simple porque `empresas_aplicables` es una lista. Recomendación: validación aplicativa al insertar, o (si el negocio confirma feriado por-empresa fila a fila) normalizar a `feriado_empresa(id_feriado, id_empresa)` con índice único parcial `WHERE alcance='NACIONAL' AND vigencia_hasta IS NULL`. Requiere confirmación del modelado de feriados con el negocio.

## 5. Caché (Redis) — complemento al índice

Arquitectura §7 define caché agresivo para dos patrones:
- **Servicio de configuración** (P4): invalidación por versión/vigencia. El índice covering cubre el miss; Redis absorbe el hit.
- **Contexto de seguridad** (P9, P1, P11): permisos/ámbito por sesión con TTL corto, invalidación ante cambio de rol/ámbito. Evita recomputar el RBAC con ámbito en cada request.

## 6. Consideraciones de planes de ejecución

- Las resoluciones de aprobador (P1/P2) son joins de 2-3 tablas pequeñas con índices parciales → nested loop / index scan, sub-milisegundo a la escala de ~100 tiendas y cientos de usuarios.
- La auditoría crece monótonamente: índices por `(actor/entidad, fecha_hora DESC)` para consulta reciente; ver particionamiento en `respaldo-retencion.md`.
- `ANALYZE` tras la carga de semillas; revisar `pg_stat_statements` tras el piloto de Fase 0 (arquitectura §8) para detectar full scans no previstos.
