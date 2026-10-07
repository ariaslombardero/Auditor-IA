import type { ApiConfig, Provider } from '../types';

const PROVEEDORES_VALIDOS: Provider[] = ['gemini', 'compatible', 'ollama', 'llamacpp', 'vllm'];

/**
 * Convierte configuraciones guardadas por versiones anteriores
 * (groq, openrouter y custom eran proveedores con nombre propio; la URL se guardaba a veces en baseUrl).
 */
export function migrarConfig(bruto: unknown): ApiConfig | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const c = bruto as Record<string, unknown>;
  const model = typeof c.model === 'string' ? c.model : '';
  const apiKey = typeof c.apiKey === 'string' ? c.apiKey : undefined;
  const endpoint = typeof c.endpoint === 'string' && c.endpoint.trim()
    ? c.endpoint
    : typeof c.baseUrl === 'string' && c.baseUrl.trim() ? c.baseUrl : undefined;

  switch (c.provider) {
    case 'groq':
      return { provider: 'compatible', model, apiKey, endpoint: 'https://api.groq.com/openai/v1' };
    case 'openrouter':
      return { provider: 'compatible', model, apiKey, endpoint: 'https://openrouter.ai/api/v1' };
    case 'custom': {
      // El antiguo «custom» apuntaba a la raíz del servidor; la API compatible está en /v1.
      const base = endpoint?.replace(/\/+$/, '');
      return { provider: 'compatible', model, apiKey, endpoint: base && !/\/v1$/.test(base) ? `${base}/v1` : base };
    }
    default:
      if (PROVEEDORES_VALIDOS.includes(c.provider as Provider)) {
        return { provider: c.provider as Provider, model, apiKey, endpoint };
      }
      return null;
  }
}
