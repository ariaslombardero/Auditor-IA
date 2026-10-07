import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Comprobaciones sobre ficheros del proyecto que no pasan por el motor:
 * procedencia de los ejemplos y endurecimiento de la página.
 */

const root = process.cwd();

describe('Procedencia de los resultados de ejemplo', () => {
  it('DOC-09 · la carpeta de resultados de ejemplo declara que no la generó el motor', () => {
    const leeme = resolve(root, 'Resultados prueba app analizador ayudas', 'LEEME.md');
    expect(existsSync(leeme)).toBe(true);
    expect(readFileSync(leeme, 'utf8')).toMatch(/no (fue |fueron )?generad[oa]s? por el motor/i);
  });
});

describe('Endurecimiento de la página', () => {
  it('SEG-07 · index.html no carga tipografías de terceros y la página compilada declara una política CSP', async () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    expect(html).not.toContain('fonts.googleapis.com');
    // La CSP se inyecta como <meta> al compilar (en desarrollo la impediría el refresco en caliente de Vite).
    const { default: config } = await import('../../../vite.config');
    const plugin = (config.plugins ?? []).flat().find((p) => p && typeof p === 'object' && 'name' in p && p.name === 'csp-en-compilacion') as
      | { apply?: string; transformIndexHtml: () => Array<{ attrs: Record<string, string> }> }
      | undefined;
    expect(plugin?.apply).toBe('build');
    const meta = plugin!.transformIndexHtml()[0].attrs;
    expect(meta['http-equiv']).toBe('Content-Security-Policy');
    expect(meta.content).toContain("script-src 'self'");
    expect(meta.content).not.toContain('frame-ancestors');
  });
});
