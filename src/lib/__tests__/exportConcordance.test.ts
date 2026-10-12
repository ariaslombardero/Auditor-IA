import { describe, expect, it } from 'vitest';
import { generateOfficialDossierMarkdown } from '../officialDossierMd';
import { buildAuditManifest } from '../auditManifestGenerator';
import { buildAepdCriteria, buildEipdCriteria, buildEipdDocument, eipdScreening } from '../eipdGenerator';
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

  it('DOC-12 · cuadro de mando, DOCX, Markdown y manifiesto expresan el mismo veredicto y el mismo número de requisitos por validar', async () => {
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
      expect(state.diagnostic!.executiveSummary).toContain(`Quedan ${pending} requisitos por validar`);
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

  it('EIPD-06 · los datos de solvencia activan el criterio 4 de la AEPD (no el 4 de WP248) y llegan a los documentos', async () => {
    const solvencia = makeState(
      'Monitor de edictos concursales',
      answeredAnswers({ infersOutputs: 'no', processesPersonalData: 'si', processesSolvencyData: 'si' }),
      { isAiSystem: false }
    );
    expect(buildAepdCriteria(solvencia).find((c) => c.id === 'AEPD-4')!.applies).toBe(true);
    expect(buildEipdCriteria(solvencia).find((c) => c.id === 'C4')!.applies).toBe(false);
    // Un solo criterio: no basta para presumir la EIPD
    expect(eipdScreening(solvencia)).toBe('no_indicada');
    // Si además es a gran escala, son dos criterios de la lista de la AEPD
    const granEscala = makeState('Monitor', { ...solvencia.answers, largeScale: 'si' }, { isAiSystem: false });
    expect(eipdScreening(granEscala)).toBe('necesaria');
    // Sin contestar, el criterio queda por valorar
    const sinContestar = makeState('Monitor', { ...solvencia.answers, processesSolvencyData: 'desconocido' }, { isAiSystem: false });
    expect(buildAepdCriteria(sinContestar).find((c) => c.id === 'AEPD-4')!.estado).toBe('desconocido');

    const traza = await buildDocumentTraceability(solvencia);
    expect(generateOfficialDossierMarkdown(solvencia, undefined, 'castellano', traza)).toMatch(/solvencia patrimonial y de crédito[^\n]*SÍ/i);
    expect(buildAuditManifest(solvencia, undefined, 'castellano', traza).governance_and_compliance.gdpr_rgpd.declared_solvency_data).toBe('si');
  });

  it('EIPD-07 · el borrador de EIPD incluye la evaluación de necesidad y proporcionalidad (Art. 35.7.b) sin concluirla', async () => {
    const state = makeState(
      'Monitor de edictos concursales',
      answeredAnswers({ infersOutputs: 'no', processesPersonalData: 'si', processesSolvencyData: 'si', hostingModel: 'local_on_premise' }),
      { isAiSystem: false }
    );
    const text = await docxText(buildEipdDocument(state));
    expect(text).toMatch(/EVALUACIÓN DE LA NECESIDAD Y LA PROPORCIONALIDAD/);
    expect(text).toMatch(/Art\. 35\.7\.b/);
    for (const pregunta of [/Idoneidad/, /Alternativas menos intrusivas/, /Motivos para usar/, /Minimización/, /Proporcionalidad en sentido estricto/]) {
      expect(text).toMatch(pregunta);
    }
    // Recoge lo declarado
    expect(text).toMatch(/solvencia/i);
    expect(text).toMatch(/Monitor de edictos concursales/);
    // No concluye por el responsable ni por el DPD
    expect(text).toMatch(/A COMPLETAR/);
    expect(text).not.toMatch(/es necesari[oa] y proporcionad[oa]/i);
    expect(text).not.toMatch(/supera el juicio de proporcionalidad/i);
  });

  it('FRIA-01 · en alto riesgo, el requisito del Art. 27 remite al modelo FRIA de la APDCAT y aclara que complementa la EIPD', async () => {
    const state = CASES.altoRiesgoEmpleo();
    const req = state.diagnostic!.requirements.find((r) => r.id === 'RIA-ART-27')!;
    expect(req.accionRequerida).toMatch(/APDCAT/);
    expect(req.accionRequerida).toMatch(/FRIA/);
    expect(req.accionRequerida).toMatch(/complementa/i);
    expect(req.accionRequerida).toMatch(/Art\. 27\.4/);
    // Solo es una guía: no se presenta como obligatoria ni como sustituto de la EIPD
    expect(req.accionRequerida).not.toMatch(/obligatori[oa] (usar|utilizar) el modelo/i);
    expect(req.accionRequerida).not.toMatch(/sustituye/i);
    const traza = await buildDocumentTraceability(state);
    expect(generateOfficialDossierMarkdown(state, undefined, 'castellano', traza)).toContain('modelo FRIA');
    // Fuera del alto riesgo no aparece
    expect(CASES.asistenteRedaccion().diagnostic!.requirements.some((r) => r.id === 'RIA-ART-27')).toBe(false);
  });

  it('BRE-01 · el procedimiento de brechas (Arts. 33 y 34 RGPD) es un requisito con su estado, y llega a los documentos', async () => {
    const con = (breachProcedure: 'si' | 'no' | 'desconocido', processesPersonalData: 'si' | 'no' = 'si') =>
      makeState('Asistente', answeredAnswers({ processesPersonalData, breachProcedure }));
    const resultado = (s: ReturnType<typeof con>) => s.diagnostic!.requirements.find((r) => r.id === 'RGPD-BRECHAS')?.resultado;
    expect(resultado(con('si'))).toBe('declarado');
    expect(resultado(con('no'))).toBe('incumple');
    expect(resultado(con('desconocido'))).toBe('pendiente');
    expect(resultado(con('si', 'no'))).toBe('no_evaluado');

    const state = con('no');
    const req = state.diagnostic!.requirements.find((r) => r.id === 'RGPD-BRECHAS')!;
    expect(req.precepto).toMatch(/Arts?\. 33 y 34/);
    expect(req.accionRequerida).toMatch(/72 horas/);
    expect(req.accionRequerida).toMatch(/Asesora Brecha/);
    expect(req.accionRequerida).toMatch(/Comunica-Brecha/);

    const traza = await buildDocumentTraceability(state);
    const md = generateOfficialDossierMarkdown(state, undefined, 'castellano', traza);
    const docx = await officialDossierText(state, undefined, traza);
    expect(md).toMatch(/brechas de datos personales[^\n]*NO/i);
    expect(md).toContain('Asesora Brecha');
    expect(docx).toContain('Asesora Brecha');
    expect(buildAuditManifest(state, undefined, 'castellano', traza).governance_and_compliance.gdpr_rgpd.declared_breach_procedure).toBe('no');
  });

  it('EIPD-02 · el criterio 9 de WP248 es el impedimento al ejercicio de derechos, no las transferencias internacionales', () => {
    const state = makeState('Asistente de redacción', answeredAnswers({ hostingModel: 'us_hyperscaler' }));
    const c9 = buildEipdCriteria(state).find((c) => c.id === 'C9')!;
    expect(c9.title).not.toMatch(/transferencias/i);
  });
});

describe('Metadatos de los documentos Word (DOC-10)', () => {
  const coreXml = async (doc: import('docx').Document) => {
    const { Packer } = await import('docx');
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(await Packer.toBuffer(doc));
    return zip.file('docProps/core.xml')!.async('string');
  };

  it('el expediente y la EIPD se identifican como informe y borrador de una herramienta de apoyo', async () => {
    const state = CASES.asistenteRedaccion();
    const { buildOfficialDossierDocument } = await import('../officialDossierDocx');
    const expediente = await coreXml(buildOfficialDossierDocument(state));
    expect(expediente).not.toContain('Un-named');
    expect(expediente).toMatch(/<dc:title>[^<]*Informe técnico preliminar/);
    expect(expediente).toMatch(/<dc:description>[^<]*no es un acto administrativo/i);
    const eipd = await coreXml(buildEipdDocument(state));
    expect(eipd).not.toContain('Un-named');
    expect(eipd).toMatch(/<dc:title>[^<]*Borrador de evaluación de impacto/);
  });
});
