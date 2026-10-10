import JSZip from 'jszip';
import { Packer, type Document } from 'docx';
import type { AppIngestData, DiagnosticResult, FullAuditState, LegalEnrichmentAnswers } from '../types';
import { DEFAULT_INGEST, DEFAULT_METADATA } from '../lib/auditDefaults';
import { createDefaultAnswers } from '../lib/answersModel';
import { PROHIBITED_SYSTEMS_CATALOG } from '../lib/legalKnowledgeBase';
import { evaluateRulesDeterministically } from '../lib/auditEngine';
import { buildOfficialDossierDocument } from '../lib/officialDossierDocx';
import type { DocumentTraceability } from '../lib/traceability';

/**
 * Casos sintéticos de prueba. Ningún dato real ni credencial.
 */
export function makeIngest(appDescription: string, overrides: Partial<AppIngestData> = {}): AppIngestData {
  return {
    ...DEFAULT_INGEST,
    appName: 'Caso sintético',
    appDescription,
    isAiSystem: true,
    ...overrides,
  };
}

/** Entrevista sin contestar (todo «desconocido») con los cambios indicados. */
export function makeAnswers(overrides: Partial<LegalEnrichmentAnswers> = {}): LegalEnrichmentAnswers {
  return { ...createDefaultAnswers(), ...overrides };
}

/**
 * Entrevista completamente contestada para un asistente de bajo riesgo: es IA, no incurre en
 * prácticas prohibidas, no está en el Anexo III, interactúa con personas y genera contenido.
 */
export function answeredAnswers(overrides: Partial<LegalEnrichmentAnswers> = {}): LegalEnrichmentAnswers {
  const base = createDefaultAnswers();
  return {
    ...base,
    infersOutputs: 'si',
    prohibitedPractices: Object.fromEntries(PROHIBITED_SYSTEMS_CATALOG.map((p) => [p.id, 'no'])),
    annexIIIArea: 'ninguno',
    essentialPublicAssistance: 'no',
    performsProfiling: 'no',
    article63Condition: 'ninguna',
    materialInfluence: 'no',
    interactsWithPersons: 'si',
    generatesSyntheticContent: 'si',
    publishesPublicInterestText: 'no',
    institutionalRole: 'ambos',
    humanOversightLevel: 'pre_execution',
    supervisionRole: 'Técnico de la unidad tramitadora',
    directHumanIntervention: 'si',
    procedureDescription: 'El técnico revisa y corrige cada borrador antes de incorporarlo al expediente.',
    publicCompetenceNorm: 'Ley 39/2015',
    processesPersonalData: 'no',
    legalBasis: 'art_6_1_e',
    processesSpecialCategoryData: 'no',
    processesCriminalData: 'no',
    processesSolvencyData: 'no',
    biometricIdentification: 'no',
    geneticData: 'no',
    systematicMonitoring: 'no',
    largeScale: 'no',
    datasetCombination: 'no',
    vulnerableSubjects: 'no',
    preventsRightsOrService: 'no',
    breachProcedure: 'si',
    ratActivityName: 'Apoyo a la gestión documental',
    hostingModel: 'local_on_premise',
    ensImpact: { C: 'bajo', I: 'bajo', T: 'bajo', A: 'bajo', D: 'bajo' },
    auditLogsEnabled: 'si',
    logRetentionMonths: 24,
    deterministicConfig: 'si',
    ...overrides,
  };
}

export function runCase(
  appDescription: string,
  answers: LegalEnrichmentAnswers,
  ingest: Partial<AppIngestData> = {}
): DiagnosticResult {
  return evaluateRulesDeterministically(makeIngest(appDescription, ingest), answers);
}

export function makeState(
  appDescription: string,
  answers: LegalEnrichmentAnswers,
  ingest: Partial<AppIngestData> = {}
): FullAuditState {
  const ingestData = makeIngest(appDescription, ingest);
  return {
    ingest: ingestData,
    answers,
    diagnostic: evaluateRulesDeterministically(ingestData, answers),
    codeKit: null,
    metadata: { ...DEFAULT_METADATA },
    analyzing: false,
  };
}

/** Resultado de un requisito del modelo común (undefined si el motor no lo ha generado). */
export function requirementResult(diagnostic: DiagnosticResult, id: string): string | undefined {
  return diagnostic.requirements.find((r) => r.id === id)?.resultado;
}

/** Casos de referencia reutilizados por varias baterías. */
export const CASES = {
  altoRiesgoEmpleo: () =>
    makeState(
      'Herramienta de baremación de méritos para oposiciones',
      answeredAnswers({
        annexIIIArea: 'empleo',
        annexIIIUseDescription: 'Puntúa los méritos de los aspirantes de un proceso selectivo',
        performsProfiling: 'si',
        processesPersonalData: 'si',
      })
    ),
  actuacionAutomatizada: () =>
    makeState(
      'Emisión automatizada de certificados de empadronamiento',
      answeredAnswers({
        directHumanIntervention: 'no',
        humanOversightLevel: 'fully_automated',
        processesPersonalData: 'si',
      })
    ),
  asistenteRedaccion: () => makeState('Asistente de redacción de borradores internos', answeredAnswers()),
  excepcionConPersonas: () =>
    makeState(
      'Herramienta de apoyo a la selección de personal',
      answeredAnswers({
        annexIIIArea: 'empleo',
        performsProfiling: 'no',
        processesPersonalData: 'si',
        article63Condition: 'desconocido',
        materialInfluence: 'desconocido',
      })
    ),
};

/** Extrae el texto plano de un DOCX generado por el exportador oficial. */
export async function officialDossierText(
  state: FullAuditState,
  llmCritique?: string,
  traceability?: DocumentTraceability
): Promise<string> {
  return docxText(buildOfficialDossierDocument(state, llmCritique, 'castellano', traceability));
}

/** Extrae el texto plano de cualquier documento DOCX construido con la librería docx. */
export async function docxText(doc: Document): Promise<string> {
  const buffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file('word/document.xml')!.async('string');
  return decodeXml(xml.replace(/<w:tab\/>/g, ' ').replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, ''));
}

function decodeXml(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
