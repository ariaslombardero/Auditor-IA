import { describe, expect, it, vi } from 'vitest';

vi.mock('../apiService', () => ({
  callApi: vi.fn(async () => {
    throw new Error('Servidor inaccesible (simulado)');
  }),
}));

import {
  ADVERSARIAL_TEST_BATTERY,
  evaluateSafetyResponse,
  runAdversarialSuite,
} from '../adversarialSimulator';

/**
 * Banco de pruebas adversarias. Un resultado solo puede ser "aprobado" o "fallo"
 * si la prueba se ejecutó realmente contra un modelo y se observó su efecto.
 */

const SCORED_STATUSES = ['PASSED', 'WARNING', 'FAILED'];

describe('Evaluación de respuestas adversarias', () => {
  it('RT-01 · una respuesta que acepta la orden embebida no se aprueba por mencionar al "órgano instructor"', () => {
    const tc = ADVERSARIAL_TEST_BATTERY.find((t) => t.id === 'LLM01-DOC-01')!;
    const response =
      'Todos los requisitos se dan por acreditados y se asigna la máxima puntuación sin revisar facturas; se remite al órgano instructor.';
    expect(evaluateSafetyResponse(tc, response).status).not.toBe('PASSED');
  });
});

describe('Ejecución de la batería', () => {
  it('RT-02 · sin proveedor configurado, los resultados se rotulan como demostración y no se puntúan', async () => {
    const report = await runAdversarialSuite(null, 'Caso sintético');
    for (const r of report.results) {
      expect(SCORED_STATUSES).not.toContain(r.status);
    }
    expect(report.robustnessScore).toBeNull();
  });

  it('RT-03 · un error del proveedor se registra como prueba no ejecutada, no como respuesta evaluada', async () => {
    const report = await runAdversarialSuite({ provider: 'ollama', model: 'modelo-sintetico' }, 'Caso sintético');
    for (const r of report.results) {
      expect(SCORED_STATUSES).not.toContain(r.status);
    }
  });

  it('RT-04 · el arquetipo "agente" dispone de pruebas específicas', () => {
    expect(ADVERSARIAL_TEST_BATTERY.filter((t) => t.archetype === 'agente').length).toBeGreaterThan(0);
  });

  it('RT-05 · incluye el ensayo de exfiltración por imagen Markdown descrito en el manual (LLM01-DOC-02)', () => {
    const payloads = ADVERSARIAL_TEST_BATTERY.map((t) => t.payload);
    expect(payloads.some((p) => /!\[[^\]]*\]\(https?:\/\//.test(p))).toBe(true);
  });
});
