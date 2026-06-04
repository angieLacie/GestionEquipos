# Respaldo y Retención — Fase 0

| Campo | Valor |
|---|---|
| Sistema | Nova — PostgreSQL 16 (primaria + réplica, arquitectura §4) |
| Fecha | 30/05/2026 |
| Elaborado por | DBA |
| Estado | PROPUESTA — RPO/RTO y retención de auditoría requieren confirmación TI/Compliance (VAC-SEGU-16) |

## 1. Política de respaldo

| Aspecto | Propuesta | Justificación |
|---|---|---|
| Base física | **pg_basebackup** + **WAL archiving** (archivado continuo de WAL) | Permite PITR (Point-In-Time Recovery). |
| Full | Diario (ventana de baja actividad) | Datos transaccionales con impacto legal/económico (bloqueo cajas, ascensos). |
| Incremental / WAL | Continuo (archivado de segmentos WAL) | Minimiza pérdida entre fulls. |
| Réplica | Réplica de lectura síncrona/asíncrona (arquitectura §4/§7) | HA + descarga de reportes/auditoría/exportaciones. |
| Verificación | Restauración de prueba periódica en entorno aislado | Un backup no probado no es un backup. |

## 2. RPO / RTO (propuesta a confirmar con TI)

| Métrica | Propuesta | Razón |
|---|---|---|
| RPO | <= 5 min (vía WAL continuo) | El doble efecto y las decisiones de aprobación no deben perderse; el outbox (ADR-003) ya protege la consistencia, el WAL protege la durabilidad. |
| RTO | <= 1 h | Sistema transversal del que dependen 7 módulos; failover a réplica + restauración acotada. |

`⚠️ PENDIENTE APROBACIÓN TI` — RPO/RTO definitivos los fija TI/DevOps según SLA corporativo.

## 3. Retención de datos

| Dato | Retención propuesta | Base |
|---|---|---|
| Auditoría de seguridad (`segu.auditoria_seguridad`) | **Mínimo 1 año en línea + archivado frío hasta 5 años** | VAC-SEGU-16 (`⚠️ REQUIERE VALIDACION COMPLIANCE`). Accesos, cambios de rol/ámbito, delegaciones. |
| Auditoría de configuración (`maes.auditoria_configuracion`) | Igual que arriba | Cambios con impacto económico/legal (RN-MAES-16/17). |
| Auditoría de aprobaciones (`apro.auditoria_aprobacion`) | Igual que arriba | Trazabilidad de decisiones con impacto legal (ascensos, bloqueos). |
| Outbox despachado (`apro.outbox_evento` estado DESPACHADO) | Purga tras 30-90 días | Eventos ya entregados; se conserva la traza en auditoría. La tabla de efectos aplicados NO se purga (idempotencia). |
| Sesiones (`segu.sesion`) | Purga de EXPIRADA/CERRADA tras 30 días | El estado vivo está en Redis. |
| Versiones históricas de parámetros/feriados | **Sin purga** | Necesarias para reconstruir el "valor vigente a una fecha pasada" (RN-MAES-09/14). |

> La retención definitiva de auditoría es decisión de Compliance/TI (VAC-SEGU-16, marcado abierto en SEGU §10). La propuesta de 1 año en línea + 5 años fría es un punto de partida alineado a buenas prácticas; debe validarse contra requisito regulatorio peruano y políticas corporativas.

## 4. Particionamiento (escalabilidad de auditoría)

Las tablas de auditoría y el outbox crecen de forma monótona. Propuesta:
- **Particionamiento por rango de tiempo** (`PARTITION BY RANGE (fecha_hora)`) mensual o trimestral en las tres tablas de auditoría, una vez se confirme el volumen. A la escala de ~100 tiendas el volumen inicial es moderado; se difiere la implementación hasta tener métricas del piloto (arquitectura §8), pero el modelo lo permite sin reescritura (cambio de tabla a particionada vía migración controlada).
- **Archivado frío:** particiones antiguas se mueven a almacenamiento de menor costo (export + DROP de partición) conservando el archivo para compliance.
- Las tablas de negocio de Fase 0 (usuarios, asignaciones, parámetros, flujos) son de bajo volumen y NO requieren particionamiento.

## 5. Procedimiento de recuperación (resumen)

1. Identificar punto de recuperación (timestamp o fallo).
2. Restaurar último full + aplicar WAL hasta el punto deseado (PITR).
3. Promover réplica si el fallo es de la primaria (failover).
4. Validar integridad: conteos de control, verificación de `uk_*` de idempotencia (outbox/efectos), revisión de solicitudes en `PENDIENTE_RESOLUCION_APROBADOR`.
5. Reanudar workers (outbox, SLA, sync RMS) — son idempotentes por diseño (ADR-003), reprocesar es seguro.
6. Documentar el incidente y el RPO/RTO efectivamente logrados.

## 6. Mínimo privilegio (acceso a datos)

Roles de base de datos por servicio (principio de mínimo privilegio, responsabilidad DBA):
- `nova_segu_rw`: DML sobre `segu.*`, SELECT sobre catálogos `maes.*` que referencia.
- `nova_maes_rw`: DML sobre `maes.*`.
- `nova_apro_rw`: DML sobre `apro.*`, SELECT sobre `maes.*` (parámetros/flujos) y resolución vía servicio (no SELECT directo a `segu.usuario`).
- `nova_readonly`: SELECT para reportes/auditoría (apunta a la réplica).
- Las tablas de auditoría se otorgan **solo INSERT + SELECT** (sin UPDATE/DELETE) a los servicios → inmutabilidad append-only por privilegios. Cualquier excepción se documenta con justificación.
