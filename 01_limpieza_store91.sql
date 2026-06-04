/* ==========================================================================
   LIMPIEZA: borra los comprobantes importados POR ERROR en la tienda 91.
   --------------------------------------------------------------------------
   - Acotado SOLO a los DocNumber que se importaron en este lote, para no
     tocar ninguna otra data que pudiera existir en la tienda 91.
   - NO borra clientes (decisión: conservar CUSTOMER).
   - Respeta las FK (todas NO_ACTION). Orden de borrado (hojas -> raíz):
       1) RECEIPT_LINE_TAX, RECEIPT_NOTE   (cuelgan de RECEIPT_LINE)
       2) RECEIPT_TENDER, RECEIPT_LINE     (cuelgan de RECEIPT)
       3) RECEIPT                          (raíz)

   FLUJO:
     1) Ejecuta con @Commit = 0  -> solo PREVIEW de lo que se borraría.
     2) Si la lista es correcta, cambia a @Commit = 1 y vuelve a ejecutar.
   ========================================================================== */
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @Commit  BIT = 0;     -- 👈 0 = preview, 1 = borrar de verdad
DECLARE @StoreErr INT = 91;   -- tienda donde se importó por error

-- DocNumbers que se importaron en la 91 (los BC24 fallaron; se incluyen por si acaso)
DECLARE @Docs TABLE (DocNumber VARCHAR(20) PRIMARY KEY);
INSERT INTO @Docs (DocNumber) VALUES
('B451-00004815'),
('B454-00002697'),
('B603-00205588'),
('B510-00034139'),
('F109-00004987'),
('F109-00004988'),
('F109-00004989'),
('F109-00004990'),
('F109-00004991'),
('F109-00004992'),
('B104-00035334'),
('B104-00035335'),
('B424-00023790'),
('BC24-00000630'),
('BC24-00000631');

-- Receipts objetivo
IF OBJECT_ID('tempdb..#Del') IS NOT NULL DROP TABLE #Del;
SELECT r.StoreNo, r.ReceiptId, r.DocNumber, r.SalesCode, r.PayTotal, r.CreationDate
INTO #Del
FROM dbo.RECEIPT r
INNER JOIN @Docs d ON d.DocNumber = r.DocNumber
WHERE r.StoreNo = @StoreErr;

-- PREVIEW
SELECT  Encontrados = COUNT(*) FROM #Del;
SELECT 'RECEIPT a borrar' AS Tabla, * FROM #Del ORDER BY DocNumber;

IF @Commit = 0
BEGIN
    PRINT '🔍 PREVIEW: nada se borró. Revisa la lista y pon @Commit = 1 para ejecutar.';
    RETURN;
END

BEGIN TRANSACTION;

    -- 1) NIETOS (cuelgan de RECEIPT_LINE)
    DELETE x
    FROM dbo.RECEIPT_LINE_TAX x
    INNER JOIN #Del d ON d.StoreNo = x.StoreNo AND d.ReceiptId = x.ReceiptId;
    PRINT 'RECEIPT_LINE_TAX borrados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    DELETE x
    FROM dbo.RECEIPT_NOTE x
    INNER JOIN #Del d ON d.StoreNo = x.StoreNo AND d.ReceiptId = x.ReceiptId;
    PRINT 'RECEIPT_NOTE borrados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    -- 2) HIJOS (cuelgan de RECEIPT)
    DELETE t
    FROM dbo.RECEIPT_TENDER t
    INNER JOIN #Del d ON d.StoreNo = t.StoreNo AND d.ReceiptId = t.ReceiptId;
    PRINT 'RECEIPT_TENDER borrados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    DELETE l
    FROM dbo.RECEIPT_LINE l
    INNER JOIN #Del d ON d.StoreNo = l.StoreNo AND d.ReceiptId = l.ReceiptId;
    PRINT 'RECEIPT_LINE borrados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    -- 3) RAÍZ
    DELETE r
    FROM dbo.RECEIPT r
    INNER JOIN #Del d ON d.StoreNo = r.StoreNo AND d.ReceiptId = r.ReceiptId;
    PRINT 'RECEIPT borrados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

COMMIT TRANSACTION;
PRINT '✅ Limpieza completada en la tienda 91.';

DROP TABLE #Del;
