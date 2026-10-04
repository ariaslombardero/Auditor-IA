import JSZip from 'jszip';
import { Packer, type Document } from 'docx';
import type { AppIngestData, DiagnosticResult, FullAuditState, LegalEnrichmentAnswers } from '../types';
import { DEFAULT_ANSWERS, DEFAULT_INGEST, DEFAULT_METADATA } from '../lib/auditDefaults';
import { evaluateRulesDeterministically } from '../lib/auditEngine';
import { buildOfficialDossierDocument } from '../lib/officialDossierDocx';
import type { DocumentTraceability } from '../lib/traceability';

/**
 * Casos sintéticos de prueba. Ningún dato real ni credencial.
 * Cuando la entrevista cambie de modelo (Fase 2) solo hay que adaptar estos ayudantes.
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

export function makeAnswers(overrides: Partial<LegalEnrichmentAnswers> = {}): LegalEnrichmentAnswers {
  return { ...DEFAULT_ANSWERS, ...overrides };
}

export function runCase(
  appDescription: string,
  answers: Partial<LegalEnrichmentAnswers> = {},
  ingest: Partial<AppIngestData> = {}
): DiagnosticResult {
  return evaluateRulesDeterministically(makeIngest(appDescription, ingest), makeAnswers(answers));
}

export function makeState(
  appDescription: string,
  answers: Partial<LegalEnrichmentAnswers> = {},
  ingest: Partial<AppIngestData> = {}
): FullAuditState {
  const ingestData = makeIngest(appDescription, ingest);
  const answerData = makeAnswers(answers);
  return {
    ingest: ingestData,
    answers: answerData,
    diagnostic: evaluateRulesDeterministically(ingestData, answerData),
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
    makeState('Herramienta de baremacion de meritos para oposiciones', {
      administrativeNature: 'citizen_assessment',
      evaluatedSubjectType: 'natural_persons_or_applicants',
    }),
  actuacionAutomatizada: () =>
    makeState('Emisión automatizada de certificados de empadronamiento', {
      administrativeNature: 'automated_administrative_act',
      humanOversightLevel: 'fully_automated',
    }),
  asistenteRedaccion: () => makeState('Asistente de redacción de borradores internos'),
  excepcionConPersonas: () =>
    makeState('Herramienta de baremacion de meritos para la seleccion de personal', {
      evaluatedSubjectType: 'natural_persons_or_applicants',
    }),
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
