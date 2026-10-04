/**
 * Core Type Definitions for Auditor IA · Sector Público
 */

export type ProviderType = 'gemini' | 'openrouter' | 'groq' | 'ollama' | 'llamacpp' | 'vllm' | 'custom';

export interface ApiConfig {
  provider: ProviderType;
  apiKey?: string;
  model: string;
  endpoint?: string;
  baseUrl?: string;
  temperature?: number;
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

export interface LegalEnrichmentAnswers {
  // Q1: Supervisión humana y control (Art. 14 RIA)
  humanOversightLevel: 'pre_execution' | 'post_execution' | 'fully_automated';
  supervisionRole: string; // Ej: "Funcionario tramitador / Tribunal calificador"

  // Q2: Función pública y naturaleza del acto (Art. 41 Ley 40/2015 & Anexo III RIA)
  administrativeNature: 'technical_auxiliary' | 'automated_administrative_act' | 'citizen_assessment';
  publicCompetenceNorm: string; // Ej: "Ley 39/2015 / Convocatoria OEP 2024"

  // Q3: Soberanía del dato y privacidad (RGPD / ENS RD 311/2022)
  hostingModel: 'local_on_premise' | 'eu_cloud_dpa' | 'us_hyperscaler';
  processesSpecialCategoryData: boolean; // Art. 9 RGPD
  ratActivityName: string; // Nombre actividad en Registro de Actividades de Tratamiento

  // Q4: Trazabilidad y registro de la actividad (ENS [op.exp.8] / Art. 12 RIA)
  auditLogsEnabled: boolean;
  logRetentionMonths: number;
  deterministicConfig: boolean; // Temp 0 / Seed fijada / Versión fija del LLM

  // Q5: Precisión Fáctica de Clasificación RIA (Art. 6.3 & Art. 50)
  evaluatedSubjectType?: 'normative_or_unpersonalized_docs' | 'natural_persons_or_applicants' | 'system_logs_or_technical';
  performsProfilingOrScoring?: boolean; // ¿Calcula baremación/puntuación de personas? Si es true, inhabilita Art. 6.3
  interactionAndGenerationType?: 'chatbot_or_generative' | 'internal_non_generative'; // ¿Chat o textos sintéticos (Art. 50) vs proceso interno (Riesgo Mínimo)?
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

export interface DiagnosticResult {
  riskClassification: 'prohibited' | 'high_risk' | 'transparency_risk' | 'minimal_risk' | 'not_ai_system';
  riskLabel: string;
  riskSummary: string;
  isAiSystem: boolean; // Indica si entra en el ámbito de aplicación del AI Act (Art. 3.1)
  isHighRiskAnnexIII: boolean;
  annexIIICategory?: string;
  isArticle63Derogation?: boolean; // True si aplica la excepción tasada del Art. 6.3 del RIA
  article63Justification?: string; // Motivación preceptiva conforme al Art. 6.4 del RIA
  pericialDissentAlert?: string; // Alerta en caso de discrepancia entre heurística y semántica LLM
  isAutomatedAdministrativeAct: boolean;
  ensCategory: 'BASICA' | 'MEDIA' | 'ALTA';
  ensReasoning: string;
  /** Fuente única de requisitos: prácticas prohibidas examinadas y obligaciones. */
  requirements: RequirementAssessment[];
  /** Versión del motor que produjo este diagnóstico. */
  engineVersion: string;
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
}

export interface StoredAuditRecord {
  id: string;
  createdAt: string; // ISO string
  appName: string;
  entityName: string;
  serviceDepartment: string;
  riskClassification: 'prohibited' | 'high_risk' | 'transparency_risk' | 'minimal_risk' | 'not_ai_system';
  riskLabel: string;
  ensCategory: 'BASICA' | 'MEDIA' | 'ALTA';
  isArticle63Derogation?: boolean;
  state: FullAuditState;
  llmCritique?: string;
}

