import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowDownCircle, Ban, Building2, Cpu, Eye, Lock, Scale, ShieldCheck, UserCheck } from 'lucide-react';
import type { AppIdioma, AppIngestData, LegalEnrichmentAnswers, TriState } from '../types';
import { PROHIBITED_SYSTEMS_CATALOG } from '../lib/legalKnowledgeBase';
import { aiUsageHint, annexIIIHints, prohibitedPracticeHints } from '../lib/documentHints';
import {
  BLOCK_TITLES,
  isPending,
  pendingQuestions,
  questionsOfBlock,
  setAnswerValue,
  type InterviewBlock,
} from '../lib/interviewCatalog';
import { QuestionField } from './QuestionField';

interface LegalInterviewViewProps {
  answers: LegalEnrichmentAnswers;
  ingest: AppIngestData;
  onChange: (answers: LegalEnrichmentAnswers) => void;
  onBack: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  idioma: AppIdioma;
  /** Si ya se emitió un diagnóstico: los cambios lo actualizan al momento. */
  hasDiagnostic?: boolean;
  /** Pregunta a la que desplazarse al abrir (llegada desde el diagnóstico). */
  focusQuestionId?: string;
}

const BLOCK_ICONS: Record<InterviewBlock, React.ReactNode> = {
  A: <Cpu style={{ width: 18, height: 18 }} />,
  B: <Ban style={{ width: 18, height: 18 }} />,
  C: <Scale style={{ width: 18, height: 18 }} />,
  D: <Eye style={{ width: 18, height: 18 }} />,
  E: <Building2 style={{ width: 18, height: 18 }} />,
  F: <UserCheck style={{ width: 18, height: 18 }} />,
  G: <Lock style={{ width: 18, height: 18 }} />,
  H: <ShieldCheck style={{ width: 18, height: 18 }} />,
};

const BLOCK_SUBTITLES: Partial<Record<InterviewBlock, string>> = {
  B: 'Indica si el sistema incurre en cada práctica. Si no consta, la clasificación no podrá concluirse.',
  E: 'De este papel dependen las obligaciones: el proveedor responde del sistema; el responsable del despliegue, de su uso.',
  H: 'Valora el perjuicio que causaría un incidente en cada dimensión. La categoría del sistema es la del nivel más alto.',
};

const Section: React.FC<{ bloque: InterviewBlock; pendientes: number; children: React.ReactNode }> = ({ bloque, pendientes, children }) => (
  <div className="card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: BLOCK_SUBTITLES[bloque] ? '0.35rem' : '1rem', flexWrap: 'wrap' }}>
      <div style={{ background: '#dbeafe', color: '#1e40af', padding: '0.4rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>{BLOCK_ICONS[bloque]}</div>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>{BLOCK_TITLES[bloque]}</h3>
      {pendientes > 0 ? (
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '0.1rem 0.5rem', borderRadius: 999 }}>
          {pendientes} sin contestar
        </span>
      ) : (
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '0.1rem 0.5rem', borderRadius: 999 }}>Completo</span>
      )}
    </div>
    {BLOCK_SUBTITLES[bloque] && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{BLOCK_SUBTITLES[bloque]}</p>}
    {children}
  </div>
);

const TextField: React.FC<{ label: string; help?: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }> = ({
  label,
  help,
  value,
  onChange,
  multiline,
  placeholder,
}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {multiline ? (
      <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    )}
    {help && <p className="form-help">{help}</p>}
  </div>
);

export const LegalInterviewView: React.FC<LegalInterviewViewProps> = ({
  answers,
  ingest,
  onChange,
  onBack,
  onAnalyze,
  isAnalyzing,
  hasDiagnostic,
  focusQuestionId,
}) => {
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [resaltada, setResaltada] = useState<string | undefined>(undefined);

  const setText = <K extends keyof LegalEnrichmentAnswers>(key: K, value: LegalEnrichmentAnswers[K]) => onChange({ ...answers, [key]: value });
  const onSet = (id: string, value: string) => onChange(setAnswerValue(answers, id, value));

  const pHints = prohibitedPracticeHints(ingest);
  const aHints = annexIIIHints(ingest);
  const aiHint = aiUsageHint(ingest);
  const hintFor = (id: string): string | undefined => {
    if (id === 'infersOutputs') return aiHint?.evidence;
    if (id === 'annexIIIArea' && aHints.length) return aHints.map((h) => `${h.target.replace('annexIII:', '')}: ${h.evidence}`).join(' · ');
    if (id.startsWith('prohibitedPractices.')) return pHints.find((h) => h.target === id.split('.')[1])?.evidence;
    return undefined;
  };

  const pendientes = pendingQuestions(answers);
  const esIA = answers.infersOutputs !== 'no';
  const inAnnexArea = esIA && answers.annexIIIArea !== 'ninguno' && answers.annexIIIArea !== 'desconocido';
  const tratarDatos = answers.processesPersonalData !== 'no';

  const irA = (id: string) => {
    const el = document.getElementById(`pregunta-${id}`);
    if (!el) return;
    // Desplazamiento suave solo si la página está visible y no se ha pedido reducir el movimiento
    const suave = document.visibilityState === 'visible' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'center' });
    setResaltada(id);
    window.setTimeout(() => setResaltada((actual) => (actual === id ? undefined : actual)), 2500);
  };

  // Llegada desde el diagnóstico: desplazarse a la pregunta indicada
  useEffect(() => {
    if (focusQuestionId) window.setTimeout(() => irA(focusQuestionId), 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusQuestionId]);

  /** La siguiente pendiente por debajo de la posición actual; si no hay, la primera. */
  const irALaSiguiente = () => {
    const visibles = pendientes.map((q) => document.getElementById(`pregunta-${q.id}`)).filter((el): el is HTMLElement => Boolean(el));
    if (!visibles.length) return;
    const siguiente = visibles.find((el) => el.getBoundingClientRect().top > 140) ?? visibles[0];
    irA(siguiente.id.replace('pregunta-', ''));
  };

  /** Campos de texto opcionales que acompañan a algunas preguntas (no cuentan como pendientes). */
  const extras: Record<string, React.ReactNode> = {
    annexIIIArea: inAnnexArea ? (
      <TextField
        label="Describe el uso concreto en ese ámbito"
        value={answers.annexIIIUseDescription}
        onChange={(v) => setText('annexIIIUseDescription', v)}
        placeholder="Por ejemplo: ordena las solicitudes según los méritos alegados"
      />
    ) : null,
    humanOversightLevel: (
      <TextField label="¿Quién supervisa? (rol)" value={answers.supervisionRole} onChange={(v) => setText('supervisionRole', v)} placeholder="Por ejemplo: técnico de la unidad tramitadora" />
    ),
    directHumanIntervention: (
      <>
        <TextField
          label="Describe cómo funciona realmente el procedimiento"
          help="Quién interviene, en qué momento y con qué capacidad de modificar o descartar el resultado. Sin esta descripción el deslinde del Art. 41 queda pendiente."
          value={answers.procedureDescription}
          onChange={(v) => setText('procedureDescription', v)}
          multiline
        />
        <TextField label="Norma que regula el procedimiento o la competencia" value={answers.publicCompetenceNorm} onChange={(v) => setText('publicCompetenceNorm', v)} placeholder="Por ejemplo: bases de la convocatoria, Ley 39/2015" />
      </>
    ),
    preventsRightsOrService: tratarDatos ? (
      <TextField label="Actividad del Registro de Actividades de Tratamiento" value={answers.ratActivityName} onChange={(v) => setText('ratActivityName', v)} help="Indicar el nombre no acredita la inscripción: debe verificarla el DPD." />
    ) : null,
    auditLogsEnabled:
      answers.auditLogsEnabled === 'si' ? (
        <div className="form-group">
          <label className="form-label">Meses de conservación del registro</label>
          <input type="number" min={0} value={answers.logRetentionMonths} onChange={(e) => setText('logRetentionMonths', Number(e.target.value) || 0)} />
        </div>
      ) : null,
  };

  const bloques: InterviewBlock[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const renderBloque = (bloque: InterviewBlock) => {
    const preguntas = questionsOfBlock(bloque).filter((q) => q.visible(answers));
    const pendientesBloque = preguntas.filter((q) => isPending(answers, q.id)).length;
    if (preguntas.length === 0) return null;
    if (soloPendientes && pendientesBloque === 0) return null;
    const mostradas = soloPendientes ? preguntas.filter((q) => isPending(answers, q.id)) : preguntas;

    const campo = (id: string) => {
      const q = mostradas.find((x) => x.id === id)!;
      return (
        <React.Fragment key={q.id}>
          <QuestionField question={q} answers={answers} onSet={onSet} hint={hintFor(q.id)} highlight={resaltada === q.id} />
          {!soloPendientes && extras[q.id]}
        </React.Fragment>
      );
    };
    const ens = mostradas.filter((q) => q.id.startsWith('ensImpact.'));
    const resto = mostradas.filter((q) => !q.id.startsWith('ensImpact.'));

    return (
      <Section key={bloque} bloque={bloque} pendientes={pendientesBloque}>
        {bloque === 'B' && !soloPendientes && (
          <button
            type="button"
            className="btn-secondary"
            style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}
            onClick={() => onChange({ ...answers, prohibitedPractices: Object.fromEntries(PROHIBITED_SYSTEMS_CATALOG.map((p) => [p.id, 'no' as TriState])) })}
          >
            He revisado todas y declaro que no concurre ninguna
          </button>
        )}
        {ens.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1.5rem' }}>
            {ens.map((q) => campo(q.id))}
          </div>
        )}
        {resto.map((q) => campo(q.id))}
      </Section>
    );
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Paso 2: Entrevista jurídica
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Las respuestas son declaraciones del promotor y determinan la clasificación preliminar según el Reglamento (UE) 2024/1689 (modificado por el Reglamento (UE) 2026/1744), el RGPD, el ENS y la Ley 40/2015.
          Pulsa «¿Qué significa?» en cualquier pregunta para ver una explicación sencilla con ejemplos. Contesta «No lo sé» cuando no conste: el resultado será <strong>«requiere revisión»</strong> en lugar de presumir que no hay riesgo.
        </p>
        {hasDiagnostic && (
          <p style={{ fontSize: '0.8125rem', marginTop: '0.35rem', color: '#1e3a8a' }}>
            El diagnóstico ya emitido se actualiza al momento con cada cambio.
          </p>
        )}
      </div>

      {/* Barra fija de respuestas pendientes */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: pendientes.length ? '#fffbeb' : '#f0fdf4',
          border: `1px solid ${pendientes.length ? '#fcd34d' : '#bbf7d0'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.55rem 0.9rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.8125rem',
          boxShadow: '0 2px 6px rgba(15,23,42,0.06)',
        }}
      >
        <strong style={{ color: pendientes.length ? '#92400e' : '#166534' }}>
          {pendientes.length === 0
            ? 'Todas las preguntas están contestadas.'
            : pendientes.length === 1
              ? 'Queda 1 respuesta sin contestar.'
              : `Quedan ${pendientes.length} respuestas sin contestar.`}
        </strong>
        {pendientes.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }} onClick={irALaSiguiente}>
              <ArrowDownCircle style={{ width: 14, height: 14 }} />
              <span>Ir a la siguiente</span>
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={soloPendientes} onChange={(e) => setSoloPendientes(e.target.checked)} />
              <span>Mostrar solo las pendientes</span>
            </label>
          </div>
        )}
      </div>

      {!esIA && (
        <div className="card" style={{ background: '#f8fafc', fontSize: '0.875rem', color: '#475569' }}>
          Has indicado que el sistema no infiere sus resultados: no sería un sistema de IA y no se le aplica el Reglamento de IA. Por eso se ocultan los bloques B a E. Contesta los bloques F a H, que siguen aplicándose.
        </div>
      )}

      {bloques.map(renderBloque)}

      {soloPendientes && pendientes.length === 0 && (
        <div className="card" style={{ background: '#f0fdf4', color: '#166534', fontSize: '0.875rem' }}>
          No queda ninguna pregunta sin contestar. Desmarca «Mostrar solo las pendientes» para ver la entrevista completa.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button type="button" onClick={onBack} className="btn-secondary">
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span>Volver a la ingesta</span>
        </button>
        <button type="button" onClick={onAnalyze} className="btn-primary" disabled={isAnalyzing}>
          <span>{isAnalyzing ? 'Analizando...' : hasDiagnostic ? 'Actualizar diagnóstico y guardar' : 'Emitir diagnóstico preliminar'}</span>
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};
