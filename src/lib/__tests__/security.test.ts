import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildSecretsScanInput, scanForExposedSecrets } from '../adversarialSimulator';
import { fetchAvailableModels } from '../apiService';
import { makeIngest } from '../../test/fixtures';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

describe('Alcance del escáner de secretos (SEG-06)', () => {
  it('SEG-02 · una clave de OpenRouter se notifica una vez y con su tipo', () => {
    const leaks = scanForExposedSecrets('KEY=sk-or-v1-' + 'c'.repeat(64)).leaks;
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toContain('OpenRouter');
  });

  it('SEG-06 · analiza el prompt del sistema y el código aportado, y declara lo que no ha analizado', () => {
    const ingest = makeIngest('App', { systemPrompt: 'token hf_' + 'd'.repeat(34) });
    const sinCodigo = buildSecretsScanInput(ingest);
    expect(scanForExposedSecrets(sinCodigo.text).found).toBe(true);
    expect(sinCodigo.noAnalizado.join(' ')).toMatch(/código/i);
    const conCodigo = buildSecretsScanInput(makeIngest('App'), 'const k = "AIzaSy' + 'E'.repeat(33) + '";');
    expect(scanForExposedSecrets(conCodigo.text).found).toBe(true);
    expect(conCodigo.analizado.join(' ')).toMatch(/código aportado/i);
  });
});

describe('Despliegue público (SEG-07 y SEG-08)', () => {
  const raiz = resolve(__dirname, '../../..');
  const leer = (f: string) => readFileSync(resolve(raiz, f), 'utf8');

  it('SEG-07 · sin fuentes de Google: la tipografía se sirve desde la propia aplicación', () => {
    expect(leer('index.html')).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    expect(leer('src/main.tsx')).toMatch(/@fontsource/);
  });

  it('SEG-07 · vercel.json fija una CSP que impide scripts externos, marcos y envío de formularios', () => {
    const vercel = JSON.parse(leer('vercel.json'));
    const cabeceras: Array<{ key: string; value: string }> = vercel.headers[0].headers;
    const csp = cabeceras.find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toMatch(/connect-src[^;]*http:\/\/localhost:\*/);
    expect(cabeceras.some((h) => h.key === 'X-Content-Type-Options' && h.value === 'nosniff')).toBe(true);
    expect(cabeceras.some((h) => h.key === 'Referrer-Policy' && h.value === 'no-referrer')).toBe(true);
  });

  it('SEG-08 · la consulta de legislación de EUR-Lex tiene ruta también fuera del servidor de desarrollo', () => {
    const vercel = JSON.parse(leer('vercel.json'));
    expect(vercel.rewrites.some((r: { source: string; destination: string }) => r.source.startsWith('/api/cellar') && r.destination.startsWith('https://publications.europa.eu/resource/celex'))).toBe(true);
    expect(leer('vite.config.ts')).toMatch(/preview:/);
  });
});
