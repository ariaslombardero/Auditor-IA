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

describe('Alojamiento y Art. 50.4 (ALO-01, TRA-01)', () => {
  it('ALO-01 · la pregunta de alojamiento sirve también para aplicaciones sin IA', () => {
    const q = questionById('hostingModel')!;
    expect(q.enunciado).toMatch(/si no usa IA/i);
    expect(q.visible(answeredAnswers({ infersOutputs: 'no' }))).toBe(true);
    expect(q.ayuda?.queSignifica).toMatch(/aplicaci[óo]n/i);
    expect(q.opciones?.find((o) => o.value === 'us_hyperscaler')?.label).not.toMatch(/^En una nube fuera del Espacio Económico Europeo$/);
  });

  it('TRA-01 · las preguntas del Art. 50.4 solo aparecen si el sistema genera contenido y, la segunda, si se publica', () => {
    const publica = questionById('publishesPublicInterestText')!;
    const revision = questionById('editorialReview')!;
    expect(publica.visible(answeredAnswers({ generatesSyntheticContent: 'si' }))).toBe(true);
    expect(publica.visible(answeredAnswers({ generatesSyntheticContent: 'no' }))).toBe(false);
    expect(publica.visible(answeredAnswers({ infersOutputs: 'no' }))).toBe(false);
    expect(revision.visible(answeredAnswers({ publishesPublicInterestText: 'si' }))).toBe(true);
    expect(revision.visible(answeredAnswers({ publishesPublicInterestText: 'no' }))).toBe(false);
  });

  it('TRA-01 · el control editorial cambia la acción del Art. 50, no la clasificación', () => {
    const art50 = (over: Parameters<typeof answeredAnswers>[0]) => {
      const d = makeState('Asistente de notas de prensa', answeredAnswers({ interactsWithPersons: 'no', ...over })).diagnostic!;
      return { clasificacion: d.riskClassification, req: d.requirements.find((r) => r.id === 'RIA-ART-50')! };
    };
    const conControl = art50({ publishesPublicInterestText: 'si', editorialReview: 'si' });
    const sinControl = art50({ publishesPublicInterestText: 'si', editorialReview: 'no' });
    const noPublica = art50({ publishesPublicInterestText: 'no' });
    expect(conControl.clasificacion).toBe('transparency_risk');
    expect(sinControl.clasificacion).toBe('transparency_risk');
    expect(conControl.req.accionRequerida).toMatch(/50\.4/);
    expect(conControl.req.accionRequerida).toMatch(/no es obligatorio divulgar/i);
    expect(sinControl.req.accionRequerida).toMatch(/divulgar que el texto se ha generado/i);
    expect(noPublica.req.accionRequerida).not.toMatch(/50\.4/);
    // Sin interacción con personas, no se exige el aviso de interacción (Art. 50.1)
    expect(conControl.req.accionRequerida).not.toMatch(/aviso de interacción/i);
    expect(conControl.req.accionRequerida).toMatch(/50\.2/);
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
