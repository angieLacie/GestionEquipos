# Notas de implementación — Lote A (bajo riesgo)

Proyecto: Sistema Nova · Prototipos UX v2
Fecha: 2026-05-31
Alcance: SOLO Lote A. NO se tocó lógica de calendarios, ascenso, login ni marcaciones.

## Cambios aplicados

### CAMBIO 1 — Naming del producto (P-10)
- `gestion-equipos.html` línea 1239: footer del login.
  - Antes: `v2.4.1 · Sistema Administrativo de Tiendas`
  - Después: `v2.4.1 · Nova · Gestión de Equipos`
- Verificado: "Sistema Administrativo de Tiendas" NO aparece en ningún otro lugar de los 3 archivos.
- Títulos de pestaña `<title>` se conservaron sin cambios (requisito).

### CAMBIO 2 — Fechas demo a contexto 2026 (P-01)
Estrategia de coherencia: el contexto "actual" del demo se mueve de Abril 2025 a Abril 2026
(bump de año, conservando día/mes), alineado con la fecha de hoy 31/05/2026. Las tarjetas
"Semana 23" que estaban en 2024 se llevaron a 2026 conservando semana/día/mes.

Validación post-cambio: sintaxis JS OK en los 3 archivos (todos los bloques `<script>`).

## Lo que NO se tocó (fuera de Lote A) y por qué
- **gestion-equipos.html**: arrays JS de cobertura (`coberturas`, líneas ~3588-3592) y de
  vacaciones (`vacaciones`, ~3595-3606). Alimentan render de tablas/calendario → dominio de
  calendarios. La data de marcaciones (~3619-3639) ya estaba en 2026.
- **gestion-equipos.html**: módulo de marcación/compensación (`am-*`, líneas 2419, 2563,
  2571-2581). Las fechas propuestas tienen día de semana exacto (Vie/Lun/Sáb) → marcaciones.
- **gestion-equipos.html**: filtros de "Año de Vacaciones" (2110, 2167) y defaults JS
  (4030, 4037) → periodos vacacionales + lógica de calendario.
- **app.html**: tabla de periodos vacacionales históricos (1097-1109: 2024-2025, 2023-2024,
  2022-2023, 2021-2022, 2020-2021) y sus fechas F.INICIO/F.FIN → periodos legítimos.
- **asistencia-app.html**: `updateClock()` (líneas 440-451) usa `new Date()` real; no se
  modificó. Sobrescribe en runtime los valores estáticos de fecha (cosmético).
