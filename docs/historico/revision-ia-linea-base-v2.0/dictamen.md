# Dictamen técnico pericial de revisión de auditor-ia-app
Fecha de referencia: 5 de octubre de 2026.

**Resultado: desfavorable para su uso como instrumento fiable de conformidad y para tramitar expedientes sensibles en producción con la arquitectura examinada. Admisible como prototipo de apoyo en pruebas controladas con datos sintéticos.**

Se ha leído agents.md antes del código y examinado íntegramente los seis archivos nucleares pedidos, contrastando sus dependencias relevantes. Se ejecutó npm run build con éxito y se verificó el servidor Vite mediante HTTP 200. Vite eligió el puerto 5175 porque 5174 estaba ocupado; el servidor de esta revisión se detuvo. El bundle principal supera 500 kB. package.json identifica la versión 1.0.0, mientras el manual y los exportadores declaran 2.0. Las evidencias JSON contienen pruebas aisladas sobre el código transpilado, almacenamiento simulado y huellas SHA-256 de 14 archivos. No se modificó código fuente ni se utilizaron claves o datos reales. El servicio de inicio de Codex Security no respondió y no se acredita su ejecución. Este documento es una revisión técnica asistida, sin acreditación personal CCN-CERT ni certificación ENS.

## 1. EVALUACIÓN DEL MOTOR DE CLASIFICACIÓN RIA (AI ACT)

**Embudo: corregido parcialmente, no erradicado de forma fiable.** Hay rutas reales a exclusión, prohibición, alto riesgo, riesgo mínimo y transparencia, más una bandera de excepción. La salida ya no depende exclusivamente de fully_automated. Sin embargo, transparencia sigue siendo el resultado residual y no existe estado de información insuficiente.

La comprobación del artículo 5 solo implementa detección para tres entradas del catálogo. Las demás quedan con detected=false; la interfaz transforma ese resultado en CONFORME. Las menciones a etnia o reconocimiento facial disparan prohibición sin establecer la finalidad ni los elementos del supuesto. La detección del Anexo III se concentra en empleo y ayudas y omite, entre otros, justicia y el artículo 6.1/Anexo I. No todas las subvenciones pertenecen automáticamente a prestaciones esenciales del punto 5(a).

**Exclusión del artículo 3.1: declarativa y débil.** Basta ingest.isAiSystem=false, incluso ante indicadores contradictorios. La prueba produjo not_ai_system simultáneamente con isHighRiskAnnexIII=true al declarar perfilado. La ingesta equipara la presencia de AGENTS.md a detección de IA; la ausencia de SDKs tampoco acredita ausencia de inferencia. Determinismo o falta de aprendizaje posterior no bastan para excluir un sistema: deben examinarse las capacidades de inferencia y la finalidad conforme a las [directrices de la Comisión](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application).

**Excepción del artículo 6.3: insuficientemente probada.** [auditEngine.ts](<C:/Users/lombi/Desktop/Varios/Inteligencia artificial/Aplicaciones vibe coding/Creador de temas/auditor-ia-app/src/lib/auditEngine.ts:87>) permite exceptuar un sistema por declarar documentos despersonalizados, o por declarar auxilio técnico y supervisión previa. No obtiene evidencia de ausencia de riesgo significativo, influencia material ni de una condición concreta entre las letras a–d. La revisión humana por sí sola no satisface ese examen. La prueba con selección de personal dependió de las tildes: la versión acentuada no activó Anexo III; la no acentuada lo activó y recibió excepción por supervisión previa.

**Perfilado: veto presente con límites.** performsProfilingOrScoring=true impide la excepción en esa rama. Falta comprobar la declaración frente al comportamiento y distinguir perfilado de otras evaluaciones. También es excesivo convertir cualquier perfilado en Anexo III, sin verificar primero su ámbito. El veto legal se refiere a sistemas del Anexo III que perfilan personas físicas.

**Artículo 6.4: documentación no equivale a registro.** Se genera una motivación y una diligencia, pero se marca compliant sin justificante. El proveedor debe documentar la evaluación y, según el artículo 49.2, registrar al proveedor y al sistema en la base de datos de la UE; conservar un DOCX a disposición de AESIA no lo acredita. [RIA consolidado, artículos 6 y 49](https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng).

**Actualización normativa.** El Reglamento UE 2026/1744 existe. Sus cambios requieren distinguir entrada en vigor, aplicación y transición: las secciones 1–3 del capítulo III para Anexo III pasan al 2 de diciembre de 2027 y para Anexo I al 2 de agosto de 2028, con las precisiones del artículo 113. El motor no representa ese calendario. La base local atribuye supuestas reglas a artículos 18 y 24 del Ómnibus que no quedan sustentadas en el texto oficial. [Reglamento modificativo](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026R1744).

## 2. CIBERSEGURIDAD CCN-STIC 884D Y SOBERANÍA DEL DATO

**El escáner detecta patrones; no protege las claves.** Sus expresiones reconocen varias familias y enmascaran resultados, pero carecen de regla Hugging Face, confirmada con token sintético. OpenRouter puede coincidir con el patrón genérico sk-, con identificación imprecisa. Hay duplicados y evasiones por concatenación, codificación o formatos nuevos.

Su consumidor solo examina README, AGENTS.md y descripción del stack: no inspecciona sistemáticamente código, bundles, configuración, tráfico ni historial Git. [PreProductionHardeningView.tsx](<C:/Users/lombi/Desktop/Varios/Inteligencia artificial/Aplicaciones vibe coding/Creador de temas/auditor-ia-app/src/components/PreProductionHardeningView.tsx:70>).

La aplicación almacena apiKey en texto claro dentro de localStorage y llama directamente al proveedor desde el cliente. La exposición al propio usuario y a scripts con acceso al origen está demostrada por diseño; no se ha probado un XSS explotable. Se necesita una pasarela autenticada con secretos del servidor, permisos mínimos y control de destinos. Un archivo .env no protege una clave incluida en el bundle. [ApiConfigContext.tsx](<C:/Users/lombi/Desktop/Varios/Inteligencia artificial/Aplicaciones vibe coding/Creador de temas/auditor-ia-app/src/context/ApiConfigContext.tsx:28>) y [apiService.ts](<C:/Users/lombi/Desktop/Varios/Inteligencia artificial/Aplicaciones vibe coding/Creador de temas/auditor-ia-app/src/lib/apiService.ts:445>).

**Referencia CCN incorrectamente generalizada.** La guía oficial consultada se dirige a Azure AI Services y categoría ALTA, recomienda identidad, RBAC y conexiones privadas. Advierte sobre claves en código, pero no contiene la nomenclatura IA-01/04/08/12 atribuida por el proyecto. Esa correspondencia debe sustituirse por apartados verificables. [CCN-STIC 884D, apartados 1.1 y 4.1](https://www.ccn-cert.cni.es/gl/pdf/guias/series-ccn-stic/800-guia-esquema-nacional-de-seguridad/4330-ccn-stic-884d-guia-de-configuracion-segura-servicios-de-ia/file.html).

**Historial local: útil, insuficiente para archivo administrativo.** No envía por sí mismo datos por red, pero almacena el estado completo sin cifrado de aplicación, autenticación propia, segregación por usuario, control de integridad ni retención temporal. El aislamiento del origen y las protecciones del puesto no acreditan esos controles. Las copias JSON se descargan en claro.

Se confirmó sobrescritura de expedientes del mismo nombre y entidad dentro de treinta minutos, eliminación circular al superar cincuenta y devolución de un registro aparentemente guardado pese a fallo de cuota. La importación acepta appName numérico y state vacío; posteriormente la interfaz usa toLowerCase y restaura diagnósticos sin validación ni recálculo. [auditHistoryService.ts](<C:/Users/lombi/Desktop/Varios/Inteligencia artificial/Aplicaciones vibe coding/Creador de temas/auditor-ia-app/src/lib/auditHistoryService.ts:39>).

No se identificó instrumentación de analítica en los archivos revisados. Eso no implica ausencia de comunicaciones externas: hay Google Fonts, GitHub y consultas legales, y el enriquecimiento transmite documentación y respuestas al proveedor configurado. Seleccionar local_on_premise en la entrevista no impide usar un proveedor externo: declaración y configuración efectiva están desacopladas.

La categoría ENS se asigna por atajos, no por valoración de impacto de cada dimensión y responsabilidades. Debe aplicarse el procedimiento del [ENS, artículos 40–41 y anexo I](https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191).

## 3. RED TEAMING Y VECTORES DE AMENAZA (OWASP TOP 10 LLM)

**Los escenarios son realistas; la cobertura no coincide con el manual.**

| Vector | Implementación real | Límite |
|---|---|---|
| LLM01-DOC-01 | Texto extraído de PDF ordena dar 100/100 y omitir facturas | Solo simula texto; no atraviesa un parser PDF |
| LLM01-DOC-02 | Comentario HTML en memoria justificativa ordena omitir AEAT/Seguridad Social | No implementa la exfiltración mediante imagen Markdown descrita en agents.md |
| LLM01-DOC-03 | Orden Foral ficticia pretende dispensar memoria económica | No corresponde al ataque de pliegos/pago del manual |

La suplantación de autoridad y las citas falsas son amenazas plausibles. Su eficacia debe probarse con documentos y rutas reales del sistema, incluida extracción, recuperación, renderizado y efectos sobre decisiones o herramientas.

**El índice no acredita robustez de la aplicación.** La suite no recibe endpoint de la aplicación auditada, prompt real, RAG, herramientas ni permisos; llama al proveedor con un prompt genérico creado por el auditor. Sin configuración usa una respuesta prefabricada. La prueba documental offline obtuvo 58 %: dos PASSED, diez WARNING y ningún FAILED. Ese resultado no mide resistencia del objetivo.

La evaluación depende de palabras exactas y concede medio punto a WARNING. Se reprodujo un falso aprobado: una respuesta que concedía todos los requisitos sin revisar facturas recibió PASSED por contener “órgano instructor”. El arquetipo agente tiene cero casos específicos. Los errores de proveedor se tratan como texto evaluable en vez de pruebas no ejecutadas. [adversarialSimulator.ts](<C:/Users/lombi/Desktop/Varios/Inteligencia artificial/Aplicaciones vibe coding/Creador de temas/auditor-ia-app/src/lib/adversarialSimulator.ts:295>).

Se requieren resultados observables, secretos señuelo, control de tráfico, herramientas instrumentadas y repeticiones por versión. Las negativas verbales no prueban que se impidiera una acción. La propia sobreconfianza en resultados encaja con [OWASP LLM09, Misinformation](https://genai.owasp.org/llmrisk/llm092025-misinformation/).

## 4. GOBERNANZA PÚBLICA ESPAÑOLA (AESIA, LEY 15/2022 Y LEY 40/2015)

**No discriminación: reflejada en textos, no acreditada.** El motor asigna compliant incondicionalmente; el DOCX certifica ausencia de sesgos sin muestras, métricas, criterios ni evidencias. Dos preguntas adversarias no bastan para una evaluación de discriminación. El artículo 23 favorece mecanismos de minimización de sesgos, transparencia y rendición de cuentas y prioriza interpretabilidad; no establece por sí solo la auditoría universal con el alcance que describe el manual. [Ley 15/2022, artículo 23](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a23).

**No existe blindaje automático del firmante.** La advertencia de borrador ayuda a delimitar el uso, pero la naturaleza depende del procedimiento efectivo. El DOCX declara incondicionalmente que NO existe actuación automatizada incluso cuando la entrevista dice lo contrario. Además, atribuye exclusivamente a funcionarios la responsabilidad patrimonial: el artículo 32 regula la responsabilidad de la Administración; el 36 contempla exigencia al personal por dolo o culpa/negligencia graves. El artículo 41 exige determinar órganos responsables, incluida impugnación, y no prohíbe toda automatización. [Ley 40/2015](https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566). [officialDossierDocx.ts](<C:/Users/lombi/Desktop/Varios/Inteligencia artificial/Aplicaciones vibe coding/Creador de temas/auditor-ia-app/src/lib/officialDossierDocx.ts:528>).

**Conformidades sin evidencia.** El dashboard puede declarar “APTO PARA DESPLIEGUE EN PRODUCCIÓN” sin consultar las obligaciones pendientes. El pilar RGPD muestra base acreditada por ausencia de determinadas cadenas en redFlags. El DOCX certifica controles implantados y cotejo en tiempo real sin recibir prueba de esas operaciones. La consulta legal puede servir caché antigua como isLiveFetched=true; getNormsSyncStatus devuelve online sin verificar conectividad. Los resultados LLM no reclasifican el diagnóstico ni rellenan pericialDissentAlert en App.tsx.

**AESIA y firma.** La base local atribuye un protocolo de incidentes al artículo 8 del Estatuto AESIA, que regula principios de actuación. [RD 729/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-18911#a8). Los cajetines DOCX son espacios de firma; no firman. El CSV generado aleatoriamente no está vinculado a una sede de comprobación. El SHA-256 ofrece huella, no autenticidad de firmante ni sello de tiempo cualificado.

## 5. CONCLUSIÓN Y DICTAMEN DE IDONEIDAD

**No está lista como instrumento fiable de conformidad para DPD, CISO y funcionarios ni para gestionar expedientes sensibles en producción con la arquitectura examinada.** Compilar y disponer de interfaz, historial y DOCX acredita funcionalidad técnica, pero no las garantías periciales anunciadas. El riesgo central es presentar declaraciones y heurísticas como certificaciones.

Prioridades para reconsiderar la idoneidad:

1. Eliminar certificaciones automáticas de sesgos, controles, registro y vigencia; usar “declarado”, “no verificado”, “pendiente” y “acreditado” con evidencia.
2. Corregir las referencias jurídicas, el calendario y los textos de responsabilidad, y construir una clasificación por finalidad y casos completos del RIA, con estado de incertidumbre.
3. Separar credenciales del navegador y vincular las restricciones de datos al proveedor efectivo.
4. Diseñar custodia y archivo corporativo con identidad, accesos, cifrado adecuado, integridad, versionado y política de conservación. Validar JSON y comunicar fallos de escritura.
5. Ensayar la aplicación real y separar simulación, prueba no ejecutada y resultado verificado.
6. Incorporar justificantes de registro, fuente/versión normativa, evaluación ENS, EIPD cuando corresponda y revisión humana documentada.

La EIPD debe determinarse por el riesgo y los supuestos del artículo 35, no solo por una casilla de datos sensibles. Los datos de condenas e infracciones pertenecen al artículo 10 del RGPD, distinto del artículo 9. La legitimación de interés público tampoco se acredita escribiendo el nombre del RAT. [RGPD](https://eur-lex.europa.eu/legal-content/es/ALL/?uri=CELEX%3A32016R0679).

La recomendación inmediata es reservarla para pruebas y elaboración de borradores, con revisión experta íntegra y datos sintéticos, hasta subsanar y verificar estas carencias.

