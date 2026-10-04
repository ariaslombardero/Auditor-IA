import React, { useState } from 'react';
import { Copy, Check, Code, FileText, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import type { CodeKit, AppIdioma } from '../types';
import { t } from '../lib/i18n';

interface CodeKitViewProps {
  codeKit: CodeKit;
  onBackToDiagnostic: () => void;
  onOpenDossier: () => void;
  idioma: AppIdioma;
}

export const CodeKitView: React.FC<CodeKitViewProps> = ({
  codeKit,
  onBackToDiagnostic,
  onOpenDossier,
  idioma,
}) => {
  const [activeTab, setActiveTab] = useState<'react' | 'html' | 'docx' | 'env'>('react');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Intro Header */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-success)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Paso 4: Kit de Código y Adaptación Técnica Inmediata
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Copia y pega estos componentes directamente en el repositorio de la aplicación auditada para subsanar los requerimientos de <strong>transparencia (Art. 50 RIA)</strong> y <strong>seguridad en variables de entorno (CCN-STIC 884D)</strong>.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('react')}
          className={activeTab === 'react' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.8125rem' }}
        >
          <Code style={{ width: 14, height: 14 }} /> Banner React (TSX)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('html')}
          className={activeTab === 'html' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.8125rem' }}
        >
          <Code style={{ width: 14, height: 14 }} /> Banner HTML / Web
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('docx')}
          className={activeTab === 'docx' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.8125rem' }}
        >
          <FileText style={{ width: 14, height: 14 }} /> Pie de Página DOCX
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('env')}
          className={activeTab === 'env' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.8125rem' }}
        >
          <ShieldAlert style={{ width: 14, height: 14 }} /> Guía .env (CCN-STIC 884D)
        </button>
      </div>

      {/* Tab Contents */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          color: '#94a3b8',
          fontSize: '0.75rem',
        }}>
          <span>
            {activeTab === 'react' && 'AiTransparencyBanner.tsx'}
            {activeTab === 'html' && 'transparency-banner.html'}
            {activeTab === 'docx' && 'docxExporterFooter.ts'}
            {activeTab === 'env' && 'CCN-STIC-884D-Security-Guide.md'}
          </span>

          <button
            type="button"
            onClick={() => {
              const textToCopy =
                activeTab === 'react'
                  ? codeKit.reactBannerCode
                  : activeTab === 'html'
                  ? codeKit.htmlBannerCode
                  : activeTab === 'docx'
                  ? codeKit.docxFooterSnippet
                  : codeKit.envSecurityGuide;
              handleCopy(textToCopy, activeTab);
            }}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
            }}
          >
            {copiedTab === activeTab ? (
              <>
                <Check style={{ width: 12, height: 12, color: '#4ade80' }} />
                <span>{t('copied', idioma)}</span>
              </>
            ) : (
              <>
                <Copy style={{ width: 12, height: 12 }} />
                <span>{t('btn_copy_code', idioma)}</span>
              </>
            )}
          </button>
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <pre style={{ margin: 0, borderRadius: 0 }}>
            <code>
              {activeTab === 'react' && codeKit.reactBannerCode}
              {activeTab === 'html' && codeKit.htmlBannerCode}
              {activeTab === 'docx' && codeKit.docxFooterSnippet}
              {activeTab === 'env' && codeKit.envSecurityGuide}
            </code>
          </pre>
        </div>
      </div>

      {/* Disclaimers Card */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          Textos Legales Homologados para Interfaces y Documentos
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Aviso en Castellano:</span>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px', color: '#334155' }}>
              {codeKit.transparencyDisclaimerEs}
            </p>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Aviso en Galego:</span>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px', color: '#334155' }}>
              {codeKit.transparencyDisclaimerGl}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <button type="button" onClick={onBackToDiagnostic} className="btn-secondary">
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span>Volver al Diagnóstico</span>
        </button>

        <button
          type="button"
          onClick={onOpenDossier}
          className="btn-primary"
          style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}
        >
          <span>Generar Expediente Administrativo Oficial</span>
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};
