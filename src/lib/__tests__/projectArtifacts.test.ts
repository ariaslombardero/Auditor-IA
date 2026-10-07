import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Comprobaciones sobre ficheros del proyecto que no pasan por el motor:
 * procedencia de los ejemplos y endurecimiento de la página.
 */

const root = process.cwd();

describe('Procedencia de los resultados de ejemplo', () => {
  it('DOC-09 · los resultados antiguos, escritos a mano, quedan en un histórico que lo declara', () => {
    const leeme = resolve(root, 'Resultados prueba app analizador ayudas', 'historico-no-motor', 'LEEME.md');
    expect(existsSync(leeme)).toBe(true);
    expect(readFileSync(leeme, 'utf8')).toMatch(/no (fue |fueron )?generad[oa]s? por el motor/i);
  });

  it('DOC-09 · los resultados vigentes los genera el motor y se indica cómo regenerarlos', () => {
    const leeme = readFileSync(resolve(root, 'Resultados prueba app analizador ayudas', 'LEEME.md'), 'utf8');
    expect(leeme).toMatch(/npm run ejemplos/);
    expect(existsSync(resolve(root, 'Resultados prueba app analizador ayudas', 'Expediente_Analizador_Ayudas.md'))).toBe(true);
    expect(existsSync(resolve(root, 'scripts', 'generateAuditOutputs.js'))).toBe(false);
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

describe('Documentación pública (DOC-15)', () => {
  const leer = (f: string) => readFileSync(resolve(root, f), 'utf8');
  const documentos = ['README.md', 'agents.md', 'docs/piloto.md', 'docs/revision-humana.md', 'docs/formato-documental.md', 'docs/custodia-historial.md', 'docs/adr/001-credenciales-inferencia.md'];

  it('los enlaces relativos de la documentación apuntan a ficheros existentes', () => {
    for (const doc of documentos) {
      const base = resolve(root, doc, '..');
      for (const [, destino] of leer(doc).matchAll(/\]\(((?!https?:|#|mailto:)[^)\s]+)\)/g)) {
        const ruta = resolve(base, decodeURI(destino.split('#')[0]));
        expect(existsSync(ruta), `${doc} → ${destino}`).toBe(true);
      }
    }
  });

  it('el README y la guía de usuario no prometen certificaciones, CSV ni dictámenes oficiales', () => {
    const textos = [leer('README.md'), leer('src/components/UserGuideModal.tsx'), leer('src/components/ExecutivePurposeModal.tsx')];
    for (const t of textos) {
      expect(t).not.toMatch(/dictamen oficial|expediente oficial|CSV oficial|100\s?% de fiabilidad|apto para producci[oó]n|Producci%C3%B3n%20%2F%20Activo/i);
    }
  });
});
