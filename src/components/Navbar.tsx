import { ShieldCheck, Cpu, Key, Globe, RefreshCw, BookOpen, Scale, HelpCircle, History } from 'lucide-react';
import { useApiConfig } from '../context/ApiConfigContext';
import type { AppIdioma } from '../types';
import { t } from '../lib/i18n';
import { describirProveedor } from '../lib/apiService';

interface NavbarProps {
  idioma: AppIdioma;
  setIdioma: (id: AppIdioma) => void;
  onOpenApiModal: () => void;
  onOpenGuide: () => void;
  onOpenLiveLegislation: () => void;
  onOpenPurpose?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  idioma,
  setIdioma,
  onOpenApiModal,
  onOpenGuide,
  onOpenLiveLegislation,
  onOpenPurpose,
  onOpenHistory,
  historyCount,
  onReset,
}) => {
  const { config, isConfigured } = useApiConfig();

  const providerLabel = isConfigured && config
    ? `${describirProveedor(config)} · ${config.model}`
    : t('provider_status_offline', idioma);

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: '82rem',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Logo & Title (Branding Arias Lombardero · Aplicaciones) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <a
            href="https://ariaslombardero.es/"
            target="_blank"
            rel="noopener noreferrer"
            title="Arias Lombardero · Aplicaciones"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <img
              src="/brand/logo-arias-lombardero-aplicaciones-para-fondo-claro.svg"
              alt="Arias Lombardero · Aplicaciones"
              style={{ height: '34px', width: 'auto', display: 'block' }}
            />
          </a>
          <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1.125rem' }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-ink)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              {t('app_title', idioma)}
            </h1>
            <p style={{ fontSize: '0.6875rem', color: 'var(--brand-muted-light)', fontWeight: 500 }}>
              {t('app_subtitle', idioma)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Status Badge */}
          <div
            onClick={onOpenApiModal}
            className={`badge ${isConfigured ? 'badge-success' : 'badge-warning'}`}
            style={{ cursor: 'pointer', padding: '0.375rem 0.75rem' }}
            title="Haz clic para configurar el proveedor de IA"
          >
            <Cpu style={{ width: 14, height: 14 }} />
            <span>{providerLabel}</span>
          </div>

          {/* Config Button */}
          <button
            onClick={onOpenApiModal}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
          >
            <Key style={{ width: 14, height: 14 }} />
            <span>{t('btn_configure_api', idioma)}</span>
          </button>

          {/* Language Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button
              onClick={() => setIdioma('castellano')}
              style={{
                background: idioma === 'castellano' ? 'white' : 'transparent',
                color: idioma === 'castellano' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: idioma === 'castellano' ? 'var(--shadow-sm)' : 'none',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '0.25rem',
              }}
            >
              ES
            </button>
            <button
              onClick={() => setIdioma('galego')}
              style={{
                background: idioma === 'galego' ? 'white' : 'transparent',
                color: idioma === 'galego' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: idioma === 'galego' ? 'var(--shadow-sm)' : 'none',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '0.25rem',
              }}
            >
              GL
            </button>
          </div>

          {/* Live Legislation Sync Button */}
          <button
            onClick={onOpenLiveLegislation}
            className="btn-secondary"
            title="Consultar legislación oficial en tiempo real (BOE y DOUE)"
            style={{
              fontSize: '0.8125rem',
              padding: '0.4rem 0.75rem',
              gap: '0.35rem',
              background: '#f0fdf4',
              borderColor: '#bbf7d0',
              color: '#15803d',
              fontWeight: 600,
            }}
          >
            <Scale style={{ width: 14, height: 14, color: '#16a34a' }} />
            <span>BOE/DOUE</span>
          </button>

          {/* Executive Purpose Button */}
          {onOpenPurpose && (
            <button
              onClick={onOpenPurpose}
              className="btn-secondary"
              title="¿Por qué es obligatoria esta auditoría? Guía ejecutiva para directivos y DPDs"
              style={{
                fontSize: '0.8125rem',
                padding: '0.4rem 0.75rem',
                gap: '0.35rem',
                background: '#eff6ff',
                borderColor: '#bfdbfe',
                color: '#1d4ed8',
                fontWeight: 600,
              }}
            >
              <HelpCircle style={{ width: 14, height: 14, color: '#2563eb' }} />
              <span>¿Por qué auditar?</span>
            </button>
          )}

          {/* Historial de Auditorías Button */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="btn-secondary"
              title={idioma === 'galego' ? 'Historial de auditorías gardadas' : 'Historial de auditorías guardadas'}
              style={{
                fontSize: '0.8125rem',
                padding: '0.4rem 0.75rem',
                gap: '0.35rem',
                background: '#f8fafc',
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <History style={{ width: 14, height: 14, color: '#2563eb' }} />
              <span>{idioma === 'galego' ? 'Historial' : 'Historial'}</span>
              {typeof historyCount === 'number' && historyCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontSize: '0.6875rem',
                    padding: '0.05rem 0.35rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                  }}
                >
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* User Guide Button */}
          <button
            onClick={onOpenGuide}
            className="btn-secondary"
            title={idioma === 'galego' ? 'Guía de Usuario e Metodoloxía' : 'Guía de Usuario y Metodología'}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', gap: '0.4rem' }}
          >
            <BookOpen style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
            <span>{idioma === 'galego' ? 'Guía' : 'Guía'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="btn-secondary"
            title="Reiniciar auditoría"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </header>
  );
};
