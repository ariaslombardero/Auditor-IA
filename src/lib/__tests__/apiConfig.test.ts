import { afterEach, describe, expect, it, vi } from 'vitest';
import { callApi, describirProveedor, fetchAvailableModels, normalizarBase, origenDe } from '../apiService';
import { migrarConfig } from '../migracionConfig';
import { cargarConfigInicial, guardarConfig, LEGACY_STORAGE_KEY, STORAGE_KEY } from '../almacenConfig';
import { registroAsistencia, restriccionEnvio, ubicacionProveedor } from '../proveedorEfectivo';
import { evaluateRulesDeterministically } from '../auditEngine';
import { answeredAnswers, makeIngest } from '../../test/fixtures';
import type { ApiConfig } from '../../types';

/**
 * Selección de proveedor y modelo (misma arquitectura que Opositor transparente):
 * Gemini, API compatible con OpenAI, Ollama, llama.cpp y vLLM, sin servidor propio.
 * Las claves de estas pruebas son cadenas sintéticas sin validez.
 */

const FAKE_KEY = 'sk-' + 'Z'.repeat(40);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Direcciones de los proveedores', () => {
  it('los servidores locales se normalizan a …/v1 y los remotos se respetan', () => {
    expect(normalizarBase('ollama', 'http://localhost:11434')).toBe('http://localhost:11434/v1');
    expect(normalizarBase('vllm', 'http://10.0.0.5:8000/v1/')).toBe('http://10.0.0.5:8000/v1');
    expect(normalizarBase('compatible', 'https://api.mistral.ai/v1')).toBe('https://api.mistral.ai/v1');
    expect(normalizarBase('llamacpp')).toBe('http://localhost:8080/v1');
  });

  it('origenDe devuelve el origen o cadena vacía si la URL no es válida', () => {
    expect(origenDe('https://openrouter.ai/api/v1')).toBe('https://openrouter.ai');
    expect(origenDe('no es una url')).toBe('');
  });

  it('describirProveedor identifica el destino sin incluir la clave', () => {
    const texto = describirProveedor({ provider: 'compatible', endpoint: 'https://api.mistral.ai/v1', model: 'mistral-large-latest', apiKey: FAKE_KEY });
    expect(texto).toContain('https://api.mistral.ai');
    expect(texto).not.toContain(FAKE_KEY);
    expect(describirProveedor({ provider: 'ollama', model: 'qwen2.5:32b' })).toBe('Ollama (local)');
  });
});

describe('Migración de configuraciones guardadas por versiones anteriores', () => {
  it('OpenRouter y Groq pasan a «compatible» con su URL', () => {
    expect(migrarConfig({ provider: 'openrouter', model: 'm', apiKey: 'k' })).toEqual({ provider: 'compatible', model: 'm', apiKey: 'k', endpoint: 'https://openrouter.ai/api/v1' });
    expect(migrarConfig({ provider: 'groq', model: 'm' })?.endpoint).toBe('https://api.groq.com/openai/v1');
  });

  it('«custom» apuntaba a la raíz del servidor: se añade /v1; también se lee el antiguo baseUrl', () => {
    expect(migrarConfig({ provider: 'custom', model: 'm', endpoint: 'http://localhost:1234' })?.endpoint).toBe('http://localhost:1234/v1');
    expect(migrarConfig({ provider: 'ollama', model: 'm', baseUrl: 'http://10.1.1.1:11434' })?.endpoint).toBe('http://10.1.1.1:11434');
  });

  it('descarta proveedores desconocidos y datos malformados', () => {
    expect(migrarConfig({ provider: 'desconocido', model: 'm' })).toBeNull();
    expect(migrarConfig('texto')).toBeNull();
    expect(migrarConfig(null)).toBeNull();
  });
});

describe('Custodia de la clave en el navegador (SEG-04)', () => {
  const config: ApiConfig = { provider: 'gemini', apiKey: 'AIzaSy' + 'Q'.repeat(33), model: 'gemini-flash-latest' };

  it('por defecto la clave solo se guarda durante la sesión (sessionStorage)', () => {
    guardarConfig(config, false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(cargarConfigInicial()).toEqual({ config, recordar: false });
  });

  it('solo se guarda en el equipo (localStorage) si se marca «Recordar»', () => {
    guardarConfig(config, true);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(cargarConfigInicial().recordar).toBe(true);
  });

  it('borrar la configuración la elimina de ambos almacenes', () => {
    guardarConfig(config, true);
    guardarConfig(null, false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(cargarConfigInicial().config).toBeNull();
  });

  it('una clave guardada en claro por la versión anterior pasa a la sesión y se borra del equipo', () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ provider: 'groq', apiKey: FAKE_KEY, model: 'llama-3.3-70b-versatile' }));
    const { config: migrada, recordar } = cargarConfigInicial();
    expect(recordar).toBe(false);
    expect(migrada?.provider).toBe('compatible');
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('compatible');
  });

  it('si el almacenamiento falla, la configuración queda solo en memoria sin lanzar errores', () => {
    (localStorage as unknown as { failWrites: boolean }).failWrites = true;
    (sessionStorage as unknown as { failWrites: boolean }).failWrites = true;
    expect(() => guardarConfig(config, true)).not.toThrow();
  });
});

describe('Llamadas a los proveedores', () => {
  it('API compatible: /chat/completions, clave en cabecera y sin bloques de razonamiento', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ choices: [{ message: { content: '<think>borrador</think>Respuesta' }, finish_reason: 'stop' }] }), { status: 200 });
    }));
    const texto = await callApi({ provider: 'compatible', endpoint: 'https://api.mistral.ai/v1', apiKey: FAKE_KEY, model: 'm' }, 'p', 's');
    expect(texto).toBe('Respuesta');
    expect(calls[0].url).toBe('https://api.mistral.ai/v1/chat/completions');
    expect(calls[0].url).not.toContain(FAKE_KEY);
    expect((calls[0].init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${FAKE_KEY}`);
  });

  it('Ollama usa su API nativa (/api/chat) para fijar la ventana de contexto', async () => {
    const calls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      calls.push(String(url));
      return new Response(JSON.stringify({ message: { content: 'ok' }, done: true, done_reason: 'stop' }), { status: 200 });
    }));
    const texto = await callApi({ provider: 'ollama', endpoint: 'http://localhost:11434', model: 'qwen2.5:32b' }, 'p', 's');
    expect(texto).toBe('ok');
    expect(calls[0]).toBe('http://localhost:11434/api/chat');
  });
});

describe('Proveedor efectivo y restricciones de envío (SEG-05)', () => {
  it('clasifica el destino por su dirección, no por el nombre del proveedor', () => {
    expect(ubicacionProveedor({ provider: 'gemini', model: 'm' })).toBe('externo');
    expect(ubicacionProveedor({ provider: 'ollama', model: 'm', endpoint: 'http://localhost:11434' })).toBe('local');
    expect(ubicacionProveedor({ provider: 'vllm', model: 'm', endpoint: 'http://192.168.10.20:8000/v1' })).toBe('red_interna');
    expect(ubicacionProveedor({ provider: 'compatible', model: 'm', endpoint: 'http://llm.intranet.local/v1' })).toBe('red_interna');
    expect(ubicacionProveedor({ provider: 'ollama', model: 'm', endpoint: 'https://ollama.ejemplo.com' })).toBe('externo');
  });

  it('no envía la documentación a un proveedor externo si se declaran datos de categorías especiales o penales', () => {
    const externo: ApiConfig = { provider: 'gemini', apiKey: 'x', model: 'm' };
    expect(restriccionEnvio(externo, answeredAnswers({ processesSpecialCategoryData: 'si' })).permitido).toBe(false);
    expect(restriccionEnvio(externo, answeredAnswers({ processesCriminalData: 'si' })).permitido).toBe(false);
    expect(restriccionEnvio(externo, answeredAnswers()).permitido).toBe(true);
    const local: ApiConfig = { provider: 'ollama', model: 'm', endpoint: 'http://localhost:11434' };
    expect(restriccionEnvio(local, answeredAnswers({ processesSpecialCategoryData: 'si' })).permitido).toBe(true);
  });

  it('el registro de asistencia identifica proveedor, modelo, ubicación y estado sin la clave', () => {
    const r = registroAsistencia({ provider: 'compatible', endpoint: 'https://openrouter.ai/api/v1', apiKey: FAKE_KEY, model: 'm' }, 'usada');
    expect(r).toMatchObject({ modelo: 'm', ubicacion: 'externo', estado: 'usada' });
    expect(JSON.stringify(r)).not.toContain(FAKE_KEY);
    expect(registroAsistencia(null, 'no_configurada').ubicacion).toBe('ninguno');
  });

  it('si se declara ejecución local pero la documentación cita APIs en la nube, se señala la discrepancia', () => {
    const ingest = makeIngest('Asistente de redacción.', { readmeContent: 'Usa @google/genai con la API de Gemini para generar borradores.' });
    const d = evaluateRulesDeterministically(ingest, answeredAnswers({ hostingModel: 'local_on_premise' }));
    expect(d.redFlags.some((f) => f.includes('Alojamiento declarado'))).toBe(true);
    const coherente = evaluateRulesDeterministically(ingest, answeredAnswers({ hostingModel: 'eu_cloud_dpa' }));
    expect(coherente.redFlags.some((f) => f.includes('Alojamiento declarado'))).toBe(false);
  });
});

describe('Lista de modelos de Gemini según la clave', () => {
  const listar = async (models: unknown[]) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ models }), { status: 200 })));
    return fetchAvailableModels('gemini', 'AIzaSy' + 'R'.repeat(33));
  };

  it('solo ofrece los modelos de texto que devuelve Google para esa clave, sin añadir alias propios', async () => {
    const lista = await listar([
      { name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', supportedGenerationMethods: ['generateContent'] },
      { name: 'models/gemini-embedding-001', supportedGenerationMethods: ['embedContent'] },
      { name: 'models/gemini-2.5-flash-preview-tts', supportedGenerationMethods: ['generateContent'] },
    ]);
    expect(lista.map((m) => m.id)).toEqual(['gemini-2.5-flash']);
  });

  it('los alias «-latest» aparecen primero cuando la clave los incluye', async () => {
    const lista = await listar([
      { name: 'models/gemini-2.5-pro', supportedGenerationMethods: ['generateContent'] },
      { name: 'models/gemini-flash-latest', supportedGenerationMethods: ['generateContent'] },
    ]);
    expect(lista.map((m) => m.id)).toEqual(['gemini-flash-latest', 'gemini-2.5-pro']);
  });

  it('sin clave no se consulta nada ni se ofrecen modelos', async () => {
    const espia = vi.fn();
    vi.stubGlobal('fetch', espia);
    expect(await fetchAvailableModels('gemini', '')).toEqual([]);
    expect(espia).not.toHaveBeenCalled();
  });
});
