import type { ApiConfig, Provider, AppIdioma } from '../types';
import { conReintentos, ErrorProveedor, leerRetryAfter } from './proveedores/reintentos';
import { cuerpoPeticionOllama } from './proveedores/ollama';
import { quitarRazonamiento } from './proveedores/sse';

/**
 * Conector de proveedores de IA. Misma arquitectura que Opositor transparente:
 * sin servidor propio, la clave viaja solo al proveedor elegido.
 * - Gemini, mediante el SDK oficial (clave en cabecera, nunca en la URL).
 * - Cualquier API compatible con OpenAI: la URL decide a quién se envía la clave.
 * - Servidores locales: Ollama (API nativa), llama.cpp y vLLM.
 */

/** URL base por defecto de cada proveedor (API compatible con OpenAI, terminada en /v1) */
export const PROVIDER_DEFAULT_ENDPOINTS: Record<Provider, string> = {
  gemini: '',
  compatible: 'https://api.openai.com/v1',
  ollama: 'http://localhost:11434/v1',
  llamacpp: 'http://localhost:8080/v1',
  vllm: 'http://localhost:8000/v1',
};

export const PROVEEDORES_LOCALES: Provider[] = ['ollama', 'llamacpp', 'vllm'];

/**
 * Normaliza una URL base a la forma `…/v1` sin barra final.
 * Los servidores locales exponen la API compatible en /v1 (Ollama, llama.cpp, vLLM).
 */
export function normalizarBase(provider: Provider, endpoint?: string): string {
  let base = (endpoint?.trim() || PROVIDER_DEFAULT_ENDPOINTS[provider] || '').replace(/\/+$/, '');
  if (PROVEEDORES_LOCALES.includes(provider) && !/\/v1$/.test(base)) {
    base = `${base}/v1`;
  }
  return base;
}

/** URL base efectiva de una configuración */
export function getEndpoint(config: ApiConfig): string {
  return normalizarBase(config.provider, config.endpoint);
}

/** Origen (esquema + host + puerto) de una URL, o cadena vacía si no es válida */
export function origenDe(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

/** Descripción legible del proveedor para la procedencia de los documentos (sin claves) */
export function describirProveedor(config: ApiConfig): string {
  const origen = origenDe(getEndpoint(config)) || 'URL no válida';
  // Un servidor local en su dirección por defecto se describe como «local»; si no, se indica dónde está.
  const sitio = origen === origenDe(PROVIDER_DEFAULT_ENDPOINTS[config.provider]) ? 'local' : origen;
  switch (config.provider) {
    case 'gemini': return 'Google Gemini';
    case 'compatible': return `API compatible con OpenAI (${origen})`;
    case 'ollama': return `Ollama (${sitio})`;
    case 'llamacpp': return `llama.cpp (${sitio})`;
    case 'vllm': return `vLLM (${sitio})`;
  }
}

export interface OpcionesLlamada {
  /** Permite cancelar la petición en curso */
  senal?: AbortSignal;
  /** Aviso antes de esperar para reintentar (límite de peticiones, servidor saturado) */
  onEspera?: (ms: number, intento: number) => void;
}

/**
 * Llamada unificada. Devuelve el texto completo de la respuesta, sin bloques de razonamiento.
 * Reintenta los errores transitorios (429, 503…) respetando la espera que indique el proveedor.
 */
export async function callApi(
  config: ApiConfig,
  prompt: string,
  systemInstruction: string,
  opciones: OpcionesLlamada = {},
): Promise<string> {
  const texto = await conReintentos(
    () => config.provider === 'gemini'
      ? callGemini(config, prompt, systemInstruction, opciones.senal)
      : config.provider === 'ollama'
        ? callOllamaNativo(config, prompt, systemInstruction, opciones.senal)
        : callOpenAICompatible(config, prompt, systemInstruction, opciones.senal),
    { senal: opciones.senal, onEspera: opciones.onEspera },
  );
  return quitarRazonamiento(texto);
}

/** El SDK de Gemini solo se descarga cuando se usa ese proveedor */
async function clienteGemini(apiKey: string) {
  const { GoogleGenAI } = await import('@google/genai');
  return new GoogleGenAI({ apiKey });
}

async function callGemini(config: ApiConfig, prompt: string, systemInstruction: string, senal?: AbortSignal): Promise<string> {
  const ai = await clienteGemini(config.apiKey?.trim() || '');
  try {
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-flash-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction, temperature: 0.2, abortSignal: senal },
    });
    return response.text || '';
  } catch (err: unknown) {
    const e = err as { message?: string; status?: unknown };
    throw new ErrorProveedor(String(e?.message || err), typeof e?.status === 'number' ? e.status : undefined);
  }
}

/** Ollama por su API nativa, que permite fijar la ventana de contexto (num_ctx). */
async function callOllamaNativo(config: ApiConfig, prompt: string, systemInstruction: string, senal?: AbortSignal): Promise<string> {
  const raiz = getEndpoint(config).replace(/\/v1$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey?.trim()) headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  const response = await fetch(`${raiz}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(cuerpoPeticionOllama(config.model, systemInstruction, prompt, false)),
    signal: senal,
  });
  if (!response.ok) {
    const detalle = await response.text().catch(() => '');
    throw new ErrorProveedor(`Error de Ollama (${response.status}): ${detalle || response.statusText}`, response.status);
  }
  const data = await response.json();
  if (data.error) throw new ErrorProveedor(`Error de Ollama: ${data.error}`);
  return data.message?.content ?? '';
}

/** APIs compatibles con OpenAI (nube, red interna o servidor local). */
async function callOpenAICompatible(config: ApiConfig, prompt: string, systemInstruction: string, senal?: AbortSignal): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey?.trim()) headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;

  const response = await fetch(`${getEndpoint(config)}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 8192,
      stream: false,
    }),
    signal: senal,
  });

  if (!response.ok) {
    let errDetail = '';
    try {
      const errJson = await response.json();
      errDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errDetail = await response.text().catch(() => '');
    }
    throw new ErrorProveedor(
      `Error del proveedor ${config.provider} (${response.status}): ${errDetail || response.statusText}`,
      response.status,
      leerRetryAfter(response.headers.get('retry-after')),
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/** Comprueba la conexión con el proveedor configurado */
export async function testApiConnection(config: ApiConfig): Promise<boolean> {
  try {
    if (config.provider === 'gemini') {
      if (!config.apiKey?.trim()) return false;
      const ai = await clienteGemini(config.apiKey.trim());
      await ai.models.generateContent({
        model: config.model || 'gemini-flash-lite-latest',
        contents: 'test',
      });
      return true;
    }

    const endpoint = getEndpoint(config);
    const headers: Record<string, string> = {};
    if (config.apiKey?.trim()) headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;

    try {
      const res = await fetch(`${endpoint}/models`, { method: 'GET', headers });
      if (res.ok) return true;
    } catch {
      // Se prueba con una petición mínima
    }

    const probe = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 2 }),
    });
    return probe.ok;
  } catch {
    return false;
  }
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

/**
 * Lista los modelos disponibles de un proveedor.
 * La clave solo se envía al host del propio proveedor: `apiKey` debe ser la
 * clave asociada a ese endpoint, nunca la de otro servicio.
 */
export async function fetchAvailableModels(provider: Provider, apiKey?: string, endpoint?: string): Promise<ModelOption[]> {
  try {
    if (provider === 'gemini') {
      if (!apiKey?.trim()) return [];
      // Clave en cabecera, no en la URL: las URL quedan en historiales y registros.
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
        headers: { 'x-goog-api-key': apiKey.trim() },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.models || !Array.isArray(data.models)) return [];

      const isNonText = (id: string) => {
        const lower = id.toLowerCase();
        return lower.endsWith('-tts') || lower.endsWith('-image') || lower.includes('image-generation')
          || lower.includes('embedding') || lower.includes('banana') || lower.includes('customtools');
      };

      // Alias permanentes de Google (apuntan a la versión vigente). Solo se ofrecen si figuran
      // en la lista de esta clave: el selector muestra únicamente lo que la clave puede usar.
      const canonicalAliases: Record<string, string> = {
        'gemini-flash-latest': 'gemini-flash-latest (alias de la última versión Flash)',
        'gemini-pro-latest': 'gemini-pro-latest (alias de la última versión Pro)',
        'gemini-flash-lite-latest': 'gemini-flash-lite-latest (alias de la última versión Flash-Lite)',
      };

      const fetched: ModelOption[] = data.models
        .filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: { name: string; displayName?: string; description?: string }) => {
          const cleanId = m.name.replace(/^models\//, '');
          const name = canonicalAliases[cleanId] ?? (m.displayName ? `${m.displayName} (${cleanId})` : cleanId);
          return { id: cleanId, name, description: m.description };
        })
        .filter((m: ModelOption) => !isNonText(m.id));

      const esAlias = (m: ModelOption) => m.id in canonicalAliases;
      return [...fetched.filter(esAlias), ...fetched.filter((m) => !esAlias(m))];
    }

    const base = normalizarBase(provider, endpoint);
    if (!base) return [];
    const headers: Record<string, string> = {};
    if (apiKey?.trim()) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

    // 1. Listado estándar /v1/models
    try {
      const res = await fetch(`${base}/models`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          return data.data.map((m: { id: string }) => ({ id: m.id, name: m.id }));
        }
      }
    } catch {
      // Se intenta el listado propio de Ollama
    }

    // 2. Listado nativo de Ollama (/api/tags, sin el sufijo /v1)
    if (provider === 'ollama') {
      try {
        const res = await fetch(`${base.replace(/\/v1$/, '')}/api/tags`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.models) && data.models.length > 0) {
            return data.models.map((m: { name?: string; model?: string; details?: { parameter_size?: string; family?: string } }) => ({
              id: m.name || m.model || '',
              name: m.name || m.model || '',
              description: m.details?.parameter_size ? `${m.details.parameter_size} (${m.details.family || ''})` : undefined,
            }));
          }
        }
      } catch {
        // Servidor no accesible
      }
    }

    return [];
  } catch (err) {
    console.warn('fetchAvailableModels error:', err);
    return [];
  }
}

/** Mensaje comprensible para los errores de los proveedores. */
export function formatApiError(error: unknown, lang: AppIdioma = 'castellano'): string {
  const rawMsg = error instanceof Error ? error.message : String(error);
  const gl = lang === 'galego';

  if ((error as { name?: string })?.name === 'AbortError') {
    return gl ? 'Operación cancelada.' : 'Operación cancelada.';
  }
  if (rawMsg.includes('prepayment credits are depleted')) {
    return gl
      ? '⚠️ Créditos de prepago esgotados en Google AI Studio. Crea unha chave nun proxecto sen facturación en https://aistudio.google.com/app/apikey ou configura outro provedor.'
      : '⚠️ Créditos de prepago agotados en Google AI Studio. Crea una clave en un proyecto sin facturación en https://aistudio.google.com/app/apikey o configura otro proveedor.';
  }
  if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
    return gl
      ? '⚠️ Límite de peticións alcanzado (erro 429). Agarda uns segundos e volve tentar.'
      : '⚠️ Límite de peticiones alcanzado (error 429). Espera unos segundos y vuelve a intentarlo.';
  }
  if (rawMsg.includes('API_KEY_INVALID') || /invalid api key/i.test(rawMsg) || rawMsg.includes('401') || rawMsg.includes('403')) {
    return gl
      ? '⚠️ A chave de API non é válida ou non ten permisos para este modelo. Revisa a configuración.'
      : '⚠️ La clave de API no es válida o no tiene permisos para este modelo. Revisa la configuración.';
  }
  if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
    return gl
      ? '⚠️ O provedor está saturado (erro 503). Agarda uns instantes ou escolle outro modelo.'
      : '⚠️ El proveedor está saturado (error 503). Espera unos instantes o elige otro modelo.';
  }
  if (rawMsg.includes('not found') || rawMsg.includes('404') || rawMsg.includes('no longer available')) {
    return gl
      ? '⚠️ O modelo seleccionado non está dispoñible nesta conta ou rexión. Escolle outro modelo.'
      : '⚠️ El modelo seleccionado no está disponible en esta cuenta o región. Elige otro modelo.';
  }
  if (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('ECONNREFUSED')) {
    return gl
      ? '⚠️ Non se puido conectar co servidor. Comproba que estea en execución e que admita peticións desde o navegador (CORS).'
      : '⚠️ No se pudo conectar con el servidor. Comprueba que esté en ejecución y que admita peticiones desde el navegador (CORS).';
  }
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed.error?.message) return parsed.error.message;
  } catch { /* texto no JSON */ }
  return rawMsg;
}
