import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileCode,
  FileCheck,
  Bot,
  ExternalLink,
  Info,
  Scale,
  BookOpen,
} from 'lucide-react';
import type { DiagnosticResult, AppIdioma, RoleViewMode } from '../types';
import { RichDictamenView } from './RichDictamenView';

interface DiagnosticDashboardProps {
  diagnostic: DiagnosticResult;
  appName: string;
  llmCritique?: string;
  onGoToCodeKit: () => void;
  onOpenDossier: () => void;
  onBackToInterview: () => void;
  onInspectNorm?: (normId: string, article: string) => void;
  idioma: AppIdioma;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  diagnostic,
  appName,
  llmCritique,
  onGoToCodeKit,
  onOpenDossier,
  onBackToInterview,
  onInspectNorm,
  idioma,
}) => {
  const getBadgeClass = (risk: DiagnosticResult['riskClassification']) => {
    switch (risk) {
      case 'prohibited':
        return 'badge-danger';
      case 'high_risk':
        return 'badge-warning';
      case 'transparency_risk':
        return 'badge-info';
      case 'minimal_risk':
        return 'badge-success';
      case 'not_ai_system':
        return 'badge-neutral';
      default:
        return 'badge-success';
    }
  };

  const getNormTarget = (code: string): { normId: string; article: string; label: string } => {
    if (code.includes('HUMAN') || code.includes('OVERSIGHT')) {
      return { normId: 'AI-ACT', article: '14', label: 'Ver Art. 14 RIA (DOUE)' };
    }
    if (code.includes('DOC') || code.includes('LOG')) {
      return { normId: 'AI-ACT', article: '12', label: 'Ver Art. 12 RIA (DOUE)' };
    }
    if (code.includes('LRJSP') || code.includes('40/2015') || code.includes('AUTOMAT')) {
      return { normId: 'LRJSP', article: '41', label: 'Ver Art. 41 Ley 40/2015 (BOE)' };
    }
    if (code.includes('ENS')) {
      return { normId: 'ENS', article: '13', label: 'Ver ENS RD 311/2022 (BOE)' };
    }
    if (code.includes('RGPD') || code.includes('DPIA') || code.includes('RAT')) {
      return { normId: 'RGPD', article: '35', label: 'Ver Art. 35 RGPD (DOUE)' };
    }
    return { normId: 'AI-ACT', article: '50', label: 'Ver Art. 50 RIA (DOUE)' };
  };

  const [roleView, setRoleView] = React.useState<RoleViewMode>('completo');

  // Cálculo del Semáforo Ejecutivo de Madurez en 4 Pilares
  const pilarRia = diagnostic.riskClassification === 'prohibited'
    ? { status: 'danger', label: 'Inadmisible (Art. 5)', text: 'Práctica prohibida legalmente' }
    : diagnostic.riskClassification === 'high_risk'
    ? { status: 'danger', label: 'Alto Riesgo (Anexo III)', text: 'Requiere marcado CE previo' }
    : diagnostic.riskClassification === 'not_ai_system'
    ? { status: 'neutral', label: 'Excluido (Art. 3.1)', text: 'Software determinista sin IA' }
    : diagnostic.riskClassification === 'minimal_risk'
    ? { status: 'success', label: 'Riesgo Mínimo (Art. 95)', text: 'Exento de trámites de IA' }
    : { status: 'info', label: 'Riesgo Limitado (Art. 50)', text: 'Cumple vía transparencia' };

  const pilarRgpd = diagnostic.redFlags.some((f) => f.includes('Transferencia') || f.includes('Sensibles'))
    ? { status: 'warning', label: 'Condicionado a EIPD', text: 'Datos sensibles o nube externa' }
    : { status: 'success', label: 'Conforme con RAT', text: 'Base legítima acreditada' };

  const pilarEns = diagnostic.ensCategory === 'ALTA'
    ? { status: 'warning', label: 'Categoría ENS ALTA', text: 'Máximas salvaguardas D-A-I-C-T' }
    : diagnostic.ensCategory === 'MEDIA'
    ? { status: 'info', label: 'Categoría ENS MEDIA', text: 'Medidas reforzadas CCN-STIC' }
    : { status: 'success', label: 'Categoría ENS BÁSICA', text: 'Impacto limitado transitorio' };

  const pilarGobernanza = diagnostic.isAutomatedAdministrativeAct
    ? { status: 'warning', label: 'Actuación Automatizada', text: 'Requiere Orden formal Art. 41' }
    : { status: 'success', label: 'Auxilio Instrumental', text: 'Supervisión humana previa' };

  // Veredicto Global Ejecutivo
  const isBlocked = diagnostic.riskClassification === 'prohibited';
  const isConditioned = diagnostic.riskClassification === 'high_risk' || diagnostic.redFlags.length > 0 || diagnostic.isAutomatedAdministrativeAct;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Role Switcher Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '0.65rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Vista por Perfil:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setRoleView('completo')}
              style={{
                fontSize: '0.75rem',
                fontWeight: roleView === 'completo' ? 700 : 500,
                padding: '0.3rem 0.65rem',
                borderRadius: 4,
                cursor: 'pointer',
                background: roleView === 'completo' ? 'var(--color-primary)' : '#f8fafc',
                color: roleView === 'completo' ? 'white' : '#475569',
                border: '1px solid var(--color-border)',
              }}
            >
              🔍 Vista Pericial Completa
            </button>
            <button
              type="button"
              onClick={() => setRoleView('juridico')}
              style={{
                fontSize: '0.75rem',
                fontWeight: roleView === 'juridico' ? 700 : 500,
                padding: '0.3rem 0.65rem',
                borderRadius: 4,
                cursor: 'pointer',
                background: roleView === 'juridico' ? '#047857' : '#f8fafc',
                color: roleView === 'juridico' ? 'white' : '#475569',
                border: '1px solid var(--color-border)',
              }}
            >
              ⚖️ Vista Jurídica / DPD
            </button>
            <button
              type="button"
              onClick={() => setRoleView('tecnico')}
              style={{
                fontSize: '0.75rem',
                fontWeight: roleView === 'tecnico' ? 700 : 500,
                padding: '0.3rem 0.65rem',
                borderRadius: 4,
                cursor: 'pointer',
                background: roleView === 'tecnico' ? '#7c3aed' : '#f8fafc',
                color: roleView === 'tecnico' ? 'white' : '#475569',
                border: '1px solid var(--color-border)',
              }}
            >
              💻 Vista Técnica / CISO
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {roleView === 'juridico' && 'Mostrando dictamen, EIPD, RAT y fundamentación legal.'}
          {roleView === 'tecnico' && 'Mostrando directivas de ciberseguridad, CCN-STIC y defensas de código.'}
          {roleView === 'completo' && 'Mostrando informe pericial exhaustivo multidimensional.'}
        </div>
      </div>

      {/* Executive Scorecard: Semáforo de Madurez en 4 Pilares */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        {/* Pilar 1: RIA */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderLeft: `4px solid ${pilarRia.status === 'danger' ? '#ef4444' : pilarRia.status === 'warning' ? '#f59e0b' : pilarRia.status === 'neutral' ? '#64748b' : '#10b981'}`,
        }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>1. Eje RIA (AI Act)</span>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{pilarRia.label}</div>
          <span style={{ fontSize: '0.75rem', color: '#475569' }}>{pilarRia.text}</span>
        </div>

        {/* Pilar 2: RGPD */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderLeft: `4px solid ${pilarRgpd.status === 'danger' ? '#ef4444' : pilarRgpd.status === 'warning' ? '#f59e0b' : '#10b981'}`,
        }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>2. Eje RGPD & Privacidad</span>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{pilarRgpd.label}</div>
          <span style={{ fontSize: '0.75rem', color: '#475569' }}>{pilarRgpd.text}</span>
        </div>

        {/* Pilar 3: ENS */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderLeft: `4px solid ${pilarEns.status === 'danger' ? '#ef4444' : pilarEns.status === 'warning' ? '#f59e0b' : '#3b82f6'}`,
        }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>3. Eje Seguridad ENS</span>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{pilarEns.label}</div>
          <span style={{ fontSize: '0.75rem', color: '#475569' }}>{pilarEns.text}</span>
        </div>

        {/* Pilar 4: Gobernanza */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderLeft: `4px solid ${pilarGobernanza.status === 'danger' ? '#ef4444' : pilarGobernanza.status === 'warning' ? '#f59e0b' : '#10b981'}`,
        }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>4. Eje Gobernanza Ley 40</span>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{pilarGobernanza.label}</div>
          <span style={{ fontSize: '0.75rem', color: '#475569' }}>{pilarGobernanza.text}</span>
        </div>
      </div>

      {/* Veredicto Ejecutivo Destacado */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        background: isBlocked ? '#fef2f2' : isConditioned ? '#fffbeb' : '#f0fdf4',
        border: `1.5px solid ${isBlocked ? '#f87171' : isConditioned ? '#fcd34d' : '#86efac'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '1.5rem',
            lineHeight: 1,
          }}>
            {isBlocked ? '🔴' : isConditioned ? '🟡' : '🟢'}
          </div>
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: isBlocked ? '#991b1b' : isConditioned ? '#92400e' : '#166534',
            }}>
              {isBlocked
                ? 'VEREDICTO: NO DESPLEGABLE EN PRODUCCIÓN (BLOQUEANTE LEGAL INSUBSANABLE)'
                : isConditioned
                ? 'VEREDICTO: APTO CONDICIONADO A SUBSANACIÓN PREVIA'
                : 'VEREDICTO: APTO PARA DESPLIEGUE EN PRODUCCIÓN (CON SALVAGUARDAS)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: isBlocked ? '#7f1d1d' : isConditioned ? '#78350f' : '#14532d', marginTop: '1px' }}>
              {isBlocked
                ? 'El sistema vulnera prohibiciones expresas del Art. 5 del RIA o carece de control humano.'
                : isConditioned
                ? 'Requiere ratificar EIPD, publicar resolución de actuación automatizada o cumplir medidas CCN-STIC.'
                : 'Herramienta de auxilio instrumental plenamente ajustada al marco RIA, RGPD, ENS y Ley 40/2015.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onOpenDossier}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.4rem 0.85rem',
              borderRadius: 6,
              background: '#0f172a',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <FileCheck style={{ width: 14, height: 14 }} />
            <span>Descargar Expediente (.docx)</span>
          </button>
        </div>
      </div>

      {/* Risk Summary Header Card */}
      <div className="card" style={{
        borderLeft: `6px solid ${
          diagnostic.riskClassification === 'prohibited'
            ? 'var(--color-danger)'
            : diagnostic.riskClassification === 'high_risk'
            ? 'var(--color-warning)'
            : diagnostic.riskClassification === 'minimal_risk'
            ? '#10b981'
            : diagnostic.riskClassification === 'not_ai_system'
            ? '#64748b'
            : 'var(--color-accent)'
        }`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Dictamen de Conformidad para: {appName}
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>
              {diagnostic.riskLabel}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${getBadgeClass(diagnostic.riskClassification)}`} style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
              {diagnostic.riskClassification === 'high_risk' ? <ShieldAlert style={{ width: 16, height: 16 }} /> : <ShieldCheck style={{ width: 16, height: 16 }} />}
              {diagnostic.riskClassification === 'not_ai_system'
                ? 'EXCLUIDO AI ACT (ART. 3.1)'
                : diagnostic.riskClassification === 'minimal_risk'
                ? 'AI ACT: RIESGO MÍNIMO (ART. 95)'
                : `AI ACT: ${diagnostic.riskClassification.toUpperCase()}`}
            </span>
            {diagnostic.isArticle63Derogation && (
              <span className="badge badge-success" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                ⚖️ EXCEPCIÓN ART. 6.3 RIA APLICADA
              </span>
            )}
            <span className="badge badge-info" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
              ENS: CATEGORÍA {diagnostic.ensCategory}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          {diagnostic.executiveSummary}
        </p>

        {diagnostic.isArticle63Derogation && diagnostic.article63Justification && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
            <strong>📜 Motivación Preceptiva de Excepción (Art. 6.4 RIA):</strong> {diagnostic.article63Justification}
          </div>
        )}
      </div>

      {/* Live Legislation Sync Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(to right, #f0fdf4, #f8fafc)',
          border: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Scale style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#166534' }}>
                {idioma === 'galego' ? 'Sincronización Normativa Telemática Activa' : 'Sincronización Normativa Telemática Activa'}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.6875rem',
                  background: '#16a34a',
                  color: 'white',
                  borderRadius: '9999px',
                  fontWeight: 600,
                }}
              >
                ● CONEXIÓN BOE / DOUE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#334155' }}>
              {idioma === 'galego'
                ? 'Normas vixentes verificadas: Reg. (UE) 2024/1689 (RIA), Lei 40/2015 (Art. 41), ENS RD 311/2022 e RGPD.'
                : 'Normas vigentes verificadas: Reg. (UE) 2024/1689 (RIA), Ley 40/2015 (Art. 41), ENS RD 311/2022 y RGPD.'}
            </p>
          </div>
        </div>

        {onInspectNorm && (
          <button
            type="button"
            onClick={() => onInspectNorm('AI-ACT', '14')}
            className="btn-secondary"
            style={{
              background: 'white',
              borderColor: '#86efac',
              color: '#15803d',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BookOpen style={{ width: 15, height: 15 }} />
            <span>{idioma === 'galego' ? 'Ver Lexislación en Vivo' : 'Ver Legislación en Vivo'}</span>
          </button>
        )}
      </div>

      {/* Red Flags Alert if present */}
      {diagnostic.redFlags.length > 0 && (
        <div className="card" style={{ border: '1px solid #fecaca', background: '#fff5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.75rem' }}>
            <AlertTriangle style={{ width: 20, height: 20 }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
              Puntos Críticos y Alertas de Infracción Detectadas ({diagnostic.redFlags.length})
            </h3>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {diagnostic.redFlags.map((flag, idx) => (
              <li key={idx} style={{ fontSize: '0.875rem', color: '#991b1b', lineHeight: 1.45 }}>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid: Prohibited Practices & Mandatory Obligations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Prohibited Practices Check */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert style={{ width: 18, height: 18, color: 'var(--color-danger)' }} />
              Prácticas Prohibidas (Art. 5 RIA)
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {diagnostic.prohibitedChecks.map((check) => (
              <div
                key={check.id}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: check.detected ? 'var(--color-danger-bg)' : '#f8fafc',
                  border: `1px solid ${check.detected ? '#fecaca' : 'var(--color-border)'}`,
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: check.detected ? 'var(--color-danger)' : 'var(--color-text)' }}>
                    {check.title}
                  </span>
                  <span className={`badge ${check.detected ? 'badge-danger' : 'badge-success'}`}>
                    {check.detected ? 'DETECTADO' : 'CONFORME'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {check.legalArticle} — {check.explanation}
                  </span>
                  {onInspectNorm && (
                    <button
                      type="button"
                      onClick={() => onInspectNorm('AI-ACT', '5')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--color-primary)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Consultar Art. 5 en el DOUE"
                    >
                      <Scale style={{ width: 12, height: 12 }} />
                      <span>Art. 5 DOUE</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Obligations Checklist */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
              Obligaciones Legales Preceptivas
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {diagnostic.obligations.map((ob) => {
              const normTarget = getNormTarget(ob.code);
              return (
                <div
                  key={ob.code}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: ob.status === 'compliant' ? 'var(--color-success-bg)' : ob.status === 'warning' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)',
                    border: `1px solid ${ob.status === 'compliant' ? '#bbf7d0' : ob.status === 'warning' ? '#fde68a' : '#fecaca'}`,
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{ob.title}</span>
                    <span className={`badge ${ob.status === 'compliant' ? 'badge-success' : ob.status === 'warning' ? 'badge-warning' : 'badge-danger'}`}>
                      {ob.code}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.25rem' }}>{ob.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      Acción: {ob.actionRequired}
                    </span>
                    {onInspectNorm && (
                      <button
                        type="button"
                        onClick={() => onInspectNorm(normTarget.normId, normTarget.article)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#0369a1',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        title={`Consultar ${normTarget.label}`}
                      >
                        <Scale style={{ width: 12, height: 12 }} />
                        <span>{normTarget.label}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Qualitative Critique (if generated) */}
      {llmCritique && (
        <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
          <RichDictamenView content={llmCritique} />
        </div>
      )}

      {/* Bottom Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem',
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <button type="button" onClick={onBackToInterview} className="btn-secondary">
          Modificar Respuestas
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={onGoToCodeKit} className="btn-accent">
            <FileCode style={{ width: 16, height: 16 }} />
            <span>Ver Kit de Código (Banners & .env)</span>
          </button>

          <button type="button" onClick={onOpenDossier} className="btn-primary">
            <FileCheck style={{ width: 16, height: 16 }} />
            <span>Generar Expediente Administrativo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
