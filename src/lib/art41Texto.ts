import type { DiagnosticResult, LegalEnrichmentAnswers } from '../types';
import { applicableAnswers } from './interviewCatalog';

/**
 * Párrafo de deslinde con la actuación administrativa automatizada (Ley 40/2015, Art. 41), común al
 * Word y al Markdown. Solo afirma lo declarado en preguntas que aplican al caso (DOC-17).
 */
export function art41Deslinde(answers: LegalEnrichmentAnswers, diagnostic: DiagnosticResult | null | undefined): string {
  const a = applicableAnswers(answers);
  if (a.producesAdministrativeActs === 'no') {
    return 'Se ha declarado que el sistema no produce ni prepara actos o actuaciones administrativas: solo informa. El Art. 41 no es aplicable; debe revisarse si el sistema llega a intervenir en un procedimiento administrativo.';
  }
  if (diagnostic?.isAutomatedAdministrativeAct) {
    return 'Se ha declarado que el sistema realiza actuaciones administrativas automatizadas, es decir, sin intervención directa de un empleado público. Antes de su puesta en servicio deben establecerse los órganos competentes para la definición de especificaciones, programación, mantenimiento, supervisión, control de calidad y auditoría, y el órgano responsable a efectos de impugnación (Art. 41.2).';
  }
  if (a.directHumanIntervention === 'si') {
    return 'El promotor declara que un empleado público interviene de forma directa en cada actuación, por lo que no habría actuación administrativa automatizada. Esta afirmación no se ha verificado y debe contrastarse con el funcionamiento real del procedimiento.';
  }
  return 'No consta si el sistema produce actuaciones administrativas ni si un empleado público interviene de forma directa en cada una: debe aclararse antes de descartar una actuación administrativa automatizada (Art. 41).';
}
