import type { AppIngestData, LegalEnrichmentAnswers, OfficialDossierMetadata } from '../types';
import { createDefaultAnswers } from './answersModel';

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

/** Entrevista sin contestar: todas las respuestas parten de «desconocido». */
export const DEFAULT_ANSWERS: LegalEnrichmentAnswers = createDefaultAnswers();

export const DEFAULT_METADATA: OfficialDossierMetadata = {
  entityName: 'Administración Pública Promotora',
  serviceDepartment: 'Área de Régimen Jurídico y Transformación Digital',
  functionalResponsible: 'Jefatura de Servicio Responsable',
  technicalResponsible: 'Dirección de Tecnologías de la Información',
  cisoContact: 'Responsable de Seguridad ENS (CISO)',
  dpoContact: 'Delegado de Protección de Datos (DPD / DPO)',
  auditDate: new Date().toLocaleDateString('es-ES'),
};
