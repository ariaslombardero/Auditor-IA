import type { FullAuditState } from '../types';
import { getAnswerValue, INTERVIEW_QUESTIONS } from './interviewCatalog';

/**
 * Origen de las respuestas de la entrevista, para los documentos: qué respuestas proceden
 * de una sugerencia aceptada (de la IA o de un indicio automático) y con qué respaldo.
 * Las respuestas sin registro las introdujo la persona usuaria.
 */

export interface ProvenanceRow {
  pregunta: string;
  respuesta: string;
  origen: string;
  respaldo: string;
}

function etiquetaValor(id: string, valor: string): string {
  const q = INTERVIEW_QUESTIONS.find((x) => x.id === id);
  if (q?.tipo === 'tri') return valor === 'si' ? 'Sí' : valor === 'no' ? 'No' : 'No lo sé';
  return q?.opciones?.find((o) => o.value === valor)?.label ?? valor;
}

export function answerProvenanceRows(state: FullAuditState): ProvenanceRow[] {
  return INTERVIEW_QUESTIONS.filter((q) => state.answerSources?.[q.id]).map((q) => {
    const s = state.answerSources![q.id];
    return {
      pregunta: q.enunciado,
      respuesta: etiquetaValor(q.id, getAnswerValue(state.answers, q.id)),
      origen: s.origen === 'ia' ? `Sugerencia de IA aceptada (${s.modelo ?? 'modelo no indicado'})` : 'Indicio automático aceptado',
      respaldo: s.tipo === 'con_cita' ? `Cita comprobada en la documentación: «${s.cita}»` : `Inferida, sin respaldo literal${s.cita ? ` (fragmento: «${s.cita}»)` : ''}`,
    };
  });
}

export const PROVENANCE_NOTE =
  'Las respuestas que no figuran aquí las introdujo la persona usuaria. Aceptar una sugerencia no acredita nada: la respuesta sigue siendo una declaración del promotor.';
