/**
 * Genera los ejemplos ejecutando el motor real (sustituye al antiguo generateAuditOutputs.js,
 * que escribía textos fijos). Uso: `npm run ejemplos`.
 *
 * - docs/casos-de-referencia/: un informe Markdown y un manifiesto JSON por caso de referencia,
 *   y un índice con el resultado esperado y el obtenido.
 * - Resultados prueba app analizador ayudas/: expediente (DOCX y Markdown), manifiesto y
 *   borrador de EIPD del analizador de ayudas, generados por el motor.
 *
 * No usa ningún modelo de IA: el diagnóstico procede solo del motor determinista.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Packer } from 'docx';
import { REFERENCE_CASES } from '../src/test/referenceCases';
import { buildDocumentTraceability, ENGINE_VERSION, NORMATIVE_SNAPSHOT } from '../src/lib/traceability';
import { generateOfficialDossierMarkdown } from '../src/lib/officialDossierMd';
import { buildAuditManifest } from '../src/lib/auditManifestGenerator';
import { buildOfficialDossierDocument } from '../src/lib/officialDossierDocx';
import { buildEipdDocument } from '../src/lib/eipdGenerator';

const raiz = process.cwd();
const dirCasos = resolve(raiz, 'docs', 'casos-de-referencia');
const dirAnalizador = resolve(raiz, 'Resultados prueba app analizador ayudas');
mkdirSync(dirCasos, { recursive: true });
mkdirSync(dirAnalizador, { recursive: true });

const filas: string[] = [];
let discrepancias = 0;

for (const caso of REFERENCE_CASES) {
  const state = caso.state();
  const d = state.diagnostic!;
  const traza = await buildDocumentTraceability(state);
  const md = generateOfficialDossierMarkdown(state, undefined, 'castellano', traza);
  const manifiesto = buildAuditManifest(state, undefined, 'castellano', traza);

  writeFileSync(resolve(dirCasos, `${caso.id}.md`), md);
  writeFileSync(resolve(dirCasos, `${caso.id}.manifest.json`), JSON.stringify(manifiesto, null, 2));

  const coincide = d.riskClassification === caso.esperado.clasificacion && Boolean(d.isArticle63Derogation) === Boolean(caso.esperado.excepcion63);
  if (!coincide) discrepancias++;
  filas.push(
    `| \`${caso.id}\` | ${caso.titulo} | ${caso.esperado.clasificacion}${caso.esperado.excepcion63 ? ' (Art. 6.3)' : ''} | ${d.riskLabel} | ${coincide ? 'Sí' : '**NO**'} | ${caso.fundamento} | \`${traza.inputFingerprint.slice(0, 12)}…\` |`
  );

  if (caso.id === 'analizador-ayudas') {
    writeFileSync(resolve(dirAnalizador, 'Expediente_Analizador_Ayudas.md'), md);
    writeFileSync(resolve(dirAnalizador, 'Expediente_Analizador_Ayudas.manifest.json'), JSON.stringify(manifiesto, null, 2));
    writeFileSync(resolve(dirAnalizador, 'Expediente_Analizador_Ayudas.docx'), await Packer.toBuffer(buildOfficialDossierDocument(state, undefined, 'castellano', traza)));
    writeFileSync(resolve(dirAnalizador, 'EIPD_Borrador_Analizador_Ayudas.docx'), await Packer.toBuffer(buildEipdDocument(state, 'castellano')));
  }
}

const fecha = new Date().toISOString();
writeFileSync(
  resolve(dirCasos, 'LEEME.md'),
  `# Casos de referencia del motor

> Generado por \`npm run ejemplos\` (\`scripts/generarEjemplos.ts\`) el ${fecha}, con el motor v${ENGINE_VERSION}.
> Corte normativo: ${NORMATIVE_SNAPSHOT}.
> Los diagnósticos proceden solo del motor determinista, sin ningún modelo de IA. Las entradas son sintéticas,
> salvo el caso \`analizador-ayudas\`, que usa la documentación pública de esa aplicación.
> Las mismas comprobaciones se ejecutan como pruebas en \`src/lib/__tests__/referenceCases.test.ts\`.

| Caso | Descripción | Resultado esperado | Resultado del motor | Coincide | Fundamento | Huella de las entradas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${filas.join('\n')}

Cada caso tiene su informe (\`<caso>.md\`) y su manifiesto (\`<caso>.manifest.json\`). Son informes técnicos
preliminares para probar la herramienta: no son actos administrativos ni acreditan el cumplimiento.
`
);

console.log(`${REFERENCE_CASES.length} casos generados en docs/casos-de-referencia (${discrepancias} discrepancias).`);
if (discrepancias > 0) process.exitCode = 1;
