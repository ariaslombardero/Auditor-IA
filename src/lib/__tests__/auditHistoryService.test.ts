import { describe, expect, it } from 'vitest';
import { getStoredAudits, importHistoryJson, saveAuditRecord } from '../auditHistoryService';
import { MemoryStorage } from '../../test/memoryStorage';
import { CASES } from '../../test/fixtures';
import { normalizeDiagnostic } from '../assessmentModel';
import { computeExecutivePillars } from '../dashboardPillars';
import type { DiagnosticResult } from '../../types';

/**
 * Custodia local del historial de auditorías.
 */

describe('Historial local de auditorías', () => {
  it('ALM-01 · dos auditorías de la misma aplicación en menos de 30 minutos se conservan ambas', () => {
    const state = CASES.asistenteRedaccion();
    saveAuditRecord(state);
    saveAuditRecord({ ...state, answers: { ...state.answers, auditLogsEnabled: 'no' } });
    expect(getStoredAudits()).toHaveLength(2);
  });

  it('ALM-02 · un guardado fallido no se presenta como guardado correcto', () => {
    (localStorage as MemoryStorage).failWrites = true;
    let result: unknown;
    try {
      result = saveAuditRecord(CASES.asistenteRedaccion());
    } catch (err) {
      result = err;
    }
    expect(result === null || result instanceof Error).toBe(true);
  });

  it('ALM-03 · rechaza importaciones con registros malformados', () => {
    const malformed = JSON.stringify({
      audits: [{ id: 'x-1', appName: 'Malformado', createdAt: new Date().toISOString(), state: {} }],
    });
    expect(importHistoryJson(malformed).importedCount).toBe(0);
  });

  it('ALM-06 · un diagnóstico guardado por el motor anterior no se reinterpreta como acreditado', () => {
    const legacy = {
      ...CASES.asistenteRedaccion().diagnostic!,
      requirements: undefined,
      engineVersion: undefined,
      obligations: [{ code: 'LEY-15-2022-ART-23', title: 'Sesgos', legalBasis: 'Ley 15/2022', status: 'compliant', description: '', actionRequired: '' }],
      prohibitedChecks: [{ id: 'social_scoring', title: 'Puntuación social', legalArticle: 'Art. 5.1.c RIA', detected: false, explanation: '' }],
    } as unknown as DiagnosticResult;
    const normalized = normalizeDiagnostic(legacy)!;
    expect(normalized.requirements.length).toBe(2);
    expect(normalized.requirements.every((r) => r.resultado !== 'acreditado')).toBe(true);
    expect(normalized.engineVersion).toMatch(/no recalculado/);
    // Ningún pilar puede presentar como acreditado lo que no se ha evaluado
    for (const pillar of Object.values(computeExecutivePillars(normalized))) {
      expect(pillar.text).not.toBe('Requisitos acreditados');
      expect(pillar.status).not.toBe('success');
    }
  });

  it('ALM-04 · rechaza importaciones con una clasificación de riesgo inexistente', () => {
    const valid = CASES.asistenteRedaccion();
    const tampered = JSON.stringify({
      audits: [
        {
          id: 'x-2',
          appName: 'Manipulado',
          entityName: 'Entidad',
          createdAt: new Date().toISOString(),
          riskClassification: 'riesgo_inventado',
          state: valid,
        },
      ],
    });
    expect(importHistoryJson(tampered).importedCount).toBe(0);
  });
});
