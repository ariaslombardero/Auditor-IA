import { GoogleGenAI } from '@google/genai';
import type { ApiConfig, ProviderType, AppIdioma } from '../types';

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  isFree?: boolean;
}

export const PROVIDER_DEFAULT_ENDPOINTS: Record<ProviderType, string> = {
  gemini: '',
  openrouter: 'https://openrouter.ai/api/v1',
  groq: 'https://api.groq.com/openai/v1',
  ollama: 'http://localhost:11434',
  llamacpp: 'http://localhost:8080',
  vllm: 'http://localhost:8000',
  custom: 'http://localhost:1234',
};

export const GEMINI_MODELS: ModelOption[] = [
  { id: 'gemini-flash-latest',      name: 'gemini-flash-latest (⭐ Recomendado general · Siempre actualizado)', isFree: true },
  { id: 'gemini-pro-latest',        name: 'gemini-pro-latest (🧠 Máximo razonamiento · Auditoría jurídica profunda)', isFree: true },
  { id: 'gemini-flash-lite-latest', name: 'gemini-flash-lite-latest (⚡ Ultrarrápido y ligero)', isFree: true },
  { id: 'gemini-2.5-flash',          name: 'Gemini 2.5 Flash (🟢 Estable · Excelente redacción)', isFree: true },
  { id: 'gemini-2.5-pro',            name: 'Gemini 2.5 Pro (🟢 Alta capacidad analítica)', isFree: true },
  { id: 'gemini-2.0-flash',          name: 'Gemini 2.0 Flash (🟢 Rápido y contrastado)', isFree: true },
];

export const OPENROUTER_MODELS: ModelOption[] = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (🟢 Gratis :free)', isFree: true },
  { id: 'deepseek/deepseek-r1:free',             name: 'DeepSeek R1 (🟢 Gratis :free - Razonamiento)', isFree: true },
  { id: 'deepseek/deepseek-chat:free',           name: 'DeepSeek V3 (🟢 Gratis :free)', isFree: true },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (🟢 Gratis :free)', isFree: true },
  { id: 'google/gemini-2.0-flash-exp:free',       name: 'Gemini 2.0 Flash Exp (🟢 Gratis :free)', isFree: true },
  { id: 'qwen/qwen-2.5-72b-instruct:free',       name: 'Qwen 2.5 72B Instruct (🟢 Gratis :free)', isFree: true },
  { id: 'deepseek/deepseek-r1',                  name: 'DeepSeek R1 (Comercial / Pago)' },
  { id: 'anthropic/claude-3.7-sonnet',           name: 'Claude 3.7 Sonnet (Comercial / Pago)' },
];

export const GROQ_MODELS: ModelOption[] = [
  { id: 'llama-3.3-70b-versatile',         name: 'Llama 3.3 70B Versatile (🟢 Gratis)', isFree: true },
  { id: 'deepseek-r1-distill-llama-70b',    name: 'DeepSeek R1 Distill Llama 70B (🟢 Gratis)', isFree: true },
  { id: 'llama-3.1-8b-instant',            name: 'Llama 3.1 8B Instant (🟢 Gratis)', isFree: true },
  { id: 'qwen-2.5-32b',                    name: 'Qwen 2.5 32B (🟢 Gratis)', isFree: true },
  { id: 'mixtral-8x7b-32768',              name: 'Mixtral 8x7B (🟢 Gratis)', isFree: true },
];

export const LOCAL_DEFAULT_MODELS: Record<string, ModelOption[]> = {
  ollama: [
    { id: 'llama3.3', name: 'llama3.3 (70B / 8B)' },
    { id: 'llama3.2', name: 'llama3.2' },
    { id: 'llama3', name: 'llama3 (8B)' },
    { id: 'deepseek-r1:8b', name: 'deepseek-r1:8b' },
    { id: 'deepseek-r1:14b', name: 'deepseek-r1:14b' },
    { id: 'qwen2.5:7b', name: 'qwen2.5:7b' },
    { id: 'qwen2.5:14b', name: 'qwen2.5:14b' },
    { id: 'mistral', name: 'mistral' },
  ],
  llamacpp: [{ id: 'default', name: 'Modelo cargado en llama.cpp' }],
  vllm: [{ id: 'default', name: 'Modelo servido en vLLM' }],
  custom: [{ id: 'default', name: 'Modelo predeterminado del servidor' }],
};

export const LOCAL_BACKENDS: { id: ProviderType; name: string; defaultEndpoint: string; defaultModel: string }[] = [
  { id: 'ollama',   name: 'Ollama',           defaultEndpoint: 'http://localhost:11434', defaultModel: 'llama3.3' },
  { id: 'llamacpp', name: 'llama.cpp',         defaultEndpoint: 'http://localhost:8080',  defaultModel: 'default' },
  { id: 'vllm',     name: 'vLLM',              defaultEndpoint: 'http://localhost:8000',  defaultModel: 'default' },
  { id: 'custom',   name: 'OpenAI Compatible', defaultEndpoint: 'http://localhost:1234',  defaultModel: 'default' },
];

export function getEffectiveEndpoint(config: ApiConfig): string {
  const base = config.endpoint?.trim() || config.baseUrl?.trim() || PROVIDER_DEFAULT_ENDPOINTS[config.provider] || '';
  return base.replace(/\/$/, '');
}

/**
 * Fetch available models dynamically from provider APIs.
 * Supports Gemini, OpenRouter, Groq, and local OpenAI-compatible backends (Ollama, vLLM, etc.).
 * Exact matching implementation from Opositor Transparente.
 */
export async function fetchAvailableModels(
  provider: ProviderType,
  apiKey?: string,
  endpoint?: string
): Promise<ModelOption[]> {
  try {
    if (provider === 'gemini') {
      if (!apiKey?.trim()) return [];
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.models || !Array.isArray(data.models)) return [];

      const freeTierGemini = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

      // Filtrar estrictamente modelos que no son de texto/chat general (audio TTS, generación de imagen, experimentales internos)
      const isNonText = (id: string) => {
        const lower = id.toLowerCase();
        return (
          lower.endsWith('-tts') ||
          lower.endsWith('-image') ||
          lower.includes('image-generation') ||
          lower.includes('banana') ||
          lower.includes('customtools')
        );
      };

      // Aliases canónicos permanentes de Google (nunca cambian de identificador con nuevas versiones)
      const canonicalAliases: ModelOption[] = [
        {
          id: 'gemini-flash-latest',
          name: '⭐ gemini-flash-latest (Recomendado general · Siempre actualizado)',
          description: 'Alias permanente de Google que apunta siempre a la última versión disponible de Flash (ej. 3.8 / 3.7 / 2.5). No cambia con actualizaciones.',
          isFree: true,
        },
        {
          id: 'gemini-pro-latest',
          name: '🧠 gemini-pro-latest (Máximo razonamiento · Auditoría jurídica profunda)',
          description: 'Alias permanente para el modelo Pro más reciente de Google. Ideal para dictámenes jurídicos complejos.',
          isFree: true,
        },
        {
          id: 'gemini-flash-lite-latest',
          name: '⚡ gemini-flash-lite-latest (Ultrarrápido y ligero)',
          description: 'Alias permanente para la versión Lite más eficiente de Google.',
          isFree: true,
        },
      ];

      const fetched = data.models
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => {
          const cleanId = m.name.replace(/^models\//, '');
          const isFree = freeTierGemini.some((f) => cleanId.startsWith(f));
          const badge = isFree ? '🟢 [GRATIS] ' : '';
          const label = m.displayName ? `${badge}${m.displayName} (${cleanId})` : `${badge}${cleanId}`;
          return {
            id: cleanId,
            name: label,
            description: m.description,
            isFree,
          };
        })
        .filter((m: ModelOption) => !isNonText(m.id))
        .filter((m: ModelOption) => !canonicalAliases.some((c) => c.id === m.id));

      const combined = [...canonicalAliases, ...fetched];

      return combined.sort((a: ModelOption, b: ModelOption) => {
        // Priorizar aliases canónicos y modelos Gemini 3.x / 2.5 más recientes
        const score = (id: string) => {
          if (id === 'gemini-flash-latest') return 200;
          if (id === 'gemini-pro-latest') return 195;
          if (id === 'gemini-flash-lite-latest') return 190;
          if (id.includes('3.8-flash')) return 120;
          if (id.includes('3.7-flash')) return 115;
          if (id.includes('3.5-flash-lite')) return 110;
          if (id.includes('3.1-pro-preview')) return 105;
          if (id.includes('3.1-flash-lite')) return 100;
          if (id.includes('3.6-flash')) return 90;
          if (id.includes('3.5-flash')) return 85;
          if (id.includes('2.5-flash')) return 70;
          if (id.includes('2.5-pro')) return 65;
          if (id.includes('2.0-flash')) return 60;
          return 40;
        };
        return score(b.id) - score(a.id);
      });
    }

    if (provider === 'openrouter') {
      const headers: Record<string, string> = {};
      if (apiKey?.trim()) headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      const res = await fetch('https://openrouter.ai/api/v1/models', { headers });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.data || !Array.isArray(data.data)) return [];

      return data.data
        .map((m: any) => {
          const isFree = m.id.endsWith(':free') || (m.pricing && m.pricing.prompt === '0' && m.pricing.completion === '0');
          const ctx = m.context_length ? `[${Math.round(m.context_length / 1024)}k]` : '';
          const badge = isFree ? '🟢 [GRATIS] ' : '';
          return {
            id: m.id,
            name: `${badge}${m.name ? m.name : m.id} ${ctx}`.trim(),
            description: m.description,
            isFree: !!isFree,
          };
        })
        .sort((a: ModelOption, b: ModelOption) => {
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;
          return 0;
        });
    }

    if (provider === 'groq') {
      if (!apiKey?.trim()) return [];
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.data || !Array.isArray(data.data)) return [];

      return data.data
        .map((m: any) => ({
          id: m.id,
          name: m.id,
          description: m.owned_by ? `Groq (${m.owned_by})` : undefined,
        }))
        .sort((a: ModelOption, b: ModelOption) => {
          const score = (id: string) => {
            if (id.includes('llama-3.3')) return 100;
            if (id.includes('deepseek-r1')) return 95;
            if (id.includes('llama-3.1-8b')) return 90;
            return 50;
          };
          return score(b.id) - score(a.id);
        });
    }

    // Local backends
    const effectiveEndpoint = (endpoint?.trim() || PROVIDER_DEFAULT_ENDPOINTS[provider] || '').replace(/\/$/, '');
    if (!effectiveEndpoint) return [];

    const headers: Record<string, string> = {};
    if (apiKey?.trim()) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

    // 1. Try standard OpenAI /v1/models
    try {
      const res = await fetch(`${effectiveEndpoint}/v1/models`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data.map((m: any) => ({
            id: m.id,
            name: m.id,
          }));
        }
      }
    } catch {
      // Continue to try Ollama tags
    }

    // 2. Try Ollama tags endpoint
    try {
      const res = await fetch(`${effectiveEndpoint}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          return data.models.map((m: any) => ({
            id: m.name || m.model,
            name: m.name || m.model,
            description: m.details?.parameter_size ? `${m.details.parameter_size} (${m.details.family || ''})` : undefined,
          }));
        }
      }
    } catch {
      // No reachable endpoint
    }

    return [];
  } catch (err) {
    console.warn('fetchAvailableModels error:', err);
    return [];
  }
}

/**
 * Format API errors into clear user-friendly guidance matching Opositor Transparente
 */
export function formatApiError(error: unknown, lang: AppIdioma = 'castellano'): string {
  const rawMsg = error instanceof Error ? error.message : String(error);

  // 1. Créditos prepago agotados explícitamente en Google Cloud
  if (rawMsg.includes('prepayment credits are depleted')) {
    return lang === 'galego'
      ? '⚠️ Créditos de prepago esgotados en Google AI Studio.\n\nA túa chave está vinculada a un proxecto con facturación prepagada esgotada.\n\n👉 Solución: Crea unha nova chave de balde nun proxecto sen facturación (Free of charge) en https://aistudio.google.com/app/apikey ou emprega o provedor gratuíto Groq.'
      : '⚠️ Créditos de prepago agotados en Google AI Studio.\n\nTu clave está vinculada a un proyecto con facturación prepagada agotada.\n\n👉 Solución: Crea una nueva clave gratuita en un proyecto sin facturación (Free of charge) en https://aistudio.google.com/app/apikey o usa el proveedor gratuito Groq.';
  }

  // 2. Límite de peticiones por minuto o cuota temporal (429 Rate Limit)
  if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
    return lang === 'galego'
      ? '⚠️ Límite de frecuencia por minuto alcanzado (Erro 429: Rate Limit).\n\nO nivel gratuíto ten un límite de peticións por minuto (RPM). Por favor, agarda 10-15 segundos e volve premer en Iniciar Auditoría.'
      : '⚠️ Límite de frecuencia por minuto alcanzado (Error 429: Rate Limit).\n\nEl nivel gratuito tiene un límite de peticiones por minuto (RPM). Por favor, espera 10-15 segundos y vuelve a pulsar en Iniciar Auditoría.';
  }

  // 3. Clave inválida (400 o 403 API_KEY_INVALID)
  if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('invalid api key') || rawMsg.includes('401') || rawMsg.includes('403')) {
    return lang === 'galego'
      ? '⚠️ A clave de API introducida non é válida ou non ten permisos para este modelo. Por favor, revisa a configuración.'
      : '⚠️ La clave de API introducida no es válida o no tiene permisos para este modelo. Por favor, revisa la configuración.';
  }

  // 4. Servidor temporalmente saturado (503 Service Unavailable / High demand)
  if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
    return lang === 'galego'
      ? '⚠️ Os servidores de Google están a experimentar alta demanda temporal (Erro 503).\nPor favor, agarda uns instantes e volve tentar ou selecciona outro modelo no configurador de API (ex. Gemini 2.5 Flash).'
      : '⚠️ Los servidores de Google están experimentando alta demanda temporal (Error 503).\nPor favor, espera unos instantes y vuelve a intentarlo, o selecciona otro modelo en el configurador de API (ej. Gemini 2.5 Flash o Gemini Flash Latest).';
  }

  // 5. Modelo no encontrado (404)
  if (rawMsg.includes('not found') || rawMsg.includes('404') || rawMsg.includes('no longer available')) {
    return lang === 'galego'
      ? '⚠️ O modelo seleccionado non está dispoñible nesta conta ou rexión. Por favor, selecciona outro modelo no selector de API.'
      : '⚠️ El modelo seleccionado no está disponible en esta cuenta o región. Por favor, selecciona otro modelo en el selector de API.';
  }

  // 6. Error de red o CORS
  if (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('ECONNREFUSED')) {
    return lang === 'galego'
      ? '⚠️ Non se puido conectar co servidor. Verifica que estea acendido e que admita peticións CORS.'
      : '⚠️ No se pudo conectar con el servidor. Verifica que esté encendido y que admita peticiones CORS.';
  }

  // Mensaje limpio por defecto
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed.error?.message) return parsed.error.message;
  } catch { /* noop */ }

  return rawMsg;
}

/**
 * Test connection to any configured API provider
 */
export async function testApiConnection(config: ApiConfig): Promise<boolean> {
  try {
    if (config.provider === 'gemini') {
      if (!config.apiKey?.trim()) return false;
      const ai = new GoogleGenAI({ apiKey: config.apiKey.trim() });
      const targetModel = config.model || 'gemini-flash-latest';
      await ai.models.generateContent({
        model: targetModel,
        contents: [{ role: 'user', parts: [{ text: 'test' }] }],
      });
      return true;
    }

    const endpoint = getEffectiveEndpoint(config);
    const headers: Record<string, string> = {};
    if (config.apiKey?.trim()) {
      headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
    }

    // Try /models first
    try {
      const res = await fetch(`${endpoint}/models`, { method: 'GET', headers });
      if (res.ok) return true;
    } catch {
      // ignore and try fallback
    }

    // Fallback: minimal chat completion probe
    const compRes = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 2,
      }),
    });

    return compRes.ok;
  } catch {
    return false;
  }
}

/**
 * Unified API execution
 */
export async function callApi(
  config: ApiConfig,
  prompt: string,
  systemInstruction: string,
): Promise<string> {
  if (config.provider === 'gemini') {
    return callGemini(config, prompt, systemInstruction);
  } else {
    return callOpenAICompatible(config, prompt, systemInstruction);
  }
}

/**
 * Gemini API call:
 * Respeto estricto al modelo seleccionado por el usuario.
 * Sin fallbacks a modelos obsoletos. Reintento idéntico tras 2.5s en 429/503.
 */
async function callGemini(
  config: ApiConfig,
  prompt: string,
  systemInstruction: string,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: config.apiKey! });
  const modelName = config.model || 'gemini-flash-latest';

  const execute = async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        temperature: config.temperature ?? 0.2,
      },
    });
    return response.text || '';
  };

  try {
    return await execute();
  } catch (err: any) {
    const rawMsg = String(err?.message || err);
    console.warn('[callGemini] Error en llamada a Gemini:', rawMsg);

    // Si es un error de rate limit (429) o servidor sobrecargado (503), esperar 2.5s y reintentar con el MISMO modelo
    if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
      console.warn('Petición limitada o servidor ocupado, esperando 2.5s para reintentar con el mismo modelo...');
      await new Promise((r) => setTimeout(r, 2500));
      return await execute();
    }

    throw err;
  }
}

async function callOpenAICompatible(
  config: ApiConfig,
  prompt: string,
  systemInstruction: string,
): Promise<string> {
  const endpoint = getEffectiveEndpoint(config);
  const url = `${endpoint}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey?.trim()) {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }

  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';
    headers['X-Title'] = 'Auditor IA Sector Público';
  }

  const body = {
    model: config.model || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ],
    temperature: config.temperature ?? 0.2,
    stream: false,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errDetail = '';
    try {
      const errJson = await response.json();
      errDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errDetail = await response.text();
    }
    throw new Error(`Error ${config.provider} (${response.status}): ${errDetail || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
