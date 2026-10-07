import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FullAuditState, RiskClassification } from '../types';
import { createDefaultAnswers } from '../lib/answersModel';
import { CASES, answeredAnswers, makeState } from './fixtures';

/**
 * Casos de referencia del motor (Fase 4). Cada caso fija las entradas y el resultado que
 * debe producir el motor; los generan las pruebas y el script `npm run ejemplos`.
 * Todos los datos son sintéticos salvo la documentación pública del analizador de ayudas.
 */

export interface ReferenceCase {
  id: string;
  titulo: string;
  /** Por qué el resultado esperado es el correcto (con el precepto aplicable). */
  fundamento: string;
  state: () => FullAuditState;
  esperado: {
    clasificacion: RiskClassification;
    excepcion63?: boolean;
    /** Alertas que deben aparecer (texto parcial). */
    alertas?: string[];
  };
}

const AGENTS_ANALIZADOR = resolve(process.cwd(), 'Resultados prueba app analizador ayudas', 'historico-no-motor', 'AGENTS.md');
const AGENTS_ANALIZADOR_ANTERIOR = resolve(process.cwd(), 'Resultados prueba app analizador ayudas', 'AGENTS.md');

function leerAgentsAnalizador(): string {
  for (const ruta of [AGENTS_ANALIZADOR, AGENTS_ANALIZADOR_ANTERIOR]) {
    try {
      return readFileSync(ruta, 'utf8');
    } catch {
      // se prueba la siguiente ubicación
    }
  }
  throw new Error('No se encuentra el AGENTS.md del analizador de ayudas');
}

export const REFERENCE_CASES: ReferenceCase[] = [
  {
    id: 'no-ia',
    titulo: 'Gestor de citas con reglas fijas',
    fundamento: 'No infiere sus resultados: aplica reglas predefinidas. No es un sistema de IA (Art. 3.1 RIA).',
    state: () =>
      makeState('Gestor de citas previas que asigna huecos con reglas fijas de calendario', answeredAnswers({ infersOutputs: 'no' }), { isAiSystem: false }),
    esperado: { clasificacion: 'not_ai_system' },
  },
  {
    id: 'prohibido',
    titulo: 'Puntuación social de la ciudadanía',
    fundamento: 'Se declara una práctica del Art. 5.1.c RIA (puntuación social): prohibida.',
    state: () =>
      makeState(
        'Sistema que puntúa la conducta de los vecinos para priorizar trámites',
        answeredAnswers({ prohibitedPractices: { ...answeredAnswers().prohibitedPractices, social_scoring: 'si' }, processesPersonalData: 'si' })
      ),
    esperado: { clasificacion: 'prohibited' },
  },
  {
    id: 'alto-riesgo-empleo',
    titulo: 'Baremación de méritos en oposiciones',
    fundamento: 'Anexo III, punto 4 (empleo) con perfilado de personas: siempre alto riesgo (Art. 6.3, último párrafo).',
    state: CASES.altoRiesgoEmpleo,
    esperado: { clasificacion: 'high_risk' },
  },
  {
    id: 'prestaciones-esenciales',
    titulo: 'Valoración de solicitudes de renta de inserción',
    fundamento: 'Anexo III, punto 5.a): evalúa la admisibilidad de personas físicas para prestaciones esenciales de asistencia pública, con perfilado.',
    state: () =>
      makeState(
        'Asistente que valora la admisibilidad de solicitudes de renta de inserción',
        answeredAnswers({
          annexIIIArea: 'servicios_esenciales',
          essentialPublicAssistance: 'si',
          performsProfiling: 'si',
          processesPersonalData: 'si',
          vulnerableSubjects: 'si',
        })
      ),
    esperado: { clasificacion: 'high_risk' },
  },
  {
    id: 'ayudas-a-entidades',
    titulo: 'Analizador de subvenciones para entidades',
    fundamento: 'Las ayudas a entidades no son prestaciones esenciales de asistencia pública a personas físicas: fuera del punto 5.a). Genera contenido: transparencia (Art. 50).',
    state: () =>
      makeState(
        'Herramienta que resume convocatorias de subvenciones dirigidas a ayuntamientos',
        answeredAnswers({ annexIIIArea: 'servicios_esenciales', essentialPublicAssistance: 'no' })
      ),
    esperado: { clasificacion: 'transparency_risk' },
  },
  {
    id: 'excepcion-6-3',
    titulo: 'Comprobación formal de documentación en un proceso selectivo',
    fundamento: 'Anexo III, punto 4, sin perfilado, tarea de procedimiento limitada (Art. 6.3.a) y sin influencia sustancial: se acogería a la excepción, pendiente de documentar (Art. 6.4) y registrar (Art. 49.2).',
    state: () =>
      makeState(
        'Herramienta que comprueba si las solicitudes de un proceso selectivo incluyen todos los documentos exigidos',
        answeredAnswers({
          annexIIIArea: 'empleo',
          performsProfiling: 'no',
          article63Condition: 'a',
          article63Facts: 'Solo marca si falta alguno de los documentos exigidos en las bases; no valora méritos ni aptitudes.',
          materialInfluence: 'no',
          processesPersonalData: 'si',
        })
      ),
    esperado: { clasificacion: 'transparency_risk', excepcion63: true },
  },
  {
    id: 'chatbot-transparencia',
    titulo: 'Asistente de información a la ciudadanía',
    fundamento: 'Interactúa con personas y genera texto, fuera del Anexo III: obligaciones de transparencia (Art. 50).',
    state: () => makeState('Chatbot que informa sobre horarios y trámites municipales', answeredAnswers()),
    esperado: { clasificacion: 'transparency_risk' },
  },
  {
    id: 'minimo',
    titulo: 'Clasificador interno de documentos',
    fundamento: 'No interactúa con personas ni genera contenido sintético y está fuera del Anexo III: riesgo mínimo (códigos de conducta voluntarios, Art. 95).',
    state: () =>
      makeState(
        'Clasificador que asigna cada documento entrante a su unidad tramitadora',
        answeredAnswers({ interactsWithPersons: 'no', generatesSyntheticContent: 'no' })
      ),
    esperado: { clasificacion: 'minimal_risk' },
  },
  {
    id: 'incompleto',
    titulo: 'Entrevista sin contestar',
    fundamento: 'Con respuestas desconocidas el motor no concluye: requiere revisión.',
    state: () => makeState('Aplicación sin información suficiente', createDefaultAnswers()),
    esperado: { clasificacion: 'requires_review' },
  },
  {
    id: 'contradictorio',
    titulo: 'Respuestas contradictorias',
    fundamento: 'Se declara una revisión humana previa y, a la vez, que no interviene ningún empleado público: requiere revisión.',
    state: () => makeState('Asistente de tramitación', answeredAnswers({ directHumanIntervention: 'no', humanOversightLevel: 'pre_execution' })),
    esperado: { clasificacion: 'requires_review' },
  },
  {
    id: 'analizador-ayudas',
    titulo: 'Analizador de convocatorias de ayudas y subvenciones (aplicación real)',
    fundamento:
      'Resume convocatorias para el personal técnico de la entidad; no evalúa a personas físicas ni decide. Fuera del Anexo III; genera contenido: transparencia (Art. 50). Se declara ejecución local, pero su documentación cita la API de Gemini: debe señalarse la discrepancia.',
    state: () =>
      makeState(
        'Asistente que extrae plazos, requisitos y criterios de convocatorias de ayudas y propone ideas de proyecto para la entidad local.',
        answeredAnswers({
          annexIIIArea: 'ninguno',
          institutionalRole: 'ambos',
          supervisionRole: 'Personal técnico de la unidad de fondos europeos',
          procedureDescription: 'El personal técnico revisa cada ficha y su cita textual antes de usarla; la aplicación no tramita ni resuelve.',
          ratActivityName: '',
          processesPersonalData: 'no',
        }),
        {
          appName: 'Analizador de convocatorias de ayudas y subvenciones',
          readmeContent: 'Analizador de convocatorias de ayudas y subvenciones para entidades locales (Diputación de Lugo).',
          agentsMdContent: leerAgentsAnalizador(),
          targetAudience: 'public_employees',
        }
      ),
    esperado: { clasificacion: 'transparency_risk', alertas: ['Alojamiento declarado y documentación discrepantes'] },
  },
];
