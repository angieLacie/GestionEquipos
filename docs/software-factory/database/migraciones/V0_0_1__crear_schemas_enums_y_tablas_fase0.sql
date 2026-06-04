-- =====================================================================
-- Flyway migration: V0_0_1
-- Descripcion: Bootstrap Fase 0 - schemas (segu, maes, apro), tipos ENUM,
--              tablas, FKs, constraints e indices.
-- Motor: PostgreSQL 16
-- Reversible: ver bloque ROLLBACK al final (rollback = drop de schemas,
--             sin perdida de datos por ser migracion de bootstrap).
-- Contenido: identico a esquema/schema-fase0.sql (DDL consolidado idempotente).
--            Backend puede trocear en V0_0_2..V0_0_5 si prefiere migraciones atomicas.
-- =====================================================================

-- El cuerpo de esta migracion es el DDL consolidado de:
--   docs/software-factory/database/esquema/schema-fase0.sql
-- Se referencia para evitar duplicar y desincronizar. Al integrar con Flyway,
-- copiar aqui el contenido de schema-fase0.sql (es idempotente: IF NOT EXISTS / DO $$).

-- Ejemplo de invocacion en pipeline (psql):
--   \i docs/software-factory/database/esquema/schema-fase0.sql

-- =====================================================================
-- ROLLBACK (U0_0_1) - destructivo, requiere validacion del equipo:
--   DROP SCHEMA IF EXISTS apro CASCADE;
--   DROP SCHEMA IF EXISTS segu CASCADE;
--   DROP SCHEMA IF EXISTS maes CASCADE;
-- (Las extensiones pgcrypto/citext NO se eliminan por ser compartidas.)
-- =====================================================================
