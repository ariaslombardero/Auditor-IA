# INFORME TÉCNICO PRELIMINAR DE ADECUACIÓN NORMATIVA DE SISTEMA DE INTELIGENCIA ARTIFICIAL

**Entidad Promotora:** Administración Pública Promotora
**Departamento / Servicio:** Área de Régimen Jurídico y Transformación Digital
**Software Evaluado:** "OasisMadrid"
**Fecha de Emisión:** 13/10/2026
**Marco Normativo de Referencia:**
- Reglamento (UE) 2024/1689 sobre Inteligencia Artificial (RIA), modificado por el Reglamento (UE) 2026/1744 (Ómnibus digital sobre IA)
- Real Decreto 729/2023, de 22 de agosto (Estatuto de la Agencia Española de Supervisión de Inteligencia Artificial - AESIA)
- Ley 15/2022, de 12 de julio, integral para la igualdad de trato y la no discriminación (Art. 23)
- Esquema Nacional de Seguridad (Real Decreto 311/2022 - ENS)
- Ley 40/2015 de Régimen Jurídico del Sector Público (Arts. 32, 36, 41 y 43)
- Reglamento General de Protección de Datos (RGPD UE 2016/679) y Ley Orgánica 3/2018 (LOPDGDD)

> **⚖️ CLÁUSULA DE SALVAGUARDA Y CALIFICACIÓN PRELIMINAR:**
> *El presente informe técnico ha sido generado mediante una herramienta automatizada de diagnóstico (motor v2.2.1) a partir de lo declarado por el promotor. No es un acto administrativo ni acredita el cumplimiento: la calificación definitiva y la asunción de riesgos corresponden al órgano competente, con la revisión expresa del DPD y del Responsable de Seguridad.*

---

## 1. RESUMEN EJECUTIVO Y CUADRO DE MANDO

- **Clasificación RIA (preliminar, según lo declarado):** **EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado**
- **Categoría ENS orientativa (RD 311/2022):** **MEDIA**
- **Régimen de operación declarado (Ley 40/2015):** **No produce actos ni actuaciones administrativas (declarado)**

### Cuadro de mando (4 pilares)

| Pilar | Fundamento | Estado / Nivel | Estado de acreditación |
| :--- | :--- | :--- | :--- |
| **I. RIA (UE 2024/1689)** | Arts. 3.1, 5, 6 y 50 RIA | EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado | Sin requisitos evaluados |
| **II. Privacidad y RGPD** | RGPD Arts. 6.1, 9, 10 y 30 / LOPDGDD | Pendiente de verificación del DPD | 4 requisitos por validar |
| **III. Ciberseguridad ENS** | RD 311/2022, Anexo II | Categoría ENS MEDIA (orientativa) | 3 requisitos por validar |
| **IV. Gobernanza pública** | Ley 40/2015 Art. 41 / Ley 15/2022 Art. 23 | Apoyo técnico declarado | 2 requisitos por validar |



### Conclusión preliminar
Diagnóstico preliminar para "OasisMadrid": según lo declarado, el sistema se clasifica como EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado. Faltan 9 respuestas de la entrevista. Quedan 9 requisitos por validar (los acredita una persona con evidencia). Categoría ENS orientativa: MEDIA. Las conclusiones se basan en la entrevista y en la documentación aportada; requieren la validación del órgano competente, del Responsable de Seguridad y del Delegado de Protección de Datos.

**FALTAN RESPUESTAS Y VALIDACIÓN HUMANA.** Quedan 9 respuestas pendientes en la entrevista. 9 requisitos por validar: contestar la entrevista no los acredita; los acredita una persona registrando la validación con su evidencia. Las conclusiones se basan en lo declarado y deben validarlas el órgano competente, el Responsable de Seguridad y el DPD.

### Recomendaciones
- Según lo declarado, el software queda fuera del RIA (Art. 3.1). Contrastar esa declaración con las capacidades reales del sistema y centrar el expediente en el ENS (RD 311/2022) y en la Ley 40/2015.
- Documentar las especificaciones técnicas de las reglas aplicadas.

---

## 2. IDENTIFICACIÓN Y ARQUITECTURA TÉCNICA

- **Denominación:** OasisMadrid
- **Objeto funcional:** Navegador de confort térmico y rutas saludables que combina datos abiertos del Ayuntamiento de Madrid.
- **Destinatarios principales:** public_citizens
- **Pila tecnológica declarada:** axios, cors, dotenv, express, node-cron, papaparse
- **Documentación aportada:** README.md (documentación funcional y de usuario).
- **Modelo de inferencia (declarado):**
  Software basado en reglas predefinidas, sin modelos de inferencia ni APIs de IA (declarado).


---

## 3. PRÁCTICAS PROHIBIDAS (ART. 5 RIA)

«No evaluado» significa que la herramienta no ha examinado la práctica y que debe confirmarse en la revisión jurídica; «Pendiente» indica un indicio que requiere verificación.

| Práctica (Art. 5 RIA) | Estado | Hechos |
| :--- | :---: | :--- |
| **Manipulación subliminal o engañosa que cause perjuicio** (Art. 5.1.a RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |
| **Explotación de vulnerabilidades por edad, discapacidad o situación socioeconómica** (Art. 5.1.b RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |
| **Generación o manipulación de imágenes, vídeos o audios íntimos realistas de personas identificables sin su consentimiento** (Art. 5.1.b bis RIA (Reglamento (UE) 2026/1744)) | PENDIENTE | No consta respuesta. Aún no exigible: lo será desde el 2/12/2026. Conviene prepararla antes de la puesta en servicio. |
| **Generación o manipulación de material de abuso sexual infantil (Directiva 2011/93/UE)** (Art. 5.1.b ter RIA (Reglamento (UE) 2026/1744)) | PENDIENTE | No consta respuesta. Aún no exigible: lo será desde el 2/12/2026. Conviene prepararla antes de la puesta en servicio. |
| **Puntuación social o clasificación ciudadana general por las autoridades** (Art. 5.1.c RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |
| **Evaluación del riesgo penal de personas individuales sin hechos constatables** (Art. 5.1.d RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |
| **Creación indiscriminada de bases de reconocimiento facial mediante raspado de internet o CCTV** (Art. 5.1.e RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |
| **Inferencia de emociones en el lugar de trabajo o instituciones educativas** (Art. 5.1.f RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |
| **Categorización biométrica para deducir raza, opiniones políticas, creencias religiosas u orientación sexual** (Art. 5.1.g RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |
| **Identificación biométrica remota en tiempo real en espacios de acceso público con fines de garantía del cumplimiento del Derecho** (Art. 5.1.h RIA) | PENDIENTE | No consta respuesta. Exigible desde el 2/2/2025. |

---

## 4. CLASIFICACIÓN SEGÚN EL RIA (ANEXO III Y EXCEPCIÓN DEL ART. 6.3)

- **Clasificación preliminar, basada en lo declarado:** **EXCLUIDO DEL RIA (NO ES UN SISTEMA DE IA - ART. 3.1 RIA), SEGÚN LO DECLARADO**

### 4.1. Fundamento
**Nivel 0 - Exclusión del ámbito del RIA:** según lo declarado, el sistema se basa exclusivamente en reglas predefinidas, sin capacidad de inferencia, por lo que no sería un sistema de IA (Art. 3.1 del Reglamento (UE) 2024/1689). En ese caso se rige por la normativa de administración electrónica (Ley 39/2015, Ley 40/2015) y por el ENS.



### 4.3. Traza de la clasificación
*Corte normativo: Registro de fuentes de 05/10/2026: RIA (Reglamento (UE) 2024/1689) y Reglamento (UE) 2026/1744; Ley 40/2015; Ley 15/2022; RD 729/2023; ENS (RD 311/2022).*

| Paso | Pregunta | Respuesta | Conclusión | Regla y fuente | Límites |
| :--- | :--- | :--- | :--- | :--- | :--- |
| INDICIOS | ¿Qué sugiere la documentación aportada? | Uso de IA: «. **interpolacion idw** como tecnica de aprendizaje automatico no parametrico aplicada a las lecturas» | Indicios para orientar la entrevista. | Los indicios por palabras clave nunca deciden la clasificación ni el estado de un requisito. (Documentación aportada (README, AGENTS.md, descripción)) | Coincidencias de texto con normalización de tildes y exclusión de negaciones; pueden existir falsos positivos y negativos. |
| ART-3-1 | ¿Infiere el sistema, a partir de la información de entrada, la manera de generar resultados de salida (predicciones, contenidos, recomendaciones o decisiones)? | No | No sería un sistema de IA: queda fuera del RIA. | Un sistema de IA es un sistema basado en una máquina que infiere de la información de entrada la manera de generar resultados de salida que pueden influir en entornos físicos o virtuales. (Reglamento (UE) 2024/1689, Art. 3.1) | Respuesta declarada. Debe contrastarse con las capacidades reales del sistema y con las Directrices de la Comisión sobre la definición de sistema de IA. |
| CLASIFICACION | Clasificación resultante | EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado | Clasificación preliminar basada en lo declarado. | Orden de examen: definición de IA (Art. 3.1), prácticas prohibidas (Art. 5), alto riesgo (Art. 6 y Anexo III, con la excepción del Art. 6.3) y transparencia (Art. 50, acumulable). Las respuestas desconocidas o contradictorias impiden concluir. (Reglamento (UE) 2024/1689, Arts. 3.1, 5, 6 y 50) | No sustituye la calificación del órgano competente ni la revisión jurídica. |

---

## 5. SUPERVISIÓN HUMANA Y MARCO ESTATAL DE GOBERNANZA

- **Supervisión humana (declarada):** sin intervención humana; puede quedar sujeta a la prohibición del Art. 22 RGPD y exige los requisitos del Art. 41 de la Ley 40/2015.
- **Rol del supervisor (declarado):** No indicado
- **Deslinde con la actuación administrativa automatizada (Ley 40/2015, Art. 41):**
  Se ha declarado que el sistema no produce ni prepara actos o actuaciones administrativas: solo informa. El Art. 41 no es aplicable; debe revisarse si el sistema llega a intervenir en un procedimiento administrativo.
- **Responsabilidad patrimonial:**
  Los particulares exigen directamente a la Administración Pública correspondiente la indemnización de las lesiones causadas por el funcionamiento de los servicios públicos, también cuando intervenga este sistema (Arts. 32.1 y 36.1 de la Ley 40/2015). La Administración solo puede exigir responsabilidad a sus autoridades y personal cuando haya concurrido dolo, o culpa o negligencia graves (Art. 36.2).
- **No discriminación algorítmica (Ley 15/2022, Art. 23):**
  Las administraciones públicas favorecerán mecanismos de minimización de sesgos, transparencia y rendición de cuentas, y se promoverán evaluaciones del posible impacto discriminatorio. No se han aportado evaluaciones de sesgo, por lo que este extremo figura como no evaluado.

---

## 6. MEDIDAS DE SEGURIDAD (ENS, RD 311/2022)

- **Categoría ENS orientativa:** **MEDIA**
- **Fundamentación:** Categoría orientativa: no se ha valorado ninguna dimensión de seguridad. Se estima a partir de otras respuestas y debe sustituirse por la valoración del Anexo I del RD 311/2022.

### 6.1. Medidas del Anexo II relacionadas con el uso de servicios de IA
1. **Arts. 40 y 41; Anexo I** — PENDIENTE: Categoría orientativa: no se ha valorado ninguna dimensión de seguridad. Se estima a partir de otras respuestas y debe sustituirse por la valoración del Anexo I del RD 311/2022.
2. **[op.acc.5] y [op.acc.6] mecanismos de autenticación; [mp.sw.1] desarrollo de aplicaciones** — NO VERIFICADO: Las credenciales deben estar bajo control exclusivo y no exponerse en código cliente ni en repositorios. Esta evaluación no ha examinado el código del sistema auditado.
3. **[op.exp.8] Registro de la actividad; Art. 12 RIA (alto riesgo)** — PENDIENTE: No consta si existe registro de actividad.

---

## 7. OBLIGACIONES Y ESTADO DE ACREDITACIÓN

Solo «Acreditado» equivale a cumplimiento y exige validación humana con evidencia. «Declarado» recoge lo afirmado por el promotor sin comprobar.

### Medidas de apoyo a la alfabetización en IA del personal — **No aplica**
*Reglamento (UE) 2024/1689, modificado por el Reglamento (UE) 2026/1744 · Art. 4 · Comprobación automática · Exigible desde 2/2/2025*

Proveedores y responsables del despliegue deben adoptar medidas para apoyar la alfabetización en IA de su personal. No se han aportado evidencias de esas medidas. Exigible desde el 2/2/2025.

**Acción:** Documentar la formación o las medidas adoptadas para el personal que usa el sistema.

### Transparencia hacia las personas (interacción con IA y contenido sintético) — **No aplica**
*Reglamento (UE) 2024/1689 · Art. 50 · Declaración del promotor*

Declarado que el sistema no es un sistema de IA (Art. 3.1 RIA): el Art. 50 no se aplica.

**Acción:** Revisar la declaración si el sistema llega a usar inteligencia artificial.

### Supervisión humana de los resultados — **PENDIENTE**
*Reglamento (UE) 2024/1689; RGPD; Ley 40/2015 · Art. 14 RIA (alto riesgo); Art. 22 RGPD; Art. 41 Ley 40/2015 · Declaración del promotor*

Declarada actuación sin intervención humana: puede quedar sujeta a la prohibición del Art. 22 RGPD y exige los requisitos del Art. 41 Ley 40/2015.

**Acción:** Documentar quién revisa, en qué momento y con qué capacidad de modificar o descartar el resultado.

### Categorización del sistema según el impacto en cada dimensión — **PENDIENTE**
*ENS (RD 311/2022) · Arts. 40 y 41; Anexo I · Declaración del promotor*

Categoría orientativa: no se ha valorado ninguna dimensión de seguridad. Se estima a partir de otras respuestas y debe sustituirse por la valoración del Anexo I del RD 311/2022.

**Acción:** Valorar el nivel (bajo, medio o alto) de cada dimensión de seguridad afectada.

### Protección de las credenciales de acceso a servicios de IA — **NO VERIFICADO**
*ENS (RD 311/2022), Anexo II · [op.acc.5] y [op.acc.6] mecanismos de autenticación; [mp.sw.1] desarrollo de aplicaciones · Comprobación automática*

Las credenciales deben estar bajo control exclusivo y no exponerse en código cliente ni en repositorios. Esta evaluación no ha examinado el código del sistema auditado.

**Acción:** Revisar el código y la configuración del sistema auditado; trasladar las claves a un servidor o usar modelos locales.

### Registro de la actividad y trazabilidad — **PENDIENTE**
*ENS (RD 311/2022), Anexo II; Reglamento (UE) 2024/1689 · [op.exp.8] Registro de la actividad; Art. 12 RIA (alto riesgo) · Declaración del promotor*

No consta si existe registro de actividad.

**Acción:** Activar el registro de peticiones y respuestas con conservación definida en la documentación de seguridad.

### Base jurídica del tratamiento — **DECLARADO (sin verificar)**
*RGPD (UE 2016/679) · Art. 6.1 · Declaración del promotor*

Declarada la base jurídica: Art. 6.1.e) (misión de interés público o ejercicio de poderes públicos). No se ha verificado.

**Acción:** El DPD debe verificar la base jurídica y la norma que la sustenta.

### Registro de Actividades de Tratamiento — **PENDIENTE**
*RGPD (UE 2016/679) · Art. 30 · Declaración del promotor*

No se ha indicado la actividad de tratamiento.

**Acción:** El DPD debe verificar la inscripción en el RAT.

### Evaluación de impacto en la protección de datos — **PENDIENTE**
*RGPD (UE 2016/679) · Art. 35; lista de la AEPD (Art. 35.4) · Comprobación automática*

Cribado preliminar: hay criterios sin contestar que podrían alcanzar el umbral de dos.

**Acción:** Completar el borrador de EIPD con el asesoramiento del DPD.

### Gestión y notificación de brechas de datos personales — **PENDIENTE**
*RGPD (UE 2016/679) · Arts. 33 y 34 · Declaración del promotor*

No consta si existe un procedimiento para gestionar brechas de datos personales.

**Acción:** Prever cómo se detecta y documenta cualquier brecha (Art. 33.5) y quién la notifica a la AEPD sin dilación indebida y, de ser posible, en 72 horas (Art. 33.1), y a los interesados si entraña un alto riesgo (Art. 34). La AEPD ofrece las herramientas Asesora Brecha (notificación) y Comunica-Brecha RGPD (comunicación a los interesados).

### Actuación administrativa automatizada — **No aplica**
*Ley 40/2015 · Art. 41 · Declaración del promotor*

Declarado que el sistema no produce ni prepara actos o actuaciones administrativas: solo informa. El Art. 41 no es aplicable.

**Acción:** Revisar la declaración si el sistema llega a intervenir en un procedimiento administrativo.

### Minimización de sesgos y no discriminación algorítmica — **NO EVALUADO**
*Ley 15/2022 · Art. 23 · Comprobación automática*

Las administraciones públicas favorecerán mecanismos de minimización de sesgos, transparencia y rendición de cuentas, y se promoverán evaluaciones de impacto. No se han aportado evaluaciones de sesgo.

**Acción:** Valorar y documentar una evaluación del posible impacto discriminatorio del sistema.


### 7.1. Datos declarados en materia de protección de datos
- **Norma competencial declarada:** *No indicada*. La base jurídica del tratamiento (Art. 6.1 RGPD) debe verificarla el DPD.
- **Tratamiento de datos personales (declarado):** no consta.
- **Actividad del Registro de Actividades de Tratamiento (declarada):** *No indicada*.
- **Categorías especiales de datos (Art. 9 RGPD):** declarado que NO se tratan.
- **Datos relativos a condenas e infracciones penales (Art. 10 RGPD):** declarado que NO se tratan.
- **Procedimiento de gestión y notificación de brechas de datos personales (Arts. 33 y 34 RGPD):** no consta. Herramientas de la AEPD: Asesora Brecha y Comunica-Brecha RGPD.
- **Datos de solvencia patrimonial y de crédito de personas físicas (lista de la AEPD, criterio 4):** declarado que NO se tratan.



---

## NOTA SOBRE LAS FUENTES Y TRAZABILIDAD DEL DOCUMENTO

Los preceptos citados proceden de la base de conocimiento de la herramienta (Registro de fuentes de 05/10/2026: RIA (Reglamento (UE) 2024/1689) y Reglamento (UE) 2026/1744; Ley 40/2015; Ley 15/2022; RD 729/2023; ENS (RD 311/2022)). No se ha verificado su vigencia en el momento de emitir este documento: debe comprobarse en el BOE y en EUR-Lex antes de cualquier uso.

- **Versión del motor:** 2.2.1
- **Huella SHA-256 de las entradas (ingesta y entrevista):** 899e21f94d1113da406afd38b64550e9d9d9aa9954a60e10ac18cf878faeac05 (permite comprobar que dos documentos parten de las mismas entradas; no acredita la integridad del documento)
- **Fecha de generación:** 2026-10-13T14:42:43.438Z
- **Asistencia de IA:** No se usó ningún modelo de IA: el diagnóstico procede solo del motor determinista.

### Origen de las respuestas
Todas las respuestas las introdujo la persona usuaria.

---

## REVISIÓN Y FIRMA

> *El presente documento es un informe técnico preliminar generado con una herramienta automatizada. No es un acto administrativo ni una actuación administrativa automatizada. Solo adquiere valor cuando lo revisan y firman los responsables competentes, que pueden modificar o rechazar sus conclusiones (firma electrónica del personal, Art. 43 de la Ley 40/2015).*

| EL RESPONSABLE FUNCIONAL | EL RESPONSABLE DE SEGURIDAD (ENS) | EL DELEGADO DE PROTECCIÓN DE DATOS |
| :---: | :---: | :---: |
| *(Firma electrónica)* | *(Firma electrónica)* | *(Firma electrónica)* |
| **Jefatura de Servicio Responsable** | **Responsable de Seguridad ENS (CISO)** | **Delegado de Protección de Datos (DPD / DPO)** |
| Área de Régimen Jurídico y Transformación Digital | Centro de Sistemas y Ciberseguridad | Oficina de Protección de Datos |
