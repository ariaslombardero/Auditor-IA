import type { AppIngestData, LegalEnrichmentAnswers, TriState } from '../types';
import { normalizeAnswers } from './answersModel';

/**
 * Criterios para decidir si un tratamiento requiere EIPD (Art. 35 RGPD).
 * - WP248 rev.01 (Grupo de Trabajo del Art. 29, asumidas por el CEPD): 9 criterios.
 * - Lista de la AEPD del Art. 35.4 RGPD: 11 criterios. «En la mayoría de los casos» será necesaria
 *   una EIPD si el tratamiento cumple dos o más (texto cotejado en docs/auditoria/registro-fuentes.md).
 * Cada lista conserva su propia numeración.
 */

export interface EipdCriterion {
  id: string;
  title: string;
  estado: TriState;
  /** true solo si el criterio concurre («sí»). */
  applies: boolean;
  impact: string;
  justification: string;
}

export type EipdScreening = 'necesaria' | 'no_indicada' | 'por_determinar';

interface CriteriaInput {
  ingest: AppIngestData;
  answers: LegalEnrichmentAnswers;
}

const any = (...v: TriState[]): TriState => (v.includes('si') ? 'si' : v.every((x) => x === 'no') ? 'no' : 'desconocido');

function isAi(input: CriteriaInput): TriState {
  const a = normalizeAnswers(input.answers);
  if (a.infersOutputs !== 'desconocido') return a.infersOutputs;
  return typeof input.ingest.isAiSystem === 'boolean' ? (input.ingest.isAiSystem ? 'si' : 'no') : 'desconocido';
}

function automatedDecision(a: LegalEnrichmentAnswers): TriState {
  if (a.humanOversightLevel === 'fully_automated' || a.directHumanIntervention === 'no') return 'si';
  if (a.directHumanIntervention === 'si' && a.humanOversightLevel !== 'desconocido') return 'no';
  return 'desconocido';
}

const DECLARED: Record<TriState, string> = {
  si: 'Declarado que concurre.',
  no: 'Declarado que no concurre.',
  desconocido: 'Sin respuesta en la entrevista: pendiente de valorar.',
};

function criterion(id: string, title: string, estado: TriState, impact: string, justification?: string): EipdCriterion {
  return { id, title, estado, applies: estado === 'si', impact: estado === 'si' ? impact : estado === 'no' ? 'BAJO' : 'POR VALORAR', justification: justification || DECLARED[estado] };
}

/** Criterios de las directrices WP248 rev.01 (numeración C1 a C9). */
export function buildEipdCriteria(input: CriteriaInput): EipdCriterion[] {
  const a = normalizeAnswers(input.answers);
  const ai = isAi(input);
  return [
    criterion('C1', '1. Evaluación o puntuación, incluida la elaboración de perfiles', a.performsProfiling, 'ALTO'),
    criterion('C2', '2. Toma de decisiones automatizada con efectos jurídicos o significativos similares', automatedDecision(a), 'ALTO'),
    criterion('C3', '3. Observación sistemática', a.systematicMonitoring, 'ALTO'),
    criterion('C4', '4. Datos sensibles o de carácter muy personal (Arts. 9 y 10 RGPD)', any(a.processesSpecialCategoryData, a.processesCriminalData), 'ALTO'),
    criterion('C5', '5. Tratamiento de datos a gran escala', a.largeScale, 'MEDIO'),
    criterion('C6', '6. Asociación o combinación de conjuntos de datos', a.datasetCombination, 'MEDIO'),
    criterion('C7', '7. Datos relativos a interesados vulnerables', a.vulnerableSubjects, 'ALTO'),
    criterion(
      'C8',
      '8. Uso innovador o aplicación de nuevas soluciones tecnológicas u organizativas',
      ai,
      'MEDIO',
      ai === 'si'
        ? 'El sistema utiliza inteligencia artificial: uso innovador o aplicación de nuevas tecnologías (WP248, criterio 8; lista de la AEPD, criterio 10). Debe valorarse si supone nuevas formas de recogida y uso de datos con riesgo para los derechos.'
        : ai === 'no'
          ? 'Declarado que el sistema no utiliza componentes de IA.'
          : 'No consta si el sistema utiliza IA.'
    ),
    criterion('C9', '9. El tratamiento impide a los interesados ejercer un derecho o utilizar un servicio o un contrato', a.preventsRightsOrService, 'ALTO'),
  ];
}

/** Lista de la AEPD del Art. 35.4 RGPD (numeración AEPD-1 a AEPD-11). */
export function buildAepdCriteria(input: CriteriaInput): EipdCriterion[] {
  const a = normalizeAnswers(input.answers);
  const ai = isAi(input);
  const contributes: TriState = automatedDecision(a) === 'si' || a.materialInfluence === 'si' ? 'si' : automatedDecision(a) === 'no' && a.materialInfluence === 'no' ? 'no' : 'desconocido';
  return [
    criterion('AEPD-1', '1. Perfilado o valoración de sujetos', a.performsProfiling, 'ALTO'),
    criterion('AEPD-2', '2. Decisiones automatizadas o que contribuyan en gran medida a ellas', contributes, 'ALTO'),
    criterion('AEPD-3', '3. Observación, monitorización o control sistemático y exhaustivo', a.systematicMonitoring, 'ALTO'),
    criterion('AEPD-4', '4. Categorías especiales (Art. 9), datos penales (Art. 10) o de solvencia', any(a.processesSpecialCategoryData, a.processesCriminalData), 'ALTO'),
    criterion('AEPD-5', '5. Datos biométricos para identificar de manera única a una persona', a.biometricIdentification, 'ALTO'),
    criterion('AEPD-6', '6. Datos genéticos', a.geneticData, 'ALTO'),
    criterion('AEPD-7', '7. Datos a gran escala', a.largeScale, 'MEDIO'),
    criterion('AEPD-8', '8. Asociación, combinación o enlace de registros de distintos tratamientos o responsables', a.datasetCombination, 'MEDIO'),
    criterion('AEPD-9', '9. Sujetos vulnerables o en riesgo de exclusión social', a.vulnerableSubjects, 'ALTO'),
    criterion('AEPD-10', '10. Nuevas tecnologías o uso innovador de tecnologías consolidadas', ai, 'MEDIO'),
    criterion('AEPD-11', '11. Tratamientos que impidan ejercer derechos, utilizar un servicio o ejecutar un contrato', a.preventsRightsOrService, 'ALTO'),
  ];
}

/**
 * Cribado preliminar: «necesaria» si dos o más criterios concurren en cualquiera de las listas;
 * «por determinar» si las respuestas desconocidas podrían alcanzar ese umbral; «no indicada» en otro caso.
 */
export function eipdScreening(input: CriteriaInput): EipdScreening {
  const a = normalizeAnswers(input.answers);
  if (a.processesPersonalData === 'no') return 'no_indicada';
  const lists = [buildEipdCriteria(input), buildAepdCriteria(input)];
  if (lists.some((l) => l.filter((c) => c.estado === 'si').length >= 2)) return 'necesaria';
  if (lists.some((l) => l.filter((c) => c.estado !== 'no').length >= 2)) return 'por_determinar';
  return 'no_indicada';
}

/** Compatibilidad: true si la EIPD es necesaria o no puede descartarse. */
export function isEipdMandatoryFor(input: CriteriaInput): boolean {
  return eipdScreening(input) !== 'no_indicada';
}
