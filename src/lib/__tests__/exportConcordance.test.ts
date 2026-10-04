import { describe, expect, it } from 'vitest';
import { generateOfficialDossierMarkdown } from '../officialDossierMd';
import { buildAuditManifest } from '../auditManifestGenerator';
import { buildEipdCriteria } from '../eipdGenerator';
import { generateCryptographicReceipt } from '../signatureService';
import { CASES, makeState, officialDossierText } from '../../test/fixtures';

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
    for (const [, build] of ALL_CASES) {
      const state = build();
      expect(await officialDossierText(state)).not.toMatch(/en tiempo real/i);
      expect(generateOfficialDossierMarkdown(state)).not.toMatch(/en tiempo real/i);
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
    expect(receipt.diligenceText).not.toMatch(/C[ÓO]DIGO SEGURO DE VERIFICACI[ÓO]N/i);
    expect(receipt.diligenceText).not.toMatch(/se certifica/i);
  });
});

describe('EIPD (criterios WP248)', () => {
  it('EIPD-01 · el criterio de tecnología innovadora no se activa para software sin IA', () => {
    const state = makeState('Calculadora de plazos administrativos', {}, { isAiSystem: false });
    const c8 = buildEipdCriteria(state).find((c) => c.id === 'C8')!;
    expect(c8.applies).toBe(false);
  });

  it('EIPD-02 · el criterio 9 de WP248 es el impedimento al ejercicio de derechos, no las transferencias internacionales', () => {
    const state = makeState('Asistente de redacción', { hostingModel: 'us_hyperscaler' });
    const c9 = buildEipdCriteria(state).find((c) => c.id === 'C9')!;
    expect(c9.title).not.toMatch(/transferencias/i);
  });
});
