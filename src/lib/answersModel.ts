import type { EnsDimension, EnsLevel, LegalEnrichmentAnswers, TriState } from '../types';
import { PROHIBITED_SYSTEMS_CATALOG } from './legalKnowledgeBase';

export const ENS_DIMENSIONS: EnsDimension[] = ['C', 'I', 'T', 'A', 'D'];

export const ENS_DIMENSION_LABELS: Record<EnsDimension, string> = {
  C: 'Confidencialidad',
  I: 'Integridad',
  T: 'Trazabilidad',
  A: 'Autenticidad',
  D: 'Disponibilidad',
};

function allUnknownPractices(): Record<string, TriState> {
  return Object.fromEntries(PROHIBITED_SYSTEMS_CATALOG.map((p) => [p.id, 'desconocido' as TriState]));
}

function allUnknownEns(): Record<EnsDimension, EnsLevel> {
  return { C: 'desconocido', I: 'desconocido', T: 'desconocido', A: 'desconocido', D: 'desconocido' };
}

/**
 * Entrevista sin contestar: todas las respuestas parten de «desconocido».
 * El motor no interpreta «desconocido» como ausencia de riesgo.
 */
export function createDefaultAnswers(): LegalEnrichmentAnswers {
  return {
    schemaVersion: 2,
    infersOutputs: 'desconocido',
    prohibitedPractices: allUnknownPractices(),
    annexIIIArea: 'desconocido',
    annexIIIUseDescription: '',
    essentialPublicAssistance: 'desconocido',
    performsProfiling: 'desconocido',
    article63Condition: 'desconocido',
    article63Facts: '',
    materialInfluence: 'desconocido',
    interactsWithPersons: 'desconocido',
    generatesSyntheticContent: 'desconocido',
    institutionalRole: 'desconocido',
    humanOversightLevel: 'desconocido',
    supervisionRole: '',
    directHumanIntervention: 'desconocido',
    procedureDescription: '',
    publicCompetenceNorm: '',
    processesPersonalData: 'desconocido',
    legalBasis: 'desconocida',
    processesSpecialCategoryData: 'desconocido',
    processesCriminalData: 'desconocido',
    biometricIdentification: 'desconocido',
    geneticData: 'desconocido',
    systematicMonitoring: 'desconocido',
    largeScale: 'desconocido',
    datasetCombination: 'desconocido',
    vulnerableSubjects: 'desconocido',
    preventsRightsOrService: 'desconocido',
    ratActivityName: '',
    hostingModel: 'desconocido',
    ensImpact: allUnknownEns(),
    auditLogsEnabled: 'desconocido',
    logRetentionMonths: 0,
    deterministicConfig: 'desconocido',
  };
}

const boolToTri = (v: unknown): TriState => (v === true ? 'si' : v === false ? 'no' : 'desconocido');

/**
 * Convierte respuestas guardadas por la entrevista anterior (v1) al modelo actual.
 * Solo se trasladan los datos que tienen equivalente claro; el resto queda «desconocido».
 * Los valores por defecto de la versión anterior no se distinguen de respuestas reales,
 * por eso la naturaleza «auxilio técnico» no se traslada como intervención humana acreditada.
 */
export function normalizeAnswers(raw: unknown): LegalEnrichmentAnswers {
  const base = createDefaultAnswers();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;

  if (r.schemaVersion === 2) {
    const v2 = r as unknown as LegalEnrichmentAnswers;
    return {
      ...base,
      ...v2,
      prohibitedPractices: { ...base.prohibitedPractices, ...(v2.prohibitedPractices || {}) },
      ensImpact: { ...base.ensImpact, ...(v2.ensImpact || {}) },
    };
  }

  // Versión 1
  const migrated: LegalEnrichmentAnswers = { ...base };
  if (r.humanOversightLevel === 'pre_execution' || r.humanOversightLevel === 'post_execution' || r.humanOversightLevel === 'fully_automated') {
    migrated.humanOversightLevel = r.humanOversightLevel;
  }
  if (typeof r.supervisionRole === 'string') migrated.supervisionRole = r.supervisionRole;
  if (typeof r.publicCompetenceNorm === 'string') migrated.publicCompetenceNorm = r.publicCompetenceNorm;
  if (r.administrativeNature === 'automated_administrative_act') migrated.directHumanIntervention = 'no';
  if (r.hostingModel === 'local_on_premise' || r.hostingModel === 'eu_cloud_dpa' || r.hostingModel === 'us_hyperscaler') {
    migrated.hostingModel = r.hostingModel;
  }
  migrated.processesSpecialCategoryData = boolToTri(r.processesSpecialCategoryData);
  if (typeof r.ratActivityName === 'string') migrated.ratActivityName = r.ratActivityName;
  migrated.auditLogsEnabled = boolToTri(r.auditLogsEnabled);
  if (typeof r.logRetentionMonths === 'number') migrated.logRetentionMonths = r.logRetentionMonths;
  migrated.deterministicConfig = boolToTri(r.deterministicConfig);
  migrated.performsProfiling = boolToTri(r.performsProfilingOrScoring);
  if (r.interactionAndGenerationType === 'internal_non_generative') {
    migrated.interactsWithPersons = 'no';
    migrated.generatesSyntheticContent = 'no';
  }
  return migrated;
}

// El recuento de respuestas pendientes está en interviewCatalog.ts (pendingQuestions):
// solo cuenta las preguntas que la entrevista muestra.
