import type { EnsDimension, LegalEnrichmentAnswers } from '../types';
import { PROHIBITED_SYSTEMS_CATALOG } from './legalKnowledgeBase';
import { ENS_DIMENSIONS, ENS_DIMENSION_LABELS } from './answersModel';
import { ANNEX_III_LABELS, ARTICLE_63_CONDITIONS } from './engine/evaluators';
import { INTERVIEW_HELP } from './interviewHelp';

/**
 * Catálogo único de preguntas de la entrevista. Lo usan la entrevista, el contador de
 * respuestas pendientes, el panel «Lo que falta» del diagnóstico y las sugerencias.
 * Las condiciones de visibilidad son las mismas que muestra la entrevista: una pregunta
 * oculta nunca cuenta como pendiente.
 */

export type InterviewBlock = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface QuestionOption {
  value: string;
  label: string;
}

/** Explicación en lenguaje sencillo, con ejemplos (textos en interviewHelp.ts). */
export interface QuestionHelp {
  queSignifica: string;
  ejemploSi?: string;
  ejemploNo?: string;
  norma?: string;
}

export interface InterviewQuestion {
  /** Ruta del campo en las respuestas: `infersOutputs`, `prohibitedPractices.social_scoring`, `ensImpact.C`… */
  id: string;
  bloque: InterviewBlock;
  tipo: 'tri' | 'select' | 'texto';
  enunciado: string;
  opciones?: QuestionOption[];
  /** Valor que significa «sin contestar». */
  valorDesconocido: string;
  visible: (a: LegalEnrichmentAnswers) => boolean;
  /** Si dejarla sin contestar impide concluir la clasificación del RIA. */
  bloqueaClasificacion: boolean;
  /** «documental»: la documentación puede responderla; «orientacion»: es una decisión de la entidad. */
  sugerible: 'documental' | 'orientacion';
  ayuda?: QuestionHelp;
}

export const BLOCK_TITLES: Record<InterviewBlock, string> = {
  A: 'A. ¿Es un sistema de IA? (Art. 3.1 RIA)',
  B: 'B. Prácticas prohibidas (Art. 5 RIA)',
  C: 'C. Alto riesgo (Art. 6 y Anexo III RIA)',
  D: 'D. Transparencia (Art. 50 RIA)',
  E: 'E. Papel de la entidad (Art. 3, puntos 3 y 4, RIA)',
  F: 'F. Supervisión humana y actuación administrativa automatizada (Art. 41 Ley 40/2015)',
  G: 'G. Protección de datos (RGPD)',
  H: 'H. Seguridad (ENS, Anexo I) y trazabilidad',
};

const esIA = (a: LegalEnrichmentAnswers) => a.infersOutputs !== 'no';
const enAnexoIII = (a: LegalEnrichmentAnswers) => esIA(a) && a.annexIIIArea !== 'ninguno' && a.annexIIIArea !== 'desconocido';
const condicion63Elegida = (a: LegalEnrichmentAnswers) =>
  enAnexoIII(a) && a.performsProfiling === 'no' && a.article63Condition !== 'ninguna' && a.article63Condition !== 'desconocido';
const tratarDatos = (a: LegalEnrichmentAnswers) => a.processesPersonalData !== 'no';
const siempre = () => true;

const tri = (
  id: string,
  bloque: InterviewBlock,
  enunciado: string,
  visible: InterviewQuestion['visible'],
  extra: Partial<InterviewQuestion> = {}
): InterviewQuestion => ({
  id,
  bloque,
  tipo: 'tri',
  enunciado,
  valorDesconocido: 'desconocido',
  visible,
  bloqueaClasificacion: false,
  sugerible: 'documental',
  ...extra,
});

const BASE_QUESTIONS: InterviewQuestion[] = [
  tri('infersOutputs', 'A', '¿Infiere el sistema, a partir de la información de entrada, la manera de generar resultados (predicciones, contenidos, recomendaciones o decisiones)?', siempre, { bloqueaClasificacion: true }),

  ...PROHIBITED_SYSTEMS_CATALOG.map((p) =>
    tri(
      `prohibitedPractices.${p.id}`,
      'B',
      `${p.legalArticle}: ${p.title}${p.applicableFrom ? ` (aplicable desde el ${new Date(p.applicableFrom).toLocaleDateString('es-ES')})` : ''}`,
      esIA,
      { bloqueaClasificacion: true }
    )
  ),

  {
    id: 'annexIIIArea',
    bloque: 'C',
    tipo: 'select',
    enunciado: '¿En qué ámbito del Anexo III se utiliza el sistema?',
    opciones: [
      { value: 'desconocido', label: 'No lo sé' },
      { value: 'ninguno', label: 'Ninguno de los ámbitos del Anexo III' },
      ...Object.entries(ANNEX_III_LABELS).map(([value, label]) => ({ value, label })),
    ],
    valorDesconocido: 'desconocido',
    visible: esIA,
    bloqueaClasificacion: true,
    sugerible: 'documental',
  },
  tri(
    'essentialPublicAssistance',
    'C',
    '¿Evalúa la admisibilidad de personas físicas para servicios y prestaciones esenciales de asistencia pública (o los concede, reduce, retira o reclama)?',
    (a) => esIA(a) && a.annexIIIArea === 'servicios_esenciales',
    { bloqueaClasificacion: true }
  ),
  tri(
    'performsProfiling',
    'C',
    '¿Elabora perfiles de personas físicas (evalúa aspectos personales como rendimiento, situación económica, fiabilidad o comportamiento)?',
    esIA,
    { bloqueaClasificacion: true }
  ),
  {
    id: 'article63Condition',
    bloque: 'C',
    tipo: 'select',
    enunciado: '¿Qué condición del Art. 6.3 concurre? (basta una)',
    opciones: [
      { value: 'desconocido', label: 'No lo sé' },
      { value: 'ninguna', label: 'No concurre ninguna condición' },
      ...Object.entries(ARTICLE_63_CONDITIONS).map(([value, text]) => ({ value, label: `Letra ${value}): ${text}` })),
    ],
    valorDesconocido: 'desconocido',
    visible: (a) => enAnexoIII(a) && a.performsProfiling === 'no',
    bloqueaClasificacion: true,
    sugerible: 'documental',
  },
  {
    id: 'article63Facts',
    bloque: 'C',
    tipo: 'texto',
    enunciado: 'Hechos que justifican esa condición',
    valorDesconocido: '',
    visible: condicion63Elegida,
    bloqueaClasificacion: true,
    sugerible: 'orientacion',
  },
  tri('materialInfluence', 'C', '¿Influye sustancialmente el sistema en el resultado de la toma de decisiones?', condicion63Elegida, { bloqueaClasificacion: true }),

  tri('interactsWithPersons', 'D', '¿Interactúa directamente con personas físicas (por ejemplo, un asistente conversacional)?', esIA, { bloqueaClasificacion: true }),
  tri('generatesSyntheticContent', 'D', '¿Genera contenido sintético (texto, imagen, audio o vídeo)?', esIA, { bloqueaClasificacion: true }),
  tri(
    'publishesPublicInterestText',
    'D',
    '¿Se publica el texto que genera para informar al público sobre asuntos de interés público (notas de prensa, noticias, avisos)?',
    (a) => esIA(a) && a.generatesSyntheticContent !== 'no'
  ),
  tri(
    'editorialReview',
    'D',
    '¿Pasa ese texto por revisión humana o control editorial antes de publicarse, con una persona o la entidad como responsable de la publicación?',
    (a) => esIA(a) && a.generatesSyntheticContent !== 'no' && a.publishesPublicInterestText === 'si'
  ),

  {
    id: 'institutionalRole',
    bloque: 'E',
    tipo: 'select',
    enunciado: '¿Qué papel tiene la entidad respecto del sistema?',
    opciones: [
      { value: 'desconocido', label: 'No lo sé' },
      { value: 'proveedor', label: 'Proveedora: desarrolla el sistema (o lo encarga) y lo pone en servicio con su propio nombre' },
      { value: 'responsable_despliegue', label: 'Responsable del despliegue: utiliza bajo su autoridad un sistema de un tercero' },
      { value: 'ambos', label: 'Ambas: lo desarrolla y lo utiliza (caso habitual de las aplicaciones propias)' },
    ],
    valorDesconocido: 'desconocido',
    visible: esIA,
    bloqueaClasificacion: false,
    sugerible: 'orientacion',
  },

  {
    id: 'humanOversightLevel',
    bloque: 'F',
    tipo: 'select',
    enunciado: '¿Cuándo revisa una persona los resultados?',
    opciones: [
      { value: 'desconocido', label: 'No lo sé' },
      { value: 'pre_execution', label: 'Antes de que produzcan efectos (revisión previa)' },
      { value: 'post_execution', label: 'Después de que produzcan efectos (revisión posterior)' },
      { value: 'fully_automated', label: 'Nunca: el sistema actúa sin intervención humana' },
    ],
    valorDesconocido: 'desconocido',
    visible: siempre,
    bloqueaClasificacion: false,
    sugerible: 'documental',
  },
  tri('producesAdministrativeActs', 'F', '¿Produce o prepara el sistema actos o actuaciones administrativas (resoluciones, notificaciones, certificados, trámites)?', siempre),
  tri('directHumanIntervention', 'F', '¿Interviene de forma directa un empleado público en cada acto o actuación?', (a) => a.producesAdministrativeActs !== 'no'),

  tri('processesPersonalData', 'G', '¿Trata datos personales?', siempre),
  {
    id: 'legalBasis',
    bloque: 'G',
    tipo: 'select',
    enunciado: 'Base jurídica del tratamiento (Art. 6.1 RGPD)',
    opciones: [
      { value: 'desconocida', label: 'No lo sé' },
      { value: 'art_6_1_e', label: 'Art. 6.1.e): misión de interés público o ejercicio de poderes públicos' },
      { value: 'art_6_1_c', label: 'Art. 6.1.c): cumplimiento de una obligación legal' },
      { value: 'otra', label: 'Otra base del Art. 6.1' },
    ],
    valorDesconocido: 'desconocida',
    visible: tratarDatos,
    bloqueaClasificacion: false,
    sugerible: 'orientacion',
  },
  tri('processesSpecialCategoryData', 'G', '¿Trata categorías especiales de datos (Art. 9 RGPD: salud, origen étnico, opiniones políticas, afiliación sindical, etc.)?', tratarDatos),
  tri('processesCriminalData', 'G', '¿Trata datos relativos a condenas e infracciones penales (Art. 10 RGPD)?', tratarDatos),
  tri('processesSolvencyData', 'G', '¿Trata datos sobre la solvencia o las deudas de personas físicas (concursos, embargos, impagos)?', tratarDatos),
  tri('biometricIdentification', 'G', '¿Usa datos biométricos para identificar de manera única a una persona?', tratarDatos),
  tri('geneticData', 'G', '¿Trata datos genéticos?', tratarDatos),
  tri('systematicMonitoring', 'G', '¿Observa, monitoriza o controla a los interesados de forma sistemática?', tratarDatos),
  tri('largeScale', 'G', '¿Trata datos a gran escala?', tratarDatos),
  tri('datasetCombination', 'G', '¿Combina o enlaza datos de distintos tratamientos o responsables?', tratarDatos),
  tri('vulnerableSubjects', 'G', '¿Afecta a personas vulnerables o en riesgo de exclusión social?', tratarDatos),
  tri('preventsRightsOrService', 'G', '¿Puede impedir a los interesados ejercer un derecho o acceder a un servicio o contrato?', tratarDatos),
  tri('breachProcedure', 'G', '¿Existe un procedimiento para detectar, documentar y notificar brechas de datos personales?', tratarDatos, { sugerible: 'orientacion' }),
  {
    id: 'hostingModel',
    bloque: 'G',
    tipo: 'select',
    enunciado: '¿Dónde se ejecuta el sistema: el modelo de IA o, si no usa IA, la aplicación y sus datos?',
    opciones: [
      { value: 'desconocido', label: 'No lo sé' },
      { value: 'local_on_premise', label: 'En servidores propios de la entidad (incluidos modelos locales: Ollama, vLLM…)' },
      { value: 'eu_cloud_dpa', label: 'En una nube de la Unión Europea con contrato de encargo del tratamiento' },
      { value: 'us_hyperscaler', label: 'Fuera del Espacio Económico Europeo o sin garantía de tratamiento en la UE (por ejemplo, APIs o alojamientos gratuitos en la nube)' },
    ],
    valorDesconocido: 'desconocido',
    visible: siempre,
    bloqueaClasificacion: false,
    sugerible: 'documental',
  },

  ...ENS_DIMENSIONS.map(
    (d: EnsDimension): InterviewQuestion => ({
      id: `ensImpact.${d}`,
      bloque: 'H',
      tipo: 'select',
      enunciado: `${ENS_DIMENSION_LABELS[d]} [${d}]`,
      opciones: [
        { value: 'desconocido', label: 'Sin valorar' },
        { value: 'no_afectada', label: 'No afectada' },
        { value: 'bajo', label: 'Bajo (perjuicio limitado)' },
        { value: 'medio', label: 'Medio (perjuicio grave)' },
        { value: 'alto', label: 'Alto (perjuicio muy grave)' },
      ],
      valorDesconocido: 'desconocido',
      visible: siempre,
      bloqueaClasificacion: false,
      sugerible: 'orientacion',
    })
  ),
  tri('auditLogsEnabled', 'H', '¿Se registran las peticiones, respuestas y eventos (registro de actividad)?', siempre),
  tri('deterministicConfig', 'H', '¿Se fija la configuración del modelo (versión, temperatura) para que los resultados sean reproducibles?', esIA),
];

/** Preguntas en el orden de la entrevista, con su ayuda en lenguaje sencillo. */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = BASE_QUESTIONS.map((q) => ({ ...q, ayuda: INTERVIEW_HELP[q.id] }));

/** Preguntas de un bloque, en orden. */
export function questionsOfBlock(bloque: InterviewBlock): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter((q) => q.bloque === bloque);
}

const POR_ID = new Map(INTERVIEW_QUESTIONS.map((q) => [q.id, q]));

export function questionById(id: string): InterviewQuestion | undefined {
  return POR_ID.get(id);
}

/** Valor actual de una pregunta (admite rutas de un nivel: `ensImpact.C`). */
export function getAnswerValue(a: LegalEnrichmentAnswers, id: string): string {
  const [campo, sub] = id.split('.');
  const valor = (a as unknown as Record<string, unknown>)[campo];
  if (sub) {
    const mapa = (valor ?? {}) as Record<string, unknown>;
    return String(mapa[sub] ?? questionById(id)?.valorDesconocido ?? 'desconocido');
  }
  return String(valor ?? '');
}

/** Devuelve unas respuestas nuevas con el valor indicado. */
export function setAnswerValue(a: LegalEnrichmentAnswers, id: string, value: string): LegalEnrichmentAnswers {
  const [campo, sub] = id.split('.');
  const actual = a as unknown as Record<string, unknown>;
  if (sub) {
    return { ...a, [campo]: { ...((actual[campo] ?? {}) as Record<string, unknown>), [sub]: value } } as LegalEnrichmentAnswers;
  }
  return { ...a, [campo]: value } as LegalEnrichmentAnswers;
}

function sinContestar(a: LegalEnrichmentAnswers, q: InterviewQuestion): boolean {
  const v = getAnswerValue(a, q.id);
  return q.tipo === 'texto' ? !v.trim() : v === q.valorDesconocido;
}

/** Preguntas visibles sin contestar, en el orden de la entrevista. */
/**
 * Respuestas que se tienen en cuenta: las de las preguntas que la entrevista oculta (porque no
 * aplican al caso) se tratan como no contestadas, para que una respuesta antigua no alimente
 * textos ni conclusiones (DOC-17). La visibilidad se calcula sobre las respuestas originales.
 */
export function applicableAnswers(a: LegalEnrichmentAnswers): LegalEnrichmentAnswers {
  let out = a;
  for (const q of INTERVIEW_QUESTIONS) {
    if (q.visible(a)) continue;
    const neutro = q.tipo === 'texto' ? '' : (q.valorDesconocido ?? 'desconocido');
    if (getAnswerValue(out, q.id) !== neutro) out = setAnswerValue(out, q.id, neutro);
  }
  return out;
}

export function pendingQuestions(a: LegalEnrichmentAnswers): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter((q) => q.visible(a) && sinContestar(a, q));
}

export function isPending(a: LegalEnrichmentAnswers, id: string): boolean {
  const q = questionById(id);
  return Boolean(q && q.visible(a) && sinContestar(a, q));
}

/** Pendientes ordenadas por prioridad: primero las que impiden concluir la clasificación. */
export function pendingByPriority(a: LegalEnrichmentAnswers): InterviewQuestion[] {
  const lista = pendingQuestions(a);
  return [...lista.filter((q) => q.bloqueaClasificacion), ...lista.filter((q) => !q.bloqueaClasificacion)];
}
