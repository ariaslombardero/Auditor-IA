import type { AiAssistanceRecord, FullAuditState } from '../types';
import { evaluateRulesDeterministically } from './engine';
import { generateCodeKit } from './codeKitGenerator';
import { inputsKey } from './validations';

/**
 * Coherencia entre las entradas (ingesta y entrevista) y el diagnóstico.
 * Una vez emitido el primer diagnóstico, cualquier cambio en las entradas lo recalcula
 * con el motor determinista: el panel, el informe y su huella se refieren siempre
 * a las mismas respuestas.
 */

/** Estado del comentario de IA según si se generó con las entradas actuales. */
function aiAssistanceFor(previous: AiAssistanceRecord | undefined, currentKey: string): AiAssistanceRecord | undefined {
  if (!previous) return undefined;
  if (previous.estado !== 'usada' && previous.estado !== 'desfasada') return previous;
  const vigente = previous.inputsKey === currentKey;
  return {
    ...previous,
    estado: vigente ? 'usada' : 'desfasada',
    motivo: vigente ? undefined : 'El comentario se generó con respuestas anteriores y no se incluye en el informe. Actualice el diagnóstico para regenerarlo.',
  };
}

/**
 * Recalcula el diagnóstico y el kit de código con las entradas actuales.
 * Conserva el registro de asistencia de IA, marcándolo como desfasado si las entradas cambiaron.
 */
export function recomputeAudit(state: FullAuditState): FullAuditState {
  if (!state.diagnostic) return state;
  const key = inputsKey(state);
  const fresh = evaluateRulesDeterministically(state.ingest, state.answers);
  const aiAssistance = aiAssistanceFor(state.diagnostic.aiAssistance, key);
  const diagnostic = {
    ...fresh,
    inputsKey: key,
    ...(aiAssistance ? { aiAssistance } : {}),
    ...(aiAssistance?.estado === 'usada' && aiAssistance.dissentAlert ? { pericialDissentAlert: aiAssistance.dissentAlert } : {}),
  };
  return { ...state, diagnostic, codeKit: generateCodeKit(state.ingest, state.answers, diagnostic) };
}

/** Comentario de IA solo si corresponde a las entradas actuales; si no, no debe mostrarse ni exportarse. */
export function currentAiComment(state: FullAuditState, comment: string | undefined): string | undefined {
  return state.diagnostic?.aiAssistance?.estado === 'usada' ? comment : undefined;
}
