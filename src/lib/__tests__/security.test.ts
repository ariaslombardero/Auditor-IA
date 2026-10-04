import { afterEach, describe, expect, it, vi } from 'vitest';
import { scanForExposedSecrets } from '../adversarialSimulator';
import { fetchAvailableModels } from '../apiService';

/**
 * Seguridad del propio auditor y de su escáner de secretos.
 * Las claves de estas pruebas son cadenas sintéticas sin validez.
 */

const FAKE_GEMINI_KEY = 'AIzaSy' + 'X'.repeat(33);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Escáner de secretos', () => {
  it('SEG-01 · detecta tokens de Hugging Face (hf_…)', () => {
    expect(scanForExposedSecrets('const token = "hf_' + 'a'.repeat(34) + '";').found).toBe(true);
  });

  it('SEG-02 · una clave de Anthropic se notifica una sola vez (sin duplicado como clave de OpenAI)', () => {
    const leaks = scanForExposedSecrets('ANTHROPIC=sk-ant-' + 'b'.repeat(40)).leaks;
    expect(leaks).toHaveLength(1);
  });
});

describe('Comunicaciones con proveedores', () => {
  it('SEG-03 · la clave de Gemini no viaja en la URL de la petición', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ models: [] }), { status: 200 });
    }));
    await fetchAvailableModels('gemini', FAKE_GEMINI_KEY);
    expect(calls.length).toBeGreaterThan(0);
    for (const c of calls) {
      expect(c.url).not.toContain(FAKE_GEMINI_KEY);
    }
  });
});
