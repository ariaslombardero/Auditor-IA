import { saveAs } from 'file-saver';
import type { FullAuditState, AppIdioma, RequirementAssessment, DiagnosticResult, AiAssistanceRecord } from '../types';
import { generateOfficialDossierMarkdown } from './officialDossierMd';
import { unaccreditedRequirements } from './assessmentModel';
import { effectiveDiagnostic } from './validations';
import { computeExecutiveVerdict } from './dashboardPillars';
import { buildAepdCriteria, buildEipdCriteria, eipdScreening } from './eipdCriteria';
import { buildDocumentTraceability, ENGINE_VERSION, NORMATIVE_SNAPSHOT, type DocumentTraceability } from './traceability';

export interface AuditManifestRecord {
  schema_version: string;
  audit_id: string;
  created_at: string;
  audit_date: string;
  traceability: {
    engine_version: string;
    normative_snapshot: string;
    input_fingerprint_sha256: string | null;
    /** Proveedor de IA que asistió al auditor (sin claves) o motivo por el que no se usó. */
    ai_assistance: AiAssistanceRecord | null;
  };
  entity: {
    name: string;
    department: string;
    functional_responsible: string;
    technical_responsible: string;
    ciso_contact: string;
    dpo_contact: string;
  };
  application: {
    name: string;
    description: string;
    source_repository?: string;
    target_audience: string;
    tech_stack: string;
    declared_hosting_model: string;
    documentation_provided: {
      has_readme: boolean;
      has_agents_md: boolean;
    };
  };
  governance_and_compliance: {
    ai_act: {
      risk_classification: string;
      /** Alertas del motor para la revisión (DOC-14). */
      review_alerts: string[];
      recommendations: string[];
      risk_label: string;
      review_reasons: string[];
      institutional_role: string;
      classification_trace: DiagnosticResult['classificationTrace'];
      basis: string;
      llm_dissent_alert: string | null;
      human_oversight: {
        declared_level: string;
        declared_role: string;
      };
    };
    administrative_nature: {
      declared_direct_human_intervention: string;
      declared_procedure: string;
      ley_40_2015_art_41_automated_act: boolean;
      verified: boolean;
    };
    ens_rd_311_2022: {
      indicative_category: string;
      reasoning: string;
      declared_audit_logs_enabled: string;
      declared_log_retention_months: number;
    };
    gdpr_rgpd: {
      legal_basis: string;
      declared_competence_norm: string;
      declared_personal_data: string;
      declared_special_categories_art_9: string;
      declared_criminal_data_art_10: string;
      declared_rat_activity_name: string;
      dpia_eipd_screening: {
        status: 'necesaria' | 'no_indicada' | 'por_determinar';
        wp248_criteria_met: string;
        aepd_list_criteria_met: string;
        residual_risk: string;
      };
    };
    /** Fuente única de requisitos (modelo común). */
    requirements: RequirementAssessment[];
    summary: {
      unaccredited_requirements: number;
      verdict: string;
    };
  };
  normative_sources: {
    snapshot: string;
    verified_at_emission: boolean;
    note: string;
  };
  generated_artifacts_manifest: Array<{
    file_name: string;
    file_type: string;
    description: string;
    relative_path: string;
  }>;
  executive_summary_text: string;
  llm_qualitative_critique?: string;
  llm_qualitative_critique_note?: string;
  full_markdown_dossier: string;
}

/**
 * Construye el objeto JSON maestro con todos los datos y documentación de la auditoría.
 * Expresa el mismo diagnóstico que el DOCX y el Markdown (modelo común de requisitos).
 */
export function buildAuditManifest(
  state: FullAuditState,
  llmCritique?: string,
  idioma: AppIdioma = 'castellano',
  traceability?: DocumentTraceability
): AuditManifestRecord {
  const { ingest, answers, metadata } = state;
  const diagnostic = effectiveDiagnostic(state);
  const safeName = ingest.appName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const dateStr = metadata.auditDate || new Date().toLocaleDateString('es-ES');
  const auditId = `EXP-IA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const requirements = diagnostic?.requirements || [];
  const verdict = diagnostic ? computeExecutiveVerdict(diagnostic) : null;
  const eipdCriteria = buildEipdCriteria(state);
  const aepdCriteria = buildAepdCriteria(state);
  const eipdStatus = eipdScreening(state);

  const mdDossier = generateOfficialDossierMarkdown(state, llmCritique, idioma, traceability);

  return {
    schema_version: '2.0.0',
    audit_id: auditId,
    created_at: new Date().toISOString(),
    audit_date: dateStr,
    traceability: {
      engine_version: traceability?.engineVersion || diagnostic?.engineVersion || ENGINE_VERSION,
      normative_snapshot: NORMATIVE_SNAPSHOT,
      input_fingerprint_sha256: traceability?.inputFingerprint || null,
      ai_assistance: diagnostic?.aiAssistance ?? null,
    },
    entity: {
      name: metadata.entityName || 'Administración Pública Promotora',
      department: metadata.serviceDepartment || 'Área de Régimen Jurídico y Transformación Digital',
      functional_responsible: metadata.functionalResponsible || 'Jefatura de Servicio Responsable',
      technical_responsible: metadata.technicalResponsible || 'Dirección de Tecnologías de la Información',
      ciso_contact: metadata.cisoContact || 'Responsable de Seguridad ENS (CISO)',
      dpo_contact: metadata.dpoContact || 'Delegado de Protección de Datos (DPD / DPO)',
    },
    application: {
      name: ingest.appName,
      description: ingest.appDescription,
      target_audience: ingest.targetAudience,
      tech_stack: ingest.techStack || '',
      declared_hosting_model: answers.hostingModel,
      documentation_provided: {
        has_readme: Boolean(ingest.readmeContent?.trim()),
        has_agents_md: Boolean(ingest.agentsMdContent?.trim()),
      },
    },
    governance_and_compliance: {
      ai_act: {
        risk_classification: diagnostic?.riskClassification || 'sin_diagnostico',
        risk_label: diagnostic?.riskLabel || 'Sin diagnóstico',
        review_reasons: diagnostic?.reviewReasons || [],
        review_alerts: diagnostic?.redFlags || [],
        recommendations: diagnostic?.recommendations || [],
        institutional_role: diagnostic?.institutionalRole || 'desconocido',
        classification_trace: diagnostic?.classificationTrace || [],
        basis: 'Clasificación preliminar basada en lo declarado. Reglamento (UE) 2024/1689, modificado por el Reglamento (UE) 2026/1744.',
        llm_dissent_alert: diagnostic?.pericialDissentAlert || null,
        human_oversight: {
          declared_level: answers.humanOversightLevel,
          declared_role: answers.supervisionRole || '',
        },
      },
      administrative_nature: {
        declared_direct_human_intervention: answers.directHumanIntervention,
        declared_procedure: answers.procedureDescription || '',
        ley_40_2015_art_41_automated_act: Boolean(diagnostic?.isAutomatedAdministrativeAct),
        verified: false,
      },
      ens_rd_311_2022: {
        indicative_category: diagnostic?.ensCategory || 'BASICA',
        reasoning: diagnostic?.ensReasoning || '',
        declared_audit_logs_enabled: answers.auditLogsEnabled,
        declared_log_retention_months: answers.logRetentionMonths || 0,
      },
      gdpr_rgpd: {
        legal_basis: 'No verificada: la base jurídica (Art. 6.1 RGPD) debe confirmarla el DPD.',
        declared_competence_norm: answers.publicCompetenceNorm || '',
        declared_personal_data: answers.processesPersonalData,
        declared_special_categories_art_9: answers.processesSpecialCategoryData,
        declared_criminal_data_art_10: answers.processesCriminalData,
        declared_rat_activity_name: answers.ratActivityName || '',
        dpia_eipd_screening: {
          status: eipdStatus,
          wp248_criteria_met: `${eipdCriteria.filter((c) => c.applies).length}/${eipdCriteria.length}`,
          aepd_list_criteria_met: `${aepdCriteria.filter((c) => c.applies).length}/${aepdCriteria.length}`,
          residual_risk: 'no_calculado',
        },
      },
      requirements,
      summary: {
        unaccredited_requirements: unaccreditedRequirements(requirements).length,
        verdict: verdict?.label || 'Sin diagnóstico',
      },
    },
    normative_sources: {
      snapshot: NORMATIVE_SNAPSHOT,
      verified_at_emission: false,
      note: 'Los preceptos proceden de la base de conocimiento de la herramienta; su vigencia no se ha verificado al emitir este manifiesto.',
    },
    generated_artifacts_manifest: [
      {
        file_name: `Expediente_Conformidad_IA_${safeName}.docx`,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        description: 'Informe técnico preliminar en formato Word, pendiente de revisión y firma',
        relative_path: `./Expediente_Conformidad_IA_${safeName}.docx`,
      },
      {
        file_name: `EIPD_AEPD_${safeName}.docx`,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        description: 'Borrador de Evaluación de Impacto en la Protección de Datos para completar por el DPD',
        relative_path: `./EIPD_AEPD_${safeName}.docx`,
      },
      {
        file_name: `Expediente_Conformidad_IA_${safeName}.md`,
        file_type: 'text/markdown',
        description: 'Informe técnico preliminar en formato Markdown',
        relative_path: `./Expediente_Conformidad_IA_${safeName}.md`,
      },
      {
        file_name: 'AGENTS.md',
        file_type: 'text/markdown',
        description: 'Directivas técnicas del agente declaradas por el promotor',
        relative_path: './AGENTS.md',
      },
      {
        file_name: 'BannerTransparencia.tsx',
        file_type: 'application/typescript',
        description: 'Componente visual en React para los avisos de transparencia (Art. 50 RIA)',
        relative_path: './BannerTransparencia.tsx',
      },
      {
        file_name: 'auditLogger.ts',
        file_type: 'application/typescript',
        description: 'Módulo Node.js (requiere servidor) de registro de actividad con huellas SHA-256 ([op.exp.8] ENS)',
        relative_path: './auditLogger.ts',
      },
    ],
    executive_summary_text: diagnostic?.executiveSummary || '',
    llm_qualitative_critique: llmCritique,
    llm_qualitative_critique_note: llmCritique
      ? 'Contenido generado por un modelo de lenguaje, no verificado. No modifica la clasificación ni acredita requisitos.'
      : undefined,
    full_markdown_dossier: mdDossier,
  };
}

/**
 * Descarga en el navegador el archivo JSON maestro listo para alimentar Dashboards y Cuadros de Mando
 */
export async function exportAuditManifestJson(
  state: FullAuditState,
  llmCritique?: string,
  idioma: AppIdioma = 'castellano'
): Promise<void> {
  const traceability = await buildDocumentTraceability(state);
  const manifest = buildAuditManifest(state, llmCritique, idioma, traceability);
  const jsonStr = JSON.stringify(manifest, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const safeName = state.ingest.appName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  saveAs(blob, `auditoria_manifest_${safeName}_${Date.now()}.json`);
}
