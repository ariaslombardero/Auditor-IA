# INFORME TÉCNICO PRELIMINAR DE ADECUACIÓN NORMATIVA DE SISTEMA DE INTELIGENCIA ARTIFICIAL

**Entidad Promotora:** Administración Pública Promotora
**Departamento / Servicio:** Área de Régimen Jurídico y Transformación Digital
**Software Evaluado:** "Caso sintético"
**Fecha de Emisión:** 7/10/2026
**Marco Normativo de Referencia:**
- Reglamento (UE) 2024/1689 sobre Inteligencia Artificial (RIA), modificado por el Reglamento (UE) 2026/1744 (Ómnibus digital sobre IA)
- Real Decreto 729/2023, de 22 de agosto (Estatuto de la Agencia Española de Supervisión de Inteligencia Artificial - AESIA)
- Ley 15/2022, de 12 de julio, integral para la igualdad de trato y la no discriminación (Art. 23)
- Esquema Nacional de Seguridad (Real Decreto 311/2022 - ENS)
- Ley 40/2015 de Régimen Jurídico del Sector Público (Arts. 32, 36, 41 y 43)
- Reglamento General de Protección de Datos (RGPD UE 2016/679) y Ley Orgánica 3/2018 (LOPDGDD)

> **⚖️ CLÁUSULA DE SALVAGUARDA Y CALIFICACIÓN PRELIMINAR:**
> *El presente informe técnico ha sido generado mediante una herramienta automatizada de diagnóstico (motor v2.1.0) a partir de lo declarado por el promotor. No es un acto administrativo ni acredita el cumplimiento: la calificación definitiva y la asunción de riesgos corresponden al órgano competente, con la revisión expresa del DPD y del Responsable de Seguridad.*

---

## 1. RESUMEN EJECUTIVO Y CUADRO DE MANDO

- **Clasificación RIA (preliminar, según lo declarado):** **Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50)**
- **Régimen declarado:** **Excepción del Art. 6.3 RIA, pendiente de documentar (Art. 6.4) y registrar (Art. 49.2)**
- **Categoría ENS orientativa (RD 311/2022):** **BASICA**
- **Régimen de operación declarado (Ley 40/2015):** **Apoyo técnico con intervención directa de un empleado público**

### Cuadro de mando (4 pilares)

| Pilar | Fundamento | Estado / Nivel | Estado de acreditación |
| :--- | :--- | :--- | :--- |
| **I. RIA (UE 2024/1689)** | Arts. 3.1, 5, 6 y 50 RIA | Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50) | 12 requisitos sin acreditar |
| **II. Privacidad y RGPD** | RGPD Arts. 6.1, 9, 10 y 30 / LOPDGDD | Pendiente de verificación del DPD | 2 requisitos sin acreditar |
| **III. Ciberseguridad ENS** | RD 311/2022, Anexo II | Categoría ENS BÁSICA (orientativa) | 3 requisitos sin acreditar |
| **IV. Gobernanza pública** | Ley 40/2015 Art. 41 / Ley 15/2022 Art. 23 | Apoyo técnico declarado | 3 requisitos sin acreditar |



### Conclusión preliminar
Diagnóstico preliminar para "Caso sintético": según lo declarado, el sistema se clasifica como Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50). Quedan 20 requisitos sin acreditar. Categoría ENS: BASICA. Las conclusiones se basan en la entrevista y en la documentación aportada; requieren la validación del órgano competente, del Responsable de Seguridad y del Delegado de Protección de Datos.

**PENDIENTE DE VALIDACIÓN.** 20 requisitos sin acreditar. Las conclusiones se basan en lo declarado y deben validarlas el órgano competente, el Responsable de Seguridad y el DPD.

### Recomendaciones
- Documentar la evaluación del Art. 6.3 antes de la puesta en servicio y registrar el sistema en la base de datos de la UE (Arts. 6.4 y 49.2 RIA).
- Implantar los avisos de transparencia (banner y pie de página) del Art. 50 del RIA.
- Asegurar que las credenciales no viajen al navegador; priorizar modelos locales (Ollama/vLLM) en servidores corporativos.
- Someter el expediente técnico a la revisión del Delegado de Protección de Datos (DPD) y del Responsable de Seguridad del ENS.

---

## 2. IDENTIFICACIÓN Y ARQUITECTURA TÉCNICA

- **Denominación:** Caso sintético
- **Objeto funcional:** Herramienta que comprueba si las solicitudes de un proceso selectivo incluyen todos los documentos exigidos
- **Destinatarios principales:** public_employees
- **Pila tecnológica declarada:** No especificada
- **Documentación aportada:** README.md (documentación funcional y de usuario).
- **Modelo de inferencia (declarado):**
  Ejecución local en servidores propios (Ollama / vLLM). No se ha comprobado el proveedor efectivamente utilizado.


---

## 3. PRÁCTICAS PROHIBIDAS (ART. 5 RIA)

«No evaluado» significa que la herramienta no ha examinado la práctica y que debe confirmarse en la revisión jurídica; «Pendiente» indica un indicio que requiere verificación.

| Práctica (Art. 5 RIA) | Estado | Hechos |
| :--- | :---: | :--- |
| **Manipulación subliminal o engañosa que cause perjuicio** (Art. 5.1.a RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |
| **Explotación de vulnerabilidades por edad, discapacidad o situación socioeconómica** (Art. 5.1.b RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |
| **Generación o manipulación de imágenes, vídeos o audios íntimos realistas de personas identificables sin su consentimiento** (Art. 5.1.b bis RIA (Reglamento (UE) 2026/1744)) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Aún no exigible: lo será desde el 2/12/2026. Conviene prepararla antes de la puesta en servicio. |
| **Generación o manipulación de material de abuso sexual infantil (Directiva 2011/93/UE)** (Art. 5.1.b ter RIA (Reglamento (UE) 2026/1744)) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Aún no exigible: lo será desde el 2/12/2026. Conviene prepararla antes de la puesta en servicio. |
| **Puntuación social o clasificación ciudadana general por las autoridades** (Art. 5.1.c RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |
| **Evaluación del riesgo penal de personas individuales sin hechos constatables** (Art. 5.1.d RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |
| **Creación indiscriminada de bases de reconocimiento facial mediante raspado de internet o CCTV** (Art. 5.1.e RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |
| **Inferencia de emociones en el lugar de trabajo o instituciones educativas** (Art. 5.1.f RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |
| **Categorización biométrica para deducir raza, opiniones políticas, creencias religiosas u orientación sexual** (Art. 5.1.g RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |
| **Identificación biométrica remota en tiempo real en espacios de acceso público con fines de garantía del cumplimiento del Derecho** (Art. 5.1.h RIA) | DECLARADO (sin verificar) | Declarado por el promotor que no concurre. Exigible desde el 2/2/2025. |

---

## 4. CLASIFICACIÓN SEGÚN EL RIA (ANEXO III Y EXCEPCIÓN DEL ART. 6.3)

- **Clasificación preliminar, basada en lo declarado:** **RIESGO LIMITADO (EXCEPTUADO DE ALTO RIESGO VÍA ART. 6.3 RIA & ART. 50)**

### 4.1. Fundamento
**Nivel 3 - Excepción del Art. 6.3 RIA:** según lo declarado, el sistema interviene en un ámbito del Anexo III pero se acogería a la excepción del Art. 6.3, que exige que concurra al menos una de sus condiciones a) a d), que no influya sustancialmente en el resultado de la decisión y que no haya perfilado de personas físicas.

### 4.2. Fundamento declarado de la excepción (Art. 6.3 RIA)

> *Excepción del Art. 6.3 invocada por el promotor: letra a) (realizar una tarea de procedimiento limitada). Hechos declarados: «Solo marca si falta alguno de los documentos exigidos en las bases; no valora méritos ni aptitudes.». Declarado que el sistema no influye sustancialmente en el resultado de la decisión y que no elabora perfiles de personas físicas. Debe documentarse antes de la puesta en servicio (Art. 6.4) y registrarse en la base de datos de la UE (Art. 49.2).*

**Pendiente (Arts. 6.4 y 49.2 RIA):** el proveedor debe documentar su evaluación antes de la puesta en servicio, facilitarla a las autoridades que la soliciten y registrar el sistema en la base de datos de la UE. Este informe recoge lo declarado, pero no sustituye esa documentación ni el registro.

### 4.3. Traza de la clasificación
*Corte normativo: Registro de fuentes de 05/10/2026: RIA (Reglamento (UE) 2024/1689) y Reglamento (UE) 2026/1744; Ley 40/2015; Ley 15/2022; RD 729/2023; ENS (RD 311/2022).*

| Paso | Pregunta | Respuesta | Conclusión | Regla y fuente | Límites |
| :--- | :--- | :--- | :--- | :--- | :--- |
| INDICIOS | ¿Qué sugiere la documentación aportada? | Ámbito empleo: «que comprueba si las solicitudes de un proceso selectivo incluyen todos los documentos exigidos» | Indicios para orientar la entrevista. | Los indicios por palabras clave nunca deciden la clasificación ni el estado de un requisito. (Documentación aportada (README, AGENTS.md, descripción)) | Coincidencias de texto con normalización de tildes y exclusión de negaciones; pueden existir falsos positivos y negativos. |
| ART-3-1 | ¿Infiere el sistema, a partir de la información de entrada, la manera de generar resultados de salida (predicciones, contenidos, recomendaciones o decisiones)? | Sí | Es un sistema de IA: se aplica el RIA. | Un sistema de IA es un sistema basado en una máquina que infiere de la información de entrada la manera de generar resultados de salida que pueden influir en entornos físicos o virtuales. (Reglamento (UE) 2024/1689, Art. 3.1) | Respuesta declarada. Debe contrastarse con las capacidades reales del sistema y con las Directrices de la Comisión sobre la definición de sistema de IA. |
| ART-5 | ¿Incurre el sistema en alguna de las prácticas prohibidas del Art. 5? | Declarado que no concurre ninguna | No se declara ninguna práctica prohibida. | Quedan prohibidas la introducción en el mercado, la puesta en servicio y la utilización de sistemas que incurran en las prácticas del Art. 5.1. (Reglamento (UE) 2024/1689, Art. 5 (letras b bis y b ter añadidas por el Reglamento (UE) 2026/1744)) | Respuestas declaradas. Los indicios de la documentación solo orientan la revisión: no deciden. |
| ANEXO-III | ¿En qué ámbito del Anexo III se utiliza el sistema? | Anexo III, punto 4: empleo, gestión de los trabajadores y acceso al autoempleo | En el ámbito del Anexo III. | Son de alto riesgo los sistemas de IA mencionados en el Anexo III, salvo la excepción del Art. 6.3. (Reglamento (UE) 2024/1689, Art. 6.2 y Anexo III) | Se valora el ámbito declarado; no se comprueban por separado las letras de cada punto del Anexo III. |
| ART-6-3-PERFILADO | ¿Elabora el sistema perfiles de personas físicas (evaluación de aspectos personales como rendimiento, situación económica, fiabilidad o comportamiento)? | No | Sin perfilado: puede valorarse la excepción. | Los sistemas del Anexo III siempre se consideran de alto riesgo cuando elaboran perfiles de personas físicas. (Reglamento (UE) 2024/1689, Art. 6.3, último párrafo, y Art. 3.52 (remite al Art. 4.4 RGPD)) | Comprobar documentos formales (que una solicitud incluya lo exigido) no es, por sí solo, valorar aspectos personales. |
| ART-6-3-CONDICION | ¿Qué condición del Art. 6.3 concurre y por qué? ¿Influye sustancialmente en el resultado de la toma de decisiones? | Condición: letra a) · Influencia sustancial: No · Hechos: Solo marca si falta alguno de los documentos exigidos en las bases; no valora méritos ni aptitudes. | Se acogería a la excepción del Art. 6.3, pendiente de documentar y registrar. | Un sistema del Anexo III no es de alto riesgo si no plantea un riesgo importante, también al no influir sustancialmente en el resultado de la decisión, y concurre cualquiera de las condiciones a) a d). (Reglamento (UE) 2024/1689, Art. 6.3 y 6.4) | Respuestas declaradas. El proveedor debe documentar la evaluación antes de la puesta en servicio. |
| ART-50 | ¿Interactúa directamente con personas físicas? ¿Genera contenido sintético (texto, imagen, audio o vídeo)? | Interacción: Sí · Contenido sintético: Sí | Se aplican obligaciones de transparencia. | Los sistemas destinados a interactuar con personas físicas deben informarles de que interactúan con una IA; el contenido sintético debe marcarse. (Reglamento (UE) 2024/1689, Art. 50) | Se acumula con el resto de obligaciones: no es una categoría alternativa al alto riesgo. |
| CLASIFICACION | Clasificación resultante | Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50) | Clasificación preliminar basada en lo declarado. | Orden de examen: definición de IA (Art. 3.1), prácticas prohibidas (Art. 5), alto riesgo (Art. 6 y Anexo III, con la excepción del Art. 6.3) y transparencia (Art. 50, acumulable). Las respuestas desconocidas o contradictorias impiden concluir. (Reglamento (UE) 2024/1689, Arts. 3.1, 5, 6 y 50) | No sustituye la calificación del órgano competente ni la revisión jurídica. |

---

## 5. SUPERVISIÓN HUMANA Y MARCO ESTATAL DE GOBERNANZA

- **Supervisión humana (declarada):** previa; los resultados se presentan como borradores que revisa un empleado público antes de producir efectos. No se ha verificado el funcionamiento real del procedimiento.
- **Rol del supervisor (declarado):** Técnico de la unidad tramitadora
- **Deslinde con la actuación administrativa automatizada (Ley 40/2015, Art. 41):**
  El promotor declara que un empleado público interviene de forma directa en cada actuación, por lo que no habría actuación administrativa automatizada. Esta afirmación no se ha verificado y debe contrastarse con el funcionamiento real del procedimiento.
- **Responsabilidad patrimonial:**
  Los particulares exigen directamente a la Administración Pública correspondiente la indemnización de las lesiones causadas por el funcionamiento de los servicios públicos, también cuando intervenga este sistema (Arts. 32.1 y 36.1 de la Ley 40/2015). La Administración solo puede exigir responsabilidad a sus autoridades y personal cuando haya concurrido dolo, o culpa o negligencia graves (Art. 36.2).
- **No discriminación algorítmica (Ley 15/2022, Art. 23):**
  Las administraciones públicas favorecerán mecanismos de minimización de sesgos, transparencia y rendición de cuentas, y se promoverán evaluaciones del posible impacto discriminatorio. No se han aportado evaluaciones de sesgo, por lo que este extremo figura como no evaluado.

---

## 6. MEDIDAS DE SEGURIDAD (ENS, RD 311/2022)

- **Categoría ENS orientativa:** **BASICA**
- **Fundamentación:** Categoría según el nivel más alto de las dimensiones valoradas (C: bajo, I: bajo, T: bajo, A: bajo, D: bajo), conforme al Anexo I del RD 311/2022.

### 6.1. Medidas del Anexo II relacionadas con el uso de servicios de IA
1. **Arts. 40 y 41; Anexo I** — DECLARADO (sin verificar): Categoría según el nivel más alto de las dimensiones valoradas (C: bajo, I: bajo, T: bajo, A: bajo, D: bajo), conforme al Anexo I del RD 311/2022.
2. **[op.acc.5] y [op.acc.6] mecanismos de autenticación; [mp.sw.1] desarrollo de aplicaciones** — NO VERIFICADO: Las credenciales deben estar bajo control exclusivo y no exponerse en código cliente ni en repositorios. Esta evaluación no ha examinado el código del sistema auditado.
3. **[op.exp.8] Registro de la actividad; Art. 12 RIA (alto riesgo)** — DECLARADO (sin verificar): Declarado registro de actividad con conservación de 24 meses. No se ha comprobado su existencia ni su contenido.

---

## 7. OBLIGACIONES Y ESTADO DE ACREDITACIÓN

Solo «Acreditado» equivale a cumplimiento y exige validación humana con evidencia. «Declarado» recoge lo afirmado por el promotor sin comprobar.

### Medidas de apoyo a la alfabetización en IA del personal — **NO VERIFICADO**
*Reglamento (UE) 2024/1689, modificado por el Reglamento (UE) 2026/1744 · Art. 4 · Comprobación automática · Exigible desde 2/2/2025*

Proveedores y responsables del despliegue deben adoptar medidas para apoyar la alfabetización en IA de su personal. No se han aportado evidencias de esas medidas. Exigible desde el 2/2/2025.

**Acción:** Documentar la formación o las medidas adoptadas para el personal que usa el sistema.

### Documentación y registro de la excepción del Art. 6.3 — **PENDIENTE**
*Reglamento (UE) 2024/1689, modificado por el Reglamento (UE) 2026/1744 · Arts. 6.3, 6.4 y 49.2; Anexo VIII · Declaración del promotor*

Corresponde a la entidad como proveedora: documentar la evaluación antes de la puesta en servicio (Art. 6.4) y registrar el sistema en la base de datos de la UE (Art. 49.2), registro que mantiene el Reglamento (UE) 2026/1744 con un contenido simplificado del Anexo VIII. La sección 1 del capítulo III (Art. 6) es exigible para el Anexo III desde el 2/12/2027; la fecha del registro debe confirmarse.

**Acción:** Redactar la evaluación motivada (condición del Art. 6.3, hechos y ausencia de perfilado e influencia sustancial) y registrar el sistema.

### Transparencia hacia las personas (interacción con IA y contenido sintético) — **PENDIENTE**
*Reglamento (UE) 2024/1689 · Art. 50 · Declaración del promotor · Exigible desde 2/8/2026*

Declarado: el sistema interactúa con personas o genera contenido. La herramienta no comprueba que la información de transparencia esté implantada. Exigible desde el 2/8/2026.

**Acción:** Implantar el aviso de interacción con IA y el marcado del contenido generado, y conservar evidencia de su implantación.

### Supervisión humana de los resultados — **DECLARADO (sin verificar)**
*Reglamento (UE) 2024/1689; RGPD; Ley 40/2015 · Art. 14 RIA (alto riesgo); Art. 22 RGPD; Art. 41 Ley 40/2015 · Declaración del promotor*

Declarada revisión humana previa por: Técnico de la unidad tramitadora. No se ha comprobado el funcionamiento real del procedimiento.

**Acción:** Documentar quién revisa, en qué momento y con qué capacidad de modificar o descartar el resultado.

### Categorización del sistema según el impacto en cada dimensión — **DECLARADO (sin verificar)**
*ENS (RD 311/2022) · Arts. 40 y 41; Anexo I · Declaración del promotor*

Categoría según el nivel más alto de las dimensiones valoradas (C: bajo, I: bajo, T: bajo, A: bajo, D: bajo), conforme al Anexo I del RD 311/2022.

**Acción:** El responsable de seguridad debe confirmar la valoración de las dimensiones.

### Protección de las credenciales de acceso a servicios de IA — **NO VERIFICADO**
*ENS (RD 311/2022), Anexo II · [op.acc.5] y [op.acc.6] mecanismos de autenticación; [mp.sw.1] desarrollo de aplicaciones · Comprobación automática*

Las credenciales deben estar bajo control exclusivo y no exponerse en código cliente ni en repositorios. Esta evaluación no ha examinado el código del sistema auditado.

**Acción:** Revisar el código y la configuración del sistema auditado; trasladar las claves a un servidor o usar modelos locales.

### Registro de la actividad y trazabilidad — **DECLARADO (sin verificar)**
*ENS (RD 311/2022), Anexo II; Reglamento (UE) 2024/1689 · [op.exp.8] Registro de la actividad; Art. 12 RIA (alto riesgo) · Declaración del promotor*

Declarado registro de actividad con conservación de 24 meses. No se ha comprobado su existencia ni su contenido.

**Acción:** Aportar evidencia del registro (usuario, fecha y hora, objeto, tipo y resultado del evento) y de su política de conservación.

### Base jurídica del tratamiento — **DECLARADO (sin verificar)**
*RGPD (UE 2016/679) · Art. 6.1 · Declaración del promotor*

Declarada la base jurídica: Art. 6.1.e) (misión de interés público o ejercicio de poderes públicos), con fundamento en: Ley 39/2015. No se ha verificado.

**Acción:** El DPD debe verificar la base jurídica y la norma que la sustenta.

### Registro de Actividades de Tratamiento — **DECLARADO (sin verificar)**
*RGPD (UE 2016/679) · Art. 30 · Declaración del promotor*

Declarada la actividad de tratamiento «Apoyo a la gestión documental». Indicar un nombre no acredita su inscripción en el RAT.

**Acción:** El DPD debe verificar la inscripción en el RAT.

### Evaluación de impacto en la protección de datos — **No aplica**
*RGPD (UE 2016/679) · Art. 35; lista de la AEPD (Art. 35.4) · Comprobación automática*

Cribado preliminar: según lo declarado no concurren dos o más criterios.

**Acción:** Completar el borrador de EIPD con el asesoramiento del DPD.

### Actuación administrativa automatizada — **No aplica**
*Ley 40/2015 · Art. 41 · Declaración del promotor*

Declarado que un empleado público interviene de forma directa. Funcionamiento descrito: El técnico revisa y corrige cada borrador antes de incorporarlo al expediente.. No se ha verificado.

**Acción:** Describir el procedimiento real: quién interviene, en qué momento y con qué capacidad de decisión.

### Minimización de sesgos y no discriminación algorítmica — **NO EVALUADO**
*Ley 15/2022 · Art. 23 · Comprobación automática*

Las administraciones públicas favorecerán mecanismos de minimización de sesgos, transparencia y rendición de cuentas, y se promoverán evaluaciones de impacto. No se han aportado evaluaciones de sesgo.

**Acción:** Valorar y documentar una evaluación del posible impacto discriminatorio del sistema.


### 7.1. Datos declarados en materia de protección de datos
- **Norma competencial declarada:** *Ley 39/2015*. La base jurídica del tratamiento (Art. 6.1 RGPD) debe verificarla el DPD.
- **Tratamiento de datos personales (declarado):** sí.
- **Actividad del Registro de Actividades de Tratamiento (declarada):** *Apoyo a la gestión documental*.
- **Categorías especiales de datos (Art. 9 RGPD):** declarado que NO se tratan.
- **Datos relativos a condenas e infracciones penales (Art. 10 RGPD):** declarado que NO se tratan.



---

## NOTA SOBRE LAS FUENTES Y TRAZABILIDAD DEL DOCUMENTO

Los preceptos citados proceden de la base de conocimiento de la herramienta (Registro de fuentes de 05/10/2026: RIA (Reglamento (UE) 2024/1689) y Reglamento (UE) 2026/1744; Ley 40/2015; Ley 15/2022; RD 729/2023; ENS (RD 311/2022)). No se ha verificado su vigencia en el momento de emitir este documento: debe comprobarse en el BOE y en EUR-Lex antes de cualquier uso.

- **Versión del motor:** 2.1.0
- **Huella SHA-256 de las entradas (ingesta y entrevista):** 002d3df1afdd8fe0ddfaed7949277987142dcff7833387ac9486006b8c6a44e2 (permite comprobar que dos documentos parten de las mismas entradas; no acredita la integridad del documento)
- **Fecha de generación:** 2026-10-07T18:03:44.424Z
- **Asistencia de IA:** No se usó ningún modelo de IA: el diagnóstico procede solo del motor determinista.

---

## REVISIÓN Y FIRMA

> *El presente documento es un informe técnico preliminar generado con una herramienta automatizada. No es un acto administrativo ni una actuación administrativa automatizada. Solo adquiere valor cuando lo revisan y firman los responsables competentes, que pueden modificar o rechazar sus conclusiones (firma electrónica del personal, Art. 43 de la Ley 40/2015).*

| EL RESPONSABLE FUNCIONAL | EL RESPONSABLE DE SEGURIDAD (ENS) | EL DELEGADO DE PROTECCIÓN DE DATOS |
| :---: | :---: | :---: |
| *(Firma electrónica)* | *(Firma electrónica)* | *(Firma electrónica)* |
| **Jefatura de Servicio Responsable** | **Responsable de Seguridad ENS (CISO)** | **Delegado de Protección de Datos (DPD / DPO)** |
| Área de Régimen Jurídico y Transformación Digital | Centro de Sistemas y Ciberseguridad | Oficina de Protección de Datos |
