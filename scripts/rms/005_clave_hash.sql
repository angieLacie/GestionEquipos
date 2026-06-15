/*
  Campo encriptado de contraseña en RMS (BD_RETAIL.SEGURIDAD.Clave).

  La columna legada Clave.Clave guarda la contraseña EN TEXTO PLANO (varchar 20).
  Se agrega ClaveHash (Argon2id, ~96 chars) para almacenar el hash. Nova autentica
  contra ClaveHash; migración perezosa: en el primer login válido contra el texto
  plano, se rellena ClaveHash y a partir de ahí se lee de ahí.

  Nullable: no rompe al sistema legado. Idempotente.
*/

USE BD_RETAIL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'SEGURIDAD' AND TABLE_NAME = 'Clave' AND COLUMN_NAME = 'ClaveHash')
BEGIN
    ALTER TABLE SEGURIDAD.Clave ADD ClaveHash varchar(200) NULL;
END
GO
