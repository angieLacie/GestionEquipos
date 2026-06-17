# Notas de implementación — Backend

## 2026-06-15 — Parámetros: Estado Activo/Inactivo + borrado de versiones futuras

**Módulo:** Maestros (`backend/Modules/Maestros`)
**Reglas afectadas:** RN-MAES-09 (versionado inmutable), RN-MAES-14 (lookup vigente), RN-MAES-16 (auditoría)
**Casos de uso:** CU-MAES-04 (gestión de versiones de parámetro), CU-MAES-06 (lookup), CU-MAES-07 (auditoría)

### 1. Estado explícito Activo/Inactivo (ortogonal a la vigencia)

- Nuevo enum `EstadoParametro { Activo = 1, Inactivo = 2 }` en `Nova.Maestros.Domain/Enums.cs`, junto a los demás enums del módulo.
- `Parametro.Estado` (default `Activo` por inicializador de propiedad).
- Métodos de dominio **idempotentes** que devuelven `Result`:
  - `Activar()` → fuerza `Estado = Activo`.
  - `Desactivar()` → fuerza `Estado = Inactivo`. **NO** llama a `CerrarVigencia`: es un estado, no un cierre de ventana. La versión permanece inmutable (RN-MAES-09).
- Nuevo helper `EsResoluble(fecha) = Estado == Activo && EstaVigente(fecha)`.
- **Lookup ajustado:** `ParametroRepository.ObtenerVigenteAsync` ahora filtra por `EsResoluble(fecha)` en lugar de `EstaVigente(fecha)`. Esto impacta tanto a `LookupParametroHandler` como a `ConfiguracionMaestrosService.LookupParametroAsync` (ambos delegan en ese método del repo), por lo que un parámetro Inactivo deja de resolverse aunque su ventana siga abierta.
- `ObtenerVigenteParaCierreAsync` (usado por `CrearParametroHandler` para cerrar la versión anterior) se deja con `EstaVigente`: cerrar la vigencia de una versión previa es ortogonal a su estado.
- `CerrarVigencia` se mantiene intacto (ortogonal, sigue existiendo).

### 2. Borrado solo de versiones futuras no consumidas

- `Parametro.PuedeEliminarse(hoy) = VigenciaDesde > hoy`.
- `EliminarParametroHandler`: si `!PuedeEliminarse(hoy)` → `Error.Validacion("Solo se pueden eliminar versiones futuras no consumidas; las vigentes/pasadas se desactivan.")`. Para vigentes/pasadas la vía es Desactivar.

### 3. Auditoría

- Enum `AccionConfig` ampliado: `CambioEstado = 6`, `Eliminacion = 7`.
- `CambiarEstadoParametroHandler` registra `CambioEstado` con `valor_anterior`/`valor_nuevo` = estado anterior/nuevo, **solo si hubo transición real** (idempotencia: no audita ni guarda si no cambió).
- `EliminarParametroHandler` registra `Eliminacion` (valor_anterior = valor borrado, valor_nuevo = null).

### 4. Capas tocadas

- **Domain:** `Enums.cs`, `Parametro.cs`.
- **Application:** `Contracts.cs` (`CambiarEstadoParametroRequest`, `ParametroResponse.Estado`), `Ports.cs` (`IParametroRepository.EliminarAsync`), `ConfiguracionHandlers.cs` (handlers nuevos + response con Estado).
- **Infrastructure:** `Repositories.cs` (`EliminarAsync`, lookup con `EsResoluble`), `MaestrosDbContext.cs` (columna `estado` nvarchar(12) HasConversion<string> default Activo + sentinel `(EstadoParametro)0`), migración `20260615214019_AddEstadoParametro`.
- **Api:** `MaestrosModule.cs` (registro de handlers + 2 endpoints).

### 5. Decisiones / desviaciones

- **Cambio de estado tracked sin método explícito de "guardar":** `IParametroRepository.ObtenerAsync` carga con tracking (sin `AsNoTracking`), de modo que la mutación de `Activar/Desactivar` se persiste con `SaveChangesAsync`. No se añadió un método separado tipo `GuardarEstadoAsync` por innecesario y para alinear con el patrón existente de `EditarTiendaHandler` (también muta una entidad tracked).
- **Sentinel EF:** `HasSentinel((EstadoParametro)0)` para evitar el warning EF20601 (el valor 0 no es válido en el enum; el CLR default de la propiedad es Activo=1). El default real de columna lo aporta la migración (`DEFAULT 'Activo'`), que además backfillea filas existentes.
- **GET `/configuracion/parametros`:** `ListarAsync` devuelve la entidad `Parametro` directamente (no hay DTO de proyección de lista), por lo que la nueva propiedad `Estado` se serializa automáticamente en la fila.
- **No se ejecutaron migraciones contra la BD.** Solo se generó el archivo con `dotnet ef migrations add`.
- Se detuvo el host `Nova.Bootstrap` en ejecución (PID 11144) porque bloqueaba los DLLs e impedía generar la migración. Reiniciar con `dotnet run --project Nova.Bootstrap` cuando se requiera.
