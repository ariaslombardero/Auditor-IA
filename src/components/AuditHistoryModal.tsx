import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  History,
  Download,
  Upload,
  Trash2,
  FolderOpen,
  FileText,
  Shield,
  Search,
  CheckCircle,
  Calendar,
  Building,
  AlertTriangle,
} from 'lucide-react';
import type { AppIdioma, StoredAuditRecord } from '../types';
import {
  getStoredAudits,
  deleteAuditRecord,
  clearAuditHistory,
  exportHistoryJson,
  importHistoryJson,
} from '../lib/auditHistoryService';
import { exportOfficialDossierDocx } from '../lib/officialDossierDocx';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadAudit: (record: StoredAuditRecord) => void;
  idioma: AppIdioma;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadAudit,
  idioma,
}) => {
  const [audits, setAudits] = useState<StoredAuditRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGl = idioma === 'galego';

  useEffect(() => {
    if (isOpen) {
      setAudits(getStoredAudits());
      setSearchTerm('');
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDelete = (id: string, appName: string) => {
    if (window.confirm(isGl ? `¿Eliminar a auditoría de "${appName}"?` : `¿Eliminar la auditoría de "${appName}"?`)) {
      const updated = deleteAuditRecord(id);
      setAudits(updated);
      showFeedback(isGl ? 'Expediente eliminado do historial' : 'Expediente eliminado del historial');
    }
  };

  const handleClearAll = () => {
    if (window.confirm(isGl ? '¿Baleirar todo o historial de auditorías locais?' : '¿Vaciar todo el historial de auditorías locales?')) {
      clearAuditHistory();
      setAudits([]);
      showFeedback(isGl ? 'Historial baleirado' : 'Historial vaciado');
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportHistoryJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditor_ia_historial_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback(isGl ? 'Copia de seguridade JSON descargada' : 'Copia de seguridad JSON descargada');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importHistoryJson(content);
      if (res.success) {
        setAudits(getStoredAudits());
        showFeedback(isGl ? `${res.importedCount} auditorías importadas con éxito` : `${res.importedCount} auditorías importadas con éxito`);
      } else {
        alert(res.error || 'Error al importar archivo');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredAudits = audits.filter(
    (a) =>
      a.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.riskLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadge = (record: StoredAuditRecord) => {
    if (record.riskClassification === 'not_ai_system') {
      return {
        bg: '#f1f5f9',
        color: '#475569',
        border: '#cbd5e1',
        label: isGl ? 'Nivel 0 · Fóra de Ámbito (Art. 3.1)' : 'Nivel 0 · Fuera de Ámbito (Art. 3.1)',
      };
    }
    if (record.riskClassification === 'prohibited') {
      return {
        bg: '#fef2f2',
        color: '#991b1b',
        border: '#f87171',
        label: isGl ? 'Nivel 1 · Prohibido (Art. 5)' : 'Nivel 1 · Prohibido (Art. 5)',
      };
    }
    if (record.riskClassification === 'high_risk') {
      return {
        bg: '#fff7ed',
        color: '#c2410c',
        border: '#fdba74',
        label: isGl ? 'Nivel 2 · Alto Risco (Anexo III)' : 'Nivel 2 · Alto Riesgo (Anexo III)',
      };
    }
    if (record.isArticle63Derogation) {
      return {
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#93c5fd',
        label: isGl ? 'Nivel 3 · Excepción Art. 6.3 RIA' : 'Nivel 3 · Excepción Art. 6.3 RIA',
      };
    }
    if (record.riskClassification === 'minimal_risk') {
      return {
        bg: '#f0fdf4',
        color: '#166534',
        border: '#86efac',
        label: isGl ? 'Nivel 5 · Risco Mínimo (Art. 95)' : 'Nivel 5 · Riesgo Mínimo (Art. 95)',
      };
    }
    return {
      bg: '#f0f9ff',
      color: '#0369a1',
      border: '#7dd3fc',
      label: isGl ? 'Nivel 4 · Transparencia (Art. 50)' : 'Nivel 4 · Transparencia (Art. 50)',
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          maxWidth: '56rem',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '0.5rem',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <History style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {isGl ? 'Historial de Expedientes e Auditorías' : 'Historial de Expedientes y Auditorías'}
                </h3>
                <span
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                  }}
                >
                  {audits.length}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                {isGl
                  ? 'Rexistro persistente de expedientes de conformidade RIA e ENS gardados neste navegador'
                  : 'Registro persistente de expedientes de conformidad RIA y ENS guardados en este navegador'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.375rem',
              borderRadius: '0.375rem',
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Feedback Alert if any */}
        {feedbackMsg && (
          <div
            style={{
              padding: '0.625rem 1.5rem',
              backgroundColor: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle style={{ width: 16, height: 16 }} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Toolbar: Search & Action Buttons */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 16,
                height: 16,
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder={isGl ? 'Buscar por aplicación, entidade ou risco...' : 'Buscar por aplicación, entidad o riesgo...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Backup & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleExportJson}
              disabled={!audits.length}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                background: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: audits.length ? 'pointer' : 'not-allowed',
                opacity: audits.length ? 1 : 0.5,
              }}
              title="Descargar copia de seguridad en JSON de todas las auditorías"
            >
              <Download style={{ width: 14, height: 14 }} />
              <span>{isGl ? 'Exportar JSON' : 'Exportar JSON'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                background: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
              title="Restaurar o fusionar auditorías desde un archivo JSON"
            >
              <Upload style={{ width: 14, height: 14 }} />
              <span>{isGl ? 'Importar JSON' : 'Importar JSON'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {audits.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
                title="Borrar todas las auditorías locales"
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span>{isGl ? 'Baleirar' : 'Vaciar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {filteredAudits.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#64748b',
              }}
            >
              <History style={{ width: 44, height: 44, margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#334155', marginBottom: '0.25rem' }}>
                {searchTerm
                  ? isGl
                    ? 'Non se atoparon auditorías que coincidan coa busca.'
                    : 'No se encontraron auditorías que coincidan con la búsqueda.'
                  : isGl
                  ? 'Aínda non tes auditorías gardadas neste navegador.'
                  : 'Aún no tienes auditorías guardadas en este navegador.'}
              </p>
              <p style={{ fontSize: '0.8125rem' }}>
                {isGl
                  ? 'Cada vez que avalías unha aplicación e emites un diagnóstico, o expediente gárdase automaticamente aquí.'
                  : 'Cada vez que evalúas una aplicación y emites un diagnóstico, el expediente se guarda automáticamente aquí.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {filteredAudits.map((item) => {
                const badge = getRiskBadge(item);
                const dateFormatted = new Date(item.createdAt).toLocaleString(isGl ? 'gl-ES' : 'es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.625rem',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                  >
                    {/* Left: Info */}
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.appName}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '0.25rem',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          ENS {item.ensCategory}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building style={{ width: 13, height: 13 }} />
                          {item.entityName} {item.serviceDepartment ? `· ${item.serviceDepartment}` : ''}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar style={{ width: 13, height: 13 }} />
                          {dateFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => onLoadAudit(item)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '0.375rem',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                        title="Cargar esta auditoría y ver el dictamen completo"
                      >
                        <FolderOpen style={{ width: 14, height: 14 }} />
                        <span>{isGl ? 'Cargar' : 'Cargar'}</span>
                      </button>

                      <button
                        onClick={() => exportOfficialDossierDocx(item.state, item.llmCritique, idioma)}
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '0.375rem',
                          backgroundColor: '#ffffff',
                          color: '#1e3a8a',
                          border: '1px solid #93c5fd',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                        title="Descargar directamente el expediente oficial en Word (.docx)"
                      >
                        <FileText style={{ width: 14, height: 14, color: '#2563eb' }} />
                        <span>DOCX</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.appName)}
                        style={{
                          padding: '0.45rem 0.6rem',
                          borderRadius: '0.375rem',
                          backgroundColor: '#ffffff',
                          color: '#94a3b8',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Eliminar del historial"
                      >
                        <Trash2 style={{ width: 14, height: 14, color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.875rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <span>
            {isGl
              ? 'Os expedientes almacénanse localmente no navegador (LocalStorage) sen saír da túa máquina.'
              : 'Los expedientes se almacenan localmente en el navegador (LocalStorage) sin salir de tu máquina.'}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '0.375rem',
              border: '1px solid #cbd5e1',
              background: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isGl ? 'Pechar' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
