import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { evaluateRulesDeterministically } from '../auditEngine';
import { computeExecutivePillars, computeExecutiveVerdict } from '../dashboardPillars';
import { DEFAULT_ANSWERS } from '../auditDefaults';
import { CASES, makeIngest, obligationStatus, runCase } from '../../test/fixtures';

/**
 * Pruebas de referencia del motor de clasificación.
 * Expresan el comportamiento CORRECTO esperado; las que fallan en la línea base
 * documentan hallazgos pendientes (ver docs/auditoria/matriz-hallazgos.md).
 */

const SILENT_LOW_RISK = ['transparency_risk', 'minimal_risk', 'not_ai_system'];

describe('Detección del ámbito de alto riesgo (Anexo III)', () => {
  it('MOT-01 · reconoce "baremación… selección de personal" escrito con tildes', () => {
    const r = runCase('Herramienta de baremación de méritos para la selección de personal', {
      evaluatedSubjectType: 'natural_persons_or_applicants',
    });
    expect(SILENT_LOW_RISK).not.toContain(r.riskClassification);
  });

  it('MOT-09 · la evaluación de solicitantes de becas no se cierra en silencio como riesgo limitado o mínimo', () => {
    const r = runCase('Evaluación automatizada de solicitantes de becas universitarias', {
      evaluatedSubjectType: 'natural_persons_or_applicants',
    });
    expect(['transparency_risk', 'minimal_risk']).not.toContain(r.riskClassification);
  });

  it('MOT-17 · un ámbito del Anexo III no cubierto (justicia) no se cierra en silencio como riesgo limitado o mínimo', () => {
    const r = runCase('Apoyo a la valoración de pruebas en procedimientos judiciales', {
      evaluatedSubjectType: 'natural_persons_or_applicants',
    });
    expect(['transparency_risk', 'minimal_risk']).not.toContain(r.riskClassification);
  });

  it('MOT-07 · el perfilado fuera de los ámbitos del Anexo III no basta para declarar alto riesgo', () => {
    const r = runCase('Recomendador de rutas turísticas para visitantes', { performsProfilingOrScoring: true });
    expect(r.riskClassification).not.toBe('high_risk');
  });
});

describe('Prácticas prohibidas (Art. 5 RIA)', () => {
  it('MOT-02 · una negación ("no usamos reconocimiento facial") no se califica como práctica prohibida', () => {
    const r = runCase('Gestor documental de expedientes. No usamos reconocimiento facial.');
    expect(r.riskClassification).not.toBe('prohibited');
  });

  it('MOT-03 · el agents.md de la propia aplicación no se califica como práctica prohibida', () => {
    const agentsMd = readFileSync(resolve(process.cwd(), 'agents.md'), 'utf8');
    const r = runCase('Auditor de IA para el sector público', {}, { agentsMdContent: agentsMd });
    expect(r.riskClassification).not.toBe('prohibited');
  });
});

describe('Exclusión del Art. 3.1 y coherencia interna', () => {
  it('MOT-04 · "excluido del AI Act" no convive con alto riesgo ni con obligaciones de marcado CE', () => {
    const r = evaluateRulesDeterministically(
      makeIngest('Gestión de oposiciones', { isAiSystem: false }),
      { ...DEFAULT_ANSWERS, administrativeNature: 'citizen_assessment', evaluatedSubjectType: 'natural_persons_or_applicants' }
    );
    expect(['not_ai_system', 'requires_review']).toContain(r.riskClassification);
    expect(r.isHighRiskAnnexIII).toBe(false);
    expect(r.obligations.map((o) => o.code)).not.toContain('RIA-ALTO-RIESGO-CE');
  });

  it('MOT-16 · respuestas contradictorias (evalúa ciudadanos y solo procesa documentos despersonalizados) exigen revisión', () => {
    const r = runCase('Asistente de valoración de solicitudes', {
      administrativeNature: 'citizen_assessment',
      evaluatedSubjectType: 'normative_or_unpersonalized_docs',
    });
    expect(r.riskClassification).toBe('requires_review');
  });

  it('MOT-08 · con las respuestas por defecto (entrevista sin contestar) el resultado es "requiere revisión"', () => {
    const r = runCase('Aplicación interna de la Diputación');
    expect(r.riskClassification).toBe('requires_review');
  });
});

describe('Excepción del Art. 6.3 y justificación del Art. 6.4', () => {
  it('MOT-05 · no concede la excepción del Art. 6.3 a un sistema que evalúa personas sin alternativa a)–d) motivada', () => {
    const r = CASES.excepcionConPersonas().diagnostic!;
    expect(r.isArticle63Derogation).not.toBe(true);
  });

  it('MOT-06 · la justificación nunca afirma "documentos despersonalizados" cuando se evalúan personas físicas', () => {
    const r = CASES.excepcionConPersonas().diagnostic!;
    expect(r.article63Justification ?? '').not.toMatch(/despersonalizad/i);
  });

  it('MOT-11 · la obligación del Art. 6.4 no figura como cumplida sin evidencia documental', () => {
    const states = [CASES.excepcionConPersonas(), CASES.asistenteRedaccion(), CASES.altoRiesgoEmpleo()];
    for (const s of states) {
      expect(obligationStatus(s.diagnostic!, 'RIA-ART-6-4')).not.toBe('compliant');
    }
  });
});

describe('Conformidades sin evidencia', () => {
  it('MOT-10 · la Ley 15/2022 (no discriminación) no se marca como cumplida sin evidencias', () => {
    const r = CASES.asistenteRedaccion().diagnostic!;
    expect(obligationStatus(r, 'LEY-15-2022-ART-23')).not.toBe('compliant');
  });

  it('MOT-12 · no emite "Dictamen Favorable AGENTS.md" cuando el propio fichero declara autonomía sin supervisión', () => {
    const r = runCase('Agente de tramitación', {}, { agentsMdContent: 'El agente actua sin intervencion humana.' });
    expect(r.recommendations.join(' ')).not.toMatch(/Dictamen Favorable AGENTS\.md/i);
  });
});

describe('Cuadro de mando y veredicto', () => {
  it('MOT-13 · el pilar de gobernanza no aparece en verde si la actuación es totalmente automatizada', () => {
    const r = runCase('Asistente de tramitación', { humanOversightLevel: 'fully_automated' });
    expect(computeExecutivePillars(r).gobernanza.status).not.toBe('success');
  });

  it('MOT-14 · el pilar RGPD no declara "base legítima acreditada" sin haber preguntado por la base jurídica', () => {
    const r = CASES.asistenteRedaccion().diagnostic!;
    expect(computeExecutivePillars(r).rgpd.text).not.toMatch(/acreditad/i);
  });

  it('MOT-15 · ningún caso obtiene el veredicto "APTO PARA DESPLIEGUE EN PRODUCCIÓN"', () => {
    const diagnostics = [
      CASES.asistenteRedaccion().diagnostic!,
      runCase('Clasificador estadístico de incidencias', { interactionAndGenerationType: 'internal_non_generative' }),
      CASES.altoRiesgoEmpleo().diagnostic!,
    ];
    for (const d of diagnostics) {
      expect(computeExecutiveVerdict(d).label).not.toMatch(/APTO PARA DESPLIEGUE EN PRODUCCI[ÓO]N/i);
    }
  });
});
