import { describe, expect, it } from 'vitest';
import { recomputeAudit, currentAiComment } from '../auditState';
import { pendingQuestions, INTERVIEW_QUESTIONS, getAnswerValue } from '../interviewCatalog';
import { inputsKey } from '../validations';
import { describirAsistencia } from '../proveedorEfectivo';
import { computeExecutivePillars, computeExecutiveVerdict } from '../dashboardPillars';
import { generateOfficialDossierMarkdown } from '../officialDossierMd';
import { buildDocumentTraceability } from '../traceability';
import { CASES, answeredAnswers, makeAnswers, makeState } from '../../test/fixtures';
import type { FullAuditState } from '../../types';

/**
 * Fase 5.1 · Coherencia entre respuestas, diagnóstico y documentos.
 */

const ALTO_RIESGO = { annexIIIArea: 'empleo', performsProfiling: 'si', processesPersonalData: 'si' } as const;

describe('Diagnóstico al día tras cambiar respuestas (EST-01)', () => {
  it('cambiar una respuesta tras el diagnóstico recalcula la clasificación', () => {
    const antes = CASES.asistenteRedaccion();
    expect(antes.diagnostic!.riskClassification).toBe('transparency_risk');
    const despues = recomputeAudit({ ...antes, answers: { ...antes.answers, ...ALTO_RIESGO } });
    expect(despues.diagnostic!.riskClassification).toBe('high_risk');
    expect(despues.diagnostic!.inputsKey).toBe(inputsKey(despues));
    expect(despues.codeKit).not.toBeNull();
  });

  it('el informe y su huella corresponden a las mismas respuestas', async () => {
    const antes = CASES.asistenteRedaccion();
    const despues = recomputeAudit({ ...antes, answers: { ...antes.answers, ...ALTO_RIESGO } });
    const traza = await buildDocumentTraceability(despues);
    const md = generateOfficialDossierMarkdown(despues, undefined, 'castellano', traza);
    expect(md).toContain('ALTO RIESGO');
    expect(md).toContain(traza.inputFingerprint);
  });

  it('sin diagnóstico previo no se calcula nada', () => {
    const sinDiagnostico: FullAuditState = { ...CASES.asistenteRedaccion(), diagnostic: null, codeKit: null };
    expect(recomputeAudit(sinDiagnostico).diagnostic).toBeNull();
  });
});

describe('Comentario de IA ligado a sus respuestas (EST-04)', () => {
  const conComentario = (): FullAuditState => {
    const s = CASES.asistenteRedaccion();
    const key = inputsKey(s);
    return {
      ...s,
      diagnostic: {
        ...s.diagnostic!,
        aiAssistance: { proveedor: 'Ollama (local)', modelo: 'm', ubicacion: 'local', estado: 'usada', inputsKey: key, dissentAlert: 'Posible alto riesgo' },
        pericialDissentAlert: 'Posible alto riesgo',
      },
    };
  };

  it('si cambian las respuestas, el comentario queda desfasado y su aviso de discrepancia se oculta', () => {
    const s = conComentario();
    const despues = recomputeAudit({ ...s, answers: { ...s.answers, auditLogsEnabled: 'no' } });
    expect(despues.diagnostic!.aiAssistance!.estado).toBe('desfasada');
    expect(despues.diagnostic!.pericialDissentAlert).toBeUndefined();
    expect(describirAsistencia(despues.diagnostic!.aiAssistance)).toMatch(/respuestas anteriores/);
    expect(currentAiComment(despues, 'Texto del comentario')).toBeUndefined();
  });

  it('si se vuelve a las respuestas originales, el comentario vuelve a estar vigente', () => {
    const s = conComentario();
    const cambiado = recomputeAudit({ ...s, answers: { ...s.answers, auditLogsEnabled: 'no' } });
    const restaurado = recomputeAudit({ ...cambiado, answers: s.answers });
    expect(restaurado.diagnostic!.aiAssistance!.estado).toBe('usada');
    expect(restaurado.diagnostic!.pericialDissentAlert).toBe('Posible alto riesgo');
    expect(currentAiComment(restaurado, 'Texto del comentario')).toBe('Texto del comentario');
  });
});

describe('Respuestas pendientes: solo las preguntas visibles (EST-02)', () => {
  const ids = (a: ReturnType<typeof makeAnswers>) => pendingQuestions(a).map((q) => q.id);

  it('una entrevista contestada no tiene pendientes', () => {
    expect(ids(answeredAnswers())).toEqual([]);
  });

  it('no cuenta la influencia sustancial si el sistema no está en un ámbito del Anexo III', () => {
    const a = answeredAnswers({ annexIIIArea: 'ninguno', materialInfluence: 'desconocido', article63Condition: 'desconocido' });
    expect(ids(a)).not.toContain('materialInfluence');
    expect(ids(a)).not.toContain('article63Condition');
  });

  it('no cuenta la base jurídica ni los datos sensibles si no se tratan datos personales', () => {
    const a = answeredAnswers({ processesPersonalData: 'no', legalBasis: 'desconocida', processesSpecialCategoryData: 'desconocido', processesCriminalData: 'desconocido' });
    expect(ids(a)).toEqual([]);
  });

  it('cuenta las dimensiones del ENS sin valorar', () => {
    const a = answeredAnswers({ ensImpact: { C: 'bajo', I: 'desconocido', T: 'bajo', A: 'bajo', D: 'bajo' } });
    expect(ids(a)).toEqual(['ensImpact.I']);
  });

  it('si no es un sistema de IA, no cuenta las preguntas del Reglamento de IA', () => {
    const a = makeAnswers({ infersOutputs: 'no' });
    const pendientes = ids(a);
    expect(pendientes.some((id) => id.startsWith('prohibitedPractices.'))).toBe(false);
    expect(pendientes).not.toContain('annexIIIArea');
    expect(pendientes).toContain('humanOversightLevel');
  });

  it('cada pregunta del catálogo se puede leer sobre una entrevista vacía', () => {
    const vacia = makeAnswers();
    for (const q of INTERVIEW_QUESTIONS) {
      expect(getAnswerValue(vacia, q.id), q.id).toBe(q.valorDesconocido);
    }
  });
});

describe('Respuestas pendientes y requisitos por validar son cosas distintas (EST-03)', () => {
  it('con la entrevista completa no hay respuestas pendientes, aunque queden requisitos por validar', () => {
    const d = CASES.asistenteRedaccion().diagnostic!;
    expect(d.pendingAnswers).toBe(0);
    const verdict = computeExecutiveVerdict(d);
    expect(verdict.label).toMatch(/PENDIENTE DE VALIDACIÓN HUMANA/);
    expect(verdict.detail).toMatch(/por validar/);
    expect(verdict.detail).not.toMatch(/sin acreditar|respuestas? pendientes?/);
    for (const p of Object.values(computeExecutivePillars(d))) {
      expect(p.text).not.toMatch(/sin acreditar/);
    }
  });

  it('con respuestas sin contestar, el veredicto lo dice por separado', () => {
    const d = makeState('Asistente', answeredAnswers({ auditLogsEnabled: 'desconocido' })).diagnostic!;
    expect(d.pendingAnswers).toBe(1);
    expect(computeExecutiveVerdict(d).detail).toMatch(/1 respuesta pendiente/);
  });
});
