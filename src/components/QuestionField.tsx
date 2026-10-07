import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { LegalEnrichmentAnswers } from '../types';
import { getAnswerValue, isPending, type InterviewQuestion } from '../lib/interviewCatalog';

const TRI_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'desconocido', label: 'No lo sé' },
];

interface QuestionFieldProps {
  question: InterviewQuestion;
  answers: LegalEnrichmentAnswers;
  onSet: (id: string, value: string) => void;
  /** Indicio de la documentación (solo orienta). */
  hint?: string;
  /** Resaltar la pregunta (llegada desde «Ir a la siguiente» o desde el diagnóstico). */
  highlight?: boolean;
  /** Versión reducida para el panel del diagnóstico. */
  compact?: boolean;
  /** Espacio para acciones adicionales (sugerencias, enlace a la entrevista). */
  children?: React.ReactNode;
}

/**
 * Pregunta de la entrevista a partir del catálogo: resalta si está sin contestar y
 * ofrece «¿Qué significa?» con una explicación sencilla y ejemplos.
 */
export const QuestionField: React.FC<QuestionFieldProps> = ({ question: q, answers, onSet, hint, highlight, compact, children }) => {
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const valor = getAnswerValue(answers, q.id);
  const pendiente = isPending(answers, q.id);

  return (
    <div
      id={`pregunta-${q.id}`}
      data-pendiente={pendiente ? 'true' : 'false'}
      className="form-group"
      style={{
        padding: '0.6rem 0.75rem',
        marginLeft: '-0.75rem',
        marginRight: '-0.75rem',
        borderRadius: 'var(--radius-md)',
        borderLeft: `3px solid ${pendiente ? '#f59e0b' : 'transparent'}`,
        background: highlight ? '#eff6ff' : pendiente ? '#fffdf5' : 'transparent',
        outline: highlight ? '2px solid #3b82f6' : 'none',
        transition: 'background 0.3s, outline 0.3s',
        scrollMarginTop: '7rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span className="form-label" style={{ marginBottom: '0.35rem' }}>
          {q.enunciado}
          {pendiente && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '0.05rem 0.4rem', borderRadius: 4, whiteSpace: 'nowrap' }}>
              Sin contestar
            </span>
          )}
        </span>
        {q.ayuda && (
          <button
            type="button"
            onClick={() => setAyudaAbierta(!ayudaAbierta)}
            aria-expanded={ayudaAbierta}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <HelpCircle style={{ width: 13, height: 13 }} />
            ¿Qué significa?
          </button>
        )}
      </div>

      {ayudaAbierta && q.ayuda && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#0c4a6e', marginBottom: '0.5rem', lineHeight: 1.5 }}>
          <p style={{ margin: 0 }}>{q.ayuda.queSignifica}</p>
          {q.ayuda.ejemploSi && <p style={{ margin: '0.35rem 0 0' }}><strong>{q.tipo === 'tri' ? 'Ejemplo de «sí»:' : 'Ejemplo:'}</strong> {q.ayuda.ejemploSi}</p>}
          {q.ayuda.ejemploNo && <p style={{ margin: '0.35rem 0 0' }}><strong>{q.tipo === 'tri' ? 'Ejemplo de «no»:' : 'Otro ejemplo:'}</strong> {q.ayuda.ejemploNo}</p>}
          {q.ayuda.norma && <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: '#475569' }}>Norma: {q.ayuda.norma}</p>}
        </div>
      )}

      {q.tipo === 'tri' && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {TRI_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onSet(q.id, o.value)}
              aria-pressed={valor === o.value}
              style={{
                padding: compact ? '0.25rem 0.75rem' : '0.35rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: valor === o.value ? 700 : 500,
                cursor: 'pointer',
                border: valor === o.value ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: valor === o.value ? (o.value === 'desconocido' ? '#fffbeb' : '#eff6ff') : 'white',
                color: 'var(--color-text)',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {q.tipo === 'select' && (
        <select value={valor} onChange={(e) => onSet(q.id, e.target.value)} aria-label={q.enunciado}>
          {(q.opciones ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {q.tipo === 'texto' && (
        <textarea rows={3} value={valor} onChange={(e) => onSet(q.id, e.target.value)} aria-label={q.enunciado} />
      )}

      {hint && <p className="form-help" style={{ color: '#92400e' }}>Indicio en la documentación: «{hint}». Solo orienta la respuesta.</p>}
      {children}
    </div>
  );
};
