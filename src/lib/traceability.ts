import type { FullAuditState } from '../types';
import { calculateSha256 } from './signatureService';

/** Versión del motor de diagnóstico. Se incrementa con cada cambio que altere conclusiones. */
export const ENGINE_VERSION = '2.1.0';

/** Corte normativo de la base de conocimiento (ver docs/auditoria/registro-fuentes.md). */
export const NORMATIVE_SNAPSHOT =
  'Registro de fuentes de 05/10/2026: RIA (Reglamento (UE) 2024/1689) y Reglamento (UE) 2026/1744; Ley 40/2015; Ley 15/2022; RD 729/2023; ENS (RD 311/2022)';

export interface DocumentTraceability {
  engineVersion: string;
  normativeSnapshot: string;
  /** Huella SHA-256 de las entradas (ingesta y entrevista) que produjeron el diagnóstico. */
  inputFingerprint: string;
  generatedAt: string;
}

/**
 * Identifica el documento: versión del motor, corte normativo y huella de las entradas utilizadas.
 */
export async function buildDocumentTraceability(state: FullAuditState): Promise<DocumentTraceability> {
  const inputFingerprint = await calculateSha256(JSON.stringify({ ingest: state.ingest, answers: state.answers }));
  return {
    engineVersion: state.diagnostic?.engineVersion || ENGINE_VERSION,
    normativeSnapshot: NORMATIVE_SNAPSHOT,
    inputFingerprint,
    generatedAt: new Date().toISOString(),
  };
}

/** Texto a mostrar cuando un documento se genera sin haber calculado su trazabilidad. */
export const TRACEABILITY_NOT_COMPUTED = 'no calculada';
