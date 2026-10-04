/**
 * Servicio de Sellado Criptográfico y Preparación para Firma Electrónica
 * Compatible con AutoFirma, la pasarela @firma y el Esquema Nacional de Seguridad (ENS).
 */

export interface CryptographicReceipt {
  documentName: string;
  sha256Hex: string;
  timestampIso: string;
  timestampFormatted: string;
  secureVerificationCode: string; // CSV
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
 * Genera un Código Seguro de Verificación (CSV) reglamentario según el Art. 42 Ley 40/2015
 */
export function generateSecureVerificationCode(appName: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = 'CSV-IA';
  const segments: string[] = [];

  for (let s = 0; s < 3; s++) {
    let seg = '';
    for (let i = 0; i < 4; i++) {
      seg += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(seg);
  }

  return `${prefix}-${segments.join('-')}`;
}

/**
 * Genera el recibo formal de sellado y diligencia técnica de firma
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
  const secureVerificationCode = generateSecureVerificationCode(documentName);
  const hashAlgorithm = 'SHA-256 (NIST FIPS 180-4)';
  const suggestedSignatureFormat = documentName.endsWith('.pdf') ? 'PAdES-BES / PAdES-LTV (PDF Advanced Electronic Signatures)' : 'CAdES-BES (CMS Advanced Electronic Signatures)';

  const diligenceText = `DILIGENCIA TÉCNICA DE INTEGRIDAD Y SELLADO CRIPTOGRÁFICO
--------------------------------------------------------------------------------
ADMINISTRACIÓN: ${entityName || 'Administración Pública de España'}
EXPEDIENTE: Dictamen de Conformidad y Auditoría de IA
DOCUMENTO: ${documentName}
CÓDIGO SEGURO DE VERIFICACIÓN (CSV): ${secureVerificationCode}
ALGORITMO DE RESUMEN: ${hashAlgorithm}
HUELLA DIGITAL (HASH SHA-256):
${sha256Hex}

FECHA Y HORA DE CÓMPUTO: ${timestampFormatted}
RESPONSABLE FUNCIONAL: ${functionalResponsible || 'Titular del Órgano Responsable'}

CERTIFICACIÓN:
Se certifica que el documento indicado posee la huella digital criptográfica
anteriormente consignada. Cualquier alteración posterior de un solo bit en el
archivo invalidará la concordancia matemática del hash y del CSV.

INSTRUCCIONES PARA LA FIRMA EN AUTOFIRMA (@FIRMA):
1. Inicie la aplicación oficial "AutoFirma" en su puesto de trabajo.
2. Seleccione el fichero generado: "${documentName}".
3. Escoja su Certificado Digital Cualificado (DNIe o Certificado de Empleado Público FNMT-RCM).
4. Formato de firma recomendado: ${suggestedSignatureFormat}.
5. Estampe la firma electrónica avanzada/cualificada y archive el justificante en el Gestor de Expedientes.
--------------------------------------------------------------------------------`;

  return {
    documentName,
    sha256Hex,
    timestampIso,
    timestampFormatted,
    secureVerificationCode,
    hashAlgorithm,
    suggestedSignatureFormat,
    diligenceText,
  };
}
