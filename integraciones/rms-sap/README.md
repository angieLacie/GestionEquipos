# Integración RMS / SAP — Guías

Scripts del orquestador de guías (e-receipt / importación de lotes SAP→RMS). **Legacy / utilitario**, independiente de la app Nova.

## Contenido

| Archivo | Propósito |
|---|---|
| `Orquestador-Guias-SAP-RMS.ps1` | Orquestador principal (lee `.env`, conecta SQL/SAP, procesa colas, PostPO). |
| `01_limpieza_store91.sql` | Limpieza de datos store 91. |
| `02_importar_lote.sql` | Importación de lote. |
| `03_update_ereceiptinfo.sql` | Actualización de e-receipt info. |
| `usp_ImportReceiptFromXmlFile.sql` | Stored procedure de importación de recibos desde XML. |

## Configuración

El orquestador busca `.env` junto al script (`$PSScriptRoot`). Copiar `.env.example` → `.env` en esta carpeta y completarlo. **El `.env` real NO se versiona** (ver `.gitignore`).

```powershell
Copy-Item .env.example .env
# editar .env, luego:
./Orquestador-Guias-SAP-RMS.ps1
```
