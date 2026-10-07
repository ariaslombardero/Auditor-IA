/**
 * Reintentos ante errores transitorios de los proveedores de IA (límite de
 * peticiones, servidor saturado). Espera exponencial con variación aleatoria y
 * respeto de la espera que indique el proveedor (`Retry-After` o `retryDelay`).
 * No se reintenta lo que no tiene arreglo: clave inválida, modelo inexistente,
 * petición mal formada o cancelación por la persona usuaria.
 */

export class ErrorProveedor extends Error {
  readonly status?: number;
  /** Espera indicada por el proveedor, en milisegundos */
  readonly esperaMs?: number;

  constructor(mensaje: string, status?: number, esperaMs?: number) {
    super(mensaje);
    this.name = 'ErrorProveedor';
    this.status = status;
    this.esperaMs = esperaMs;
  }
}

/** Interpreta la cabecera Retry-After (segundos o fecha HTTP) */
export function leerRetryAfter(valor: string | null, ahora = Date.now()): number | undefined {
  if (!valor) return undefined;
  const segundos = Number(valor);
  if (Number.isFinite(segundos)) return Math.max(0, segundos * 1000);
  const fecha = Date.parse(valor);
  return Number.isNaN(fecha) ? undefined : Math.max(0, fecha - ahora);
}

export const esCancelacion = (e: unknown) =>
  e instanceof DOMException ? e.name === 'AbortError' : (e as { name?: string })?.name === 'AbortError';

export function clasificarError(e: unknown): { reintentable: boolean; esperaMs?: number } {
  if (esCancelacion(e)) return { reintentable: false };
  const status = e instanceof ErrorProveedor ? e.status : undefined;
  const mensaje = String((e as Error)?.message ?? e);
  const transitorio = (status !== undefined && [408, 429, 500, 502, 503, 504].includes(status))
    || /\b(429|503|502|504)\b|RESOURCE_EXHAUSTED|UNAVAILABLE|overloaded|high demand|rate limit/i.test(mensaje);
  if (!transitorio) return { reintentable: false };
  const delGemini = mensaje.match(/retry(?:Delay)?\W{1,4}(\d+(?:\.\d+)?)s/i);
  const esperaMs = e instanceof ErrorProveedor && e.esperaMs !== undefined
    ? e.esperaMs
    : delGemini ? Number(delGemini[1]) * 1000 : undefined;
  return { reintentable: true, esperaMs };
}

export interface OpcionesReintento {
  intentos?: number;
  baseMs?: number;
  maxMs?: number;
  senal?: AbortSignal;
  /** Aviso antes de cada espera, para mostrarlo en la interfaz */
  onEspera?: (ms: number, intento: number) => void;
  /** Inyectable para las pruebas */
  esperar?: (ms: number, senal?: AbortSignal) => Promise<void>;
  aleatorio?: () => number;
}

function esperarCancelable(ms: number, senal?: AbortSignal): Promise<void> {
  return new Promise((resolver, rechazar) => {
    if (senal?.aborted) return rechazar(new DOMException('Cancelado', 'AbortError'));
    const t = setTimeout(resolver, ms);
    senal?.addEventListener('abort', () => {
      clearTimeout(t);
      rechazar(new DOMException('Cancelado', 'AbortError'));
    }, { once: true });
  });
}

export async function conReintentos<T>(fn: () => Promise<T>, opciones: OpcionesReintento = {}): Promise<T> {
  const { intentos = 3, baseMs = 2000, maxMs = 60_000, senal, onEspera, esperar = esperarCancelable, aleatorio = Math.random } = opciones;
  for (let intento = 1; ; intento++) {
    try {
      return await fn();
    } catch (e) {
      const { reintentable, esperaMs } = clasificarError(e);
      if (!reintentable || intento >= intentos) throw e;
      const exponencial = Math.min(maxMs, baseMs * 2 ** (intento - 1)) * (0.75 + aleatorio() * 0.5);
      const ms = Math.min(maxMs, esperaMs ?? exponencial);
      onEspera?.(ms, intento);
      await esperar(ms, senal);
    }
  }
}
