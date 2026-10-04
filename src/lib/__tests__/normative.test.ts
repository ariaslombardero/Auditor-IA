import { describe, expect, it } from 'vitest';
import { PROHIBITED_SYSTEMS_CATALOG, REGULATORY_FRAMEWORK } from '../legalKnowledgeBase';
import { CASES, runCase } from '../../test/fixtures';

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
});

describe('Citas normativas en el diagnóstico', () => {
  it('NOR-06 · no remite a la AESIA para el marcado CE de un sistema del Anexo III', () => {
    const text = JSON.stringify(CASES.altoRiesgoEmpleo().diagnostic);
    expect(text).not.toMatch(/AESIA[^."]*marcado CE/i);
    expect(text).not.toMatch(/expediente completo de Alto Riesgo con la AESIA/i);
  });

  it('NOR-07 · los antecedentes penales se encuadran en el Art. 10 RGPD, no en el Art. 9', () => {
    const r = runCase('Gestión de expedientes sancionadores', {
      processesSpecialCategoryData: true,
      hostingModel: 'eu_cloud_dpa',
    });
    const flags = r.redFlags.join(' ');
    if (/antecedentes/i.test(flags)) {
      expect(flags).toMatch(/Art\. 10/);
    }
  });
});
