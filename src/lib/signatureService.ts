/**
 * Huella SHA-256 de las entradas de un diagnóstico (traceability.ts). La huella no es una firma
 * ni un sello de tiempo: permite comprobar que dos documentos parten de las mismas entradas.
 */

/**
 * Calcula el Hash SHA-256 nativo en el navegador mediante Web Crypto API
 */
export async function calculateSha256(data: string | ArrayBuffer | Blob): Promise<string> {
  let buffer: BufferSource;

  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data);
  } else if (data instanceof Blob) {
    buffer = await data.arrayBuffer();
  } else {
    buffer = data;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
