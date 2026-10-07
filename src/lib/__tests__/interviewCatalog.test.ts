import { describe, expect, it } from 'vitest';
import { INTERVIEW_QUESTIONS, pendingByPriority, pendingQuestions, setAnswerValue, getAnswerValue, questionById } from '../interviewCatalog';
import { createDefaultAnswers } from '../answersModel';
import { recomputeAudit } from '../auditState';
import { CASES, makeState, answeredAnswers } from '../../test/fixtures';

/**
 * Fase 5.2 · Catálogo de preguntas y ayuda en lenguaje sencillo.
 */

const CAMPOS_DE_TEXTO_OPCIONALES = [
  'schemaVersion',
  'annexIIIUseDescription',
  'supervisionRole',
  'procedureDescription',
  'publicCompetenceNorm',
  'ratActivityName',
  'logRetentionMonths',
];

describe('Catálogo de preguntas (UX-02)', () => {
  it('todas las respuestas que usa el motor tienen su pregunta en el catálogo', () => {
    const vacia = createDefaultAnswers();
    const esperadas: string[] = [];
    for (const [campo, valor] of Object.entries(vacia)) {
      if (CAMPOS_DE_TEXTO_OPCIONALES.includes(campo)) continue;
      if (valor && typeof valor === 'object') {
        esperadas.push(...Object.keys(valor).map((sub) => `${campo}.${sub}`));
      } else {
        esperadas.push(campo);
      }
    }
    const ids = INTERVIEW_QUESTIONS.map((q) => q.id);
    for (const id of esperadas) expect(ids, id).toContain(id);
  });

  it('cada pregunta explica qué significa, con al menos un ejemplo y su norma', () => {
    for (const q of INTERVIEW_QUESTIONS) {
      expect(q.ayuda?.queSignifica, q.id).toBeTruthy();
      expect(Boolean(q.ayuda?.ejemploSi || q.ayuda?.ejemploNo), q.id).toBe(true);
      expect(q.ayuda?.norma, q.id).toBeTruthy();
    }
  });

  it('las preguntas de sí/no tienen ejemplo de «sí» y de «no»', () => {
    for (const q of INTERVIEW_QUESTIONS.filter((x) => x.tipo === 'tri')) {
      expect(q.ayuda?.ejemploSi, q.id).toBeTruthy();
      expect(q.ayuda?.ejemploNo, q.id).toBeTruthy();
    }
  });

  it('las decisiones de la entidad se marcan como orientación, no como respuesta documental', () => {
    for (const id of ['institutionalRole', 'legalBasis', 'ensImpact.C', 'article63Facts']) {
      expect(questionById(id)?.sugerible, id).toBe('orientacion');
    }
  });
});

describe('Contestar lo pendiente desde el diagnóstico (UX-01)', () => {
  it('contestar una pregunta pendiente la quita de la lista y actualiza la clasificación', () => {
    const s = makeState('Asistente', answeredAnswers({ annexIIIArea: 'desconocido' }));
    expect(s.diagnostic!.riskClassification).toBe('requires_review');
    expect(pendingQuestions(s.answers).map((q) => q.id)).toEqual(['annexIIIArea']);
    const despues = recomputeAudit({ ...s, answers: setAnswerValue(s.answers, 'annexIIIArea', 'ninguno') });
    expect(pendingQuestions(despues.answers)).toHaveLength(0);
    expect(despues.diagnostic!.riskClassification).toBe('transparency_risk');
    expect(despues.diagnostic!.pendingAnswers).toBe(0);
  });

  it('setAnswerValue admite rutas anidadas sin alterar el resto', () => {
    const a = CASES.asistenteRedaccion().answers;
    const b = setAnswerValue(a, 'prohibitedPractices.social_scoring', 'desconocido');
    expect(getAnswerValue(b, 'prohibitedPractices.social_scoring')).toBe('desconocido');
    expect(getAnswerValue(b, 'prohibitedPractices.subliminal_manipulation')).toBe('no');
    expect(getAnswerValue(a, 'prohibitedPractices.social_scoring')).toBe('no');
  });

  it('las que impiden concluir la clasificación van primero', () => {
    const lista = pendingByPriority(answeredAnswers({ auditLogsEnabled: 'desconocido', annexIIIArea: 'desconocido', performsProfiling: 'desconocido' }));
    expect(lista.map((q) => q.id)).toEqual(['annexIIIArea', 'performsProfiling', 'auditLogsEnabled']);
  });
});
