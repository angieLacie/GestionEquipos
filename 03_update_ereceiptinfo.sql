/* ==========================================================================
   UPDATE de RECEIPT.EReceiptInfo para comprobantes YA insertados.
   --------------------------------------------------------------------------
   Recorre cada XML, arma el string formato resumen/QR SUNAT:
     RUC | TipoDoc | Serie | Numero | IGV | Total | Fecha | TipoDocCli | NroDocCli | Hash
   y actualiza dbo.RECEIPT por (StoreNo, DocNumber).

   - Usa XPath con local-name() => sirve igual para Invoice y CreditNote.
   - Montos en POSITIVO (representan el documento real ante SUNAT).
   - El Hash sale del ds:DigestValue de la firma del XML.

   FLUJO: @Commit = 0 (preview) -> revisar -> @Commit = 1 (actualiza).
   ========================================================================== */
SET NOCOUNT ON;

DECLARE @Commit BIT = 0;   -- 👈 0 = preview, 1 = ejecutar UPDATE

DECLARE @Files TABLE (Idx INT IDENTITY(1,1), FilePath NVARCHAR(500), StoreNo INT);
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

DECLARE @Preview TABLE (StoreNo INT, DocNumber VARCHAR(20), EReceiptInfo VARCHAR(300), FilasAfectadas INT);

DECLARE @i INT = 1, @total INT, @path NVARCHAR(500), @store INT;
SELECT @total = COUNT(*) FROM @Files;

WHILE @i <= @total
BEGIN
    SELECT @path = FilePath, @store = StoreNo FROM @Files WHERE Idx = @i;

    -- Leer XML del disco
    DECLARE @xml XML;
    DECLARE @sql NVARCHAR(MAX) = N'SELECT @x = CAST(BulkColumn AS XML)
        FROM OPENROWSET(BULK ''' + REPLACE(@path, '''', '''''') + ''', SINGLE_BLOB) AS x;';
    BEGIN TRY
        EXEC sp_executesql @sql, N'@x XML OUTPUT', @x = @xml OUTPUT;
    END TRY
    BEGIN CATCH
        INSERT INTO @Preview VALUES (@store, '(no se pudo leer)', @path, -1);
        SET @i += 1; CONTINUE;
    END CATCH

    -- Extraer campos (namespace-agnostic con local-name())
    DECLARE
        @DocNumber VARCHAR(20) = @xml.value('(/*/*[local-name()="ID"])[1]', 'varchar(20)'),
        @Ruc       VARCHAR(20) = @xml.value('(//*[local-name()="AccountingSupplierParty"]//*[local-name()="PartyIdentification"]/*[local-name()="ID"])[1]', 'varchar(20)'),
        @TipoDoc   VARCHAR(2)  = ISNULL(@xml.value('(//*[local-name()="InvoiceTypeCode"])[1]', 'varchar(2)'), '07'),
        @Igv       DECIMAL(18,2) = ISNULL(@xml.value('(/*/*[local-name()="TaxTotal"]/*[local-name()="TaxAmount"])[1]', 'decimal(18,2)'), 0),
        @TotalDoc  DECIMAL(18,2) = ISNULL(@xml.value('(//*[local-name()="LegalMonetaryTotal"]/*[local-name()="PayableAmount"])[1]', 'decimal(18,2)'), 0),
        @Fecha     DATE          = @xml.value('(/*/*[local-name()="IssueDate"])[1]', 'date'),
        @CliTipo   VARCHAR(2)  = @xml.value('(//*[local-name()="AccountingCustomerParty"]//*[local-name()="PartyIdentification"]/*[local-name()="ID"]/@schemeID)[1]', 'varchar(2)'),
        @CliDoc    VARCHAR(20) = @xml.value('(//*[local-name()="AccountingCustomerParty"]//*[local-name()="PartyIdentification"]/*[local-name()="ID"])[1]', 'varchar(20)'),
        @Hash      VARCHAR(100)= @xml.value('(//*[local-name()="DigestValue"])[1]', 'varchar(100)');

    DECLARE @Serie  VARCHAR(10) = LEFT(@DocNumber, CHARINDEX('-', @DocNumber + '-') - 1);
    DECLARE @Numero VARCHAR(20) = SUBSTRING(@DocNumber, CHARINDEX('-', @DocNumber + '-') + 1, 20);

    DECLARE @Str VARCHAR(300) =
          ISNULL(@Ruc,'') + '|' + ISNULL(@TipoDoc,'') + '|' + @Serie + '|' + @Numero + '|'
        + CONVERT(varchar(20), @Igv)      + '|'
        + CONVERT(varchar(20), @TotalDoc) + '|'
        + CONVERT(varchar(10), @Fecha, 23) + '|'
        + ISNULL(@CliTipo,'') + '|' + ISNULL(@CliDoc,'') + '|' + ISNULL(@Hash,'');

    DECLARE @rows INT = 0;
    IF @Commit = 1
    BEGIN
        UPDATE dbo.RECEIPT
        SET EReceiptInfo = @Str
        WHERE StoreNo = @store AND DocNumber = @DocNumber;
        SET @rows = @@ROWCOUNT;
    END
    ELSE
    BEGIN
        SELECT @rows = COUNT(*) FROM dbo.RECEIPT WHERE StoreNo = @store AND DocNumber = @DocNumber;
    END

    INSERT INTO @Preview VALUES (@store, @DocNumber, @Str, @rows);
    SET @i += 1;
END

-- Resultado: si FilasAfectadas = 0 => no existe ese DocNumber en esa tienda
SELECT
    Tienda          = StoreNo,
    DocNumber,
    EReceiptInfo,
    FilasAfectadas,
    Nota = CASE WHEN FilasAfectadas = 0 THEN '⚠️ No se encontró en RECEIPT (revisa tienda/doc)'
                WHEN FilasAfectadas < 0 THEN '❌ No se pudo leer el XML'
                ELSE '✅' END
FROM @Preview
ORDER BY DocNumber;

IF @Commit = 0
    PRINT '🔍 PREVIEW: nada se actualizó. Revisa la columna EReceiptInfo y pon @Commit = 1.';
ELSE
    PRINT '✅ UPDATE de EReceiptInfo ejecutado.';
