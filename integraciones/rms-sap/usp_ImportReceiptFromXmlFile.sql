/* ==========================================================================
   SP: dbo.usp_ImportReceiptFromXmlFile
   --------------------------------------------------------------------------
   Importa un comprobante electrónico peruano (UBL 2.1 - SUNAT) desde un
   archivo XML en disco hacia las tablas RECEIPT, RECEIPT_LINE, RECEIPT_TENDER
   y busca/crea el cliente en CUSTOMER.

   ⭐ Soporta modo DryRun (preview sin insertar).

   ── TIPOS SOPORTADOS ──
     • Invoice    (Factura '01' / Boleta '03')  -> venta, importes en POSITIVO
     • CreditNote (Nota de Crédito '07')         -> devolución, importes en NEGATIVO

   ── HISTORIAL ──
     2026-05-29  Se reemplazó STRING_SPLIT por split XML (BD JERUTH en compat 120).
     2026-05-29  Se agregó soporte para CreditNote (Notas de Crédito) como
                 devolución (montos/cantidades en negativo, SalesCode 'R').

   ⚠️ IMPORTANTE: verifica el código @SalesCodeNeg (devolución) según tu POS.
      Por defecto 'R'. Revisa cómo marca tu sistema las devoluciones con:
          SELECT SalesCode, COUNT(*) FROM dbo.RECEIPT GROUP BY SalesCode;
      Y SIEMPRE corre primero en @DryRun = 1 antes de insertar de verdad.

   Uso:
     EXEC dbo.usp_ImportReceiptFromXmlFile
          @FilePath = 'D:\XML\...-07-BC24-00000631.xml',
          @StoreNo  = 91,
          @DryRun   = 1;          -- preview

     DECLARE @rid UNIQUEIDENTIFIER;
     EXEC dbo.usp_ImportReceiptFromXmlFile
          @FilePath  = 'D:\XML\...-07-BC24-00000631.xml',
          @StoreNo   = 91,
          @DryRun    = 0,
          @ReceiptId = @rid OUTPUT;
   ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.usp_ImportReceiptFromXmlFile
    @FilePath   NVARCHAR(500),
    @StoreNo    INT              = 91,
    @DryRun     BIT              = 1,    -- 👈 Por defecto SOLO PREVIEW (seguro)
    @ReceiptId  UNIQUEIDENTIFIER = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    /* 👇 CÓDIGO SalesCode QUE USA TU POS PARA DEVOLUCIONES. Ajusta si no es 'R'. */
    DECLARE @SalesCodeNeg CHAR(1) = 'R';
    DECLARE @SalesCodePos CHAR(1) = 'S';

    BEGIN TRY
        /* ====================================================================
           1) LEER EL XML DESDE DISCO
           ==================================================================== */
        DECLARE @xml XML;
        DECLARE @sql NVARCHAR(MAX) = N'
            SELECT @x = CAST(BulkColumn AS XML)
            FROM OPENROWSET(BULK ''' + REPLACE(@FilePath, '''', '''''') + ''', SINGLE_BLOB) AS x;';
        EXEC sp_executesql @sql, N'@x XML OUTPUT', @x = @xml OUTPUT;

        IF @xml IS NULL
        BEGIN
            RAISERROR('No se pudo leer el archivo XML: %s', 16, 1, @FilePath);
            RETURN;
        END

        /* ====================================================================
           1b) DETECTAR TIPO DE DOCUMENTO (Invoice vs CreditNote)
           ==================================================================== */
        DECLARE @IsCredit BIT;
        IF @xml.exist('/*[local-name()="CreditNote"]') = 1
            SET @IsCredit = 1;
        ELSE IF @xml.exist('/*[local-name()="Invoice"]') = 1
            SET @IsCredit = 0;
        ELSE
        BEGIN
            RAISERROR('El archivo no es un Invoice ni un CreditNote UBL válido: %s', 16, 1, @FilePath);
            RETURN;
        END

        DECLARE @SalesCodeDoc CHAR(1) = CASE WHEN @IsCredit = 1 THEN @SalesCodeNeg ELSE @SalesCodePos END;
        DECLARE @SignFactor   INT     = CASE WHEN @IsCredit = 1 THEN -1 ELSE 1 END;

        BEGIN TRANSACTION;

        /* ====================================================================
           2) EXTRAER CABECERA (a #Header, esquema explícito por las 2 ramas)
           ==================================================================== */
        CREATE TABLE #Header (
            DocNumber       VARCHAR(20),
            IssueDate       DATE,
            IssueTime       TIME,
            CurrencyCode    VARCHAR(3),
            CustomerDoc     VARCHAR(20),
            CustomerDocType VARCHAR(2),
            CustomerName    VARCHAR(200),
            LineExtAmount   DECIMAL(18,5),
            TaxInclusive    DECIMAL(18,5),
            PayableAmount   DECIMAL(18,5),
            AllowanceTotal  DECIMAL(18,5),
            TaxTotal        DECIMAL(18,5),
            RefDoc          VARCHAR(20),   -- comprobante referenciado (solo NC)
            Reason          VARCHAR(200),  -- motivo (solo NC)
            SupplierRuc     VARCHAR(20),   -- RUC del emisor (para EReceiptInfo)
            DocTypeCode     VARCHAR(2)     -- tipo SUNAT: 01 factura / 03 boleta / 07 NC
        );

        IF @IsCredit = 0
        BEGIN
            ;WITH XMLNAMESPACES (
                DEFAULT 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'     AS cbc,
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' AS cac
            )
            INSERT INTO #Header
            SELECT
                DocNumber       = x.value('(cbc:ID)[1]', 'varchar(20)'),
                IssueDate       = x.value('(cbc:IssueDate)[1]', 'date'),
                IssueTime       = ISNULL(TRY_CAST(LEFT(x.value('(cbc:IssueTime)[1]', 'varchar(20)'), 8) AS time), '00:00:00'),
                CurrencyCode    = x.value('(cbc:DocumentCurrencyCode)[1]', 'varchar(3)'),
                CustomerDoc     = x.value('(cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID)[1]', 'varchar(20)'),
                CustomerDocType = x.value('(cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID/@schemeID)[1]', 'varchar(2)'),
                CustomerName    = x.value('(cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName)[1]', 'varchar(200)'),
                LineExtAmount   = x.value('(cac:LegalMonetaryTotal/cbc:LineExtensionAmount)[1]', 'decimal(18,5)'),
                TaxInclusive    = x.value('(cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount)[1]',  'decimal(18,5)'),
                PayableAmount   = x.value('(cac:LegalMonetaryTotal/cbc:PayableAmount)[1]',       'decimal(18,5)'),
                AllowanceTotal  = ISNULL(x.value('(cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount)[1]', 'decimal(18,5)'), 0),
                TaxTotal        = x.value('(cac:TaxTotal/cbc:TaxAmount)[1]', 'decimal(18,5)'),
                RefDoc          = CAST(NULL AS varchar(20)),
                Reason          = CAST(NULL AS varchar(200)),
                SupplierRuc     = x.value('(cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID)[1]', 'varchar(20)'),
                DocTypeCode     = x.value('(cbc:InvoiceTypeCode)[1]', 'varchar(2)')
            FROM @xml.nodes('/Invoice') t(x);
        END
        ELSE
        BEGIN
            -- CreditNote: no trae LineExtensionAmount ni TaxInclusiveAmount en cabecera.
            --   SubTotal (gravable) = PayableAmount - TaxTotal ; TaxInclusive = PayableAmount
            ;WITH XMLNAMESPACES (
                DEFAULT 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
                'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'     AS cbc,
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' AS cac
            )
            INSERT INTO #Header
            SELECT
                DocNumber       = x.value('(cbc:ID)[1]', 'varchar(20)'),
                IssueDate       = x.value('(cbc:IssueDate)[1]', 'date'),
                IssueTime       = ISNULL(TRY_CAST(LEFT(x.value('(cbc:IssueTime)[1]', 'varchar(20)'), 8) AS time), '00:00:00'),
                CurrencyCode    = x.value('(cbc:DocumentCurrencyCode)[1]', 'varchar(3)'),
                CustomerDoc     = x.value('(cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID)[1]', 'varchar(20)'),
                CustomerDocType = x.value('(cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID/@schemeID)[1]', 'varchar(2)'),
                CustomerName    = x.value('(cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName)[1]', 'varchar(200)'),
                LineExtAmount   = x.value('(cac:LegalMonetaryTotal/cbc:PayableAmount)[1]', 'decimal(18,5)')
                                  - ISNULL(x.value('(cac:TaxTotal/cbc:TaxAmount)[1]', 'decimal(18,5)'), 0),
                TaxInclusive    = x.value('(cac:LegalMonetaryTotal/cbc:PayableAmount)[1]', 'decimal(18,5)'),
                PayableAmount   = x.value('(cac:LegalMonetaryTotal/cbc:PayableAmount)[1]', 'decimal(18,5)'),
                AllowanceTotal  = ISNULL(x.value('(cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount)[1]', 'decimal(18,5)'), 0),
                TaxTotal        = ISNULL(x.value('(cac:TaxTotal/cbc:TaxAmount)[1]', 'decimal(18,5)'), 0),
                RefDoc          = x.value('(cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID)[1]', 'varchar(20)'),
                Reason          = x.value('(cac:DiscrepancyResponse/cbc:Description)[1]', 'varchar(200)'),
                SupplierRuc     = x.value('(cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID)[1]', 'varchar(20)'),
                DocTypeCode     = '07'
            FROM @xml.nodes('/CreditNote') t(x);
        END

        IF NOT EXISTS (SELECT 1 FROM #Header WHERE DocNumber IS NOT NULL)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('El archivo no es un comprobante UBL válido o los namespaces no coinciden.', 16, 1);
            RETURN;
        END

        /* ====================================================================
           3) VALIDAR DUPLICADOS
           ==================================================================== */
        DECLARE @DocNumber VARCHAR(20);
        SELECT @DocNumber = DocNumber FROM #Header;

        DECLARE @ExisteReceipt BIT = 0;
        IF EXISTS (SELECT 1 FROM dbo.RECEIPT
                   WHERE StoreNo = @StoreNo AND DocNumber = @DocNumber)
            SET @ExisteReceipt = 1;

        IF @ExisteReceipt = 1 AND @DryRun = 0
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('El comprobante %s ya fue importado en la tienda %d.', 16, 1, @DocNumber, @StoreNo);
            RETURN;
        END

        /* ====================================================================
           4) RESOLVER / CREAR CLIENTE
           ==================================================================== */
        DECLARE
            @CustomerNo      INT,
            @CustomerNoNuevo BIT = 0,
            @CustomerDoc     VARCHAR(20),
            @CustomerName    VARCHAR(200),
            @CustomerDocType VARCHAR(2),
            @FirstName       VARCHAR(40),
            @MiddleName      VARCHAR(40),
            @LastName        VARCHAR(40),
            @CustomerType    CHAR(1);

        SELECT
            @CustomerDoc     = CustomerDoc,
            @CustomerName    = CustomerName,
            @CustomerDocType = CustomerDocType
        FROM #Header;

        SELECT @CustomerNo = CustomerNo
        FROM dbo.CUSTOMER
        WHERE LicenseNumber = @CustomerDoc;

        IF @CustomerNo IS NULL
        BEGIN
            SET @CustomerNoNuevo = 1;
            SET @CustomerType = CASE @CustomerDocType WHEN '6' THEN 'C' ELSE 'I' END;

            -- Partir nombre completo SIN STRING_SPLIT (compat 120). Split por XML;
            -- el FOR XML PATH('') escapa &, <, > de la razón social.
            DECLARE @parts TABLE (idx INT IDENTITY(1,1), token NVARCHAR(50));

            DECLARE @escaped   NVARCHAR(MAX) = (SELECT ISNULL(@CustomerName, '') FOR XML PATH(''));
            DECLARE @xmlTokens XML = CAST('<t>' + REPLACE(@escaped, ' ', '</t><t>') + '</t>' AS XML);

            INSERT INTO @parts (token)
            SELECT LTRIM(RTRIM(n.value('.', 'NVARCHAR(50)')))
            FROM @xmlTokens.nodes('/t') AS x(n)
            WHERE LTRIM(RTRIM(n.value('.', 'NVARCHAR(50)'))) <> '';

            DECLARE @cnt INT = (SELECT COUNT(*) FROM @parts);
            SELECT @FirstName = MAX(CASE WHEN idx = 1    THEN token END),
                   @LastName  = MAX(CASE WHEN idx = @cnt THEN token END)
            FROM @parts;

            SELECT @MiddleName = STUFF((
                SELECT ' ' + token FROM @parts
                WHERE idx > 1 AND idx < @cnt
                ORDER BY idx
                FOR XML PATH('')), 1, 1, '');

            IF @cnt = 1 SET @LastName = NULL;

            SELECT @CustomerNo = ISNULL(MAX(CustomerNo), 0) + 1 FROM dbo.CUSTOMER;

            IF @DryRun = 0
            BEGIN
                INSERT INTO dbo.CUSTOMER (
                    CustomerNo, StoreNo, StatusCode, CustomerType,
                    FirstName, MiddleName, LastName, CompanyName,
                    LicenseNumber, CreatedBy, CreationDate,
                    SendEmail, AcceptCheck, EnableforRewards, Exported,
                    Blocked, Catalogs, ENews, EnableForLC,
                    CallForSale, ForceShipmentStatusAtPayment,
                    PollCreated, PollStatusCode
                )
                VALUES (
                    @CustomerNo, @StoreNo, 'A', @CustomerType,
                    LEFT(@FirstName, 40), LEFT(@MiddleName, 40), LEFT(@LastName, 40),
                    CASE WHEN @CustomerType = 'C' THEN LEFT(@CustomerName, 100) END,
                    LEFT(@CustomerDoc, 30), SUSER_SNAME(), SYSDATETIME(),
                    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                );
            END
        END

        /* ====================================================================
           5) PREPARAR CABECERA RECEIPT (aplicando signo según tipo)
           ==================================================================== */
        SET @ReceiptId = NEWID();

        DECLARE @CurrencyId TINYINT;
        SELECT @CurrencyId = CASE CurrencyCode WHEN 'PEN' THEN 1 WHEN 'USD' THEN 2 ELSE 1 END
        FROM #Header;

        DECLARE @ReceiptNo INT;
        SELECT @ReceiptNo = TRY_CAST(SUBSTRING(DocNumber, CHARINDEX('-', DocNumber) + 1, 20) AS INT)
        FROM #Header;

        DECLARE @LineCount SMALLINT;
        IF @IsCredit = 0
        BEGIN
            ;WITH XMLNAMESPACES (
                DEFAULT 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' AS cac
            )
            SELECT @LineCount = COUNT(*) FROM @xml.nodes('/Invoice/cac:InvoiceLine') t(x);
        END
        ELSE
        BEGIN
            ;WITH XMLNAMESPACES (
                DEFAULT 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' AS cac
            )
            SELECT @LineCount = COUNT(*) FROM @xml.nodes('/CreditNote/cac:CreditNoteLine') t(x);
        END

        /* ---- Construir EReceiptInfo (formato resumen/QR SUNAT) ----
           RUC|TipoDoc|Serie|Numero|IGV|Total|Fecha|TipoDocCli|NroDocCli|Hash
           Los montos van en POSITIVO (representan el documento real ante SUNAT). */
        DECLARE @Hash VARCHAR(100);
        ;WITH XMLNAMESPACES ('http://www.w3.org/2000/09/xmldsig#' AS ds)
        SELECT @Hash = @xml.value('(//ds:Signature//ds:DigestValue)[1]', 'varchar(100)');

        DECLARE @Serie  VARCHAR(10) = LEFT(@DocNumber, CHARINDEX('-', @DocNumber + '-') - 1);
        DECLARE @Numero VARCHAR(20) = SUBSTRING(@DocNumber, CHARINDEX('-', @DocNumber + '-') + 1, 20);

        DECLARE @EReceiptInfo VARCHAR(300);
        SELECT @EReceiptInfo =
              ISNULL(SupplierRuc, '') + '|'
            + ISNULL(DocTypeCode, '') + '|'
            + @Serie  + '|'
            + @Numero + '|'
            + CONVERT(varchar(20), CAST(ISNULL(TaxTotal, 0)      AS decimal(18,2))) + '|'
            + CONVERT(varchar(20), CAST(ISNULL(PayableAmount, 0) AS decimal(18,2))) + '|'
            + CONVERT(varchar(10), IssueDate, 23) + '|'
            + ISNULL(CustomerDocType, '') + '|'
            + ISNULL(CustomerDoc, '')     + '|'
            + ISNULL(@Hash, '')
        FROM #Header;

        SELECT
            StoreNo       = @StoreNo,
            ReceiptId     = @ReceiptId,
            ReceiptNo     = @ReceiptNo,
            SalesCode     = @SalesCodeDoc,
            SalesDate     = CAST(IssueDate AS DATETIME) + CAST(IssueTime AS DATETIME),
            StatusCode    = 'C',
            CustomerNo    = @CustomerNo,
            DocNumber     = DocNumber,
            SubTotal      = LineExtAmount  * @SignFactor,
            SubTotalWTax  = TaxInclusive   * @SignFactor,
            TaxTotal      = TaxTotal       * @SignFactor,
            TaxPercent    = CAST(18.00000 AS DECIMAL(9,5)),
            PayTotal      = PayableAmount  * @SignFactor,
            DiscTotal     = AllowanceTotal * @SignFactor,
            DiscTotalWTax = AllowanceTotal * @SignFactor,
            CurrencyId    = @CurrencyId,
            ExchangeRate  = CAST(1.00000 AS DECIMAL(18,5)),
            VAT           = CAST(1 AS BIT),
            Invoiced      = CAST(1 AS BIT),
            LineCount     = @LineCount,
            CreatedBy     = SUSER_SNAME(),
            CreationDate  = SYSDATETIME(),
            RegisterId    = '1',
            EReceiptInfo  = @EReceiptInfo
        INTO #ReceiptPreview
        FROM #Header;

        /* ====================================================================
           6) PREPARAR LÍNEAS (#LinesPreview, esquema explícito por las 2 ramas)
           ==================================================================== */
        CREATE TABLE #LinesPreview (
            StoreNo               INT,
            ReceiptId             UNIQUEIDENTIFIER,
            LineId                SMALLINT,
            SalesDate             DATE,
            StatusCode            CHAR(1),
            SalesCode             CHAR(1),
            CodigoXML             VARCHAR(30),
            SKU                   INT,
            UPC                   VARCHAR(30),
            UOMCode               VARCHAR(10),
            Qty                   DECIMAL(18,5),
            RetailPrice           DECIMAL(18,5),
            OriginalPrice         DECIMAL(18,5),
            ExtRetailPrice        DECIMAL(18,5),
            RetailPriceWTax       DECIMAL(18,5),
            OriginalPriceWTax     DECIMAL(18,5),
            ExtRetailPriceWTax    DECIMAL(18,5),
            TaxAmount             DECIMAL(18,5),
            TaxPercent            DECIMAL(9,5),
            ExtTaxAmount          DECIMAL(18,5),
            TaxAreaCode           SMALLINT,
            TaxCode               TINYINT,
            DiscAmount            DECIMAL(18,5),
            DiscAmountWTax        DECIMAL(18,5),
            LineDescription       VARCHAR(100),
            AlternativeLookupCode VARCHAR(10)
        );

        IF @IsCredit = 0
        BEGIN
            ;WITH XMLNAMESPACES (
                DEFAULT 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'     AS cbc,
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' AS cac
            )
            INSERT INTO #LinesPreview
            SELECT
                StoreNo       = @StoreNo,
                ReceiptId     = @ReceiptId,
                LineId        = x.value('(cbc:ID)[1]', 'smallint'),
                SalesDate     = (SELECT IssueDate FROM #Header),
                StatusCode    = 'C',
                SalesCode     = @SalesCodeDoc,
                CodigoXML     = x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(30)'),
                SKU = ISNULL(
                    (SELECT TOP 1 P.SKU FROM dbo.PRODUCT P
                     WHERE P.alu = x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(30)')),
                    0),
                UPC = x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(30)'),
                UOMCode = CASE x.value('(cbc:InvoicedQuantity/@unitCode)[1]', 'varchar(10)')
                              WHEN 'NIU' THEN 'EA'
                              WHEN 'ZZ'  THEN 'EA'
                              ELSE LEFT(ISNULL(x.value('(cbc:InvoicedQuantity/@unitCode)[1]', 'varchar(10)'), 'EA'), 2)
                         END,
                Qty                = x.value('(cbc:InvoicedQuantity)[1]', 'decimal(18,5)'),
                RetailPrice        = x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                OriginalPrice      = x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                ExtRetailPrice     = x.value('(cbc:LineExtensionAmount)[1]',   'decimal(18,5)'),
                RetailPriceWTax    = ISNULL(x.value('(cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                                            x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)')),
                OriginalPriceWTax  = ISNULL(x.value('(cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                                            x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)')),
                ExtRetailPriceWTax = ISNULL(x.value('(cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                                            x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)'))
                                      * x.value('(cbc:InvoicedQuantity)[1]', 'decimal(18,5)'),
                TaxAmount          = x.value('(cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount)[1]', 'decimal(18,5)'),
                TaxPercent         = ISNULL(x.value('(cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:Percent)[1]', 'decimal(9,5)'), 18.00000),
                ExtTaxAmount       = x.value('(cac:TaxTotal/cbc:TaxAmount)[1]', 'decimal(18,5)'),
                TaxAreaCode        = CAST(1 AS SMALLINT),
                TaxCode            = CAST(1 AS TINYINT),
                DiscAmount         = ISNULL(x.value('(cac:AllowanceCharge/cbc:Amount)[1]', 'decimal(18,5)'), 0),
                DiscAmountWTax     = ISNULL(x.value('(cac:AllowanceCharge/cbc:Amount)[1]', 'decimal(18,5)'), 0),
                LineDescription    = LEFT(x.value('(cac:Item/cbc:Description)[1]', 'varchar(100)'), 100),
                AlternativeLookupCode = LEFT(x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(10)'), 10)
            FROM @xml.nodes('/Invoice/cac:InvoiceLine') t(x);
        END
        ELSE
        BEGIN
            -- CreditNote: líneas = cac:CreditNoteLine ; cantidad = cbc:CreditedQuantity
            ;WITH XMLNAMESPACES (
                DEFAULT 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
                'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'     AS cbc,
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' AS cac
            )
            INSERT INTO #LinesPreview
            SELECT
                StoreNo       = @StoreNo,
                ReceiptId     = @ReceiptId,
                LineId        = x.value('(cbc:ID)[1]', 'smallint'),
                SalesDate     = (SELECT IssueDate FROM #Header),
                StatusCode    = 'C',
                SalesCode     = @SalesCodeDoc,
                CodigoXML     = x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(30)'),
                SKU = ISNULL(
                    (SELECT TOP 1 P.SKU FROM dbo.PRODUCT P
                     WHERE P.alu = x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(30)')),
                    0),
                UPC = x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(30)'),
                UOMCode = CASE x.value('(cbc:CreditedQuantity/@unitCode)[1]', 'varchar(10)')
                              WHEN 'NIU' THEN 'EA'
                              WHEN 'ZZ'  THEN 'EA'
                              ELSE LEFT(ISNULL(x.value('(cbc:CreditedQuantity/@unitCode)[1]', 'varchar(10)'), 'EA'), 2)
                         END,
                Qty                = x.value('(cbc:CreditedQuantity)[1]', 'decimal(18,5)'),
                RetailPrice        = x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                OriginalPrice      = x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                ExtRetailPrice     = x.value('(cbc:LineExtensionAmount)[1]',   'decimal(18,5)'),
                RetailPriceWTax    = ISNULL(x.value('(cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                                            x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)')),
                OriginalPriceWTax  = ISNULL(x.value('(cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                                            x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)')),
                ExtRetailPriceWTax = ISNULL(x.value('(cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount)[1]', 'decimal(18,5)'),
                                            x.value('(cac:Price/cbc:PriceAmount)[1]', 'decimal(18,5)'))
                                      * x.value('(cbc:CreditedQuantity)[1]', 'decimal(18,5)'),
                TaxAmount          = x.value('(cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount)[1]', 'decimal(18,5)'),
                TaxPercent         = ISNULL(x.value('(cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:Percent)[1]', 'decimal(9,5)'), 18.00000),
                ExtTaxAmount       = x.value('(cac:TaxTotal/cbc:TaxAmount)[1]', 'decimal(18,5)'),
                TaxAreaCode        = CAST(1 AS SMALLINT),
                TaxCode            = CAST(1 AS TINYINT),
                DiscAmount         = ISNULL(x.value('(cac:AllowanceCharge/cbc:Amount)[1]', 'decimal(18,5)'), 0),
                DiscAmountWTax     = ISNULL(x.value('(cac:AllowanceCharge/cbc:Amount)[1]', 'decimal(18,5)'), 0),
                LineDescription    = LEFT(x.value('(cac:Item/cbc:Description)[1]', 'varchar(100)'), 100),
                AlternativeLookupCode = LEFT(x.value('(cac:Item/cac:SellersItemIdentification/cbc:ID)[1]', 'varchar(10)'), 10)
            FROM @xml.nodes('/CreditNote/cac:CreditNoteLine') t(x);
        END

        -- Nota de Crédito = devolución: cantidad e importes extendidos en NEGATIVO
        -- (los precios unitarios quedan positivos, convención típica de POS).
        IF @IsCredit = 1
            UPDATE #LinesPreview
            SET Qty                = -Qty,
                ExtRetailPrice     = -ExtRetailPrice,
                ExtRetailPriceWTax = -ExtRetailPriceWTax,
                TaxAmount          = -TaxAmount,
                ExtTaxAmount       = -ExtTaxAmount,
                DiscAmount         = -DiscAmount,
                DiscAmountWTax     = -DiscAmountWTax;

        /* ====================================================================
           7) PREPARAR PAGOS
           ==================================================================== */
        DECLARE @PayTotal DECIMAL(18,5);
        SELECT @PayTotal = PayableAmount * @SignFactor FROM #Header;

        -- Nota de traza para devoluciones (referencia + motivo)
        DECLARE @DefaultTenderNote VARCHAR(200) =
            CASE WHEN @IsCredit = 1
                 THEN LEFT('NC ' + ISNULL(@DocNumber,'')
                           + ' ref ' + ISNULL((SELECT RefDoc FROM #Header),'(s/ref)')
                           + ' - ' + ISNULL((SELECT Reason FROM #Header),''), 200)
                 ELSE 'Pago no especificado en XML' END;

        CREATE TABLE #TenderPreview (
            StoreNo      INT             NOT NULL,
            ReceiptId    UNIQUEIDENTIFIER NOT NULL,
            LineId       INT             NOT NULL,
            CurrencyId   TINYINT         NOT NULL,
            PaymentCode  VARCHAR(10)     NULL,
            NotesPM      VARCHAR(200)    NULL,
            TenderId     INT             NULL,
            TakeAmount   DECIMAL(18,5)   NULL,
            GiveAmount   DECIMAL(18,5)   NULL,
            ExchangeRate DECIMAL(18,5)   NULL,
            EFT          BIT             NOT NULL,
            PaymentDate  DATETIME        NULL
        );

        -- Solo las facturas/boletas traen PaymentMeans; las NC no.
        IF @IsCredit = 0
        BEGIN
            ;WITH XMLNAMESPACES (
                DEFAULT 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'     AS cbc,
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' AS cac
            )
            INSERT INTO #TenderPreview (
                StoreNo, ReceiptId, LineId, CurrencyId,
                PaymentCode, NotesPM, TenderId,
                TakeAmount, GiveAmount, ExchangeRate, EFT, PaymentDate
            )
            SELECT
                @StoreNo,
                @ReceiptId,
                CAST(ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS INT),
                @CurrencyId,
                x.value('(cbc:PaymentMeansCode)[1]', 'varchar(10)'),
                x.value('(cbc:InstructionNote)[1]', 'varchar(200)'),
                ISNULL(
                    (SELECT TOP 1 T.TenderId FROM dbo.TENDER T
                     WHERE T.TenderName = x.value('(cbc:PaymentMeansCode)[1]', 'varchar(10)')
                        OR T.TenderName = x.value('(cbc:InstructionNote)[1]', 'varchar(200)')),
                    1),
                @PayTotal,
                CAST(0 AS DECIMAL(18,5)),
                CAST(1.00000 AS DECIMAL(18,5)),
                CASE WHEN x.value('(cbc:PaymentMeansCode)[1]', 'varchar(10)') IN ('001','EFECTIVO','CASH') THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END,
                (SELECT IssueDate FROM #Header)
            FROM @xml.nodes('/Invoice/cac:PaymentMeans') t(x);
        END

        IF NOT EXISTS (SELECT 1 FROM #TenderPreview)
        BEGIN
            INSERT INTO #TenderPreview (
                StoreNo, ReceiptId, LineId, CurrencyId, PaymentCode, NotesPM,
                TenderId, TakeAmount, GiveAmount, ExchangeRate, EFT, PaymentDate
            )
            VALUES (
                @StoreNo, @ReceiptId, 1, @CurrencyId, NULL, @DefaultTenderNote,
                1, @PayTotal, 0, 1.00000, 0, (SELECT IssueDate FROM #Header)
            );
        END

        /* ====================================================================
           8) MODO DRY-RUN: MOSTRAR PREVIEW Y SALIR
           ==================================================================== */
        IF @DryRun = 1
        BEGIN
            -- ResultSet 1: Resumen ejecutivo
            SELECT
                Modo               = '🔍 DRY-RUN (preview, no se insertó nada)',
                Tipo               = CASE WHEN @IsCredit = 1 THEN '🧾 NOTA DE CRÉDITO (devolución, negativo)' ELSE '🧾 FACTURA/BOLETA (venta, positivo)' END,
                Archivo            = @FilePath,
                Comprobante        = @DocNumber,
                EReceiptInfo       = @EReceiptInfo,
                RefOriginal        = (SELECT RefDoc FROM #Header),
                Motivo             = (SELECT Reason FROM #Header),
                SalesCode          = @SalesCodeDoc,
                YaImportado        = CASE @ExisteReceipt WHEN 1 THEN '⚠️ SÍ (al ejecutar real fallará)' ELSE '✅ NO (listo para importar)' END,
                CustomerNoAsignado = @CustomerNo,
                ClienteNuevo       = CASE @CustomerNoNuevo WHEN 1 THEN '🆕 SE CREARÁ' ELSE '✅ Ya existe' END,
                ReceiptIdGenerado  = @ReceiptId,
                NumLineas          = @LineCount,
                NumPagos           = (SELECT COUNT(*) FROM #TenderPreview),
                LineasSinSKU       = (SELECT COUNT(*) FROM #LinesPreview WHERE SKU = 0),
                PagosConTenderDefault = (SELECT COUNT(*) FROM #TenderPreview WHERE TenderId = 1);

            -- ResultSet 2: Cliente
            SELECT
                Accion        = CASE @CustomerNoNuevo WHEN 1 THEN '🆕 INSERT en CUSTOMER' ELSE '✅ Existente, se reutiliza' END,
                CustomerNo    = @CustomerNo,
                LicenseNumber = @CustomerDoc,
                TipoDoc       = CASE @CustomerDocType WHEN '1' THEN 'DNI' WHEN '6' THEN 'RUC' ELSE @CustomerDocType END,
                CustomerType  = CASE WHEN @CustomerNoNuevo = 1 THEN @CustomerType ELSE (SELECT CustomerType FROM dbo.CUSTOMER WHERE CustomerNo = @CustomerNo) END,
                FirstName     = CASE WHEN @CustomerNoNuevo = 1 THEN @FirstName ELSE (SELECT FirstName FROM dbo.CUSTOMER WHERE CustomerNo = @CustomerNo) END,
                MiddleName    = CASE WHEN @CustomerNoNuevo = 1 THEN @MiddleName ELSE (SELECT MiddleName FROM dbo.CUSTOMER WHERE CustomerNo = @CustomerNo) END,
                LastName      = CASE WHEN @CustomerNoNuevo = 1 THEN @LastName ELSE (SELECT LastName FROM dbo.CUSTOMER WHERE CustomerNo = @CustomerNo) END,
                NombreXML     = @CustomerName;

            -- ResultSet 3: Cabecera RECEIPT
            SELECT Accion = '📋 INSERT en RECEIPT', * FROM #ReceiptPreview;

            -- ResultSet 4: Líneas RECEIPT_LINE
            SELECT
                Accion = '📦 INSERT en RECEIPT_LINE',
                AlertaSKU = CASE WHEN SKU = 0 THEN '⚠️ SKU no encontrado en PRODUCT' ELSE '' END,
                *
            FROM #LinesPreview
            ORDER BY LineId;

            -- ResultSet 5: Pagos RECEIPT_TENDER
            SELECT
                Accion = '💳 INSERT en RECEIPT_TENDER',
                AlertaTender = CASE
                                  WHEN TenderId = 1 AND PaymentCode IS NULL THEN 'ℹ️ Tender por defecto (1)'
                                  WHEN TenderId = 1 AND PaymentCode IS NOT NULL THEN 'ℹ️ Tender por defecto (1) - sin match en TENDER'
                                  ELSE '✅ Tender mapeado'
                               END,
                *
            FROM #TenderPreview
            ORDER BY LineId;

            -- ResultSet 6: Validaciones de cuadre (signo aplicado)
            SELECT
                Validacion        = 'Cuadre de totales',
                TotalXML          = (SELECT PayableAmount * @SignFactor FROM #Header),
                SumaLineas_WTax   = (SELECT SUM(ExtRetailPriceWTax) FROM #LinesPreview),
                SumaPagos         = (SELECT SUM(TakeAmount) FROM #TenderPreview),
                IGV_XML           = (SELECT TaxTotal * @SignFactor FROM #Header),
                IGV_SumaLineas    = (SELECT SUM(ExtTaxAmount) FROM #LinesPreview),
                CuadraPagos       = CASE
                                      WHEN ABS((SELECT PayableAmount * @SignFactor FROM #Header) - (SELECT ISNULL(SUM(TakeAmount),0) FROM #TenderPreview)) < 0.01
                                      THEN '✅' ELSE '❌'
                                    END,
                CuadraIGV         = CASE
                                      WHEN ABS((SELECT TaxTotal * @SignFactor FROM #Header) - (SELECT ISNULL(SUM(ExtTaxAmount),0) FROM #LinesPreview)) < 0.05
                                      THEN '✅' ELSE '❌'
                                    END;

            ROLLBACK TRANSACTION;
            DROP TABLE #Header, #ReceiptPreview, #LinesPreview, #TenderPreview;

            PRINT '';
            PRINT '════════════════════════════════════════════════════════════════';
            PRINT '🔍 MODO DRY-RUN: Nada se insertó en la base de datos.';
            PRINT '   Para insertar de verdad, llama al SP con @DryRun = 0';
            PRINT '════════════════════════════════════════════════════════════════';
            RETURN;
        END

        /* ====================================================================
           9) MODO REAL: INSERTAR DESDE LAS TEMPORALES
           ==================================================================== */
        INSERT INTO dbo.RECEIPT (
            StoreNo, ReceiptId, ReceiptNo, SalesCode, SalesDate, StatusCode,
            CustomerNo, DocNumber, SubTotal, SubTotalWTax, TaxTotal, TaxPercent,
            PayTotal, DiscTotal, DiscTotalWTax, CurrencyId, ExchangeRate,
            VAT, Invoiced, LineCount, CreatedBy, CreationDate, RegisterId, EReceiptInfo,
            RewardProcessed, GLProcessed, DWProcessed,
            ACCT1Processed, ACCT2Processed, ACCT3Processed,
            LoyaltyPointsEarned, ManualReceipt, EReceipt, RemoteSale,
            PollStatusCode, ResetPollStatusCode, HQHistory
        )
        SELECT
            StoreNo, ReceiptId, ReceiptNo, SalesCode, SalesDate, StatusCode,
            CustomerNo, DocNumber, SubTotal, SubTotalWTax, TaxTotal, TaxPercent,
            PayTotal, DiscTotal, DiscTotalWTax, CurrencyId, ExchangeRate,
            VAT, Invoiced, LineCount, CreatedBy, CreationDate, RegisterId, EReceiptInfo,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        FROM #ReceiptPreview;

        /* INSERT en RECEIPT_LINE: fila por fila (triggers asumen 1 registro). */
        DECLARE
            @ln_StoreNo INT, @ln_ReceiptId UNIQUEIDENTIFIER, @ln_LineId SMALLINT,
            @ln_SalesDate DATETIME, @ln_StatusCode CHAR(1), @ln_SalesCode CHAR(1),
            @ln_SKU INT, @ln_UPC VARCHAR(30), @ln_UOMCode CHAR(2), @ln_Qty DECIMAL(18,5),
            @ln_RetailPrice DECIMAL(18,5), @ln_OriginalPrice DECIMAL(18,5),
            @ln_ExtRetailPrice DECIMAL(18,5),
            @ln_RetailPriceWTax DECIMAL(18,5), @ln_OriginalPriceWTax DECIMAL(18,5),
            @ln_ExtRetailPriceWTax DECIMAL(18,5),
            @ln_TaxAmount DECIMAL(18,5), @ln_TaxPercent DECIMAL(9,5), @ln_ExtTaxAmount DECIMAL(18,5),
            @ln_TaxAreaCode SMALLINT, @ln_TaxCode TINYINT,
            @ln_DiscAmount DECIMAL(18,5), @ln_DiscAmountWTax DECIMAL(18,5),
            @ln_LineDescription VARCHAR(100), @ln_AlternativeLookupCode VARCHAR(10);

        DECLARE cur_lines CURSOR LOCAL FAST_FORWARD FOR
            SELECT StoreNo, ReceiptId, LineId, SalesDate, StatusCode, SalesCode,
                   SKU, UPC, UOMCode, Qty,
                   RetailPrice, OriginalPrice, ExtRetailPrice,
                   RetailPriceWTax, OriginalPriceWTax, ExtRetailPriceWTax,
                   TaxAmount, TaxPercent, ExtTaxAmount, TaxAreaCode, TaxCode,
                   DiscAmount, DiscAmountWTax, LineDescription, AlternativeLookupCode
            FROM #LinesPreview
            ORDER BY LineId;

        OPEN cur_lines;
        FETCH NEXT FROM cur_lines INTO
            @ln_StoreNo, @ln_ReceiptId, @ln_LineId, @ln_SalesDate, @ln_StatusCode, @ln_SalesCode,
            @ln_SKU, @ln_UPC, @ln_UOMCode, @ln_Qty,
            @ln_RetailPrice, @ln_OriginalPrice, @ln_ExtRetailPrice,
            @ln_RetailPriceWTax, @ln_OriginalPriceWTax, @ln_ExtRetailPriceWTax,
            @ln_TaxAmount, @ln_TaxPercent, @ln_ExtTaxAmount, @ln_TaxAreaCode, @ln_TaxCode,
            @ln_DiscAmount, @ln_DiscAmountWTax, @ln_LineDescription, @ln_AlternativeLookupCode;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            INSERT INTO dbo.RECEIPT_LINE (
                StoreNo, ReceiptId, LineId, SalesDate, StatusCode, SalesCode,
                SKU, UPC, UOMCode, Qty,
                RetailPrice, OriginalPrice, ExtRetailPrice,
                RetailPriceWTax, OriginalPriceWTax, ExtRetailPriceWTax,
                TaxAmount, TaxPercent, ExtTaxAmount, TaxAreaCode, TaxCode,
                DiscAmount, DiscAmountWTax, LineDescription, AlternativeLookupCode,
                Package, HasNotes, NonInventory, IsMarkDown
            )
            VALUES (
                @ln_StoreNo, @ln_ReceiptId, @ln_LineId, @ln_SalesDate, @ln_StatusCode, @ln_SalesCode,
                @ln_SKU, @ln_UPC, @ln_UOMCode, @ln_Qty,
                @ln_RetailPrice, @ln_OriginalPrice, @ln_ExtRetailPrice,
                @ln_RetailPriceWTax, @ln_OriginalPriceWTax, @ln_ExtRetailPriceWTax,
                @ln_TaxAmount, @ln_TaxPercent, @ln_ExtTaxAmount, @ln_TaxAreaCode, @ln_TaxCode,
                @ln_DiscAmount, @ln_DiscAmountWTax, @ln_LineDescription, @ln_AlternativeLookupCode,
                0, 0, 0, 0
            );

            FETCH NEXT FROM cur_lines INTO
                @ln_StoreNo, @ln_ReceiptId, @ln_LineId, @ln_SalesDate, @ln_StatusCode, @ln_SalesCode,
                @ln_SKU, @ln_UPC, @ln_UOMCode, @ln_Qty,
                @ln_RetailPrice, @ln_OriginalPrice, @ln_ExtRetailPrice,
                @ln_RetailPriceWTax, @ln_OriginalPriceWTax, @ln_ExtRetailPriceWTax,
                @ln_TaxAmount, @ln_TaxPercent, @ln_ExtTaxAmount, @ln_TaxAreaCode, @ln_TaxCode,
                @ln_DiscAmount, @ln_DiscAmountWTax, @ln_LineDescription, @ln_AlternativeLookupCode;
        END
        CLOSE cur_lines;
        DEALLOCATE cur_lines;

        /* INSERT en RECEIPT_TENDER: fila por fila */
        DECLARE
            @td_StoreNo INT, @td_ReceiptId UNIQUEIDENTIFIER, @td_LineId INT,
            @td_CurrencyId TINYINT, @td_TenderId INT,
            @td_TakeAmount DECIMAL(18,5), @td_GiveAmount DECIMAL(18,5),
            @td_ExchangeRate DECIMAL(18,5), @td_EFT BIT,
            @td_Notes VARCHAR(2000), @td_PaymentDate DATETIME;

        DECLARE cur_tender CURSOR LOCAL FAST_FORWARD FOR
            SELECT StoreNo, ReceiptId, LineId, CurrencyId, TenderId,
                   TakeAmount, GiveAmount, ExchangeRate, EFT,
                   ISNULL(NotesPM, PaymentCode), PaymentDate
            FROM #TenderPreview
            ORDER BY LineId;

        OPEN cur_tender;
        FETCH NEXT FROM cur_tender INTO
            @td_StoreNo, @td_ReceiptId, @td_LineId, @td_CurrencyId, @td_TenderId,
            @td_TakeAmount, @td_GiveAmount, @td_ExchangeRate, @td_EFT,
            @td_Notes, @td_PaymentDate;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            INSERT INTO dbo.RECEIPT_TENDER (
                StoreNo, ReceiptId, LineId, CurrencyId, TenderId,
                TakeAmount, GiveAmount, ExchangeRate,
                EFT, DebitSale, TakeBase, TakeExchange, Notes, PaymentDate
            )
            VALUES (
                @td_StoreNo, @td_ReceiptId, @td_LineId, @td_CurrencyId, @td_TenderId,
                @td_TakeAmount, @td_GiveAmount, @td_ExchangeRate,
                @td_EFT, 0, 1, 1, @td_Notes, @td_PaymentDate
            );

            FETCH NEXT FROM cur_tender INTO
                @td_StoreNo, @td_ReceiptId, @td_LineId, @td_CurrencyId, @td_TenderId,
                @td_TakeAmount, @td_GiveAmount, @td_ExchangeRate, @td_EFT,
                @td_Notes, @td_PaymentDate;
        END
        CLOSE cur_tender;
        DEALLOCATE cur_tender;

        DROP TABLE #Header, #ReceiptPreview, #LinesPreview, #TenderPreview;
        COMMIT TRANSACTION;

        PRINT '✅ Importación OK | '
            + CASE WHEN @IsCredit = 1 THEN 'NOTA DE CRÉDITO' ELSE 'FACTURA/BOLETA' END
            + ' | Doc: ' + @DocNumber
            + ' | ReceiptId: ' + CAST(@ReceiptId AS VARCHAR(50))
            + ' | CustomerNo: ' + CAST(@CustomerNo AS VARCHAR(20));
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

        DECLARE
            @ErrMsg  NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrSev  INT            = ERROR_SEVERITY(),
            @ErrLine INT            = ERROR_LINE(),
            @ErrProc NVARCHAR(200)  = ISNULL(ERROR_PROCEDURE(), '<inline>');

        RAISERROR('❌ Error en %s línea %d: %s', @ErrSev, 1, @ErrProc, @ErrLine, @ErrMsg);
    END CATCH
END
GO
