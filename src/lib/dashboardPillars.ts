import type { DiagnosticResult, RequirementAssessment, RequirementPillar } from '../types';
import { requirementSeverity, requirementsByPillar, unaccreditedRequirements } from './assessmentModel';

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
 * Estado de un pilar a partir del peor de sus requisitos: incumple → rojo; pendiente,
 * no verificado o no evaluado → ámbar; declarado → informativo; todo acreditado → verde.
 */
function pillarStatusFrom(requirements: RequirementAssessment[]): PillarStatus {
  const applicable = requirements.filter((r) => r.aplicabilidad !== 'no_aplica');
  if (applicable.length === 0) return 'neutral';
  const worst = Math.max(...applicable.map(requirementSeverity));
  if (worst >= 4) return 'danger';
  if (worst >= 2) return 'warning';
  if (worst === 1) return 'info';
  return 'success';
}

function pendingText(requirements: RequirementAssessment[], pillar: RequirementPillar): string {
  const inPillar = requirementsByPillar(requirements, pillar).filter((r) => r.aplicabilidad !== 'no_aplica');
  if (inPillar.length === 0) return 'Sin requisitos evaluados';
  const pending = unaccreditedRequirements(inPillar).length;
  return pending === 0 ? 'Requisitos acreditados' : `${pending} requisito${pending === 1 ? '' : 's'} por validar`;
}

/**
 * Semáforo Ejecutivo de Madurez en 4 Pilares (Paso 3 del Stepper).
 * Ningún pilar puede aparecer en verde mientras alguno de sus requisitos no esté acreditado.
 */
export function computeExecutivePillars(diagnostic: DiagnosticResult): ExecutivePillars {
  const reqs = diagnostic.requirements;

  const riaReqs = requirementsByPillar(reqs, 'ria');
  const riaStatus = diagnostic.riskClassification === 'prohibited'
    ? 'danger'
    : diagnostic.riskClassification === 'requires_review'
      ? 'warning'
      : pillarStatusFrom(riaReqs);
  const riaLabel =
    diagnostic.riskClassification === 'requires_review'
      ? 'Requiere revisión (clasificación no concluyente)'
      : diagnostic.riskClassification === 'prohibited'
      ? 'Práctica prohibida declarada (Art. 5)'
      : diagnostic.riskClassification === 'high_risk'
        ? 'Alto Riesgo (Anexo III)'
        : diagnostic.riskClassification === 'not_ai_system'
          ? 'Excluido (Art. 3.1), según lo declarado'
          : diagnostic.riskClassification === 'minimal_risk'
            ? 'Riesgo Mínimo (Art. 95), según lo declarado'
            : 'Riesgo de transparencia (Art. 50)';
  const ria: ExecutivePillar = { status: riaStatus, label: riaLabel, text: pendingText(reqs, 'ria') };

  const rgpdReqs = requirementsByPillar(reqs, 'rgpd');
  const conditionedByEipd = diagnostic.redFlags.some((f) => f.includes('Transferencia') || f.includes('Sensibles'));
  const rgpd: ExecutivePillar = conditionedByEipd
    ? { status: 'warning', label: 'Condicionado a EIPD', text: 'Datos sensibles o nube externa' }
    : { status: pillarStatusFrom(rgpdReqs), label: 'Pendiente de verificación del DPD', text: pendingText(reqs, 'rgpd') };

  const ensReqs = requirementsByPillar(reqs, 'ens');
  const ens: ExecutivePillar = {
    status: diagnostic.ensCategory === 'ALTA' ? 'warning' : pillarStatusFrom(ensReqs),
    label: `Categoría ENS ${diagnostic.ensCategory === 'BASICA' ? 'BÁSICA' : diagnostic.ensCategory} (orientativa)`,
    text: pendingText(reqs, 'ens'),
  };

  const gobReqs = requirementsByPillar(reqs, 'gobernanza');
  const gobernanza: ExecutivePillar = {
    status: pillarStatusFrom(gobReqs),
    label: diagnostic.isAutomatedAdministrativeAct ? 'Actuación Automatizada (Art. 41)' : 'Apoyo técnico declarado',
    text: pendingText(reqs, 'gobernanza'),
  };

  return { ria, rgpd, ens, gobernanza };
}

/**
 * Veredicto Global Ejecutivo mostrado bajo el semáforo. Nunca declara aptitud para producción:
 * como máximo indica que los requisitos están acreditados, sujeto a la revisión formal.
 */
export function computeExecutiveVerdict(diagnostic: DiagnosticResult): ExecutiveVerdict {
  const unaccredited = unaccreditedRequirements(diagnostic.requirements);
  const breaches = unaccredited.filter((r) => r.resultado === 'incumple');
  const faltan = diagnostic.pendingAnswers ?? 0;
  const respuestas = faltan === 0 ? '' : `Queda${faltan === 1 ? '' : 'n'} ${faltan} respuesta${faltan === 1 ? '' : 's'} pendiente${faltan === 1 ? '' : 's'} en la entrevista. `;
  const porValidar = `${unaccredited.length} requisito${unaccredited.length === 1 ? '' : 's'} por validar`;

  if (diagnostic.riskClassification === 'prohibited') {
    return {
      level: 'blocked',
      label: 'VEREDICTO: BLOQUEADO — PRÁCTICA PROHIBIDA DECLARADA',
      detail: 'Se ha declarado una práctica del Art. 5 del RIA. Requiere revisión jurídica antes de cualquier otra actuación.',
    };
  }
  if (diagnostic.riskClassification === 'requires_review') {
    return {
      level: 'conditioned',
      label: 'VEREDICTO: CLASIFICACIÓN NO CONCLUYENTE — REQUIERE REVISIÓN',
      detail: `${diagnostic.reviewReasons.length} motivo${diagnostic.reviewReasons.length === 1 ? '' : 's'} impide${diagnostic.reviewReasons.length === 1 ? '' : 'n'} concluir: completar o corregir la entrevista. ${respuestas}${porValidar}.`,
    };
  }
  if (breaches.length > 0) {
    return {
      level: 'blocked',
      label: 'VEREDICTO: NO APTO SIN SUBSANACIÓN',
      detail: `Constan ${breaches.length} incumplimiento${breaches.length === 1 ? '' : 's'} que deben corregirse.`,
    };
  }
  if (unaccredited.length > 0) {
    return {
      level: 'conditioned',
      label: faltan > 0 ? 'VEREDICTO: FALTAN RESPUESTAS Y VALIDACIÓN HUMANA' : 'VEREDICTO: PENDIENTE DE VALIDACIÓN HUMANA',
      detail: `${respuestas}${porValidar}: contestar la entrevista no los acredita; los acredita una persona registrando la validación con su evidencia. Las conclusiones se basan en lo declarado y deben validarlas el órgano competente, el Responsable de Seguridad y el DPD.`,
    };
  }
  return {
    level: 'clear',
    label: 'VEREDICTO: REQUISITOS ACREDITADOS (SUJETO A REVISIÓN FORMAL)',
    detail: 'Todos los requisitos evaluados constan acreditados con evidencia. La decisión de puesta en servicio corresponde al órgano competente.',
  };
}
