/**
 * Lector de flujos SSE de APIs compatibles con OpenAI (chat/completions con
 * stream: true). Es puro: recibe trozos de texto y devuelve eventos.
 *
 * Recoge el texto, el motivo de fin (`finish_reason`: «stop», «length»…) y los
 * errores que el servidor envía dentro del flujo; al terminar, procesa lo que
 * quede en el búfer. Antes se ignoraban el motivo de fin y los errores, de modo
 * que un tema truncado parecía completo.
 */

export interface EventoSSE {
  texto?: string;
  finRazon?: string;
  error?: string;
  fin?: boolean;
}

export function crearLectorSSE() {
  let bufer = '';

  const procesarLinea = (linea: string): EventoSSE | null => {
    const l = linea.trim();
    if (!l.startsWith('data:')) return null;
    const datos = l.slice(5).trim();
    if (!datos) return null;
    if (datos === '[DONE]') return { fin: true };
    try {
      const json = JSON.parse(datos);
      if (json.error) {
        return { error: typeof json.error === 'string' ? json.error : (json.error.message ?? JSON.stringify(json.error)) };
      }
      const eleccion = json.choices?.[0];
      const evento: EventoSSE = {};
      const texto = eleccion?.delta?.content;
      if (typeof texto === 'string' && texto) evento.texto = texto;
      if (eleccion?.finish_reason) evento.finRazon = String(eleccion.finish_reason);
      return evento.texto !== undefined || evento.finRazon !== undefined ? evento : null;
    } catch {
      return null;
    }
  };

  return {
    /** Procesa un trozo recibido; devuelve los eventos de las líneas completas */
    procesar(trozo: string): EventoSSE[] {
      bufer += trozo;
      const lineas = bufer.split('\n');
      bufer = lineas.pop() ?? '';
      return lineas.map(procesarLinea).filter((e): e is EventoSSE => e !== null);
    },
    /** Procesa lo que quede en el búfer al cerrarse la conexión */
    finalizar(): EventoSSE[] {
      const resto = bufer;
      bufer = '';
      const evento = procesarLinea(resto);
      return evento ? [evento] : [];
    },
  };
}

/**
 * Elimina los bloques de razonamiento que algunos modelos (DeepSeek R1, Qwen…)
 * devuelven dentro del texto, incluido uno sin cerrar al final.
 */
export function quitarRazonamiento(texto: string): string {
  return texto.replace(/<think>[\s\S]*?<\/think>\s*/gi, '').replace(/<think>[\s\S]*$/i, '').trimStart();
}
