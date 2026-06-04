# Estrategia de Datos — Fase 0 (migraciones, semillas, respaldo, retención)

| Campo | Valor |
|---|---|
| Sistema | Nova — Fase 0 (segu, maes, apro) |
| Motor | PostgreSQL 16 |
| Fecha | 30/05/2026 |
| Elaborado por | DBA |

## 1. Estrategia de migraciones

### 1.1 Herramienta
**Flyway** (recomendado), por encajar con el stack candidato (.NET 8 / Java 21 LTS, arquitectura §2) y con cualquiera de ellos vía CLI/contenedor. Alternativa equivalente: Liquibase. La decisión final de herramienta la confirma Backend/DevOps; el versionado y la convención de nombres son agnósticos.

### 1.2 Convención de versionado
`V<version>__<descripcion>.sql` en `docs/software-factory/database/migraciones/`. Versionado secuencial por fase: `V0_0_x` = Fase 0. Ejemplos:
- `V0_0_1__crear_schemas_y_enums.sql`
- `V0_0_2__tablas_maestros.sql`
- `V0_0_3__tablas_seguridad.sql`
- `V0_0_4__tablas_aprobaciones.sql`
- `V0_0_5__indices_fase0.sql`
- `R__seed_catalogos_fase0.sql` (repeatable / idempotente para datos semilla de catálogo).

> En este repositorio se entrega el DDL consolidado en `esquema/schema-fase0.sql` (idempotente, `IF NOT EXISTS`) como referencia y la primera migración Flyway en `migraciones/`. Backend trocea el resto en migraciones atómicas al integrar.

### 1.3 Principios
- **Idempotencia donde aplica:** el DDL consolidado usa `IF NOT EXISTS` y `DO $$ ... duplicate_object` para enums, de modo que es reejecutable en cualquier entorno (dev/test/prod) sin error. Flyway por diseño aplica cada `V__` una sola vez (checksum); las semillas de catálogo van en script **repeatable** (`R__`) con `INSERT ... ON CONFLICT DO NOTHING`/`DO UPDATE`.
- **Reversibilidad:** cada migración estructural lleva su rollback documentado (Flyway Teams `U__` o, en su defecto, un bloque de rollback comentado en la PR). Para Fase 0 el rollback es DROP de objetos creados (no hay pérdida de datos productivos porque es bootstrap).
- **Migraciones destructivas:** ninguna en Fase 0. A futuro, todo DROP/ALTER con pérdida requiere validación explícita del equipo y rollback probado (política DBA).
- **Orden:** `maes` antes que `segu` y `apro` (dependencia de FK a `maes`).

## 2. Datos semilla iniciales (seed)

Los siguientes datos son **catálogo de arranque** confirmados por las especificaciones. Valores ficticios donde corresponde a ejemplos; los parámetros con default confirmado se cargan como `vigencia_desde = 2026-05-30`.

### 2.1 Empresas (MAES §7.1, VAC-MAES-14)
| id_empresa | nombre | dia_inicio_semana | existe_cobertura_tipo_venta |
|---|---|---|---|
| CADENA | Cadena | DOMINGO | false |
| LUKERS | Lukers | DOMINGO | true |

### 2.2 Catálogo de roles funcionales (SEGU §3.2, RN-MAES-10)
| id_rol | nombre | nivel_autoridad | ambito_permitido |
|---|---|---|---|
| R-ADM | Administrador del Sistema | 100 | CENTRAL |
| R-GG | Gerencia General | 90 | CENTRAL |
| R-GG-SUP | Gerencia General Suplente | 85 | CENTRAL |
| R-AV | Administración de Ventas | 70 | CENTRAL |
| R-AR | Administración Retail | 70 | CENTRAL |
| R-BIEN | Área de Bienestar | 60 | CENTRAL |
| R-GZ | Gerente Zonal / de Ventas | 50 | ZONA |
| R-GT | Gerente de Tienda | 40 | TIENDA |
| R-SENIOR | Senior | 20 | TIENDA |
| R-EMP | Empleado / Colaborador | 10 | TIENDA |

`nivel_autoridad` es base para la validación de compatibilidad de delegación/suplencia (RN-SEGU-28/31). Valores propuestos por el DBA; requieren confirmación de la jerarquía real con el negocio.

### 2.3 Permisos sobre Seguridad (SEGU §8.1) — clave MODULO.RECURSO.ACCION
`SEGU.USUARIO.CREAR/EDITAR/BAJA/CONSULTAR`, `SEGU.ROL.ASIGNAR`, `SEGU.AMBITO.ASIGNAR`, `SEGU.JERARQUIA.EDITAR`, `SEGU.DELEGACION.CREAR`, `SEGU.SUPLENCIA.DESIGNAR`, `SEGU.CREDENCIAL.RESTABLECER`, `SEGU.CREDENCIAL.CAMBIAR`, `SEGU.AUDITORIA.CONSULTAR/EXPORTAR`. Más los permisos de negocio del mapa SEGU §8.2 (`ROLP.ROL.*`, `APRO.TAREA.APROBAR`, `MAES.PARAMETRO.CONFIGURAR`, etc.) que se completan al construir cada módulo.

### 2.4 Flujos de aprobación (APRO §7.7) — plantillas base
| codigo | tipo_objeto | modulo | niveles | SLA |
|---|---|---|---|---|
| FL_ROL | ROL_SEMANAL | ROL | N1 GZ submit → N2 GG aprueba (JERARQUIA_POR_ZONA, CALLBACK BLOQUEAR_CAJAS) → N3 GT programa | plazos internos del Rol (ADR-008, no APRO_SLA_FL_ROL_*) |
| FL_LSGH | LICENCIA_LSGH | DESC | N1 GG (JERARQUIA) | 2 días hábiles |
| FL_LCGH | LICENCIA_LCGH | DESC | N1 GG | 2 días hábiles |
| FL_DESC_MEDICO | DESCANSO_MEDICO | DESC | N1 VALIDACION_AREA Bienestar (NOTIFICAR) | 2 días hábiles |
| FL_VAC_ANULA | ANULACION_VACACIONES | VAC | N1 AUTORIZACION AV o GG (cuórum CUALQUIERA) | 2 días hábiles |
| FL_ASCE | ASCENSO_SENIOR | ASCE | N1 solicita → N2 GG aprueba (requiere_compliance) | 5 días hábiles |
| FL_ENCA | ENCARGATURA | ENCA | 0 niveles (AUTOAPROBACION total) | — |

### 2.5 Parámetros con valores por defecto confirmados (MAES §7.6)

**Aprobaciones — SLA por flujo (VAC-MAES-15 RESUELTO):**
| clave (derivada) | flujo | nivel | valor | unidad | criticidad |
|---|---|---|---|---|---|
| APROBACIONES_SLA_FL_LSGH_GG | FL_LSGH | GG | 2 | días hábiles | BLOQUEANTE |
| APROBACIONES_SLA_FL_LCGH_GG | FL_LCGH | GG | 2 | días hábiles | BLOQUEANTE |
| APROBACIONES_SLA_FL_VAC_ANULA_AVGG | FL_VAC_ANULA | AVGG | 2 | días hábiles | BLOQUEANTE |
| APROBACIONES_SLA_FL_DESC_MEDICO_BIENESTAR | FL_DESC_MEDICO | BIENESTAR | 2 | días hábiles | DEGRADABLE |
| APROBACIONES_SLA_FL_ASCE_GG | FL_ASCE | GG | 5 | días hábiles | BLOQUEANTE |
| APROBACIONES_ANTICIPACION_RECORDATORIO | (global) | — | [24, 1] | horas | DEGRADABLE |

**Ascenso (confirmados ASCE v1.2):**
| clave | valor | unidad | impacto | criticidad |
|---|---|---|---|---|
| ASCE_SLA_RESOLUCION_DIAS | 5 | días hábiles | Sí | BLOQUEANTE |
| ASCE_PERIODO_HISTORIAL_MESES | 6 | meses | Sí | DEGRADABLE |
| ASCE_NOTIF_COLABORADOR_ASCENSO | true | — | No | DEGRADABLE |
| ASCE_NOTIF_DESCENSO | true | — | No | DEGRADABLE |
| ASCE_ALERTA_SLA_DESTINATARIOS | ["R-GG","R-GZ","R-AV"] | — | No | DEGRADABLE |
| ASCE_PUESTOS_HABILITADOS_SENIOR | ["Asesor","Secretaria-Cajera","Jefe de Piso","Supervisor de Seccion","Promotor"] | — | Sí | DEGRADABLE |
| ASCE_LIMITE_PENDIENTES | 0 | — | No | DEGRADABLE |
| ASCE_MAX_CARACTERES_MOTIVO | 500 | — | No | DEGRADABLE |

**Seguridad — política (MAES §7.6; valores del analista, baseline §6 arq. PENDIENTE TI):**
| clave | valor por defecto | criticidad |
|---|---|---|
| SEGURIDAD_PWD_LONGITUD_MINIMA | 10 | BLOQUEANTE |
| SEGURIDAD_PWD_COMPLEJIDAD | ["MAYUS","MINUS","NUMERO","SIMBOLO"] | BLOQUEANTE |
| SEGURIDAD_PWD_EXPIRACION_DIAS | 90 | BLOQUEANTE |
| SEGURIDAD_PWD_HISTORIAL_NO_REUSO | 5 | DEGRADABLE |
| SEGURIDAD_LOGIN_MAX_INTENTOS | 5 | BLOQUEANTE |
| SEGURIDAD_LOGIN_BLOQUEO_MINUTOS | 30 | DEGRADABLE |
| SEGURIDAD_SESION_INACTIVIDAD_MIN | 30 | DEGRADABLE |
| SEGURIDAD_SESION_ABSOLUTA_HORAS | 12 | DEGRADABLE |
| SEGURIDAD_AUTENTICACION_METODO | "LOCAL" | BLOQUEANTE |
| SEGURIDAD_MFA_HABILITADO_POR_ROL | [] | BLOQUEANTE |

**Rol — plazos (gestión interna del Rol, ADR-008; flujo = NULL):**
ROL_PLAZO_ENVIO_GZ (jueves 23:59), ROL_PLAZO_EXTENDIDO_GZ (viernes mediodía), ROL_PLAZO_APROBACION_GG (sábado 10:00), ROL_PLAZO_PROGRAMACION_GT (domingo mediodía) — todos BLOQUEANTE (disparan bloqueo de cajas).

**Transversal / otros módulos:** DESC_SLA_BIENESTAR=2, VAC_MIN_DIAS_PERIODO, VAC_MIN_DIAS_FRACCION, TRAS_MAX_DIAS_TEMPORAL, FIRMA_INTENTOS_MAX, FIRMA_EXPIRACION_CODIGO, etc. (cargados con sus defaults del catálogo; los que dependen de insumo del negocio —DESC_DIAS_NO_COMPENSABLES, DESC_TABLA04— se siembran sin valor o se posponen hasta VAC-MAES-02/06).

> El seed completo se entrega como `R__seed_catalogos_fase0.sql` (repeatable, idempotente con `ON CONFLICT`). Solo carga catálogo y parámetros; NO crea usuarios reales (excepto, opcionalmente, un usuario ADM bootstrap con contraseña temporal + `requiere_cambio=true`, según decida Seguridad TI).

## 3. Indexación y rendimiento
Ver `indices-y-rendimiento.md` (índices por patrón crítico: resolución de aprobador, bandeja, parámetro vigente, feriados, outbox/SLA).

## 4. Estrategia de respaldo y retención
Ver `respaldo-retencion.md` (RPO/RTO, full/incremental, retención de auditoría VAC-SEGU-16, particionamiento de logs).

## 5. Estrategia de cifrado y datos sensibles
Ver `datos-sensibles.md` (clasificación, cifrado de credenciales/identidad, enmascaramiento, cumplimiento).
