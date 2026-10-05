import type { DiagnosticResult, FullAuditState, HumanValidation } from '../types';
import { normalizeDiagnostic } from './assessmentModel';

/**
 * Validación humana documentada de los requisitos. Es el único camino para que un requisito
 * figure como «acreditado». Cada validación queda ligada a las entradas (ingesta y entrevista)
 * vigentes al validarla: si cambian, la validación deja de aplicarse y debe revisarse.
 */

/** Huella estable (FNV-1a de 32 bits) de las entradas que producen el diagnóstico. */
export function inputsKey(state: Pick<FullAuditState, 'ingest' | 'answers'>): string {
  const text = JSON.stringify({ ingest: state.ingest, answers: state.answers });
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Aplica las validaciones vigentes al diagnóstico, sin modificar el original. */
export function applyValidations(
  diagnostic: DiagnosticResult,
  validations: Record<string, HumanValidation> | undefined,
  currentKey: string
): DiagnosticResult {
  if (!validations || Object.keys(validations).length === 0) return diagnostic;
  return {
    ...diagnostic,
    requirements: diagnostic.requirements.map((r) => {
      const v = validations[r.id];
      if (!v) return r;
      if (v.inputsKey !== currentKey) {
        return {
          ...r,
          hechos: `${r.hechos} Validación anterior de ${v.revisadoPor} (${new Date(v.fecha).toLocaleDateString('es-ES')}) sin efecto: las respuestas o la documentación han cambiado desde entonces y debe revisarse.`,
        };
      }
      return {
        ...r,
        resultado: 'acreditado',
        origen: 'validacion_humana',
        revisadoPor: v.revisadoPor,
        evidencia: v.evidencia,
        hechos: `${r.hechos} Acreditado por ${v.revisadoPor} el ${new Date(v.fecha).toLocaleDateString('es-ES')} con la evidencia: ${v.evidencia}.`,
      };
    }),
  };
}

/** Diagnóstico que deben mostrar el cuadro de mando y los exportadores: normalizado y con validaciones vigentes. */
export function effectiveDiagnostic(state: Pick<FullAuditState, 'ingest' | 'answers' | 'diagnostic' | 'validations'>): DiagnosticResult | null {
  const normalized = normalizeDiagnostic(state.diagnostic);
  if (!normalized) return null;
  return applyValidations(normalized, state.validations, inputsKey(state));
}

/** Validaciones que ya no se aplican porque las entradas han cambiado. */
export function staleValidations(state: Pick<FullAuditState, 'ingest' | 'answers' | 'validations'>): string[] {
  const key = inputsKey(state);
  return Object.entries(state.validations || {})
    .filter(([, v]) => v.inputsKey !== key)
    .map(([id]) => id);
}
