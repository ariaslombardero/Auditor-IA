import { describe, expect, it } from 'vitest';
import { REFERENCE_CASES } from '../../test/referenceCases';
import { officialDossierText } from '../../test/fixtures';
import { generateOfficialDossierMarkdown } from '../officialDossierMd';
import { buildAuditManifest } from '../auditManifestGenerator';
import { buildDocumentTraceability } from '../traceability';

/**
 * Casos de referencia (Fase 4): resultado esperado del motor y concordancia de los cuatro
 * documentos (diagnóstico, DOCX, Markdown y manifiesto) para cada caso.
 */

describe.each(REFERENCE_CASES)('Caso de referencia «$id»', (caso) => {
  it(`clasifica como ${caso.esperado.clasificacion}`, () => {
    const d = caso.state().diagnostic!;
    expect(d.riskClassification, caso.fundamento).toBe(caso.esperado.clasificacion);
    expect(Boolean(d.isArticle63Derogation)).toBe(Boolean(caso.esperado.excepcion63));
    for (const alerta of caso.esperado.alertas ?? []) {
      expect(d.redFlags.some((f) => f.includes(alerta))).toBe(true);
    }
    if (caso.esperado.clasificacion === 'requires_review') {
      expect(d.reviewReasons.length).toBeGreaterThan(0);
    }
  });

  it('los documentos exportados expresan la misma clasificación y la misma huella', async () => {
    const state = caso.state();
    const d = state.diagnostic!;
    const traza = await buildDocumentTraceability(state);
    const docx = await officialDossierText(state, undefined, traza);
    const md = generateOfficialDossierMarkdown(state, undefined, 'castellano', traza);
    const manifest = buildAuditManifest(state, undefined, 'castellano', traza);

    expect(manifest.governance_and_compliance.ai_act.risk_classification).toBe(d.riskClassification);
    expect(manifest.governance_and_compliance.ai_act.risk_label).toBe(d.riskLabel);
    expect(manifest.traceability.input_fingerprint_sha256).toBe(traza.inputFingerprint);
    expect(md).toContain(d.riskLabel);
    expect(docx).toContain(d.riskLabel);
    expect(md).toContain(traza.inputFingerprint);
    expect(docx).toContain(traza.inputFingerprint);

    // DOC-14 · las alertas y recomendaciones del motor figuran en todos los documentos
    expect(manifest.governance_and_compliance.ai_act.review_alerts).toEqual(d.redFlags);
    expect(manifest.governance_and_compliance.ai_act.recommendations).toEqual(d.recommendations);
    for (const texto of [...d.redFlags, ...d.recommendations]) {
      const fragmento = texto.slice(0, 60);
      expect(md, 'Markdown').toContain(fragmento);
      expect(docx, 'DOCX').toContain(fragmento);
    }
  });
});
