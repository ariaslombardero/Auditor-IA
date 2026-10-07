import type { AiAssistanceRecord, ApiConfig, LegalEnrichmentAnswers, ProviderLocation } from '../types';
import { describirProveedor, getEndpoint } from './apiService';

/**
 * Proveedor efectivo: a qué destino envía el auditor la documentación que analiza.
 * Se decide por la dirección real, no por el nombre del proveedor: un «Ollama» puede
 * estar en internet y una «API compatible» puede estar en la intranet.
 */

const PRIVADA_IPV4 = /^(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/;
const DOMINIO_INTERNO = /\.(local|lan|internal|intranet|corp|home\.arpa)$/;

export function ubicacionProveedor(config: ApiConfig | null): ProviderLocation {
  if (!config) return 'ninguno';
  if (config.provider === 'gemini') return 'externo';
  let host: string;
  try {
    host = new URL(getEndpoint(config)).hostname.toLowerCase().replace(/^\[|\]$/g, '');
  } catch {
    return 'externo';
  }
  if (host === 'localhost' || host.endsWith('.localhost') || /^127\./.test(host) || host === '::1') return 'local';
  if (PRIVADA_IPV4.test(host) || DOMINIO_INTERNO.test(host) || !host.includes('.')) return 'red_interna';
  return 'externo';
}

export const ETIQUETA_UBICACION: Record<ProviderLocation, string> = {
  local: 'en este equipo',
  red_interna: 'en la red interna de la organización',
  externo: 'en un servicio externo',
  ninguno: 'sin proveedor de IA',
};

/**
 * Restricción de datos ligada al proveedor efectivo: si se declaran datos de categorías
 * especiales (Art. 9 RGPD) o penales (Art. 10 RGPD), la documentación no se envía a un servicio externo.
 */
export function restriccionEnvio(
  config: ApiConfig,
  answers: LegalEnrichmentAnswers
): { permitido: boolean; motivo?: string } {
  if (ubicacionProveedor(config) !== 'externo') return { permitido: true };
  const sensibles = answers.processesSpecialCategoryData === 'si' || answers.processesCriminalData === 'si';
  if (!sensibles) return { permitido: true };
  return {
    permitido: false,
    motivo:
      'Se han declarado datos de categorías especiales (Art. 9 RGPD) o penales (Art. 10 RGPD) y el proveedor configurado es un servicio externo. La documentación no se ha enviado al modelo; para el análisis asistido use un modelo local o de la red interna.',
  };
}

export function registroAsistencia(
  config: ApiConfig | null,
  estado: AiAssistanceRecord['estado'],
  motivo?: string
): AiAssistanceRecord {
  return {
    proveedor: config ? describirProveedor(config) : 'Ninguno',
    modelo: config?.model || '—',
    ubicacion: ubicacionProveedor(config),
    estado,
    ...(motivo ? { motivo } : {}),
  };
}

/** Frase para documentos e interfaz. */
export function describirAsistencia(a: AiAssistanceRecord | undefined): string {
  if (!a || a.estado === 'no_configurada') {
    return 'No se usó ningún modelo de IA: el diagnóstico procede solo del motor determinista.';
  }
  const destino = `${a.proveedor}, modelo ${a.modelo} (${ETIQUETA_UBICACION[a.ubicacion]})`;
  switch (a.estado) {
    case 'usada':
      return `Comentario complementario generado con ${destino}. No altera la clasificación.`;
    case 'bloqueada':
      return `No se envió la documentación a ${destino}. ${a.motivo ?? ''}`.trim();
    case 'desfasada':
      return `El comentario de ${destino} se generó con respuestas anteriores: no se incluye. Actualice el diagnóstico para regenerarlo.`;
    case 'fallida':
      return `Se intentó usar ${destino}, pero la llamada falló${a.motivo ? `: ${a.motivo}` : ''}. El diagnóstico procede solo del motor determinista.`;
  }
}
