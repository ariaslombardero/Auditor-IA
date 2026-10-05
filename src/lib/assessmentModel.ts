import type {
  AppIdioma,
  DiagnosticResult,
  RequirementAssessment,
  RequirementPillar,
  RequirementResult,
} from '../types';

/**
 * Modelo común de requisitos: etiquetas, gravedad y resúmenes.
 * El cuadro de mando y los exportadores deben usar estas funciones en lugar de
 * reconstruir sus propias conformidades.
 */

const RESULT_LABELS: Record<AppIdioma, Record<RequirementResult, string>> = {
  castellano: {
    acreditado: 'ACREDITADO',
    declarado: 'DECLARADO (sin verificar)',
    no_verificado: 'NO VERIFICADO',
    pendiente: 'PENDIENTE',
    incumple: 'INCUMPLE',
    no_evaluado: 'NO EVALUADO',
  },
  galego: {
    acreditado: 'ACREDITADO',
    declarado: 'DECLARADO (sen verificar)',
    no_verificado: 'NON VERIFICADO',
    pendiente: 'PENDENTE',
    incumple: 'INCUMPRE',
    no_evaluado: 'NON AVALIADO',
  },
};

const ORIGIN_LABELS: Record<AppIdioma, Record<RequirementAssessment['origen'], string>> = {
  castellano: {
    declaracion_promotor: 'Declaración del promotor',
    comprobacion_automatica: 'Comprobación automática',
    validacion_humana: 'Validación humana documentada',
  },
  galego: {
    declaracion_promotor: 'Declaración do promotor',
    comprobacion_automatica: 'Comprobación automática',
    validacion_humana: 'Validación humana documentada',
  },
};

const APPLICABILITY_LABELS: Record<AppIdioma, Record<RequirementAssessment['aplicabilidad'], string>> = {
  castellano: { aplica: 'Aplica', no_aplica: 'No aplica', desconocida: 'Aplicabilidad por determinar' },
  galego: { aplica: 'Aplícase', no_aplica: 'Non se aplica', desconocida: 'Aplicabilidade por determinar' },
};

export function resultLabel(result: RequirementResult, idioma: AppIdioma = 'castellano'): string {
  return RESULT_LABELS[idioma][result];
}

export function originLabel(origin: RequirementAssessment['origen'], idioma: AppIdioma = 'castellano'): string {
  return ORIGIN_LABELS[idioma][origin];
}

export function applicabilityLabel(a: RequirementAssessment['aplicabilidad'], idioma: AppIdioma = 'castellano'): string {
  return APPLICABILITY_LABELS[idioma][a];
}

/** Gravedad para ordenar y agregar: cuanto mayor, peor. Lo que no aplica no pesa. */
export function requirementSeverity(r: RequirementAssessment): number {
  if (r.aplicabilidad === 'no_aplica') return 0;
  switch (r.resultado) {
    case 'incumple':
      return 4;
    case 'pendiente':
      return 3;
    case 'no_verificado':
    case 'no_evaluado':
      return 2;
    case 'declarado':
      return 1;
    case 'acreditado':
      return 0;
  }
}

/** Requisitos aplicables (o de aplicabilidad dudosa) que no están acreditados. */
export function unaccreditedRequirements(requirements: RequirementAssessment[]): RequirementAssessment[] {
  return requirements.filter((r) => r.aplicabilidad !== 'no_aplica' && r.resultado !== 'acreditado');
}

export function requirementsByPillar(requirements: RequirementAssessment[], pillar: RequirementPillar): RequirementAssessment[] {
  return requirements.filter((r) => r.pillar === pillar);
}

export function prohibitedPractices(requirements: RequirementAssessment[]): RequirementAssessment[] {
  return requirements.filter((r) => r.kind === 'practica_prohibida');
}

export function obligations(requirements: RequirementAssessment[]): RequirementAssessment[] {
  return requirements.filter((r) => r.kind === 'obligacion');
}

/** Pilar al que correspondían los códigos de obligación del motor anterior. */
function legacyPillar(code: string): RequirementPillar {
  if (code.startsWith('RGPD')) return 'rgpd';
  if (code.startsWith('CCN') || code.startsWith('ENS')) return 'ens';
  if (code.startsWith('LEY-') || code === 'RIA-ART-14') return 'gobernanza';
  return 'ria';
}

/**
 * Convierte diagnósticos guardados por el motor anterior (v2.0, con `obligations` y
 * `prohibitedChecks`) al modelo actual. Sus estados no se reinterpretan como acreditados:
 * se marcan como no verificados y se indica que no han sido recalculados.
 */
export function normalizeDiagnostic(diagnostic: DiagnosticResult | null | undefined): DiagnosticResult | null {
  if (!diagnostic) return null;
  if (Array.isArray(diagnostic.requirements)) return withCurrentFields(diagnostic);

  const legacy = diagnostic as unknown as {
    obligations?: Array<{ code: string; title: string; legalBasis: string; status: string; description: string; actionRequired: string }>;
    prohibitedChecks?: Array<{ id: string; title: string; legalArticle: string; detected: boolean; explanation: string }>;
  };
  const fecha = new Date().toISOString();
  const legacyNote = 'Registro generado por el motor v2.0, que no distinguía declaración, comprobación y validación; no se ha recalculado.';

  const requirements: RequirementAssessment[] = [
    ...(legacy.prohibitedChecks || []).map<RequirementAssessment>((p) => ({
      id: `RIA-ART-5-${p.id}`,
      kind: 'practica_prohibida',
      pillar: 'ria',
      title: p.title,
      norma: 'Reglamento (UE) 2024/1689',
      precepto: p.legalArticle,
      aplicabilidad: 'desconocida',
      resultado: p.detected ? 'pendiente' : 'no_evaluado',
      origen: 'comprobacion_automatica',
      hechos: `${legacyNote} Texto original: ${p.explanation}`,
      accionRequerida: 'Reevaluar con la versión actual del motor y confirmar en la revisión jurídica.',
      fecha,
    })),
    ...(legacy.obligations || []).map<RequirementAssessment>((o) => ({
      id: o.code,
      kind: 'obligacion',
      pillar: legacyPillar(o.code),
      title: o.title,
      norma: o.legalBasis,
      precepto: o.legalBasis,
      aplicabilidad: 'desconocida',
      resultado: 'no_verificado',
      origen: 'declaracion_promotor',
      hechos: `${legacyNote} Estado original: «${o.status}». ${o.description}`,
      accionRequerida: o.actionRequired,
      fecha,
    })),
  ];

  const { obligations: _o, prohibitedChecks: _p, ...rest } = diagnostic as unknown as Record<string, unknown>;
  return withCurrentFields({
    ...(rest as unknown as DiagnosticResult),
    requirements,
    engineVersion: '2.0.0 (registro anterior, no recalculado)',
  });
}

/**
 * Completa los campos que no existían en versiones anteriores del motor (traza, motivos de revisión,
 * papel y carácter orientativo del ENS) sin recalcular ni presumir conclusiones.
 */
function withCurrentFields(d: DiagnosticResult): DiagnosticResult {
  if (Array.isArray(d.classificationTrace) && Array.isArray(d.reviewReasons)) return d;
  return {
    ...d,
    reviewReasons: d.reviewReasons || [],
    classificationTrace: d.classificationTrace || [
      {
        id: 'REGISTRO-ANTERIOR',
        pregunta: 'Diagnóstico guardado por una versión anterior del motor',
        respuesta: d.riskLabel,
        conclusion: 'No recalculado con la versión actual.',
        regla: 'Las versiones anteriores no registraban la traza de la clasificación.',
        fuente: 'Historial local',
        limites: 'Debe repetirse la entrevista con la versión actual para obtener una clasificación trazable.',
      },
    ],
    normativeVersion: d.normativeVersion || 'Desconocido (registro anterior)',
    institutionalRole: d.institutionalRole || 'desconocido',
    ensCategoryIsOrientative: d.ensCategoryIsOrientative ?? true,
    engineVersion: /no recalculado/.test(d.engineVersion || '') ? d.engineVersion : `${d.engineVersion || 'anterior'} (registro anterior, no recalculado)`,
  };
}
