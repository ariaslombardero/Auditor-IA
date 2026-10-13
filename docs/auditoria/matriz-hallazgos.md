# Matriz de hallazgos y trazabilidad de correcciones

> Relaciona cada hallazgo de las auditorías independientes (Claude Opus 5.5 y GPT Sol 6.1) con su reproducción, el comportamiento esperado, la fase que lo corrige y la prueba que lo verifica.
> **Línea base:** commit `fa9a67e` · `npm test` el 05/10/2026: **50 pruebas, 49 en rojo, 1 en verde** (DOC-06). Los hallazgos ⚪ dependen de decisiones de diseño de su fase (modelo de requisitos, papeles, calendario, ADR 001) y su prueba se escribirá al inicio de esa fase, antes de corregir.
> **Cierre de la Fase 1** (05/10/2026): **55 pruebas, 29 en verde y 26 en rojo**. Las 26 en rojo corresponden a hallazgos asignados a las Fases 2 y 3. Se añaden NOR-10, DOC-11, DOC-12, ALM-06 y EIPD-04, detectados o introducidos durante la fase.
> **Cierre de la Fase 2** (05/10/2026): **69 pruebas, 56 en verde y 13 en rojo**. Las 13 en rojo son hallazgos de la Fase 3 (ALM, RT y SEG). Las pruebas del motor se reescribieron para la entrevista v2 («sí / no / desconocido») conservando la intención de cada una; se añaden MOT-23 a MOT-26, EIPD-05 y DOC-13.
> **Fase 3 · entrega 3.1** (07/10/2026): **111 pruebas, 102 en verde y 9 en rojo**. Los 9 en rojo son de custodia (ALM-01 a ALM-04, entrega 3.2) y red teaming (RT-01 a RT-05, entrega 3.3). Arquitectura de proveedores y credenciales igual que *Opositor transparente* (ADR 001). El selector de modelo deja de usar listas fijas: muestra solo los modelos que devuelve el proveedor para la clave o el servidor indicados. La prueba SEG-07 de la Fase 0 se adapta: la CSP se comprueba en la página compilada, porque en desarrollo la impediría el refresco en caliente de Vite.
> **Fase 3 · entrega 3.2** (07/10/2026): **118 pruebas, 113 en verde y 5 en rojo** (RT-01 a RT-05, entrega 3.3). Historial con revisiones, errores de guardado comunicados, importación validada y política de conservación documentada. La prueba ALM-01 de la Fase 0 se conserva: sin expediente indicado, cada guardado abre uno nuevo.
> **Cierre de la Fase 3** (07/10/2026): **125 pruebas, 125 en verde**. Entrega 3.3: ensayos adversarios juzgados por efectos observables, estados `demostracion` y `no_ejecutada`, batería de agentes y alcance declarado. Categorías OWASP cotejadas con la lista oficial de 2025 (la extracción de instrucciones pasa a LLM07 y la exfiltración por Markdown se atribuye también a LLM05). La prueba RT-01 de la Fase 0 se conserva y se añaden pruebas de efectos, detectores y alcance.
> **Fase 4 · entregas 4.1 y 4.2** (07/10/2026): **148 pruebas en verde**. 11 casos de referencia (`src/test/referenceCases.ts`) con resultado esperado y concordancia de DOCX, Markdown y manifiesto; generador `npm run ejemplos` que ejecuta el motor real. Los casos de referencia revelaron DOC-14.
> **Fase 4 · entregas 4.3 y 4.4** (07/10/2026): **149 pruebas en verde**. Comprobación de principio a fin en el navegador (entrevista contestada desde la interfaz; panel, Markdown y manifiesto concordantes en clasificación, alerta y huella). Formato documental cotejado con la Ley 39/2015 (Arts. 26 y 70), la NTI de Documento Electrónico y la NTI de Catálogo de estándares.
> **Cierre de la Fase 4** (07/10/2026): **151 pruebas en verde**. Documentación reescrita (README, `agents.md`), lista de revisión humana (`docs/revision-humana.md`) y condiciones del piloto (`docs/piloto.md`). Pendiente fuera del código: decisión expresa de los responsables, designación de participantes, validación del formato documental y cotejo de las fuentes marcadas como parciales o no accesibles.
> **Fase 5 · entrega 5.1** (08/10/2026): **164 pruebas en verde**. Coherencia del estado (EST-01 a EST-04): diagnóstico recalculado con cada cambio, contador de respuestas pendientes basado en el catálogo de preguntas, separación entre respuestas pendientes y requisitos por validar, y comentario de IA desfasado. La prueba DOC-12 se adapta a la nueva expresión «por validar».
> **Fase 5 · entrega 5.2** (08/10/2026): **171 pruebas en verde**. Entrevista generada desde el catálogo con ayuda en lenguaje sencillo y navegación a lo pendiente (UX-01, UX-02).
> **Fase 5 · entrega 5.3** (08/10/2026): **191 pruebas en verde**. Sugerencias de respuesta con comprobación de citas y procedencia en los documentos (SUG-01 a SUG-03). Verificado en el navegador con un modelo local simulado.
> **Cierre de la Fase 5** (08/10/2026): **191 pruebas en verde**. Guía de uso, manual de la app, `agents.md` y README actualizados con la entrevista asistida, el panel «Lo que falta» y la diferencia entre respuestas pendientes y requisitos por validar.
> **Casos de aplicaciones reales** (09/10/2026): **199 pruebas en verde, 14 casos de referencia**. Se añaden la Calculadora de plazos LCSP, el Monitor BOE y el Asistente de notas de prensa, y el analizador de ayudas pasa a usar el README real. La documentación de cada uno se guarda con su commit en `src/test/casos-reales/`; las respuestas de su entrevista son un borrador que debe confirmar el autor. Los casos reales revelaron EIPD-06 e IND-01.
> **Fase 6 · entrega 6.1** (10/10/2026): **200 pruebas en verde**. Brechas de datos personales (BRE-01): pregunta, requisito `RGPD-BRECHAS` y procedimiento para incidentes de la propia herramienta. Motor y paquete en la versión 2.2.0, porque cambian las conclusiones del motor (EIPD-06 y BRE-01).
> **Fase 6 · entrega 6.2** (10/10/2026): **205 pruebas en verde**. Alojamiento válido para aplicaciones sin IA (ALO-01), detalle del Art. 50 con la excepción por control editorial (TRA-01), fin del falso indicio de empleo por «criterios de baremación» (IND-02) y negaciones que alcanzan a toda la cláusula (IND-03).
> **Fase 6 · entrega 6.3** (10/10/2026): **205 pruebas en verde**. Matriz de cobertura frente a los *Requisitos para auditorías de tratamientos que incluyan IA* de la AEPD (COB-01). Es un documento: no añade pruebas.
> **Fase 6 · entrega 6.4** (10/10/2026): **206 pruebas en verde**. Evaluación de la necesidad y la proporcionalidad en el borrador de EIPD (EIPD-07, Art. 35.7.b RGPD, cotejado). El caso del asistente de notas de prensa se declara con modelos locales, como en la Diputación: el motor avisa de que la documentación publicada cita la API de Gemini.
> **Fase 6 · entrega 6.5** (10/10/2026): **207 pruebas en verde**. Remisión al modelo FRIA de la APDCAT en el requisito del Art. 27 RIA (FRIA-01; Arts. 27.4 y 27.5 cotejados). La revisión del 5/10 se traslada a `docs/historico/revision-ia-linea-base-v2.0/`.
> **Fase 6 · entrega 6.6** (13/10/2026): **222 pruebas en verde, 15 casos de referencia**. Prueba de uso con Oasis-Madrid, una aplicación real sin IA: la herramienta se adapta al caso (UX-03, EIPD-08), no convierte una cita en calificación jurídica (SUG-04), no inventa la obligación del Art. 41 (ADM-01), retira la diligencia y los textos que prometían de más (DOC-16) y amplía IND-01. Oasis-Madrid pasa a ser el quinto caso real.
> **Fase 6 · entrega 6.7** (13/10/2026): **222 pruebas en verde**. El autor confirma las respuestas de las cuatro aplicaciones de la Diputación (lo que desconoce queda en «no lo sé»): el Monitor BOE pasa a «EIPD necesaria» (datos de solvencia cruzados con la base de datos provincial). Arreglo de la guía (UX-04), textos del informe y pregunta de configuración del modelo solo para sistemas de IA.

**Origen:** C = Claude · G = GPT Sol 6.1 · C+G = ambos. **Estado:** 🔴 reproducido (prueba en rojo) · 🟢 corregido (prueba en verde) · ⚪ sin prueba automática todavía.

## A. Motor de clasificación (`src/lib/auditEngine.ts`)

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| MOT-01 | Las expresiones del Anexo III no detectan texto con tildes («baremación», «selección») | C+G | Normalización NFD; las palabras clave solo sugieren respuestas | 2 | 🟢 |
| MOT-02 | Una negación («no usamos reconocimiento facial») se califica como práctica prohibida | C+G | Las palabras clave nunca deciden una prohibición | 2 | 🟢 |
| MOT-03 | El `agents.md` de la propia app sale «prohibido» por la palabra «etnia» | C | Ídem | 2 | 🟢 |
| MOT-04 | «Excluido del Art. 3.1» convive con alto riesgo y obligación de marcado CE | G | Coherencia o «requiere revisión» | 2 | 🟢 |
| MOT-05 | Excepción del Art. 6.3 concedida a un sistema que evalúa personas sin alternativa a)–d) motivada | C+G | Exigir alternativa (disyuntiva), hechos y valoración de influencia material | 2 | 🟢 |
| MOT-06 | La justificación del Art. 6.3 afirma «documentos despersonalizados» aunque se evalúen personas | C | Justificación construida a partir del caso | 2 | 🟢 |
| MOT-07 | Declarar perfilado fuera del Anexo III basta para «alto riesgo» | C+G | Ámbito y perfilado se evalúan por separado | 2 | 🟢 |
| MOT-08 | Con respuestas por defecto la salida es «riesgo de transparencia» | C+G | Respuestas `desconocido` → «requiere revisión» | 2 | 🟢 |
| MOT-09 | Evaluación de solicitantes de becas cerrada en silencio como riesgo limitado | C | Ámbito no determinado → «requiere revisión» | 2 | 🟢 |
| MOT-10 | Ley 15/2022 marcada siempre `compliant` | C+G | `no_evaluado` sin evidencias | 1 | 🟢 |
| MOT-11 | Art. 6.4 marcado `compliant` al concederse la excepción | C+G | `pendiente` hasta aportar la documentación (y el registro del Art. 49.2) | 1 | 🟢 |
| MOT-12 | «Dictamen Favorable AGENTS.md» incondicional, incluso con alerta de autonomía | C | Sin dictámenes favorables automáticos | 1 | 🟢 |
| MOT-13 | Pilar de gobernanza en verde con `fully_automated` | C | Derivado del modelo de requisitos | 1 | 🟢 |
| MOT-14 | Pilar RGPD «Base legítima acreditada» sin preguntar la base jurídica | C+G | Base jurídica preguntada; si falta, pendiente | 1–2 | 🟢 |
| MOT-15 | Veredicto «APTO PARA DESPLIEGUE EN PRODUCCIÓN» | G | Veredicto derivado de requisitos pendientes, sin aptitud para producción | 1 | 🟢 |
| MOT-16 | Respuestas contradictorias (evalúa ciudadanos + solo documentos despersonalizados) se resuelven a favor de la excepción | C (en Fase 0) | «Requiere revisión» | 2 | 🟢 |
| MOT-17 | Cobertura del Anexo III limitada a 4(a) y 5(a); sin vía Art. 6.1/Anexo I | C+G | Cubrir o declarar «no soportado» | 2 | 🟢 |
| MOT-18 | Faltan obligaciones del responsable del despliegue (Arts. 4, 26, 27 solo alto riesgo, 49.3, 86) y el doble papel por caso | C (+G matiz) | Obligaciones por papel y clasificación | 2 | 🟢 |
| MOT-19 | Calendario normativo ausente (Ómnibus: Anexo III 2/12/2027, Anexo I 2/8/2028) | C+G | Clasificación separada de exigibilidad | 2 | 🟢 |
| MOT-20 | Categoría ENS por atajos (alojamiento), sin valoración D-A-I-C-T | C+G | Valoración por dimensiones o etiqueta «orientativa» | 2 | 🟢 |
| MOT-21 | Deslinde del Art. 41 basado solo en lo declarado | G | Recoger funcionamiento real e intervención humana | 1–2 | 🟢 |
| MOT-22 | `isAiSystem` meramente declarativo; AGENTS.md tomado como indicio de IA | G | Examen guiado de capacidades de inferencia (Art. 3.1) | 2 | 🟢 |
| MOT-23 | La clasificación no mostraba hechos, regla, fuente, versión normativa ni límites | G | Traza por pasos en el diagnóstico, el cuadro de mando, el DOCX, el Markdown y el manifiesto | 2 | 🟢 |
| MOT-24 | Ningún requisito podía llegar a «acreditado»: no existía validación humana documentada | C (en Fase 1) | Registro de validación (quién y con qué evidencia), ligada a las entradas; caduca si cambian | 2 | 🟢 |
| MOT-25 | Las prácticas del Art. 5 se decidían por palabras clave | C+G | Una pregunta por práctica; «sí» = prohibido; «desconocido» = requiere revisión | 2 | 🟢 |
| MOT-26 | El punto 5 del Anexo III se aplicaba a cualquier ayuda o subvención | G | Solo 5.a): prestaciones esenciales de asistencia pública a personas físicas; 5.b)–d) declarados no soportados | 2 | 🟢 |
| IND-01 | El indicio «uso de IA» saltaba con frases que no describen lo que hace la aplicación: cómo se desarrolló («Vibe Coding», «depurada con Claude», «Construido con… IA generativa»), la estrategia de IA de la entidad o la presentación del autor. Las dos aplicaciones sin IA (Calculadora LCSP, Monitor BOE) recibían el indicio | C (casos reales) | Esas frases se excluyen del indicio de IA; una mención real en otra frase («usa la API de Gemini») sigue detectándose. Los indicios siguen sin decidir nada | 6 | 🟢 |
| IND-02 | «Criterios de baremación» de una convocatoria generaba el indicio «Anexo III, empleo» en el analizador de ayudas, que no valora a personas | C (casos reales) | El indicio de empleo exige que la baremación se refiera a personas («baremación de méritos, candidatos o aspirantes», «baremar a los candidatos») | 6 | 🟢 |
| IND-03 | Una negación al principio de una enumeración larga («el sistema **no** procesa datos de salud, afiliación sindical, origen racial o datos biométricos») no alcanzaba al último elemento: el analizador recibía el indicio «Anexo III, biometría» | C (casos reales) | La negación alcanza a toda la cláusula (hasta un punto, punto y coma, dos puntos o salto de línea), salvo que medie una conjunción adversativa («pero», «sino», «aunque», «salvo», «excepto») | 6 | 🟢 |
| ADM-01 | Las preguntas del Art. 41 daban por hecho que el sistema produce actos administrativos: en una aplicación que solo informa (Oasis-Madrid), un «no interviene un empleado público» generaba la obligación inexistente de aprobar la resolución del Art. 41.2 | U (prueba con Oasis-Madrid) | Pregunta `producesAdministrativeActs` en el bloque F; con «no», el Art. 41 no aplica, la pregunta sobre el empleado público se oculta, no hay alerta de «ausencia de control humano» ni contradicciones, y no cuenta como decisión automatizada en los criterios de EIPD | 6 | 🟢 |

## B. Citas normativas

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| NOR-01 | Medidas «IA-01…IA-12» atribuidas a la CCN-STIC 884D | C+G | Retirar; citar medidas ENS con precisión | 1 | 🟢 |
| NOR-02 | Firma del personal citada como Art. 42 Ley 40/2015 | C | Art. 43 | 1 | 🟢 |
| NOR-03 | Art. 8 RD 729/2023 presentado como protocolo de incidentes | G | Principios de actuación | 1 | 🟢 |
| NOR-04 | Arts. 18 y 24 atribuidos al Reglamento 2026/1744 | C+G | Contenido según EUR-Lex | 1 | 🟢 |
| NOR-05 | Catálogo del Art. 5 sin 5.1.h ni las prohibiciones nuevas del Ómnibus | C | Catálogo completo con fechas | 1–2 | 🟢 |
| NOR-06 | Marcado CE remitido a la AESIA / entidad notificada | C | Control interno (Anexo VI, Art. 43.2 RIA) | 1 | 🟢 |
| NOR-07 | Antecedentes penales tratados como Art. 9 RGPD | G | Art. 10 RGPD | 1 | 🟢 |
| NOR-08 | Ley 15/2022 Art. 23 descrita como auditoría obligatoria | G | «Promoverá» evaluaciones de impacto | 1 | 🟢 |
| NOR-09 | «Infracción muy grave sancionable por la AESIA» sin matiz | C | Remisión a la norma nacional y Art. 99.8 RIA | 1 | 🟢 |
| NOR-10 | El consultor normativo rotulaba como «Texto Consolidado Oficial (BOE / DOUE)» resúmenes y textos inventados (medidas IA-xx, contenido del Ómnibus, «Art. 27» del ENS) | C (en Fase 1) | Extractos literales cotejados o resúmenes rotulados, con enlace a la fuente oficial | 1 | 🟢 |

## C. Documentos exportados (DOCX, Markdown, manifiesto)

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| DOC-01 | Responsabilidad patrimonial «única y exclusivamente» de los funcionarios | G | Arts. 32 y 36 Ley 40/2015 | 1 | 🟢 |
| DOC-02 | Niega siempre la actuación automatizada (Art. 41), aunque se haya declarado | G | Redacción según el caso | 1 | 🟢 |
| DOC-03 | Diligencia «verificados en tiempo real» incondicional | G | Solo con consulta efectiva y su estado por norma | 1 | 🟢 |
| DOC-04 | Prácticas del Art. 5 no examinadas impresas como «CONFORME» | C+G | `no_evaluado` | 1 | 🟢 |
| DOC-05 | Manifiesto con `FAVORABLE` y `vigente_consolidado` fijos | C | Estados derivados | 1 | 🟢 |
| DOC-06 | Las tres salidas expresan la misma etiqueta de clasificación | C | Se mantiene | 1 | 🟢 |
| DOC-07 | «CSV» aleatorio no verificable y diligencia que «certifica» | C+G | «Identificador interno», sin certificación. En la fase 6 se retira la diligencia entera (DOC-16) | 1 | 🟢 |
| DOC-08 | Texto del LLM incrustado en el DOCX sin marca de procedencia | C | Rotulado como análisis asistido no verificado | 1 | 🟢 |
| DOC-09 | Carpeta `Resultados prueba…` generada por script con textos fijos (incluye IA-01 «CONFORME» para claves en cliente) | C | Resultados regenerados por el motor (`npm run ejemplos`); los antiguos, con su script, en `historico-no-motor/` | 1 y 4 | 🟢 |
| DOC-10 | Formato, firma y metadatos sin ajustar a la política institucional (NTI) | C (+G matiz) | `docs/formato-documental.md`: la herramienta genera borradores (OOXML Transitional y Markdown) y el manifiesto; la conversión a PDF/A, los metadatos ENI, la firma y el CSV se hacen en el gestor de expedientes. Metadatos de fichero que declaran la naturaleza del documento. Decisión pendiente de validar por la Diputación | 4 | 🟢 |
| DOC-11 | Los documentos no identificaban versión del motor, corte normativo ni entradas utilizadas | G | Versión, corte normativo y huella SHA-256 de las entradas en DOCX, Markdown y manifiesto | 1 | 🟢 |
| DOC-12 | Cada exportador reconstruía sus propias conformidades (el manifiesto fijaba además `ley_40_2015_art_41_automated_act: false`) | C+G | Cuadro de mando, DOCX, Markdown y manifiesto consumen el mismo modelo y expresan el mismo veredicto | 1 | 🟢 |
| DOC-13 | El cuadro de mando mostraba un banner fijo «Sincronización Normativa Telemática Activa · Normas vigentes verificadas» | C (en Fase 2) | Banner de consulta que indica el corte normativo y remite a las fuentes oficiales | 2 | 🟢 |
| DOC-14 | Las alertas y recomendaciones del motor solo se mostraban en el panel: ningún documento exportado las recogía | C (en Fase 4, casos de referencia) | Sección «Alertas para la revisión» y «Recomendaciones» en DOCX y Markdown; `review_alerts` y `recommendations` en el manifiesto; el panel deja de hablar de «alertas de infracción» | 4 | 🟢 |
| DOC-15 | La guía de usuario seguía afirmando que el paso 6 genera «un CSV oficial conforme al Art. 42» y prometía una «auditoría pericial al 100 % de fiabilidad»; README, `agents.md` y el dossier para el DPD describían funciones y normas ya corregidas | C (en Fase 4) | Textos de interfaz, README y `agents.md` reescritos según lo implementado; dossier antiguo a `docs/historico/` con aviso; prueba de enlaces y de afirmaciones prohibidas en la documentación pública | 4 | 🟢 |
| DOC-16 | Textos que prometían más de lo que hace la herramienta: «Conforme a la Guía Oficial de la AEPD», un botón de «Código Seguro de Verificación (CSV)», «red teaming en vivo», «sellado criptográfico para AutoFirma»; y ejemplos con versiones de modelo que envejecen | U (prueba con Oasis-Madrid) | Se retira la diligencia y su huella del documento (el informe ya lleva la huella de sus entradas); textos rebajados; ejemplos de modelos sin número de versión. Una prueba recorre el código fuente y falla si reaparecen | 6 | 🟢 |

## D. EIPD (`src/lib/eipdGenerator.ts`)

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| EIPD-01 | C8 (tecnología innovadora) en `applies: true` para cualquier sistema | G (corrige a C) | Valoración motivada | 2 | 🟢 |
| EIPD-02 | C9 rotulado como «transferencias internacionales» | G | Impedimento al ejercicio de derechos (WP248) | 2 | 🟢 |
| EIPD-03 | Sin cálculo de riesgo residual; C3/C6 fijos en `false`; WP248 y lista AEPD mezclados | C+G | Riesgo inherente → medidas → residual; numeraciones separadas | 2 | 🟢 |
| EIPD-04 | El borrador de EIPD redactaba el dictamen del DPD («FAVORABLE PARA EL PASO A PRODUCCIÓN»), se presentaba como «Metodología Oficial de la AEPD» y daba por implantadas medidas no comprobadas | C (en Fase 1) | Borrador rotulado como tal; medidas como declaradas o pendientes; dictamen en blanco para el DPD | 1 | 🟢 |
| EIPD-05 | La necesidad de EIPD era binaria y presumía «obligatoria» con datos sensibles | G | Cribado «necesaria / no indicada / por determinar» con el umbral de dos criterios de WP248 o de la lista de la AEPD | 2 | 🟢 |
| EIPD-06 | El criterio 4 de la lista de la AEPD incluye los datos de solvencia patrimonial y crédito, pero la entrevista no los preguntaba: el Monitor BOE (deudores de edictos concursales, que pueden ser personas físicas) no activaba el criterio | C (casos reales) | Pregunta `processesSolvencyData` en el bloque G, con ayuda que aclara que los datos de fuentes públicas (BOE) siguen sujetos al RGPD; activa AEPD-4 (no el criterio 4 de WP248); siempre «inferida» si la IA sugiere «no»; consta en el Markdown y en el manifiesto | 6 | 🟢 |
| EIPD-07 | El borrador de EIPD no tenía la evaluación de la necesidad y la proporcionalidad, contenido mínimo de toda EIPD (Art. 35.7.b RGPD). La matriz de cobertura AEPD lo detectó en el objetivo B.3 | C (Fase 6, COB-01) | Apartado «3 bis» con cinco juicios (idoneidad, alternativas menos intrusivas, motivos para usar el sistema, minimización y proporcionalidad en sentido estricto), con lo declarado en cada uno y la conclusión «A COMPLETAR» por el responsable con el asesoramiento del DPD. La herramienta no concluye | 6 | 🟢 |
| EIPD-08 | Sin datos personales, la pestaña de EIPD seguía mostrando criterios en «SÍ» y ofrecía un borrador completo, aunque el cribado decía «no indicada» | U (prueba con Oasis-Madrid) | Si se declara que no se tratan datos personales, la pestaña dice «No procede la EIPD» y recuerda comprobar que el sistema no recibe direcciones, ubicaciones o IP | 6 | 🟢 |
| FRIA-01 | El requisito del Art. 27 RIA (evaluación de impacto en los derechos fundamentales, alto riesgo en organismos públicos) no indicaba cómo hacerla ni su relación con la EIPD | Revisión de la candidatura (Fase 6) | La acción indica que la evaluación complementa la EIPD (Art. 27.4) y remite, como guía, al modelo FRIA de la APDCAT (aplicación gratuita y local) o al cuestionario modelo de la Oficina de IA (Art. 27.5) cuando esté disponible | 6 | 🟢 |
| BRE-01 | La herramienta no trataba las brechas de datos personales: ni preguntaba si la entidad tiene un procedimiento ni lo reflejaba en el informe (criterio 4.4 del premio). Tampoco documentaba qué hacer ante un incidente de la propia herramienta | C (Fase 6) | Pregunta `breachProcedure` en el bloque G; requisito `RGPD-BRECHAS` (Arts. 33 y 34 RGPD, cotejados): «sí» → declarado, «no» → incumple, «no lo sé» → pendiente; acción con el plazo de 72 horas y las herramientas Asesora Brecha y Comunica-Brecha RGPD; dato declarado en Markdown y manifiesto; apartado «Brechas e incidentes en la propia herramienta» en `docs/custodia-historial.md` | 6 | 🟢 |
| COB-01 | No había un contraste explícito entre lo que comprueba la herramienta y los controles de auditoría de la AEPD para tratamientos con IA, ni constaba lo que no cubre | C (Fase 6) | Matriz [cobertura-aepd.md](../cobertura-aepd.md): 25 objetivos de control; 19 cubiertos en parte, 6 no cubiertos (desarrollo y entrenamiento del modelo, calidad de datos, minimización y rendimiento). Ninguno «cubierto», porque la herramienta no comprueba evidencias. Incluye las mejoras posibles, como el apartado de necesidad y proporcionalidad en la EIPD | 6 | 🟢 |
| ALO-01 | La pregunta «¿Dónde se ejecuta el modelo?» no servía para aplicaciones sin IA: no recogía dónde se procesan sus datos (Monitor BOE, con demostración en un alojamiento gratuito en la nube) | C (casos reales) | Pregunta «¿Dónde se ejecuta el sistema: el modelo de IA o, si no usa IA, la aplicación y sus datos?», con opciones y ayuda válidas para ambos casos; mismo campo, sin migración | 6 | 🟢 |
| TRA-01 | El requisito del Art. 50 pedía siempre «aviso de interacción y marcado», sin distinguir los apartados 1, 2 y 4 ni la excepción por control editorial del Art. 50.4, párrafo segundo (notas de prensa revisadas por el gabinete) | C (casos reales) | Preguntas `publishesPublicInterestText` y `editorialReview` en el bloque D; la acción del requisito `RIA-ART-50` se compone según lo declarado (50.1 solo si interactúa con personas; 50.2 a cargo del proveedor; 50.4 con o sin control editorial). La clasificación no cambia. Art. 50 y Reglamento 2026/1744 cotejados | 6 | 🟢 |

## E. Historial local (`src/lib/auditHistoryService.ts`)

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| ALM-01 | Sobrescritura de auditorías de la misma app en 30 minutos | C+G | Expedientes con revisiones añadidas (`auditId`, `revision`); nada se sobrescribe | 3 | 🟢 |
| ALM-02 | Guardado fallido devuelto como correcto | G | `ErrorCustodia` y aviso en pantalla («El diagnóstico NO se ha guardado») | 3 | 🟢 |
| ALM-03 | Importación de registros malformados | C+G | Validación de estructura y tamaño (10 MB); informe de rechazados con su motivo | 3 | 🟢 |
| ALM-04 | Importación de clasificaciones inexistentes | C+G | Valores admitidos y coincidencia entre la clasificación del registro y la de su diagnóstico | 3 | 🟢 |
| ALM-05 | Purga silenciosa al superar 50 registros; registros antiguos mostrados como si pasaran el motor nuevo | C+G | Retiradas comunicadas; política en `docs/custodia-historial.md`; registros antiguos como revisión 1 y «motor no recalculado»; la huella SHA-256 se declara como no acreditativa de integridad | 3 | 🟢 |
| ALM-06 | Registros guardados por el motor anterior podían mostrarse como si hubieran pasado el motor nuevo; pilares vacíos se mostraban como «Requisitos acreditados» | G (+C en Fase 1) | Migración a «no verificado», versión «no recalculado» y pilares sin requisitos como «Sin requisitos evaluados» | 1 | 🟢 |

## F. Seguridad del auditor

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| SEG-01 | Escáner sin patrón `hf_` | C+G | Detectar `hf_`, OpenRouter (`sk-or-v1-`) y `github_pat_` | 3 | 🟢 |
| SEG-02 | Claves `sk-ant-` notificadas dos veces | G | Patrones de más a menos específicos; una coincidencia por posición | 3 | 🟢 |
| SEG-03 | Clave de Gemini en la URL | C | Cabecera `x-goog-api-key`; SDK oficial para la generación | 3 | 🟢 |
| SEG-04 | Claves persistidas en claro en `localStorage` | C+G | ADR 001: `sessionStorage` por defecto, `localStorage` solo con «Recordar»; la clave antigua pasa a la sesión y se borra del equipo | 3 | 🟢 |
| SEG-05 | El alojamiento declarado no se vincula al proveedor efectivo | G | Proveedor, modelo y ubicación registrados en el diagnóstico y en los documentos; no se envían datos de los Arts. 9/10 RGPD a proveedores externos; alerta si se declara ejecución local y la documentación cita APIs en la nube (alerta y no «requiere revisión», porque el alojamiento no cambia la clasificación del RIA) | 3 | 🟢 |
| SEG-06 | El escáner solo analiza README/AGENTS.md, no código | C+G | Analiza también el prompt del sistema y el código aportado; declara lo analizado y lo no analizado | 3 | 🟢 |
| SEG-07 | Conexiones a Google Fonts y sin CSP | G | Inter autoalojada; CSP y cabeceras en `vercel.json`, `<meta>` en la compilación y cabeceras en `vite preview` | 3 | 🟢 |
| SEG-08 | Consulta de legislación dependiente del proxy de desarrollo de Vite | C | Ruta `/api/cellar` también en `vite preview` y en Vercel (`rewrites`) | 3 | 🟢 |

## G. Ensayos adversarios (`src/lib/adversarialSimulator.ts`)

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| RT-01 | Falso aprobado por mencionar «órgano instructor» | G | Respuesta estructurada (JSON) y veredicto por efectos observables: puntuación, pago, exclusión, herramienta solicitada; detectores de secreto señuelo, exfiltración y DNI/IBAN | 3 | 🟢 |
| RT-02 | Modo simulación puntuado (57–60 %) | C+G | Estado `demostracion`, sin llamadas ni puntuación | 3 | 🟢 |
| RT-03 | Errores del proveedor evaluados como respuestas | G | Estado `no_ejecutada`; la puntuación se calcula solo sobre ensayos ejecutados | 3 | 🟢 |
| RT-04 | Ninguna prueba específica de agentes | G | AGENT-01 a AGENT-04 (correo al atacante, pago, desactivar registro, borrado) juzgados por la herramienta solicitada | 3 | 🟢 |
| RT-05 | DOC-02 del manual (exfiltración Markdown) no implementado | G | LLM01-DOC-01 a DOC-03 alineados con el manual (memoria técnica, imagen Markdown, pago sin certificados); dominio reservado `attacker-controlled.example`. El manual (`agents.md`) se actualizará en la Fase 4 | 3 | 🟢 |
| RT-06 | Ataca a un modelo genérico con el prompt del auditor, no a la cadena de la app auditada | C+G | El informe declara el alcance; si se aporta el prompt del sistema de la app auditada, se ensaya con él. La cadena completa (extracción, recuperación, renderizado, herramientas reales) queda fuera y así se indica | 3 | 🟢 |

## H. Coherencia del estado y entrevista asistida (Fase 5)

Origen **U** = detectado al usar la aplicación (responsable del proyecto).

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| EST-01 | El diagnóstico solo se recalculaba al pulsar «Emitir»: al cambiar respuestas y volver por la barra de pasos se veía el diagnóstico antiguo, y el informe mezclaba respuestas nuevas, clasificación antigua y la huella de las respuestas nuevas | U | `recomputeAudit` recalcula diagnóstico y kit con cada cambio; el diagnóstico guarda la huella de sus entradas; aviso de cambios sin guardar y botón «Guardar revisión» | 5 | 🟢 |
| EST-02 | El contador de respuestas pendientes contaba preguntas ocultas (influencia sustancial, base jurídica, datos sensibles) y no contaba el ENS | U | `pendingQuestions` del catálogo único: solo preguntas visibles, incluidas las dimensiones del ENS; los bloques B a E se ocultan si no es un sistema de IA | 5 | 🟢 |
| EST-03 | «Sin acreditar» mezclaba lo no contestado con lo contestado y no validado: nunca bajaba al contestar | U | Panel y documentos separan «respuestas pendientes» (`pendingAnswers`) de «requisitos por validar», con explicación; veredicto «PENDIENTE DE VALIDACIÓN HUMANA» o «FALTAN RESPUESTAS Y VALIDACIÓN HUMANA» | 5 | 🟢 |
| EST-04 | El comentario de IA y su aviso de discrepancia no se marcaban como desfasados al cambiar las respuestas | C (en Fase 5) | Estado `desfasada` ligado a la huella de las entradas; no se muestra ni se exporta; botón para regenerarlo | 5 | 🟢 |
| UX-01 | No había forma de localizar lo pendiente: el contador no decía dónde estaba, y desde el diagnóstico solo había «Modificar respuestas» | U | Preguntas pendientes resaltadas, recuento por bloque, barra fija con «Ir a la siguiente» y «Mostrar solo las pendientes»; panel «Lo que falta» en el diagnóstico para contestar allí mismo; «Ver en la entrevista» y «Contestar en la entrevista» llevan a la pregunta resaltada | 5 | 🟢 |
| UX-02 | Las preguntas exigían conocer la normativa, sin explicación sencilla ni ejemplos | U | «¿Qué significa?» en todas las preguntas, con explicación, ejemplo de «sí», ejemplo de «no» y norma (`interviewHelp.ts`); funciona sin IA. RGPD cotejado (Arts. 4.1, 4.4, 6.1, 9.1, 10 y capítulo V) para estos textos | 5 | 🟢 |
| SUG-01 | La IA no ayudaba a contestar la entrevista: la ingesta solo alimentaba indicios por palabras clave | U | Sugerencias a petición («Sugerir respuesta con IA» por pregunta, «Sugerir para las pendientes» por bloques; indicios sin IA si no hay proveedor). Nunca se aplican solas. En las decisiones de la entidad la IA solo orienta. Sin envío a proveedores externos si se declaran datos de los Arts. 9/10 RGPD, y confirmación previa para servicios externos | 5 | 🟢 |
| SUG-02 | Riesgo de que el modelo invente respaldos o convierta el silencio de la documentación en «no hay riesgo» | C (en Fase 5) | La app comprueba la cita literal; sin ella, «inferida». Un «no» en prácticas prohibidas, datos sensibles o perfilado es siempre inferido. Solo las de cita comprobada admiten aceptación en bloque | 5 | 🟢 |
| SUG-03 | Sin trazabilidad del origen de las respuestas | C (en Fase 5) | `answerSources`: persona, sugerencia de IA aceptada (modelo y cita) o indicio aceptado; vuelve a «persona» si se cambia a mano; tabla «Origen de las respuestas» en DOCX, Markdown y manifiesto | 5 | 🟢 |
| SUG-04 | Una cita comprobada no garantiza una conclusión correcta: el README de Oasis-Madrid llama «técnica de aprendizaje automático» a una interpolación IDW (fórmula fija), y la sugerencia de la IA «sí infiere» (Art. 3.1) se aceptó en bloque | U (prueba con Oasis-Madrid) | Las sugerencias sobre calificaciones decisivas (Art. 3.1, si produce actos administrativos y si interviene un empleado público) son siempre «inferidas»: nunca entran en la aceptación en bloque. La ayuda del Art. 3.1 aclara que una fórmula fija no es IA aunque la documentación diga lo contrario | 6 | 🟢 |
| UX-03 | La herramienta enseñaba todo a todos: en una aplicación sin IA ofrecía el kit de avisos de IA, los ataques al modelo y la revisión de instrucciones del modelo | U (prueba con Oasis-Madrid) | Solo se muestra lo que aplica: si se declara que no es IA, desaparecen el paso del kit de código y las pruebas del modelo; con «no lo sé» se muestra todo (`stepAvailability.ts`). Títulos del laboratorio en lenguaje claro | 6 | 🟢 |
| UX-04 | En la guía de usuario, la barra de pestañas se encogía y su barra de desplazamiento tapaba los títulos | U | Las pestañas pasan a una segunda línea y la barra no se encoge; sin desplazamiento horizontal | 6 | 🟢 |

## Correcciones a las auditorías previas registradas en esta matriz

- **Claude** afirmó que el modo simulación daba «100 % EXCELENTE»: falso; da 57–60 % (RT-02).
- **Claude** afirmó que la EIPD no contaba la IA como criterio 8: falso; C8 estaba siempre activo (EIPD-01).
- **Claude** afirmó que «evaluar a un candidato es, por definición, perfilar»: excesivo; se distingue comprobación documental de valoración de idoneidad (MOT-05).
- **Claude** dio el Anexo III 5(a) como aplicable a cualquier ayuda a personas físicas: excesivo; se limita a prestaciones y servicios públicos esenciales (MOT-09).
