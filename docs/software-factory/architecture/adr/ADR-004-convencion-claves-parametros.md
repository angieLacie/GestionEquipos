# ADR-004: Convención de claves de parámetros por flujo/nivel

| Campo | Valor |
|---|---|
| Estado | **Aceptado** |
| Fecha | 30/05/2026 |
| Vacío que resuelve | VAC-MAES-18 (granularidad de la clave de parámetro por flujo/nivel) |
| Decisores | Arquitecto de Software, DBA, Backend |
| Documentos | ENT-MOD-MAES-001 §7.6 (catálogo de parámetros), ENT-MOD-APRO-001 §7 |

## Contexto

Maestros es el repositorio único de parámetros (RN-MAES-14: valor vigente a fecha). El motor de Aprobaciones define la estructura de plantillas y los **valores** de SLA/escalamiento por flujo/nivel viven en Maestros con la convención propuesta por el analista: claves compuestas tipo `APRO_SLA_<FLUJO>_<NIVEL>` (p. ej. `APRO_SLA_FL_ASCE_GG`), `APRO_ESCALAMIENTO_<FLUJO>_<NIVEL>`, `APRO_CONSECUENCIA_VENCIMIENTO_<FLUJO>_<NIVEL>`.

VAC-MAES-18 pregunta si esa **clave compuesta en string** es adecuada para el Arquitecto o si conviene una **tabla relacional flujo-nivel-parámetro**.

## Opciones consideradas

1. **Clave compuesta como string opaco (`APRO_SLA_FL_ASCE_GG`) en una tabla key-value plana.**
   - Pros: simple; una sola tabla de parámetros; el catálogo de MAES §7.6 ya está escrito así; fácil de leer en logs.
   - Contras: la clave codifica estructura (flujo + nivel + tipo) en un string → parsing frágil, sin integridad referencial (un typo en el nivel no se detecta), difícil de consultar "todos los SLA del flujo FL_ROL", riesgo de claves huérfanas si se renombra un nivel.

2. **Tabla relacional normalizada flujo-nivel-parámetro (sin clave string).**
   - Pros: integridad referencial (FK a flujo y a nivel), consultas naturales, sin parsing.
   - Contras: rompe la convención ya documentada en MAES §7.6 y la API del servicio de configuración (CU-MAES-06) que devuelve por clave; obliga a reescribir el catálogo y los consumidores que piden parámetros "por clave".

3. **Modelo relacional con clave lógica derivada (recomendado — híbrido).**
   - Pros: combina lo mejor: estructura normalizada + compatibilidad con la API por clave.
   - Contras: una columna derivada/calculada que mantener consistente.

## Decisión

**Adoptar el modelo relacional con clave lógica derivada (opción 3).**

Estructura de datos:

- Tabla `parametro` con columnas **estructuradas**: `modulo`, `flujo` (FK a catálogo de flujos APRO, nullable para parámetros no de flujo), `nivel` (FK al nivel del flujo, nullable), `nombre_parametro` (SLA, ESCALAMIENTO, CONSECUENCIA_VENCIMIENTO, ...), `ambito` (GLOBAL/EMPRESA/ZONA/TIENDA/PUESTO), `tipo_dato`, `valor` (JSONB para soportar ENTERO/LISTA/RANGO/BOOLEAN, MAES §7.6), `criticidad_consumo` (BLOQUEANTE/DEGRADABLE, ADR-005), `es_impacto_negocio`, y las columnas de **vigencia** (`fecha_desde`/`fecha_hasta`) que ya exige RN-MAES-14.
- **Clave lógica derivada** `clave` (columna generada o índice único compuesto) que reproduce la convención `APRO_SLA_<FLUJO>_<NIVEL>` para mantener la **compatibilidad con el catálogo de MAES §7.6 y la API del servicio de configuración** (CU-MAES-06 sigue aceptando `getParametro(clave, fecha, ámbito)`).
- **Restricción de unicidad** sobre `(modulo, flujo, nivel, nombre_parametro, ambito, fecha_desde)` → garantiza integridad (un solo SLA vigente por flujo/nivel/ámbito a una fecha).
- **Integridad referencial:** `flujo` y `nivel` referencian el catálogo de flujos/niveles del motor → un nivel inexistente no puede tener parámetro; renombrar un nivel actualiza la clave derivada sin claves huérfanas.

Esto satisface a ambas partes: el DBA obtiene un modelo normalizado con FKs y consultas naturales ("todos los SLA de FL_ROL"); el servicio de configuración y los consumidores siguen pidiendo por clave string sin cambios; el catálogo de MAES §7.6 permanece válido como vista lógica.

Aplicación a la decisión de VAC-MAES-16 (arquitectura-nova.md §10): como el Rol gestiona sus plazos internamente, **no se crean filas `APRO_SLA_FL_ROL_*`**; los `ROL_PLAZO_*` se modelan como parámetros del módulo Rol (sin flujo/nivel APRO), encajando naturalmente en el mismo esquema con `flujo = null`.

## Consecuencias

**Positivas:**
- Integridad referencial y consultas por flujo/nivel sin parsing de strings.
- Compatibilidad total con el catálogo MAES §7.6 y la API por clave (no rompe consumidores).
- Vigencia y criticidad por parámetro nativas en el modelo (RN-MAES-14/19).

**Negativas / trade-offs:**
- La clave derivada debe mantenerse consistente con las columnas estructuradas (mitigado con columna generada o trigger).
- Ligeramente más complejo que una tabla key-value plana.

## Pendiente de confirmación de TI

- Ninguno bloqueante. Decisión técnica interna; se coordina el modelo físico con el DBA.

## Revisión en

Si aparece un parámetro con granularidad no contemplada (p. ej. por flujo+nivel+empresa simultáneo), revisar las columnas estructuradas.
