import { describe, expect, it } from 'vitest';
import { clearAuditHistory, exportHistoryJson, getStoredAudits, HISTORY_LIMIT, importHistoryJson, MAX_IMPORT_BYTES, saveAuditRecord } from '../auditHistoryService';
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
    // Sin expediente indicado, cada guardado es un expediente nuevo
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

describe('Revisiones, conservación y registros antiguos (ALM-01, ALM-05)', () => {
  it('ALM-01 · las nuevas versiones de un mismo expediente se añaden como revisiones, sin sobrescribir', () => {
    const state = CASES.asistenteRedaccion();
    const r1 = saveAuditRecord(state, undefined, { auditId: 'exp-1' }).record;
    const r2 = saveAuditRecord({ ...state, validations: {} }, undefined, { auditId: 'exp-1' }).record;
    expect(r1.id).not.toBe(r2.id);
    expect([r1.revision, r2.revision]).toEqual([1, 2]);
    const guardados = getStoredAudits().filter((a) => a.auditId === 'exp-1');
    expect(guardados.map((a) => a.revision).sort()).toEqual([1, 2]);
  });

  it('ALM-05 · al superar el límite se informa de los registros retirados, nunca en silencio', () => {
    const state = CASES.asistenteRedaccion();
    for (let i = 0; i < HISTORY_LIMIT; i++) saveAuditRecord(state);
    const { retirados } = saveAuditRecord(state);
    expect(retirados).toHaveLength(1);
    expect(getStoredAudits()).toHaveLength(HISTORY_LIMIT);
  });

  it('ALM-05 · un registro de una versión anterior se lee como revisión 1 y con el motor «no recalculado»', () => {
    const legacyDiagnostic = { ...CASES.asistenteRedaccion().diagnostic!, requirements: undefined, engineVersion: undefined };
    const legacy = {
      id: 'audit-antiguo',
      createdAt: '2026-05-01T10:00:00.000Z',
      appName: 'App antigua',
      entityName: 'Entidad',
      serviceDepartment: '',
      riskClassification: legacyDiagnostic.riskClassification,
      riskLabel: 'x',
      ensCategory: 'BASICA',
      state: { ...CASES.asistenteRedaccion(), diagnostic: legacyDiagnostic },
    };
    localStorage.setItem('auditor_ia_history', JSON.stringify([legacy]));
    const [leido] = getStoredAudits();
    expect(leido.auditId).toBe('audit-antiguo');
    expect(leido.revision).toBe(1);
    expect(leido.state.diagnostic?.engineVersion).toMatch(/no recalculado/);
  });
});

describe('Importación validada (ALM-03, ALM-04)', () => {
  it('una copia exportada se restaura completa', () => {
    saveAuditRecord(CASES.asistenteRedaccion());
    saveAuditRecord(CASES.asistenteRedaccion());
    const copia = exportHistoryJson();
    clearAuditHistory();
    const res = importHistoryJson(copia);
    expect(res.importedCount).toBe(2);
    expect(res.rejected).toHaveLength(0);
    expect(getStoredAudits()).toHaveLength(2);
  });

  it('explica por qué rechaza cada registro', () => {
    const valido = saveAuditRecord(CASES.asistenteRedaccion()).record;
    clearAuditHistory();
    const incoherente = { ...valido, id: 'x-3', riskClassification: 'high_risk' };
    const res = importHistoryJson(JSON.stringify({ audits: [valido, incoherente, 'texto'] }));
    expect(res.importedCount).toBe(1);
    expect(res.rejected.map((r) => r.index)).toEqual([1, 2]);
    expect(res.rejected[0].motivo).toMatch(/no coincide/);
  });

  it('rechaza ficheros demasiado grandes sin procesarlos', () => {
    const res = importHistoryJson(' '.repeat(MAX_IMPORT_BYTES + 1));
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/tamaño/);
  });

  it('un registro ya presente no se duplica', () => {
    saveAuditRecord(CASES.asistenteRedaccion());
    const res = importHistoryJson(exportHistoryJson());
    expect(res.importedCount).toBe(0);
    expect(res.duplicates).toBe(1);
    expect(getStoredAudits()).toHaveLength(1);
  });
});
