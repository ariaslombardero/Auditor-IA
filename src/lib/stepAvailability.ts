import type { LegalEnrichmentAnswers } from '../types';

/**
 * Qué partes de la herramienta aplican a cada caso (UX-03, EIPD-08). Solo se ocultan cuando la
 * respuesta es «no»: con «no lo sé» se muestra todo, porque la incertidumbre nunca equivale a «no».
 */

/** Kit de código (avisos de transparencia del Art. 50 RIA): solo si el sistema puede ser IA. */
export function appliesCodeKit(answers: LegalEnrichmentAnswers): boolean {
  return answers.infersOutputs !== 'no';
}

/** Pruebas sobre el modelo (ataques e instrucciones del sistema): solo si el sistema puede ser IA. */
export function appliesModelTests(answers: LegalEnrichmentAnswers): boolean {
  return answers.infersOutputs !== 'no';
}

/** EIPD (Art. 35 RGPD): no procede si se declara que no se tratan datos personales. */
export function appliesEipd(answers: LegalEnrichmentAnswers): boolean {
  return answers.processesPersonalData !== 'no';
}
