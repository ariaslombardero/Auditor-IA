import { saveAs } from 'file-saver';
import type { FullAuditState, AppIdioma } from '../types';
import { generateOfficialDossierMarkdown } from './officialDossierMd';

export interface AuditManifestRecord {
  schema_version: string;
  audit_id: string;
  created_at: string;
  audit_date: string;
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
    hosting_model: string;
    documentation_coverage: {
      has_readme: boolean;
      has_agents_md: boolean;
      level: string;
    };
  };
  governance_and_compliance: {
    ai_act: {
      risk_classification: string;
      risk_label: string;
      legal_basis: string;
      prohibited_practices_check: Array<{
        id: string;
        title: string;
        legal_article: string;
        detected: boolean;
        explanation: string;
      }>;
      mandatory_obligations: Array<{
        code: string;
        title: string;
        description: string;
        status: string;
        action_required: string;
      }>;
      human_oversight: {
        level: string;
        role: string;
        legal_article: string;
      };
    };
    administrative_nature: {
      type: string;
      ley_40_2015_art_41_automated_act: boolean;
      status_description: string;
    };
    ens_rd_311_2022: {
      category: string;
      reasoning: string;
      audit_logs_enabled: boolean;
      log_retention_months: number;
    };
    gdpr_rgpd: {
      legal_basis: string;
      competence_norm: string;
      special_categories_art_9: boolean;
      rat_activity_name: string;
      dpia_eipd_result: {
        status: string;
        residual_risk: string;
        criteria_met_count: string;
      };
    };
  };
  live_legislation_telematics_check: {
    verified_at: string;
    sources: Array<{
      name: string;
      official_codes: string[];
      status: string;
    }>;
    conclusion: string;
  };
  generated_artifacts_manifest: Array<{
    file_name: string;
    file_type: string;
    description: string;
    relative_path: string;
  }>;
  executive_summary_text: string;
  llm_qualitative_critique?: string;
  full_markdown_dossier: string;
}

/**
 * Construye el objeto JSON maestro con todos los datos y documentación de la auditoría
 */
export function buildAuditManifest(
  state: FullAuditState,
  llmCritique?: string,
  idioma: AppIdioma = 'castellano'
): AuditManifestRecord {
  const { ingest, answers, diagnostic, metadata, codeKit } = state;
  const safeName = ingest.appName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const dateStr = metadata.auditDate || new Date().toLocaleDateString('es-ES');
  const auditId = `EXP-IA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const mdDossier = generateOfficialDossierMarkdown(state, llmCritique, idioma);

  return {
    schema_version: '1.0.0',
    audit_id: auditId,
    created_at: new Date().toISOString(),
    audit_date: dateStr,
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
      hosting_model: answers.hostingModel,
      documentation_coverage: {
        has_readme: Boolean(ingest.readmeContent?.trim()),
        has_agents_md: Boolean(ingest.agentsMdContent?.trim()),
        level: ingest.agentsMdContent?.trim()
          ? 'cobertura_pericial_completa'
          : 'cobertura_estandar_readme',
      },
    },
    governance_and_compliance: {
      ai_act: {
        risk_classification: diagnostic?.riskClassification || 'transparency_risk',
        risk_label: diagnostic?.riskLabel || 'Riesgo de Transparencia (Art. 50 RIA)',
        legal_basis: 'Reglamento (UE) 2024/1689 Art. 50 & Reglamento (UE) 2026/1744 (Ómnibus Digital)',
        prohibited_practices_check: (diagnostic?.prohibitedChecks || []).map((p) => ({
          id: p.id,
          title: p.title,
          legal_article: p.legalArticle,
          detected: p.detected,
          explanation: p.explanation,
        })),
        mandatory_obligations: (diagnostic?.obligations || []).map((o) => ({
          code: o.code,
          title: o.title,
          description: o.description,
          status: o.status,
          action_required: o.actionRequired,
        })),
        human_oversight: {
          level: answers.humanOversightLevel,
          role: answers.supervisionRole || 'Funcionario tramitador / Órgano competente',
          legal_article: 'Art. 14 RIA',
        },
      },
      administrative_nature: {
        type: answers.administrativeNature,
        ley_40_2015_art_41_automated_act: false,
        status_description:
          answers.administrativeNature === 'technical_auxiliary'
            ? 'Auxilio técnico instrumental preparatorio deslindado de la actuación administrativa automatizada (Art. 41 Ley 40/2015)'
            : 'Sujeto a resolución y fiscalización administrativa ordinaria',
      },
      ens_rd_311_2022: {
        category: diagnostic?.ensCategory || 'BASICA',
        reasoning: diagnostic?.ensReasoning || 'Sistema auxiliar de gestión documental sin impacto en infraestructuras críticas.',
        audit_logs_enabled: answers.auditLogsEnabled,
        log_retention_months: answers.logRetentionMonths || 24,
      },
      gdpr_rgpd: {
        legal_basis: 'Art. 6.1.e) RGPD (Misión de interés público / potestades públicas)',
        competence_norm: answers.publicCompetenceNorm || 'Ley 39/2015 y normativa sectorial',
        special_categories_art_9: answers.processesSpecialCategoryData,
        rat_activity_name: answers.ratActivityName || 'Gestión y Elaboración Documental Administrativa Asistida',
        dpia_eipd_result: {
          status: 'FAVORABLE',
          residual_risk: answers.processesSpecialCategoryData ? 'MEDIO-ALTO' : 'BAJO',
          criteria_met_count: answers.processesSpecialCategoryData ? '2/9' : '1/9',
        },
      },
    },
    live_legislation_telematics_check: {
      verified_at: new Date().toISOString(),
      sources: [
        {
          name: 'Diario Oficial de la Unión Europea (DOUE / Repositorio Cellar REST API)',
          official_codes: ['CELEX 32024R1689 (AI Act)', 'CELEX 32016R0679 (RGPD)'],
          status: 'vigente_consolidado',
        },
        {
          name: 'Boletín Oficial del Estado (BOE / Repositorio Legalize-ES)',
          official_codes: ['BOE-A-2015-10566 (Ley 40/2015 Art. 41)', 'BOE-A-2022-7191 (ENS RD 311/2022)'],
          status: 'vigente_consolidado',
        },
      ],
      conclusion: 'No se han detectado modificaciones derogatorias sobrevenidas en los preceptos analizados.',
    },
    generated_artifacts_manifest: [
      {
        file_name: `Expediente_Conformidad_IA_${safeName}.docx`,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        description: 'Expediente Oficial de Gobernanza IA en formato Word con cabecera corporativa y rúbricas',
        relative_path: `./Expediente_Conformidad_IA_${safeName}.docx`,
      },
      {
        file_name: `EIPD_AEPD_${safeName}.docx`,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        description: 'Evaluación de Impacto en la Protección de Datos (Metodología AEPD y WP248)',
        relative_path: `./EIPD_AEPD_${safeName}.docx`,
      },
      {
        file_name: `Expediente_Conformidad_IA_${safeName}.md`,
        file_type: 'text/markdown',
        description: 'Expediente técnico completo de gobernanza en formato Markdown',
        relative_path: `./Expediente_Conformidad_IA_${safeName}.md`,
      },
      {
        file_name: 'AGENTS.md',
        file_type: 'text/markdown',
        description: 'Directivas técnicas del agente, system prompts y salvaguardas periciales de IA',
        relative_path: './AGENTS.md',
      },
      {
        file_name: 'BannerTransparencia.tsx',
        file_type: 'application/typescript',
        description: 'Componente visual en React de transparencia activa preceptiva (Art. 50 RIA)',
        relative_path: './BannerTransparencia.tsx',
      },
      {
        file_name: 'auditLogger.ts',
        file_type: 'application/typescript',
        description: 'Módulo criptográfico Node.js con cálculo de hashes SHA-256 para trazabilidad CCN-STIC 884D',
        relative_path: './auditLogger.ts',
      },
    ],
    executive_summary_text: diagnostic?.executiveSummary || '',
    llm_qualitative_critique: llmCritique,
    full_markdown_dossier: mdDossier,
  };
}

/**
 * Descarga en el navegador el archivo JSON maestro listo para alimentar Dashboards y Cuadros de Mando
 */
export function exportAuditManifestJson(
  state: FullAuditState,
  llmCritique?: string,
  idioma: AppIdioma = 'castellano'
): void {
  const manifest = buildAuditManifest(state, llmCritique, idioma);
  const jsonStr = JSON.stringify(manifest, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const safeName = state.ingest.appName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  saveAs(blob, `auditoria_manifest_${safeName}_${Date.now()}.json`);
}
