import { describirAsistencia } from '../lib/proveedorEfectivo';
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
import type { DiagnosticResult, AppIdioma, RoleViewMode, RequirementResult, HumanValidation, RequirementAssessment } from '../types';
import { RichDictamenView } from './RichDictamenView';
import { computeExecutivePillars, computeExecutiveVerdict } from '../lib/dashboardPillars';
import {
  applicabilityLabel,
  obligations,
  originLabel,
  prohibitedPractices,
  resultLabel,
} from '../lib/assessmentModel';

const RESULT_STYLE: Record<RequirementResult, { badge: string; background: string; border: string }> = {
  acreditado: { badge: 'badge-success', background: 'var(--color-success-bg)', border: '#bbf7d0' },
  declarado: { badge: 'badge-info', background: '#eff6ff', border: '#bfdbfe' },
  no_verificado: { badge: 'badge-neutral', background: '#f8fafc', border: 'var(--color-border)' },
  no_evaluado: { badge: 'badge-neutral', background: '#f8fafc', border: 'var(--color-border)' },
  pendiente: { badge: 'badge-warning', background: 'var(--color-warning-bg)', border: '#fde68a' },
  incumple: { badge: 'badge-danger', background: 'var(--color-danger-bg)', border: '#fecaca' },
};

const resultBadgeClass = (r: RequirementResult) => RESULT_STYLE[r].badge;
const resultBackground = (r: RequirementResult) => RESULT_STYLE[r].background;
const resultBorder = (r: RequirementResult) => RESULT_STYLE[r].border;

interface DiagnosticDashboardProps {
  diagnostic: DiagnosticResult;
  appName: string;
  llmCritique?: string;
  onGoToCodeKit: () => void;
  onOpenDossier: () => void;
  onBackToInterview: () => void;
  onInspectNorm?: (normId: string, article: string) => void;
  idioma: AppIdioma;
  validations?: Record<string, HumanValidation>;
  onValidateRequirement?: (requirementId: string, revisadoPor: string, evidencia: string) => void;
  onRevokeValidation?: (requirementId: string) => void;
}

/** Registro y retirada de la validación humana documentada de un requisito. */
const ValidationControl: React.FC<{
  requirement: RequirementAssessment;
  validation?: HumanValidation;
  onValidate?: (requirementId: string, revisadoPor: string, evidencia: string) => void;
  onRevoke?: (requirementId: string) => void;
}> = ({ requirement, validation, onValidate, onRevoke }) => {
  const [open, setOpen] = React.useState(false);
  const [revisadoPor, setRevisadoPor] = React.useState('');
  const [evidencia, setEvidencia] = React.useState('');
  if (!onValidate || requirement.aplicabilidad === 'no_aplica') return null;

  if (requirement.resultado === 'acreditado') {
    return (
      <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#166534', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span>✔ Validado por {requirement.revisadoPor} · Evidencia: {requirement.evidencia}</span>
        {onRevoke && (
          <button type="button" className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }} onClick={() => onRevoke(requirement.id)}>
            Retirar validación
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '0.4rem' }}>
      {validation && (
        <div style={{ fontSize: '0.72rem', color: '#92400e', marginBottom: '0.25rem' }}>
          ⚠ La validación anterior de {validation.revisadoPor} no se aplica: las respuestas o la documentación han cambiado.
        </div>
      )}
      {!open ? (
        <button type="button" className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }} onClick={() => setOpen(true)}>
          Registrar validación humana
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.5rem', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <input
            type="text"
            placeholder="Persona y cargo que valida (p. ej., DPD)"
            value={revisadoPor}
            onChange={(e) => setRevisadoPor(e.target.value)}
            style={{ fontSize: '0.75rem' }}
          />
          <input
            type="text"
            placeholder="Evidencia (documento, acta, informe, referencia del expediente)"
            value={evidencia}
            onChange={(e) => setEvidencia(e.target.value)}
            style={{ fontSize: '0.75rem' }}
          />
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
              disabled={!revisadoPor.trim() || !evidencia.trim()}
              onClick={() => {
                onValidate(requirement.id, revisadoPor.trim(), evidencia.trim());
                setOpen(false);
              }}
            >
              Guardar validación
            </button>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }} onClick={() => setOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  diagnostic,
  appName,
  llmCritique,
  onGoToCodeKit,
  onOpenDossier,
  onBackToInterview,
  onInspectNorm,
  idioma,
  validations = {},
  onValidateRequirement,
  onRevokeValidation,
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
      case 'requires_review':
        return 'badge-warning';
      default:
        return 'badge-success';
    }
  };

  // Precepto que puede consultarse en el visor de legislación para cada requisito (null si no está disponible)
  const getNormTarget = (code: string): { normId: string; article: string; label: string } | null => {
    if (code === 'SUPERVISION-HUMANA') {
      return { normId: 'AI-ACT', article: '14', label: 'Ver Art. 14 RIA (DOUE)' };
    }
    if (code === 'ENS-REGISTRO-ACTIVIDAD' || code === 'ENS-CREDENCIALES') {
      return { normId: 'ENS', article: '13', label: 'Ver ENS RD 311/2022 (BOE)' };
    }
    if (code === 'LEY-40-2015-ART-41') {
      return { normId: 'LRJSP', article: '41', label: 'Ver Art. 41 Ley 40/2015 (BOE)' };
    }
    if (code === 'RGPD-ART-30') {
      return { normId: 'RGPD', article: '30', label: 'Ver Art. 30 RGPD (DOUE)' };
    }
    if (code === 'RIA-ART-50') {
      return { normId: 'AI-ACT', article: '50', label: 'Ver Art. 50 RIA (DOUE)' };
    }
    if (code === 'RIA-ART-6-4') {
      return { normId: 'AI-ACT', article: '6', label: 'Ver Art. 6 RIA (DOUE)' };
    }
    if (code === 'RIA-ALTO-RIESGO-CE') {
      return { normId: 'AI-ACT', article: '43', label: 'Ver Art. 43 RIA (DOUE)' };
    }
    return null;
  };

  const [roleView, setRoleView] = React.useState<RoleViewMode>('completo');

  // Cálculo del Semáforo Ejecutivo de Madurez en 4 Pilares
  const {
    ria: pilarRia,
    rgpd: pilarRgpd,
    ens: pilarEns,
    gobernanza: pilarGobernanza,
  } = computeExecutivePillars(diagnostic);

  // Veredicto Global Ejecutivo
  const verdict = computeExecutiveVerdict(diagnostic);
  const isBlocked = verdict.level === 'blocked';
  const isConditioned = verdict.level === 'conditioned';

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
          {roleView === 'tecnico' && 'Mostrando medidas de ciberseguridad del ENS y defensas de código.'}
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
              {verdict.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: isBlocked ? '#7f1d1d' : isConditioned ? '#78350f' : '#14532d', marginTop: '1px' }}>
              {verdict.detail}
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
              {diagnostic.riskClassification === 'requires_review'
                ? 'RIA: REQUIERE REVISIÓN'
                : diagnostic.riskClassification === 'not_ai_system'
                ? 'EXCLUIDO AI ACT (ART. 3.1)'
                : diagnostic.riskClassification === 'minimal_risk'
                ? 'AI ACT: RIESGO MÍNIMO (ART. 95)'
                : `AI ACT: ${diagnostic.riskClassification.toUpperCase()}`}
            </span>
            {diagnostic.isArticle63Derogation && (
              <span className="badge badge-success" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                ⚖️ EXCEPCIÓN ART. 6.3 RIA (DECLARADA, PENDIENTE DE DOCUMENTAR)
              </span>
            )}
            <span className="badge badge-info" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
              ENS: CATEGORÍA {diagnostic.ensCategory}{diagnostic.ensCategoryIsOrientative ? ' (ORIENTATIVA)' : ''}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          {diagnostic.executiveSummary}
        </p>

        {diagnostic.isArticle63Derogation && diagnostic.article63Justification && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
            <strong>📜 Fundamento declarado de la excepción (Art. 6.3 RIA):</strong> {diagnostic.article63Justification}
          </div>
        )}

        {diagnostic.reviewReasons.length > 0 && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fcd34d', fontSize: '0.875rem', color: '#78350f', lineHeight: 1.5 }}>
            <strong>Motivos por los que la clasificación no es concluyente:</strong>
            <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem' }}>
              {diagnostic.reviewReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <button type="button" className="btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }} onClick={onBackToInterview}>
              Completar la entrevista
            </button>
          </div>
        )}

        <details style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--color-primary)' }}>
            Traza de la clasificación ({diagnostic.classificationTrace.length} pasos · corte normativo: {diagnostic.normativeVersion})
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {diagnostic.classificationTrace.map((step) => (
              <div key={step.id} style={{ padding: '0.6rem 0.75rem', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700 }}>{step.id} · {step.pregunta}</div>
                <div><strong>Respuesta:</strong> {step.respuesta}</div>
                <div><strong>Conclusión:</strong> {step.conclusion}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                  Regla: {step.regla} · Fuente: {step.fuente}{step.limites ? ` · Límites: ${step.limites}` : ''}
                </div>
              </div>
            ))}
          </div>
        </details>
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
                {idioma === 'galego' ? 'Consulta da lexislación oficial' : 'Consulta de la legislación oficial'}
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
                BOE / DOUE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#334155' }}>
              {idioma === 'galego'
                ? `Os preceptos citados proceden da base de coñecemento da ferramenta (${diagnostic.normativeVersion}). Comprobe a súa vixencia nas fontes oficiais.`
                : `Los preceptos citados proceden de la base de conocimiento de la herramienta (${diagnostic.normativeVersion}). Compruebe su vigencia en las fuentes oficiales.`}
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
              Alertas para la revisión ({diagnostic.redFlags.length})
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
            {prohibitedPractices(diagnostic.requirements).map((req) => (
              <div
                key={req.id}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: resultBackground(req.resultado),
                  border: `1px solid ${resultBorder(req.resultado)}`,
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{req.title}</span>
                  <span className={`badge ${resultBadgeClass(req.resultado)}`}>{resultLabel(req.resultado, idioma)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {req.precepto} — {req.hechos}
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
                <ValidationControl
                  requirement={req}
                  validation={validations[req.id]}
                  onValidate={onValidateRequirement}
                  onRevoke={onRevokeValidation}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Obligations Checklist */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
              Obligaciones y su estado de acreditación
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {obligations(diagnostic.requirements).map((req) => {
              const normTarget = getNormTarget(req.id);
              return (
                <div
                  key={req.id}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: req.aplicabilidad === 'no_aplica' ? '#f8fafc' : resultBackground(req.resultado),
                    border: `1px solid ${req.aplicabilidad === 'no_aplica' ? 'var(--color-border)' : resultBorder(req.resultado)}`,
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{req.title}</span>
                    <span className={`badge ${req.aplicabilidad === 'no_aplica' ? 'badge-neutral' : resultBadgeClass(req.resultado)}`}>
                      {req.aplicabilidad === 'no_aplica' ? applicabilityLabel(req.aplicabilidad, idioma) : resultLabel(req.resultado, idioma)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                    {req.norma} · {req.precepto} · {originLabel(req.origen, idioma)}
                    {req.exigibleDesde ? ` · Exigible desde ${new Date(req.exigibleDesde).toLocaleDateString('es-ES')}` : ''}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.25rem' }}>{req.hechos}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      Acción: {req.accionRequerida}
                    </span>
                    {onInspectNorm && normTarget && (
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
                  <ValidationControl
                    requirement={req}
                    validation={validations[req.id]}
                    onValidate={onValidateRequirement}
                    onRevoke={onRevokeValidation}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Proveedor efectivo: qué modelo procesó la documentación, o por qué no se usó */}
      {diagnostic.aiAssistance && diagnostic.aiAssistance.estado !== 'no_configurada' && (
        <div className="card" style={{ border: `1px solid ${diagnostic.aiAssistance.estado === 'usada' ? '#e2e8f0' : '#fcd34d'}`, background: diagnostic.aiAssistance.estado === 'usada' ? '#f8fafc' : '#fffbeb', marginTop: '1.5rem', fontSize: '0.8125rem', color: '#334155' }}>
          <strong>Asistencia de IA:</strong> {describirAsistencia(diagnostic.aiAssistance)}
        </div>
      )}

      {/* Discrepancia señalada por el análisis asistido */}
      {diagnostic.pericialDissentAlert && (
        <div className="card" style={{ border: '1px solid #fcd34d', background: '#fffbeb', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
            <AlertTriangle style={{ width: 18, height: 18 }} />
            <strong style={{ fontSize: '0.9rem' }}>Posible discrepancia de clasificación (no verificada)</strong>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#78350f', marginTop: '0.5rem' }}>{diagnostic.pericialDissentAlert}</p>
        </div>
      )}

      {/* AI Qualitative Critique (if generated) */}
      {llmCritique && (
        <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.75rem' }}>
            Análisis asistido por IA — contenido no verificado. No modifica la clasificación ni acredita requisitos.
          </p>
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
