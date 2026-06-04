/* ==========================================================================
   IMPORTACIÓN POR LOTE — con StoreNo CORRECTO POR ARCHIVO
   --------------------------------------------------------------------------
   FLUJO:
     1) @DryRunGlobal = 1  -> preview de cada archivo (no inserta).
     2) Revisa que cada uno use la tienda correcta y cuadre.
     3) @DryRunGlobal = 0  -> inserción real.
   ========================================================================== */
SET NOCOUNT ON;

DECLARE @DryRunGlobal BIT = 1;   -- 👈 1 = preview, 0 = inserción real

-- Lista de archivos CON su tienda correcta
DECLARE @Files TABLE (
    Idx      INT IDENTITY(1,1),
    FilePath NVARCHAR(500),
    StoreNo  INT
);

INSERT INTO @Files (FilePath, StoreNo) VALUES
('D:\XML\20100108705-03-B451-00004815.xml', 113),
('D:\XML\20100108705-03-B454-00002697.xml', 118),
('D:\XML\20605007784-03-B603-00205588.xml',  91),
('D:\XML\20100108616-03-B510-00034139.xml',  60),
('D:\XML\20100108616-01-F109-00004991.xml',  59),
('D:\XML\20100108616-01-F109-00004990.xml',  59),
('D:\XML\20100108616-01-F109-00004987.xml',  59),
('D:\XML\20100108616-01-F109-00004989.xml',  59),
('D:\XML\20100108616-01-F109-00004992.xml',  59),
('D:\XML\20100108616-01-F109-00004988.xml',  59),
('D:\XML\20541200011-03-B104-00035335.xml',   9),
('D:\XML\20541200011-03-B104-00035334.xml',   9),
('D:\XML\20100108705-07-BC24-00000630.xml',  22),
('D:\XML\20100108705-03-B424-00023790.xml',  22),
('D:\XML\20100108705-07-BC24-00000631.xml',  22);

IF @DryRunGlobal = 0
BEGIN
    DECLARE @Results TABLE (
        FilePath  NVARCHAR(500),
        StoreNo   INT,
        Status    VARCHAR(10),
        ReceiptId UNIQUEIDENTIFIER NULL,
        Message   NVARCHAR(4000)
    );

    DECLARE @path NVARCHAR(500), @store INT, @rid UNIQUEIDENTIFIER, @i INT = 1, @total INT;
    SELECT @total = COUNT(*) FROM @Files;

    WHILE @i <= @total
    BEGIN
        SELECT @path = FilePath, @store = StoreNo FROM @Files WHERE Idx = @i;
        SET @rid = NULL;

        BEGIN TRY
            EXEC dbo.usp_ImportReceiptFromXmlFile
                 @FilePath  = @path,
                 @StoreNo   = @store,
                 @DryRun    = 0,
                 @ReceiptId = @rid OUTPUT;

            INSERT INTO @Results VALUES (@path, @store, 'OK', @rid, 'Importado correctamente');
        END TRY
        BEGIN CATCH
            INSERT INTO @Results VALUES (@path, @store, 'ERROR', NULL,
                CONCAT('Línea ', ERROR_LINE(), ' | ', ERROR_MESSAGE()));
        END CATCH

        SET @i = @i + 1;
    END

    SELECT Resultado = Status, Tienda = StoreNo, Archivo = FilePath, ReceiptId, Mensaje = Message
    FROM @Results
    ORDER BY Status DESC, FilePath;

    SELECT
        TotalArchivos = COUNT(*),
        Exitosos      = SUM(CASE WHEN Status = 'OK'    THEN 1 ELSE 0 END),
        Fallidos      = SUM(CASE WHEN Status = 'ERROR' THEN 1 ELSE 0 END)
    FROM @Results;
END
ELSE
BEGIN
    PRINT '════════════════════════════════════════════════════════════════';
    PRINT '🔍 MODO DRY-RUN ACTIVO - nada se insertará.';
    PRINT '════════════════════════════════════════════════════════════════';

    DECLARE @path2 NVARCHAR(500), @store2 INT, @i2 INT = 1, @total2 INT;
    SELECT @total2 = COUNT(*) FROM @Files;

    WHILE @i2 <= @total2
    BEGIN
        SELECT @path2 = FilePath, @store2 = StoreNo FROM @Files WHERE Idx = @i2;

        PRINT '';
        PRINT '─────────────────────────────────────────────────────────────';
        PRINT 'ARCHIVO ' + CAST(@i2 AS VARCHAR) + ' DE ' + CAST(@total2 AS VARCHAR)
            + ' | Tienda ' + CAST(@store2 AS VARCHAR) + ': ' + @path2;
        PRINT '─────────────────────────────────────────────────────────────';

        BEGIN TRY
            EXEC dbo.usp_ImportReceiptFromXmlFile
                 @FilePath = @path2,
                 @StoreNo  = @store2,
                 @DryRun   = 1;
        END TRY
        BEGIN CATCH
            PRINT '❌ Error: ' + ERROR_MESSAGE();
        END CATCH

        SET @i2 = @i2 + 1;
    END
END
