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
import { evaluateRulesDeterministically, analyzeWithLLM } from './lib/auditEngine';
import { generateCodeKit } from './lib/codeKitGenerator';
import { getStoredAudits, saveAuditRecord } from './lib/auditHistoryService';
import type {
  AppIdioma,
  FullAuditState,
  AppIngestData,
  LegalEnrichmentAnswers,
  OfficialDossierMetadata,
  StoredAuditRecord,
} from './types';
import { t } from './lib/i18n';

type Step = 'ingesta' | 'entrevista' | 'diagnostico' | 'codigo' | 'expediente' | 'blindaje';

const DEFAULT_INGEST: AppIngestData = {
  appName: '',
  appDescription: '',
  readmeContent: '',
  techStack: '',
  targetAudience: 'public_employees',
};

const DEFAULT_ANSWERS: LegalEnrichmentAnswers = {
  humanOversightLevel: 'pre_execution',
  supervisionRole: 'Funcionario tramitador / Órgano competente',
  administrativeNature: 'technical_auxiliary',
  publicCompetenceNorm: 'Ley 39/2015 del Procedimiento Administrativo Común',
  hostingModel: 'local_on_premise',
  processesSpecialCategoryData: false,
  ratActivityName: 'Apoyo a la Gestión y Elaboración Documental Administrativa',
  auditLogsEnabled: true,
  logRetentionMonths: 24,
  deterministicConfig: true,
  evaluatedSubjectType: 'normative_or_unpersonalized_docs',
  performsProfilingOrScoring: false,
  interactionAndGenerationType: 'chatbot_or_generative',
};

const DEFAULT_METADATA: OfficialDossierMetadata = {
  entityName: 'Administración Pública Promotora',
  serviceDepartment: 'Área de Régimen Jurídico y Transformación Digital',
  functionalResponsible: 'Jefatura de Servicio Responsable',
  technicalResponsible: 'Dirección de Tecnologías de la Información',
  cisoContact: 'Responsable de Seguridad ENS (CISO)',
  dpoContact: 'Delegado de Protección de Datos (DPD / DPO)',
  auditDate: new Date().toLocaleDateString('es-ES'),
};

export const App: React.FC = () => {
  const [idioma, setIdioma] = useState<AppIdioma>('castellano');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showLiveLegislation, setShowLiveLegislation] = useState(false);
  const [liveNormTarget, setLiveNormTarget] = useState<{ normId: string; article: string }>({ normId: 'AI-ACT', article: '14' });
  const [currentStep, setCurrentStep] = useState<Step>('ingesta');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmCritique, setLlmCritique] = useState<string | undefined>(undefined);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

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
      setCurrentStep('ingesta');
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);

    // 1. Instant deterministic evaluation
    const baselineDiagnostic = evaluateRulesDeterministically(state.ingest, state.answers);
    const codeKit = generateCodeKit(state.ingest, state.answers, baselineDiagnostic);

    let critiqueText: string | undefined = undefined;

    // 2. AI enrichment if configured
    if (isConfigured && config) {
      try {
        const llmResult = await analyzeWithLLM(config, state.ingest, state.answers, baselineDiagnostic);
        critiqueText = llmResult.enrichedSummary;
      } catch (err: any) {
        console.warn('Fallo en análisis opcional de IA:', err?.message || err);
      }
    }

    const updatedFullState: FullAuditState = {
      ...state,
      diagnostic: baselineDiagnostic,
      codeKit,
    };

    setLlmCritique(critiqueText);
    setState(updatedFullState);

    // 3. Auto-guardar en historial persistente de auditorías
    try {
      saveAuditRecord(updatedFullState, critiqueText);
      setHistoryCount(getStoredAudits().length);
    } catch (saveErr) {
      console.warn('No se pudo auto-guardar en el historial local:', saveErr);
    }

    setIsAnalyzing(false);
    setCurrentStep('diagnostico');
  };

  const handleLoadAuditFromHistory = (record: StoredAuditRecord) => {
    setState(record.state);
    setLlmCritique(record.llmCritique);
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
            onChange={(newIngest) => setState((p) => ({ ...p, ingest: newIngest }))}
            onProceed={() => setCurrentStep('entrevista')}
            onOpenPurpose={() => setShowPurposeModal(true)}
            idioma={idioma}
          />
        )}

        {currentStep === 'entrevista' && (
          <LegalInterviewView
            answers={state.answers}
            onChange={(newAnswers) => setState((p) => ({ ...p, answers: newAnswers }))}
            onBack={() => setCurrentStep('ingesta')}
            onAnalyze={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
            idioma={idioma}
          />
        )}

        {currentStep === 'diagnostico' && state.diagnostic && (
          <DiagnosticDashboard
            diagnostic={state.diagnostic}
            appName={state.ingest.appName}
            llmCritique={llmCritique}
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
            llmCritique={llmCritique}
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
          Marco Normativo: AI Act (Reglamento UE 2024/1689) · Ómnibus Digital (UE 2026/1744) · ENS (RD 311/2022) · RGPD y CCN-STIC 884D
        </div>
      </footer>

      {showApiModal && (
        <ApiConfigModal
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
          idioma={idioma}
        />
      )}

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
