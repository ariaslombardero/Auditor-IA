import type {
  AnnexIIIArea,
  AppIngestData,
  Article63Condition,
  ClassificationStep,
  LegalEnrichmentAnswers,
  RequirementAssessment,
  TriState,
} from '../../types';
import { PROHIBITED_SYSTEMS_CATALOG } from '../legalKnowledgeBase';
import { REGULATORY_CALENDAR, applicabilityNote } from '../regulatoryCalendar';
import type { DocumentHint } from '../documentHints';

/**
 * Evaluadores independientes del motor de clasificación. Cada uno devuelve su conclusión
 * junto con el paso de la traza (pregunta, respuesta, regla, fuente y límites).
 */

export const TRI_LABEL: Record<TriState, string> = { si: 'Sí', no: 'No', desconocido: 'Desconocido' };

const RIA = 'Reglamento (UE) 2024/1689';

// ---------------------------------------------------------------------------------------------
// A. Definición de sistema de IA (Art. 3.1)
// ---------------------------------------------------------------------------------------------

export function evaluateAiDefinition(ingest: AppIngestData, answers: LegalEnrichmentAnswers): { isAi: TriState; step: ClassificationStep } {
  let isAi: TriState = answers.infersOutputs;
  let respuesta = TRI_LABEL[answers.infersOutputs];
  if (isAi === 'desconocido' && typeof ingest.isAiSystem === 'boolean') {
    isAi = ingest.isAiSystem ? 'si' : 'no';
    respuesta = `${TRI_LABEL[isAi]} (según la declaración de la ingesta; la pregunta del Art. 3.1 no se ha contestado)`;
  }
  return {
    isAi,
    step: {
      id: 'ART-3-1',
      pregunta: '¿Infiere el sistema, a partir de la información de entrada, la manera de generar resultados de salida (predicciones, contenidos, recomendaciones o decisiones)?',
      respuesta,
      conclusion:
        isAi === 'si' ? 'Es un sistema de IA: se aplica el RIA.' : isAi === 'no' ? 'No sería un sistema de IA: queda fuera del RIA.' : 'No puede determinarse si es un sistema de IA.',
      regla: 'Un sistema de IA es un sistema basado en una máquina que infiere de la información de entrada la manera de generar resultados de salida que pueden influir en entornos físicos o virtuales.',
      fuente: `${RIA}, Art. 3.1`,
      limites: 'Respuesta declarada. Debe contrastarse con las capacidades reales del sistema y con las Directrices de la Comisión sobre la definición de sistema de IA.',
    },
  };
}

// ---------------------------------------------------------------------------------------------
// B. Prácticas prohibidas (Art. 5)
// ---------------------------------------------------------------------------------------------

export function evaluateProhibitions(
  answers: LegalEnrichmentAnswers,
  isAi: TriState,
  hints: DocumentHint[],
  fecha: string,
  today: string
): { requirements: RequirementAssessment[]; declared: string[]; unknown: string[]; step: ClassificationStep } {
  const requirements: RequirementAssessment[] = [];
  const declared: string[] = [];
  const unknown: string[] = [];

  for (const item of PROHIBITED_SYSTEMS_CATALOG) {
    const answer = answers.prohibitedPractices[item.id] ?? 'desconocido';
    const hint = hints.find((h) => h.target === item.id);
    const exigible = item.applicableFrom || REGULATORY_CALENDAR.art5.fecha;
    if (answer === 'si') declared.push(item.title);
    if (answer === 'desconocido') unknown.push(item.title);

    const hintNote = hint ? ` La documentación contiene un indicio («${hint.evidence}»): confirme la respuesta.` : '';
    const hechos =
      answer === 'si'
        ? 'Declarado por el promotor que el sistema incurre en esta práctica.'
        : answer === 'no'
          ? `Declarado por el promotor que no concurre.${hintNote}`
          : `No consta respuesta.${hintNote}`;

    requirements.push({
      id: `RIA-ART-5-${item.id}`,
      kind: 'practica_prohibida',
      pillar: 'ria',
      title: item.title,
      norma: RIA,
      precepto: item.legalArticle,
      aplicabilidad: isAi === 'no' ? 'no_aplica' : isAi === 'si' ? 'aplica' : 'desconocida',
      resultado: answer === 'si' ? 'incumple' : answer === 'no' ? 'declarado' : 'pendiente',
      origen: 'declaracion_promotor',
      hechos: `${hechos} ${applicabilityNote(exigible, today)}`,
      accionRequerida:
        answer === 'si'
          ? 'El sistema no puede introducirse en el mercado, ponerse en servicio ni utilizarse mientras incurra en esta práctica.'
          : answer === 'no'
            ? 'Confirmar en la revisión jurídica que la práctica no concurre.'
            : 'Contestar en la entrevista si el sistema incurre en esta práctica.',
      exigibleDesde: exigible,
      fecha,
    });
  }

  const respuesta = declared.length
    ? `Declaradas: ${declared.join('; ')}`
    : unknown.length
      ? `${unknown.length} práctica(s) sin contestar`
      : 'Declarado que no concurre ninguna';

  return {
    requirements,
    declared,
    unknown,
    step: {
      id: 'ART-5',
      pregunta: '¿Incurre el sistema en alguna de las prácticas prohibidas del Art. 5?',
      respuesta,
      conclusion: declared.length
        ? 'Práctica prohibida declarada.'
        : unknown.length
          ? 'No puede descartarse una práctica prohibida.'
          : 'No se declara ninguna práctica prohibida.',
      regla: 'Quedan prohibidas la introducción en el mercado, la puesta en servicio y la utilización de sistemas que incurran en las prácticas del Art. 5.1.',
      fuente: `${RIA}, Art. 5 (letras b bis y b ter añadidas por el Reglamento (UE) 2026/1744)`,
      limites: 'Respuestas declaradas. Los indicios de la documentación solo orientan la revisión: no deciden.',
    },
  };
}

// ---------------------------------------------------------------------------------------------
// C. Ámbito del Anexo III y excepción del Art. 6.3
// ---------------------------------------------------------------------------------------------

export const ANNEX_III_LABELS: Record<Exclude<AnnexIIIArea, 'ninguno' | 'desconocido'>, string> = {
  biometria: 'Anexo III, punto 1: biometría',
  infraestructuras_criticas: 'Anexo III, punto 2: infraestructuras críticas',
  educacion: 'Anexo III, punto 3: educación y formación profesional',
  empleo: 'Anexo III, punto 4: empleo, gestión de los trabajadores y acceso al autoempleo',
  servicios_esenciales: 'Anexo III, punto 5.a): servicios y prestaciones esenciales de asistencia pública',
  garantia_derecho: 'Anexo III, punto 6: garantía del cumplimiento del Derecho',
  migracion: 'Anexo III, punto 7: migración, asilo y gestión del control fronterizo',
  justicia_democracia: 'Anexo III, punto 8: administración de justicia y procesos democráticos',
};

export const ARTICLE_63_CONDITIONS: Record<Exclude<Article63Condition, 'ninguna' | 'desconocido'>, string> = {
  a: 'realizar una tarea de procedimiento limitada',
  b: 'mejorar el resultado de una actividad humana previamente realizada',
  c: 'detectar patrones de toma de decisiones o desviaciones respecto de patrones anteriores, sin sustituir ni influir en la valoración humana previa sin una revisión humana adecuada',
  d: 'realizar una tarea preparatoria para una evaluación pertinente a efectos de los casos de uso del Anexo III',
};

export interface HighRiskEvaluation {
  inScope: TriState;
  highRisk: TriState;
  exception: TriState;
  annexIIICategory?: string;
  justification?: string;
  steps: ClassificationStep[];
}

export function evaluateHighRisk(answers: LegalEnrichmentAnswers): HighRiskEvaluation {
  const steps: ClassificationStep[] = [];
  const area = answers.annexIIIArea;
  let inScope: TriState;
  let annexIIICategory: string | undefined;
  let scopeLimits = 'Se valora el ámbito declarado; no se comprueban por separado las letras de cada punto del Anexo III.';

  if (area === 'desconocido') {
    inScope = 'desconocido';
  } else if (area === 'ninguno') {
    inScope = 'no';
  } else if (area === 'servicios_esenciales') {
    inScope = answers.essentialPublicAssistance;
    annexIIICategory = ANNEX_III_LABELS.servicios_esenciales;
    scopeLimits = 'Solo se evalúa el punto 5.a) (prestaciones esenciales de asistencia pública a personas físicas). Los puntos 5.b) a 5.d) (solvencia, seguros, llamadas de emergencia) no están soportados por el motor.';
  } else {
    inScope = 'si';
    annexIIICategory = ANNEX_III_LABELS[area];
  }

  steps.push({
    id: 'ANEXO-III',
    pregunta: '¿En qué ámbito del Anexo III se utiliza el sistema?' + (area === 'servicios_esenciales' ? ' ¿Evalúa la admisibilidad de personas físicas para prestaciones esenciales de asistencia pública?' : ''),
    respuesta:
      area === 'desconocido'
        ? 'Desconocido'
        : area === 'ninguno'
          ? 'Ninguno'
          : `${annexIIICategory}${area === 'servicios_esenciales' ? ` · ${TRI_LABEL[answers.essentialPublicAssistance]}` : ''}${answers.annexIIIUseDescription ? ` · Uso declarado: ${answers.annexIIIUseDescription}` : ''}`,
    conclusion: inScope === 'si' ? 'En el ámbito del Anexo III.' : inScope === 'no' ? 'Fuera del ámbito del Anexo III.' : 'No puede determinarse el ámbito.',
    regla: 'Son de alto riesgo los sistemas de IA mencionados en el Anexo III, salvo la excepción del Art. 6.3.',
    fuente: `${RIA}, Art. 6.2 y Anexo III`,
    limites: scopeLimits,
  });

  if (inScope !== 'si') {
    return { inScope, highRisk: inScope === 'no' ? 'no' : 'desconocido', exception: 'no', annexIIICategory, steps };
  }

  steps.push({
    id: 'ART-6-3-PERFILADO',
    pregunta: '¿Elabora el sistema perfiles de personas físicas (evaluación de aspectos personales como rendimiento, situación económica, fiabilidad o comportamiento)?',
    respuesta: TRI_LABEL[answers.performsProfiling],
    conclusion:
      answers.performsProfiling === 'si'
        ? 'Hay perfilado: siempre es de alto riesgo.'
        : answers.performsProfiling === 'no'
          ? 'Sin perfilado: puede valorarse la excepción.'
          : 'No consta si hay perfilado.',
    regla: 'Los sistemas del Anexo III siempre se consideran de alto riesgo cuando elaboran perfiles de personas físicas.',
    fuente: `${RIA}, Art. 6.3, último párrafo, y Art. 3.52 (remite al Art. 4.4 RGPD)`,
    limites: 'Comprobar documentos formales (que una solicitud incluya lo exigido) no es, por sí solo, valorar aspectos personales.',
  });

  if (answers.performsProfiling === 'si') {
    return { inScope, highRisk: 'si', exception: 'no', annexIIICategory, steps };
  }
  if (answers.performsProfiling === 'desconocido') {
    return { inScope, highRisk: 'desconocido', exception: 'desconocido', annexIIICategory, steps };
  }

  const condition = answers.article63Condition;
  const facts = answers.article63Facts.trim();
  let highRisk: TriState;
  let exception: TriState;
  let conclusion: string;
  if (condition === 'ninguna') {
    highRisk = 'si';
    exception = 'no';
    conclusion = 'No se invoca ninguna condición: alto riesgo.';
  } else if (condition === 'desconocido') {
    highRisk = 'desconocido';
    exception = 'desconocido';
    conclusion = 'No consta qué condición del Art. 6.3 concurre.';
  } else if (answers.materialInfluence === 'si') {
    highRisk = 'si';
    exception = 'no';
    conclusion = 'Influye sustancialmente en la decisión: no procede la excepción.';
  } else if (answers.materialInfluence === 'desconocido') {
    highRisk = 'desconocido';
    exception = 'desconocido';
    conclusion = 'No consta si influye sustancialmente en la decisión.';
  } else if (!facts) {
    highRisk = 'desconocido';
    exception = 'desconocido';
    conclusion = 'Falta describir los hechos que justifican la condición invocada.';
  } else {
    highRisk = 'no';
    exception = 'si';
    conclusion = 'Se acogería a la excepción del Art. 6.3, pendiente de documentar y registrar.';
  }

  steps.push({
    id: 'ART-6-3-CONDICION',
    pregunta: '¿Qué condición del Art. 6.3 concurre y por qué? ¿Influye sustancialmente en el resultado de la toma de decisiones?',
    respuesta: `Condición: ${condition === 'ninguna' ? 'ninguna' : condition === 'desconocido' ? 'desconocida' : `letra ${condition})`} · Influencia sustancial: ${TRI_LABEL[answers.materialInfluence]}${facts ? ` · Hechos: ${facts}` : ''}`,
    conclusion,
    regla: 'Un sistema del Anexo III no es de alto riesgo si no plantea un riesgo importante, también al no influir sustancialmente en el resultado de la decisión, y concurre cualquiera de las condiciones a) a d).',
    fuente: `${RIA}, Art. 6.3 y 6.4`,
    limites: 'Respuestas declaradas. El proveedor debe documentar la evaluación antes de la puesta en servicio.',
  });

  let justification: string | undefined;
  if (exception === 'si' && condition !== 'ninguna' && condition !== 'desconocido') {
    justification = `Excepción del Art. 6.3 invocada por el promotor: letra ${condition}) (${ARTICLE_63_CONDITIONS[condition]}). Hechos declarados: «${facts}». Declarado que el sistema no influye sustancialmente en el resultado de la decisión y que no elabora perfiles de personas físicas. Debe documentarse antes de la puesta en servicio (Art. 6.4) y registrarse en la base de datos de la UE (Art. 49.2).`;
  }

  return { inScope, highRisk, exception, annexIIICategory, justification, steps };
}

// ---------------------------------------------------------------------------------------------
// D. Transparencia (Art. 50)
// ---------------------------------------------------------------------------------------------

export function evaluateTransparency(answers: LegalEnrichmentAnswers): { applies: TriState; step: ClassificationStep } {
  const { interactsWithPersons: i, generatesSyntheticContent: g } = answers;
  const applies: TriState = i === 'si' || g === 'si' ? 'si' : i === 'no' && g === 'no' ? 'no' : 'desconocido';
  return {
    applies,
    step: {
      id: 'ART-50',
      pregunta: '¿Interactúa directamente con personas físicas? ¿Genera contenido sintético (texto, imagen, audio o vídeo)?',
      respuesta: `Interacción: ${TRI_LABEL[i]} · Contenido sintético: ${TRI_LABEL[g]}`,
      conclusion:
        applies === 'si' ? 'Se aplican obligaciones de transparencia.' : applies === 'no' ? 'No se aplican las obligaciones del Art. 50.' : 'No puede determinarse si se aplica el Art. 50.',
      regla: 'Los sistemas destinados a interactuar con personas físicas deben informarles de que interactúan con una IA; el contenido sintético debe marcarse.',
      fuente: `${RIA}, Art. 50`,
      limites: 'Se acumula con el resto de obligaciones: no es una categoría alternativa al alto riesgo.',
    },
  };
}

// ---------------------------------------------------------------------------------------------
// E. Contradicciones entre respuestas
// ---------------------------------------------------------------------------------------------

export function detectContradictions(answers: LegalEnrichmentAnswers): string[] {
  const reasons: string[] = [];
  const noPersonal = answers.processesPersonalData === 'no';
  if (answers.performsProfiling === 'si' && noPersonal) {
    reasons.push('Se declara la elaboración de perfiles de personas físicas y, a la vez, que no se tratan datos personales.');
  }
  if (noPersonal && (answers.processesSpecialCategoryData === 'si' || answers.processesCriminalData === 'si' || answers.biometricIdentification === 'si')) {
    reasons.push('Se declaran categorías especiales, datos penales o biométricos y, a la vez, que no se tratan datos personales.');
  }
  const producesActs = answers.producesAdministrativeActs !== 'no';
  if (producesActs && answers.directHumanIntervention === 'si' && answers.humanOversightLevel === 'fully_automated') {
    reasons.push('Se declara la intervención directa de un empleado público y, a la vez, una actuación sin intervención humana.');
  }
  if (producesActs && answers.directHumanIntervention === 'no' && answers.humanOversightLevel === 'pre_execution') {
    reasons.push('Se declara una revisión humana previa y, a la vez, que no interviene de forma directa ningún empleado público.');
  }
  return reasons;
}
