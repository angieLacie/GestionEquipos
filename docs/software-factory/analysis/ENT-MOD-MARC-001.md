# ESPECIFICACION DE NECESIDADES TECNOLOGICAS
## ENT-MOD-MARC-001 — Modulo de Marcaciones
### Sistema Nova | Organizacion Retail Peruana (Cadena / Lukers)

| Campo | Valor |
|---|---|
| Codigo de documento | ENT-MOD-MARC-001 |
| Version | 1.2 |
| Fecha de emision | 29/05/2026 |
| Fecha de actualizacion | 31/05/2026 |
| Estado | BORRADOR — Pendiente de validacion con stakeholders. Reconciliado con reconciliacion-ux.md (C-04 / H-14 a H-19, H-01) |
| Elaborado por | Analista Funcional Senior |
| Sistema | Nova |
| Modulo | Marcaciones |
| Documentos relacionados | ENT-MOD-DESC-001 v1.3, ENT-MOD-VAC-001 v1.2, ENT-MOD-ENCA-001 v1.2, ENT-MOD-TRAS-001 v1.1, reconciliacion-ux.md v1.0 (C-04) |

### Historial de versiones

| Version | Fecha | Descripcion |
|---|---|---|
| 1.0 | 29/05/2026 | Emision inicial. |
| 1.1 | 29/05/2026 | Vacios funcionales VF-01 a VF-14 resueltos. |
| 1.2 | 31/05/2026 | Reconciliacion con el prototipo (reconciliacion-ux.md — C-04). H-14: atribucion de la marcacion por HUELLA al dueno de la huella, no a la sesion del kiosko (nueva RN-17, ajuste de CU-02/CU-03). H-17: deteccion y senalizacion de TARDANZA y marcacion ANTICIPADA, que alimentan alertas y el reporte (nueva RN-18, nuevos estados TARDANZA/ENTRADA_ANTICIPADA). H-18: "Sin marcacion" NO cuenta a quien tiene descanso/vacaciones/licencia programada; se muestra ese estado y se EXCLUYE lo ya programado de las alertas (nueva RN-19, ajuste de CU-06/CU-07). H-15/H-16: codigo de autorizacion ZONAL como compuerta de excepcion (anulacion de programacion) con FUENTE ÚNICA, y AUDITORIA de anulacion/reprogramacion (quien/cuando/codigo) (nuevas RN-20 y RN-21, nueva entidad AuditoriaAnulacionProgramacion). H-19: registrar Falta/Descanso manual requiere MOTIVO obligatorio + auditoria (nueva RN-22, ajuste de CU-07). H-01: confirmacion de semana domingo-sabado donde aplique (refuerzo de RN-01). |

---

## INDICE

1. Introduccion y Objetivo del Modulo
2. Alcance y Exclusiones
3. Actores y Roles
4. Casos de Uso
5. Reglas de Negocio
6. Estados y Transiciones de una Marcacion
7. Entidades y Atributos Principales
8. Permisos por Rol
9. Integraciones
10. Vacios Funcionales Resueltos

---

## 1. INTRODUCCION Y OBJETIVO DEL MODULO

### 1.1 Contexto del negocio

Nova es un sistema de gestion desarrollado desde cero para una organizacion retail peruana con aproximadamente 100 tiendas distribuidas en multiples zonas geograficas. El grupo empresarial opera bajo dos cadenas: Cadena y Lukers. El sistema comprende un componente web, una aplicacion movil y dispositivos biometricos instalados fisicamente en cada tienda.

### 1.2 Problema que resuelve

El sistema actual permite unicamente registrar asistencia por huella dactilar y consultar un resumen. Esto genera las siguientes brechas operativas:

- No existe control automatizado sobre personal con programaciones activas (descansos, compensaciones, traslados) que no deberian marcar en esa tienda.
- No hay mecanismo de alerta temprana para que el gerente de tienda gestione inasistencias en tiempo real.
- No existe integracion entre el control de asistencia del personal part-time y el sistema POS.
- El enrolamiento biometrico no esta integrado al sistema central Nova.

### 1.3 Objetivo del modulo

Proveer un modulo integral de marcaciones dentro de Nova que gestione:

- El enrolamiento biometrico de huella dactilar del personal.
- El registro de entradas y salidas mediante huella dactilar con validacion de programaciones activas.
- La habilitacion excepcional de marcacion mediante codigo de autorizacion emitido por el Gerente Zonal (desde web y app movil).
- Alertas proactivas de inasistencia en los equipos Windows de cada tienda.
- Gestion de la inasistencia directamente desde la alerta (registro de Falta o derivacion a Descanso).
- Alertas de salida para personal part-time integradas al sistema POS, con bloqueo individual de venta ante incumplimiento.

---

## 2. ALCANCE Y EXCLUSIONES

### 2.1 Dentro del alcance

| # | Capacidad |
|---|---|
| 1 | Enrolamiento de huella dactilar desde dispositivo biometrico en tienda |
| 2 | Registro de marcacion de entrada con huella dactilar |
| 3 | Registro de marcacion de salida con huella dactilar |
| 4 | Bloqueo automatico de marcacion cuando el empleado tiene programacion activa |
| 5 | Emision y validacion de codigos de autorizacion zonal (web y app movil) |
| 6 | Alertas emergentes en Windows sobre inasistencias en horarios parametrizables |
| 7 | Modulo web de gestion de inasistencia accesible desde la alerta Windows |
| 8 | Registro de Falta desde el modulo de gestion de inasistencia |
| 9 | Derivacion al modulo de Descansos desde el modulo de gestion de inasistencia |
| 10 | Alertas emergentes en POS (no bloqueantes) a los 10, 5 y 1 minuto antes del horario teorico de salida de personal part-time |
| 11 | Bloqueo individual del proceso de venta en POS por empleado part-time sin marcacion de salida |
| 12 | Modificacion retroactiva de marcaciones por Administracion de Ventas dentro de la semana en curso |
| 13 | Tolerancia parametrizable de entrada y salida para marcaciones |
| 14 | Replicacion de plantilla biometrica a tienda destino en traslados |
| 15 | Reportes de asistencia, inasistencias, autorizaciones, modificaciones y bloqueos de POS |
| 16 | Registro de auditoria completo del modulo |

### 2.2 Fuera del alcance

| # | Exclusion | Justificacion |
|---|---|---|
| 1 | Marcacion de asistencia desde la app movil | No aplica en este modulo |
| 2 | Calculo de planilla o liquidacion de sueldos | Modulo de nomina |
| 3 | Programacion de turnos o creacion de horarios | Modulo de Programacion / Horarios |
| 4 | Gestion de traslados o compensaciones | Modulos independientes |
| 5 | Registro biometrico por otros medios (facial, PIN, tarjeta) | No especificado en esta version |
| 6 | Integracion con OFIPLAN | RMS es la fuente de verdad de empleados en este modulo |
| 7 | Firma electronica | No aplica en flujos de este modulo |

---

## 3. ACTORES Y ROLES

| Rol | Codigo | Descripcion operativa en este modulo |
|---|---|---|
| Administrador del Sistema | ROL-ADM | Configura parametros del modulo. Puede ejecutar cualquier operacion. |
| Gerente de Tienda (GT) / Senior | ROL-GT | Gestiona alertas de inasistencia. Registra Faltas o deriva a Descanso. Puede enrolar huellas. Puede modificar marcaciones (delegado a AV). |
| Gerente Zonal (GZ) | ROL-GZ | Emite codigos de autorizacion zonal desde web o app movil. |
| Administracion de Ventas | ROL-AV | Modifica marcaciones dentro de la semana en curso. Consulta reportes. |
| Gerencia General | ROL-GG | Supervision. Visualiza reportes globales. Recibe notificacion de bloqueos POS segun configuracion. |
| Empleado | ROL-EMP | Interactua con el dispositivo biometrico. No accede al sistema web en este modulo. |
| Sistema POS | ACT-POS | Recibe eventos de alerta y bloqueo desde Nova. |
| Dispositivo Biometrico | ACT-BIO | Hardware local por tienda. Captura y valida huellas via SDK/API del fabricante. |

---

## 4. CASOS DE USO

### CU-01: Enrolamiento de Huella Dactilar

**Actor principal:** Administrador del Sistema / Gerente de Tienda
**Actor secundario:** Empleado, Dispositivo Biometrico
**Precondiciones:**
- El empleado existe en Nova con estado activo.
- El dispositivo biometrico esta operativo y conectado.
- El usuario tiene permiso de enrolamiento.

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | GT / ADM | Accede a Marcaciones > Enrolamiento Biometrico. |
| 2 | Sistema | Muestra formulario de busqueda de empleado. |
| 3 | GT / ADM | Busca al empleado por nombre o codigo. |
| 4 | Sistema | Muestra datos del empleado y estado de huella (Sin registro / Registrada). |
| 5 | GT / ADM | Selecciona al empleado y hace clic en "Iniciar Enrolamiento". |
| 6 | Sistema | Envia comando al dispositivo biometrico. |
| 7 | Empleado | Coloca el dedo en el lector. |
| 8 | Dispositivo | Captura la huella. SDK confirma calidad aceptable. |
| 9 | Sistema | Solicita segunda captura de confirmacion. |
| 10 | Empleado | Coloca el dedo nuevamente. |
| 11 | Dispositivo | Valida coincidencia entre ambas muestras. |
| 12 | Sistema | Almacena la plantilla biometrica localmente en el dispositivo, vinculada al empleado. Registra evento en auditoria. |
| 13 | Sistema | Muestra confirmacion: "Huella registrada exitosamente para [Nombre Empleado]". |

**Flujos alternativos:**

- FA-01A: Baja calidad de captura. Solicita reintento. Maximo 3 intentos antes de error de dispositivo.
- FA-01B: Huella ya registrada. Solicita confirmacion explicita de re-enrolamiento. Reemplaza plantilla anterior con registro en auditoria.
- FA-01C: Empleado no encontrado. Muestra error y no permite continuar.
- FA-01D: Dispositivo no disponible. Muestra error de conexion.

---

### CU-02: Marcacion de Entrada con Huella

**Actor principal:** Empleado
**Precondiciones:**
- El empleado tiene huella registrada en el dispositivo local.
- El dispositivo esta operativo.
- Se esta dentro de la ventana de tolerancia de entrada (parametrizable).

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | Empleado | Coloca el dedo en el dispositivo biometrico. |
| 2 | Dispositivo | Captura la huella y envia lectura a Nova via SDK/API. |
| 3 | Sistema | Identifica al empleado por la plantilla biometrica local y ATRIBUYE la marcacion al DUENO DE LA HUELLA, no al usuario con la sesion del kiosko abierta (RN-17, H-14). |
| 4 | Sistema | Consulta a RMS el estado de programacion activa del empleado para la fecha. |
| 5 | Sistema | Si RMS no responde: muestra mensaje "Error de conexion. Por favor reintente." No registra marcacion. |
| 6 | Sistema | Si no hay bloqueo activo: registra marcacion de ENTRADA con timestamp, tienda y empleado (dueno de la huella). |
| 7 | Sistema | Compara la hora real contra el horario teorico de entrada (RMS) y senaliza la marcacion: TARDANZA si la entrada es posterior al horario + tolerancia, o ENTRADA_ANTICIPADA si es anterior a la ventana permitida (RN-18, H-17). La senalizacion alimenta las alertas y el Reporte de Asistencia. |
| 8 | Sistema | Devuelve confirmacion al dispositivo. |

**Flujos alternativos:**

- FA-02A: Huella no reconocida. Permite reintento. Si persiste, debe acudir al GT.
- FA-02B: Empleado con programacion activa. Ver CU-04.
- FA-02C: Empleado sin huella registrada. Muestra mensaje para acudir al GT.
- FA-02D: Marcacion duplicada. Advierte y no registra nueva entrada.
- FA-02E: Fuera de ventana de tolerancia (anticipada o tardia). La marcacion se registra y se SENALIZA como ENTRADA_ANTICIPADA o TARDANZA segun corresponda (RN-18). El sistema informa el horario teorico. (La marcacion anticipada y la tardanza no se rechazan: se registran y senalizan para alertas y reporte; la marcacion fuera de un limite duro parametrizable puede bloquearse segun RN-15.)

---

### CU-03: Marcacion de Salida con Huella

**Actor principal:** Empleado
**Precondiciones:**
- El empleado tiene una marcacion de entrada activa en el dia.
- Se esta dentro de la ventana de tolerancia de salida (parametrizable).

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | Empleado | Coloca el dedo en el dispositivo biometrico. |
| 2 | Dispositivo | Captura la huella y envia lectura a Nova. |
| 3 | Sistema | Identifica al empleado y ATRIBUYE la marcacion al dueno de la huella, no a la sesion del kiosko (RN-17, H-14). |
| 4 | Sistema | Detecta entrada activa sin salida. Determina accion: SALIDA. |
| 5 | Sistema | Registra marcacion de SALIDA con timestamp. Calcula horas trabajadas. Senaliza salida anticipada o tardia segun el horario teorico (RN-18). |
| 6 | Sistema | Devuelve confirmacion al dispositivo. |

**Flujos alternativos:**

- FA-03A: Sin entrada previa. Muestra error. GT debe resolver.
- FA-03B: Salida tardia de personal part-time. Registra salida con marca "salida tardia" y libera bloqueo POS si estaba activo.

---

### CU-04: Bloqueo de Marcacion por Programacion Activa

**Actor principal:** Sistema Nova (automatico)
**Precondiciones:**
- El empleado intenta marcar.
- Existe programacion activa (descanso, compensacion o traslado) para ese empleado en la fecha.

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | Sistema | Durante la marcacion, consulta estado de programacion del empleado en RMS. |
| 2 | Sistema | Detecta programacion activa. |
| 3 | Sistema | Bloquea el registro. |
| 4 | Sistema | Muestra en dispositivo: "Marcacion no permitida. [Nombre] tiene [tipo de programacion] activo. Comuniquese con su Gerente Zonal." |
| 5 | Sistema | Registra intento bloqueado en auditoria. |

**Flujo alternativo:**
- FA-04A: Si existe codigo de autorizacion zonal vigente para ese empleado, no se activa el bloqueo. Ver CU-05.

---

### CU-05: Autorizacion de Marcacion por Codigo Zonal

**Actor principal:** Gerente Zonal (desde web o app movil)
**Precondiciones:**
- El empleado tiene programacion activa que bloquea su marcacion.
- El GZ tiene permisos para emitir autorizaciones.

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | GZ | Accede a Marcaciones > Autorizaciones Zonales (web o app movil). El codigo de autorizacion zonal es el MECANISMO ÚNICO de excepcion (compuerta de anulacion de programacion) compartido por todos los modulos que lo usan (Descansos, Vacaciones): fuente unica generada por el GZ (RN-20, H-15). |
| 2 | Sistema | Muestra formulario de emision. |
| 3 | GZ | Selecciona empleado, tienda de destino, fecha(s) y registra motivo obligatorio. |
| 4 | GZ | Confirma la emision. |
| 5 | Sistema | Genera codigo unico de uso limitado (una entrada + una salida por fecha autorizada). |
| 6 | Sistema | Registra en la AUDITORIA de anulacion/reprogramacion: quien emitio, cuando, el codigo, el empleado y el motivo (RN-21, H-16). |
| 7 | Sistema | Muestra el codigo al GZ para que lo comunique por su propio canal. |
| 8 | Empleado | Al marcar, el sistema detecta el codigo activo y permite la marcacion (excepcion de la programacion). |
| 9 | Sistema | Registra marcacion como "con autorizacion zonal" y la anulacion/reprogramacion de la programacion en auditoria. Consume el codigo. |

**Flujos alternativos:**
- FA-05A: Codigo expirado. Bloquea marcacion e informa que la autorizacion vencio.
- FA-05B: Codigo ya utilizado. Rechaza marcacion.
- FA-05C: GZ cancela autorizacion emitida. El codigo queda invalido.

---

### CU-06: Alerta Windows de Inasistencia

**Actor principal:** Sistema Nova (agente en Windows de tienda)
**Precondiciones:**
- Existen empleados activos sin marcacion de entrada en la fecha actual.
- El horario parametrizado de alerta ha llegado.
- El agente de Nova esta instalado y activo en la maquina Windows.

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | Sistema | El agente evalua periodicamente, segun horarios parametrizados, si hay empleados sin entrada. |
| 2 | Sistema | Detecta empleados pendientes y EXCLUYE de las alertas a quienes tengan una ausencia programada de cualquier tipo: descanso, compensacion, vacaciones, licencia (medica/LSGH/LCGH) o traslado. "Sin marcacion" NO se cuenta a quien tiene ausencia programada (RN-19, H-18). |
| 3 | Sistema | Lanza notificacion emergente nativa de Windows: "[N] empleados sin marcacion — Tienda [nombre]" (solo cuenta empleados realmente pendientes, sin ausencia programada). |
| 4 | GT | Hace clic en la notificacion. |
| 5 | Sistema | Abre el modulo web de Gestion de Inasistencia filtrado por tienda y fecha actual. Ver CU-07. |

**Flujos alternativos:**
- FA-06A: Sin empleados pendientes. No genera notificacion.
- FA-06B: GT no hace clic. La notificacion persiste en Centro de Notificaciones. Se reevalua en el siguiente horario parametrizado.
- FA-06C: Agente no disponible. El ADM recibe alerta de error. Se notifica por correo como canal alternativo.

---

### CU-07: Gestion de Inasistencia desde Alerta

**Actor principal:** Gerente de Tienda
**Precondiciones:**
- Existen empleados sin marcacion de entrada para la fecha actual.

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | Sistema | Muestra listado de empleados activos sin entrada: nombre, cargo, turno teorico, estado. Los empleados con ausencia programada (descanso/vacaciones/licencia/traslado) NO aparecen como inasistencia: se muestran con su estado de ausencia programada y se excluyen de las alertas (RN-19, H-18). |
| 2 | Sistema | Por cada empleado pendiente muestra 2 acciones: "Registrar Falta" y "Registrar Descanso". |
| 3 | GT | Para empleado sin justificacion: clic en "Registrar Falta". |
| 4 | Sistema | Solicita MOTIVO obligatorio y muestra confirmacion: "Confirma registrar falta para [Nombre] el [Fecha]?" (RN-22, H-19). |
| 5 | GT | Ingresa el motivo y confirma. |
| 6 | Sistema | Registra la falta con motivo y deja registro en AUDITORIA (usuario, fecha/hora, motivo). Actualiza estado del empleado en el listado (RN-22). |
| 7 | GT | Para otro empleado: clic en "Registrar Descanso". |
| 8 | Sistema | Solicita MOTIVO obligatorio y navega al modulo de Descansos con el empleado pre-filtrado; el registro manual queda auditado (RN-22). |
| 9 | Sistema | Al volver, si el descanso fue registrado, el empleado desaparece del listado pendiente. |

**Flujos alternativos:**
- FA-07A: GT cancela confirmacion. No se registra nada.
- FA-07B: Listado vacio. Muestra "Todos los empleados han sido gestionados".
- FA-07C: Empleado marca mientras GT visualiza el listado. El listado se actualiza en tiempo real.

---

### CU-08: Alerta de Salida Part-Time en POS

**Actor principal:** Sistema Nova (servicio de alertas)
**Precondiciones:**
- Existe personal part-time con turno activo sin marcacion de salida.
- La hora teorica de salida (sincronizada en tiempo real desde RMS) esta proxima o vencida.

**Flujo normal — Alertas previas (no bloqueantes):**

| Paso | Actor | Accion |
|---|---|---|
| 1 | Sistema | Monitorea horarios teoricos de salida del personal part-time activo. |
| 2 | Sistema | A los 10 minutos antes de la salida teorica: envia evento al POS. |
| 3 | POS | Muestra ventana emergente NO bloqueante en todas las computadoras: "Alerta: [Nombre] tiene salida en 10 minutos." |
| 4 | Sistema | Repite a los 5 minutos y a 1 minuto si el empleado aun no registro salida. |
| 5 | Empleado PT | Registra salida en el dispositivo biometrico. Sistema cancela alertas pendientes. |

**Flujo alternativo — Bloqueo individual por no marcacion:**

| Paso | Actor | Accion |
|---|---|---|
| FA-08A-1 | Sistema | Llega hora limite sin salida registrada del empleado. |
| FA-08A-2 | Sistema | Envia evento de bloqueo individual al POS. |
| FA-08A-3 | POS | Bloquea proceso de venta en todas las cajas mostrando: "[Nombre] no ha registrado su salida." |
| FA-08A-4 | Sistema | Si el bloqueo supera el tiempo parametrizable sin resolverse, notifica al GZ. |
| FA-08A-5 | Empleado PT | Registra salida. Sistema envia evento de desbloqueo al POS. |
| FA-08A-6 | POS | Desbloquea el proceso de venta. |

**Flujo alternativo — Desbloqueo manual:**
- FA-08B: GT o ADM puede desbloquear manualmente desde Nova si el dispositivo falla. Requiere motivo obligatorio. Queda en auditoria.

---

### CU-09: Modificacion de Marcacion por Administracion de Ventas

**Actor principal:** Administracion de Ventas
**Precondiciones:**
- La marcacion a modificar pertenece a la semana en curso.
- El usuario tiene rol ROL-AV.

**Flujo normal:**

| Paso | Actor | Accion |
|---|---|---|
| 1 | AV | Accede al historial de marcaciones filtrado por tienda, empleado y fecha. |
| 2 | AV | Selecciona la marcacion a corregir. |
| 3 | Sistema | Muestra los datos actuales de la marcacion. |
| 4 | AV | Realiza la modificacion (hora, tipo) e ingresa motivo obligatorio. |
| 5 | AV | Confirma el cambio. |
| 6 | Sistema | Actualiza la marcacion. Registra en auditoria: usuario, fecha/hora de modificacion, valor anterior y valor nuevo. |

---

## 5. REGLAS DE NEGOCIO

**RN-01:** La semana laboral va de DOMINGO a SABADO (parametrizable por empresa). Todos los calendarios, grillas y agrupaciones semanales del modulo (reporte de asistencia, alertas) se anclan a DOMINGO, consistente con el resto de Nova (H-01).

**RN-02:** Un empleado con programacion activa de descanso, compensacion o traslado NO puede registrar marcacion, salvo que exista un codigo de autorizacion zonal vigente.

**RN-03:** Si RMS no responde al momento de validar la marcacion, el sistema muestra mensaje de reintento y NO registra la marcacion (fail-closed).

**RN-04:** El codigo de autorizacion zonal es emitido exclusivamente por el GZ (desde web o app movil). Es de uso unico por jornada. Tiene vigencia limitada a las fechas autorizadas. Una vez consumido o expirado, no puede reactivarse. Es la FUENTE ÚNICA del mecanismo de excepcion: el mismo codigo zonal centralizado se usa en todos los modulos que requieren anular una programacion para habilitar marcacion (Descansos RN-DESC-55, Vacaciones) (RN-20, H-15).

**RN-05:** No se puede registrar doble entrada sin salida previa cerrada para la misma jornada.

**RN-06:** No se puede registrar salida sin entrada previa activa en la misma jornada.

**RN-07:** Los horarios de alerta de inasistencia son parametrizables por el ADM (hora y dias de la semana).

**RN-08:** Se consideran para la alerta de inasistencia unicamente los empleados activos con turno asignado, EXCLUYENDO a quienes tengan una ausencia programada de cualquier tipo: descanso, compensacion, vacaciones, licencia (medica/LSGH/LCGH) o traslado. El estado de ausencia programada se muestra en lugar de "sin marcacion" (ver RN-19).

**RN-09:** Las alertas de salida en POS aplican exclusivamente al personal part-time. El horario teorico de salida se sincroniza en tiempo real desde RMS.

**RN-10:** El bloqueo de POS es individual por empleado. Cada empleado con salida pendiente genera su propio bloqueo independiente.

**RN-11:** El tiempo antes de notificar al GZ por bloqueo de POS sin resolver es parametrizable. La notificacion a GG tambien es configurable.

**RN-12:** Las plantillas biometricas son locales al dispositivo de cada tienda. En traslados, la plantilla del empleado se replica al dispositivo de la tienda destino antes del inicio del traslado.

**RN-13:** El re-enrolamiento requiere confirmacion explicita. Reemplaza la plantilla anterior con registro en auditoria.

**RN-14:** Solo Administracion de Ventas puede modificar marcaciones, unicamente dentro de la semana en curso. Toda modificacion queda en auditoria con valor anterior, valor nuevo y motivo.

**RN-15:** Tolerancia de marcacion (parametrizable):
- Entrada: se permite marcar X minutos antes del horario de entrada.
- Salida: se permite marcar X minutos despues del horario de salida.
- Fuera de la ventana de tolerancia, el sistema no acepta la marcacion.

**RN-16:** Todo evento relevante del modulo queda registrado en auditoria: usuario, fecha, hora, tienda y descripcion del evento.

**RN-17:** ATRIBUCION POR HUELLA (H-14): la marcacion se atribuye SIEMPRE al colaborador dueno de la huella identificada por el dispositivo biometrico, NO al usuario (p. ej. GT) que tenga la sesion del kiosko abierta. El identificador del empleado en la marcacion proviene de la plantilla biometrica que coincide, independientemente de la sesion activa en la maquina.

**RN-18:** DETECCION DE TARDANZA Y MARCACION ANTICIPADA (H-17): al registrar una marcacion, el sistema compara la hora real contra el horario teorico (sincronizado desde RMS) y la senaliza como TARDANZA (entrada posterior al horario + tolerancia), ENTRADA_ANTICIPADA (entrada anterior a la ventana permitida) o salida anticipada/tardia segun corresponda. Estas senalizaciones alimentan las "Alertas de Marcaciones" y el Reporte de Asistencia. Las tolerancias son parametrizables (RN-15).

**RN-19:** EXCLUSION DE AUSENCIAS JUSTIFICADAS DEL "SIN MARCACION" (H-18): un empleado con una ausencia programada de cualquier tipo (descanso, compensacion, vacaciones, licencia medica/LSGH/LCGH o traslado) NO se contabiliza como "sin marcacion" ni genera alerta de inasistencia. El sistema muestra el estado de ausencia programada en su lugar y EXCLUYE a esos empleados de la lista de alertas. La fuente de la ausencia es el motor unico de ausencias programadas (Descansos/Vacaciones) y los traslados.

**RN-20:** CODIGO ZONAL COMO COMPUERTA DE EXCEPCION CON FUENTE ÚNICA (H-15): el codigo de autorizacion zonal es el mecanismo unico para anular/exceptuar una programacion y habilitar la marcacion. Es generado por el GZ (fuente unica) y es el mismo mecanismo centralizado consumido por Descansos (RN-DESC-55) y Vacaciones. No existen mecanismos paralelos de excepcion.

**RN-21:** AUDITORIA DE ANULACION/REPROGRAMACION (H-16): toda anulacion o reprogramacion de una programacion que habilite marcacion queda registrada en una auditoria especifica que captura QUIEN (usuario emisor/ejecutor), CUANDO (timestamp), el CODIGO de autorizacion zonal utilizado, el empleado, la tienda y el motivo. Esta auditoria es consultable por ADM, GG y AV.

**RN-22:** MOTIVO OBLIGATORIO Y AUDITORIA EN ACCIONES MANUALES (H-19): el registro manual de una Falta o de un Descanso desde "Alertas de Marcaciones"/Gestion de Inasistencia requiere MOTIVO OBLIGATORIO. La accion queda registrada en auditoria con usuario, fecha/hora, empleado y motivo. Sin motivo, el sistema no permite confirmar el registro.

---

## 6. ESTADOS Y TRANSICIONES DE UNA JORNADA LABORAL

### 6.1 Estados posibles

| Estado | Descripcion |
|---|---|
| SIN_MARCACION | Estado inicial de cada jornada. El empleado no ha registrado entrada. |
| ENTRADA_REGISTRADA | Marcacion de entrada registrada correctamente. |
| JORNADA_CERRADA | Entrada y salida registradas. Jornada completa. |
| FALTA | GT registro manualmente la inasistencia. |
| DESCANSO | Descanso vinculado desde el modulo de Descansos. |
| BLOQUEADO_PROGRAMACION | Intento de marcacion bloqueado por programacion activa. |
| AUTORIZADO_ZONAL | Codigo de autorizacion zonal activo. Puede marcar pese a programacion activa. |
| SALIDA_TARDIA | Empleado part-time registro salida despues de la hora limite. |
| AUSENCIA_PROGRAMADA | El empleado tiene una ausencia programada (descanso, vacaciones, licencia o traslado) para la jornada. NO cuenta como "sin marcacion" ni genera alerta de inasistencia (RN-19, H-18). |

**Marcas/senalizaciones sobre la marcacion (no estados terminales; H-17):**

| Marca | Descripcion |
|---|---|
| TARDANZA | La entrada se registro despues del horario teorico + tolerancia. Alimenta alertas y reporte (RN-18). |
| ENTRADA_ANTICIPADA | La entrada se registro antes de la ventana permitida. Alimenta alertas y reporte (RN-18). |

### 6.2 Tabla de transiciones

| Desde | Hacia | Condicion |
|---|---|---|
| SIN_MARCACION | ENTRADA_REGISTRADA | Huella valida, sin programacion activa o con autorizacion zonal |
| SIN_MARCACION | BLOQUEADO_PROGRAMACION | Huella valida, programacion activa sin autorizacion |
| BLOQUEADO_PROGRAMACION | AUTORIZADO_ZONAL | GZ emite codigo valido |
| AUTORIZADO_ZONAL | ENTRADA_REGISTRADA | Empleado marca con codigo activo |
| ENTRADA_REGISTRADA | JORNADA_CERRADA | Marcacion de salida dentro de tolerancia |
| ENTRADA_REGISTRADA | SALIDA_TARDIA | Empleado part-time marca salida fuera de hora limite |
| SIN_MARCACION | FALTA | GT registra falta manualmente con motivo obligatorio (RN-22) |
| SIN_MARCACION | DESCANSO | GT registra descanso desde modulo de gestion con motivo obligatorio (RN-22) |
| SIN_MARCACION | AUSENCIA_PROGRAMADA | El empleado tiene ausencia programada (descanso/vacaciones/licencia/traslado); se excluye de alertas (RN-19) |

> Nota (H-14): en todas las transiciones originadas por marcacion biometrica, el sujeto de la transicion es el DUENO DE LA HUELLA, no la sesion del kiosko (RN-17).
> Nota (H-17): las marcas TARDANZA / ENTRADA_ANTICIPADA se aplican sobre ENTRADA_REGISTRADA y sobre la marcacion de salida segun corresponda; no son estados terminales sino senalizaciones que alimentan alertas y reporte.

---

## 7. ENTIDADES Y ATRIBUTOS PRINCIPALES

### 7.1 Marcacion

| Atributo | Tipo | Descripcion |
|---|---|---|
| id_marcacion | UUID | Identificador unico |
| id_empleado | FK | Referencia al maestro de empleados. Es el DUENO DE LA HUELLA identificada, no la sesion del kiosko (RN-17, H-14) |
| id_tienda | FK | Tienda donde se registro |
| fecha | DATE | Fecha de la marcacion |
| hora | TIMESTAMP | Hora exacta |
| tipo | ENUM | ENTRADA / SALIDA |
| metodo | ENUM | BIOMETRICO / MANUAL |
| estado | ENUM | Ver seccion 6.1 |
| id_autorizacion_zonal | FK (nullable) | Si aplica |
| es_tardanza | BOOLEAN | True si la entrada se registro despues del horario teorico + tolerancia (RN-18, H-17) |
| es_anticipada | BOOLEAN | True si la entrada se registro antes de la ventana permitida (RN-18, H-17) |
| es_tardia | BOOLEAN | True si salida part-time despues de hora limite |
| id_usuario_modificacion | FK (nullable) | Usuario que modifico (AV) |
| motivo_modificacion | TEXT (nullable) | Obligatorio en modificaciones |
| valor_hora_anterior | TIMESTAMP (nullable) | Para auditoria de modificaciones |
| origen | ENUM | DISPOSITIVO / MANUAL |
| created_at | TIMESTAMP | Fecha/hora de creacion |

### 7.2 Plantilla Biometrica

| Atributo | Tipo | Descripcion |
|---|---|---|
| id_plantilla | UUID | Identificador unico |
| id_empleado | FK | Empleado |
| id_dispositivo | FK | Dispositivo local donde esta almacenada |
| id_tienda | FK | Tienda del dispositivo |
| fecha_enrolamiento | TIMESTAMP | Fecha y hora del enrolamiento |
| id_usuario_enrolador | FK | Usuario que enrolo |
| activa | BOOLEAN | True si es la plantilla vigente |
| version | INT | Incrementa con re-enrolamientos |
| es_replicada | BOOLEAN | True si fue replicada desde otra tienda (traslado) |
| id_tienda_origen | FK (nullable) | Tienda origen en caso de replicacion |

### 7.3 Autorizacion Zonal

| Atributo | Tipo | Descripcion |
|---|---|---|
| id_autorizacion | UUID | Identificador unico |
| codigo | STRING | Codigo unico generado |
| id_empleado | FK | Empleado autorizado |
| id_tienda_destino | FK | Tienda donde se habilita la marcacion |
| id_gz_emisor | FK | GZ que emitio |
| fecha_desde | DATE | Inicio de vigencia |
| fecha_hasta | DATE | Fin de vigencia |
| motivo | TEXT | Motivo obligatorio |
| estado | ENUM | ACTIVA / CONSUMIDA / EXPIRADA / CANCELADA |
| canal_emision | ENUM | WEB / APP_MOVIL |
| created_at | TIMESTAMP | Fecha de creacion |

### 7.4 Registro de Inasistencia

| Atributo | Tipo | Descripcion |
|---|---|---|
| id_inasistencia | UUID | Identificador unico |
| id_empleado | FK | Empleado ausente |
| id_tienda | FK | Tienda |
| fecha | DATE | Fecha |
| tipo | ENUM | FALTA / DESCANSO |
| id_gt_registro | FK | GT que registro |
| motivo | TEXT | Motivo OBLIGATORIO del registro manual de Falta/Descanso (RN-22, H-19) |
| id_descanso | FK (nullable) | Referencia al modulo de Descansos |
| created_at | TIMESTAMP | Fecha de creacion |

### 7.4B Auditoria de Anulacion / Reprogramacion de Programacion (H-16)

| Atributo | Tipo | Descripcion |
|---|---|---|
| id_auditoria | UUID | Identificador unico |
| id_empleado | FK | Empleado afectado |
| id_tienda | FK | Tienda |
| accion | ENUM | ANULACION / REPROGRAMACION |
| id_usuario | FK | Usuario que ejecuto/emitio (QUIEN) |
| fecha_hora | TIMESTAMP | Momento del evento (CUANDO) |
| id_autorizacion_zonal | FK (nullable) | Codigo de autorizacion zonal utilizado (CODIGO) |
| motivo | TEXT | Motivo de la anulacion/reprogramacion |
| fecha_programacion_origen | DATE (nullable) | Fecha de la programacion anulada/reprogramada |
| fecha_programacion_nueva | DATE (nullable) | Nueva fecha en caso de reprogramacion |

### 7.5 Parametro de Alerta de Inasistencia

| Atributo | Tipo | Descripcion |
|---|---|---|
| id_parametro | UUID | Identificador unico |
| hora_alerta | TIME | Hora de evaluacion |
| dias_semana | ARRAY | Dias aplicables (0=Domingo a 6=Sabado) |
| tolerancia_entrada_minutos | INT | Minutos antes del turno que se permite marcar entrada |
| tolerancia_salida_minutos | INT | Minutos despues del turno que se permite marcar salida |
| activo | BOOLEAN | Si el parametro esta vigente |
| id_tienda | FK (nullable) | Null = global; con valor = especifico por tienda |

### 7.6 Evento de Alerta POS

| Atributo | Tipo | Descripcion |
|---|---|---|
| id_evento | UUID | Identificador unico |
| id_empleado | FK | Empleado part-time involucrado |
| id_tienda | FK | Tienda |
| tipo_evento | ENUM | ALERTA_10MIN / ALERTA_5MIN / ALERTA_1MIN / BLOQUEO / DESBLOQUEO_AUTO / DESBLOQUEO_MANUAL |
| fecha_evento | TIMESTAMP | Fecha y hora del evento |
| tiempo_bloqueo_minutos_parametro | INT | Tiempo configurado para notificar al GZ |
| id_usuario_desbloqueo | FK (nullable) | Usuario que desbloqueo manualmente |
| motivo_desbloqueo | TEXT (nullable) | Obligatorio en desbloqueo manual |

---

## 8. PERMISOS POR ROL

| Accion | ADM | GT | GZ | AV | GG |
|---|---|---|---|---|---|
| Enrolar huella | SI | SI | NO | NO | NO |
| Re-enrolar huella | SI | SI | NO | NO | NO |
| Ver marcaciones de su tienda | SI | SI | NO | NO | NO |
| Ver marcaciones de su zona | SI | NO | SI | NO | NO |
| Ver marcaciones de todas las tiendas | SI | NO | NO | SI | SI |
| Modificar marcaciones (semana en curso) | SI | NO | NO | SI | NO |
| Emitir codigo de autorizacion zonal (web) | SI | NO | SI | NO | NO |
| Emitir codigo de autorizacion zonal (app) | NO | NO | SI | NO | NO |
| Cancelar autorizacion zonal | SI | NO | SI (propia) | NO | NO |
| Registrar falta manualmente | SI | SI | NO | NO | NO |
| Derivar a modulo Descansos | SI | SI | NO | NO | NO |
| Configurar parametros de alerta | SI | NO | NO | NO | NO |
| Configurar tolerancias de marcacion | SI | NO | NO | NO | NO |
| Desbloquear POS manualmente | SI | SI | NO | NO | NO |
| Ver log de auditoria completo | SI | NO | NO | NO | SI |
| Ver reportes de asistencia | SI | SI (tienda) | SI (zona) | SI | SI |

---

## 9. INTEGRACIONES

### 9.1 Hardware Biometrico (Lectora de Huella Digital Persona)

| Campo | Detalle |
|---|---|
| Tipo | SDK/API del fabricante |
| Almacenamiento | Plantillas locales en el dispositivo de cada tienda |
| Replicacion en traslados | La plantilla se replica al dispositivo de la tienda destino antes del inicio del traslado |
| Criticidad | ALTA |
| Seguridad | Plantillas almacenadas encriptadas. No se transmiten en texto plano |

### 9.2 Sistema RMS (API externa)

| Campo | Detalle |
|---|---|
| Tipo | API REST |
| Datos consumidos | Estado del empleado, tipo (part-time/full-time), programaciones activas, horario teorico de entrada/salida |
| Sincronizacion horario part-time | Tiempo real (el horario modificado en el dia aplica de inmediato) |
| Contingencia | Si RMS no responde: marcacion bloqueada con mensaje de reintento (fail-closed) |
| Criticidad | ALTA |

### 9.3 Modulo de Descansos y Vacaciones (motor unico de ausencias — interno Nova)

| Campo | Detalle |
|---|---|
| Tipo | Integracion interna |
| Uso | (1) Derivacion desde CU-07 con empleado pre-filtrado. (2) Consulta de ausencias programadas (descanso, compensacion, vacaciones, licencia) para EXCLUIR de las alertas de inasistencia a quienes tengan ausencia justificada y mostrar su estado (RN-19, H-18). (3) El codigo de autorizacion zonal (fuente unica) habilita la marcacion exceptuando una programacion; la anulacion/reprogramacion queda auditada (RN-20, RN-21). |
| Datos recibidos | Confirmacion de descanso registrado y ausencias programadas (tipo, fechas) por empleado. Las vacaciones provienen de ENT-MOD-VAC-001, que bloquea marcacion durante el periodo (RN-VAC-15). |

### 9.4 Modulo de Traslados (interno Nova)

| Campo | Detalle |
|---|---|
| Tipo | Integracion interna |
| Uso | Consulta de traslado activo del empleado para validar bloqueo de marcacion |
| Trigger de replicacion | Al aprobar un traslado, el modulo de Traslados notifica a Marcaciones para replicar la plantilla biometrica |

### 9.5 Sistema POS (interno de tienda)

| Campo | Detalle |
|---|---|
| Tipo | Componente de integracion Nova-POS (a desarrollar) |
| Eventos enviados | ALERTA_10MIN, ALERTA_5MIN, ALERTA_1MIN, BLOQUEO_INDIVIDUAL, DESBLOQUEO |
| Bloqueo | Individual por empleado. Independiente entre empleados |
| Protocolo | A definir en fase tecnica |
| Criticidad | ALTA |

### 9.6 Agente de Notificaciones Windows

| Campo | Detalle |
|---|---|
| Tipo | Servicio instalado en maquinas Windows de tienda |
| Funcion | Consultar Nova periodicamente y lanzar notificaciones nativas de Windows |
| Accion al clic | Abre modulo web de Gestion de Inasistencia con tienda y fecha pre-filtradas |
| Reconexion | Automatica. Reporta errores al sistema central |

### 9.7 App Movil Nova

| Campo | Detalle |
|---|---|
| Uso en este modulo | Solo emision de codigos de autorizacion zonal por el GZ |
| Marcacion desde app | No aplica en este modulo |

### 9.8 PowerApps (Microsoft interno)

| Campo | Detalle |
|---|---|
| Uso | Solo como fuente del dato "Gerente Titular de Tienda" para notificaciones |
| Tipo | Sincronizacion periodica hacia Nova |

---

## 10. VACIOS FUNCIONALES RESUELTOS

| VF | Pregunta | Decision |
|---|---|---|
| VF-01 | Marcacion desde app movil | No aplica. App movil solo habilita emision de codigos de autorizacion zonal |
| VF-02 | Modificacion retroactiva | Solo Administracion de Ventas, dentro de la semana en curso, con motivo obligatorio |
| VF-03 | Fallo de RMS en marcacion | Fail-closed: marcacion bloqueada con mensaje de reintento |
| VF-04 | Rol de OFIPLAN | No interviene. RMS es la fuente de verdad de empleados en este modulo |
| VF-05 | Bloqueo POS multiples empleados | Bloqueo individual por empleado. Independientes entre si |
| VF-06 | Alcance del bloqueo POS | Aplica a todas las computadoras de la tienda sin excepcion |
| VF-07 | Canal del codigo de autorizacion | El GZ comunica el codigo por su propio canal. El sistema solo lo genera y muestra |
| VF-08 | Arquitectura de plantillas biometricas | Plantillas locales en el dispositivo de cada tienda |
| VF-09 | Horario teorico modificado en el dia | Se usa el horario vigente al momento de la evaluacion, sincronizado en tiempo real |
| VF-10 | Replicacion de huella en traslados | La plantilla se replica al dispositivo de la tienda destino antes del inicio del traslado |
| VF-11 | Reportes y exportacion | 6 reportes definidos: asistencia diaria, inasistencias, historial por empleado, autorizaciones zonales, modificaciones AV, bloqueos POS — en pantalla y Excel |
| VF-12 | Notificacion de bloqueo POS a superiores | GZ notificado despues de tiempo parametrizable sin resolver. Notificacion a GG configurable |
| VF-13 | Tolerancia para inasistencia | Tolerancia de entrada y salida parametrizable. Ventana de alerta de 5 minutos (parametrizable) |
| VF-14 | Firma electronica en marcaciones | No aplica en este modulo |
| VF-15 (C-04 / H-14) | Atribucion de la marcacion | La marcacion se atribuye al DUENO DE LA HUELLA, no a la sesion del kiosko. Ver RN-17 |
| VF-16 (C-04 / H-17) | Tardanza y marcacion anticipada | Se detectan y senalizan; alimentan alertas y reporte. Ver RN-18, marcas TARDANZA/ENTRADA_ANTICIPADA |
| VF-17 (C-04 / H-18) | "Sin marcacion" vs ausencia justificada | "Sin marcacion" no cuenta a quien tiene descanso/vacaciones/licencia/traslado programado; se muestra ese estado y se excluye de alertas. Ver RN-19 |
| VF-18 (C-04 / H-15) | Codigo zonal fuente unica | Compuerta unica de excepcion para anular programacion; generado por el GZ; compartido con Descansos/Vacaciones. Ver RN-20 |
| VF-19 (C-04 / H-16) | Auditoria de anulacion/reprogramacion | Registra quien/cuando/codigo/motivo. Ver RN-21 y entidad 7.4B |
| VF-20 (C-04 / H-19) | Motivo en acciones manuales | Registrar Falta/Descanso manual exige motivo obligatorio + auditoria. Ver RN-22 |
| VF-21 (H-01) | Semana domingo-sabado | Calendarios y agrupaciones semanales anclados a domingo. Ver RN-01 |

---

**FIN DE DOCUMENTO**
**ENT-MOD-MARC-001 v1.2 — 31/05/2026**
**Estado: BORRADOR — Pendiente de validacion con stakeholders (reconciliado C-04 / H-01)**
