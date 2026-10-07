import { describe, it, expect, vi } from 'vitest';
import { crearLectorSSE, quitarRazonamiento } from '../proveedores/sse';
import { conReintentos, clasificarError, leerRetryAfter, ErrorProveedor } from '../proveedores/reintentos';
import { calcularNumCtx, crearLectorOllama, cuerpoPeticionOllama } from '../proveedores/ollama';

// Pruebas de los módulos de proveedores, procedentes de Opositor transparente (misma arquitectura).

const linea = (obj: unknown) => `data: ${JSON.stringify(obj)}\n`;

describe('crearLectorSSE', () => {
  it('reúne el texto aunque las líneas lleguen partidas', () => {
    const lector = crearLectorSSE();
    const completo = linea({ choices: [{ delta: { content: 'Hola ' } }] }) + linea({ choices: [{ delta: { content: 'mundo' } }] });
    const eventos = [...lector.procesar(completo.slice(0, 20)), ...lector.procesar(completo.slice(20))];
    expect(eventos.map(e => e.texto).join('')).toBe('Hola mundo');
  });

  it('detecta el truncamiento por longitud', () => {
    const lector = crearLectorSSE();
    const eventos = lector.procesar(linea({ choices: [{ delta: {}, finish_reason: 'length' }] }));
    expect(eventos[0].finRazon).toBe('length');
  });

  it('recoge los errores enviados dentro del flujo', () => {
    const lector = crearLectorSSE();
    const eventos = lector.procesar(linea({ error: { message: 'Rate limit reached' } }));
    expect(eventos[0].error).toBe('Rate limit reached');
  });

  it('reconoce [DONE] y procesa el búfer final sin salto de línea', () => {
    const lector = crearLectorSSE();
    expect(lector.procesar('data: [DONE]\n')[0].fin).toBe(true);
    lector.procesar(`data: ${JSON.stringify({ choices: [{ delta: { content: 'fin' } }] })}`);
    expect(lector.finalizar()[0].texto).toBe('fin');
  });
});

describe('quitarRazonamiento', () => {
  it('elimina los bloques <think>, también uno sin cerrar', () => {
    expect(quitarRazonamiento('<think>pienso…</think>\n# Tema')).toBe('# Tema');
    expect(quitarRazonamiento('# Tema\n<think>sin cerrar')).toBe('# Tema\n');
  });
});

const sinEspera = { esperar: async () => undefined, aleatorio: () => 0.5 };

describe('clasificarError', () => {
  it('reintenta límites de peticiones y servidores saturados', () => {
    expect(clasificarError(new ErrorProveedor('x', 429)).reintentable).toBe(true);
    expect(clasificarError(new Error('RESOURCE_EXHAUSTED: quota')).reintentable).toBe(true);
    expect(clasificarError(new Error('503 UNAVAILABLE')).reintentable).toBe(true);
  });

  it('no reintenta claves inválidas ni cancelaciones', () => {
    expect(clasificarError(new ErrorProveedor('API key not valid', 400)).reintentable).toBe(false);
    expect(clasificarError(new DOMException('x', 'AbortError')).reintentable).toBe(false);
  });

  it('lee la espera que indica Gemini', () => {
    expect(clasificarError(new Error('429 ... "retryDelay": "17s"')).esperaMs).toBe(17000);
  });
});

describe('leerRetryAfter', () => {
  it('acepta segundos y fechas HTTP', () => {
    expect(leerRetryAfter('12')).toBe(12000);
    expect(leerRetryAfter('Mon, 05 Oct 2026 10:00:10 GMT', Date.parse('Mon, 05 Oct 2026 10:00:00 GMT'))).toBe(10000);
    expect(leerRetryAfter(null)).toBeUndefined();
  });
});

describe('conReintentos', () => {
  it('reintenta y respeta Retry-After', async () => {
    const esperas: number[] = [];
    const fn = vi.fn()
      .mockRejectedValueOnce(new ErrorProveedor('lento', 429, 5000))
      .mockResolvedValueOnce('ok');
    const r = await conReintentos(fn, { ...sinEspera, onEspera: ms => esperas.push(ms) });
    expect(r).toBe('ok');
    expect(esperas).toEqual([5000]);
  });

  it('usa espera exponencial cuando el proveedor no indica nada', async () => {
    const esperas: number[] = [];
    const fn = vi.fn()
      .mockRejectedValueOnce(new ErrorProveedor('x', 503))
      .mockRejectedValueOnce(new ErrorProveedor('x', 503))
      .mockResolvedValueOnce('ok');
    await conReintentos(fn, { ...sinEspera, baseMs: 1000, onEspera: ms => esperas.push(ms) });
    expect(esperas).toEqual([1000, 2000]);
  });

  it('se rinde tras el número máximo de intentos', async () => {
    const fn = vi.fn().mockRejectedValue(new ErrorProveedor('x', 429));
    await expect(conReintentos(fn, { ...sinEspera, intentos: 3 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('no reintenta errores definitivos', async () => {
    const fn = vi.fn().mockRejectedValue(new ErrorProveedor('Invalid key', 401));
    await expect(conReintentos(fn, sinEspera)).rejects.toThrow('Invalid key');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('calcularNumCtx', () => {
  it('reserva sitio para el prompt y la salida, con mínimo y máximo', () => {
    expect(calcularNumCtx(1000)).toBe(12288);
    expect(calcularNumCtx(60000)).toBe(28672);
    expect(calcularNumCtx(10_000_000)).toBe(65536);
  });
});

describe('crearLectorOllama', () => {
  it('reúne el texto y lee el motivo de fin', () => {
    const lector = crearLectorOllama();
    const lineas = [
      JSON.stringify({ message: { content: 'Hola ' }, done: false }),
      JSON.stringify({ message: { content: 'mundo' }, done: false }),
      JSON.stringify({ message: { content: '' }, done: true, done_reason: 'length' }),
    ].join('\n');
    const eventos = [...lector.procesar(lineas), ...lector.finalizar()];
    expect(eventos.map(e => e.texto ?? '').join('')).toBe('Hola mundo');
    expect(eventos.at(-1)?.finRazon).toBe('length');
  });

  it('recoge los errores del servidor', () => {
    expect(crearLectorOllama().procesar('{"error":"model not found"}\n')[0].error).toBe('model not found');
  });
});

describe('cuerpoPeticionOllama', () => {
  it('fija num_ctx según el tamaño del prompt', () => {
    const cuerpo = cuerpoPeticionOllama('qwen2.5:32b', 'x'.repeat(30000), 'y'.repeat(30000), true);
    expect(cuerpo.options.num_ctx).toBe(28672);
  });
});
