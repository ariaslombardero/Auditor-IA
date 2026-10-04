/**
 * Base de Conocimiento Normativo: RIA, Digital Omnibus, ENS, CCN-STIC, RGPD, Ley 40/2015
 */

export interface RegulatoryFrameworkItem {
  id: string;
  name: string;
  shortName: string;
  scope: string;
  keyArticles: string[];
  summary: string;
}

export const REGULATORY_FRAMEWORK: RegulatoryFrameworkItem[] = [
  {
    id: 'ai-act',
    name: 'Reglamento (UE) 2024/1689 sobre Inteligencia Artificial (AI Act / RIA)',
    shortName: 'Reglamento UE 2024/1689',
    scope: 'Directamente aplicable en todos los Estados miembros de la UE, incluyendo Administraciones Públicas.',
    keyArticles: [
      'Art. 5: Prácticas prohibidas de IA (manipulación, puntuación social, evaluación biométrica indiscriminada).',
      'Art. 6 y Anexo III: Sistemas de Alto Riesgo (Punto 4.a: Empleo, reclutamiento y evaluación de candidatos; Punto 5: Acceso a servicios públicos esenciales y prestaciones; Punto 7: Justicia y procesos democráticos).',
      'Art. 14: Supervisión humana efectiva (Human-in-the-loop / Human-on-the-loop).',
      'Art. 50: Obligaciones de transparencia para sistemas que interactúan con personas o generan contenido sintético.',
    ],
    summary: 'Establece el marco de riesgos y gobernanza para el despliegue de sistemas de IA, con especial rigor en el sector público.',
  },
  {
    id: 'digital-omnibus',
    name: 'Reglamento Europeo Ómnibus Digital (UE 2026/1744)',
    shortName: 'Ómnibus Digital UE 2026/1744',
    scope: 'Simplificación administrativa, estándares técnicos armonizados e interoperabilidad en servicios digitales públicos.',
    keyArticles: [
      'Art. 18: Mecanismos simplificados de cumplimiento para herramientas técnicas auxiliares en administraciones públicas.',
      'Art. 24: Fomento de arquitecturas locales y federadas para soberanía de datos del sector público.',
    ],
    summary: 'Armoniza la aplicación coordinada de normativas digitales (RIA, Data Act, DSA) reduciendo burocracia desproporcionada en herramientas que no adopten decisiones autónomas.',
  },
  {
    id: 'ens',
    name: 'Esquema Nacional de Seguridad (Real Decreto 311/2022)',
    shortName: 'ENS (RD 311/2022)',
    scope: 'De obligado cumplimiento para toda la Administración Pública española (AGE, CC.AA., Entidades Locales).',
    keyArticles: [
      'Art. 13: Principio de seguridad integral y gestión de riesgos.',
      'Art. 41: Categorización de los sistemas de información (BÁSICA, MEDIA, ALTA) en función del impacto en D-A-I-C-T.',
      'Anexo II: Medidas de seguridad operacionales y de protección.',
    ],
    summary: 'Garantiza la seguridad de los sistemas, los datos de los ciudadanos y la continuidad de los servicios públicos digitales.',
  },
  {
    id: 'ccn-stic',
    name: 'Guía CCN-STIC 884D — Seguridad en Servicios de Inteligencia Artificial',
    shortName: 'CCN-STIC 884D',
    scope: 'Directrices del Centro Criptológico Nacional (CCN-CNI) para la integración de IA en el sector público.',
    keyArticles: [
      'Medida IA-01: Prohibición de exposición de credenciales (API keys) en clientes web o frontend.',
      'Medida IA-04: Sanitización previa de prompts para evitar filtración de secretos oficiales o datos personales.',
      'Medida IA-08: Trazabilidad, sellado de tiempo y retención segura de peticiones y respuestas para auditoría.',
      'Medida IA-12: Prioridad a modelos locales on-premise cuando se maneje información sensible o reservada.',
    ],
    summary: 'Manual de buenas prácticas y directrices de ciberseguridad específicas para soluciones con modelos de lenguaje y visión en la AAPP.',
  },
  {
    id: 'ley-40-2015',
    name: 'Ley 40/2015 de Régimen Jurídico del Sector Público',
    shortName: 'Ley 40/2015',
    scope: 'Procedimiento y funcionamiento de los órganos administrativos españoles.',
    keyArticles: [
      'Art. 41: Actuación administrativa automatizada. Requiere determinación previa del órgano competente y órganos de supervisión del algoritmo.',
      'Art. 42: Sistemas de firma para la actuación administrativa automatizada.',
    ],
    summary: 'Diferencia de forma tajante entre una herramienta de asistencia o auxilio técnico a funcionarios y un acto administrativo 100% automatizado.',
  },
  {
    id: 'rgpd',
    name: 'Reglamento General de Protección de Datos (RGPD UE 2016/679) y LOPDGDD 3/2018',
    shortName: 'RGPD / LOPDGDD',
    scope: 'Tratamiento de datos personales en el Espacio Económico Europeo.',
    keyArticles: [
      'Art. 6.1.e: Base jurídica de cumplimiento de misión de interés público o ejercicio de poderes públicos.',
      'Art. 9: Tratamiento prohibido por defecto de categorías especiales de datos.',
      'Art. 22: Derecho a no ser objeto de decisiones individuales basadas únicamente en tratamiento automatizado.',
      'Art. 30: Registro de Actividades de Tratamiento (RAT).',
      'Art. 35: Evaluación de Impacto en Protección de Datos (EIPD).',
    ],
    summary: 'Exige garantías estrictas de confidencialidad, minimización y prohibición de perfiles sin intervención humana cualificada.',
  },
  {
    id: 'aesia',
    name: 'Estatuto de la Agencia Española de Supervisión de la Inteligencia Artificial (Real Decreto 729/2023)',
    shortName: 'AESIA (RD 729/2023)',
    scope: 'Autoridad nacional de supervisión del RIA en España con potestad sancionadora e inspectora en el sector público.',
    keyArticles: [
      'Art. 4: Funciones de supervisión, inspección y régimen sancionador sobre sistemas de IA en Administraciones Públicas.',
      'Art. 8: Protocolo de comunicación obligatoria de incidentes graves de IA ante la autoridad nacional.',
      'RD 817/2023: Entorno controlado de pruebas (Sandbox Regulatorio) para sistemas de alto riesgo.',
    ],
    summary: 'Órgano estatal competente para verificar la conformidad con el RIA, recibir notificaciones de fallos algorítmicos graves y coordinar la supervisión con la Comisión Europea.',
  },
  {
    id: 'ley-15-2022',
    name: 'Ley 15/2022 integral para la igualdad de trato y la no discriminación',
    shortName: 'Ley 15/2022 (Art. 23)',
    scope: 'De aplicación transversal a cualquier algoritmo o sistema de IA utilizado por las Administraciones Públicas españolas.',
    keyArticles: [
      'Art. 23.1: Obligación de las AAPP de garantizar que los algoritmos no introduzcan sesgos discriminatorios directos o indirectos.',
      'Art. 23.2: Transparencia algorítmica, minimización de sesgos y deber de auditoría previa de impacto en igualdad.',
    ],
    summary: 'Impone a las administraciones públicas el deber activo de prevenir sesgos de género, origen o discapacidad en cualquier toma de decisión asistida por IA.',
  },
];

export const PROHIBITED_SYSTEMS_CATALOG = [
  {
    id: 'subliminal_manipulation',
    title: 'Manipulación subliminal o engañosa que cause perjuicio',
    legalArticle: 'Art. 5.1.a RIA',
  },
  {
    id: 'vulnerability_exploitation',
    title: 'Explotación de vulnerabilidades por edad, discapacidad o situación socioeconómica',
    legalArticle: 'Art. 5.1.b RIA',
  },
  {
    id: 'social_scoring',
    title: 'Puntuación social o clasificación ciudadana general por las autoridades',
    legalArticle: 'Art. 5.1.c RIA',
  },
  {
    id: 'predictive_policing_individual',
    title: 'Evaluación del riesgo penal de personas individuales sin hechos constatables',
    legalArticle: 'Art. 5.1.d RIA',
  },
  {
    id: 'untargeted_facial_scraping',
    title: 'Creación indiscriminada de bases de reconocimiento facial mediante raspado de internet o CCTV',
    legalArticle: 'Art. 5.1.e RIA',
  },
  {
    id: 'emotion_recognition_workplace_education',
    title: 'Inferencia de emociones en el lugar de trabajo o instituciones educativas',
    legalArticle: 'Art. 5.1.f RIA',
  },
  {
    id: 'biometric_categorization_sensitive',
    title: 'Categorización biométrica para deducir raza, opiniones políticas, creencias religiosas u orientación sexual',
    legalArticle: 'Art. 5.1.g RIA',
  },
];
