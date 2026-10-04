/**
 * Base de Conocimiento Normativo: RIA (modificado por el Reglamento 2026/1744), ENS, RGPD, Ley 40/2015, Ley 15/2022, Estatuto AESIA.
 * Cada precepto está cotejado en docs/auditoria/registro-fuentes.md.
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
      'Art. 5: Prácticas prohibidas de IA (manipulación, explotación de vulnerabilidades, puntuación social, identificación biométrica remota en tiempo real con fines policiales, entre otras).',
      'Art. 6 y Anexo III: Sistemas de alto riesgo (punto 4: empleo; punto 5: servicios y prestaciones esenciales; punto 8: administración de justicia y procesos democráticos, entre otros). Art. 6.3: excepción si concurre cualquiera de las condiciones a) a d) y no hay perfilado; Art. 6.4: documentación previa y registro (Art. 49.2).',
      'Art. 14: Supervisión humana de los sistemas de alto riesgo.',
      'Art. 27: Evaluación de impacto en los derechos fundamentales por responsables del despliegue que sean organismos de Derecho público (sistemas de alto riesgo).',
      'Art. 43.2: Anexo III, puntos 2 a 8: evaluación de la conformidad por control interno (Anexo VI), sin organismo notificado.',
      'Art. 50: Obligaciones de transparencia para sistemas que interactúan con personas o generan contenido sintético.',
      'Art. 99.8: Cada Estado miembro determina en qué medida pueden imponerse multas a autoridades y organismos públicos.',
    ],
    summary: 'Establece el marco de riesgos y gobernanza para la introducción en el mercado, la puesta en servicio y la utilización de sistemas de IA.',
  },
  {
    id: 'digital-omnibus',
    name: 'Reglamento (UE) 2026/1744 (Ómnibus digital sobre IA)',
    shortName: 'Reglamento (UE) 2026/1744',
    scope: 'Modifica el Reglamento (UE) 2024/1689 para simplificar su aplicación (DOUE de 24/07/2026).',
    keyArticles: [
      'Art. 5.1, letras b bis) y b ter): nuevas prácticas prohibidas (imágenes íntimas realistas de personas identificables y material de abuso sexual infantil), aplicables desde el 2 de diciembre de 2026.',
      'Art. 113: obligaciones de alto riesgo (capítulo III, secciones 1 a 3) aplicables desde el 2 de diciembre de 2027 para el Anexo III y desde el 2 de agosto de 2028 para el Anexo I.',
      'Registro del Art. 49.2 para sistemas acogidos al Art. 6.3: se mantiene, con un contenido simplificado del Anexo VIII.',
      'Art. 4: la alfabetización en IA pasa a formularse como obligación de adoptar medidas para apoyarla.',
    ],
    summary: 'Aplaza las obligaciones de alto riesgo, añade dos prácticas prohibidas y simplifica determinadas cargas, manteniendo el registro de los sistemas exceptuados.',
  },
  {
    id: 'ens',
    name: 'Esquema Nacional de Seguridad (Real Decreto 311/2022)',
    shortName: 'ENS (RD 311/2022)',
    scope: 'De obligado cumplimiento para toda la Administración Pública española (AGE, CC.AA., Entidades Locales).',
    keyArticles: [
      'Arts. 40 y 41 y Anexo I: categorización de los sistemas (BÁSICA, MEDIA, ALTA) según el impacto en cada dimensión de seguridad.',
      'Anexo II [op.acc.5] y [op.acc.6]: mecanismos de autenticación; credenciales bajo control exclusivo del usuario.',
      'Anexo II [op.exp.8]: registro de la actividad.',
      'Anexo II [op.nub.1]: protección de servicios en la nube.',
      'Anexo II [mp.sw.1] y [mp.s.2]: desarrollo de aplicaciones y protección de servicios y aplicaciones web.',
    ],
    summary: 'Garantiza la seguridad de los sistemas, los datos de los ciudadanos y la continuidad de los servicios públicos digitales.',
  },
  {
    id: 'ley-40-2015',
    name: 'Ley 40/2015 de Régimen Jurídico del Sector Público',
    shortName: 'Ley 40/2015',
    scope: 'Régimen jurídico de las Administraciones Públicas españolas.',
    keyArticles: [
      'Art. 32: Principios de la responsabilidad patrimonial de las Administraciones Públicas.',
      'Art. 36: Los particulares exigen la responsabilidad directamente a la Administración; esta repite contra su personal solo por dolo, o culpa o negligencia graves.',
      'Art. 41: Actuación administrativa automatizada (sin intervención directa de un empleado público). Exige establecer previamente los órganos competentes y el órgano responsable a efectos de impugnación.',
      'Art. 42: Sistemas de firma para la actuación administrativa automatizada (sello electrónico y código seguro de verificación comprobable en la sede electrónica).',
      'Art. 43: Firma electrónica del personal al servicio de las Administraciones Públicas.',
    ],
    summary: 'Distingue la actuación administrativa automatizada de la que realiza directamente un empleado público y regula la responsabilidad patrimonial.',
  },
  {
    id: 'rgpd',
    name: 'Reglamento General de Protección de Datos (RGPD UE 2016/679) y LOPDGDD 3/2018',
    shortName: 'RGPD / LOPDGDD',
    scope: 'Tratamiento de datos personales en el Espacio Económico Europeo.',
    keyArticles: [
      'Art. 6.1: Bases jurídicas del tratamiento.',
      'Art. 9: Tratamiento de categorías especiales de datos personales.',
      'Art. 10: Tratamiento de datos personales relativos a condenas e infracciones penales.',
      'Art. 22: Decisiones individuales basadas únicamente en el tratamiento automatizado.',
      'Art. 30: Registro de Actividades de Tratamiento (RAT).',
      'Art. 35: Evaluación de Impacto en Protección de Datos (EIPD).',
    ],
    summary: 'Exige base jurídica, minimización, registro de actividades y, cuando procede, evaluación de impacto.',
  },
  {
    id: 'aesia',
    name: 'Estatuto de la Agencia Española de Supervisión de la Inteligencia Artificial (Real Decreto 729/2023)',
    shortName: 'AESIA (RD 729/2023)',
    scope: 'Organización y funciones de la Agencia Española de Supervisión de la Inteligencia Artificial.',
    keyArticles: [
      'Art. 8: Principios de actuación de la Agencia (autonomía, independencia técnica, transparencia, eficacia, eficiencia, cooperación e igualdad).',
      'RD 817/2023: Entorno controlado de pruebas (sandbox regulatorio) para sistemas de IA.',
    ],
    summary: 'Regula la Agencia encargada de la supervisión de la inteligencia artificial en España.',
  },
  {
    id: 'ley-15-2022',
    name: 'Ley 15/2022 integral para la igualdad de trato y la no discriminación',
    shortName: 'Ley 15/2022 (Art. 23)',
    scope: 'Uso de algoritmos en la toma de decisiones por las Administraciones Públicas.',
    keyArticles: [
      'Art. 23.1: Las administraciones públicas favorecerán mecanismos para que los algoritmos tengan en cuenta criterios de minimización de sesgos, transparencia y rendición de cuentas; se promoverán evaluaciones de impacto que determinen el posible sesgo discriminatorio.',
      'Art. 23.2: Se priorizará la transparencia en el diseño y la implementación y la capacidad de interpretación de las decisiones.',
    ],
    summary: 'Promueve la minimización de sesgos y la transparencia de los algoritmos utilizados por las administraciones públicas.',
  },
];

export interface ProhibitedPracticeItem {
  id: string;
  title: string;
  legalArticle: string;
  /** Fecha ISO de aplicación cuando difiere de la general del Art. 5 (2 de febrero de 2025). */
  applicableFrom?: string;
}

export const PROHIBITED_SYSTEMS_CATALOG: ProhibitedPracticeItem[] = [
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
    id: 'intimate_imagery_generation',
    title: 'Generación o manipulación de imágenes, vídeos o audios íntimos realistas de personas identificables sin su consentimiento',
    legalArticle: 'Art. 5.1.b bis RIA (Reglamento (UE) 2026/1744)',
    applicableFrom: '2026-12-02',
  },
  {
    id: 'child_sexual_abuse_material',
    title: 'Generación o manipulación de material de abuso sexual infantil (Directiva 2011/93/UE)',
    legalArticle: 'Art. 5.1.b ter RIA (Reglamento (UE) 2026/1744)',
    applicableFrom: '2026-12-02',
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
  {
    id: 'realtime_remote_biometric_identification',
    title: 'Identificación biométrica remota en tiempo real en espacios de acceso público con fines de garantía del cumplimiento del Derecho',
    legalArticle: 'Art. 5.1.h RIA',
  },
];
