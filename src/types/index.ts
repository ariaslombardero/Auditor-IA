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

  // Q4: Trazabilidad y auditoría técnica (CCN-STIC 884D / Art. 12 RIA)
  auditLogsEnabled: boolean;
  logRetentionMonths: number;
  deterministicConfig: boolean; // Temp 0 / Seed fijada / Versión fija del LLM

  // Q5: Precisión Fáctica de Clasificación RIA (Art. 6.3 & Art. 50)
  evaluatedSubjectType?: 'normative_or_unpersonalized_docs' | 'natural_persons_or_applicants' | 'system_logs_or_technical';
  performsProfilingOrScoring?: boolean; // ¿Calcula baremación/puntuación de personas? Si es true, inhabilita Art. 6.3
  interactionAndGenerationType?: 'chatbot_or_generative' | 'internal_non_generative'; // ¿Chat o textos sintéticos (Art. 50) vs proceso interno (Riesgo Mínimo)?
}

export interface ProhibitedCheck {
  id: string;
  title: string;
  legalArticle: string;
  detected: boolean;
  explanation: string;
}

export interface ObligationItem {
  code: string;
  title: string;
  legalBasis: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  description: string;
  actionRequired: string;
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
  prohibitedChecks: ProhibitedCheck[];
  obligations: ObligationItem[];
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

