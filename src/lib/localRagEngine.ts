/**
 * Consultor Normativo RAG Local Offline
 * Base de conocimiento indexada en memoria para el sector público español y europeo.
 * Funciona en el navegador sin enviar las consultas a servidores externos.
 *
 * Cada entrada indica si su texto es un extracto literal cotejado (`isLiteral`) o un resumen,
 * y enlaza a la fuente oficial. Ver docs/auditoria/registro-fuentes.md.
 */

export interface NormativeDocument {
  id: string;
  normName: string;
  shortCode: string;
  category: 'AI_ACT' | 'ENS' | 'RGPD' | 'PROCEDIMIENTO_ADM' | 'OMNIBUS';
  articleNumber: string;
  title: string;
  /** Extracto literal (si `isLiteral`) o resumen no literal del precepto. */
  text: string;
  /** true solo si `text` reproduce literalmente el texto oficial cotejado. */
  isLiteral: boolean;
  sourceUrl: string;
  practicalInterpretation: string;
  publicSectorImpact: string;
  tags: string[];
}

export interface RagQueryResult {
  document: NormativeDocument;
  relevanceScore: number;
  matchedHighlights: string[];
}

const RIA_URL = 'https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32024R1689';
const OMNIBUS_URL = 'https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32026R1744';
const LRJSP_URL = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566';
const LPAC_URL = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565';
const ENS_URL = 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191';
const RGPD_URL = 'https://eur-lex.europa.eu/legal-content/ES/ALL/?uri=CELEX%3A32016R0679';
const LEY15_URL = 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a23';

export const NORMATIVE_CORPUS: NormativeDocument[] = [
  // --- RIA (Reglamento UE 2024/1689) ---
  {
    id: 'RIA-ART-05',
    normName: 'Reglamento (UE) 2024/1689 (RIA)',
    shortCode: 'Art. 5 RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 5',
    title: 'Prácticas de Inteligencia Artificial Prohibidas',
    text: `Resumen de las prácticas prohibidas del Art. 5.1:
a) técnicas subliminales, manipuladoras o engañosas que alteren el comportamiento y causen perjuicios importantes;
b) explotación de vulnerabilidades por edad, discapacidad o situación social o económica;
b bis) y b ter) (añadidas por el Reglamento (UE) 2026/1744, aplicables desde el 2/12/2026): generación de imágenes íntimas realistas de personas identificables sin consentimiento y de material de abuso sexual infantil;
c) puntuación social que provoque un trato perjudicial o desfavorable;
d) evaluación del riesgo de que una persona cometa un delito basada únicamente en la elaboración de perfiles o en rasgos de personalidad;
e) creación o ampliación de bases de reconocimiento facial mediante extracción no selectiva de imágenes;
f) inferencia de emociones en el lugar de trabajo y en centros educativos, salvo por motivos médicos o de seguridad;
g) categorización biométrica para deducir raza, opiniones políticas, afiliación sindical, convicciones religiosas o filosóficas, vida sexual u orientación sexual;
h) identificación biométrica remota «en tiempo real» en espacios de acceso público con fines de garantía del cumplimiento del Derecho, salvo las excepciones tasadas.`,
    isLiteral: false,
    sourceUrl: RIA_URL,
    practicalInterpretation: 'Ninguna administración pública puede desplegar sistemas que incurran en estas prácticas. La mera aparición de palabras relacionadas en una documentación no acredita la práctica: debe verificarse la finalidad y el contexto.',
    publicSectorImpact: 'Si una práctica se confirma, el sistema no puede introducirse en el mercado, ponerse en servicio ni utilizarse. El régimen de multas aplicable a autoridades y organismos públicos lo determina cada Estado miembro (Art. 99.8).',
    tags: ['prohibido', 'artículo 5', 'social scoring', 'puntuación social', 'manipulación', 'biometría', 'inadmisible'],
  },
  {
    id: 'RIA-ART-06-3',
    normName: 'Reglamento (UE) 2024/1689 (RIA)',
    shortCode: 'Art. 6.3 RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 6, apartado 3',
    title: 'Excepción a la consideración de alto riesgo de los sistemas del Anexo III',
    text: `3. No obstante lo dispuesto en el apartado 2, un sistema de IA a que se refiere el anexo III no se considerará de alto riesgo cuando no plantee un riesgo importante de causar un perjuicio a la salud, la seguridad o los derechos fundamentales de las personas físicas, también al no influir sustancialmente en el resultado de la toma de decisiones.
El párrafo primero se aplicará cuando se cumpla cualquiera de las condiciones siguientes:
a) que el sistema de IA esté destinado a realizar una tarea de procedimiento limitada;
b) que el sistema de IA esté destinado a mejorar el resultado de una actividad humana previamente realizada;
c) que el sistema de IA esté destinado a detectar patrones de toma de decisiones o desviaciones con respecto a patrones de toma de decisiones anteriores y no esté destinado a sustituir la valoración humana previamente realizada sin una revisión humana adecuada, ni a influir en ella, o
d) que el sistema de IA esté destinado a realizar una tarea preparatoria para una evaluación que sea pertinente a efectos de los casos de uso enumerados en el anexo III.
No obstante lo dispuesto en el párrafo primero, los sistemas de IA a que se refiere el anexo III siempre se considerarán de alto riesgo cuando el sistema de IA efectúe la elaboración de perfiles de personas físicas.`,
    isLiteral: true,
    sourceUrl: RIA_URL,
    practicalInterpretation: 'Las condiciones a) a d) son alternativas: basta con que concurra una, siempre que el sistema no influya sustancialmente en la decisión. Si hay perfilado de personas físicas, la excepción no es posible.',
    publicSectorImpact: 'El proveedor debe documentar su evaluación antes de la puesta en servicio (Art. 6.4) y registrar el sistema en la base de datos de la UE (Art. 49.2), registro que mantiene el Reglamento (UE) 2026/1744.',
    tags: ['artículo 6', 'excepción', 'anexo iii', 'tarea preparatoria', 'perfilado', 'alto riesgo', 'registro'],
  },
  {
    id: 'RIA-ART-06-ANEXO-III',
    normName: 'Reglamento (UE) 2024/1689 (RIA)',
    shortCode: 'Anexo III RIA',
    category: 'AI_ACT',
    articleNumber: 'Anexo III',
    title: 'Ámbitos de los sistemas de IA de alto riesgo',
    text: `Resumen de los ámbitos del Anexo III: 1. biometría; 2. infraestructuras críticas; 3. educación y formación profesional; 4. empleo, gestión de los trabajadores y acceso al autoempleo; 5. acceso a servicios privados esenciales y a servicios y prestaciones públicos esenciales; 6. garantía del cumplimiento del Derecho; 7. migración, asilo y gestión del control fronterizo; 8. administración de justicia y procesos democráticos.
Punto 5, letra a) (literal): «Sistemas de IA destinados a ser utilizados por las autoridades públicas o en su nombre para evaluar la admisibilidad de las personas físicas para beneficiarse de servicios y prestaciones esenciales de asistencia pública, incluidos los servicios de asistencia sanitaria, así como para conceder, reducir o retirar dichos servicios y prestaciones o reclamar su devolución».`,
    isLiteral: false,
    sourceUrl: RIA_URL,
    practicalInterpretation: 'Seleccionar o evaluar candidatos a un empleo, o evaluar la admisibilidad de personas físicas para prestaciones esenciales de asistencia pública, entra en el ámbito del Anexo III. No toda subvención es una prestación esencial de asistencia pública, y las ayudas a personas jurídicas no están en el punto 5.a).',
    publicSectorImpact: 'Para los puntos 2 a 8, la evaluación de la conformidad se realiza por control interno (Art. 43.2 y Anexo VI), sin organismo notificado. Las obligaciones de alto riesgo del Anexo III son exigibles desde el 2/12/2027 (Reglamento (UE) 2026/1744).',
    tags: ['alto riesgo', 'anexo iii', 'empleo', 'oposiciones', 'subvenciones', 'ayudas', 'prestaciones', 'justicia', 'marcado ce'],
  },
  {
    id: 'RIA-ART-14',
    normName: 'Reglamento (UE) 2024/1689 (RIA)',
    shortCode: 'Art. 14 RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 14',
    title: 'Supervisión humana (sistemas de alto riesgo)',
    text: 'Resumen: los sistemas de IA de alto riesgo deben diseñarse para que personas físicas puedan supervisarlos de manera efectiva mientras están en uso, con el fin de prevenir o reducir los riesgos para la salud, la seguridad o los derechos fundamentales. Las personas encargadas deben poder comprender sus capacidades y limitaciones, ser conscientes del sesgo de automatización y poder no utilizar, anular o revertir sus resultados e interrumpir el sistema.',
    isLiteral: false,
    sourceUrl: RIA_URL,
    practicalInterpretation: 'En sistemas de alto riesgo, un empleado público cualificado debe poder revisar, modificar o descartar el resultado del sistema antes de que produzca efectos.',
    publicSectorImpact: 'Conviene designar responsables con formación y documentar en qué momento y cómo intervienen; en sistemas que no son de alto riesgo es una buena práctica recomendable.',
    tags: ['supervisión humana', 'artículo 14', 'human in the loop', 'sesgo de automatización', 'anulación', 'funcionario'],
  },
  {
    id: 'RIA-ART-50',
    normName: 'Reglamento (UE) 2024/1689 (RIA)',
    shortCode: 'Art. 50 RIA',
    category: 'AI_ACT',
    articleNumber: 'Artículo 50, apartado 1',
    title: 'Obligaciones de transparencia: interacción con sistemas de IA',
    text: '1. Los proveedores garantizarán que los sistemas de IA destinados a interactuar directamente con personas físicas se diseñen y desarrollen de forma que las personas físicas de que se trate estén informadas de que están interactuando con un sistema de IA, excepto cuando resulte evidente desde el punto de vista de una persona física razonablemente informada, atenta y perspicaz, teniendo en cuenta las circunstancias y el contexto de utilización.',
    isLiteral: true,
    sourceUrl: RIA_URL,
    practicalInterpretation: 'Chatbots, asistentes y generadores de contenido deben informar de que se interactúa con una IA; los apartados siguientes regulan el marcado del contenido sintético.',
    publicSectorImpact: 'Aplicable desde el 2/08/2026. Conviene incorporar el aviso de transparencia en la interfaz y rotular los documentos generados con asistencia de IA.',
    tags: ['transparencia', 'artículo 50', 'banner', 'aviso', 'chatbot', 'identificación', 'sede electrónica'],
  },

  // --- ENS (Real Decreto 311/2022) ---
  {
    id: 'ENS-OP-EXP-8',
    normName: 'Real Decreto 311/2022 (Esquema Nacional de Seguridad)',
    shortCode: '[op.exp.8] ENS',
    category: 'ENS',
    articleNumber: 'Anexo II, medida [op.exp.8]',
    title: 'Registro de la actividad',
    text: '[op.exp.8.1] Se generará un registro de auditoría, que incluirá, al menos, el identificador del usuario o entidad asociado al evento, fecha y hora, sobre qué información se realiza el evento, tipo de evento y el resultado del evento (fallo o éxito), según la política de seguridad y los procedimientos asociados a la misma.',
    isLiteral: true,
    sourceUrl: ENS_URL,
    practicalInterpretation: 'Las peticiones al modelo y sus respuestas deberían quedar registradas con usuario, fecha y hora, objeto y resultado. El tiempo de conservación se fija en la documentación de seguridad del sistema ([op.exp.8.r3.1]).',
    publicSectorImpact: 'En categoría MEDIA y ALTA se añaden refuerzos (revisión de registros, referencia de tiempo, retención documentada y acceso restringido).',
    tags: ['ens', 'rd 311/2022', 'logs', 'registro', 'trazabilidad', 'op.exp.8', 'auditoría'],
  },
  {
    id: 'ENS-CREDENCIALES-NUBE',
    normName: 'Real Decreto 311/2022 (Esquema Nacional de Seguridad)',
    shortCode: '[op.acc.5] [op.nub.1] ENS',
    category: 'ENS',
    articleNumber: 'Anexo II, medidas [op.acc.5], [op.acc.6] y [op.nub.1]',
    title: 'Credenciales y servicios en la nube',
    text: 'Resumen: las credenciales de autenticación estarán bajo el control exclusivo del usuario y se inhabilitarán si consta o se sospecha su revelación ([op.acc.5]); los servicios en la nube deben protegerse según la categoría del sistema ([op.nub.1]).',
    isLiteral: false,
    sourceUrl: ENS_URL,
    practicalInterpretation: 'Las claves de API de proveedores de IA no deben incluirse en código cliente ni en repositorios; si se exponen, deben revocarse.',
    publicSectorImpact: 'Para información sensible, conviene priorizar modelos locales en servidores propios o servicios en la nube con las garantías del ENS correspondientes a la categoría del sistema.',
    tags: ['ens', 'credenciales', 'api keys', 'nube', 'soberanía', 'on premise', 'ollama', 'op.acc.5', 'op.nub.1'],
  },

  // --- PROCEDIMIENTO ADMINISTRATIVO (Leyes 39/2015 y 40/2015) ---
  {
    id: 'LEY-40-ART-41',
    normName: 'Ley 40/2015 de Régimen Jurídico del Sector Público',
    shortCode: 'Art. 41 Ley 40/2015',
    category: 'PROCEDIMIENTO_ADM',
    articleNumber: 'Artículo 41',
    title: 'Actuación administrativa automatizada',
    text: `1. Se entiende por actuación administrativa automatizada, cualquier acto o actuación realizada íntegramente a través de medios electrónicos por una Administración Pública en el marco de un procedimiento administrativo y en la que no haya intervenido de forma directa un empleado público.
2. En caso de actuación administrativa automatizada deberá establecerse previamente el órgano u órganos competentes, según los casos, para la definición de las especificaciones, programación, mantenimiento, supervisión y control de calidad y, en su caso, auditoría del sistema de información y de su código fuente. Asimismo, se indicará el órgano que debe ser considerado responsable a efectos de impugnación.`,
    isLiteral: true,
    sourceUrl: LRJSP_URL,
    practicalInterpretation: 'Si el sistema produce un acto o actuación sin intervención directa de un empleado público, es actuación administrativa automatizada y deben establecerse previamente los órganos del apartado 2.',
    publicSectorImpact: 'El deslinde depende del funcionamiento real del procedimiento, no solo de lo que se declare: debe documentarse quién interviene y en qué momento.',
    tags: ['ley 40/2015', 'artículo 41', 'actuación administrativa automatizada', 'órgano competente', 'impugnación', 'responsable'],
  },
  {
    id: 'LEY-40-ART-36',
    normName: 'Ley 40/2015 de Régimen Jurídico del Sector Público',
    shortCode: 'Art. 36 Ley 40/2015',
    category: 'PROCEDIMIENTO_ADM',
    articleNumber: 'Artículo 36, apartados 1 y 2',
    title: 'Exigencia de la responsabilidad patrimonial de las autoridades y personal',
    text: `1. Para hacer efectiva la responsabilidad patrimonial a que se refiere esta Ley, los particulares exigirán directamente a la Administración Pública correspondiente las indemnizaciones por los daños y perjuicios causados por las autoridades y personal a su servicio.
2. La Administración correspondiente, cuando hubiere indemnizado a los lesionados, exigirá de oficio en vía administrativa de sus autoridades y demás personal a su servicio la responsabilidad en que hubieran incurrido por dolo, o culpa o negligencia graves, previa instrucción del correspondiente procedimiento.`,
    isLiteral: true,
    sourceUrl: LRJSP_URL,
    practicalInterpretation: 'Ante el ciudadano responde la Administración, también cuando un sistema de IA interviene en el servicio; el empleado público solo responde ante su Administración por dolo, culpa o negligencia graves.',
    publicSectorImpact: 'Los informes no deben atribuir la responsabilidad patrimonial «exclusivamente» a quien firma.',
    tags: ['ley 40/2015', 'artículo 36', 'responsabilidad patrimonial', 'artículo 32', 'funcionario', 'dolo', 'culpa grave'],
  },
  {
    id: 'LEY-39-ART-53',
    normName: 'Ley 39/2015 del Procedimiento Administrativo Común',
    shortCode: 'Art. 53 Ley 39/2015',
    category: 'PROCEDIMIENTO_ADM',
    articleNumber: 'Artículo 53',
    title: 'Derechos del interesado en el procedimiento administrativo',
    text: 'Resumen: entre otros, los interesados tienen derecho a conocer el estado de la tramitación de los procedimientos en que sean parte, a identificar a las autoridades y al personal bajo cuya responsabilidad se tramitan y a no presentar documentos que ya obren en poder de la Administración.',
    isLiteral: false,
    sourceUrl: LPAC_URL,
    practicalInterpretation: 'El interesado tiene derecho a saber qué personas son responsables de su expediente; la Administración no puede escudarse en que «lo decidió el sistema».',
    publicSectorImpact: 'Los informes elaborados con apoyo de IA deben identificar al personal responsable de la tramitación.',
    tags: ['ley 39/2015', 'artículo 53', 'derechos del interesado', 'identificación del funcionario', 'transparencia'],
  },

  // --- RGPD (Reglamento UE 2016/679) ---
  {
    id: 'RGPD-ART-22',
    normName: 'Reglamento General de Protección de Datos (UE 2016/679)',
    shortCode: 'Art. 22 RGPD',
    category: 'RGPD',
    articleNumber: 'Artículo 22',
    title: 'Decisiones individuales automatizadas, incluida la elaboración de perfiles',
    text: 'Resumen: el interesado tiene derecho a no ser objeto de una decisión basada únicamente en el tratamiento automatizado, incluida la elaboración de perfiles, que produzca efectos jurídicos en él o le afecte significativamente de modo similar, salvo las excepciones del apartado 2 (contrato, autorización por el Derecho de la Unión o de los Estados miembros con medidas adecuadas, o consentimiento explícito).',
    isLiteral: false,
    sourceUrl: RGPD_URL,
    practicalInterpretation: 'Si una decisión que afecta a una persona se basa únicamente en un tratamiento automatizado, debe existir una de las excepciones del apartado 2 y garantías adecuadas, como la intervención humana.',
    publicSectorImpact: 'En el sector público la vía habitual es la autorización por norma con garantías; conviene asegurar la posibilidad de revisión humana.',
    tags: ['rgpd', 'artículo 22', 'decisiones automatizadas', 'perfiles', 'intervención humana', 'impugnación', 'derechos'],
  },
  {
    id: 'RGPD-ART-35',
    normName: 'Reglamento General de Protección de Datos (UE 2016/679)',
    shortCode: 'Art. 35 RGPD',
    category: 'RGPD',
    articleNumber: 'Artículo 35',
    title: 'Evaluación de impacto relativa a la protección de datos (EIPD)',
    text: 'Resumen: cuando sea probable que un tratamiento, en particular si utiliza nuevas tecnologías, entrañe un alto riesgo para los derechos y libertades de las personas físicas, el responsable debe realizar, antes del tratamiento, una evaluación de impacto, recabando el asesoramiento del delegado de protección de datos.',
    isLiteral: false,
    sourceUrl: RGPD_URL,
    practicalInterpretation: 'La necesidad de EIPD se decide por el riesgo del tratamiento concreto, con ayuda de los criterios de WP248 y de la lista de la AEPD del Art. 35.4.',
    publicSectorImpact: 'La EIPD debe completarla el responsable del tratamiento con el asesoramiento del DPD antes del despliegue.',
    tags: ['eipd', 'artículo 35', 'dpia', 'aepd', 'evaluación de impacto', 'dpd', 'alto riesgo', 'datos personales'],
  },
  {
    id: 'LEY-15-ART-23',
    normName: 'Ley 15/2022 integral para la igualdad de trato y la no discriminación',
    shortCode: 'Art. 23 Ley 15/2022',
    category: 'PROCEDIMIENTO_ADM',
    articleNumber: 'Artículo 23',
    title: 'Inteligencia artificial y mecanismos de toma de decisión automatizados',
    text: 'Resumen: las administraciones públicas favorecerán mecanismos para que los algoritmos involucrados en la toma de decisiones tengan en cuenta criterios de minimización de sesgos, transparencia y rendición de cuentas; se promoverán evaluaciones de impacto que determinen el posible sesgo discriminatorio y se priorizará la transparencia y la capacidad de interpretación de las decisiones.',
    isLiteral: false,
    sourceUrl: LEY15_URL,
    practicalInterpretation: 'La ley fomenta la evaluación de sesgos; no establece por sí sola una auditoría obligatoria con un procedimiento determinado.',
    publicSectorImpact: 'Conviene documentar una evaluación del posible impacto discriminatorio de los sistemas que intervienen en decisiones sobre personas.',
    tags: ['ley 15/2022', 'artículo 23', 'sesgos', 'discriminación', 'igualdad', 'algoritmos'],
  },

  // --- Reglamento (UE) 2026/1744 (Ómnibus digital sobre IA) ---
  {
    id: 'OMNIBUS-UE-2026',
    normName: 'Reglamento (UE) 2026/1744 (Ómnibus digital sobre IA)',
    shortCode: 'Reglamento (UE) 2026/1744',
    category: 'OMNIBUS',
    articleNumber: 'Modificaciones del RIA',
    title: 'Modificaciones del Reglamento de Inteligencia Artificial',
    text: `Resumen de las modificaciones relevantes:
1. Nuevas prácticas prohibidas en el Art. 5.1, letras b bis) y b ter), aplicables desde el 2 de diciembre de 2026.
2. Obligaciones de alto riesgo (capítulo III, secciones 1 a 3) aplicables desde el 2 de diciembre de 2027 para el Anexo III y desde el 2 de agosto de 2028 para el Anexo I.
3. Se mantiene el registro del Art. 49.2 para los sistemas acogidos al Art. 6.3, con un contenido simplificado del Anexo VIII.
4. El Art. 4 pasa a exigir que proveedores y responsables del despliegue adopten medidas para apoyar la alfabetización en IA de su personal.`,
    isLiteral: false,
    sourceUrl: OMNIBUS_URL,
    practicalInterpretation: 'El Reglamento aplaza obligaciones y simplifica cargas, pero no crea un régimen especial para herramientas auxiliares de las administraciones públicas.',
    publicSectorImpact: 'Las administraciones deben ajustar su calendario de cumplimiento y mantener la documentación y el registro de los sistemas exceptuados.',
    tags: ['ómnibus', '2026/1744', 'simplificación', 'calendario', 'aplazamiento', 'registro', 'alfabetización'],
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
    const docFullContent = `${doc.title} ${doc.shortCode} ${doc.text} ${doc.practicalInterpretation} ${doc.publicSectorImpact} ${doc.tags.join(' ')}`.toLowerCase();

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
      if (doc.text.toLowerCase().includes(term)) {
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
