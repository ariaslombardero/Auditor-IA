/**
 * Core Type Definitions for Auditor IA · Sector Público
 */

/**
 * Proveedor de inferencia. Misma arquitectura que Opositor transparente: Gemini, cualquier API
 * compatible con OpenAI (la URL decide el destino) y servidores locales (Ollama, llama.cpp, vLLM).
 */
export type Provider = 'gemini' | 'compatible' | 'ollama' | 'llamacpp' | 'vllm';

export interface ApiConfig {
  provider: Provider;
  apiKey?: string;
  model: string;
  endpoint?: string;
}

/** Dónde se procesa lo que el auditor envía al modelo, según la dirección del proveedor. */
export type ProviderLocation = 'local' | 'red_interna' | 'externo' | 'ninguno';

/** Asistencia de IA empleada por el propio auditor en un diagnóstico (sin claves). */
export interface AiAssistanceRecord {
  proveedor: string;
  modelo: string;
  ubicacion: ProviderLocation;
  /** «desfasada»: el comentario se generó con respuestas distintas de las actuales. */
  estado: 'usada' | 'no_configurada' | 'bloqueada' | 'fallida' | 'desfasada';
  motivo?: string;
  /** Huella de las entradas con las que se generó el comentario. */
  inputsKey?: string;
  /** Aviso de posible discrepancia que dio el modelo con esas entradas. */
  dissentAlert?: string;
}

export type AppIdioma = 'castellano' | 'galego';

export interface AppIngestData {
  appName: string;
  appDescription: string;
  readmeContent: string;
  agentsMdContent?: string;
  systemPrompt?: string;
  techStack?: string;
  targetAudience: 'public_citizens' | 'public_employees' | 'mixed' | 'internal_only';
  isAiSystem?: boolean; // true si usa IA/LLMs, false si es software determinista tradicional
}

/** Respuesta de la entrevista. «desconocido» nunca se interpreta como ausencia de riesgo. */
export type TriState = 'si' | 'no' | 'desconocido';

/** Ámbitos del Anexo III del RIA (puntos 1 a 8). */
export type AnnexIIIArea =
  | 'ninguno'
  | 'biometria'
  | 'infraestructuras_criticas'
  | 'educacion'
  | 'empleo'
  | 'servicios_esenciales'
  | 'garantia_derecho'
  | 'migracion'
  | 'justicia_democracia'
  | 'desconocido';

/** Condición del Art. 6.3 RIA que se invoca para la excepción (son alternativas). */
export type Article63Condition = 'a' | 'b' | 'c' | 'd' | 'ninguna' | 'desconocido';

/** Papel de la entidad respecto del sistema (Art. 3, puntos 3 y 4, RIA). */
export type InstitutionalRole = 'proveedor' | 'responsable_despliegue' | 'ambos' | 'desconocido';

export type EnsLevel = 'bajo' | 'medio' | 'alto' | 'no_afectada' | 'desconocido';
export type EnsDimension = 'C' | 'I' | 'T' | 'A' | 'D';

/**
 * Entrevista jurídica (versión 2). Cada respuesta parte de «desconocido».
 */
export interface LegalEnrichmentAnswers {
  schemaVersion: 2;

  // A. Definición de sistema de IA (Art. 3.1 RIA)
  /** ¿Infiere, a partir de la información de entrada, cómo generar resultados de salida (predicciones, contenidos, recomendaciones o decisiones)? */
  infersOutputs: TriState;

  // B. Prácticas prohibidas (Art. 5 RIA): una respuesta por práctica del catálogo
  prohibitedPractices: Record<string, TriState>;

  // C. Alto riesgo (Art. 6 y Anexo III RIA)
  annexIIIArea: AnnexIIIArea;
  annexIIIUseDescription: string;
  /** Solo punto 5.a): ¿evalúa la admisibilidad de personas físicas para servicios y prestaciones esenciales de asistencia pública (o los concede, reduce, retira o reclama)? */
  essentialPublicAssistance: TriState;
  /** Elaboración de perfiles de personas físicas (Art. 3.52 RIA → Art. 4.4 RGPD). */
  performsProfiling: TriState;
  article63Condition: Article63Condition;
  /** Hechos que justifican la condición invocada del Art. 6.3. */
  article63Facts: string;
  /** ¿Influye sustancialmente en el resultado de la toma de decisiones? */
  materialInfluence: TriState;

  // D. Transparencia (Art. 50 RIA)
  interactsWithPersons: TriState;
  generatesSyntheticContent: TriState;

  // E. Papel de la entidad
  institutionalRole: InstitutionalRole;

  // F. Supervisión humana y actuación administrativa automatizada (Art. 41 Ley 40/2015)
  humanOversightLevel: 'pre_execution' | 'post_execution' | 'fully_automated' | 'desconocido';
  supervisionRole: string;
  /** ¿Interviene de forma directa un empleado público en cada acto o actuación? */
  directHumanIntervention: TriState;
  /** Descripción del funcionamiento real del procedimiento. */
  procedureDescription: string;
  publicCompetenceNorm: string;

  // G. Protección de datos (RGPD)
  processesPersonalData: TriState;
  legalBasis: 'art_6_1_c' | 'art_6_1_e' | 'otra' | 'desconocida';
  processesSpecialCategoryData: TriState; // Art. 9 RGPD
  processesCriminalData: TriState; // Art. 10 RGPD
  biometricIdentification: TriState;
  geneticData: TriState;
  systematicMonitoring: TriState;
  largeScale: TriState;
  datasetCombination: TriState;
  vulnerableSubjects: TriState;
  preventsRightsOrService: TriState;
  ratActivityName: string;
  hostingModel: 'local_on_premise' | 'eu_cloud_dpa' | 'us_hyperscaler' | 'desconocido';

  // H. Seguridad (ENS, Anexo I) y trazabilidad
  ensImpact: Record<EnsDimension, EnsLevel>;
  auditLogsEnabled: TriState;
  logRetentionMonths: number;
  deterministicConfig: TriState;
}

/** Paso de la clasificación: qué se preguntó, qué se respondió, qué regla se aplicó y con qué límites. */
export interface ClassificationStep {
  id: string;
  pregunta: string;
  respuesta: string;
  conclusion: string;
  regla: string;
  fuente: string;
  limites?: string;
}

/** Validación humana documentada de un requisito. */
export interface HumanValidation {
  revisadoPor: string;
  evidencia: string;
  fecha: string;
  /** Huella de las entradas en el momento de validar; si cambian, la validación debe revisarse. */
  inputsKey: string;
}

/** ¿El requisito es aplicable al sistema evaluado? */
export type RequirementApplicability = 'aplica' | 'no_aplica' | 'desconocida';

/**
 * Estado del requisito. Solo `acreditado` equivale a cumplimiento y exige validación humana con evidencia.
 * - declarado: lo afirma el promotor en la entrevista, sin comprobar.
 * - no_verificado: la herramienta no puede comprobarlo con la información disponible.
 * - pendiente: hay una actuación o documentación por realizar.
 * - incumple: consta un incumplimiento.
 * - no_evaluado: la herramienta no ha examinado este requisito.
 */
export type RequirementResult = 'acreditado' | 'declarado' | 'no_verificado' | 'pendiente' | 'incumple' | 'no_evaluado';

/** De dónde procede la información que sostiene el resultado. */
export type EvidenceOrigin = 'declaracion_promotor' | 'comprobacion_automatica' | 'validacion_humana';

/** Pilar del cuadro de mando al que pertenece el requisito. */
export type RequirementPillar = 'ria' | 'rgpd' | 'ens' | 'gobernanza';

/** Categoría del requisito: práctica prohibida examinada (Art. 5 RIA) u obligación. */
export type RequirementKind = 'practica_prohibida' | 'obligacion';

/**
 * Representación común de cada requisito. Es la única fuente que consumen
 * el cuadro de mando, el expediente DOCX, el Markdown y el manifiesto.
 */
export interface RequirementAssessment {
  id: string;
  kind: RequirementKind;
  pillar: RequirementPillar;
  title: string;
  norma: string;
  precepto: string;
  aplicabilidad: RequirementApplicability;
  resultado: RequirementResult;
  origen: EvidenceOrigin;
  /** Hechos en los que se basa el resultado, separando lo declarado de lo comprobado. */
  hechos: string;
  accionRequerida: string;
  evidencia?: string;
  revisadoPor?: string;
  /** Fecha ISO de la evaluación. */
  fecha: string;
  /** Fecha ISO desde la que la obligación es exigible, si está cotejada. */
  exigibleDesde?: string;
}

export type RiskClassification =
  | 'prohibited'
  | 'high_risk'
  | 'transparency_risk'
  | 'minimal_risk'
  | 'not_ai_system'
  | 'requires_review';

export interface DiagnosticResult {
  riskClassification: RiskClassification;
  riskLabel: string;
  riskSummary: string;
  /** Motivos por los que la clasificación no puede concluirse (respuestas desconocidas o contradictorias). */
  reviewReasons: string[];
  /** Traza de la clasificación: hechos, regla, fuente y límites de cada paso. */
  classificationTrace: ClassificationStep[];
  /** Corte normativo de la base de conocimiento usada. */
  normativeVersion: string;
  institutionalRole: InstitutionalRole;
  isAiSystem: boolean; // Indica si entra en el ámbito de aplicación del AI Act (Art. 3.1)
  isHighRiskAnnexIII: boolean;
  annexIIICategory?: string;
  isArticle63Derogation?: boolean; // True si aplica la excepción tasada del Art. 6.3 del RIA
  article63Justification?: string; // Motivación preceptiva conforme al Art. 6.4 del RIA
  pericialDissentAlert?: string; // Alerta en caso de discrepancia entre heurística y semántica LLM
  /** Proveedor de IA que asistió al auditor en este diagnóstico, o motivo por el que no se usó. */
  aiAssistance?: AiAssistanceRecord;
  isAutomatedAdministrativeAct: boolean;
  ensCategory: 'BASICA' | 'MEDIA' | 'ALTA';
  ensReasoning: string;
  /** true si la categoría no procede de la valoración de todas las dimensiones (Anexo I ENS). */
  ensCategoryIsOrientative: boolean;
  /** Fuente única de requisitos: prácticas prohibidas examinadas y obligaciones. */
  requirements: RequirementAssessment[];
  /** Versión del motor que produjo este diagnóstico. */
  engineVersion: string;
  /** Huella de las entradas (ingesta y entrevista) con las que se calculó este diagnóstico. */
  inputsKey?: string;
  /** Preguntas visibles de la entrevista que siguen sin contestar. */
  pendingAnswers?: number;
  redFlags: string[];
  recommendations: string[];
  executiveSummary: string;
}

export type RoleViewMode = 'juridico' | 'tecnico' | 'completo';
export type SystemArchetype = 'documental' | 'chatbot' | 'agente';

export interface CodeKit {
  reactBannerCode: string;
  htmlBannerCode: string;
  docxFooterSnippet: string;
  envSecurityGuide: string;
  transparencyDisclaimerEs: string;
  transparencyDisclaimerGl: string;
}

export interface OfficialDossierMetadata {
  entityName: string;
  serviceDepartment: string;
  functionalResponsible: string;
  technicalResponsible: string;
  dpoContact: string;
  cisoContact: string;
  auditDate: string;
}

export interface FullAuditState {
  ingest: AppIngestData;
  answers: LegalEnrichmentAnswers;
  diagnostic: DiagnosticResult | null;
  codeKit: CodeKit | null;
  metadata: OfficialDossierMetadata;
  analyzing: boolean;
  /** Validaciones humanas documentadas, por identificador de requisito. */
  validations?: Record<string, HumanValidation>;
}

export interface StoredAuditRecord {
  /** Identificador único de esta revisión. */
  id: string;
  /** Versión del formato del registro. */
  schemaVersion?: number;
  /** Expediente al que pertenece: las revisiones de un mismo análisis comparten auditId. */
  auditId: string;
  /** Número de revisión dentro del expediente (1, 2, 3…). Las anteriores se conservan. */
  revision: number;
  /** Procedencia: creado en este navegador o importado de una copia. */
  origen?: 'local' | 'importado';
  createdAt: string; // ISO string
  appName: string;
  entityName: string;
  serviceDepartment: string;
  riskClassification: RiskClassification;
  riskLabel: string;
  ensCategory: 'BASICA' | 'MEDIA' | 'ALTA';
  isArticle63Derogation?: boolean;
  state: FullAuditState;
  llmCritique?: string;
}

