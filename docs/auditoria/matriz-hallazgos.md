# Matriz de hallazgos y trazabilidad de correcciones

> Relaciona cada hallazgo de las auditorías independientes (Claude Opus 5.5 y GPT Sol 6.1) con su reproducción, el comportamiento esperado, la fase que lo corrige y la prueba que lo verifica.
> **Línea base:** commit `48956a6` · `npm test` el 05/10/2026: **50 pruebas, 49 en rojo, 1 en verde** (DOC-06). Los hallazgos ⚪ dependen de decisiones de diseño de su fase (modelo de requisitos, papeles, calendario, ADR 001) y su prueba se escribirá al inicio de esa fase, antes de corregir.
> **Cierre de la Fase 1** (05/10/2026): **55 pruebas, 29 en verde y 26 en rojo**. Las 26 en rojo corresponden a hallazgos asignados a las Fases 2 y 3. Se añaden NOR-10, DOC-11, DOC-12, ALM-06 y EIPD-04, detectados o introducidos durante la fase.
> **Cierre de la Fase 2** (05/10/2026): **69 pruebas, 56 en verde y 13 en rojo**. Las 13 en rojo son hallazgos de la Fase 3 (ALM, RT y SEG). Las pruebas del motor se reescribieron para la entrevista v2 («sí / no / desconocido») conservando la intención de cada una; se añaden MOT-23 a MOT-26, EIPD-05 y DOC-13.
> **Fase 3 · entrega 3.1** (07/10/2026): **111 pruebas, 102 en verde y 9 en rojo**. Los 9 en rojo son de custodia (ALM-01 a ALM-04, entrega 3.2) y red teaming (RT-01 a RT-05, entrega 3.3). Arquitectura de proveedores y credenciales igual que *Opositor transparente* (ADR 001). El selector de modelo deja de usar listas fijas: muestra solo los modelos que devuelve el proveedor para la clave o el servidor indicados. La prueba SEG-07 de la Fase 0 se adapta: la CSP se comprueba en la página compilada, porque en desarrollo la impediría el refresco en caliente de Vite.
> **Fase 3 · entrega 3.2** (07/10/2026): **118 pruebas, 113 en verde y 5 en rojo** (RT-01 a RT-05, entrega 3.3). Historial con revisiones, errores de guardado comunicados, importación validada y política de conservación documentada. La prueba ALM-01 de la Fase 0 se conserva: sin expediente indicado, cada guardado abre uno nuevo.
> **Cierre de la Fase 3** (07/10/2026): **125 pruebas, 125 en verde**. Entrega 3.3: ensayos adversarios juzgados por efectos observables, estados `demostracion` y `no_ejecutada`, batería de agentes y alcance declarado. Categorías OWASP cotejadas con la lista oficial de 2025 (la extracción de instrucciones pasa a LLM07 y la exfiltración por Markdown se atribuye también a LLM05). La prueba RT-01 de la Fase 0 se conserva y se añaden pruebas de efectos, detectores y alcance.
> **Fase 4 · entregas 4.1 y 4.2** (07/10/2026): **148 pruebas en verde**. 11 casos de referencia (`src/test/referenceCases.ts`) con resultado esperado y concordancia de DOCX, Markdown y manifiesto; generador `npm run ejemplos` que ejecuta el motor real. Los casos de referencia revelaron DOC-14.
> **Fase 4 · entregas 4.3 y 4.4** (07/10/2026): **149 pruebas en verde**. Comprobación de principio a fin en el navegador (entrevista contestada desde la interfaz; panel, Markdown y manifiesto concordantes en clasificación, alerta y huella). Formato documental cotejado con la Ley 39/2015 (Arts. 26 y 70), la NTI de Documento Electrónico y la NTI de Catálogo de estándares.

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
| DOC-07 | «CSV» aleatorio no verificable y diligencia que «certifica» | C+G | «Identificador interno», sin certificación | 1 | 🟢 |
| DOC-08 | Texto del LLM incrustado en el DOCX sin marca de procedencia | C | Rotulado como análisis asistido no verificado | 1 | 🟢 |
| DOC-09 | Carpeta `Resultados prueba…` generada por script con textos fijos (incluye IA-01 «CONFORME» para claves en cliente) | C | Resultados regenerados por el motor (`npm run ejemplos`); los antiguos, con su script, en `historico-no-motor/` | 1 y 4 | 🟢 |
| DOC-10 | Formato, firma y metadatos sin ajustar a la política institucional (NTI) | C (+G matiz) | `docs/formato-documental.md`: la herramienta genera borradores (OOXML Transitional y Markdown) y el manifiesto; la conversión a PDF/A, los metadatos ENI, la firma y el CSV se hacen en el gestor de expedientes. Metadatos de fichero que declaran la naturaleza del documento. Decisión pendiente de validar por la Diputación | 4 | 🟢 |
| DOC-11 | Los documentos no identificaban versión del motor, corte normativo ni entradas utilizadas | G | Versión, corte normativo y huella SHA-256 de las entradas en DOCX, Markdown y manifiesto | 1 | 🟢 |
| DOC-12 | Cada exportador reconstruía sus propias conformidades (el manifiesto fijaba además `ley_40_2015_art_41_automated_act: false`) | C+G | Cuadro de mando, DOCX, Markdown y manifiesto consumen el mismo modelo y expresan el mismo veredicto | 1 | 🟢 |
| DOC-13 | El cuadro de mando mostraba un banner fijo «Sincronización Normativa Telemática Activa · Normas vigentes verificadas» | C (en Fase 2) | Banner de consulta que indica el corte normativo y remite a las fuentes oficiales | 2 | 🟢 |
| DOC-14 | Las alertas y recomendaciones del motor solo se mostraban en el panel: ningún documento exportado las recogía | C (en Fase 4, casos de referencia) | Sección «Alertas para la revisión» y «Recomendaciones» en DOCX y Markdown; `review_alerts` y `recommendations` en el manifiesto; el panel deja de hablar de «alertas de infracción» | 4 | 🟢 |

## D. EIPD (`src/lib/eipdGenerator.ts`)

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| EIPD-01 | C8 (tecnología innovadora) en `applies: true` para cualquier sistema | G (corrige a C) | Valoración motivada | 2 | 🟢 |
| EIPD-02 | C9 rotulado como «transferencias internacionales» | G | Impedimento al ejercicio de derechos (WP248) | 2 | 🟢 |
| EIPD-03 | Sin cálculo de riesgo residual; C3/C6 fijos en `false`; WP248 y lista AEPD mezclados | C+G | Riesgo inherente → medidas → residual; numeraciones separadas | 2 | 🟢 |
| EIPD-04 | El borrador de EIPD redactaba el dictamen del DPD («FAVORABLE PARA EL PASO A PRODUCCIÓN»), se presentaba como «Metodología Oficial de la AEPD» y daba por implantadas medidas no comprobadas | C (en Fase 1) | Borrador rotulado como tal; medidas como declaradas o pendientes; dictamen en blanco para el DPD | 1 | 🟢 |
| EIPD-05 | La necesidad de EIPD era binaria y presumía «obligatoria» con datos sensibles | G | Cribado «necesaria / no indicada / por determinar» con el umbral de dos criterios de WP248 o de la lista de la AEPD | 2 | 🟢 |

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

## Correcciones a las auditorías previas registradas en esta matriz

- **Claude** afirmó que el modo simulación daba «100 % EXCELENTE»: falso; da 57–60 % (RT-02).
- **Claude** afirmó que la EIPD no contaba la IA como criterio 8: falso; C8 estaba siempre activo (EIPD-01).
- **Claude** afirmó que «evaluar a un candidato es, por definición, perfilar»: excesivo; se distingue comprobación documental de valoración de idoneidad (MOT-05).
- **Claude** dio el Anexo III 5(a) como aplicable a cualquier ayuda a personas físicas: excesivo; se limita a prestaciones y servicios públicos esenciales (MOT-09).
