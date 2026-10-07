import React, { useState } from 'react';
import {
  FileText,
  UserCheck,
  ShieldCheck,
  Code,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ApiConfigModal } from './components/ApiConfigModal';
import { UserGuideModal } from './components/UserGuideModal';
import { LiveLegislationModal } from './components/LiveLegislationModal';
import { ExecutivePurposeModal } from './components/ExecutivePurposeModal';
import { IngestionView } from './components/IngestionView';
import { LegalInterviewView } from './components/LegalInterviewView';
import { DiagnosticDashboard } from './components/DiagnosticDashboard';
import { CodeKitView } from './components/CodeKitView';
import { OfficialDossierView } from './components/OfficialDossierView';
import { PreProductionHardeningView } from './components/PreProductionHardeningView';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { useApiConfig } from './context/ApiConfigContext';
import { evaluateRulesDeterministically, analyzeWithLLM, LLM_DISSENT_NOTICE } from './lib/auditEngine';
import { normalizeDiagnostic } from './lib/assessmentModel';
import { normalizeAnswers } from './lib/answersModel';
import { effectiveDiagnostic, inputsKey } from './lib/validations';
import { generateCodeKit } from './lib/codeKitGenerator';
import { registroAsistencia, restriccionEnvio } from './lib/proveedorEfectivo';
import { formatApiError } from './lib/apiService';
import { getStoredAudits, saveAuditRecord, type SaveOutcome } from './lib/auditHistoryService';
import { currentAiComment, recomputeAudit } from './lib/auditState';
import { isPending, pendingQuestions, setAnswerValue, type InterviewQuestion } from './lib/interviewCatalog';
import {
  acceptSuggestion,
  bulkAcceptable,
  hintSuggestions,
  ingestKey,
  sourcesAfterManualChange,
  suggestWithAI,
  type AnswerSuggestion,
} from './lib/interviewSuggestions';
import { ETIQUETA_UBICACION, ubicacionProveedor } from './lib/proveedorEfectivo';
import { describirProveedor } from './lib/apiService';
import { AssistToolbar, SuggestButton, SuggestionBox } from './components/SuggestionAssist';
import type {
  AppIdioma,
  FullAuditState,
  StoredAuditRecord,
} from './types';
import { t } from './lib/i18n';
import { DEFAULT_INGEST, DEFAULT_ANSWERS, DEFAULT_METADATA } from './lib/auditDefaults';

type Step = 'ingesta' | 'entrevista' | 'diagnostico' | 'codigo' | 'expediente' | 'blindaje';

export const App: React.FC = () => {
  const [idioma, setIdioma] = useState<AppIdioma>('castellano');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showLiveLegislation, setShowLiveLegislation] = useState(false);
  const [liveNormTarget, setLiveNormTarget] = useState<{ normId: string; article: string }>({ normId: 'AI-ACT', article: '14' });
  const [currentStep, setCurrentStep] = useState<Step>('ingesta');
  // Pregunta a la que debe desplazarse la entrevista al abrirla desde el diagnóstico.
  const [focusQuestionId, setFocusQuestionId] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmCritique, setLlmCritique] = useState<string | undefined>(undefined);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  // Expediente en curso: sus nuevas versiones se guardan como revisiones, sin sobrescribir.
  const [currentAuditId, setCurrentAuditId] = useState<string | undefined>(undefined);
  const [custodyNotice, setCustodyNotice] = useState<{ tipo: 'error' | 'aviso'; texto: string } | null>(null);
  // Sugerencias de respuesta: nunca se aplican solas (se aceptan una a una o, las de cita comprobada, en bloque).
  const [suggestions, setSuggestions] = useState<Record<string, AnswerSuggestion>>({});
  const [suggestStatus, setSuggestStatus] = useState<{ cargando: boolean; texto?: string; error?: string }>({ cargando: false });
  const [externalConsent, setExternalConsent] = useState(false);
  // Huella de las entradas de la última revisión guardada en el historial.
  const [savedInputsKey, setSavedInputsKey] = useState<string | undefined>(undefined);

  const { config, isConfigured } = useApiConfig();

  React.useEffect(() => {
    setHistoryCount(getStoredAudits().length);
  }, []);

  const [state, setState] = useState<FullAuditState>({
    ingest: DEFAULT_INGEST,
    answers: DEFAULT_ANSWERS,
    diagnostic: null,
    codeKit: null,
    metadata: DEFAULT_METADATA,
    analyzing: false,
  });

  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar la auditoría y comenzar una nueva?')) {
      setState({
        ingest: DEFAULT_INGEST,
        answers: DEFAULT_ANSWERS,
        diagnostic: null,
        codeKit: null,
        metadata: DEFAULT_METADATA,
        analyzing: false,
      });
      setLlmCritique(undefined);
      setCurrentAuditId(undefined);
      setCustodyNotice(null);
      setSavedInputsKey(undefined);
      setSuggestions({});
      setSuggestStatus({ cargando: false });
      setCurrentStep('ingesta');
    }
  };

  /** Guarda una revisión del expediente en curso y comunica cualquier fallo o retirada de registros. */
  const saveRevision = (next: FullAuditState, critique: string | undefined) => {
    let outcome: SaveOutcome;
    try {
      outcome = saveAuditRecord(next, critique, { auditId: currentAuditId });
    } catch (err) {
      setCustodyNotice({ tipo: 'error', texto: `El diagnóstico NO se ha guardado en el historial. ${(err as Error).message}` });
      return;
    }
    setCurrentAuditId(outcome.record.auditId);
    setSavedInputsKey(inputsKey(next));
    setHistoryCount(getStoredAudits().length);
    setCustodyNotice(
      outcome.retirados.length > 0
        ? { tipo: 'aviso', texto: `Guardada la revisión ${outcome.record.revision}. Para respetar el límite del historial se han retirado ${outcome.retirados.length} registro(s) antiguo(s) del navegador. Exporte una copia JSON si los necesita.` }
        : null
    );
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);

    // 1. Instant deterministic evaluation
    const baselineDiagnostic = evaluateRulesDeterministically(state.ingest, state.answers);
    const codeKit = generateCodeKit(state.ingest, state.answers, baselineDiagnostic);

    let critiqueText: string | undefined = undefined;
    let dissentDetected = false;

    // 2. Comentario complementario de IA si hay proveedor (no altera la clasificación; solo puede
    //    señalar una discrepancia). Se registra qué proveedor se usó o por qué no se usó.
    let aiAssistance = registroAsistencia(null, 'no_configurada');
    if (isConfigured && config) {
      const restriccion = restriccionEnvio(config, state.answers);
      if (!restriccion.permitido) {
        aiAssistance = registroAsistencia(config, 'bloqueada', restriccion.motivo);
      } else {
        try {
          const llmResult = await analyzeWithLLM(config, state.ingest, state.answers, baselineDiagnostic);
          critiqueText = llmResult.enrichedSummary;
          dissentDetected = llmResult.dissentDetected;
          aiAssistance = registroAsistencia(config, 'usada');
        } catch (err: unknown) {
          aiAssistance = registroAsistencia(config, 'fallida', formatApiError(err, idioma));
        }
      }
    }

    // El diagnóstico y el comentario de IA quedan ligados a las entradas con que se calcularon.
    const key = inputsKey(state);
    const dissentAlert = dissentDetected ? LLM_DISSENT_NOTICE : undefined;
    const updatedFullState: FullAuditState = {
      ...state,
      diagnostic: {
        ...baselineDiagnostic,
        inputsKey: key,
        aiAssistance: { ...aiAssistance, inputsKey: key, ...(dissentAlert ? { dissentAlert } : {}) },
        ...(dissentAlert ? { pericialDissentAlert: dissentAlert } : {}),
      },
      codeKit,
    };

    setLlmCritique(critiqueText);
    setState(updatedFullState);

    // 3. Guardar como revisión del expediente en curso (o abrir uno nuevo)
    saveRevision(updatedFullState, critiqueText);

    setIsAnalyzing(false);
    setCurrentStep('diagnostico');
  };

  // Validación humana documentada de un requisito (queda ligada a las entradas actuales)
  const persistState = (next: FullAuditState) => {
    setState(next);
    saveRevision(next, currentAiComment(next, llmCritique));
  };

  /** Cambios en la ingesta o la entrevista: el diagnóstico ya emitido se recalcula al momento. */
  const updateInputs = (patch: Partial<Pick<FullAuditState, 'ingest' | 'answers'>>) => {
    setState((p) => {
      // Si la persona cambia una respuesta que venía de una sugerencia, el origen vuelve a ser suyo.
      const answerSources = patch.answers ? sourcesAfterManualChange(p.answers, patch.answers, p.answerSources) : p.answerSources;
      return recomputeAudit({ ...p, ...patch, answerSources });
    });
  };

  // ---- Sugerencias de respuesta ----
  const currentIngestKey = ingestKey(state.ingest);
  const conIA = Boolean(isConfigured && config);
  const proveedorLabel = isConfigured && config ? `${describirProveedor(config)} · ${config.model}` : null;
  const quitarSugerencias = (ids: string[]) =>
    setSuggestions((p) => Object.fromEntries(Object.entries(p).filter(([id]) => !ids.includes(id))));

  const requestSuggestions = async (ids: string[]) => {
    if (!ids.length || suggestStatus.cargando) return;
    if (!isConfigured || !config) {
      const indicios = hintSuggestions(state.ingest, state.answers).filter((s) => ids.includes(s.questionId));
      setSuggestions((p) => ({ ...p, ...Object.fromEntries(indicios.map((s) => [s.questionId, s])) }));
      setSuggestStatus({
        cargando: false,
        texto: indicios.length
          ? `${indicios.length} indicio(s) encontrados en la documentación.`
          : 'La documentación no contiene indicios para estas preguntas. Configura un proveedor de IA para obtener sugerencias razonadas.',
      });
      return;
    }
    if (ubicacionProveedor(config) === 'externo' && !externalConsent) {
      const ok = window.confirm(
        `Para sugerir respuestas se enviará la documentación del paso 1 (descripción, README, AGENTS.md y prompt del sistema) a ${describirProveedor(config)}, un servicio externo. ¿Continuar?`
      );
      if (!ok) return;
      setExternalConsent(true);
    }
    setSuggestStatus({ cargando: true, texto: 'Pidiendo sugerencias…' });
    const r = await suggestWithAI(config, state.ingest, state.answers, ids, (hechos, total) =>
      setSuggestStatus({ cargando: true, texto: `Pidiendo sugerencias… bloque ${hechos} de ${total}` })
    );
    setSuggestions((p) => ({ ...p, ...Object.fromEntries(r.sugerencias.map((s) => [s.questionId, s])) }));
    const partes = [`${r.sugerencias.length} sugerencia(s) recibida(s)`];
    if (r.descartadas) partes.push(`${r.descartadas} descartada(s) por no ser válidas`);
    if (r.recortada) partes.push('la documentación era muy larga y se envió recortada');
    setSuggestStatus({ cargando: false, texto: `${partes.join(' · ')}.`, error: r.error });
  };

  const handleAcceptSuggestion = (s: AnswerSuggestion) => {
    setState((p) => recomputeAudit(acceptSuggestion(p, s)));
    quitarSugerencias([s.questionId]);
  };

  const sugerenciasVigentes = Object.values(suggestions).filter((s) => s.ingestKey === currentIngestKey && isPending(state.answers, s.questionId));
  const enBloque = bulkAcceptable(sugerenciasVigentes);
  const handleAcceptBulk = () => {
    setState((p) => recomputeAudit(enBloque.reduce((acc, s) => acceptSuggestion(acc, s), p)));
    quitarSugerencias(enBloque.map((s) => s.questionId));
  };

  /** Ayuda bajo cada pregunta pendiente: la sugerencia recibida o el botón para pedirla. */
  const renderAssist = (q: InterviewQuestion): React.ReactNode => {
    if (!isPending(state.answers, q.id)) return null;
    const s = suggestions[q.id];
    if (s) {
      return (
        <SuggestionBox
          question={q}
          suggestion={s}
          stale={s.ingestKey !== currentIngestKey}
          onAccept={() => handleAcceptSuggestion(s)}
          onDiscard={() => quitarSugerencias([q.id])}
        />
      );
    }
    return <SuggestButton question={q} conIA={conIA} cargando={suggestStatus.cargando} onClick={() => requestSuggestions([q.id])} />;
  };

  const assistToolbar = (
    <AssistToolbar
      proveedor={proveedorLabel}
      ubicacion={config ? ETIQUETA_UBICACION[ubicacionProveedor(config)] : ''}
      pendientes={pendingQuestions(state.answers).length}
      cargando={suggestStatus.cargando}
      estado={suggestStatus.texto}
      error={suggestStatus.error}
      aceptablesEnBloque={enBloque.length}
      hayDeIA={sugerenciasVigentes.some((s) => s.fuente === 'ia')}
      onSuggestAll={() => requestSuggestions(pendingQuestions(state.answers).map((q) => q.id))}
      onAcceptBulk={handleAcceptBulk}
    />
  );

  // Comentario de IA solo si corresponde a las respuestas actuales.
  const aiComment = currentAiComment(state, llmCritique);
  const unsavedChanges = Boolean(state.diagnostic && savedInputsKey && savedInputsKey !== inputsKey(state));

  const handleValidateRequirement = (requirementId: string, revisadoPor: string, evidencia: string) => {
    persistState({
      ...state,
      validations: {
        ...(state.validations || {}),
        [requirementId]: { revisadoPor, evidencia, fecha: new Date().toISOString(), inputsKey: inputsKey(state) },
      },
    });
  };

  const handleRevokeValidation = (requirementId: string) => {
    const { [requirementId]: _removed, ...rest } = state.validations || {};
    persistState({ ...state, validations: rest });
  };

  const handleLoadAuditFromHistory = (record: StoredAuditRecord) => {
    setState({
      ...record.state,
      answers: normalizeAnswers(record.state.answers),
      diagnostic: normalizeDiagnostic(record.state.diagnostic),
    });
    setLlmCritique(record.llmCritique);
    setCurrentAuditId(record.auditId);
    setSavedInputsKey(inputsKey(record.state));
    setSuggestions({});
    setSuggestStatus({ cargando: false });
    setCustodyNotice(null);
    setCurrentStep('diagnostico');
    setShowHistoryModal(false);
  };

  const stepsList: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'ingesta', label: t('step_1', idioma), icon: <FileText style={{ width: 15, height: 15 }} /> },
    { key: 'entrevista', label: t('step_2', idioma), icon: <UserCheck style={{ width: 15, height: 15 }} /> },
    { key: 'diagnostico', label: t('step_3', idioma), icon: <ShieldCheck style={{ width: 15, height: 15 }} /> },
    { key: 'codigo', label: t('step_4', idioma), icon: <Code style={{ width: 15, height: 15 }} /> },
    { key: 'expediente', label: t('step_5', idioma), icon: <FileDown style={{ width: 15, height: 15 }} /> },
    { key: 'blindaje', label: t('step_6', idioma), icon: <Sparkles style={{ width: 15, height: 15, color: '#8b5cf6' }} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        idioma={idioma}
        setIdioma={setIdioma}
        onOpenApiModal={() => setShowApiModal(true)}
        onOpenGuide={() => setShowGuide(true)}
        onOpenPurpose={() => setShowPurposeModal(true)}
        onOpenLiveLegislation={() => setShowLiveLegislation(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        historyCount={historyCount}
        onReset={handleReset}
      />

      <main className="container" style={{ flex: 1 }}>
        {custodyNotice && (
          <div
            role={custodyNotice.tipo === 'error' ? 'alert' : 'status'}
            style={{
              margin: '1rem 0 0',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
              background: custodyNotice.tipo === 'error' ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${custodyNotice.tipo === 'error' ? '#f87171' : '#fcd34d'}`,
              color: custodyNotice.tipo === 'error' ? '#991b1b' : '#92400e',
            }}
          >
            <span>{custodyNotice.texto}</span>
            <button type="button" onClick={() => setCustodyNotice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }} aria-label="Cerrar aviso">×</button>
          </div>
        )}
        {unsavedChanges && (
          <div
            role="status"
            style={{
              margin: '1rem 0 0',
              padding: '0.6rem 1rem',
              borderRadius: 8,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
              background: '#eff6ff',
              border: '1px solid #93c5fd',
              color: '#1e3a8a',
            }}
          >
            <span>Has cambiado respuestas desde la última revisión guardada. El diagnóstico ya está actualizado; guárdalo en el historial cuando termines.</span>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }} onClick={() => saveRevision(state, aiComment)}>
              Guardar revisión
            </button>
          </div>
        )}
        {/* Stepper Navigation */}
        <nav className="stepper-nav" aria-label="Progreso de auditoría">
          {stepsList.map((s, index) => {
            const isCompleted =
              (s.key === 'ingesta' && Boolean(state.ingest.appName && state.ingest.readmeContent)) ||
              (s.key === 'entrevista' && Boolean(state.diagnostic)) ||
              (s.key === 'diagnostico' && Boolean(state.diagnostic)) ||
              (s.key === 'codigo' && Boolean(state.codeKit)) ||
              (s.key === 'expediente' && Boolean(state.diagnostic)) ||
              (s.key === 'blindaje' && Boolean(state.diagnostic));
            const isActive = currentStep === s.key;
            const canNavigate =
              isCompleted ||
              s.key === 'ingesta' ||
              s.key === 'entrevista' ||
              (Boolean(state.diagnostic) && (s.key === 'expediente' || s.key === 'blindaje'));

            return (
              <button
                key={s.key}
                type="button"
                onClick={() => canNavigate && setCurrentStep(s.key)}
                disabled={!canNavigate}
                className={`stepper-tab ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Step Views */}
        {currentStep === 'ingesta' && (
          <IngestionView
            data={state.ingest}
            onChange={(newIngest) => updateInputs({ ingest: newIngest })}
            onProceed={() => setCurrentStep('entrevista')}
            onOpenPurpose={() => setShowPurposeModal(true)}
            idioma={idioma}
          />
        )}

        {currentStep === 'entrevista' && (
          <LegalInterviewView
            answers={state.answers}
            ingest={state.ingest}
            onChange={(newAnswers) => updateInputs({ answers: newAnswers })}
            hasDiagnostic={Boolean(state.diagnostic)}
            focusQuestionId={focusQuestionId}
            renderAssist={renderAssist}
            assistToolbar={assistToolbar}
            onBack={() => setCurrentStep('ingesta')}
            onAnalyze={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
            idioma={idioma}
          />
        )}

        {currentStep === 'diagnostico' && state.diagnostic && (
          <DiagnosticDashboard
            diagnostic={effectiveDiagnostic(state)!}
            validations={state.validations || {}}
            onValidateRequirement={handleValidateRequirement}
            onRevokeValidation={handleRevokeValidation}
            appName={state.ingest.appName}
            llmCritique={aiComment}
            onRegenerateAi={handleStartAnalysis}
            answers={state.answers}
            onSetAnswer={(id, value) => updateInputs({ answers: setAnswerValue(state.answers, id, value) })}
            renderAssist={renderAssist}
            onGoToQuestion={(id) => {
              setFocusQuestionId(undefined);
              window.setTimeout(() => setFocusQuestionId(id), 0);
              setCurrentStep('entrevista');
            }}
            onGoToCodeKit={() => setCurrentStep('codigo')}
            onOpenDossier={() => setCurrentStep('expediente')}
            onBackToInterview={() => setCurrentStep('entrevista')}
            onInspectNorm={(normId, article) => {
              setLiveNormTarget({ normId, article });
              setShowLiveLegislation(true);
            }}
            idioma={idioma}
          />
        )}

        {currentStep === 'codigo' && state.codeKit && (
          <CodeKitView
            codeKit={state.codeKit}
            onBackToDiagnostic={() => setCurrentStep('diagnostico')}
            onOpenDossier={() => setCurrentStep('expediente')}
            idioma={idioma}
          />
        )}

        {currentStep === 'expediente' && (
          <OfficialDossierView
            state={state}
            onUpdateMetadata={(newMeta) => setState((p) => ({ ...p, metadata: newMeta }))}
            onBackToCodeKit={() => setCurrentStep('codigo')}
            onGoToHardening={() => setCurrentStep('blindaje')}
            llmCritique={aiComment}
            idioma={idioma}
          />
        )}

        {currentStep === 'blindaje' && (
          <PreProductionHardeningView
            state={state}
            onBackToDossier={() => setCurrentStep('expediente')}
            idioma={idioma}
          />
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1.25rem',
        fontSize: '0.75rem',
        color: 'var(--brand-muted-light)',
        borderTop: '1px solid var(--color-border)',
        background: 'white',
      }}>
        <div style={{ marginBottom: '0.25rem', fontWeight: 600 }}>
          <a href="https://ariaslombardero.es/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-blue)', textDecoration: 'none' }}>
            Arias Lombardero · Aplicaciones
          </a>
          {' · '}
          <span>Auditor IA · Sector Público España</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>
          Marco Normativo: RIA (Reglamento UE 2024/1689, modificado por el Reglamento UE 2026/1744) · ENS (RD 311/2022) · RGPD · Ley 40/2015
        </div>
      </footer>

      <ApiConfigModal open={showApiModal} onOpenChange={setShowApiModal} idioma={idioma} />

      {showGuide && (
        <UserGuideModal
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
          idioma={idioma}
        />
      )}

      {showPurposeModal && (
        <ExecutivePurposeModal
          isOpen={showPurposeModal}
          onClose={() => setShowPurposeModal(false)}
          idioma={idioma}
        />
      )}

      {showLiveLegislation && (
        <LiveLegislationModal
          isOpen={showLiveLegislation}
          onClose={() => setShowLiveLegislation(false)}
          initialNormId={liveNormTarget.normId}
          initialArticle={liveNormTarget.article}
          idioma={idioma}
        />
      )}

      <AuditHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryCount(getStoredAudits().length);
        }}
        onLoadAudit={handleLoadAuditFromHistory}
        idioma={idioma}
      />
    </div>
  );
};

export default App;
