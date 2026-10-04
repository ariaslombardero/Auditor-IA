import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Scale,
  ShieldCheck,
  Loader2,
  FileText,
} from 'lucide-react';
import type { AppIdioma } from '../types';
import {
  VERIFIED_NORMS,
  getLiveArticle,
  type LiveArticleResult,
} from '../lib/liveLegislationService';

interface LiveLegislationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNormId?: string;
  initialArticle?: string;
  idioma: AppIdioma;
}

export const LiveLegislationModal: React.FC<LiveLegislationModalProps> = ({
  isOpen,
  onClose,
  initialNormId = 'AI-ACT',
  initialArticle = '14',
  idioma,
}) => {
  const [selectedNormId, setSelectedNormId] = useState(initialNormId);
  const [selectedArticle, setSelectedArticle] = useState(initialArticle);
  const [loading, setLoading] = useState(false);
  const [articleData, setArticleData] = useState<LiveArticleResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialNormId) setSelectedNormId(initialNormId);
    if (initialArticle) setSelectedArticle(initialArticle);
  }, [initialNormId, initialArticle, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await getLiveArticle(selectedNormId, selectedArticle);
        if (isMounted) setArticleData(data);
      } catch (err) {
        console.error('Error al consultar artículo en vivo:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    return () => {
      isMounted = false;
    };
  }, [selectedNormId, selectedArticle, isOpen]);

  if (!isOpen) return null;

  const currentNorm = VERIFIED_NORMS[selectedNormId] || VERIFIED_NORMS['AI-ACT'];

  const handleCopy = () => {
    if (!articleData) return;
    const citation = `Fuente Oficial: ${articleData.sourceType === 'DOUE' ? 'Diario Oficial de la Unión Europea' : 'Boletín Oficial del Estado'} (${articleData.officialCode}) - ${articleData.verifiedAt}\nEnlace: ${articleData.officialUrl}\n\n${articleData.content}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '52rem',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.125rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--brand-paper)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Scale style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--brand-ink)', margin: 0 }}>
                  Consultor Normativo en Tiempo Real (BOE y DOUE)
                </h2>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#065f46',
                  background: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  Live Sync Activo
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
                Textos consolidados oficiales conectados directamente con las fuentes legislativas de España y la Unión Europea.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.5rem' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Norm Selector Tabs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            flexShrink: 0,
            paddingBottom: '0.625rem',
            borderBottom: '1px solid var(--color-border)',
          }}>
            {Object.entries(VERIFIED_NORMS).map(([id, norm]) => {
              const isSelected = selectedNormId === id;
              const shortLabels: Record<string, string> = {
                'AI-ACT': 'Reglamento IA (AI Act)',
                'LRJSP': 'Ley 40/2015 (Sector Público)',
                'ENS': 'ENS (RD 311/2022)',
                'RGPD': 'RGPD (UE 2016/679)',
                'LOPDGDD': 'LOPDGDD (LO 3/2018)',
              };
              const displayLabel = shortLabels[id] || norm.name;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedNormId(id);
                    setSelectedArticle(norm.articles[0]);
                  }}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1px solid var(--brand-blue)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: isSelected ? 'var(--brand-blue)' : '#f8fafc',
                    color: isSelected ? 'white' : 'var(--brand-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? '0 1px 3px rgba(30, 58, 138, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{norm.source === 'DOUE' ? '🇪🇺' : '🇪🇸'}</span>
                  <span>{displayLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Article Pills Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            background: '#fafafa',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-ink)' }}>
                Artículos clave para auditoría:
              </span>
              {currentNorm.articles.map((art) => (
                <button
                  key={art}
                  type="button"
                  onClick={() => setSelectedArticle(art)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedArticle === art ? '1.5px solid var(--brand-blue)' : '1px solid var(--color-border)',
                    background: selectedArticle === art ? '#eff6ff' : 'white',
                    color: selectedArticle === art ? 'var(--brand-blue)' : 'var(--brand-ink)',
                    fontWeight: selectedArticle === art ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  Art. {art}
                </button>
              ))}
            </div>

            <a
              href={currentNorm.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: 'var(--brand-blue)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <span>Abrir en {currentNorm.source === 'DOUE' ? 'EUR-Lex (DOUE)' : 'BOE Oficial'}</span>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </div>

          {/* Article Display Area */}
          <div style={{
            flex: 1,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: '#ffffff',
            padding: '1.25rem',
            position: 'relative',
            minHeight: '260px',
          }}>
            {loading ? (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}>
                <Loader2 style={{ width: 28, height: 28, color: 'var(--brand-blue)', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--brand-muted-light)', fontWeight: 500 }}>
                  Descargando texto consolidado oficial desde {currentNorm.source === 'DOUE' ? 'la Unión Europea (CELLAR)' : 'el BOE (Legalize)'}...
                </span>
              </div>
            ) : articleData ? (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-ink)', margin: 0 }}>
                      {articleData.articleTitle}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)', marginTop: '2px' }}>
                      {articleData.normTitle} · Código Oficial: <strong>{articleData.officialCode}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.6875rem',
                      background: articleData.isLiveFetched ? '#f0fdf4' : '#eff6ff',
                      color: articleData.isLiveFetched ? '#15803d' : '#1d4ed8',
                      border: `1px solid ${articleData.isLiveFetched ? '#bbf7d0' : '#bfdbfe'}`,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: articleData.isLiveFetched ? '#16a34a' : '#2563eb',
                      }} />
                      {articleData.isLiveFetched ? `En vivo (${articleData.sourceType})` : 'Oficial consolidado'} · {articleData.verifiedAt}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="btn-secondary"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Copiar texto oficial con cita normativa"
                    >
                      {copied ? <Check style={{ width: 13, height: 13, color: '#16a34a' }} /> : <Copy style={{ width: 13, height: 13 }} />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {articleData.content}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.875rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--brand-paper)',
          fontSize: '0.75rem',
          color: 'var(--brand-muted-light)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck style={{ width: 16, height: 16, color: '#047857' }} />
            <span>Sincronización activa con bases jurídicas oficiales (BOE consolidado y DOUE Cellar).</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
