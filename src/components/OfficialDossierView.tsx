import React, { useEffect, useState } from 'react';
import {
  FileDown,
  FileText,
  Copy,
  Check,
  Building,
  User,
  Shield,
  ArrowLeft,
  Calendar,
  Sparkles,
  Database,
} from 'lucide-react';
import type { FullAuditState, OfficialDossierMetadata, AppIdioma } from '../types';
import { exportOfficialDossierDocx } from '../lib/officialDossierDocx';
import { generateOfficialDossierMarkdown } from '../lib/officialDossierMd';
import { exportAuditManifestJson } from '../lib/auditManifestGenerator';
import { exportEipdDocx } from '../lib/eipdGenerator';
import { t } from '../lib/i18n';
import { buildDocumentTraceability, type DocumentTraceability } from '../lib/traceability';

interface OfficialDossierViewProps {
  state: FullAuditState;
  onUpdateMetadata: (metadata: OfficialDossierMetadata) => void;
  onBackToCodeKit: () => void;
  onGoToHardening?: () => void;
  llmCritique?: string;
  idioma: AppIdioma;
}

export const OfficialDossierView: React.FC<OfficialDossierViewProps> = ({
  state,
  onUpdateMetadata,
  onBackToCodeKit,
  onGoToHardening,
  llmCritique,
  idioma,
}) => {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingEipd, setDownloadingEipd] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const handleDownloadEipd = async () => {
    setDownloadingEipd(true);
    try {
      await exportEipdDocx(state, idioma);
    } catch (err) {
      console.error('Error generando EIPD:', err);
      alert('Error al generar el borrador de EIPD. Revisa la consola.');
    } finally {
      setDownloadingEipd(false);
    }
  };

  const metadata = state.metadata;

  const handleMetadataChange = (key: keyof OfficialDossierMetadata, val: string) => {
    onUpdateMetadata({
      ...metadata,
      [key]: val,
    });
  };

  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      await exportOfficialDossierDocx(state, llmCritique, idioma);
    } catch (err) {
      console.error('Error generando DOCX:', err);
      alert('Error al generar el documento DOCX. Revisa la consola para más detalles.');
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Huella de las entradas para identificar el documento (versión del motor, corte normativo y fecha)
  const [traceability, setTraceability] = useState<DocumentTraceability | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    buildDocumentTraceability(state).then((tr) => {
      if (!cancelled) setTraceability(tr);
    });
    return () => {
      cancelled = true;
    };
  }, [state]);

  const mdContent = generateOfficialDossierMarkdown(state, llmCritique, idioma, traceability);

  const handleDownloadMd = () => {
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expediente_Conformidad_${state.ingest.appName.replace(/\s+/g, '_')}_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyMd = () => {
    navigator.clipboard.writeText(mdContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Header Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Informe técnico preliminar
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Documento formal exhaustivo con citas legales, delimitación del Anexo III, análisis ENS y diligencias de firma para el órgano colegiado y el DPD.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="btn-primary"
              style={{ fontSize: '0.8125rem' }}
            >
              <FileDown style={{ width: 15, height: 15 }} />
              <span>{downloadingDocx ? 'Generando DOCX...' : t('btn_download_docx', idioma)}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadEipd}
              disabled={downloadingEipd}
              className="btn-secondary"
              style={{
                fontSize: '0.8125rem',
                gap: '0.35rem',
                borderColor: '#10b981',
                color: '#047857',
                background: '#ecfdf5',
                fontWeight: 600,
              }}
              title="Descargar el borrador de evaluación de impacto (Art. 35 RGPD) en Word, para completar con el DPD"
            >
              <Shield style={{ width: 15, height: 15, color: '#059669' }} />
              <span>{downloadingEipd ? 'Generando EIPD...' : 'Borrador de EIPD (.docx)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMd}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem' }}
            >
              <FileText style={{ width: 15, height: 15 }} />
              <span>{t('btn_download_md', idioma)}</span>
            </button>

            <button
              type="button"
              onClick={() => exportAuditManifestJson(state, llmCritique, idioma)}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem', gap: '0.35rem' }}
              title="Descargar JSON Maestro con toda la auditoría para cuadros de mandos y observatorios de IA"
            >
              <Database style={{ width: 15, height: 15, color: '#0284c7' }} />
              <span>JSON Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Signatures & Entity Metadata Configuration */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
          Datos Institucionales y Diligencias de Firma
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Entidad u Organismo Público Promotor</label>
            <input
              type="text"
              value={metadata.entityName}
              onChange={(e) => handleMetadataChange('entityName', e.target.value)}
              placeholder="Ej: Xunta de Galicia / Diputación Provincial / Ayuntamiento"
            />
          </div>

          <div className="form-group">
            <label>Departamento o Servicio Instructor</label>
            <input
              type="text"
              value={metadata.serviceDepartment}
              onChange={(e) => handleMetadataChange('serviceDepartment', e.target.value)}
              placeholder="Ej: Servicio de Selección y Gestión de Recursos Humanos"
            />
          </div>

          <div className="form-group">
            <label>Responsable Funcional / Instructor</label>
            <input
              type="text"
              value={metadata.functionalResponsible}
              onChange={(e) => handleMetadataChange('functionalResponsible', e.target.value)}
              placeholder="Nombre y cargo del responsable del servicio"
            />
          </div>

          <div className="form-group">
            <label>Responsable de Ciberseguridad (CISO / ENS)</label>
            <input
              type="text"
              value={metadata.cisoContact}
              onChange={(e) => handleMetadataChange('cisoContact', e.target.value)}
              placeholder="Nombre y cargo del responsable de seguridad"
            />
          </div>

          <div className="form-group">
            <label>Delegado de Protección de Datos (DPD / DPO)</label>
            <input
              type="text"
              value={metadata.dpoContact}
              onChange={(e) => handleMetadataChange('dpoContact', e.target.value)}
              placeholder="Nombre y cargo del DPD del organismo"
            />
          </div>

          <div className="form-group">
            <label>Fecha de Emisión</label>
            <input
              type="text"
              value={metadata.auditDate}
              onChange={(e) => handleMetadataChange('auditDate', e.target.value)}
              placeholder="Fecha de la auditoría"
            />
          </div>
        </div>
      </div>

      {/* Markdown Preview */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: '#f8fafc',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}>
          <span>Vista previa del informe</span>
          <button
            type="button"
            onClick={handleCopyMd}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
          >
            {copiedMd ? (
              <>
                <Check style={{ width: 12, height: 12, color: 'var(--color-success)' }} />
                <span>{t('copied', idioma)}</span>
              </>
            ) : (
              <>
                <Copy style={{ width: 12, height: 12 }} />
                <span>Copiar Markdown</span>
              </>
            )}
          </button>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '65vh', overflowY: 'auto', background: 'white' }}>
          <pre style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid var(--color-border)', fontSize: '0.8125rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {mdContent}
          </pre>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0', flexWrap: 'wrap', gap: '1rem' }}>
        <button type="button" onClick={onBackToCodeKit} className="btn-secondary">
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span>Volver al paso anterior</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.9375rem' }}
          >
            <FileDown style={{ width: 16, height: 16 }} />
            <span>{downloadingDocx ? 'Descargando...' : 'Descargar informe (.DOCX)'}</span>
          </button>

          {onGoToHardening && (
            <button
              type="button"
              onClick={onGoToHardening}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.9375rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                borderColor: '#7c3aed',
              }}
            >
              <Sparkles style={{ width: 16, height: 16 }} />
              <span>Continuar al laboratorio de pruebas (paso 6)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
