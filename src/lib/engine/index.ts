import type { AppIngestData, ClassificationStep, DiagnosticResult, LegalEnrichmentAnswers, RiskClassification } from '../../types';
import { normalizeAnswers } from '../answersModel';
import { annexIIIHints, aiUsageHint, cloudProviderHints, prohibitedPracticeHints } from '../documentHints';
import { referenceDate } from '../regulatoryCalendar';
import { ENGINE_VERSION, NORMATIVE_SNAPSHOT } from '../traceability';
import { unaccreditedRequirements } from '../assessmentModel';
import {
  detectContradictions,
  evaluateAiDefinition,
  evaluateHighRisk,
  evaluateProhibitions,
  evaluateTransparency,
} from './evaluators';
import { buildObligations, evaluateEns } from './obligations';
import { pendingQuestions } from '../interviewCatalog';

export interface EngineOptions {
  /** Fecha de referencia (AAAA-MM-DD) para valorar la exigibilidad. Por defecto, hoy. */
  today?: string;
}

const LABELS: Record<RiskClassification, string> = {
  prohibited: 'RIESGO INADMISIBLE (Práctica Prohibida - Art. 5 RIA)',
  high_risk: 'ALTO RIESGO (Anexo III RIA)',
  transparency_risk: 'Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA)',
  minimal_risk: 'RIESGO MÍNIMO O NULO (Art. 95 RIA)',
  not_ai_system: 'EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado',
  requires_review: 'REQUIERE REVISIÓN (clasificación no concluyente)',
};

/**
 * Motor determinista de clasificación. Separa definición de IA, prohibiciones, ámbito de alto riesgo,
 * excepción y transparencia; las respuestas desconocidas o contradictorias conducen a «requiere revisión».
 */
export function evaluateRulesDeterministically(
  ingest: AppIngestData,
  rawAnswers: LegalEnrichmentAnswers,
  options: EngineOptions = {}
): DiagnosticResult {
  const answers = normalizeAnswers(rawAnswers);
  const today = options.today || referenceDate();
  const fecha = new Date().toISOString();
  const trace: ClassificationStep[] = [];
  const reviewReasons: string[] = [];

  // Indicios documentales (solo orientan)
  const pHints = prohibitedPracticeHints(ingest);
  const aHints = annexIIIHints(ingest);
  const aiHint = aiUsageHint(ingest);
  if (pHints.length || aHints.length || aiHint) {
    trace.push({
      id: 'INDICIOS',
      pregunta: '¿Qué sugiere la documentación aportada?',
      respuesta: [
        aiHint ? `Uso de IA: «${aiHint.evidence}»` : '',
        ...aHints.map((h) => `Ámbito ${h.target.replace('annexIII:', '')}: «${h.evidence}»`),
        ...pHints.map((h) => `Práctica ${h.target}: «${h.evidence}»`),
      ].filter(Boolean).join(' · '),
      conclusion: 'Indicios para orientar la entrevista.',
      regla: 'Los indicios por palabras clave nunca deciden la clasificación ni el estado de un requisito.',
      fuente: 'Documentación aportada (README, AGENTS.md, descripción)',
      limites: 'Coincidencias de texto con normalización de tildes y exclusión de negaciones; pueden existir falsos positivos y negativos.',
    });
  }

  // A. Art. 3.1
  const ai = evaluateAiDefinition(ingest, answers);
  trace.push(ai.step);
  if (ai.isAi === 'desconocido') reviewReasons.push('No consta si el sistema infiere sus resultados (definición de sistema de IA, Art. 3.1).');

  // B. Art. 5
  const prohibitions = evaluateProhibitions(answers, ai.isAi, pHints, fecha, today);
  if (ai.isAi !== 'no') {
    trace.push(prohibitions.step);
    if (prohibitions.unknown.length) {
      reviewReasons.push(`Prácticas del Art. 5 sin contestar: ${prohibitions.unknown.length}.`);
    }
  }

  // C. Anexo III y Art. 6.3
  const hr = evaluateHighRisk(answers);
  if (ai.isAi !== 'no') {
    trace.push(...hr.steps);
    if (hr.highRisk === 'desconocido') {
      reviewReasons.push(
        hr.inScope === 'desconocido'
          ? 'No consta si el sistema se utiliza en un ámbito del Anexo III.'
          : 'No puede determinarse si se aplica la excepción del Art. 6.3 (perfilado, condición, hechos o influencia sustancial sin contestar).'
      );
    }
  }

  // D. Art. 50
  const transparency = evaluateTransparency(answers);
  if (ai.isAi !== 'no') trace.push(transparency.step);

  // E. Contradicciones
  const contradictions = detectContradictions(answers);
  reviewReasons.push(...contradictions);

  // Clasificación final
  let classification: RiskClassification;
  if (ai.isAi === 'no' && contradictions.length === 0) {
    classification = 'not_ai_system';
  } else if (ai.isAi !== 'no' && prohibitions.declared.length > 0) {
    classification = 'prohibited';
  } else if (reviewReasons.length > 0 || ai.isAi === 'no') {
    classification = 'requires_review';
  } else if (hr.highRisk === 'si') {
    classification = 'high_risk';
  } else if (transparency.applies === 'si') {
    classification = 'transparency_risk';
  } else if (transparency.applies === 'no') {
    classification = 'minimal_risk';
  } else {
    reviewReasons.push('No consta si el sistema interactúa con personas o genera contenido sintético (Art. 50).');
    classification = 'requires_review';
  }

  const isAi = ai.isAi === 'si';
  const isHighRiskAnnexIII = isAi && hr.highRisk === 'si';
  const isArticle63Derogation = isAi && hr.exception === 'si';
  const isAutomatedAdministrativeAct = answers.directHumanIntervention === 'no';

  let riskLabel = LABELS[classification];
  if (isArticle63Derogation && classification === 'transparency_risk') riskLabel = 'Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50)';
  if (isArticle63Derogation && classification === 'minimal_risk') riskLabel = 'RIESGO MÍNIMO (Exceptuado de Alto Riesgo vía Art. 6.3 RIA)';

  const riskSummary = buildSummary(classification, reviewReasons, hr.annexIIICategory, isArticle63Derogation, answers);

  trace.push({
    id: 'CLASIFICACION',
    pregunta: 'Clasificación resultante',
    respuesta: riskLabel,
    conclusion: classification === 'requires_review' ? `No concluyente: ${reviewReasons.join(' ')}` : 'Clasificación preliminar basada en lo declarado.',
    regla: 'Orden de examen: definición de IA (Art. 3.1), prácticas prohibidas (Art. 5), alto riesgo (Art. 6 y Anexo III, con la excepción del Art. 6.3) y transparencia (Art. 50, acumulable). Las respuestas desconocidas o contradictorias impiden concluir.',
    fuente: 'Reglamento (UE) 2024/1689, Arts. 3.1, 5, 6 y 50',
    limites: 'No sustituye la calificación del órgano competente ni la revisión jurídica.',
  });

  // ENS y obligaciones
  const ens = evaluateEns(answers, ingest, isHighRiskAnnexIII);
  const requirements = [
    ...prohibitions.requirements,
    ...buildObligations({
      ingest,
      answers,
      classification,
      isAi: ai.isAi,
      highRisk: hr.highRisk,
      exception: hr.exception,
      appliesArt50: transparency.applies,
      area: answers.annexIIIArea,
      ens,
      annexIIICategory: hr.annexIIICategory,
      fecha,
      today,
    }),
  ];

  const redFlags = buildRedFlags(answers, ingest);
  const recommendations = buildRecommendations(classification, isArticle63Derogation, answers, ingest);
  const pendingCount = unaccreditedRequirements(requirements).length;
  const pendingAnswers = pendingQuestions(answers).length;
  const respuestas = pendingAnswers === 0 ? '' : `Falta${pendingAnswers === 1 ? '' : 'n'} ${pendingAnswers} respuesta${pendingAnswers === 1 ? '' : 's'} de la entrevista. `;
  const porValidar = `Quedan ${pendingCount} requisitos por validar (los acredita una persona con evidencia).`;
  const executiveSummary =
    classification === 'requires_review'
      ? `Diagnóstico preliminar para "${ingest.appName}": la clasificación no es concluyente (${reviewReasons.length} motivo${reviewReasons.length === 1 ? '' : 's'}). ${respuestas}${porValidar} Categoría ENS${ens.orientative ? ' orientativa' : ''}: ${ens.category}. Deben completarse o revisarse las respuestas de la entrevista.`
      : `Diagnóstico preliminar para "${ingest.appName}": según lo declarado, el sistema se clasifica como ${riskLabel}. ${respuestas}${porValidar} Categoría ENS${ens.orientative ? ' orientativa' : ''}: ${ens.category}. Las conclusiones se basan en la entrevista y en la documentación aportada; requieren la validación del órgano competente, del Responsable de Seguridad y del Delegado de Protección de Datos.`;

  return {
    riskClassification: classification,
    riskLabel,
    riskSummary,
    reviewReasons,
    classificationTrace: trace,
    normativeVersion: NORMATIVE_SNAPSHOT,
    institutionalRole: answers.institutionalRole,
    isAiSystem: isAi,
    isHighRiskAnnexIII,
    annexIIICategory: isHighRiskAnnexIII || isArticle63Derogation ? hr.annexIIICategory : undefined,
    isArticle63Derogation: isArticle63Derogation ? true : undefined,
    article63Justification: isArticle63Derogation ? hr.justification : undefined,
    isAutomatedAdministrativeAct,
    ensCategory: ens.category,
    ensReasoning: ens.reasoning,
    ensCategoryIsOrientative: ens.orientative,
    requirements,
    engineVersion: ENGINE_VERSION,
    pendingAnswers,
    redFlags,
    recommendations,
    executiveSummary,
  };
}

function buildSummary(
  classification: RiskClassification,
  reviewReasons: string[],
  annexIIICategory: string | undefined,
  isException: boolean,
  answers: LegalEnrichmentAnswers
): string {
  switch (classification) {
    case 'requires_review':
      return `La clasificación no puede concluirse con las respuestas disponibles: ${reviewReasons.join(' ')}`;
    case 'not_ai_system':
      return 'Según lo declarado, el sistema no infiere sus resultados (se basa en reglas predefinidas), por lo que no sería un sistema de IA (Art. 3.1 RIA). En ese caso se rige por la normativa de administración electrónica (Leyes 39/2015 y 40/2015), el ENS y el RGPD.';
    case 'prohibited':
      return 'Se ha declarado que el sistema incurre en una práctica prohibida por el Art. 5 del Reglamento (UE) 2024/1689: no puede introducirse en el mercado, ponerse en servicio ni utilizarse. El régimen de multas aplicable a las autoridades y organismos públicos lo determina cada Estado miembro (Art. 99.8 RIA).';
    case 'high_risk':
      return `Según lo declarado, el sistema interviene en un ámbito del Anexo III (${annexIIICategory}) y no se acoge a la excepción del Art. 6.3. Las obligaciones dependen del papel de la entidad (proveedora o responsable del despliegue) y son exigibles para el Anexo III desde el 2 de diciembre de 2027 (Reglamento (UE) 2026/1744).`;
    case 'transparency_risk':
      return isException
        ? `Según lo declarado, el sistema se acogería a la excepción del Art. 6.3 del RIA, que exige documentar la evaluación (Art. 6.4) y registrar el sistema (Art. 49.2). Se suman las obligaciones de transparencia del Art. 50.`
        : `Según lo declarado, el sistema interactúa con personas o genera contenido sintético, por lo que le corresponden las obligaciones de transparencia del Art. 50 del RIA.${answers.supervisionRole ? ` Supervisión humana declarada: ${answers.supervisionRole}.` : ''}`;
    case 'minimal_risk':
      return isException
        ? 'Según lo declarado, el sistema se acogería a la excepción del Art. 6.3 del RIA (pendiente de documentar y registrar) y no interactúa con personas ni genera contenido sintético.'
        : 'Según lo declarado, el sistema no está en el Anexo III ni interactúa con personas o genera contenido sintético. Puede adherirse voluntariamente a códigos de conducta (Art. 95).';
  }
}

function buildRedFlags(answers: LegalEnrichmentAnswers, ingest: AppIngestData): string[] {
  const flags: string[] = [];
  if (answers.hostingModel === 'us_hyperscaler') {
    flags.push('Transferencia Internacional de Datos: el envío de datos a servidores fuera del Espacio Económico Europeo exige garantías reforzadas (Cláusulas Contractuales Tipo o Marco de Privacidad de Datos) y una valoración específica de la protección de servicios en la nube ([op.nub.1] ENS).');
  }
  if (answers.humanOversightLevel === 'fully_automated') {
    flags.push('Ausencia de Control Humano Previo: una decisión basada únicamente en tratamiento automatizado puede quedar sujeta a la prohibición del Art. 22 RGPD y, en el sector público, exige los requisitos del Art. 41 de la Ley 40/2015.');
  }
  if (answers.auditLogsEnabled === 'no') {
    flags.push('Inexistencia de Registro de Trazabilidad: impide auditar sesgos, verificar respuestas erróneas o atender reclamaciones y requerimientos ([op.exp.8] ENS).');
  }
  if ((answers.processesSpecialCategoryData === 'si' || answers.processesCriminalData === 'si') && answers.hostingModel !== 'local_on_premise') {
    flags.push('Datos Sensibles en Nube Externa: el tratamiento de categorías especiales (Art. 9 RGPD) o de datos penales (Art. 10 RGPD) debería realizarse prioritariamente en servidores propios con modelos locales.');
  }
  if (answers.hostingModel === 'local_on_premise') {
    const cloud = cloudProviderHints(ingest);
    if (cloud.length > 0) {
      flags.push(`Alojamiento declarado y documentación discrepantes: se declara que el modelo se ejecuta en servidores propios, pero la documentación cita servicios en la nube (${cloud.map((h) => h.target).join(', ')}). Debe comprobarse qué proveedor procesa realmente los datos antes de aplicar las conclusiones sobre transferencias y ENS.`);
    }
  }
  if (ingest.agentsMdContent && ingest.agentsMdContent.trim().length > 0) {
    const agentsLower = ingest.agentsMdContent.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    if (agentsLower.includes('sin intervencion humana') || agentsLower.includes('sin confirmacion') || agentsLower.includes('autonomo sin supervision')) {
      flags.push('Autonomía de Agente no Delimitada (AGENTS.md): se detectan directivas de ejecución sin confirmación del usuario. Toda capacidad de invocar herramientas debería poder interrumpirse y someterse a revisión humana previa; en sistemas de alto riesgo lo exige el Art. 14 RIA.');
    }
  }
  return flags;
}

function buildRecommendations(
  classification: RiskClassification,
  isException: boolean,
  answers: LegalEnrichmentAnswers,
  ingest: AppIngestData
): string[] {
  const recs: string[] = [];
  switch (classification) {
    case 'requires_review':
      recs.push('Completar o corregir las respuestas de la entrevista señaladas como desconocidas o contradictorias antes de extraer conclusiones.');
      break;
    case 'not_ai_system':
      recs.push(
        'Según lo declarado, el software queda fuera del RIA (Art. 3.1). Contrastar esa declaración con las capacidades reales del sistema y centrar el expediente en el ENS (RD 311/2022) y en la Ley 40/2015.',
        'Documentar las especificaciones técnicas de las reglas aplicadas.'
      );
      break;
    case 'prohibited':
      recs.push('No poner en servicio el sistema mientras incurra en la práctica declarada; solicitar revisión jurídica inmediata.');
      break;
    case 'high_risk':
      recs.push(
        'Determinar si la entidad actúa como proveedora, como responsable del despliegue o como ambas.',
        'Como proveedora: preparar el sistema de gestión de riesgos (Art. 9) y la evaluación de la conformidad por control interno (Art. 43.2 y Anexo VI), sin organismo notificado, antes del 2 de diciembre de 2027.',
        'Como responsable del despliegue: realizar la evaluación de impacto en los derechos fundamentales (Art. 27 RIA) y registrar el uso (Art. 49.3).',
        'Evaluar los datos y los posibles sesgos (Art. 10 RIA); la Ley 15/2022 (Art. 23) promueve además evaluaciones de impacto discriminatorio.'
      );
      break;
    default:
      if (isException) {
        recs.push('Documentar la evaluación del Art. 6.3 antes de la puesta en servicio y registrar el sistema en la base de datos de la UE (Arts. 6.4 y 49.2 RIA).');
      }
      if (classification === 'transparency_risk') recs.push('Implantar los avisos de transparencia (banner y pie de página) del Art. 50 del RIA.');
      if (classification === 'minimal_risk') recs.push('Valorar la adhesión voluntaria a un código de conducta (Art. 95 RIA).');
      recs.push(
        'Asegurar que las credenciales no viajen al navegador; priorizar modelos locales (Ollama/vLLM) en servidores corporativos.',
        'Someter el expediente técnico a la revisión del Delegado de Protección de Datos (DPD) y del Responsable de Seguridad del ENS.'
      );
  }
  if (answers.institutionalRole === 'desconocido' && classification !== 'not_ai_system') {
    recs.push('Indicar el papel de la entidad (proveedora o responsable del despliegue): de él dependen las obligaciones.');
  }
  if (ingest.agentsMdContent && ingest.agentsMdContent.trim().length > 0) {
    recs.push('Se ha aportado un AGENTS.md: sus directivas son declaraciones del promotor y deben contrastarse con el comportamiento real del sistema.');
  }
  return recs;
}
