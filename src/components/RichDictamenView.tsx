import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ListOrdered,
  Sparkles,
  Bot,
  ExternalLink,
} from 'lucide-react';

interface RichDictamenViewProps {
  content: string;
}

interface ParsedSection {
  title: string;
  items: {
    type: 'paragraph' | 'bullet' | 'numbered' | 'callout';
    prefix?: string;
    text: string;
  }[];
}

export const RichDictamenView: React.FC<RichDictamenViewProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const [viewRaw, setViewRaw] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parser of markdown blocks into executive structured sections
  const sections = React.useMemo(() => {
    const lines = content.split('\n');
    const result: ParsedSection[] = [];
    let currentSection: ParsedSection = {
      title: 'Dictamen Pericial de Conformidad Técnica y Jurídica',
      items: [],
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === '---' || line === '***') continue;

      if (line.startsWith('#')) {
        if (currentSection.items.length > 0 || currentSection.title !== 'Dictamen Pericial de Conformidad Técnica y Jurídica') {
          result.push(currentSection);
        }
        const cleanTitle = line.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '').trim();
        currentSection = {
          title: cleanTitle,
          items: [],
        };
        continue;
      }

      // Check conclusion or callout
      if (line.toLowerCase().startsWith('**conclusión') || line.toLowerCase().startsWith('conclusión:') || line.startsWith('>')) {
        const text = line.replace(/^>\s*/, '').trim();
        currentSection.items.push({
          type: 'callout',
          text,
        });
        continue;
      }

      // Numbered list
      const numMatch = line.match(/^(\d+[\.\)])\s+(.*)$/);
      if (numMatch) {
        currentSection.items.push({
          type: 'numbered',
          prefix: numMatch[1],
          text: numMatch[2],
        });
        continue;
      }

      // Bullet item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        currentSection.items.push({
          type: 'bullet',
          text: line.replace(/^[-*]\s+/, '').trim(),
        });
        continue;
      }

      // Regular paragraph
      currentSection.items.push({
        type: 'paragraph',
        text: line,
      });
    }

    if (currentSection.items.length > 0) {
      result.push(currentSection);
    }

    return result;
  }, [content]);

  // Helper to format inline bold text
  const renderInlineFormatted = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.slice(2, -2);
        return (
          <strong key={idx} style={{ color: '#0f172a', fontWeight: 700 }}>
            {clean}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const getSectionIcon = (title: string, index: number) => {
    const lower = title.toLowerCase();
    if (lower.includes('riesgo') || lower.includes('ai act') || lower.includes('normativ')) {
      return <Scale style={{ width: 18, height: 18, color: '#0284c7' }} />;
    }
    if (lower.includes('técnica') || lower.includes('seguridad') || lower.includes('ciber') || lower.includes('ccn')) {
      return <ShieldCheck style={{ width: 18, height: 18, color: '#059669' }} />;
    }
    if (lower.includes('acción') || lower.includes('plan') || lower.includes('inmediat')) {
      return <ListOrdered style={{ width: 18, height: 18, color: '#7c3aed' }} />;
    }
    return <Sparkles style={{ width: 18, height: 18, color: '#d97706' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bot style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Dictamen Especializado de Auditoría Asistida
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Evaluación pericial emitida conforme a AI Act, RGPD, ENS (CCN-STIC 884D) y Ley 40/2015
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setViewRaw(!viewRaw)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
          >
            {viewRaw ? 'Ver Vista Enriquecida' : 'Ver Texto Markdown'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {copied ? <Check style={{ width: 13, height: 13, color: '#16a34a' }} /> : <Copy style={{ width: 13, height: 13 }} />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {viewRaw ? (
        <pre style={{
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          whiteSpace: 'pre-wrap',
          border: '1px solid var(--color-border)',
          color: '#334155',
          fontFamily: 'Consolas, monospace',
        }}>
          {content}
        </pre>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sections.map((sec, secIdx) => (
            <div
              key={secIdx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              {/* Section Header */}
              <div style={{
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {getSectionIcon(sec.title, secIdx)}
                <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  {sec.title}
                </h5>
              </div>

              {/* Section Body */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sec.items.map((item, itemIdx) => {
                  if (item.type === 'callout') {
                    return (
                      <div
                        key={itemIdx}
                        style={{
                          background: '#eff6ff',
                          borderLeft: '4px solid #0284c7',
                          padding: '0.75rem 1rem',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                          fontSize: '0.85rem',
                          lineHeight: 1.55,
                          color: '#1e3a8a',
                        }}
                      >
                        {renderInlineFormatted(item.text)}
                      </div>
                    );
                  }

                  if (item.type === 'numbered') {
                    return (
                      <div
                        key={itemIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.625rem',
                          fontSize: '0.85rem',
                          lineHeight: 1.55,
                          color: '#334155',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: '#fcfcfd',
                        }}
                      >
                        <span style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '999px',
                          padding: '2px 8px',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}>
                          {item.prefix}
                        </span>
                        <div style={{ flex: 1 }}>{renderInlineFormatted(item.text)}</div>
                      </div>
                    );
                  }

                  if (item.type === 'bullet') {
                    return (
                      <div
                        key={itemIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          lineHeight: 1.55,
                          color: '#334155',
                          paddingLeft: '0.5rem',
                        }}
                      >
                        <span style={{ color: '#0284c7', fontWeight: 800, marginTop: '-2px' }}>•</span>
                        <div style={{ flex: 1 }}>{renderInlineFormatted(item.text)}</div>
                      </div>
                    );
                  }

                  // Paragraph
                  return (
                    <p
                      key={itemIdx}
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        color: '#334155',
                      }}
                    >
                      {renderInlineFormatted(item.text)}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
