import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiService', async (original) => {
  const real = await original<typeof import('../apiService')>();
  return { ...real, callApi: vi.fn() };
});

import { callApi } from '../apiService';
import {
  acceptSuggestion,
  bulkAcceptable,
  classifySuggestion,
  hintSuggestions,
  parseSuggestionResponse,
  sourcesAfterManualChange,
  suggestWithAI,
  verifyQuote,
} from '../interviewSuggestions';
import { questionById } from '../interviewCatalog';
import { generateOfficialDossierMarkdown } from '../officialDossierMd';
import { buildAuditManifest } from '../auditManifestGenerator';
import { REFERENCE_CASES } from '../../test/referenceCases';
import { makeAnswers, makeIngest, officialDossierText } from '../../test/fixtures';
import type { ApiConfig } from '../../types';

/**
 * Fase 5.3 · Sugerencias de respuesta: nunca se aplican solas, la cita la comprueba la app
 * y la procedencia de cada respuesta llega a los documentos. Respuestas de modelo simuladas.
 */

const analizador = () => REFERENCE_CASES.find((c) => c.id === 'analizador-ayudas')!.state();
const LOCAL: ApiConfig = { provider: 'ollama', model: 'modelo-sintetico', endpoint: 'http://localhost:11434' };

beforeEach(() => {
  vi.mocked(callApi).mockReset();
});

describe('Comprobación de citas (SUG-02)', () => {
  const ingest = makeIngest('Asistente', { readmeContent: 'La aplicación usa el modelo gemini-2.5-flash para redactar fichas resumen de convocatorias.' });

  it('acepta una cita literal, aunque cambien mayúsculas, tildes o espacios', () => {
    expect(verifyQuote('usa el modelo GEMINI-2.5-flash  para redactar', ingest)).toBe(true);
  });

  it('rechaza una cita inventada o demasiado corta', () => {
    expect(verifyQuote('la aplicación decide automáticamente las ayudas', ingest)).toBe(false);
    expect(verifyQuote('usa', ingest)).toBe(false);
  });

  it('una cita inventada convierte la sugerencia en inferida', () => {
    const s = classifySuggestion(questionById('generatesSyntheticContent')!, 'si', 'genera vídeos promocionales automáticamente', 'Genera contenido', ingest);
    expect(s?.tipo).toBe('inferida');
  });

  it('una cita comprobada da una sugerencia con cita', () => {
    const s = classifySuggestion(questionById('generatesSyntheticContent')!, 'si', 'para redactar fichas resumen de convocatorias', 'Redacta fichas', ingest);
    expect(s?.tipo).toBe('con_cita');
  });
});

describe('Reglas de prudencia (SUG-01)', () => {
  const ingest = makeIngest('Asistente', { readmeContent: 'No realiza puntuación social ni perfila a nadie.' });

  it('un «no» en una práctica prohibida es siempre inferido, aunque traiga cita', () => {
    const s = classifySuggestion(questionById('prohibitedPractices.social_scoring')!, 'no', 'No realiza puntuación social', 'Lo dice el README', ingest);
    expect(s?.tipo).toBe('inferida');
  });

  it('un «no» en datos sensibles o en perfilado es siempre inferido', () => {
    for (const id of ['processesSpecialCategoryData', 'processesSolvencyData', 'performsProfiling']) {
      expect(classifySuggestion(questionById(id)!, 'no', 'ni perfila a nadie', 'x', ingest)?.tipo, id).toBe('inferida');
    }
  });

  it('en las decisiones de la entidad no se propone valor: solo orientación', () => {
    const s = classifySuggestion(questionById('institutionalRole')!, 'ambos', '', 'La desarrolla y la usa la Diputación', ingest);
    expect(s?.tipo).toBe('orientacion');
    expect(s?.valor).toBeUndefined();
  });

  it('se descartan valores que no están entre las opciones de la pregunta', () => {
    expect(classifySuggestion(questionById('annexIIIArea')!, 'turismo', '', 'x', ingest)).toBeNull();
  });

  it('«desconocido» se presenta como «no consta», sin valor', () => {
    const s = classifySuggestion(questionById('largeScale')!, 'desconocido', '', 'No se indica el volumen de datos', ingest);
    expect(s?.tipo).toBe('no_consta');
    expect(s?.valor).toBeUndefined();
  });

  it('la aceptación en bloque solo incluye las sugerencias con cita comprobada', () => {
    const ok = classifySuggestion(questionById('infersOutputs')!, 'si', 'ni perfila a nadie', 'x', ingest)!;
    const inferida = classifySuggestion(questionById('prohibitedPractices.social_scoring')!, 'no', 'No realiza puntuación social', 'x', ingest)!;
    expect(bulkAcceptable([ok, inferida]).map((s) => s.questionId)).toEqual(['infersOutputs']);
  });
});

describe('Aceptar y procedencia (SUG-03)', () => {
  it('una sugerencia no cambia las respuestas hasta que se acepta', async () => {
    const state = analizador();
    const pendientes = makeAnswers();
    vi.mocked(callApi).mockResolvedValue(JSON.stringify({ sugerencias: [{ id: 'infersOutputs', valor: 'si', cita: 'gemini-2.5-flash', razonamiento: 'Usa un modelo de lenguaje' }] }));
    const antes = JSON.stringify(pendientes);
    await suggestWithAI(LOCAL, state.ingest, pendientes, ['infersOutputs']);
    expect(JSON.stringify(pendientes)).toBe(antes);
  });

  it('aceptar fija la respuesta y registra el origen con modelo y cita', () => {
    const state = { ...analizador(), answers: makeAnswers() };
    const s = classifySuggestion(questionById('infersOutputs')!, 'si', 'gemini-2.5-flash', 'Usa un modelo de lenguaje', state.ingest, { fuente: 'ia', modelo: 'Ollama (local) · modelo-sintetico' })!;
    const next = acceptSuggestion(state, s, '2026-10-08T10:00:00.000Z');
    expect(next.answers.infersOutputs).toBe('si');
    expect(next.answerSources?.infersOutputs).toMatchObject({ origen: 'ia', modelo: 'Ollama (local) · modelo-sintetico', tipo: 'con_cita' });
  });

  it('si la persona cambia después la respuesta, el origen vuelve a ser suyo', () => {
    const sources = { infersOutputs: { origen: 'ia' as const, tipo: 'con_cita' as const, fecha: 'x' }, largeScale: { origen: 'indicio' as const, tipo: 'inferida' as const, fecha: 'x' } };
    const prev = makeAnswers({ infersOutputs: 'si', largeScale: 'no' });
    const next = makeAnswers({ infersOutputs: 'no', largeScale: 'no' });
    expect(Object.keys(sourcesAfterManualChange(prev, next, sources))).toEqual(['largeScale']);
  });

  it('el origen de las respuestas aparece en el Word, el Markdown y el manifiesto', async () => {
    const base = analizador();
    const s = classifySuggestion(questionById('infersOutputs')!, 'si', 'gemini-2.5-flash', 'Usa un modelo de lenguaje', base.ingest, { fuente: 'ia', modelo: 'Ollama (local) · modelo-sintetico' })!;
    const state = acceptSuggestion({ ...base, answers: { ...base.answers, infersOutputs: 'desconocido' } }, s, '2026-10-08T10:00:00.000Z');
    const md = generateOfficialDossierMarkdown(state);
    const docx = await officialDossierText(state);
    for (const texto of [md, docx]) {
      expect(texto).toMatch(/Origen de las respuestas/);
      expect(texto).toContain('Ollama (local) · modelo-sintetico');
      expect(texto).toContain('gemini-2.5-flash');
    }
    expect(buildAuditManifest(state).answer_sources?.infersOutputs?.origen).toBe('ia');
  });
});

describe('Respuesta del modelo (SUG-01)', () => {
  it('descarta un JSON mal formado y lo dice', () => {
    const r = parseSuggestionResponse('no es JSON', ['infersOutputs'], makeIngest('x'), { fuente: 'ia', modelo: 'm' });
    expect(r.sugerencias).toHaveLength(0);
    expect(r.error).toMatch(/formato/);
  });

  it('ignora preguntas que no se pidieron', () => {
    const r = parseSuggestionResponse(JSON.stringify({ sugerencias: [{ id: 'largeScale', valor: 'si', cita: '', razonamiento: 'x' }] }), ['infersOutputs'], makeIngest('x'), { fuente: 'ia', modelo: 'm' });
    expect(r.sugerencias).toHaveLength(0);
    expect(r.descartadas).toBe(1);
  });

  it('con el analizador de ayudas y un modelo simulado, las sugerencias son coherentes', async () => {
    const state = analizador();
    vi.mocked(callApi).mockImplementation(async () =>
      JSON.stringify({
        sugerencias: [
          { id: 'infersOutputs', valor: 'si', cita: 'gemini-2.5-flash', razonamiento: 'Usa un modelo de lenguaje.' },
          { id: 'generatesSyntheticContent', valor: 'si', cita: 'genera vídeos de propaganda', razonamiento: 'Genera contenido.' },
          { id: 'prohibitedPractices.social_scoring', valor: 'no', cita: '', razonamiento: 'Nada lo indica.' },
          { id: 'institutionalRole', valor: 'ambos', cita: '', razonamiento: 'Desarrollada y usada por la Diputación.' },
          { id: 'annexIIIArea', valor: 'subvenciones', cita: '', razonamiento: 'Valor inventado.' },
        ],
      })
    );
    const pedidas = ['infersOutputs', 'generatesSyntheticContent', 'prohibitedPractices.social_scoring', 'institutionalRole', 'annexIIIArea'];
    const r = await suggestWithAI(LOCAL, state.ingest, makeAnswers(), pedidas);
    const por = Object.fromEntries(r.sugerencias.map((s) => [s.questionId, s]));
    expect(por.infersOutputs.tipo).toBe('con_cita');
    expect(por.generatesSyntheticContent.tipo).toBe('inferida');
    expect(por['prohibitedPractices.social_scoring'].tipo).toBe('inferida');
    expect(por.institutionalRole.tipo).toBe('orientacion');
    expect(por.annexIIIArea).toBeUndefined();
    expect(r.descartadas).toBeGreaterThanOrEqual(1);
  });

  it('no envía nada a un proveedor externo si se han declarado datos de salud o penales', async () => {
    const state = analizador();
    const externo: ApiConfig = { provider: 'gemini', apiKey: 'x', model: 'm' };
    const r = await suggestWithAI(externo, state.ingest, makeAnswers({ processesPersonalData: 'si', processesSpecialCategoryData: 'si' }), ['infersOutputs']);
    expect(callApi).not.toHaveBeenCalled();
    expect(r.error).toMatch(/Art\. 9|categorías especiales/);
  });
});

describe('Indicios automáticos sin IA', () => {
  it('proponen respuestas inferidas con su fragmento, nunca con cita comprobada', () => {
    const ingest = makeIngest('Chatbot', { readmeContent: 'Asistente conversacional (chatbot) que usa la API de Gemini mediante @google/genai.' });
    const lista = hintSuggestions(ingest, makeAnswers());
    const ids = lista.map((s) => s.questionId);
    expect(ids).toEqual(expect.arrayContaining(['infersOutputs', 'interactsWithPersons', 'hostingModel']));
    expect(lista.every((s) => s.fuente === 'indicio' && s.tipo !== 'con_cita')).toBe(true);
  });

  it('si la documentación cita a la vez nube y modelos locales, no se propone alojamiento', () => {
    const ingest = makeIngest('x', { readmeContent: 'Funciona con la API de Gemini o con Ollama en servidores propios.' });
    const hosting = hintSuggestions(ingest, makeAnswers()).find((s) => s.questionId === 'hostingModel');
    expect(hosting?.tipo).toBe('no_consta');
  });
});
