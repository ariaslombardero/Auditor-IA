# Cobertura frente a los requisitos de auditoría de la AEPD

**Hallazgo:** COB-01 · **Versión de la herramienta:** motor v2.2.0 · **Fecha:** 10/10/2026

Contrasta lo que hace Auditor IA con los **objetivos de control** del documento de la AEPD [*Requisitos para auditorías de tratamientos que incluyan IA*](https://www.aepd.es/guias/requisitos-auditorias-tratamientos-incluyan-ia.pdf). Ese documento:
- es la versión de enero de 2021, marcada «en revisión»; el PDF se actualizó en aepd.es el 4/12/2025;
- se elaboró a partir de un estudio de Eticas Research and Consulting, con revisiones del CSIC AI Hub, OdiseIA, ASTIC, CiberGID (UNED) y CDTI.

Lo leí completo el 10/10/2026.

## Cómo leer esta matriz

- **Qué compara.** El documento de la AEPD es una lista de controles para **auditar un tratamiento** que incorpora un componente de IA. Auditor IA prepara un **diagnóstico preliminar antes de la puesta en servicio**: no es una auditoría.
- **Qué significa cada nivel:**
  - «Parcial»: la herramienta **pregunta** por ese aspecto, lo refleja como **requisito** o **alerta** en el informe, o lo **ensaya**;
  - «No»: la herramienta no lo trata.
- **Ningún objetivo se marca como «cubierto»,** porque la herramienta no comprueba evidencias. Sus requisitos quedan en «declarado» o «pendiente» hasta que una persona registra una validación con su evidencia (principio 2 de [`agents.md`](../agents.md)).
- **Bloques C y D (desarrollo y datos de entrenamiento).** Están pensados para quien **desarrolla o entrena** el componente. Las entidades locales suelen usar modelos de terceros, y entonces esos controles recaen sobre el proveedor del modelo. La herramienta no los cubre, y se dice así.

## Resumen

| Bloque del documento de la AEPD | Objetivos | Parcial | No |
| :--- | :---: | :---: | :---: |
| A. Identificación y transparencia del componente | 3 | 3 | 0 |
| B. Propósito del componente | 6 | 6 | 0 |
| C. Fundamentos del componente | 5 | 2 | 3 |
| D. Gestión de los datos | 4 | 2 | 2 |
| E. Verificación y validación | 7 | 6 | 1 |
| **Total** | **25** | **19** | **6** |

## Matriz por objetivo de control

### A. Identificación y transparencia del componente

| Objetivo | Nivel | Qué hace Auditor IA | Qué no hace |
| :--- | :--- | :--- | :--- |
| Inventario del componente | Parcial | Identifica la aplicación por su nombre, descripción, tecnología y documentación (paso 1). Cada informe lleva la versión del motor y la huella SHA-256 de sus entradas | No registra la versión, la fecha ni la firma del componente auditado, ni su histórico de versiones |
| Identificación de responsabilidades | Parcial | Papel de la entidad, proveedora o responsable del despliegue (`RIA-PAPEL`). Actividad en el RAT (`RGPD-ART-30`). Responsable funcional, técnico, CISO y DPD en el informe y en la diligencia de firma. Opción de alojamiento con contrato de encargo | No examina los contratos ni si existe obligación de designar un DPD |
| Transparencia | Parcial | Requisito del Art. 50 RIA según lo declarado (aviso de interacción, marcado, textos publicados con o sin control editorial; `RIA-ART-50`). Aviso de transparencia en el kit de código. Medida de información (Art. 13 RGPD) en el borrador de EIPD | No evalúa la explicabilidad de la lógica ni los medios para impugnar resultados |

### B. Propósito del componente

| Objetivo | Nivel | Qué hace Auditor IA | Qué no hace |
| :--- | :--- | :--- | :--- |
| Finalidades y usos previstos | Parcial | Finalidad declarada, uso en un ámbito del Anexo III y base jurídica (`RGPD-BASE-JURIDICA`) | No analiza usos ni usuarios secundarios |
| Contexto de uso | Parcial | Destinatarios del sistema. Quién supervisa y cuándo (`SUPERVISION-HUMANA`). Descripción del procedimiento y deslinde con el Art. 41 de la Ley 40/2015 | No pide umbrales de interpretación de resultados ni contextos en los que no debe usarse |
| Proporcionalidad y necesidad | Parcial | Apartado «3 bis. Evaluación de la necesidad y la proporcionalidad» (Art. 35.7.b RGPD) en el borrador de EIPD: idoneidad, alternativas menos intrusivas, motivos para usar el sistema, minimización y proporcionalidad en sentido estricto, con lo declarado en cada caso (EIPD-07). Cribado y tabla de riesgo inherente, medidas y riesgo residual | Plantea las preguntas y recoge lo declarado, pero no las responde: el juicio corresponde al responsable con el asesoramiento del DPD |
| Destinatarios de los datos | Parcial | Dónde se ejecuta el sistema y alerta de transferencia internacional (capítulo V RGPD). Proveedor efectivo de IA en cada diagnóstico. Bloqueo del envío a proveedores externos si se declaran datos de los Arts. 9 o 10 | No inventaría destinatarios ni revisa la información a los interesados (Arts. 13 y 14 RGPD) |
| Limitación de la conservación | Parcial | Plazo de conservación de los registros de actividad (`ENS-REGISTRO-ACTIVIDAD`). Política de conservación del propio historial ([custodia-historial.md](custodia-historial.md)) | No pregunta por los plazos de los datos que trata la aplicación auditada |
| Categorías de interesados | Parcial | Personas vulnerables, personas físicas en ámbitos del Anexo III, perfilado y criterios de EIPD (9 de WP248 y 11 de la lista de la AEPD) | No prevé consultar a los interesados (Art. 35.9 RGPD) |

### C. Fundamentos del componente

| Objetivo | Nivel | Qué hace Auditor IA | Qué no hace |
| :--- | :--- | :--- | :--- |
| Política de desarrollo | No | — | No examina la política de desarrollo de la entidad |
| Implicación del DPD | Parcial | Contacto y firma del DPD en el informe. Dictamen del DPD en blanco en el borrador de EIPD. Requisitos que asignan acciones al DPD | No valora su cualificación ni los procedimientos de comunicación con él |
| Modelos teóricos base | No | — | Corresponde a quien diseña el modelo |
| Marco metodológico | No | — | Corresponde a quien entrena el modelo |
| Arquitectura básica | Parcial | Lee el README, el AGENTS.md, el prompt del sistema y las dependencias. Pregunta si el sistema infiere sus resultados (Art. 3.1 RIA). Detecta servicios de IA en la nube citados en la documentación | No analiza el código ni el algoritmo |

### D. Gestión de los datos

| Objetivo | Nivel | Qué hace Auditor IA | Qué no hace |
| :--- | :--- | :--- | :--- |
| Calidad de los datos | No | Solo la enumera entre las obligaciones del proveedor de alto riesgo (Arts. 9 a 17 RIA), sin comprobarla | — |
| Origen de las fuentes de datos | Parcial | Base jurídica, categorías especiales (Art. 9), datos penales (Art. 10) y de solvencia, aunque procedan de fuentes públicas | No examina el origen de los datos de entrenamiento |
| Preparación de los datos personales (minimización) | No | — | No examina la minimización de la aplicación auditada. La herramienta sí la aplica a sí misma: piloto con datos sintéticos y sin envío de datos sensibles a proveedores externos |
| Control del sesgo | Parcial | Requisito de la Ley 15/2022, Art. 23, que pide documentar una evaluación del impacto discriminatorio. Intervención humana y Art. 22 RGPD. Perfilado | No mide sesgos |

### E. Verificación y validación

| Objetivo | Nivel | Qué hace Auditor IA | Qué no hace |
| :--- | :--- | :--- | :--- |
| Adecuación del proceso de verificación y validación | Parcial | Ensayos adversarios documentados, con estados que distinguen ejecución real, error y demostración, y con alcance declarado | No revisa el plan de pruebas de la entidad |
| Verificación y validación del componente | Parcial | Pruebas de caja negra sobre el modelo configurado: inyección documental, exfiltración y agentes (OWASP Top 10 for LLM 2025) | No hace pruebas de caja blanca |
| Rendimiento | No | — | No mide precisión, sensibilidad ni tasas de error |
| Coherencia | Parcial | Pregunta si se fija la configuración del modelo (versión, temperatura) para que los resultados sean reproducibles | No mide variaciones entre salidas |
| Estabilidad y robustez | Parcial | Los ensayos adversarios prueban el comportamiento ante entradas maliciosas o imprevistas | No trata el reajuste ni el aprendizaje continuo |
| Trazabilidad | Parcial | Registro de actividad y su conservación (ENS [op.exp.8]); alerta si no existe. Intervención humana en las decisiones (Art. 22 RGPD, Art. 41 Ley 40/2015, Art. 14 RIA). Origen de cada respuesta de la entrevista en el informe | No examina el control de versiones de datos y código de la aplicación |
| Seguridad | Parcial | Categoría ENS por dimensiones. Protección de credenciales y escáner de claves expuestas. Procedimiento de brechas (`RGPD-BRECHAS`, Arts. 33 y 34). Resistencia a ataques mediante ensayos. Cribado de riesgos para los derechos (EIPD) | No comprueba seudonimización, cifrado ni configuración segura |

## Lo que se podría añadir

En orden de esfuerzo, sin compromiso de fecha:

1. **Versión del componente auditado**, como la etiqueta o el commit del repositorio, en el paso 1 y en el informe (objetivo A.1).
2. **Preguntas sobre plazos de conservación** y **destinatarios** de los datos de la aplicación auditada (objetivos B.4 y B.5).
3. **Una pregunta sobre métricas de rendimiento y umbrales de error** cuando el sistema clasifica o puntúa (objetivos E.3 y B.2).

## La propia herramienta frente a estos controles

Auditor IA no entrena ni ejecuta ningún modelo propio. Para los controles que le son aplicables:

- **Inventario y trazabilidad:**
  - versión del motor en cada informe;
  - huella SHA-256 de las entradas;
  - etiqueta de versión en el repositorio;
  - origen de cada respuesta (persona, sugerencia de IA aceptada o indicio).
- **Verificación y validación:**
  - batería de pruebas automáticas;
  - 14 casos de referencia, 4 de ellos aplicaciones reales;
  - matriz de hallazgos con su prueba ([matriz-hallazgos.md](auditoria/matriz-hallazgos.md)).
- **Seguridad:**
  - sin servidor propio;
  - clave del proveedor en la sesión del navegador;
  - política de seguridad de contenidos (CSP) en el despliegue;
  - procedimiento ante incidentes ([custodia-historial.md](custodia-historial.md)).
- **Minimización:**
  - piloto con datos sintéticos;
  - la documentación no se envía a proveedores externos si se declaran datos de los Arts. 9 o 10 del RGPD;
  - confirmación previa antes de enviar la documentación a un servicio externo para pedir sugerencias de respuesta.
