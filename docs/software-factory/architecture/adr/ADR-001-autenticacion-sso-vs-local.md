# ADR-001: Método de autenticación — SSO/IdP corporativo vs credenciales locales

| Campo | Valor |
|---|---|
| Estado | **Propuesto** — `⚠️ PENDIENTE APROBACIÓN TI` |
| Fecha | 30/05/2026 |
| Vacío que resuelve | VAC-SEGU-01 (RN-SEGU-13), relacionado VAC-SEGU-02 (MFA), VAC-MAES-17 |
| Decisores | Arquitecto de Software, Seguridad TI, PO |
| Documentos | ENT-MOD-SEGU-001 §9.5, arquitectura-nova.md §5/§6, contratos-integracion.md §8 |

## Contexto

El módulo de Seguridad/Accesos se construye desde cero (módulo 10, Fase 0). ENT-MOD-SEGU-001 especifica el comportamiento funcional del login (CU-SEGU-02) y deja el método de autenticación como decisión configurable (`SEGU_AUTENTICACION_METODO` = LOCAL / SSO), derivando el contrato técnico al Arquitecto/TI. Hay que decidir si Nova autentica con **credenciales locales propias** o se integra con un **IdP corporativo (SSO vía OIDC/SAML/LDAP)**.

Restricciones del contexto:
- Universo de usuarios heterogéneo: roles de gestión (ADM, GG, GZ, AV, AR, BIEN) en web, y colaboradores/EMP que marcan y firman en app móvil (VAC-SEGU-05). No todos los colaboradores de tienda tienen necesariamente cuenta corporativa.
- Nova mantiene su **propio modelo de roles y ámbito** (RBAC con ámbito) que ningún IdP corporativo conoce; la autorización es siempre de Nova.
- Existen usuarios TECNICO/CENTRAL sin vínculo a RMS (VAC-SEGU-04).
- Se desea MFA al menos para roles de alto privilegio (VAC-SEGU-02).

## Opciones consideradas

1. **Solo credenciales locales (Nova gestiona contraseñas).**
   - Pros: independencia total; funciona aunque no exista IdP; control directo de la política (MAES §7.6).
   - Contras: Nova asume el riesgo de custodiar credenciales de toda la organización; sin SSO el usuario gestiona otra contraseña más; MFA hay que construirlo; mayor superficie de ataque y carga de compliance.

2. **Solo SSO contra IdP corporativo (OIDC).**
   - Pros: identidad centralizada, MFA y políticas heredadas del IdP, menor custodia de credenciales, mejor experiencia para usuarios corporativos.
   - Contras: dependencia dura del IdP (si cae, nadie entra); requiere que todos los usuarios —incluidos colaboradores de tienda y cuentas técnicas— existan en el IdP, lo cual puede no cumplirse.

3. **Híbrido: SSO (OIDC) como método primario para usuarios corporativos + credenciales locales como fallback configurable (recomendado).**
   - Pros: usa el IdP donde existe identidad corporativa (gestión), y soporta usuarios sin cuenta corporativa (EMP de tienda, cuentas técnicas) con login local; degradación operativa si el IdP no está disponible para roles críticos; alineado con `SEGU_AUTENTICACION_METODO`.
   - Contras: dos rutas de autenticación que mantener y auditar; requiere mapeo de identidad federada → usuario de Nova.

## Decisión

**Adoptar el modelo híbrido (opción 3):**

- **SSO vía OIDC (Authorization Code + PKCE)** como método **primario para usuarios corporativos** (roles de gestión), si TI dispone de IdP corporativo (Entra ID / Keycloak u otro).
- **Credenciales locales** (con la política de ADR-002 y baseline §6 de arquitectura) como **fallback configurable** y como método para usuarios sin cuenta corporativa (colaboradores de tienda, cuentas TECNICO/CENTRAL).
- **La autorización siempre es de Nova:** el IdP solo verifica identidad; Nova mapea el claim de identidad (`employeeId`/`sub`/`email`) al usuario y resuelve roles/ámbito con su RBAC propio (CU-SEGU-02 A1).
- **MFA** se hereda del IdP para los usuarios SSO; para login local se exige MFA en R-ADM, R-GG, R-GG-SUP (baseline §6).
- Controlado por el parámetro `SEGU_AUTENTICACION_METODO` (Maestros), que puede valer LOCAL, SSO o HÍBRIDO por defecto.

Razón principal: cubre todo el universo de usuarios (corporativos y de tienda) sin forzar a meter a cada colaborador en el IdP, reduce la custodia de credenciales donde el IdP existe, y preserva el modelo de autorización propio de Nova que ningún IdP puede sustituir.

## Consecuencias

**Positivas:**
- Reducción de riesgo de custodia de credenciales para la mayoría de usuarios de gestión.
- MFA disponible "gratis" para usuarios SSO.
- El sistema sigue operando para usuarios de tienda aunque no exista IdP.

**Negativas / trade-offs:**
- Dos rutas de autenticación a mantener, probar y auditar.
- Requiere acordar con TI los claims del IdP y el mapeo a `codigo_empleado`.
- Dependencia del IdP para roles críticos cuando SSO esté activo (mitigable con fallback local de emergencia para ADM).

## Pendiente de confirmación de TI

- Disponibilidad y tipo de IdP corporativo (Entra ID / Keycloak / otro) y protocolo (OIDC preferido).
- Claims disponibles y mapeo a `codigo_empleado` de RMS.
- Política de MFA del IdP y su reutilización para Nova.
- Confirmación del valor por defecto de `SEGU_AUTENTICACION_METODO`.

## Revisión en

Cuando TI confirme la existencia/tipo de IdP corporativo, o antes del inicio de construcción de Fase 0 (Seguridad).
