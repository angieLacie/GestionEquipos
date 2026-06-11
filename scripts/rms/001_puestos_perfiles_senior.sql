/*
  RMS (BD_RETAIL) — Puestos y Perfiles SENIOR para el módulo Rol de Personal.

  Contexto: el rol semanal distingue colaboradores "Senior", pero RMS no tenía
  esos puestos/perfiles. Se crean las variantes SENIOR de los puestos base que
  participan en el rol (ASESOR, SASTRE, AUXILIAR DE TIENDA, SECRETARIA - CAJERA).

  Instancia: PANO977\SQLEXPRESS · Base: BD_RETAIL · Esquema: SEGURIDAD
  Idempotente: re-ejecutable sin duplicar (NOT EXISTS por Descripcion).
  Ejecutado por primera vez: 2026-06-11 (puestos 94-97, perfiles 72-73).
*/

USE BD_RETAIL;
GO

/* ── Puestos SENIOR (SEGURIDAD.Puesto.Puesto es IDENTITY) ───────────────── */
INSERT INTO SEGURIDAD.Puesto (Descripcion, Estado_Puesto, Fecha_creacion, Usuario_Creacion, PuestoRMS)
SELECT b.Descripcion + ' SENIOR', 1, GETDATE(), 'nova', b.PuestoRMS + '-SR'
FROM SEGURIDAD.Puesto b
WHERE b.Puesto IN (22 /*ASESOR*/, 18 /*SASTRE*/, 19 /*AUXILIAR DE TIENDA*/, 81 /*SECRETARIA - CAJERA*/)
  AND NOT EXISTS (SELECT 1 FROM SEGURIDAD.Puesto x WHERE x.Descripcion = b.Descripcion + ' SENIOR');
GO

/* ── Perfiles SENIOR (SEGURIDAD.Perfil.Perfil NO es identity) ───────────── */
/* ASESOR SENIOR (4) y SECRETARIA SENIOR (29) ya existían en RMS. */
INSERT INTO SEGURIDAD.Perfil (Perfil, Descripcion, Estado_Perfil, Fecha_creacion, Usuario_Creacion, PerfilRMS)
SELECT 72, 'SASTRE SENIOR', 'A', GETDATE(), 'nova',
       (SELECT PerfilRMS FROM SEGURIDAD.Perfil WHERE Descripcion = 'SASTRE') + '-SR'
WHERE NOT EXISTS (SELECT 1 FROM SEGURIDAD.Perfil WHERE Descripcion = 'SASTRE SENIOR');
GO

INSERT INTO SEGURIDAD.Perfil (Perfil, Descripcion, Estado_Perfil, Fecha_creacion, Usuario_Creacion, PerfilRMS)
SELECT 73, 'AUXILIAR SENIOR', 'A', GETDATE(), 'nova',
       (SELECT PerfilRMS FROM SEGURIDAD.Perfil WHERE Descripcion = 'AUXILIAR') + '-SR'
WHERE NOT EXISTS (SELECT 1 FROM SEGURIDAD.Perfil WHERE Descripcion = 'AUXILIAR SENIOR');
GO
