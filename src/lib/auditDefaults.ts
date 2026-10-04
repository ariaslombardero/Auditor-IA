import type { AppIngestData, LegalEnrichmentAnswers, OfficialDossierMetadata } from '../types';

/**
 * Valores iniciales del asistente (ingesta, entrevista y metadatos del expediente).
 */
export const DEFAULT_INGEST: AppIngestData = {
  appName: '',
  appDescription: '',
  readmeContent: '',
  techStack: '',
  targetAudience: 'public_employees',
};

export const DEFAULT_ANSWERS: LegalEnrichmentAnswers = {
  humanOversightLevel: 'pre_execution',
  supervisionRole: 'Funcionario tramitador / Órgano competente',
  administrativeNature: 'technical_auxiliary',
  publicCompetenceNorm: 'Ley 39/2015 del Procedimiento Administrativo Común',
  hostingModel: 'local_on_premise',
  processesSpecialCategoryData: false,
  ratActivityName: 'Apoyo a la Gestión y Elaboración Documental Administrativa',
  auditLogsEnabled: true,
  logRetentionMonths: 24,
  deterministicConfig: true,
  evaluatedSubjectType: 'normative_or_unpersonalized_docs',
  performsProfilingOrScoring: false,
  interactionAndGenerationType: 'chatbot_or_generative',
};

export const DEFAULT_METADATA: OfficialDossierMetadata = {
  entityName: 'Administración Pública Promotora',
  serviceDepartment: 'Área de Régimen Jurídico y Transformación Digital',
  functionalResponsible: 'Jefatura de Servicio Responsable',
  technicalResponsible: 'Dirección de Tecnologías de la Información',
  cisoContact: 'Responsable de Seguridad ENS (CISO)',
  dpoContact: 'Delegado de Protección de Datos (DPD / DPO)',
  auditDate: new Date().toLocaleDateString('es-ES'),
};
