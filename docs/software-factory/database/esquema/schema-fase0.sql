-- =====================================================================
-- Nova - Sistema de Gestion de Equipos (retail Cadena / Lukers)
-- DDL Fase 0 (Cimientos): Seguridad (segu), Maestros (maes), Aprobaciones (apro)
-- Motor: PostgreSQL 16
-- Estilo: monolito modular - un schema por bounded context
-- Alineado a: ENT-MOD-SEGU-001 v1.0, ENT-MOD-MAES-001 v1.2, ENT-MOD-APRO-001 v1.0,
--             ADR-002 (hashing), ADR-003 (outbox/idempotencia), ADR-004 (clave logica),
--             ADR-005 (criticidad), contratos-integracion.md (RMS upsert idempotente)
-- NOTA DBA: valores ficticios. Datos sensibles marcados. Migraciones destructivas
--           requieren validacion del equipo + rollback documentado.
-- Idempotente: usa IF NOT EXISTS / DO $$ donde aplica.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- login/correo case-insensitive

CREATE SCHEMA IF NOT EXISTS maes;
CREATE SCHEMA IF NOT EXISTS segu;
CREATE SCHEMA IF NOT EXISTS apro;

-- =====================================================================
-- TIPOS ENUM
-- =====================================================================

-- ---- maes ----
DO $$ BEGIN
  CREATE TYPE maes.dia_semana AS ENUM ('DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.estado_catalogo AS ENUM ('VIGENTE','DESACTIVADO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.ubicacion_tienda AS ENUM ('CC','PC'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.estado_tienda AS ENUM ('ACTIVA','SUSPENDIDA','CERRADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.origen_dato AS ENUM ('RMS','NOVA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.origen_feriado AS ENUM ('REGIONAL_OFICIAL','MANUAL_ADM'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.alcance_feriado AS ENUM ('NACIONAL','LOCAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.modulo_param AS ENUM
  ('ROL','MARC','DESC','ENCA','TRAS','VAC','ASCE','APROBACIONES','SEGURIDAD','TRANSVERSAL','MAESTROS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.ambito_param AS ENUM ('GLOBAL','EMPRESA','ZONA','TIENDA','PUESTO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.tipo_dato_param AS ENUM ('ENTERO','DECIMAL','BOOLEAN','FECHA','HORA','TEXTO','LISTA','RANGO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.criticidad_param AS ENUM ('BLOQUEANTE','DEGRADABLE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.accion_permiso AS ENUM
  ('CREAR','LEER','EDITAR','ELIMINAR','ENVIAR','APROBAR','RECHAZAR','AUTORIZAR','EXPORTAR','CONFIGURAR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.ambito_rol AS ENUM ('CENTRAL','EMPRESA','ZONA','TIENDA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.entidad_audit AS ENUM ('FERIADO','TIENDA','EMPRESA','ZONA','PUESTO','PARAMETRO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maes.accion_audit AS ENUM ('ALTA','MODIFICACION','DESACTIVACION','CAMBIO_VIGENCIA','IMPORTACION'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- segu ----
DO $$ BEGIN CREATE TYPE segu.tipo_usuario AS ENUM ('PERSONAL','TECNICO_CENTRAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.estado_usuario AS ENUM ('PENDIENTE_ASIGNACION','ACTIVO','BLOQUEADO','DESACTIVADO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.metodo_auth AS ENUM ('LOCAL','SSO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.tipo_ambito AS ENUM ('CENTRAL','EMPRESA','ZONA','TIENDA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.estado_vigencia AS ENUM ('VIGENTE','PROGRAMADA','REVOCADA','EXPIRADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.alcance_delegacion AS ENUM ('ROL_COMPLETO','ACCIONES_ESPECIFICAS','TIPOS_FLUJO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.canal_sesion AS ENUM ('WEB','APP_MOVIL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.estado_sesion AS ENUM ('ACTIVA','EXPIRADA','CERRADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.calidad_actuacion AS ENUM ('TITULAR','DELEGADO','SUPLENTE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.resultado_audit AS ENUM ('EXITOSO','FALLIDO','DENEGADO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE segu.evento_audit AS ENUM
  ('LOGIN_OK','LOGIN_FALLIDO','LOGOUT','BLOQUEO','DESBLOQUEO','ALTA_USUARIO','EDIT_USUARIO','BAJA_USUARIO',
   'ASIGNA_ROL','REVOCA_ROL','CAMBIO_AMBITO','CAMBIO_JERARQUIA','DELEGACION','REVOCA_DELEGACION','SUPLENCIA',
   'CAMBIO_CREDENCIAL','DENEGACION_ACCESO','EXPORTACION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- apro ----
DO $$ BEGIN CREATE TYPE apro.tipo_objeto AS ENUM
  ('ROL_SEMANAL','LICENCIA_LSGH','LICENCIA_LCGH','DESCANSO_MEDICO','ANULACION_VACACIONES','ASCENSO_SENIOR','ENCARGATURA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.politica_rechazo AS ENUM ('REINICIO_TOTAL','REINICIO_DESDE_NIVEL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.estado_flujo AS ENUM ('ACTIVA','INACTIVA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.modo_nivel AS ENUM ('APROBACION_JERARQUICA','AUTORIZACION','AUTOAPROBACION','VALIDACION_AREA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.regla_resolucion AS ENUM
  ('ROL_FIJO','JERARQUIA_POR_ZONA','JERARQUIA_POR_EMPRESA','USUARIO_ESPECIFICO','REGLA_DEL_MODULO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.cuorum AS ENUM ('TODOS','AL_MENOS_N','CUALQUIERA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.obligatoriedad AS ENUM ('OPCIONAL','OBLIGATORIO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.consecuencia AS ENUM ('ESCALAR','NOTIFICAR','CALLBACK_MODULO','NINGUNA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.estado_solicitud AS ENUM
  ('PENDIENTE_RESOLUCION_APROBADOR','EN_CURSO','ESCALADA','APROBADA','RECHAZADA','CANCELADA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.estado_tarea AS ENUM ('PENDIENTE','APROBADA','RECHAZADA','VENCIDA','REASIGNADA','RETIRADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.tipo_transicion AS ENUM ('APROBADA','RECHAZADA','VENCIDA','ESCALADA','CANCELADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.estado_despacho AS ENUM ('PENDIENTE','DESPACHADO','FALLIDA_PROPAGACION'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.resultado_efecto AS ENUM ('APLICADO','NO_OP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.evento_audit AS ENUM
  ('INICIO','AUTOAPROBACION','DECISION_APROBAR','DECISION_RECHAZAR','DELEGACION','ESCALAMIENTO',
   'VENCIMIENTO_SLA','CALLBACK','CANCELACION','NOTIFICACION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE apro.resultado_audit AS ENUM ('EXITOSO','FALLIDO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- ESQUEMA maes (catalogos / parametros). Se crea primero: segu/apro lo referencian.
-- =====================================================================

CREATE TABLE IF NOT EXISTS maes.empresa (
  id_empresa                  VARCHAR(10)  PRIMARY KEY,
  nombre                      VARCHAR(120) NOT NULL,
  dia_inicio_semana           maes.dia_semana NOT NULL DEFAULT 'DOMINGO',
  existe_cobertura_tipo_venta BOOLEAN      NOT NULL DEFAULT false,
  tope_cuota_asesor           NUMERIC(12,2),
  estado                      maes.estado_catalogo NOT NULL DEFAULT 'VIGENTE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID,
  updated_by  UUID
);

CREATE TABLE IF NOT EXISTS maes.zona (
  id_zona     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(120) NOT NULL,
  id_empresa  VARCHAR(10) REFERENCES maes.empresa(id_empresa) ON DELETE RESTRICT,
  estado      maes.estado_catalogo NOT NULL DEFAULT 'VIGENTE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zona_empresa ON maes.zona(id_empresa);

CREATE TABLE IF NOT EXISTS maes.tienda (
  id_tienda                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                    VARCHAR(30)  NOT NULL,
  nombre                    VARCHAR(160) NOT NULL,
  id_empresa                VARCHAR(10)  NOT NULL REFERENCES maes.empresa(id_empresa) ON DELETE RESTRICT,
  id_zona                   UUID         NOT NULL REFERENCES maes.zona(id_zona) ON DELETE RESTRICT,
  ubicacion                 maes.ubicacion_tienda NOT NULL,
  dotacion_minima_asesores  INTEGER      NOT NULL DEFAULT 0,           -- solo lectura, fuente RMS (RN-MAES-05)
  fecha_vigencia_dotacion   DATE,
  estado_operativo          maes.estado_tienda NOT NULL DEFAULT 'ACTIVA',
  fecha_efecto_estado       DATE,
  origen                    maes.origen_dato NOT NULL DEFAULT 'RMS',
  rms_sync_at               TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_tienda_codigo UNIQUE (codigo),                         -- clave de upsert idempotente RMS (contratos §3)
  CONSTRAINT ck_tienda_dotacion CHECK (dotacion_minima_asesores >= 0),
  CONSTRAINT ck_tienda_estado_fecha CHECK (
    estado_operativo = 'ACTIVA' OR fecha_efecto_estado IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_tienda_zona    ON maes.tienda(id_zona);
CREATE INDEX IF NOT EXISTS idx_tienda_empresa ON maes.tienda(id_empresa);
CREATE INDEX IF NOT EXISTS idx_tienda_activa  ON maes.tienda(id_zona) WHERE estado_operativo = 'ACTIVA';

CREATE TABLE IF NOT EXISTS maes.puesto (
  id_puesto             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                VARCHAR(40)  NOT NULL,
  nombre                VARCHAR(120) NOT NULL,
  genera_ratios_senior  BOOLEAN NOT NULL DEFAULT false,
  habilitado_senior     BOOLEAN NOT NULL DEFAULT false,
  origen                maes.origen_dato NOT NULL DEFAULT 'RMS',
  rms_sync_at           TIMESTAMPTZ,
  CONSTRAINT uk_puesto_codigo UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS maes.puesto_limite_empresa (
  id_limite                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_puesto                      UUID NOT NULL REFERENCES maes.puesto(id_puesto) ON DELETE CASCADE,
  id_empresa                     VARCHAR(10) NOT NULL REFERENCES maes.empresa(id_empresa) ON DELETE RESTRICT,
  max_dias_descanso_laboral      INTEGER NOT NULL,
  participa_cobertura_tienda     BOOLEAN NOT NULL DEFAULT false,
  participa_cobertura_tipo_venta BOOLEAN NOT NULL DEFAULT false,
  estados_elegibles_rol          JSONB   NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT uk_puesto_limite UNIQUE (id_puesto, id_empresa),
  CONSTRAINT ck_max_descanso CHECK (max_dias_descanso_laboral BETWEEN 0 AND 7)
);

CREATE TABLE IF NOT EXISTS maes.feriado (
  id_feriado          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha               DATE         NOT NULL,
  descripcion         VARCHAR(160) NOT NULL,
  alcance             maes.alcance_feriado NOT NULL,
  origen              maes.origen_feriado  NOT NULL,
  empresas_aplicables JSONB        NOT NULL,
  compensable         BOOLEAN      NOT NULL DEFAULT true,
  vigencia_desde      DATE         NOT NULL,
  vigencia_hasta      DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_feriado_vigencia CHECK (vigencia_hasta IS NULL OR vigencia_hasta > vigencia_desde)
);
-- Busqueda de feriados por fecha (patron: feriados de una tienda/fecha)
CREATE INDEX IF NOT EXISTS idx_feriado_fecha ON maes.feriado(fecha) WHERE vigencia_hasta IS NULL;
CREATE INDEX IF NOT EXISTS idx_feriado_empresas_gin ON maes.feriado USING GIN (empresas_aplicables);

-- Ambito de feriados LOCAL (tiendas/zonas asociadas). Obligatorio >=1 si alcance=LOCAL (validacion app).
CREATE TABLE IF NOT EXISTS maes.feriado_ambito (
  id_feriado  UUID NOT NULL REFERENCES maes.feriado(id_feriado) ON DELETE CASCADE,
  tipo_ambito maes.ambito_param NOT NULL,    -- ZONA / TIENDA
  id_ambito   UUID NOT NULL,                 -- ref logica a maes.zona / maes.tienda
  PRIMARY KEY (id_feriado, tipo_ambito, id_ambito),
  CONSTRAINT ck_feriado_ambito_tipo CHECK (tipo_ambito IN ('ZONA','TIENDA'))
);
CREATE INDEX IF NOT EXISTS idx_feriado_ambito_ambito ON maes.feriado_ambito(id_ambito);

CREATE TABLE IF NOT EXISTS maes.rol_catalogo (
  id_rol           VARCHAR(20) PRIMARY KEY,
  nombre           VARCHAR(120) NOT NULL,
  nivel_autoridad  INTEGER NOT NULL,
  ambito_permitido maes.ambito_rol NOT NULL,
  estado           maes.estado_catalogo NOT NULL DEFAULT 'VIGENTE'
);

CREATE TABLE IF NOT EXISTS maes.permiso (
  id_permiso UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave      VARCHAR(80) NOT NULL,
  modulo     maes.modulo_param NOT NULL,
  accion     maes.accion_permiso NOT NULL,
  CONSTRAINT uk_permiso_clave UNIQUE (clave)
);

CREATE TABLE IF NOT EXISTS maes.rol_permiso (
  id_rol     VARCHAR(20) NOT NULL REFERENCES maes.rol_catalogo(id_rol) ON DELETE CASCADE,
  id_permiso UUID        NOT NULL REFERENCES maes.permiso(id_permiso) ON DELETE CASCADE,
  PRIMARY KEY (id_rol, id_permiso)
);

-- Parametro: modelo relacional con clave logica derivada (ADR-004)
CREATE TABLE IF NOT EXISTS maes.parametro (
  id_parametro      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo            maes.modulo_param NOT NULL,
  flujo             VARCHAR(40),                 -- ref logica apro.flujo.codigo (nullable)
  nivel             VARCHAR(40),                 -- ref logica apro.nivel (nullable)
  nombre_parametro  VARCHAR(80)  NOT NULL,
  -- clave logica derivada: reproduce convencion MAES 7.6 / ADR-004
  clave             VARCHAR(160) GENERATED ALWAYS AS (
                       upper(modulo::text) || '_' || nombre_parametro
                       || COALESCE('_' || flujo, '')
                       || COALESCE('_' || nivel, '')
                    ) STORED,
  ambito            maes.ambito_param NOT NULL DEFAULT 'GLOBAL',
  id_empresa        VARCHAR(10) REFERENCES maes.empresa(id_empresa) ON DELETE RESTRICT,
  id_ambito         UUID,                        -- tienda/zona/puesto si acotado (ref logica)
  tipo_dato         maes.tipo_dato_param NOT NULL,
  unidad            VARCHAR(20),
  valor             JSONB NOT NULL,
  valor_por_defecto JSONB,
  rango_min         JSONB,
  rango_max         JSONB,
  es_impacto_negocio BOOLEAN NOT NULL DEFAULT false,
  criticidad_consumo maes.criticidad_param NOT NULL DEFAULT 'DEGRADABLE',
  vigencia_desde    DATE NOT NULL,
  vigencia_hasta    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID,
  CONSTRAINT ck_param_vigencia CHECK (vigencia_hasta IS NULL OR vigencia_hasta > vigencia_desde)
);
-- Unicidad ADR-004: un solo valor vigente por clave logica/ambito a una fecha
CREATE UNIQUE INDEX IF NOT EXISTS uk_parametro_logico ON maes.parametro (
  modulo, COALESCE(flujo,''), COALESCE(nivel,''), nombre_parametro, ambito,
  COALESCE(id_empresa,''), COALESCE(id_ambito,'00000000-0000-0000-0000-000000000000'::uuid),
  vigencia_desde
);
-- Patron critico: lookup de parametro vigente por clave + fecha (CU-MAES-06)
CREATE INDEX IF NOT EXISTS idx_param_clave_vigencia
  ON maes.parametro(clave, vigencia_desde DESC) INCLUDE (valor, criticidad_consumo);
-- Consulta "todos los SLA del flujo X"
CREATE INDEX IF NOT EXISTS idx_param_flujo ON maes.parametro(flujo, nivel) WHERE flujo IS NOT NULL;

CREATE TABLE IF NOT EXISTS maes.auditoria_configuracion (
  id_log                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidad                maes.entidad_audit NOT NULL,
  id_entidad             UUID NOT NULL,
  accion                 maes.accion_audit NOT NULL,
  valor_anterior         JSONB,
  valor_nuevo            JSONB,
  es_correccion_historica BOOLEAN NOT NULL DEFAULT false,
  justificacion          TEXT,
  id_usuario             UUID NOT NULL,
  fecha_hora             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_maes_audit_entidad ON maes.auditoria_configuracion(entidad, id_entidad, fecha_hora DESC);

-- =====================================================================
-- ESQUEMA segu (identidades / RBAC con ambito). Referencia catalogos de maes.
-- =====================================================================

CREATE TABLE IF NOT EXISTS segu.usuario (
  id_usuario          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_usuario      CITEXT NOT NULL,
  tipo_usuario        segu.tipo_usuario NOT NULL,
  codigo_empleado_rms VARCHAR(30),                 -- DATO SENSIBLE: unico vinculo RMS (RN-SEGU-26)
  correo_contacto     CITEXT NOT NULL,             -- DATO SENSIBLE
  estado              segu.estado_usuario NOT NULL DEFAULT 'PENDIENTE_ASIGNACION',
  metodo_autenticacion segu.metodo_auth NOT NULL DEFAULT 'LOCAL',
  mfa_habilitado      BOOLEAN NOT NULL DEFAULT false,
  fecha_alta          TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_baja          TIMESTAMPTZ,
  CONSTRAINT uk_usuario_login UNIQUE (nombre_usuario),
  CONSTRAINT ck_usuario_personal CHECK (
    tipo_usuario <> 'PERSONAL' OR codigo_empleado_rms IS NOT NULL)
);
-- RN-SEGU-03: un solo usuario ACTIVO vinculado al mismo codigo de empleado
CREATE UNIQUE INDEX IF NOT EXISTS uk_usuario_emp_activo ON segu.usuario(codigo_empleado_rms)
  WHERE estado = 'ACTIVO' AND codigo_empleado_rms IS NOT NULL;

CREATE TABLE IF NOT EXISTS segu.credencial (
  id_credencial       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID NOT NULL REFERENCES segu.usuario(id_usuario) ON DELETE CASCADE,
  hash_password       TEXT NOT NULL,               -- DATO SENSIBLE (Argon2id, ADR-002)
  algoritmo           VARCHAR(20) NOT NULL DEFAULT 'argon2id',
  fecha_ultimo_cambio TIMESTAMPTZ NOT NULL DEFAULT now(),
  requiere_cambio     BOOLEAN NOT NULL DEFAULT true,
  intentos_fallidos   INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta     TIMESTAMPTZ,
  CONSTRAINT uk_credencial_usuario UNIQUE (id_usuario)
);

CREATE TABLE IF NOT EXISTS segu.credencial_historial (
  id_historial  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario    UUID NOT NULL REFERENCES segu.usuario(id_usuario) ON DELETE CASCADE,
  hash_password TEXT NOT NULL,                      -- DATO SENSIBLE
  fecha_cambio  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cred_hist_usuario ON segu.credencial_historial(id_usuario, fecha_cambio DESC);

CREATE TABLE IF NOT EXISTS segu.asignacion_rol_ambito (
  id_asignacion  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario     UUID NOT NULL REFERENCES segu.usuario(id_usuario) ON DELETE RESTRICT,
  id_rol         VARCHAR(20) NOT NULL REFERENCES maes.rol_catalogo(id_rol) ON DELETE RESTRICT,
  tipo_ambito    segu.tipo_ambito NOT NULL,
  id_empresa     VARCHAR(10) REFERENCES maes.empresa(id_empresa) ON DELETE RESTRICT,
  id_tienda      UUID REFERENCES maes.tienda(id_tienda) ON DELETE RESTRICT,
  justificacion  TEXT,
  vigencia_desde DATE NOT NULL,
  vigencia_hasta DATE,
  estado         segu.estado_vigencia NOT NULL DEFAULT 'VIGENTE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID,
  -- RN-SEGU-05: coherencia ambito <-> rol (la cobertura ZONA se valida via asignacion_zona en app)
  CONSTRAINT ck_asig_ambito CHECK (
    (tipo_ambito = 'TIENDA'  AND id_tienda IS NOT NULL) OR
    (tipo_ambito = 'ZONA'    AND id_tienda IS NULL) OR
    (tipo_ambito = 'EMPRESA' AND id_empresa IS NOT NULL AND id_tienda IS NULL) OR
    (tipo_ambito = 'CENTRAL' AND id_tienda IS NULL)
  ),
  CONSTRAINT ck_asig_vigencia CHECK (vigencia_hasta IS NULL OR vigencia_hasta >= vigencia_desde)
);
-- Patron: resolver aprobador por rol + ambito (CU-SEGU-04) y consultar roles vigentes de un usuario
CREATE INDEX IF NOT EXISTS idx_asig_usuario_vigente ON segu.asignacion_rol_ambito(id_usuario)
  WHERE estado = 'VIGENTE';
CREATE INDEX IF NOT EXISTS idx_asig_rol_empresa ON segu.asignacion_rol_ambito(id_rol, id_empresa)
  WHERE estado = 'VIGENTE';
CREATE INDEX IF NOT EXISTS idx_asig_rol_tienda ON segu.asignacion_rol_ambito(id_rol, id_tienda)
  WHERE estado = 'VIGENTE' AND id_tienda IS NOT NULL;

-- Multi-zona (RN-SEGU-06)
CREATE TABLE IF NOT EXISTS segu.asignacion_zona (
  id_asignacion UUID NOT NULL REFERENCES segu.asignacion_rol_ambito(id_asignacion) ON DELETE CASCADE,
  id_zona       UUID NOT NULL REFERENCES maes.zona(id_zona) ON DELETE RESTRICT,
  PRIMARY KEY (id_asignacion, id_zona)
);
-- Patron critico: resolver aprobador por zona (CU-SEGU-04 a.)
CREATE INDEX IF NOT EXISTS idx_asignacion_zona_zona ON segu.asignacion_zona(id_zona);

CREATE TABLE IF NOT EXISTS segu.nodo_jerarquia (
  id_nodo          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_rol           VARCHAR(20) NOT NULL REFERENCES maes.rol_catalogo(id_rol) ON DELETE RESTRICT,
  tipo_ambito      segu.tipo_ambito NOT NULL,
  id_ambito        UUID,                            -- ref logica tienda/zona/empresa
  id_nodo_superior UUID REFERENCES segu.nodo_jerarquia(id_nodo) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_jerarquia_rol_ambito ON segu.nodo_jerarquia(id_rol, tipo_ambito, id_ambito);
CREATE INDEX IF NOT EXISTS idx_jerarquia_superior   ON segu.nodo_jerarquia(id_nodo_superior);

CREATE TABLE IF NOT EXISTS segu.delegacion (
  id_delegacion  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_titular     UUID NOT NULL REFERENCES segu.usuario(id_usuario) ON DELETE RESTRICT,
  id_delegado    UUID NOT NULL REFERENCES segu.usuario(id_usuario) ON DELETE RESTRICT,
  alcance        segu.alcance_delegacion NOT NULL,
  detalle_alcance JSONB,
  tipo_ambito    segu.tipo_ambito NOT NULL,
  id_ambito      UUID,
  vigencia_desde DATE NOT NULL,
  vigencia_hasta DATE,
  estado         segu.estado_vigencia NOT NULL DEFAULT 'VIGENTE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_delegacion_distintos CHECK (id_titular <> id_delegado)
);
CREATE INDEX IF NOT EXISTS idx_delegacion_delegado_vig ON segu.delegacion(id_delegado)
  WHERE estado = 'VIGENTE';
CREATE INDEX IF NOT EXISTS idx_delegacion_titular_vig ON segu.delegacion(id_titular)
  WHERE estado = 'VIGENTE';

CREATE TABLE IF NOT EXISTS segu.suplencia (
  id_suplencia        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_rol_titular      VARCHAR(20) NOT NULL REFERENCES maes.rol_catalogo(id_rol) ON DELETE RESTRICT,
  id_usuario_titular  UUID REFERENCES segu.usuario(id_usuario) ON DELETE RESTRICT,
  id_usuario_suplente UUID NOT NULL REFERENCES segu.usuario(id_usuario) ON DELETE RESTRICT,
  tipo_ambito         segu.tipo_ambito NOT NULL,
  id_ambito           UUID,
  vigencia_desde      DATE NOT NULL,
  vigencia_hasta      DATE,
  estado              segu.estado_vigencia NOT NULL DEFAULT 'VIGENTE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_suplencia_rol_vig ON segu.suplencia(id_rol_titular)
  WHERE estado = 'VIGENTE';
CREATE INDEX IF NOT EXISTS idx_suplencia_suplente_vig ON segu.suplencia(id_usuario_suplente)
  WHERE estado = 'VIGENTE';

CREATE TABLE IF NOT EXISTS segu.sesion (
  id_sesion       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario      UUID NOT NULL REFERENCES segu.usuario(id_usuario) ON DELETE CASCADE,
  canal           segu.canal_sesion NOT NULL,
  fecha_inicio    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultima_actividad TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_en       TIMESTAMPTZ NOT NULL,
  estado          segu.estado_sesion NOT NULL DEFAULT 'ACTIVA'
);
CREATE INDEX IF NOT EXISTS idx_sesion_usuario_activa ON segu.sesion(id_usuario)
  WHERE estado = 'ACTIVA';

CREATE TABLE IF NOT EXISTS segu.auditoria_seguridad (
  id_log        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento        segu.evento_audit NOT NULL,
  id_actor      UUID,
  id_objeto     UUID,
  en_calidad_de segu.calidad_actuacion,
  detalle       JSONB,
  resultado     segu.resultado_audit NOT NULL,
  fecha_hora    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_segu_audit_actor  ON segu.auditoria_seguridad(id_actor, fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_segu_audit_evento ON segu.auditoria_seguridad(evento, fecha_hora DESC);

-- =====================================================================
-- ESQUEMA apro (motor de aprobaciones, outbox e idempotencia)
-- =====================================================================

CREATE TABLE IF NOT EXISTS apro.flujo (
  id_flujo           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo             VARCHAR(40) NOT NULL,
  tipo_objeto        apro.tipo_objeto NOT NULL,
  modulo_solicitante maes.modulo_param NOT NULL,
  politica_rechazo   apro.politica_rechazo NOT NULL,
  nivel_reinicio     INTEGER,
  version            INTEGER NOT NULL DEFAULT 1,
  vigencia_desde     DATE NOT NULL,
  vigencia_hasta     DATE,
  estado             apro.estado_flujo NOT NULL DEFAULT 'ACTIVA',
  CONSTRAINT uk_flujo_codigo_version UNIQUE (codigo, version)
);
CREATE INDEX IF NOT EXISTS idx_flujo_codigo_activo ON apro.flujo(codigo) WHERE estado = 'ACTIVA';

CREATE TABLE IF NOT EXISTS apro.nivel (
  id_nivel                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_flujo                  UUID NOT NULL REFERENCES apro.flujo(id_flujo) ON DELETE CASCADE,
  orden                     INTEGER NOT NULL,
  modo                      apro.modo_nivel NOT NULL,
  regla_resolucion_aprobador apro.regla_resolucion NOT NULL,
  rol_o_usuario_aprobador   VARCHAR(40),
  cuorum                    apro.cuorum NOT NULL,
  cuorum_n                  INTEGER,
  comentario_aprobacion     apro.obligatoriedad NOT NULL DEFAULT 'OPCIONAL',
  clave_sla                 VARCHAR(160),            -- ref logica maes.parametro.clave (ADR-004)
  consecuencia_vencimiento  apro.consecuencia NOT NULL DEFAULT 'NINGUNA',
  destino_escalamiento      VARCHAR(40),
  accion_callback           VARCHAR(60),
  requiere_compliance       BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT uk_nivel_orden UNIQUE (id_flujo, orden),
  CONSTRAINT ck_nivel_cuorum_n CHECK (cuorum <> 'AL_MENOS_N' OR cuorum_n IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_nivel_flujo ON apro.nivel(id_flujo, orden);

CREATE TABLE IF NOT EXISTS apro.solicitud (
  id_solicitud         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_flujo             UUID NOT NULL REFERENCES apro.flujo(id_flujo) ON DELETE RESTRICT,
  tipo_objeto          apro.tipo_objeto NOT NULL,
  id_objeto            UUID NOT NULL,
  id_modulo_solicitante maes.modulo_param NOT NULL,
  id_solicitante       UUID NOT NULL,               -- ref logica segu.usuario
  id_colaborador_afectado UUID,                      -- DATO SENSIBLE
  id_zona              UUID,                          -- ref logica maes.zona
  id_empresa           VARCHAR(10),                   -- ref logica maes.empresa
  nivel_actual         INTEGER NOT NULL DEFAULT 0,
  estado               apro.estado_solicitud NOT NULL DEFAULT 'EN_CURSO',
  motivo_cancelacion   TEXT,
  fecha_inicio         TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_cierre         TIMESTAMPTZ,
  CONSTRAINT ck_sol_cancel CHECK (estado <> 'CANCELADA' OR motivo_cancelacion IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_solicitud_objeto       ON apro.solicitud(tipo_objeto, id_objeto);
CREATE INDEX IF NOT EXISTS idx_solicitud_zona_empresa ON apro.solicitud(id_zona, id_empresa);
CREATE INDEX IF NOT EXISTS idx_solicitud_pend_resol   ON apro.solicitud(estado)
  WHERE estado = 'PENDIENTE_RESOLUCION_APROBADOR';

CREATE TABLE IF NOT EXISTS apro.tarea (
  id_tarea             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud         UUID NOT NULL REFERENCES apro.solicitud(id_solicitud) ON DELETE RESTRICT,
  id_nivel             UUID NOT NULL REFERENCES apro.nivel(id_nivel) ON DELETE RESTRICT,
  id_aprobador_titular UUID NOT NULL,               -- ref logica segu.usuario
  id_aprobador_efectivo UUID,                         -- ref logica segu.usuario
  en_calidad_de        segu.calidad_actuacion,
  estado               apro.estado_tarea NOT NULL DEFAULT 'PENDIENTE',
  comentario           TEXT,
  fecha_asignacion     TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_vencimiento_sla TIMESTAMPTZ,
  fecha_decision       TIMESTAMPTZ
);
-- Patron critico: bandeja de pendientes por usuario
CREATE INDEX IF NOT EXISTS idx_tarea_bandeja ON apro.tarea(id_aprobador_titular)
  WHERE estado = 'PENDIENTE';
-- Worker de SLA: tareas pendientes proximas a vencer
CREATE INDEX IF NOT EXISTS idx_tarea_sla ON apro.tarea(fecha_vencimiento_sla)
  WHERE estado = 'PENDIENTE';
CREATE INDEX IF NOT EXISTS idx_tarea_solicitud ON apro.tarea(id_solicitud);

-- Outbox transaccional (ADR-003)
CREATE TABLE IF NOT EXISTS apro.outbox_evento (
  id_evento         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud      UUID NOT NULL REFERENCES apro.solicitud(id_solicitud) ON DELETE RESTRICT,
  id_nivel          UUID REFERENCES apro.nivel(id_nivel) ON DELETE RESTRICT,
  tipo_transicion   apro.tipo_transicion NOT NULL,
  accion_callback   VARCHAR(60),
  idempotency_key   VARCHAR(200) NOT NULL,
  payload           JSONB NOT NULL,
  estado_despacho   apro.estado_despacho NOT NULL DEFAULT 'PENDIENTE',
  intentos          INTEGER NOT NULL DEFAULT 0,
  proximo_intento_en TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  despachado_en     TIMESTAMPTZ,
  CONSTRAINT uk_outbox_idempotency UNIQUE (idempotency_key)
);
-- Worker de despacho: eventos pendientes / a reintentar
CREATE INDEX IF NOT EXISTS idx_outbox_pendiente ON apro.outbox_evento(proximo_intento_en)
  WHERE estado_despacho IN ('PENDIENTE','FALLIDA_PROPAGACION');

-- Tabla de efectos aplicados: consumidor idempotente (ADR-003 paso 3)
CREATE TABLE IF NOT EXISTS apro.efecto_callback_aplicado (
  id_efecto         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key   VARCHAR(200) NOT NULL,
  modulo_consumidor maes.modulo_param NOT NULL,
  resultado         apro.resultado_efecto NOT NULL,
  aplicado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_efecto_idempotency UNIQUE (idempotency_key)
);

CREATE TABLE IF NOT EXISTS apro.auditoria_aprobacion (
  id_log       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud UUID NOT NULL,
  evento       apro.evento_audit NOT NULL,
  id_nivel     UUID,
  id_actor     UUID,
  comentario   TEXT,
  resultado    apro.resultado_audit NOT NULL,
  fecha_hora   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_apro_audit_solicitud ON apro.auditoria_aprobacion(id_solicitud, fecha_hora);

-- =====================================================================
-- FIN DDL Fase 0
-- =====================================================================
