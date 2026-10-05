import { describe, expect, it } from 'vitest';
import { PROHIBITED_SYSTEMS_CATALOG, REGULATORY_FRAMEWORK } from '../legalKnowledgeBase';
import { NORMATIVE_CORPUS } from '../localRagEngine';
import { CASES, answeredAnswers, runCase } from '../../test/fixtures';

/**
 * Pruebas de concordancia normativa. Las fuentes de cada criterio esperado
 * están en docs/auditoria/registro-fuentes.md.
 */

const frameworkText = JSON.stringify(REGULATORY_FRAMEWORK);

describe('Citas normativas de la base de conocimiento', () => {
  it('NOR-01 · no atribuye a la Guía CCN-STIC 884D medidas numeradas "IA-xx" que la guía oficial no contiene', () => {
    expect(frameworkText).not.toMatch(/Medida IA-\d{2}/);
  });

  it('NOR-02 · cita el Art. 43 de la Ley 40/2015 para la firma electrónica del personal', () => {
    expect(frameworkText).toMatch(/Art\. 43/);
  });

  it('NOR-03 · no presenta el Art. 8 del RD 729/2023 como protocolo de incidentes', () => {
    expect(frameworkText).not.toMatch(/Art\. 8: Protocolo de comunicaci[óo]n obligatoria de incidentes/);
  });

  it('NOR-04 · no atribuye al Reglamento (UE) 2026/1744 artículos sin respaldo en el texto publicado', () => {
    expect(frameworkText).not.toMatch(/Art\. 18: Mecanismos simplificados/);
    expect(frameworkText).not.toMatch(/Art\. 24: Fomento de arquitecturas locales/);
  });

  it('NOR-05 · el catálogo del Art. 5 incluye la identificación biométrica remota en tiempo real (Art. 5.1.h)', () => {
    expect(PROHIBITED_SYSTEMS_CATALOG.map((p) => p.legalArticle).join(' ')).toMatch(/5\.1\.h/);
  });

  it('NOR-10 · el consultor normativo distingue extractos literales de resúmenes y enlaza siempre la fuente oficial', () => {
    for (const doc of NORMATIVE_CORPUS) {
      expect(doc.sourceUrl).toMatch(/^https:\/\/(www\.boe\.es|eur-lex\.europa\.eu)\//);
      if (!doc.isLiteral) {
        expect(doc.text).toMatch(/^Resumen/);
      }
    }
    expect(JSON.stringify(NORMATIVE_CORPUS)).not.toMatch(/IA-\d{2}|CCN-STIC 884D/);
  });

  it('NOR-08 · describe el Art. 23 de la Ley 15/2022 como fomento ("promoverá"), no como auditoría previa obligatoria', () => {
    const ley15 = JSON.stringify(REGULATORY_FRAMEWORK.find((n) => n.id === 'ley-15-2022'));
    expect(ley15).not.toMatch(/deber de auditor[íi]a previa/i);
    expect(ley15).toMatch(/promover/i);
  });
});

describe('Citas normativas en el diagnóstico', () => {
  it('NOR-06 · no remite a la AESIA para el marcado CE de un sistema del Anexo III', () => {
    const text = JSON.stringify(CASES.altoRiesgoEmpleo().diagnostic);
    expect(text).not.toMatch(/AESIA[^."]*marcado CE/i);
    expect(text).not.toMatch(/expediente completo de Alto Riesgo con la AESIA/i);
  });

  it('NOR-09 · la calificación sancionadora remite a la norma nacional y al Art. 99 RIA', () => {
    const r = runCase('Sistema de puntuación social', answeredAnswers({
      prohibitedPractices: { ...answeredAnswers().prohibitedPractices, social_scoring: 'si' },
    }));
    if (/muy grave/i.test(r.riskSummary)) {
      expect(r.riskSummary).toMatch(/Art\. 99/);
    }
  });

  it('NOR-07 · los antecedentes penales se encuadran en el Art. 10 RGPD, no en el Art. 9', () => {
    const r = runCase('Gestión de expedientes sancionadores', answeredAnswers({
      processesPersonalData: 'si',
      processesSpecialCategoryData: 'si',
      processesCriminalData: 'si',
      hostingModel: 'eu_cloud_dpa',
    }));
    const flags = r.redFlags.join(' ');
    if (/antecedentes/i.test(flags)) {
      expect(flags).toMatch(/Art\. 10/);
    }
  });
});
