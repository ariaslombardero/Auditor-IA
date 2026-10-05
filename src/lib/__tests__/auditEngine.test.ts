import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { evaluateRulesDeterministically } from '../auditEngine';
import { computeExecutivePillars, computeExecutiveVerdict } from '../dashboardPillars';
import { annexIIIHints, prohibitedPracticeHints } from '../documentHints';
import { detectAiSignals } from '../githubIngestion';
import { NORMATIVE_SNAPSHOT } from '../traceability';
import { effectiveDiagnostic, inputsKey } from '../validations';
import { PROHIBITED_SYSTEMS_CATALOG } from '../legalKnowledgeBase';
import { CASES, answeredAnswers, makeAnswers, makeIngest, makeState, requirementResult, runCase } from '../../test/fixtures';

/**
 * Pruebas del motor de clasificación (entrevista v2: «sí / no / desconocido»).
 * Expresan el comportamiento CORRECTO esperado (ver docs/auditoria/matriz-hallazgos.md).
 */

const ids = (d: ReturnType<typeof runCase>) => d.requirements.map((r) => r.id);

describe('Indicios documentales (solo sugieren, nunca deciden)', () => {
  it('MOT-01 · reconoce "baremación… selección de personal" escrito con tildes como indicio del Anexo III (empleo)', () => {
    const hints = annexIIIHints(makeIngest('Herramienta de baremación de méritos para la selección de personal'));
    expect(hints.map((h) => h.target)).toContain('annexIII:empleo');
    // Con la entrevista sin contestar, el resultado no se cierra en silencio
    const r = runCase('Herramienta de baremación de méritos para la selección de personal', makeAnswers());
    expect(r.riskClassification).toBe('requires_review');
  });

  it('MOT-02 · una negación ("no usamos reconocimiento facial") no genera indicio ni prohibición', () => {
    const ingest = makeIngest('Gestor documental de expedientes. No usamos reconocimiento facial en tiempo real.');
    expect(prohibitedPracticeHints(ingest)).toHaveLength(0);
    const r = evaluateRulesDeterministically(ingest, answeredAnswers());
    expect(r.riskClassification).not.toBe('prohibited');
  });

  it('MOT-03 · el agents.md de la propia aplicación no se califica como práctica prohibida', () => {
    const agentsMd = readFileSync(resolve(process.cwd(), 'agents.md'), 'utf8');
    const r = runCase('Auditor de IA para el sector público', answeredAnswers(), { agentsMdContent: agentsMd });
    expect(r.riskClassification).not.toBe('prohibited');
  });

  it('MOT-09 · la evaluación de solicitantes de becas con ámbito sin determinar exige revisión', () => {
    const r = runCase('Evaluación automatizada de solicitantes de becas universitarias', answeredAnswers({ annexIIIArea: 'desconocido' }));
    expect(r.riskClassification).toBe('requires_review');
  });
});

describe('Prácticas prohibidas (Art. 5 RIA)', () => {
  it('MOT-25 · una práctica declarada es prohibida e incumple; una sin contestar exige revisión', () => {
    const declared = runCase('Sistema', answeredAnswers({
      prohibitedPractices: { ...answeredAnswers().prohibitedPractices, social_scoring: 'si' },
    }));
    expect(declared.riskClassification).toBe('prohibited');
    expect(requirementResult(declared, 'RIA-ART-5-social_scoring')).toBe('incumple');

    const unknown = runCase('Sistema', answeredAnswers({
      prohibitedPractices: { ...answeredAnswers().prohibitedPractices, social_scoring: 'desconocido' },
    }));
    expect(unknown.riskClassification).toBe('requires_review');
    expect(requirementResult(unknown, 'RIA-ART-5-social_scoring')).toBe('pendiente');
  });
});

describe('Exclusión del Art. 3.1 y coherencia interna', () => {
  it('MOT-04 · "excluido del RIA" no convive con alto riesgo ni con obligaciones de marcado CE', () => {
    const r = runCase('Gestión de oposiciones', answeredAnswers({ infersOutputs: 'no', annexIIIArea: 'empleo', performsProfiling: 'si' }));
    expect(['not_ai_system', 'requires_review']).toContain(r.riskClassification);
    expect(r.isHighRiskAnnexIII).toBe(false);
    expect(ids(r)).not.toContain('RIA-ALTO-RIESGO-CE');
  });

  it('MOT-08 · con la entrevista sin contestar el resultado es "requiere revisión"', () => {
    expect(runCase('Aplicación interna de la Diputación', makeAnswers()).riskClassification).toBe('requires_review');
  });

  it('MOT-16 · respuestas contradictorias exigen revisión', () => {
    const a = runCase('Sistema', answeredAnswers({ performsProfiling: 'si', processesPersonalData: 'no', annexIIIArea: 'empleo' }));
    expect(a.riskClassification).toBe('requires_review');
    const b = runCase('Sistema', answeredAnswers({ directHumanIntervention: 'si', humanOversightLevel: 'fully_automated' }));
    expect(b.riskClassification).toBe('requires_review');
    expect(b.reviewReasons.length).toBeGreaterThan(0);
  });

  it('MOT-22 · si no consta si el sistema infiere (Art. 3.1), exige revisión; un AGENTS.md no es indicio de IA', () => {
    const r = runCase('Sistema', answeredAnswers({ infersOutputs: 'desconocido' }), { isAiSystem: undefined });
    expect(r.riskClassification).toBe('requires_review');
    expect(detectAiSignals({ detectedAiSdk: [], agentsMdContent: '# Instrucciones para agentes de código', readmeContent: 'Calculadora de plazos' })).toBe(false);
    expect(detectAiSignals({ detectedAiSdk: ['OpenAI SDK'], agentsMdContent: '', readmeContent: '' })).toBe(true);
  });
});

describe('Ámbito del Anexo III y excepción del Art. 6.3', () => {
  it('MOT-05 · sin condición a)–d) motivada no se concede la excepción y se exige revisión', () => {
    const r = CASES.excepcionConPersonas().diagnostic!;
    expect(r.isArticle63Derogation).not.toBe(true);
    expect(r.riskClassification).toBe('requires_review');
  });

  it('MOT-05b · la excepción se concede con una condición (disyuntiva), hechos y sin influencia sustancial', () => {
    const r = runCase('Apoyo al tribunal', answeredAnswers({
      annexIIIArea: 'empleo',
      performsProfiling: 'no',
      processesPersonalData: 'si',
      article63Condition: 'd',
      article63Facts: 'Prepara un índice de la documentación aportada por cada aspirante para el tribunal',
      materialInfluence: 'no',
    }));
    expect(r.isArticle63Derogation).toBe(true);
    expect(r.article63Justification).toMatch(/letra d\)/);
    expect(['transparency_risk', 'minimal_risk']).toContain(r.riskClassification);
  });

  it('MOT-06 · la justificación se construye con los hechos declarados, no con un texto fijo', () => {
    const facts = 'Prepara un índice de la documentación aportada por cada aspirante para el tribunal';
    const r = runCase('Apoyo al tribunal', answeredAnswers({
      annexIIIArea: 'empleo', performsProfiling: 'no', processesPersonalData: 'si',
      article63Condition: 'd', article63Facts: facts, materialInfluence: 'no',
    }));
    expect(r.article63Justification).toContain(facts);
    expect(r.article63Justification).not.toMatch(/despersonalizad/i);
  });

  it('MOT-07 · el perfilado fuera de los ámbitos del Anexo III no basta para declarar alto riesgo', () => {
    const r = runCase('Recomendador de rutas turísticas', answeredAnswers({ performsProfiling: 'si', processesPersonalData: 'si', annexIIIArea: 'ninguno' }));
    expect(r.riskClassification).not.toBe('high_risk');
  });

  it('MOT-17 · un ámbito del Anexo III distinto de empleo y prestaciones (justicia) se clasifica como alto riesgo', () => {
    const r = runCase('Apoyo a la valoración de pruebas en procedimientos judiciales', answeredAnswers({
      annexIIIArea: 'justicia_democracia', performsProfiling: 'no', article63Condition: 'ninguna', processesPersonalData: 'si',
    }));
    expect(r.riskClassification).toBe('high_risk');
  });

  it('MOT-26 · en el punto 5 solo las prestaciones esenciales de asistencia pública a personas físicas entran en el 5.a)', () => {
    const no = runCase('Subvenciones a ayuntamientos', answeredAnswers({ annexIIIArea: 'servicios_esenciales', essentialPublicAssistance: 'no' }));
    expect(no.isHighRiskAnnexIII).toBe(false);
    const unknown = runCase('Ayudas', answeredAnswers({ annexIIIArea: 'servicios_esenciales', essentialPublicAssistance: 'desconocido' }));
    expect(unknown.riskClassification).toBe('requires_review');
  });
});

describe('Papel de la entidad y calendario', () => {
  const highRisk = (role: 'proveedor' | 'responsable_despliegue' | 'ambos' | 'desconocido', area: 'empleo' | 'infraestructuras_criticas' = 'empleo') =>
    runCase('Sistema de alto riesgo', answeredAnswers({
      annexIIIArea: area, performsProfiling: 'si', processesPersonalData: 'si', institutionalRole: role,
    }));

  it('MOT-18 · las obligaciones dependen del papel: proveedor (Anexo VI) o responsable del despliegue (Arts. 26, 27 y 49.3)', () => {
    expect(ids(highRisk('responsable_despliegue'))).toEqual(expect.arrayContaining(['RIA-ART-26', 'RIA-ART-27', 'RIA-ART-49-3']));
    expect(ids(highRisk('responsable_despliegue'))).not.toContain('RIA-ALTO-RIESGO-CE');
    expect(ids(highRisk('proveedor'))).toContain('RIA-ALTO-RIESGO-CE');
    expect(ids(highRisk('proveedor'))).not.toContain('RIA-ART-27');
    expect(ids(highRisk('ambos'))).toEqual(expect.arrayContaining(['RIA-ALTO-RIESGO-CE', 'RIA-ART-26', 'RIA-ART-27']));
    expect(ids(highRisk('responsable_despliegue', 'infraestructuras_criticas'))).not.toContain('RIA-ART-27');
    expect(requirementResult(highRisk('desconocido'), 'RIA-PAPEL')).toBe('pendiente');
  });

  it('MOT-19 · la clasificación no depende de la fecha; la exigibilidad sí', () => {
    const answers = answeredAnswers({ annexIIIArea: 'empleo', performsProfiling: 'si', processesPersonalData: 'si', institutionalRole: 'proveedor' });
    const before = evaluateRulesDeterministically(makeIngest('Sistema'), answers, { today: '2026-10-05' });
    const after = evaluateRulesDeterministically(makeIngest('Sistema'), answers, { today: '2028-01-10' });
    expect(before.riskClassification).toBe(after.riskClassification);
    const req = (d: typeof before) => d.requirements.find((r) => r.id === 'RIA-ALTO-RIESGO-CE')!;
    expect(req(before).exigibleDesde).toBe('2027-12-02');
    expect(req(before).hechos).toMatch(/Aún no exigible/);
    expect(req(after).hechos).toMatch(/Exigible desde/);
    expect(before.requirements.find((r) => r.id === 'RIA-ART-50')!.exigibleDesde).toBe('2026-08-02');
    expect(before.requirements.find((r) => r.id === 'RIA-ART-5-intimate_imagery_generation')!.exigibleDesde).toBe('2026-12-02');
  });
});

describe('ENS (Anexo I): categoría por dimensiones', () => {
  it('MOT-20 · la categoría es la del nivel más alto; si falta alguna dimensión es orientativa y queda pendiente', () => {
    const alta = runCase('S', answeredAnswers({ ensImpact: { C: 'alto', I: 'bajo', T: 'bajo', A: 'bajo', D: 'bajo' } }));
    expect(alta.ensCategory).toBe('ALTA');
    expect(alta.ensCategoryIsOrientative).toBe(false);
    expect(runCase('S', answeredAnswers({ ensImpact: { C: 'medio', I: 'bajo', T: 'no_afectada', A: 'bajo', D: 'bajo' } })).ensCategory).toBe('MEDIA');
    expect(runCase('S', answeredAnswers()).ensCategory).toBe('BASICA');
    const partial = runCase('S', answeredAnswers({ ensImpact: { C: 'desconocido', I: 'bajo', T: 'bajo', A: 'bajo', D: 'bajo' } }));
    expect(partial.ensCategoryIsOrientative).toBe(true);
    expect(requirementResult(partial, 'ENS-CATEGORIZACION')).toBe('pendiente');
  });
});

describe('Actuación administrativa automatizada (Art. 41 Ley 40/2015)', () => {
  it('MOT-21 · el deslinde se basa en el funcionamiento real descrito, y si no consta queda pendiente', () => {
    const unknown = runCase('S', answeredAnswers({ directHumanIntervention: 'desconocido', procedureDescription: '' }));
    expect(requirementResult(unknown, 'LEY-40-2015-ART-41')).toBe('pendiente');
    const declared = runCase('S', answeredAnswers());
    const req = declared.requirements.find((r) => r.id === 'LEY-40-2015-ART-41')!;
    expect(req.resultado).toBe('declarado');
    expect(req.hechos).toContain('revisa y corrige cada borrador');
    expect(CASES.actuacionAutomatizada().diagnostic!.isAutomatedAdministrativeAct).toBe(true);
  });
});

describe('Trazabilidad de la clasificación', () => {
  it('MOT-23 · cada clasificación muestra hechos, regla, fuente y versión normativa', () => {
    for (const build of Object.values(CASES)) {
      const d = build().diagnostic!;
      expect(d.normativeVersion).toBe(NORMATIVE_SNAPSHOT);
      expect(d.classificationTrace.length).toBeGreaterThan(0);
      for (const step of d.classificationTrace) {
        expect(step.regla.length).toBeGreaterThan(0);
        expect(step.fuente.length).toBeGreaterThan(0);
        expect(step.respuesta.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('Conformidades sin evidencia y validación humana', () => {
  it('MOT-10 · la Ley 15/2022 (no discriminación) no se marca como acreditada sin evidencias', () => {
    expect(requirementResult(CASES.asistenteRedaccion().diagnostic!, 'LEY-15-2022-ART-23')).not.toBe('acreditado');
  });

  it('MOT-11 · la obligación del Art. 6.4 no figura como acreditada sin evidencia documental', () => {
    const r = runCase('Apoyo al tribunal', answeredAnswers({
      annexIIIArea: 'empleo', performsProfiling: 'no', processesPersonalData: 'si', institutionalRole: 'proveedor',
      article63Condition: 'a', article63Facts: 'Comprueba que la solicitud incluye los documentos exigidos', materialInfluence: 'no',
    }));
    expect(requirementResult(r, 'RIA-ART-6-4')).toBe('pendiente');
  });

  it('MOT-12 · no emite dictámenes favorables automáticos sobre el AGENTS.md', () => {
    const r = runCase('Agente', answeredAnswers(), { agentsMdContent: 'El agente actua sin intervencion humana.' });
    expect(r.recommendations.join(' ')).not.toMatch(/Dictamen Favorable/i);
  });

  it('MOT-24 · una validación humana acredita el requisito; si cambian las entradas, deja de valer', () => {
    const state = CASES.asistenteRedaccion();
    const key = inputsKey(state);
    const validated = {
      ...state,
      validations: { 'LEY-15-2022-ART-23': { revisadoPor: 'DPD', evidencia: 'Informe de sesgos 3/2026', fecha: '2026-10-05', inputsKey: key } },
    };
    const eff = effectiveDiagnostic(validated)!;
    const req = eff.requirements.find((r) => r.id === 'LEY-15-2022-ART-23')!;
    expect(req.resultado).toBe('acreditado');
    expect(req.origen).toBe('validacion_humana');
    expect(req.evidencia).toBe('Informe de sesgos 3/2026');

    const changed = { ...validated, answers: { ...validated.answers, supervisionRole: 'Otra persona' } };
    expect(effectiveDiagnostic(changed)!.requirements.find((r) => r.id === 'LEY-15-2022-ART-23')!.resultado).not.toBe('acreditado');
  });

  it('MOT-24b · con todos los requisitos acreditados el veredicto lo indica, sin declarar aptitud para producción', () => {
    const state = CASES.asistenteRedaccion();
    const key = inputsKey(state);
    const validations = Object.fromEntries(
      state.diagnostic!.requirements.map((r) => [r.id, { revisadoPor: 'Comisión', evidencia: 'Acta 1/2026', fecha: '2026-10-05', inputsKey: key }])
    );
    const verdict = computeExecutiveVerdict(effectiveDiagnostic({ ...state, validations })!);
    expect(verdict.level).toBe('clear');
    expect(verdict.label).not.toMatch(/PRODUCCI[ÓO]N/i);
  });
});

describe('Cuadro de mando y veredicto', () => {
  it('MOT-13 · el pilar de gobernanza no aparece en verde si la actuación es totalmente automatizada', () => {
    expect(computeExecutivePillars(CASES.actuacionAutomatizada().diagnostic!).gobernanza.status).not.toBe('success');
  });

  it('MOT-14 · el pilar RGPD no declara la base jurídica acreditada si no consta', () => {
    const r = runCase('S', answeredAnswers({ legalBasis: 'desconocida', processesPersonalData: 'si' }));
    expect(computeExecutivePillars(r).rgpd.text).not.toMatch(/acreditad/i);
    expect(requirementResult(r, 'RGPD-BASE-JURIDICA')).toBe('pendiente');
  });

  it('MOT-15 · ningún caso obtiene el veredicto "APTO PARA DESPLIEGUE EN PRODUCCIÓN"', () => {
    for (const build of Object.values(CASES)) {
      expect(computeExecutiveVerdict(build().diagnostic!).label).not.toMatch(/APTO PARA DESPLIEGUE EN PRODUCCI[ÓO]N/i);
    }
  });
});

it('Catálogo del Art. 5 cubierto en la entrevista', () => {
  expect(Object.keys(answeredAnswers().prohibitedPractices)).toHaveLength(PROHIBITED_SYSTEMS_CATALOG.length);
  expect(makeState('S', makeAnswers()).diagnostic!.riskClassification).toBe('requires_review');
});
