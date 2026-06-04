<#
.SYNOPSIS
    Orquestador de conciliacion de guias SAP -> RMS.
    Encadena: ejecutar SP -> decidir colas -> WPMA (SAP GUI) -> PostPO (API RMS).

.DESCRIPTION
    Paso 1-2 (IMPLEMENTADO): ejecuta [Jeruth].[Custm_Jeruth_Guias_SAP_Pendientes],
    lee Jeruth.Jeruth_Guias_SAP y Jeruth.Jeruth_Guias_Mat_SAP y reparte en colas.
    Paso 3 (PENDIENTE): WPMA via SAP GUI Scripting -> requiere mapeo material->centro.
    Paso 4 (PENDIENTE): PostPO -> requiere saber como se genera el JSON body.

    Ejecutar en la maquina Windows que tiene SAP GUI. Solo usa modulos nativos.
    OJO: apunta a PRODUCTIVO. Procesar por lotes. Mantener idempotencia.
#>

# ============================ LECTOR .env ============================
function Import-DotEnv {
    param([string]$Path = (Join-Path $PSScriptRoot '.env'))
    if (-not (Test-Path $Path)) {
        throw "No se encontro el archivo .env en '$Path'. Copia .env.example a .env y completalo."
    }
    $envVars = @{}
    foreach ($linea in Get-Content -Path $Path) {
        $l = $linea.Trim()
        if ($l -eq '' -or $l.StartsWith('#')) { continue }
        $idx = $l.IndexOf('=')
        if ($idx -lt 1) { continue }
        $clave = $l.Substring(0, $idx).Trim()
        $valor = $l.Substring($idx + 1).Trim().Trim('"').Trim("'")
        $envVars[$clave] = $valor
    }
    return $envVars
}

$env_ = Import-DotEnv
function EnvBool { param($v) return ($v -as [string]).ToLower() -in @('true','1','si','yes') }

# ============================ CONFIGURACION ============================
$Config = @{
    # --- SQL Server (BD_FUSIONCORE) ---
    SqlServer   = $env_['SQL_SERVER']
    SqlDatabase = $env_['SQL_DATABASE']
    SqlIntegratedSecurity = (EnvBool $env_['SQL_INTEGRATED_SECURITY'])
    SqlUser     = $env_['SQL_USER']
    SqlPass     = $env_['SQL_PASS']

    # --- SAP ---
    SapMandante = $env_['SAP_MANDANTE']
    SapUser     = $env_['SAP_USER']
    SapPass     = $env_['SAP_PASS']
    SapCredXml  = $env_['SAP_CRED_XML']   # si esta seteado, prioridad sobre SapUser/SapPass

    # --- API RMS (PostPO) ---
    PostPoUrl   = $env_['POSTPO_URL']
    PostPoToken = $env_['POSTPO_TOKEN']

    # --- Operacion ---
    LoteWpma    = [int]($env_['LOTE_WPMA'])
    LogPath     = (Join-Path $PSScriptRoot ('log_orquestador_{0:yyyyMMdd}.txt' -f (Get-Date)))
    DryRun      = (EnvBool $env_['DRY_RUN'])
}

# Resuelve credenciales SAP: DPAPI (.cred.xml) tiene prioridad sobre texto plano del .env
function Get-SapCredencial {
    if ($Config.SapCredXml -and (Test-Path $Config.SapCredXml)) {
        $c = Import-Clixml $Config.SapCredXml
        return @{ User = $c.UserName; Pass = $c.GetNetworkCredential().Password }
    }
    if ($Config.SapUser) {
        return @{ User = $Config.SapUser; Pass = $Config.SapPass }
    }
    return $null   # null = modo atendido (sesion ya logueada a mano)
}

# ============================ LOG ============================
function Write-Log {
    param([string]$Mensaje, [ValidateSet('INFO','WARN','ERROR','OK')] [string]$Nivel = 'INFO')
    $linea = '{0} [{1}] {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Nivel, $Mensaje
    $color = @{ INFO='Gray'; WARN='Yellow'; ERROR='Red'; OK='Green' }[$Nivel]
    Write-Host $linea -ForegroundColor $color
    Add-Content -Path $Config.LogPath -Value $linea -Encoding UTF8
}

# ============================ HELPER SQL (ADO.NET nativo) ============================
function Get-SqlConnectionString {
    $sb = "Server=$($Config.SqlServer);Database=$($Config.SqlDatabase);"
    if ($Config.SqlIntegratedSecurity) { $sb += 'Integrated Security=SSPI;' }
    else { $sb += "User Id=$($Config.SqlUser);Password=$($Config.SqlPass);" }
    return $sb
}

function Invoke-SqlQuery {
    param([string]$Query, [int]$TimeoutSeg = 600)
    $cn = New-Object System.Data.SqlClient.SqlConnection (Get-SqlConnectionString)
    try {
        $cn.Open()
        $cmd = $cn.CreateCommand()
        $cmd.CommandText = $Query
        $cmd.CommandTimeout = $TimeoutSeg
        $da = New-Object System.Data.SqlClient.SqlDataAdapter $cmd
        $dt = New-Object System.Data.DataTable
        [void]$da.Fill($dt)
        return $dt
    } finally { $cn.Close() }
}

function Invoke-SqlNonQuery {
    param([string]$Query, [int]$TimeoutSeg = 600)
    $cn = New-Object System.Data.SqlClient.SqlConnection (Get-SqlConnectionString)
    try {
        $cn.Open()
        $cmd = $cn.CreateCommand()
        $cmd.CommandText = $Query
        $cmd.CommandTimeout = $TimeoutSeg
        [void]$cmd.ExecuteNonQuery()
    } finally { $cn.Close() }
}

# ============================ PASO 1: EJECUTAR SP ============================
function Invoke-SpGuiasPendientes {
    Write-Log 'Paso 1: ejecutando SP [Jeruth].[Custm_Jeruth_Guias_SAP_Pendientes]...'
    Invoke-SqlNonQuery -Query 'EXEC [Jeruth].[Custm_Jeruth_Guias_SAP_Pendientes]'
    Write-Log 'SP ejecutado. Tablas Jeruth_Guias_SAP y Jeruth_Guias_Mat_SAP actualizadas.' 'OK'
}

# ============================ PASO 2: LEER Y DECIDIR COLAS ============================
function Get-Colas {
    Write-Log 'Paso 2: leyendo tablas de resultado...'

    $guias = Invoke-SqlQuery -Query @'
        SELECT Entrega, Tienda, NroGuia, Factura, RespuestaSunat, Observacion, MatCompletos
        FROM Jeruth.Jeruth_Guias_SAP
'@
    $matsFaltantes = Invoke-SqlQuery -Query @'
        SELECT Variante, Generico
        FROM Jeruth.Jeruth_Guias_Mat_SAP
'@

    $listasPostPo = $guias.Select("Observacion = 'Migrar' AND MatCompletos = 'SI'")
    $faltaWpma    = $guias.Select("Observacion = 'Migrar' AND MatCompletos = 'NO'")
    $omitidas     = $guias.Select("Observacion <> 'Migrar'")

    Write-Log ("Guias totales: {0} | Listas PostPO: {1} | Falta WPMA: {2} | Omitidas: {3} | Materiales faltantes: {4}" -f `
        $guias.Rows.Count, $listasPostPo.Count, $faltaWpma.Count, $omitidas.Count, $matsFaltantes.Rows.Count)

    return @{
        ListasPostPo  = $listasPostPo
        FaltaWpma     = $faltaWpma
        Omitidas      = $omitidas
        MatsFaltantes = $matsFaltantes
    }
}

# ============================ PASO 3: WPMA (PENDIENTE) ============================
function Invoke-Wpma {
    param($MaterialesPorCentro)
    # TODO: requiere (1) mapeo material->centro en Jeruth_Guias_Mat_SAP
    #       (2) IDs reales de los campos de WPMA (se obtienen grabando con el Script Recorder)
    # Esqueleto de conexion a SAP GUI por COM:
    #   $SapGui = (New-Object -ComObject SapGui.ScriptingCtrl.1)  # o GetObject("SAPGUI")
    #   $App = $SapGui.GetScriptingEngine
    #   $Conn = $App.Children(0); $Ses = $Conn.Children(0)
    #   $Ses.findById("wnd[0]/tbar[0]/okcd").Text = "/nWPMA" ...  (pegar lista por seleccion multiple, por lotes de $Config.LoteWpma)
    Write-Log 'Paso 3 (WPMA): PENDIENTE de definir mapeo material->centro y grabar IDs de pantalla.' 'WARN'
}

# ============================ PASO 4: POSTPO (PENDIENTE) ============================
function Invoke-PostPo {
    param($Guia)
    # TODO: requiere saber como se genera el JSON body (otro SP/servicio?).
    # Una vez tengamos el origen del body:
    #   $body = ... (array de lineas PO con ALU = variante)
    #   $resp = Invoke-RestMethod -Uri $Config.PostPoUrl -Method Post -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 5)
    Write-Log ("Paso 4 (PostPO): PENDIENTE de definir origen del JSON. Guia {0}" -f $Guia.Entrega) 'WARN'
}

# ============================ MAIN ============================
try {
    Write-Log '===== INICIO ORQUESTADOR ====='
    if ($Config.DryRun) { Write-Log 'MODO DRY-RUN: no se ejecuta WPMA ni PostPO.' 'WARN' }

    Invoke-SpGuiasPendientes
    $colas = Get-Colas

    # --- Guias que necesitan WPMA primero ---
    if ($colas.FaltaWpma.Count -gt 0 -and $colas.MatsFaltantes.Rows.Count -gt 0) {
        if (-not $Config.DryRun) { Invoke-Wpma -MaterialesPorCentro $colas.MatsFaltantes }
        else { Write-Log ("[DryRun] WPMA pendiente para {0} guia(s) con materiales faltantes." -f $colas.FaltaWpma.Count) }
    }

    # --- Guias listas para migrar a RMS ---
    foreach ($g in $colas.ListasPostPo) {
        if (-not $Config.DryRun) { Invoke-PostPo -Guia $g }
        else { Write-Log ("[DryRun] PostPO pendiente para guia {0} (tienda {1})." -f $g.Entrega, $g.Tienda) }
    }

    Write-Log '===== FIN ORQUESTADOR =====' 'OK'
}
catch {
    Write-Log ("ERROR: {0}" -f $_.Exception.Message) 'ERROR'
    throw
}
