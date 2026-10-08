import type { AnswerSource, ApiConfig, AppIngestData, FullAuditState, LegalEnrichmentAnswers } from '../types';
import { callApi, describirProveedor } from './apiService';
import { extractJson } from './adversarialSimulator';
import { aiUsageHint, annexIIIHints, cloudProviderHints, normalizeText, prohibitedPracticeHints } from './documentHints';
import { getAnswerValue, isPending, questionById, setAnswerValue, type InterviewQuestion } from './interviewCatalog';
import { restriccionEnvio } from './proveedorEfectivo';
import { inputsKey } from './validations';

/**
 * Sugerencias de respuesta para la entrevista. Nunca se aplican solas: la persona las pide
 * y decide si las acepta. La cita que da el modelo la comprueba la aplicación contra la
 * documentación aportada en el paso 1; si no aparece literalmente, la sugerencia es «inferida».
 */

export type SuggestionKind = 'con_cita' | 'inferida' | 'no_consta' | 'orientacion';

export interface AnswerSuggestion {
  questionId: string;
  /** Valor propuesto (no hay en «no consta» ni en «orientación»). */
  valor?: string;
  tipo: SuggestionKind;
  /** Fragmento de la documentación que la respalda (comprobado si el tipo es «con_cita»). */
  cita?: string;
  razonamiento: string;
  fuente: 'ia' | 'indicio';
  /** Proveedor y modelo que la generaron (solo IA). */
  modelo?: string;
  /** Huella de la documentación con la que se generó: si cambia, la sugerencia queda desfasada. */
  ingestKey: string;
}

/**
 * Un «no» en estas preguntas nunca se da por respaldado: que la documentación no mencione
 * una práctica prohibida, un dato sensible o un perfilado no prueba que no exista.
 */
const NO_SIEMPRE_INFERIDO = new Set([
  'performsProfiling',
  'processesSpecialCategoryData',
  'processesCriminalData',
  'processesSolvencyData',
  'biometricIdentification',
  'geneticData',
  'systematicMonitoring',
  'vulnerableSubjects',
  'preventsRightsOrService',
]);

const LONGITUD_MINIMA_CITA = 12;
const MAX_DOCUMENTACION = 24000;

/** Huella de la documentación aportada en el paso 1. */
export function ingestKey(ingest: AppIngestData): string {
  return inputsKey({ ingest, answers: {} as LegalEnrichmentAnswers });
}

/** Texto de la documentación del paso 1, con sus apartados. */
export function documentationText(ingest: AppIngestData): string {
  return [
    `NOMBRE: ${ingest.appName}`,
    `DESCRIPCIÓN: ${ingest.appDescription}`,
    ingest.techStack ? `TECNOLOGÍA Y DEPENDENCIAS: ${ingest.techStack}` : '',
    ingest.readmeContent ? `README:\n${ingest.readmeContent}` : '',
    ingest.agentsMdContent ? `AGENTS.md:\n${ingest.agentsMdContent}` : '',
    ingest.systemPrompt ? `PROMPT DEL SISTEMA:\n${ingest.systemPrompt}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

const compactar = (t: string) => normalizeText(t).replace(/[«»"“”'‘’`*_]/g, '').replace(/\s+/g, ' ').trim();

/** Comprueba que la cita aparece literalmente (salvo mayúsculas, tildes y espacios) en la documentación. */
export function verifyQuote(cita: string | undefined, ingest: AppIngestData): boolean {
  if (!cita) return false;
  const doc = compactar(documentationText(ingest));
  const fragmentos = cita.split(/…|\.\.\./).map(compactar).filter(Boolean);
  if (!fragmentos.length || fragmentos.some((f) => f.length < LONGITUD_MINIMA_CITA)) return false;
  return fragmentos.every((f) => doc.includes(f));
}

/**
 * Clasifica una propuesta. Devuelve null si el valor no es una opción válida de la pregunta.
 */
export function classifySuggestion(
  q: InterviewQuestion,
  valor: string | undefined,
  cita: string | undefined,
  razonamiento: string,
  ingest: AppIngestData,
  origen: { fuente: 'ia' | 'indicio'; modelo?: string } = { fuente: 'ia' }
): AnswerSuggestion | null {
  const base = { questionId: q.id, razonamiento: razonamiento || 'Sin explicación.', fuente: origen.fuente, modelo: origen.modelo, ingestKey: ingestKey(ingest) };
  if (q.sugerible === 'orientacion') return { ...base, tipo: 'orientacion' };
  if (!valor || valor === q.valorDesconocido || valor === 'desconocido' || valor === 'desconocida') return { ...base, tipo: 'no_consta' };

  const validos = q.tipo === 'tri' ? ['si', 'no'] : (q.opciones ?? []).map((o) => o.value).filter((v) => v !== q.valorDesconocido);
  if (q.tipo !== 'texto' && !validos.includes(valor)) return null;

  const citaComprobada = verifyQuote(cita, ingest);
  const noPrudente = valor === 'no' && (q.id.startsWith('prohibitedPractices.') || NO_SIEMPRE_INFERIDO.has(q.id));
  return {
    ...base,
    valor,
    cita: cita?.trim() || undefined,
    tipo: citaComprobada && !noPrudente ? 'con_cita' : 'inferida',
  };
}

/** Sugerencias que pueden aceptarse todas a la vez: solo las de cita comprobada. */
export function bulkAcceptable(sugerencias: AnswerSuggestion[]): AnswerSuggestion[] {
  return sugerencias.filter((s) => s.tipo === 'con_cita' && s.valor !== undefined);
}

/** Acepta una sugerencia: fija la respuesta y registra su origen. */
export function acceptSuggestion(state: FullAuditState, s: AnswerSuggestion, fecha = new Date().toISOString()): FullAuditState {
  if (s.valor === undefined || s.tipo === 'no_consta' || s.tipo === 'orientacion') return state;
  const source: AnswerSource = {
    origen: s.fuente,
    tipo: s.tipo === 'con_cita' ? 'con_cita' : 'inferida',
    fecha,
    ...(s.modelo ? { modelo: s.modelo } : {}),
    ...(s.cita ? { cita: s.cita } : {}),
  };
  return {
    ...state,
    answers: setAnswerValue(state.answers, s.questionId, s.valor),
    answerSources: { ...(state.answerSources ?? {}), [s.questionId]: source },
  };
}

/** Si la persona cambia una respuesta que procedía de una sugerencia, el origen vuelve a ser suyo. */
export function sourcesAfterManualChange(
  prev: LegalEnrichmentAnswers,
  next: LegalEnrichmentAnswers,
  sources: Record<string, AnswerSource> | undefined
): Record<string, AnswerSource> {
  const resultado: Record<string, AnswerSource> = {};
  for (const [id, source] of Object.entries(sources ?? {})) {
    if (getAnswerValue(prev, id) === getAnswerValue(next, id)) resultado[id] = source;
  }
  return resultado;
}

/** Lee la respuesta del modelo. Descarta lo mal formado, lo no pedido y los valores no válidos. */
export function parseSuggestionResponse(
  texto: string,
  pedidas: string[],
  ingest: AppIngestData,
  origen: { fuente: 'ia'; modelo: string }
): { sugerencias: AnswerSuggestion[]; descartadas: number; error?: string } {
  const json = extractJson(texto);
  const lista = json && Array.isArray(json.sugerencias) ? (json.sugerencias as Array<Record<string, unknown>>) : null;
  if (!lista) return { sugerencias: [], descartadas: 0, error: 'La respuesta del modelo no tiene el formato esperado; no se ha aplicado ninguna sugerencia.' };
  const sugerencias: AnswerSuggestion[] = [];
  let descartadas = 0;
  for (const item of lista) {
    const id = String(item.id ?? '');
    const q = questionById(id);
    if (!q || !pedidas.includes(id)) {
      descartadas++;
      continue;
    }
    const s = classifySuggestion(q, item.valor === undefined || item.valor === null ? undefined : String(item.valor), typeof item.cita === 'string' ? item.cita : undefined, String(item.razonamiento ?? ''), ingest, origen);
    if (s) sugerencias.push(s);
    else descartadas++;
  }
  return { sugerencias, descartadas };
}

const SISTEMA = `Ayudas a una persona de la Administración Pública a contestar una entrevista sobre una aplicación con inteligencia artificial.
Trabajas SOLO con la documentación que se te da. No inventes nada.
Para cada pregunta devuelve:
- "valor": una de las opciones indicadas, o "desconocido" si la documentación no permite saberlo;
- "cita": una frase COPIADA LITERALMENTE de la documentación que respalde el valor (máximo 200 caracteres); vacía si no hay;
- "razonamiento": una o dos frases en lenguaje sencillo.
Que la documentación no mencione algo NO prueba que no exista: en ese caso responde "desconocido" o explica que es una inferencia.
En las preguntas marcadas como DECISIÓN DE LA ENTIDAD no propongas valor: explica en "razonamiento" qué debe valorar la entidad en este caso concreto.
Responde únicamente con un objeto JSON: {"sugerencias": [{"id": "...", "valor": "...", "cita": "...", "razonamiento": "..."}]}`;

function describirPregunta(q: InterviewQuestion): string {
  const opciones =
    q.tipo === 'tri'
      ? 'si | no | desconocido'
      : (q.opciones ?? []).map((o) => `${o.value} (${o.label})`).join(' | ');
  return [
    `- id: ${q.id}${q.sugerible === 'orientacion' ? '  [DECISIÓN DE LA ENTIDAD]' : ''}`,
    `  pregunta: ${q.enunciado}`,
    q.tipo !== 'texto' ? `  opciones: ${opciones}` : '',
    q.ayuda ? `  definición: ${q.ayuda.queSignifica}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export interface SuggestOutcome {
  sugerencias: AnswerSuggestion[];
  descartadas: number;
  error?: string;
  /** Documentación recortada por exceder el tamaño máximo. */
  recortada?: boolean;
}

/**
 * Pide sugerencias al modelo configurado, un bloque de preguntas por llamada.
 * No modifica las respuestas: solo devuelve propuestas.
 */
export async function suggestWithAI(
  config: ApiConfig,
  ingest: AppIngestData,
  answers: LegalEnrichmentAnswers,
  questionIds: string[],
  onProgress?: (hechas: number, total: number) => void
): Promise<SuggestOutcome> {
  const restriccion = restriccionEnvio(config, answers);
  if (!restriccion.permitido) return { sugerencias: [], descartadas: 0, error: restriccion.motivo };

  const preguntas = questionIds.map(questionById).filter((q): q is InterviewQuestion => Boolean(q));
  const bloques = [...new Set(preguntas.map((q) => q.bloque))];
  const docCompleta = documentationText(ingest);
  const recortada = docCompleta.length > MAX_DOCUMENTACION;
  const doc = recortada ? `${docCompleta.slice(0, MAX_DOCUMENTACION)}\n[… documentación recortada]` : docCompleta;
  const modelo = `${describirProveedor(config)} · ${config.model}`;

  const sugerencias: AnswerSuggestion[] = [];
  let descartadas = 0;
  const errores: string[] = [];

  for (let i = 0; i < bloques.length; i++) {
    const delBloque = preguntas.filter((q) => q.bloque === bloques[i]);
    const prompt = `DOCUMENTACIÓN APORTADA:\n"""\n${doc}\n"""\n\nPREGUNTAS:\n${delBloque.map(describirPregunta).join('\n')}`;
    try {
      const respuesta = await callApi(config, prompt, SISTEMA);
      const r = parseSuggestionResponse(respuesta, delBloque.map((q) => q.id), ingest, { fuente: 'ia', modelo });
      sugerencias.push(...r.sugerencias);
      descartadas += r.descartadas;
      if (r.error) errores.push(r.error);
    } catch (err) {
      errores.push(`No se pudieron obtener sugerencias del bloque ${bloques[i]}: ${(err as Error)?.message || 'error del proveedor'}.`);
    }
    onProgress?.(i + 1, bloques.length);
  }

  return { sugerencias, descartadas, recortada, ...(errores.length ? { error: errores.join(' ') } : {}) };
}

const CHAT = /\b(chatbot|chat|asistente conversacional|conversacional|conversa)\b/;
const LOCAL = /\b(ollama|vllm|llama\.cpp|llamacpp|modelos? locales?|on-premise|servidores? propios?)\b/;

/**
 * Sugerencias sin IA a partir de los indicios de la documentación. Son siempre «inferidas»:
 * una palabra clave orienta, pero no respalda por sí sola una respuesta.
 */
export function hintSuggestions(ingest: AppIngestData, answers: LegalEnrichmentAnswers): AnswerSuggestion[] {
  const key = ingestKey(ingest);
  const texto = normalizeText(documentationText(ingest));
  const out: AnswerSuggestion[] = [];
  const add = (questionId: string, valor: string | undefined, cita: string | undefined, razonamiento: string, tipo: SuggestionKind = 'inferida') => {
    if (!isPending(answers, questionId)) return;
    out.push({ questionId, valor, cita, razonamiento, tipo, fuente: 'indicio', ingestKey: key });
  };

  const ai = aiUsageHint(ingest);
  if (ai) {
    add('infersOutputs', 'si', ai.evidence, 'La documentación menciona un modelo de IA o de lenguaje.');
    add('generatesSyntheticContent', 'si', ai.evidence, 'Los modelos de lenguaje suelen generar texto; confirme si el sistema redacta contenido.');
  }
  const chat = texto.match(CHAT);
  if (chat) add('interactsWithPersons', 'si', chat[0], 'La documentación habla de un chat o asistente conversacional.');

  const area = annexIIIHints(ingest)[0];
  if (area) add('annexIIIArea', area.target.replace('annexIII:', ''), area.evidence, 'Una palabra clave sugiere este ámbito del Anexo III. Puede ser un falso positivo: compruébelo.');
  for (const p of prohibitedPracticeHints(ingest)) {
    add(`prohibitedPractices.${p.target}`, 'si', p.evidence, 'La documentación contiene una expresión asociada a esta práctica prohibida. Compruebe si de verdad la realiza.');
  }

  const nube = cloudProviderHints(ingest);
  const local = texto.match(LOCAL);
  if (nube.length && local) {
    add('hostingModel', undefined, undefined, `La documentación cita servicios en la nube (${nube.map((h) => h.target).join(', ')}) y modelos locales. Indique cuál procesará los datos reales.`, 'no_consta');
  } else if (nube.length) {
    add('hostingModel', 'us_hyperscaler', nube[0].evidence, `La documentación cita ${nube.map((h) => h.target).join(', ')}. Si hay contrato que garantice el tratamiento en la UE, elija «nube de la UE».`);
  } else if (local) {
    add('hostingModel', 'local_on_premise', local[0], 'La documentación menciona modelos ejecutados en servidores propios.');
  }
  return out;
}
