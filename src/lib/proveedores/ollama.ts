/**
 * Ollama por su API nativa (/api/chat).
 *
 * La API compatible con OpenAI de Ollama no permite fijar la ventana de
 * contexto (num_ctx) y usa la del modelo por defecto, a menudo de pocos miles
 * de tokens: un prompt con el texto legal se truncaba sin aviso. La API nativa
 * acepta options.num_ctx, que se calcula según el tamaño del prompt.
 */

export const SALIDA_MAXIMA_TOKENS = 8192;
const CONTEXTO_MINIMO = 8192;
const CONTEXTO_MAXIMO = 65536;

/**
 * Ventana de contexto necesaria: tokens estimados del prompt (unos 3 caracteres
 * por token en castellano) más la salida máxima, redondeado a múltiplo de 4096.
 */
export function calcularNumCtx(caracteresPrompt: number): number {
  const necesario = Math.ceil(caracteresPrompt / 3) + SALIDA_MAXIMA_TOKENS;
  const redondeado = Math.ceil(necesario / 4096) * 4096;
  return Math.min(CONTEXTO_MAXIMO, Math.max(CONTEXTO_MINIMO, redondeado));
}

export interface EventoOllama {
  texto?: string;
  finRazon?: string;
  error?: string;
}

/** Lector de la respuesta en streaming de /api/chat (una línea JSON por evento) */
export function crearLectorOllama() {
  let bufer = '';
  const procesarLinea = (linea: string): EventoOllama | null => {
    const l = linea.trim();
    if (!l) return null;
    try {
      const json = JSON.parse(l);
      if (json.error) return { error: String(json.error) };
      const evento: EventoOllama = {};
      if (json.message?.content) evento.texto = json.message.content;
      // done_reason: «stop» o «length» cuando se alcanza num_predict
      if (json.done) evento.finRazon = json.done_reason ?? 'stop';
      return evento.texto !== undefined || evento.finRazon !== undefined ? evento : null;
    } catch {
      return null;
    }
  };
  return {
    procesar(trozo: string): EventoOllama[] {
      bufer += trozo;
      const lineas = bufer.split('\n');
      bufer = lineas.pop() ?? '';
      return lineas.map(procesarLinea).filter((e): e is EventoOllama => e !== null);
    },
    finalizar(): EventoOllama[] {
      const evento = procesarLinea(bufer);
      bufer = '';
      return evento ? [evento] : [];
    },
  };
}

/** Cuerpo de la petición a /api/chat */
export function cuerpoPeticionOllama(modelo: string, sistema: string, prompt: string, stream: boolean) {
  return {
    model: modelo,
    stream,
    messages: [
      { role: 'system', content: sistema },
      { role: 'user', content: prompt },
    ],
    options: {
      temperature: 0.3,
      num_ctx: calcularNumCtx(sistema.length + prompt.length),
      num_predict: SALIDA_MAXIMA_TOKENS,
    },
  };
}
