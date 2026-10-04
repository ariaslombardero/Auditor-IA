/**
 * Servicio de huella criptográfica y preparación para firma electrónica.
 * La huella SHA-256 no es una firma ni un sello de tiempo; la firma se realiza
 * después con las herramientas corporativas (p. ej., AutoFirma).
 */

export interface CryptographicReceipt {
  documentName: string;
  sha256Hex: string;
  timestampIso: string;
  timestampFormatted: string;
  /** Identificador interno del documento. No es un Código Seguro de Verificación (CSV). */
  internalDocumentId: string;
  hashAlgorithm: string;
  suggestedSignatureFormat: string;
  diligenceText: string;
}

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

/**
 * Genera un identificador interno para referenciar el documento dentro de la herramienta.
 * No es un CSV: no está vinculado a ninguna sede electrónica ni permite comprobar el
 * documento (los CSV de la Ley 40/2015 los emite la Administración en su sede).
 */
export function generateInternalDocumentId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments: string[] = [];
  const random = new Uint32Array(12);
  crypto.getRandomValues(random);

  for (let s = 0; s < 3; s++) {
    let seg = '';
    for (let i = 0; i < 4; i++) {
      seg += chars.charAt(random[s * 4 + i] % chars.length);
    }
    segments.push(seg);
  }

  return `ID-INT-${segments.join('-')}`;
}

/**
 * Genera la nota técnica de huella e instrucciones para la firma electrónica
 */
export async function generateCryptographicReceipt(
  documentName: string,
  content: string | ArrayBuffer | Blob,
  entityName: string,
  functionalResponsible: string
): Promise<CryptographicReceipt> {
  const sha256Hex = await calculateSha256(content);
  const now = new Date();
  const timestampIso = now.toISOString();
  const timestampFormatted = now.toLocaleString('es-ES', { timeZoneName: 'short' });
  const internalDocumentId = generateInternalDocumentId();
  const hashAlgorithm = 'SHA-256 (NIST FIPS 180-4)';
  const suggestedSignatureFormat = documentName.endsWith('.pdf') ? 'PAdES-BES / PAdES-LTV (PDF Advanced Electronic Signatures)' : 'CAdES-BES (CMS Advanced Electronic Signatures)';

  const diligenceText = `NOTA TÉCNICA DE HUELLA DIGITAL DEL DOCUMENTO
--------------------------------------------------------------------------------
ADMINISTRACIÓN: ${entityName || 'Administración Pública de España'}
DOCUMENTO: ${documentName}
IDENTIFICADOR INTERNO: ${internalDocumentId}
  (Identificador de la herramienta. No es un Código Seguro de Verificación ni
  permite comprobar el documento en ninguna sede electrónica.)
ALGORITMO DE RESUMEN: ${hashAlgorithm}
HUELLA DIGITAL (HASH SHA-256):
${sha256Hex}

FECHA Y HORA DE CÁLCULO (reloj del equipo): ${timestampFormatted}
RESPONSABLE FUNCIONAL: ${functionalResponsible || 'Titular del Órgano Responsable'}

ALCANCE:
La huella permite detectar si el fichero cambia después de calcularla. No es
una firma electrónica ni un sello de tiempo cualificado, y no acredita la
autoría ni la fecha del documento.

INSTRUCCIONES PARA LA FIRMA ELECTRÓNICA (Art. 43 Ley 40/2015):
1. Abra la aplicación de firma corporativa (p. ej., AutoFirma).
2. Seleccione el fichero generado: "${documentName}".
3. Escoja su certificado cualificado (DNIe o certificado de empleado público).
4. Formato de firma recomendado: ${suggestedSignatureFormat}.
5. Incorpore el documento firmado al gestor de expedientes de la entidad.
--------------------------------------------------------------------------------`;

  return {
    documentName,
    sha256Hex,
    timestampIso,
    timestampFormatted,
    internalDocumentId,
    hashAlgorithm,
    suggestedSignatureFormat,
    diligenceText,
  };
}
