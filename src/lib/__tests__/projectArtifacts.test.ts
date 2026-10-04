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
  it('SEG-07 · index.html no carga tipografías de terceros y declara una política CSP', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).toMatch(/http-equiv="Content-Security-Policy"/i);
  });
});
