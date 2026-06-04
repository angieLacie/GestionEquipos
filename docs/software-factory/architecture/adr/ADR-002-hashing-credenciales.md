# ADR-002: Algoritmo de hashing y custodia de credenciales locales

| Campo | Valor |
|---|---|
| Estado | **Aceptado** (recomendación técnica; parámetros a confirmar con TI) |
| Fecha | 30/05/2026 |
| Vacío que resuelve | VAC-SEGU-09 (RN-SEGU-10) |
| Decisores | Arquitecto de Software, Seguridad TI |
| Documentos | ENT-MOD-SEGU-001 §2.3 / RN-SEGU-10, arquitectura-nova.md §5 |

## Contexto

ENT-MOD-SEGU-001 exige (RN-SEGU-10, nota de cumplimiento §2.3) que las contraseñas **nunca se almacenen en claro ni se expongan** y se guarden con **hash robusto**, derivando el detalle criptográfico al Arquitecto (VAC-SEGU-09): algoritmo, parámetros y rotación. Aplica a las credenciales locales (las cuentas SSO no almacenan contraseña en Nova — ver ADR-001).

## Opciones consideradas

1. **SHA-256/SHA-512 con salt.**
   - Pros: ubicuo, rápido.
   - Contras: **rápido es malo aquí** — permite fuerza bruta masiva con GPU. No es un hash de contraseñas. Descartado.

2. **bcrypt.**
   - Pros: probado, ampliamente disponible, con factor de coste configurable.
   - Contras: límite de 72 bytes de entrada; sin endurecimiento de memoria (menos resistente a ataques con hardware dedicado que Argon2).

3. **PBKDF2.**
   - Pros: estándar FIPS, disponible en todas las plataformas; aceptable si compliance exige FIPS.
   - Contras: solo endurecimiento por iteraciones (CPU), sin coste de memoria; menos resistente a GPU/ASIC que Argon2/scrypt.

4. **Argon2id (recomendado).**
   - Pros: ganador del Password Hashing Competition; endurecimiento por **memoria + CPU + paralelismo**; resistente a GPU/ASIC; recomendado por OWASP como primera opción.
   - Contras: disponibilidad depende de la plataforma/librería; requiere afinar parámetros de memoria según el hardware del servidor.

## Decisión

**Usar Argon2id como algoritmo de hashing de credenciales locales.** Si la plataforma elegida en ADR-007 no ofrece una implementación Argon2id madura, **fallback a bcrypt con coste ≥ 12** (o PBKDF2-HMAC-SHA256 con ≥ 600.000 iteraciones si compliance corporativo exige FIPS).

Parámetros iniciales recomendados (a calibrar con el hardware real, objetivo ~250-500 ms por hash):

| Parámetro Argon2id | Valor inicial recomendado |
|---|---|
| Memoria | 19 MiB (≥ 19456 KiB) |
| Iteraciones (time cost) | 2 |
| Paralelismo | 1 |
| Salt | aleatorio ≥ 16 bytes, único por credencial |
| Longitud de hash | 32 bytes |

Reglas de custodia:
- **Nunca en claro, nunca logueado, nunca expuesto** en API ni en auditoría (RN-SEGU-10, §2.3). El log de auditoría registra el evento `CAMBIO_CREDENCIAL` sin el valor.
- **Salt único por credencial**; algoritmo y parámetros embebidos en el propio hash (formato PHC string) para permitir rotación de parámetros sin migración masiva.
- **Rehash transparente al iniciar sesión**: si el hash almacenado usa parámetros antiguos (o el algoritmo de fallback) y el login es exitoso, se recomputa con los parámetros vigentes. Esto habilita la rotación de coste sin forzar reseteo de contraseñas.
- **Historial de no reúso** (`SEGU_PWD_HISTORIAL_NO_REUSO`): se almacenan los hashes recientes (no los valores) para la validación de no reutilización.
- Las credenciales de **integración** (RMS/OFIPLAN/POS/Firma/IdP) NO son contraseñas de usuario: van en el **gestor de secretos / variables de entorno** (arquitectura-nova.md §5.6), fuera del alcance de este hash.

## Consecuencias

**Positivas:**
- Resistencia fuerte a fuerza bruta offline (memory-hard).
- Rotación de parámetros sin migración (rehash on login + PHC string).
- Cumple recomendación OWASP/ASVS.

**Negativas / trade-offs:**
- Coste de CPU/memoria por login (mitigable: la mayoría de gestión usará SSO, ADR-001).
- Requiere calibrar parámetros al hardware del entorno productivo.

## Pendiente de confirmación de TI

- Si compliance corporativo exige FIPS (en cuyo caso fallback a PBKDF2 con iteraciones altas).
- Calibración final de los parámetros de memoria/tiempo sobre el hardware productivo (coordinar con DevOps).

## Revisión en

Anual, o ante incidente de seguridad / cambio de hardware que justifique recalibrar el coste.
