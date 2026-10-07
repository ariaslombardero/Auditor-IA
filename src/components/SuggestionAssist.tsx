import React from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import type { InterviewQuestion } from '../lib/interviewCatalog';
import type { AnswerSuggestion } from '../lib/interviewSuggestions';

const TIPO: Record<AnswerSuggestion['tipo'], { texto: string; color: string; fondo: string }> = {
  con_cita: { texto: 'Con cita comprobada en la documentación', color: '#166534', fondo: '#dcfce7' },
  inferida: { texto: 'Inferida: sin respaldo literal en la documentación', color: '#92400e', fondo: '#fef3c7' },
  no_consta: { texto: 'No consta en la documentación', color: '#475569', fondo: '#f1f5f9' },
  orientacion: { texto: 'Decisión de la entidad: solo orientación', color: '#1e40af', fondo: '#dbeafe' },
};

function etiqueta(q: InterviewQuestion, valor: string): string {
  if (q.tipo === 'tri') return valor === 'si' ? 'Sí' : valor === 'no' ? 'No' : 'No lo sé';
  return q.opciones?.find((o) => o.value === valor)?.label ?? valor;
}

/** Sugerencia bajo una pregunta. Nunca se aplica sola: hay que pulsar «Aceptar». */
export const SuggestionBox: React.FC<{
  question: InterviewQuestion;
  suggestion: AnswerSuggestion;
  stale: boolean;
  onAccept: () => void;
  onDiscard: () => void;
}> = ({ question, suggestion: s, stale, onAccept, onDiscard }) => {
  const tipo = TIPO[s.tipo];
  const aceptable = !stale && s.valor !== undefined && (s.tipo === 'con_cita' || s.tipo === 'inferida');
  return (
    <div style={{ marginTop: '0.5rem', border: '1px dashed #93c5fd', background: '#f8fbff', borderRadius: 'var(--radius-md)', padding: '0.55rem 0.7rem', fontSize: '0.8rem', color: '#1e293b' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Lightbulb style={{ width: 14, height: 14, color: '#2563eb' }} />
        <strong>
          {s.fuente === 'ia' ? 'Sugerencia de la IA' : 'Indicio automático'}
          {s.valor !== undefined ? `: ${etiqueta(question, s.valor)}` : ''}
        </strong>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: tipo.color, background: tipo.fondo, padding: '0.05rem 0.4rem', borderRadius: 4 }}>{tipo.texto}</span>
      </div>
      {s.cita && (
        <p style={{ margin: '0.35rem 0 0', fontStyle: 'italic', color: '#334155' }}>
          {s.tipo === 'con_cita' ? 'Cita:' : 'Fragmento aportado:'} «{s.cita}»
        </p>
      )}
      <p style={{ margin: '0.3rem 0 0' }}>{s.razonamiento}</p>
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>
        {s.fuente === 'ia' ? `Generada por ${s.modelo} a partir de la documentación del paso 1.` : 'Detectada por palabras clave en la documentación del paso 1, sin IA.'}
        {stale ? ' La documentación ha cambiado desde entonces: vuelva a pedir la sugerencia.' : ''}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem' }}>
        {aceptable && (
          <button type="button" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.7rem', minHeight: 0 }} onClick={onAccept}>
            Aceptar
          </button>
        )}
        <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.7rem', minHeight: 0 }} onClick={onDiscard}>
          {aceptable ? 'Descartar' : 'Cerrar'}
        </button>
      </div>
    </div>
  );
};

/** Botón para pedir una sugerencia de una pregunta concreta. */
export const SuggestButton: React.FC<{ question: InterviewQuestion; conIA: boolean; cargando: boolean; onClick: () => void }> = ({ question, conIA, cargando, onClick }) => {
  if (question.sugerible === 'orientacion' && !conIA) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cargando}
      style={{ marginTop: '0.4rem', background: 'none', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: 'var(--radius-md)', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: cargando ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
    >
      <Lightbulb style={{ width: 13, height: 13 }} />
      {question.sugerible === 'orientacion' ? 'Explicar con mi caso' : conIA ? 'Sugerir respuesta con IA' : 'Buscar indicios en la documentación'}
    </button>
  );
};

/** Barra de asistencia al principio de la entrevista. */
export const AssistToolbar: React.FC<{
  proveedor: string | null;
  ubicacion: string;
  pendientes: number;
  cargando: boolean;
  estado?: string;
  error?: string;
  aceptablesEnBloque: number;
  hayDeIA: boolean;
  onSuggestAll: () => void;
  onAcceptBulk: () => void;
}> = ({ proveedor, ubicacion, pendientes, cargando, estado, error, aceptablesEnBloque, hayDeIA, onSuggestAll, onAcceptBulk }) => (
  <div className="card" style={{ border: '1px solid #bfdbfe', background: '#f8fbff' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
      <Lightbulb style={{ width: 18, height: 18, color: '#2563eb' }} />
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a' }}>Ayuda para contestar</h3>
    </div>
    <p style={{ fontSize: '0.8125rem', color: '#334155', marginBottom: '0.6rem' }}>
      {proveedor
        ? `Puedes pedir a la IA (${proveedor}, ${ubicacion}) que proponga respuestas a partir de la documentación del paso 1. Las propuestas no se aplican solas: decides tú si las aceptas.`
        : 'No hay proveedor de IA configurado: se pueden buscar indicios en la documentación por palabras clave. Para sugerencias razonadas, configura un proveedor (por ejemplo, un modelo local).'}
    </p>
    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={onSuggestAll} disabled={cargando || pendientes === 0}>
        {cargando ? <Loader2 className="spin" style={{ width: 14, height: 14 }} /> : <Lightbulb style={{ width: 14, height: 14 }} />}
        <span>{proveedor ? `Sugerir para las ${pendientes} pendientes` : `Buscar indicios para las ${pendientes} pendientes`}</span>
      </button>
      {aceptablesEnBloque > 0 && (
        <button type="button" className="btn-primary" style={{ fontSize: '0.8rem' }} onClick={onAcceptBulk} disabled={cargando}>
          {aceptablesEnBloque === 1 ? "Aceptar la sugerencia con cita comprobada" : `Aceptar las ${aceptablesEnBloque} sugerencias con cita comprobada`}
        </button>
      )}
    </div>
    {estado && <p style={{ fontSize: '0.78rem', color: '#1e3a8a', margin: '0.5rem 0 0' }}>{estado}</p>}
    {error && <p style={{ fontSize: '0.78rem', color: '#b91c1c', margin: '0.35rem 0 0' }}>{error}</p>}
    {hayDeIA && (
      <p style={{ fontSize: '0.75rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '0.45rem 0.6rem', margin: '0.6rem 0 0' }}>
        Sugerencias generadas por {proveedor ?? 'un modelo de IA'} a partir de la documentación aportada en el paso 1. Pueden ser incorrectas o incompletas; la respuesta es responsabilidad de quien la acepta. Las inferidas, y cualquier «no» sobre prácticas prohibidas o datos sensibles, deben revisarse una a una.
      </p>
    )}
  </div>
);
