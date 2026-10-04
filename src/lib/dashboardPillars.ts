import type { DiagnosticResult } from '../types';

export type PillarStatus = 'danger' | 'warning' | 'info' | 'neutral' | 'success';

export interface ExecutivePillar {
  status: PillarStatus;
  label: string;
  text: string;
}

export interface ExecutivePillars {
  ria: ExecutivePillar;
  rgpd: ExecutivePillar;
  ens: ExecutivePillar;
  gobernanza: ExecutivePillar;
}

export type VerdictLevel = 'blocked' | 'conditioned' | 'clear';

export interface ExecutiveVerdict {
  level: VerdictLevel;
  label: string;
  detail: string;
}

/**
 * Semáforo Ejecutivo de Madurez en 4 Pilares (Paso 3 del Stepper).
 */
export function computeExecutivePillars(diagnostic: DiagnosticResult): ExecutivePillars {
  const ria: ExecutivePillar = diagnostic.riskClassification === 'prohibited'
    ? { status: 'danger', label: 'Inadmisible (Art. 5)', text: 'Práctica prohibida legalmente' }
    : diagnostic.riskClassification === 'high_risk'
    ? { status: 'danger', label: 'Alto Riesgo (Anexo III)', text: 'Requiere marcado CE previo' }
    : diagnostic.riskClassification === 'not_ai_system'
    ? { status: 'neutral', label: 'Excluido (Art. 3.1)', text: 'Software determinista sin IA' }
    : diagnostic.riskClassification === 'minimal_risk'
    ? { status: 'success', label: 'Riesgo Mínimo (Art. 95)', text: 'Exento de trámites de IA' }
    : { status: 'info', label: 'Riesgo Limitado (Art. 50)', text: 'Cumple vía transparencia' };

  const rgpd: ExecutivePillar = diagnostic.redFlags.some((f) => f.includes('Transferencia') || f.includes('Sensibles'))
    ? { status: 'warning', label: 'Condicionado a EIPD', text: 'Datos sensibles o nube externa' }
    : { status: 'success', label: 'Conforme con RAT', text: 'Base legítima acreditada' };

  const ens: ExecutivePillar = diagnostic.ensCategory === 'ALTA'
    ? { status: 'warning', label: 'Categoría ENS ALTA', text: 'Máximas salvaguardas D-A-I-C-T' }
    : diagnostic.ensCategory === 'MEDIA'
    ? { status: 'info', label: 'Categoría ENS MEDIA', text: 'Medidas reforzadas CCN-STIC' }
    : { status: 'success', label: 'Categoría ENS BÁSICA', text: 'Impacto limitado transitorio' };

  const gobernanza: ExecutivePillar = diagnostic.isAutomatedAdministrativeAct
    ? { status: 'warning', label: 'Actuación Automatizada', text: 'Requiere Orden formal Art. 41' }
    : { status: 'success', label: 'Auxilio Instrumental', text: 'Supervisión humana previa' };

  return { ria, rgpd, ens, gobernanza };
}

/**
 * Veredicto Global Ejecutivo mostrado bajo el semáforo.
 */
export function computeExecutiveVerdict(diagnostic: DiagnosticResult): ExecutiveVerdict {
  const isBlocked = diagnostic.riskClassification === 'prohibited';
  const isConditioned = diagnostic.riskClassification === 'high_risk' || diagnostic.redFlags.length > 0 || diagnostic.isAutomatedAdministrativeAct;

  if (isBlocked) {
    return {
      level: 'blocked',
      label: 'VEREDICTO: NO DESPLEGABLE EN PRODUCCIÓN (BLOQUEANTE LEGAL INSUBSANABLE)',
      detail: 'El sistema vulnera prohibiciones expresas del Art. 5 del RIA o carece de control humano.',
    };
  }
  if (isConditioned) {
    return {
      level: 'conditioned',
      label: 'VEREDICTO: APTO CONDICIONADO A SUBSANACIÓN PREVIA',
      detail: 'Requiere ratificar EIPD, publicar resolución de actuación automatizada o cumplir medidas CCN-STIC.',
    };
  }
  return {
    level: 'clear',
    label: 'VEREDICTO: APTO PARA DESPLIEGUE EN PRODUCCIÓN (CON SALVAGUARDAS)',
    detail: 'Herramienta de auxilio instrumental plenamente ajustada al marco RIA, RGPD, ENS y Ley 40/2015.',
  };
}
