import type { AnnexIIIArea, AppIngestData } from '../types';

/**
 * Indicios extraídos de la documentación aportada. Solo sugieren qué revisar en la entrevista:
 * nunca deciden la clasificación ni el estado de un requisito.
 */

export interface DocumentHint {
  target: string; // id de práctica del Art. 5, «annexIII:<área>» o «ai»
  evidence: string; // fragmento del texto donde aparece
}

/** Minúsculas y sin tildes ni diéresis, para comparar con independencia de la grafía. */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const NEGATION = /\b(no|sin|nunca|ni|tampoco|jamas|excluye|excluido|prohibe|prohibido|prohibida|evita|evitar|discriminacion por)\b[^.;:\n]{0,40}$/;

/** Busca una expresión ignorando las coincidencias precedidas de una negación en la misma frase. */
function findAffirmed(text: string, pattern: RegExp): string | null {
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(Math.max(0, m.index - 60), m.index);
    if (!NEGATION.test(before)) {
      const start = Math.max(0, m.index - 40);
      return text.slice(start, m.index + m[0].length + 40).replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

const PROHIBITED_PATTERNS: Record<string, RegExp> = {
  social_scoring: /\b(puntuacion social|social scor\w*|conducta ciudadana)\b/,
  emotion_recognition_workplace_education: /\b(reconocimiento de emociones|deteccion de (emociones|estres)|analisis emocional)\b/,
  biometric_categorization_sensitive: /\b(categorizacion biometrica|biometri\w+ para (inferir|deducir))\b/,
  realtime_remote_biometric_identification: /\b(identificacion biometrica remota|reconocimiento facial en tiempo real)\b/,
  untargeted_facial_scraping: /\b(raspado|scraping)\b[^.]{0,40}\b(rostros|caras|imagenes faciales)\b/,
};

const ANNEX_III_PATTERNS: Array<[Exclude<AnnexIIIArea, 'ninguno' | 'desconocido'>, RegExp]> = [
  ['empleo', /\b(seleccion de personal|baremacion|tribunal calificador|evaluacion de candidatos|oposiciones|bolsa de empleo|proceso selectivo|promocion interna)\b/],
  ['servicios_esenciales', /\b(prestaciones? sociales?|renta (minima|garantizada)|ingreso minimo|ayudas? de emergencia social|servicios sociales|dependencia)\b/],
  ['educacion', /\b(admision (escolar|de alumnos)|evaluacion de alumnos|calificacion de examenes|becas?)\b/],
  ['justicia_democracia', /\b(procedimientos? judicial(es)?|resoluciones? judicial(es)?|juzgado|tribunal de justicia|proceso electoral)\b/],
  ['garantia_derecho', /\b(policia|investigacion penal|riesgo de reincidencia)\b/],
  ['migracion', /\b(asilo|extranjeria|control fronterizo|visados?)\b/],
  ['biometria', /\b(reconocimiento facial|biometri\w+)\b/],
  ['infraestructuras_criticas', /\b(suministro de agua|red electrica|trafico rodado|infraestructura critica)\b/],
];

const AI_PATTERN = /\b(llm|gpt|gemini|claude|ollama|openai|langchain|anthropic|mistral|modelos? de lenguaje|inteligencia artificial|machine learning|aprendizaje automatico|redes? neuronales?|embeddings?|rag)\b/;

function documentationText(ingest: AppIngestData): string {
  return normalizeText(
    [ingest.appName, ingest.appDescription, ingest.readmeContent, ingest.agentsMdContent || '', ingest.systemPrompt || ''].join('\n')
  );
}

/** Indicios de prácticas del Art. 5 en la documentación. */
export function prohibitedPracticeHints(ingest: AppIngestData): DocumentHint[] {
  const text = documentationText(ingest);
  const hints: DocumentHint[] = [];
  for (const [id, pattern] of Object.entries(PROHIBITED_PATTERNS)) {
    const evidence = findAffirmed(text, pattern);
    if (evidence) hints.push({ target: id, evidence });
  }
  return hints;
}

/** Ámbitos del Anexo III sugeridos por la documentación. */
export function annexIIIHints(ingest: AppIngestData): DocumentHint[] {
  const text = documentationText(ingest);
  const hints: DocumentHint[] = [];
  for (const [area, pattern] of ANNEX_III_PATTERNS) {
    const evidence = findAffirmed(text, pattern);
    if (evidence) hints.push({ target: `annexIII:${area}`, evidence });
  }
  return hints;
}

/** Indicio de que el sistema utiliza componentes de IA (no sustituye el examen del Art. 3.1). */
export function aiUsageHint(ingest: AppIngestData): DocumentHint | null {
  const evidence = findAffirmed(documentationText(ingest), AI_PATTERN);
  return evidence ? { target: 'ai', evidence } : null;
}
