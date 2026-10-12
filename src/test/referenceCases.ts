import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FullAuditState, RiskClassification } from '../types';
import type { EipdScreening } from '../lib/eipdCriteria';
import { createDefaultAnswers } from '../lib/answersModel';
import { CASES, answeredAnswers, makeState } from './fixtures';

/**
 * Casos de referencia del motor (Fase 4). Cada caso fija las entradas y el resultado que
 * debe producir el motor; los generan las pruebas y el script `npm run ejemplos`.
 * Todos los datos son sintéticos salvo los casos de aplicaciones reales (`real`), que usan la
 * documentación pública de sus repositorios, guardada en src/test/casos-reales/ con su commit.
 * En esos casos las respuestas de la entrevista son un borrador hecho a partir de esa documentación:
 * debe confirmarlas el autor de cada aplicación.
 */

export interface ReferenceCase {
  id: string;
  titulo: string;
  /** Por qué el resultado esperado es el correcto (con el precepto aplicable). */
  fundamento: string;
  state: () => FullAuditState;
  /** Aplicación real: documentación pública del repositorio y commit indicados. */
  real?: { repositorio: string; commit: string };
  esperado: {
    clasificacion: RiskClassification;
    excepcion63?: boolean;
    /** Alertas que deben aparecer (texto parcial). */
    alertas?: string[];
    /** Resultado del cribado de la EIPD (Art. 35 RGPD), si el caso lo fija. */
    eipd?: EipdScreening;
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

const CASOS_REALES = resolve(process.cwd(), 'src', 'test', 'casos-reales');

/** Documentación pública de una aplicación real (instantánea en src/test/casos-reales/). */
function casoReal(nombre: string): { readmeContent: string; techStack: string } {
  const readmeContent = readFileSync(resolve(CASOS_REALES, `${nombre}.README.md`), 'utf8');
  let techStack = '';
  try {
    const pkg = JSON.parse(readFileSync(resolve(CASOS_REALES, `${nombre}.package.json`), 'utf8')) as { dependencies?: Record<string, string> };
    techStack = Object.keys(pkg.dependencies ?? {}).join(', ');
  } catch {
    // sin package.json (aplicación en Python): la tecnología consta en el README
  }
  return { readmeContent, techStack };
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
    real: { repositorio: 'https://github.com/ariaslombardero/Analizador-de-ayudas-y-subvenciones', commit: 'c672b9a93f75a5e36c5c8ab6910afff901ba9642' },
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
          ...casoReal('analizador-ayudas'),
          agentsMdContent: leerAgentsAnalizador(),
          targetAudience: 'public_employees',
        }
      ),
    esperado: { clasificacion: 'transparency_risk', alertas: ['Alojamiento declarado y documentación discrepantes'] },
  },
  {
    id: 'calculadora-lcsp',
    titulo: 'Calculadora de plazos de la LCSP (aplicación real, sin IA)',
    real: { repositorio: 'https://github.com/ariaslombardero/Calculadora-LCSP-Lugo', commit: '42980eee3dff57d7cf514d9bfa74369917276b03' },
    fundamento:
      'Calcula vencimientos con reglas fijas (cómputo de días, festivos, prórroga al día hábil siguiente) con date-fns, sin ningún modelo. No infiere sus resultados: no es un sistema de IA (Art. 3.1 RIA). No trata datos personales.',
    state: () =>
      makeState(
        'Calculadora de plazos administrativos de la Ley 9/2017 con el calendario de festivos de Lugo y Galicia.',
        answeredAnswers({ infersOutputs: 'no', processesPersonalData: 'no', ratActivityName: '' }),
        { appName: 'Calculadora de plazos LCSP – Lugo', ...casoReal('calculadora-lcsp'), isAiSystem: false, targetAudience: 'public_employees' }
      ),
    esperado: { clasificacion: 'not_ai_system', eipd: 'no_indicada' },
  },
  {
    id: 'monitor-boe',
    titulo: 'Monitor de edictos concursales del BOE (aplicación real, sin IA, con datos personales)',
    real: { repositorio: 'https://github.com/ariaslombardero/Monitor-BOE', commit: 'a8fbe06055689f897af8e013b8ff1f5898ffa769' },
    fundamento:
      'Extrae con reglas fijas (scraping) los edictos concursales del Tablón Edictal Judicial Único del BOE: no es un sistema de IA (Art. 3.1 RIA). Pero recoge el nombre y el DNI o NIE de deudores que pueden ser personas físicas: son datos de solvencia (lista de la AEPD, criterio 4), y que procedan de una fuente pública no los excluye del RGPD. La necesidad de EIPD queda por determinar hasta valorar si el tratamiento es a gran escala o supone una observación sistemática.',
    state: () =>
      makeState(
        'Monitor que descarga cada día los edictos concursales del BOE y extrae deudor, NIF, número de concurso y fecha del auto.',
        answeredAnswers({
          infersOutputs: 'no',
          processesPersonalData: 'si',
          legalBasis: 'desconocida',
          processesSolvencyData: 'si',
          largeScale: 'desconocido',
          systematicMonitoring: 'desconocido',
          breachProcedure: 'desconocido',
          hostingModel: 'desconocido',
          ratActivityName: '',
        }),
        {
          appName: 'Monitor BOE — Edictos concursales',
          ...casoReal('monitor-boe'),
          techStack: 'Python, Streamlit, BeautifulSoup4, lxml, Requests, Pandas, openpyxl',
          isAiSystem: false,
          targetAudience: 'public_employees',
        }
      ),
    esperado: { clasificacion: 'not_ai_system', eipd: 'por_determinar' },
  },
  {
    id: 'notas-de-prensa',
    titulo: 'Asistente de notas de prensa (aplicación real, con IA)',
    real: { repositorio: 'https://github.com/ariaslombardero/Asistente-notas-de-prensa', commit: 'c57534300ec40ff35ccdb803e42610bc0a3cb4a1' },
    fundamento:
      'Genera borradores de notas de prensa y publicaciones para redes sociales a partir de actas y resoluciones; el gabinete de comunicación los revisa antes de publicarlos. Fuera del Anexo III; genera contenido: transparencia (Art. 50). En la Diputación se ejecuta con modelos locales, pero la versión publicada usa la API de Gemini: debe señalarse la discrepancia y comprobar qué proveedor procesa los datos reales. Como el gabinete revisa y aprueba cada texto antes de publicarlo, no es obligatorio divulgar que se generó con IA (Art. 50.4, párrafo segundo), siempre que pueda acreditarse ese control editorial.',
    state: () =>
      makeState(
        'Asistente que redacta borradores de notas de prensa y publicaciones para redes sociales a partir de actas, resoluciones e informes.',
        answeredAnswers({
          interactsWithPersons: 'no',
          generatesSyntheticContent: 'si',
          publishesPublicInterestText: 'si',
          editorialReview: 'si',
          institutionalRole: 'ambos',
          supervisionRole: 'Personal del gabinete de comunicación',
          procedureDescription: 'El gabinete revisa y corrige cada borrador antes de publicarlo; la aplicación no publica nada por sí misma.',
          processesPersonalData: 'si',
          ratActivityName: '',
          hostingModel: 'local_on_premise',
          breachProcedure: 'desconocido',
        }),
        { appName: 'Asistente de notas de prensa', ...casoReal('notas-de-prensa'), isAiSystem: true, targetAudience: 'public_employees' }
      ),
    esperado: { clasificacion: 'transparency_risk', alertas: ['Alojamiento declarado y documentación discrepantes'] },
  },
  {
    id: 'oasis-madrid',
    titulo: 'Navegador de confort térmico con datos abiertos de Madrid (aplicación real, sin IA)',
    real: { repositorio: 'https://github.com/ariaslombardero/Oasis-Madrid', commit: '3d95ae2503086fc83a1665acf6e2ee5c0f3f0b1d' },
    fundamento:
      'Calcula rutas y riesgo térmico con datos abiertos mediante fórmulas fijas: la interpolación IDW es una media ponderada por la distancia, no infiere sus resultados, aunque su README la llame «técnica de aprendizaje automático». No es un sistema de IA (Art. 3.1 RIA); el indicio por palabras clave lo señala y la persona decide. Solo informa a la ciudadanía: no produce actos administrativos, así que el Art. 41 de la Ley 40/2015 no aplica. Queda por valorar si trata datos personales: recibe direcciones y ubicaciones para calcular rutas, aunque no las guarde.',
    state: () =>
      makeState(
        'Navegador de confort térmico y rutas saludables que combina datos abiertos del Ayuntamiento de Madrid.',
        answeredAnswers({
          infersOutputs: 'no',
          producesAdministrativeActs: 'no',
          humanOversightLevel: 'fully_automated',
          supervisionRole: '',
          procedureDescription: 'Muestra a la ciudadanía mapas y rutas calculados con datos abiertos; no tramita ni resuelve.',
          processesPersonalData: 'desconocido',
          hostingModel: 'desconocido',
          breachProcedure: 'desconocido',
          ratActivityName: '',
        }),
        { appName: 'OasisMadrid', ...casoReal('oasis-madrid'), isAiSystem: false, targetAudience: 'public_citizens' }
      ),
    esperado: { clasificacion: 'not_ai_system' },
  },
];
