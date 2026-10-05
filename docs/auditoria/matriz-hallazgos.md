# Matriz de hallazgos y trazabilidad de correcciones

> Relaciona cada hallazgo de las auditorías independientes (Claude Opus 5.5 y GPT Sol 6.1) con su reproducción, el comportamiento esperado, la fase que lo corrige y la prueba que lo verifica.
> **Línea base:** commit `48956a6` · `npm test` el 05/10/2026: **50 pruebas, 49 en rojo, 1 en verde** (DOC-06). Los hallazgos ⚪ dependen de decisiones de diseño de su fase (modelo de requisitos, papeles, calendario, ADR 001) y su prueba se escribirá al inicio de esa fase, antes de corregir.
> **Cierre de la Fase 1** (05/10/2026): **55 pruebas, 29 en verde y 26 en rojo**. Las 26 en rojo corresponden a hallazgos asignados a las Fases 2 y 3. Se añaden NOR-10, DOC-11, DOC-12, ALM-06 y EIPD-04, detectados o introducidos durante la fase.
> **Cierre de la Fase 2** (05/10/2026): **69 pruebas, 56 en verde y 13 en rojo**. Las 13 en rojo son hallazgos de la Fase 3 (ALM, RT y SEG). Las pruebas del motor se reescribieron para la entrevista v2 («sí / no / desconocido») conservando la intención de cada una; se añaden MOT-23 a MOT-26, EIPD-05 y DOC-13.

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
| DOC-09 | Carpeta `Resultados prueba…` generada por script con textos fijos (incluye IA-01 «CONFORME» para claves en cliente) | C | Rotular procedencia; regenerar con el motor | 1 y 4 | 🟢 |
| DOC-10 | Formato, firma y metadatos sin ajustar a la política institucional (NTI) | C (+G matiz) | Decisión de interoperabilidad documentada | 4 | ⚪ |
| DOC-11 | Los documentos no identificaban versión del motor, corte normativo ni entradas utilizadas | G | Versión, corte normativo y huella SHA-256 de las entradas en DOCX, Markdown y manifiesto | 1 | 🟢 |
| DOC-12 | Cada exportador reconstruía sus propias conformidades (el manifiesto fijaba además `ley_40_2015_art_41_automated_act: false`) | C+G | Cuadro de mando, DOCX, Markdown y manifiesto consumen el mismo modelo y expresan el mismo veredicto | 1 | 🟢 |
| DOC-13 | El cuadro de mando mostraba un banner fijo «Sincronización Normativa Telemática Activa · Normas vigentes verificadas» | C (en Fase 2) | Banner de consulta que indica el corte normativo y remite a las fuentes oficiales | 2 | 🟢 |

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
| ALM-01 | Sobrescritura de auditorías de la misma app en 30 minutos | C+G | Revisiones añadidas | 3 | 🔴 |
| ALM-02 | Guardado fallido devuelto como correcto | G | Error comunicado | 3 | 🔴 |
| ALM-03 | Importación de registros malformados | C+G | Validación de esquema | 3 | 🔴 |
| ALM-04 | Importación de clasificaciones inexistentes | C+G | Validación de valores | 3 | 🔴 |
| ALM-05 | Purga silenciosa al superar 50 registros; registros antiguos mostrados como si pasaran el motor nuevo | C+G | Política de conservación; «motor vX, no recalculado» | 3 | ⚪ |
| ALM-06 | Registros guardados por el motor anterior podían mostrarse como si hubieran pasado el motor nuevo; pilares vacíos se mostraban como «Requisitos acreditados» | G (+C en Fase 1) | Migración a «no verificado», versión «no recalculado» y pilares sin requisitos como «Sin requisitos evaluados» | 1 | 🟢 |

## F. Seguridad del auditor

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| SEG-01 | Escáner sin patrón `hf_` | C+G | Detectar | 3 | 🔴 |
| SEG-02 | Claves `sk-ant-` notificadas dos veces | G | Una sola notificación | 3 | 🔴 |
| SEG-03 | Clave de Gemini en la URL | C | Cabecera, nunca URL | 3 | 🔴 |
| SEG-04 | Claves persistidas en claro en `localStorage` | C+G | Según ADR 001 | 3 | ⚪ |
| SEG-05 | El alojamiento declarado no se vincula al proveedor efectivo | G | Registrar proveedor efectivo; contradicción → revisión | 3 | ⚪ |
| SEG-06 | El escáner solo analiza README/AGENTS.md, no código | C+G | Alcance declarado y ficheros de código aportados | 3 | ⚪ |
| SEG-07 | Conexiones a Google Fonts y sin CSP | G | Fuentes autoalojadas; CSP | 3 | 🔴 |
| SEG-08 | Consulta de legislación dependiente del proxy de desarrollo de Vite | C | Funcionar en producción o declararlo | 3 | ⚪ |

## G. Ensayos adversarios (`src/lib/adversarialSimulator.ts`)

| ID | Hallazgo | Origen | Comportamiento esperado | Fase | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| RT-01 | Falso aprobado por mencionar «órgano instructor» | G | Veredicto por efectos observables | 3 | 🔴 |
| RT-02 | Modo simulación puntuado (57–60 %) | C+G | `demostración`, sin puntuación | 3 | 🔴 |
| RT-03 | Errores del proveedor evaluados como respuestas | G | `no ejecutada` | 3 | 🔴 |
| RT-04 | Ninguna prueba específica de agentes | G | Batería de agentes | 3 | 🔴 |
| RT-05 | DOC-02 del manual (exfiltración Markdown) no implementado | G | Alinear manual y código | 3 | 🔴 |
| RT-06 | Ataca a un modelo genérico con el prompt del auditor, no a la cadena de la app auditada | C+G | Rotular alcance o recorrer la cadena real | 3 | ⚪ |

## Correcciones a las auditorías previas registradas en esta matriz

- **Claude** afirmó que el modo simulación daba «100 % EXCELENTE»: falso; da 57–60 % (RT-02).
- **Claude** afirmó que la EIPD no contaba la IA como criterio 8: falso; C8 estaba siempre activo (EIPD-01).
- **Claude** afirmó que «evaluar a un candidato es, por definición, perfilar»: excesivo; se distingue comprobación documental de valoración de idoneidad (MOT-05).
- **Claude** dio el Anexo III 5(a) como aplicable a cualquier ayuda a personas físicas: excesivo; se limita a prestaciones y servicios públicos esenciales (MOT-09).
