import { describe, expect, it } from 'vitest';
import { generateOfficialDossierMarkdown } from '../officialDossierMd';
import { buildAuditManifest } from '../auditManifestGenerator';
import { buildAepdCriteria, buildEipdCriteria, buildEipdDocument, eipdScreening } from '../eipdGenerator';
import { generateCryptographicReceipt } from '../signatureService';
import { CASES, answeredAnswers, docxText, makeAnswers, makeState, officialDossierText } from '../../test/fixtures';
import { computeExecutiveVerdict } from '../dashboardPillars';
import { unaccreditedRequirements } from '../assessmentModel';
import { buildDocumentTraceability, NORMATIVE_SNAPSHOT } from '../traceability';

/**
 * Concordancia entre diagnóstico y documentos exportados (DOCX, Markdown, manifiesto, EIPD).
 * Ningún documento puede afirmar una comprobación que no se ha realizado.
 */

const ALL_CASES = Object.entries(CASES);

describe('Expediente oficial (DOCX)', () => {
  it('DOC-01 · no atribuye la responsabilidad patrimonial "única y exclusivamente" a los funcionarios', async () => {
    const text = await officialDossierText(CASES.asistenteRedaccion());
    expect(text).not.toMatch(/única y exclusivamente a los funcionarios/i);
  });

  it('DOC-02 · no niega la actuación administrativa automatizada cuando se ha declarado', async () => {
    const text = await officialDossierText(CASES.actuacionAutomatizada());
    expect(text).not.toMatch(/NO constituye una "actuaci[óo]n administrativa automatizada"/i);
  });

  it('DOC-03 · no certifica verificación normativa "en tiempo real" sin consulta efectiva registrada', async () => {
    // Afirmación de verificación telemática (no confundir con la práctica del Art. 5.1.h «en tiempo real»)
    const claim = /verificad[oa]s? telem[áa]ticamente|telem[áa]ticamente en tiempo real|cotejo normativo telem[áa]tico/i;
    for (const [, build] of ALL_CASES) {
      const state = build();
      expect(await officialDossierText(state)).not.toMatch(claim);
      expect(generateOfficialDossierMarkdown(state)).not.toMatch(claim);
    }
  });

  it('DOC-04 · no presenta como "CONFORME" prácticas del Art. 5 que el motor no ha examinado', async () => {
    const state = CASES.asistenteRedaccion();
    expect(await officialDossierText(state)).not.toMatch(/CONFORME \(No detectado\)/);
    expect(generateOfficialDossierMarkdown(state)).not.toMatch(/✅ \*\*CONFORME\*\*/);
  });

  it('DOC-08 · el análisis generado por el modelo de lenguaje figura rotulado como no verificado', async () => {
    const text = await officialDossierText(CASES.asistenteRedaccion(), 'Texto sintético producido por el modelo.');
    expect(text).toMatch(/no verificad/i);
  });

  it('DOC-06 · DOCX, Markdown y manifiesto expresan la misma clasificación', async () => {
    for (const [, build] of ALL_CASES) {
      const state = build();
      const label = state.diagnostic!.riskLabel;
      expect(await officialDossierText(state)).toContain(label);
      expect(generateOfficialDossierMarkdown(state)).toContain(label);
      expect(buildAuditManifest(state).governance_and_compliance.ai_act.risk_label).toBe(label);
    }
  });
});

describe('Identificación y concordancia del documento', () => {
  it('DOC-11 · el DOCX y el Markdown identifican versión del motor, corte normativo y huella de las entradas', async () => {
    const state = CASES.asistenteRedaccion();
    const tr = await buildDocumentTraceability(state);
    expect(tr.inputFingerprint).toMatch(/^[0-9a-f]{64}$/);
    const docx = await officialDossierText(state, undefined, tr);
    const md = generateOfficialDossierMarkdown(state, undefined, 'castellano', tr);
    for (const text of [docx, md]) {
      expect(text).toContain(tr.inputFingerprint);
      expect(text).toContain(tr.engineVersion);
      expect(text).toContain(NORMATIVE_SNAPSHOT);
    }
  });

  it('DOC-12 · cuadro de mando, DOCX, Markdown y manifiesto expresan el mismo veredicto y el mismo número de requisitos sin acreditar', async () => {
    for (const [, build] of ALL_CASES) {
      const state = build();
      const verdict = computeExecutiveVerdict(state.diagnostic!);
      const pending = unaccreditedRequirements(state.diagnostic!.requirements).length;
      const manifest = buildAuditManifest(state);
      expect(manifest.governance_and_compliance.summary.verdict).toBe(verdict.label);
      expect(manifest.governance_and_compliance.summary.unaccredited_requirements).toBe(pending);
      const shortLabel = verdict.label.replace('VEREDICTO: ', '');
      expect(await officialDossierText(state)).toContain(shortLabel);
      expect(generateOfficialDossierMarkdown(state)).toContain(shortLabel);
      expect(state.diagnostic!.executiveSummary).toContain(`Quedan ${pending} requisitos sin acreditar`);
    }
  });
});

describe('Manifiesto JSON', () => {
  it('DOC-05 · no contiene estados "FAVORABLE" ni "vigente_consolidado" fijados sin comprobación', () => {
    for (const [, build] of ALL_CASES) {
      const json = JSON.stringify(buildAuditManifest(build()));
      expect(json).not.toContain('"FAVORABLE"');
      expect(json).not.toContain('vigente_consolidado');
    }
  });
});

describe('Diligencia de integridad', () => {
  it('DOC-07 · el identificador interno no se presenta como CSV ni el software "certifica"', async () => {
    const receipt = await generateCryptographicReceipt('expediente.docx', 'contenido sintético', 'Entidad', 'Responsable');
    // Puede aclarar que no es un CSV, pero no rotular el identificador como tal
    expect(receipt.diligenceText).not.toMatch(/C[ÓO]DIGO SEGURO DE VERIFICACI[ÓO]N \(CSV\):/i);
    expect(receipt.diligenceText).not.toMatch(/se certifica/i);
  });
});

describe('EIPD (criterios WP248)', () => {
  it('EIPD-01 · el criterio de tecnología innovadora no se activa para software sin IA', () => {
    const state = makeState('Calculadora de plazos administrativos', answeredAnswers({ infersOutputs: 'no' }), { isAiSystem: false });
    const c8 = buildEipdCriteria(state).find((c) => c.id === 'C8')!;
    expect(c8.applies).toBe(false);
    const ai = buildEipdCriteria(CASES.asistenteRedaccion()).find((c) => c.id === 'C8')!;
    expect(ai.applies).toBe(true);
    expect(ai.justification).toMatch(/innovador|nueva tecnolog/i);
  });

  it('EIPD-04 · el borrador de EIPD no redacta el dictamen del DPD ni se presenta como metodología oficial', async () => {
    for (const [, build] of ALL_CASES) {
      const text = await docxText(buildEipdDocument(build()));
      expect(text).not.toMatch(/emite dictamen/i);
      expect(text).not.toMatch(/FAVORABLE (PARA|CONDICIONADO)/);
      expect(text).not.toMatch(/Metodolog[íi]a Oficial/i);
      expect(text).not.toMatch(/preceptiva por ley/i);
      expect(text).toMatch(/A CUMPLIMENTAR POR EL DPD/);
    }
  });

  it('EIPD-03 · WP248 (9) y lista AEPD (11) con numeración propia; criterios sin contestar quedan "desconocido"; riesgo residual pendiente', async () => {
    const unanswered = makeState('Sistema', makeAnswers({ infersOutputs: 'si' }));
    expect(buildEipdCriteria(unanswered)).toHaveLength(9);
    expect(buildAepdCriteria(unanswered).map((c) => c.id)).toEqual(Array.from({ length: 11 }, (_, i) => `AEPD-${i + 1}`));
    expect(buildEipdCriteria(unanswered).find((c) => c.id === 'C3')!.estado).toBe('desconocido');
    expect(buildEipdCriteria(unanswered).find((c) => c.id === 'C6')!.estado).toBe('desconocido');
    const text = await docxText(buildEipdDocument(CASES.altoRiesgoEmpleo()));
    expect(text).toMatch(/LISTA DE LA AEPD/);
    expect(text).toMatch(/RIESGO RESIDUAL/);
    expect(text).toMatch(/pendiente de valoraci[óo]n/i);
  });

  it('EIPD-05 · el cribado de necesidad distingue "necesaria", "no indicada" y "por determinar"', () => {
    expect(eipdScreening(CASES.altoRiesgoEmpleo())).toBe('necesaria');
    expect(eipdScreening(CASES.asistenteRedaccion())).toBe('no_indicada');
    expect(eipdScreening(makeState('Sistema', makeAnswers({ infersOutputs: 'si' })))).toBe('por_determinar');
  });

  it('EIPD-02 · el criterio 9 de WP248 es el impedimento al ejercicio de derechos, no las transferencias internacionales', () => {
    const state = makeState('Asistente de redacción', answeredAnswers({ hostingModel: 'us_hyperscaler' }));
    const c9 = buildEipdCriteria(state).find((c) => c.id === 'C9')!;
    expect(c9.title).not.toMatch(/transferencias/i);
  });
});
