/**
 * Consultor Normativo RAG Local Offline
 * Base de conocimiento indexada en memoria para el sector público español y europeo.
 * Funciona al 100% en el navegador sin enviar peticiones a servidores externos (Zero Cloud Leakage).
 */

export interface NormativeDocument {
  id: string;
  normName: string;
  shortCode: string;
  category: 'AI_ACT' | 'ENS' | 'RGPD' | 'PROCEDIMIENTO_ADM' | 'OMNIBUS';
  articleNumber: string;
  title: string;
  literalText: string;
  practicalInterpretation: string;
  publicSectorImpact: string;
  tags: string[];
}

export interface RagQueryResult {
  document: NormativeDocument;
  relevanceScore: number;
  matchedHighlights: string[];
}

export const NORMATIVE_CORPUS: NormativeDocument[] = [
  // --- AI ACT (Reglamento UE 2024/1689) ---
  {
    id: 'RIA-ART-05',
    normName: 'Reglamento (UE) 2024/1689 (AI Act)',
    shortCode: 'Art. 5 RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 5',
    title: 'Prácticas de Inteligencia Artificial Prohibidas',
    literalText: `Quedan terminantemente prohibidas en la Unión Europea:
a) El despliegue de técnicas subliminales o deliberadamente manipuladoras para alterar de forma apreciable el comportamiento de una persona menoscabando su capacidad de tomar una decisión con conocimiento de causa.
b) El aprovechamiento de vulnerabilidades de personas por motivos de edad, discapacidad o situación socioeconómica.
c) La evaluación o clasificación de personas físicas durante un periodo de tiempo determinado basada en su comportamiento social o en rasgos de su personalidad (Puntuación social / Social Scoring).
d) La utilización de sistemas de identificación biométrica remota "en tiempo real" en espacios de acceso público con fines policiales, salvo excepciones tasadas.`,
    practicalInterpretation: 'Ninguna administración pública española puede desplegar herramientas de IA que manipulen el comportamiento ciudadano, hagan scoring social generalizado o utilicen biometría no consentida en la calle.',
    publicSectorImpact: 'Cualquier indicio de estas prácticas en un organismo público conlleva la prohibición absoluta e inmediata y sanciones de hasta 35 millones de euros o el 7% del volumen global.',
    tags: ['prohibido', 'artículo 5', 'social scoring', 'puntuación social', 'manipulación', 'biometría', 'inadmisible'],
  },
  {
    id: 'RIA-ART-06-ANEXO-III',
    normName: 'Reglamento (UE) 2024/1689 (AI Act)',
    shortCode: 'Art. 6 y Anexo III RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 6 y Anexo III',
    title: 'Clasificación de Sistemas de IA de Alto Riesgo',
    literalText: `Se consideran de alto riesgo los sistemas de IA contemplados en el Anexo III:
Punto 4: Empleo, gestión de trabajadores y acceso al autoempleo (selección o contratación, asignación de tareas, supervisión y evaluación del rendimiento).
Punto 5: Acceso a servicios privados esenciales y a servicios públicos y prestaciones esenciales (evaluar admisibilidad de personas a prestaciones de asistencia social, ayudas públicas o vivienda; asignación de servicios de emergencia).
Punto 6: Asuntos policiales y aplicación de la ley.
Punto 7: Gestión de la migración, asilo y control fronterizo.
Punto 8: Administración de justicia y procesos democráticos.`,
    practicalInterpretation: 'Si una aplicación pública evalúa aspirantes a un puesto de trabajo (OEP, bolsas) o barema solicitantes de ayudas, becas, subvenciones o vivienda pública, es AUTOMÁTICAMENTE de Alto Riesgo.',
    publicSectorImpact: 'Exige marcado CE previo, evaluación de conformidad rigurosa, auditoría de sesgos en datos de entrenamiento, registro en la base de datos de la UE y supervisión humana permanente.',
    tags: ['alto riesgo', 'anexo iii', 'empleo', 'oposiciones', 'subvenciones', 'ayudas', 'prestaciones', 'justicia', 'marcado ce'],
  },
  {
    id: 'RIA-ART-14',
    normName: 'Reglamento (UE) 2024/1689 (AI Act)',
    shortCode: 'Art. 14 RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 14',
    title: 'Supervisión Humana (Human Oversight)',
    literalText: `1. Los sistemas de IA de alto riesgo se diseñarán y desarrollarán de tal forma que puedan ser supervisados eficazmente por personas físicas durante el periodo en que estén en uso.
2. La supervisión humana tendrá por objeto prevenir o reducir al mínimo los riesgos para la salud, la seguridad o los derechos fundamentales.
3. Las personas encargadas de la supervisión humana deberán comprender las capacidades y limitaciones del sistema, ser conscientes de la tendencia a confiar ciegamente en las salidas ("automation bias") y disponer de la capacidad de anular o revertir en cualquier momento las decisiones tomadas por el sistema.`,
    practicalInterpretation: 'No se permite que una IA tome decisiones finales que afecten a los derechos de los ciudadanos sin que un funcionario público cualificado pueda revisar, modificar o anular el borrador propuesto por la máquina.',
    publicSectorImpact: 'Debe nombrarse a una jefatura o funcionario responsable con formación técnica e incluir en el software una barrera ("Human-in-the-Loop") que detenga la tramitación hasta el visto bueno humano.',
    tags: ['supervisión humana', 'artículo 14', 'human in the loop', 'sesgo de automatización', 'anulación', 'funcionario'],
  },
  {
    id: 'RIA-ART-50',
    normName: 'Reglamento (UE) 2024/1689 (AI Act)',
    shortCode: 'Art. 50 RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 50',
    title: 'Obligaciones de Transparencia para Sistemas de IA',
    literalText: `1. Los proveedores y responsables del despliegue garantizarán que los sistemas de IA destinados a interactuar directamente con personas físicas se diseñen de forma que se informe a dichas personas de que están interactuando con un sistema de IA, salvo que ello resulte obvio por las circunstancias.
2. Los responsables del despliegue de un sistema de IA que genere o manipule imágenes, audio o vídeo ("ultrafalsificaciones" o deepfakes) revelarán que el contenido ha sido generado o manipulado artificialmente.
3. Los textos generados por IA destinados a informar al público sobre asuntos de interés público deberán ser identificados de forma visible y clara como generados mediante IA.`,
    practicalInterpretation: 'Cualquier sede electrónica, chatbot municipal, generador de formularios o asistente virtual debe mostrar un cartel o aviso visible y destacado notificando al ciudadano que el servicio cuenta con apoyo de IA.',
    publicSectorImpact: 'Obligatoriedad de incorporar el banner de transparencia y rotular todos los documentos, resoluciones o informes que hayan sido redactados o asistidos por inteligencia artificial.',
    tags: ['transparencia', 'artículo 50', 'banner', 'aviso', 'chatbot', 'identificación', 'sede electrónica'],
  },

  // --- ENS (Real Decreto 311/2022) & CCN-STIC ---
  {
    id: 'ENS-RD-311-ART-27',
    normName: 'Real Decreto 311/2022 (Esquema Nacional de Seguridad)',
    shortCode: 'Art. 27 RD 311/2022',
    category: 'ENS',
    articleNumber: 'Artículo 27',
    title: 'Registro de la Actividad de los Usuarios y Trazabilidad (op.exp.8)',
    literalText: `Se registrarán las actividades de los usuarios, las incidencias, las excepciones y los eventos de seguridad para asegurar la trazabilidad de los accesos y las operaciones en los sistemas de información.
Los registros deberán conservarse durante un periodo de tiempo adecuado (mínimo de 24 meses en sistemas de categoría media o alta) y estar protegidos contra accesos no autorizados, modificaciones o destrucciones mediante mecanismos de sellado criptográfico.`,
    practicalInterpretation: 'Todas las llamadas al modelo de IA, las preguntas realizadas y las respuestas emitidas deben quedar registradas con fecha y hora exacta, usuario tramitador y hash SHA-256 inmutable.',
    publicSectorImpact: 'Exige habilitar una base de datos o almacenamiento de auditoría inmutable donde se guarden los logs durante al menos dos años para responder a recursos administrativos o inspecciones del CCN-CERT.',
    tags: ['ens', 'rd 311/2022', 'logs', 'registro', 'trazabilidad', 'sha-256', '24 meses', 'ccn-stic'],
  },
  {
    id: 'CCN-STIC-884D-IA01',
    normName: 'Guía CCN-STIC 884D (Centro Criptológico Nacional)',
    shortCode: 'CCN-STIC 884D',
    category: 'ENS',
    articleNumber: 'Medida IA-01 a IA-08',
    title: 'Seguridad en el Despliegue de Modelos de Inteligencia Artificial',
    literalText: `Directrices obligatorias para la implantación de modelos de lenguaje en las Administraciones Públicas:
IA-01: Prohibición expresa de incrustar claves API o secretos criptográficos en código cliente accesible desde el navegador.
IA-02: Sanitización de entradas previa a la inferencia para prevenir ataques de inyección indirecta (Prompt Injection).
IA-04: Soberanía del dato: Si se procesan datos no clasificados pero de difusión limitada o del Art. 9 RGPD, la inferencia debe ejecutarse en infraestructuras On-Premise o en Nubes Gubernamentales certificadas ENS Nivel Alto.
IA-08: Firma y sellado de tiempo de las recomendaciones generadas para asegurar el no repudio.`,
    practicalInterpretation: 'El CCN prohíbe terminantemente usar nubes comerciales sin garantías para datos ciudadanos sensibles y exige escudos contra inyecciones y firma electrónica de las salidas.',
    publicSectorImpact: 'Obliga a las entidades públicas a priorizar servidores locales (Ollama/vLLM) en sus propios CPDs o contratar nubes comunitarias con acreditación ENS Alto y DPA europeo.',
    tags: ['ccn-stic', '884d', 'api keys', 'soberanía', 'on premise', 'ollama', 'inyección', 'ciberseguridad'],
  },

  // --- PROCEDIMIENTO ADMINISTRATIVO (Leyes 39/2015 y 40/2015) ---
  {
    id: 'LEY-40-ART-41',
    normName: 'Ley 40/2015 de Régimen Jurídico del Sector Público',
    shortCode: 'Art. 41 Ley 40/2015',
    category: 'PROCEDIMIENTO_ADM',
    articleNumber: 'Artículo 41',
    title: 'Actuación Administrativa Automatizada',
    literalText: `1. Se entiende por actuación administrativa automatizada cualquier acto o actuación realizada íntegramente a través de medios electrónicos por una Administración Pública en el marco de un procedimiento administrativo y en la que no haya intervenido de forma directa un empleado público.
2. En caso de actuación administrativa automatizada deberá establecerse previamente el órgano u órganos competentes, según los casos, para la definición de las especificaciones, programación, mantenimiento, supervisión y control de calidad. Se indicará asimismo el órgano que debe ser considerado responsable a efectos de impugnación.`,
    practicalInterpretation: 'Si una IA resolviera un trámite sin que un funcionario revise el caso, se consideraría Actuación Administrativa Automatizada. Esto exige una resolución formal previa de la Alcaldía o Consejería que apruebe el algoritmo y nombre al responsable legal impugnable.',
    publicSectorImpact: 'Para evitar la complejidad legal de la actuación automatizada pura, la inmensa mayoría de apps públicas de IA deben configurarse como herramientas de AUXILIO TÉCNICO con firma humana posterior.',
    tags: ['ley 40/2015', 'artículo 41', 'actuación administrativa automatizada', 'órgano competente', 'impugnación', 'responsable'],
  },
  {
    id: 'LEY-39-ART-53',
    normName: 'Ley 39/2015 del Procedimiento Administrativo Común',
    shortCode: 'Art. 53 Ley 39/2015',
    category: 'PROCEDIMIENTO_ADM',
    articleNumber: 'Artículo 53',
    title: 'Derechos del Interesado en el Procedimiento Administrativo',
    literalText: `Los interesados tienen derecho:
a) A conocer, en cualquier momento, el estado de la tramitación de los procedimientos en los que tengan la condición de interesados.
b) A identificar a las autoridades y al personal al servicio de las Administraciones Públicas bajo cuya responsabilidad se tramiten los procedimientos.
c) A no presentar documentos que ya se encuentren en poder de la Administración actuante o hayan sido elaborados por cualquier otra Administración.`,
    practicalInterpretation: 'El administrado siempre tiene derecho a saber qué persona física es responsable de su expediente. La administración nunca puede escudarse en que "el sistema o la IA lo decidió así".',
    publicSectorImpact: 'El informe final emitido tras una asistencia de IA debe consignar la identidad del funcionario tramitador o del tribunal calificador.',
    tags: ['ley 39/2015', 'artículo 53', 'derechos del interesado', 'identificación del funcionario', 'transparencia'],
  },

  // --- RGPD (Reglamento UE 2016/679) & EIPD ---
  {
    id: 'RGPD-ART-22',
    normName: 'Reglamento General de Protección de Datos (UE 2016/679)',
    shortCode: 'Art. 22 RGPD',
    category: 'RGPD',
    articleNumber: 'Artículo 22',
    title: 'Decisiones Individuales Automatizadas, Incluida la Elaboración de Perfiles',
    literalText: `1. Todo interesado tendrá derecho a no ser objeto de una decisión basada únicamente en el tratamiento automatizado, incluida la elaboración de perfiles, que produzca efectos jurídicos en él o le afecte significativamente de modo similar.
2. El apartado 1 no se aplicará si la decisión:
a) Es necesaria para la celebración o cumplimiento de un contrato.
b) Está autorizada por el Derecho de la Unión o de los Estados miembros que se aplique al responsable del tratamiento.
c) Se basa en el consentimiento explícito del interesado.
En todo caso, el responsable del tratamiento adoptará medidas adecuadas para salvaguardar los derechos y libertades del interesado, como mínimo el derecho a obtener intervención humana, a expresar su punto de vista y a impugnar la decisión.`,
    practicalInterpretation: 'Si una IA deniega una ayuda o descarta un currículum sin que un humano participe realmente, se vulnera el Art. 22 del RGPD salvo que exista una ley estatal con rango formal que lo ampare expresamente.',
    publicSectorImpact: 'Es preceptivo garantizar el derecho del ciudadano a solicitar la revisión humana del dictamen.',
    tags: ['rgpd', 'artículo 22', 'decisiones automatizadas', 'perfiles', 'intervención humana', 'impugnación', 'derechos'],
  },
  {
    id: 'RGPD-ART-35',
    normName: 'Reglamento General de Protección de Datos (UE 2016/679)',
    shortCode: 'Art. 35 RGPD',
    category: 'RGPD',
    articleNumber: 'Artículo 35',
    title: 'Evaluación de Impacto Relativa a la Protección de Datos (EIPD / DPIA)',
    literalText: `1. Cuando sea probable que un tipo de tratamiento, en particular si utiliza nuevas tecnologías, por su naturaleza, alcance, contexto o fines, entrañe un alto riesgo para los derechos y libertades de las personas físicas, el responsable del tratamiento realizará, antes del tratamiento, una evaluación del impacto de las operaciones de tratamiento en la protección de datos personales.
2. El responsable del tratamiento recabará el asesoramiento del Delegado de Protección de Datos (DPD) al realizar la evaluación de impacto.`,
    practicalInterpretation: 'En la administración pública, casi cualquier uso de IA con datos personales ciudadanos (salud, tributarios, ayudas o empleo) activa obligatoriamente la redacción previa de una EIPD según la guía oficial de la AEPD.',
    publicSectorImpact: 'Debe redactarse el documento de Evaluación de Impacto de 20 páginas y remitirse al DPD de la entidad antes del despliegue en producción.',
    tags: ['eipd', 'artículo 35', 'dpia', 'aepd', 'evaluación de impacto', 'dpd', 'alto riesgo', 'datos personales'],
  },

  // --- ÓMNIBUS DIGITAL (Reglamento UE 2026/1744) ---
  {
    id: 'OMNIBUS-UE-2026',
    normName: 'Reglamento (UE) 2026/1744 (Ómnibus Digital Europeo)',
    shortCode: 'Ómnibus Digital 2026/1744',
    category: 'OMNIBUS',
    articleNumber: 'Artículos de Armonización y Cargas',
    title: 'Simplificación de Trámites y Neutralidad Tecnológica en el Sector Público',
    literalText: `El Paquete Ómnibus Digital consolida los marcos de interoperabilidad europea, soberanía digital y compras públicas inteligentes:
1. Las Administraciones Públicas que adquieran o desarrollen sistemas de IA deberán priorizar especificaciones abiertas y portabilidad de datos para evitar el secuestro del proveedor (vendor lock-in).
2. Se establece la ventanilla única de gobernanza entre las autoridades de protección de datos (AEPD) y las agencias de supervisión de IA (AESIA en España).
3. Se agiliza la validación de herramientas internas que operen sobre modelos de pesos abiertos (open weights) desplegados en centros de proceso de datos soberanos.`,
    practicalInterpretation: 'El Ómnibus Digital 2026 premia a las administraciones que utilicen modelos libres o locales (como Ollama, Llama, Qwen o Mistral) en sus propios servidores al reducir trámites burocráticos externos.',
    publicSectorImpact: 'Impulsa la adopción de infraestructuras locales soberanas en ayuntamientos, diputaciones y comunidades autónomas.',
    tags: ['ómnibus', '2026/1744', 'simplificación', 'soberanía digital', 'vendor lock-in', 'aesia', 'aepd', 'modelos abiertos'],
  },
];

/**
 * Motor de búsqueda semántica y léxica offline
 */
export function searchNormativeCorpus(
  query: string,
  categoryFilter?: 'ALL' | 'AI_ACT' | 'ENS' | 'RGPD' | 'PROCEDIMIENTO_ADM' | 'OMNIBUS'
): RagQueryResult[] {
  if (!query || query.trim().length === 0) {
    const list = categoryFilter && categoryFilter !== 'ALL'
      ? NORMATIVE_CORPUS.filter((d) => d.category === categoryFilter)
      : NORMATIVE_CORPUS;
    return list.map((doc) => ({
      document: doc,
      relevanceScore: 100,
      matchedHighlights: [doc.practicalInterpretation.substring(0, 120) + '...'],
    }));
  }

  const cleanQuery = query.toLowerCase().trim();
  const searchTerms = cleanQuery.split(/\s+/).filter((t) => t.length > 2);

  const results: RagQueryResult[] = [];

  for (const doc of NORMATIVE_CORPUS) {
    if (categoryFilter && categoryFilter !== 'ALL' && doc.category !== categoryFilter) {
      continue;
    }

    let score = 0;
    const highlights: string[] = [];
    const docFullContent = `${doc.title} ${doc.shortCode} ${doc.literalText} ${doc.practicalInterpretation} ${doc.publicSectorImpact} ${doc.tags.join(' ')}`.toLowerCase();

    // 1. Coincidencia exacta de frase
    if (docFullContent.includes(cleanQuery)) {
      score += 60;
      highlights.push(`Coincidencia directa con "${cleanQuery}"`);
    }

    // 2. Coincidencias individuales de términos
    for (const term of searchTerms) {
      if (doc.tags.some((t) => t.toLowerCase().includes(term))) {
        score += 25;
        highlights.push(`Etiqueta jurídica coincidente: "${term}"`);
      }
      if (doc.title.toLowerCase().includes(term) || doc.shortCode.toLowerCase().includes(term)) {
        score += 30;
      }
      if (doc.literalText.toLowerCase().includes(term)) {
        score += 15;
      }
      if (doc.practicalInterpretation.toLowerCase().includes(term)) {
        score += 15;
      }
    }

    if (score > 0) {
      results.push({
        document: doc,
        relevanceScore: Math.min(100, score),
        matchedHighlights: highlights.slice(0, 3),
      });
    }
  }

  // Ordenar por mayor relevancia
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results;
}
