import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Bot,
  Copy,
  Check,
  ShieldCheck,
  Info,
  FolderGit2,
  ExternalLink,
  Loader2,
  Wand2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Scale,
  Building,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Code2,
} from 'lucide-react';
import type { AppIngestData, AppIdioma } from '../types';
import { t } from '../lib/i18n';
import { DEVELOPER_AGENTS_MD_PROMPT } from './UserGuideModal';
import { scanGithubRepository, type GithubScanResult } from '../lib/githubIngestion';
import { generateAgentsMdWithLlm } from '../lib/auditEngine';
import { QuickAgentsWizardModal } from './QuickAgentsWizardModal';
import { useApiConfig } from '../context/ApiConfigContext';

interface IngestionViewProps {
  data: AppIngestData;
  onChange: (data: AppIngestData) => void;
  onProceed: () => void;
  onOpenPurpose?: () => void;
  idioma: AppIdioma;
}

export const IngestionView: React.FC<IngestionViewProps> = ({
  data,
  onChange,
  onProceed,
  onOpenPurpose,
  idioma,
}) => {
  const { config, isConfigured } = useApiConfig();
  const [entryRoute, setEntryRoute] = useState<'github' | 'wizard' | 'manual'>('github');
  const [activeDocTab, setActiveDocTab] = useState<'readme' | 'agents'>('readme');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Hero banner collapse state (persisted)
  const [showHeroBanner, setShowHeroBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem('auditor_ia_hide_hero') !== 'true';
    } catch {
      return true;
    }
  });

  const toggleHeroBanner = () => {
    const next = !showHeroBanner;
    setShowHeroBanner(next);
    try {
      localStorage.setItem('auditor_ia_hide_hero', next ? 'false' : 'true');
    } catch {}
  };

  // GitHub scanning state
  const [githubUrl, setGithubUrl] = useState('');
  const [isScanningGithub, setIsScanningGithub] = useState(false);
  const [githubScanError, setGithubScanError] = useState<string | null>(null);
  const [githubScanSuccess, setGithubScanSuccess] = useState<GithubScanResult | null>(null);

  // LLM agent generation state
  const [isGeneratingAgents, setIsGeneratingAgents] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileName = file.name.toLowerCase();

      if (fileName.includes('agent') || fileName.includes('claude')) {
        onChange({
          ...data,
          agentsMdContent: content,
          appName: data.appName || file.name.replace(/\.[^/.]+$/, ''),
        });
        setActiveDocTab('agents');
      } else {
        onChange({
          ...data,
          readmeContent: content,
          appName: data.appName || file.name.replace(/\.[^/.]+$/, ''),
        });
        setActiveDocTab('readme');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(DEVELOPER_AGENTS_MD_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleScanGithub = async () => {
    if (!githubUrl.trim()) return;
    setIsScanningGithub(true);
    setGithubScanError(null);
    setGithubScanSuccess(null);

    try {
      const result = await scanGithubRepository(githubUrl);
      setGithubScanSuccess(result);
      onChange({
        ...data,
        appName: data.appName || result.appName,
        appDescription: data.appDescription || result.appDescription,
        readmeContent: result.readmeContent,
        agentsMdContent: result.agentsMdContent || data.agentsMdContent || '',
        techStack: result.techStack,
        isAiSystem: result.isAiSystemDetected,
      });

      if (result.hasAgentsFile) {
        setActiveDocTab('agents');
      } else {
        setActiveDocTab('readme');
      }
    } catch (err: any) {
      setGithubScanError(err.message || 'Error al conectar con el repositorio de GitHub.');
    } finally {
      setIsScanningGithub(false);
    }
  };

  const handleGenerateAgentsLlm = async () => {
    if (!isConfigured || !config) {
      alert('Configura primero un proveedor de IA (Gemini, una API compatible con OpenAI o un modelo local) en la cabecera superior para usar la IA de Auditoría, o abre el Asistente Rápido de 4 Preguntas.');
      return;
    }
    if (!data.appName.trim() || !data.readmeContent.trim()) {
      alert('Indica al menos el nombre y el README de la aplicación para que la IA pueda auditar su arquitectura.');
      return;
    }

    setIsGeneratingAgents(true);
    try {
      const generatedMd = await generateAgentsMdWithLlm(config, data);
      onChange({
        ...data,
        agentsMdContent: generatedMd,
      });
      setActiveDocTab('agents');
    } catch (err: any) {
      alert(`Error al generar AGENTS.md con IA: ${err.message || err}`);
    } finally {
      setIsGeneratingAgents(false);
    }
  };

  const loadExample = (exampleKey: 'opositor' | 'prensa' | 'rrhh') => {
    if (exampleKey === 'opositor') {
      onChange({
        appName: 'Opositor Transparente (Creador de Temas)',
        appDescription: 'Generador y verificador documental de temas, baterías de test y supuestos prácticos para opositores de las Administraciones Públicas españolas.',
        readmeContent: `# Opositor Transparente
Aplicación de apoyo al opositor y formador público.
Genera temas oficiales ajustados al índice de la convocatoria, baterías de preguntas tipo test (formatos DOCX, Moodle GIFT, Aiken) y supuestos prácticos con resolución estructurada en 5 fases.
Incorpora verificación de citas normativas en el BOE y DOG.
Stack técnico: React, TypeScript, Vite, docx, Google Gemini / Ollama Local.
Los borradores requieren siempre la lectura crítica y validación humana del aspirante o formador.`,
        agentsMdContent: `# AGENTS.MD - Arquitectura y Directivas de Inferencia de Opositor Transparente

## 1. Naturaleza y Propósito
Herramienta de apoyo técnico: un empleado público interviene de forma directa en cada actuación, por lo que no se pretende una actuación administrativa automatizada (Art. 41 Ley 40/2015).
Prohibición taxativa de actos administrativos automatizados o calificación autónoma de opositores.

## 2. Inferencia y Soberanía del Dato
- Motor primario: Inferencia Local On-Premise con Ollama (Llama 3.3 70B / Mistral Small 24B).
- Motor de contingencia: Google Gemini API (Modo Zero Data Retention / enterprise).
- Sin almacenamiento de consultas para reentrenamiento de modelos comerciales de terceros.

## 3. Directivas del Sistema (System Prompts)
- Rigor normativo imperativo con cita verificada en el BOE y diarios autonómicos.
- Prohibición de emitir juicios de valor sobre aspirantes o baremaciones automáticas.
- Inserción obligatoria del banner de advertencia Art. 50 AI Act en todos los borradores exportados.

## 4. Trazabilidad y Logs
- Logs estructurados con sellado hash SHA-256 de peticiones y respuestas.
- Registro de la actividad conforme al ENS (RD 311/2022, [op.exp.8]), con el periodo de conservación fijado en la documentación de seguridad.`,
        techStack: 'React 19, TypeScript, Vite, docx, Ollama Local / Gemini API',
        targetAudience: 'public_employees',
      });
    } else if (exampleKey === 'prensa') {
      onChange({
        appName: 'Redactor Municipal de Notas de Prensa',
        appDescription: 'Asistente técnico para la redacción de comunicados de prensa y resúmenes de acuerdos de Junta de Gobierno local.',
        readmeContent: `# Redactor Municipal IA
Herramienta interna del Gabinete de Comunicación del Ayuntamiento.
Toma los acuerdos del orden del día y genera borradores de notas de prensa oficiales.
El jefe de prensa revisa, rectifica y autoriza la publicación en la web institucional.
Stack: Next.js, Node.js, API Mistral en servidor de la Diputación Provincial.`,
        agentsMdContent: '',
        techStack: 'Next.js, Mistral 7B On-Premise',
        targetAudience: 'internal_only',
      });
    } else if (exampleKey === 'rrhh') {
      onChange({
        appName: 'Baremador Automático de Candidatos OEP',
        appDescription: 'Sistema de filtrado y puntuación automática de currículums y méritos en procesos selectivos de empleo público.',
        readmeContent: `# Baremador Automático RRHH
Software que analiza los certificados de méritos aportados por los aspirantes a una convocatoria de empleo público.
Calcula la puntuación provisional y genera el orden de prelación de admitidos y excluidos.
Decisión inicial automática sujeta a reclamación posterior.
Stack: Python, FastAPI, OpenAI GPT-4o.`,
        agentsMdContent: '',
        techStack: 'Python FastAPI, OpenAI API',
        targetAudience: 'public_citizens',
      });
    }
  };

  const isReady = Boolean(data.appName.trim() && data.readmeContent.trim());
  const hasAgentsMd = Boolean(data.agentsMdContent && data.agentsMdContent.trim().length > 0);

  const renderDocTabs = () => (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.75rem', background: 'white' }}>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <button
          type="button"
          onClick={() => setActiveDocTab('readme')}
          style={{
            padding: '0.5rem 0.875rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: activeDocTab === 'readme' ? 'var(--brand-blue)' : '#f1f5f9',
            color: activeDocTab === 'readme' ? 'white' : 'var(--brand-ink)',
          }}
        >
          <FileText style={{ width: 14, height: 14 }} />
          <span>1. README.md (Funcional y Arquitectura) *</span>
          {data.readmeContent.trim() && (
            <span style={{ fontSize: '0.6875rem', background: activeDocTab === 'readme' ? 'rgba(255,255,255,0.25)' : '#dcfce7', color: activeDocTab === 'readme' ? 'white' : '#15803d', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>✓</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveDocTab('agents')}
          style={{
            padding: '0.5rem 0.875rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: activeDocTab === 'agents' ? 'var(--brand-blue)' : '#f1f5f9',
            color: activeDocTab === 'agents' ? 'white' : 'var(--brand-ink)',
          }}
        >
          <Bot style={{ width: 14, height: 14 }} />
          <span>2. AGENTS.md / CLAUDE.md (directivas del modelo)</span>
          {data.agentsMdContent?.trim() && (
            <span style={{ fontSize: '0.6875rem', background: activeDocTab === 'agents' ? 'rgba(255,255,255,0.25)' : '#dcfce7', color: activeDocTab === 'agents' ? 'white' : '#15803d', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>✓</span>
          )}
        </button>
      </div>

      {/* Tab 1: README.md */}
      {activeDocTab === 'readme' && (
        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ margin: 0, fontWeight: 600 }}>Contenido del README.md *</label>
            <label style={{ margin: 0, cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
              <Upload style={{ width: 13, height: 13 }} />
              <span>Subir archivo (.md / .txt)</span>
              <input
                type="file"
                accept=".md,.txt,.json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <textarea
            rows={8}
            placeholder="# Descripción técnica y arquitectura...&#10;Pega aquí el contenido de tu README.md o la especificación técnica general de la aplicación."
            value={data.readmeContent}
            onChange={(e) => onChange({ ...data, readmeContent: e.target.value })}
          />
        </div>
      )}

      {/* Tab 2: AGENTS.md */}
      {activeDocTab === 'agents' && (
        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <label style={{ margin: 0, fontWeight: 600 }}>Contenido de AGENTS.md o CLAUDE.md (directivas del modelo)</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)', display: 'block' }}>
                Documenta los system prompts, grado de autonomía de las herramientas y modo de inferencia.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleGenerateAgentsLlm}
                disabled={isGeneratingAgents}
                className="btn-primary"
                style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.65rem',
                  background: '#7c3aed',
                  borderColor: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isGeneratingAgents ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} />
                    <span>Generando AGENTS.md con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: 12, height: 12 }} />
                    <span>Generar AGENTS.md con IA</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedPrompt ? <Check style={{ width: 12, height: 12, color: '#16a34a' }} /> : <Copy style={{ width: 12, height: 12 }} />}
                <span>{copiedPrompt ? 'Copiado' : 'Copiar Prompt AGENTS.md'}</span>
              </button>
            </div>
          </div>
          {!data.agentsMdContent?.trim() && (
            <div style={{
              margin: '0.5rem 0',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              background: '#faf5ff',
              border: '1px dashed #d8b4fe',
              fontSize: '0.75rem',
              color: '#581c87',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <span>💡 <strong>¿No dispones de AGENTS.md?</strong> Pulsa el botón "Generar AGENTS.md con IA" para redactarlo automáticamente a partir de tu README y arquitectura.</span>
            </div>
          )}
          <textarea
            rows={8}
            placeholder="# AGENTS.MD - Directivas del Agente&#10;Pega aquí el contenido de AGENTS.md o CLAUDE.md (system prompts, herramientas autónomas, políticas de retención de datos)..."
            value={data.agentsMdContent || ''}
            onChange={(e) => onChange({ ...data, agentsMdContent: e.target.value })}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. HERO BANNER PEDAGÓGICO: ¿Por qué es obligatoria esta auditoría? */}
      {showHeroBanner ? (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          border: '1px solid #334155',
          position: 'relative',
        }}>
          {/* Header del Banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
              }}>
                <Scale style={{ width: 22, height: 22 }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.01em' }}>
                  Marco de Conformidad Obligatorio para Sistemas de IA
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
                  ¿Vas a implantar un chatbot, asistente o automatización en tu organismo? Antes de ponerlo en servicio debes acreditar que cumple 4 normativas vinculantes.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {onOpenPurpose && (
                <button
                  type="button"
                  onClick={onOpenPurpose}
                  style={{
                    background: '#0284c7',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <HelpCircle style={{ width: 14, height: 14 }} />
                  <span>Guía Directiva Completa</span>
                </button>
              )}
              <button
                type="button"
                onClick={toggleHeroBanner}
                title="Ocultar introducción"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#94a3b8',
                  padding: '0.35rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ChevronUp style={{ width: 14, height: 14 }} />
                <span>Ocultar</span>
              </button>
            </div>
          </div>

          {/* 4 Pilares Visuales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem', marginBottom: '2px' }}>
                <Scale style={{ width: 13, height: 13 }} />
                <span>1. AI Act (UE 2024/1689)</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Supervisión humana previa (Art. 14) y deber de información activa (Art. 50).
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontWeight: 700, fontSize: '0.75rem', marginBottom: '2px' }}>
                <ShieldCheck style={{ width: 13, height: 13 }} />
                <span>2. RGPD y LOPDGDD</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Prohíbe actos con efectos jurídicos basados únicamente en algoritmos (Art. 22).
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb923c', fontWeight: 700, fontSize: '0.75rem', marginBottom: '2px' }}>
                <Building style={{ width: 13, height: 13 }} />
                <span>3. Ley 40/2015 (Art. 41)</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Acredita que es auxilio técnico instrumental y no acto administrativo automatizado.
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontWeight: 700, fontSize: '0.75rem', marginBottom: '2px' }}>
                <Lock style={{ width: 13, height: 13 }} />
                <span>4. ENS (RD 311/2022)</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Custodia estricta de API keys, trazabilidad de logs y soberanía del dato.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.625rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--brand-ink)' }}>
            <Scale style={{ width: 16, height: 16, color: '#0284c7' }} />
            <span><strong>Marco Legal:</strong> Esta auditoría genera un informe técnico preliminar y propuestas de adaptación, que deben revisar los responsables.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onOpenPurpose && (
              <button
                type="button"
                onClick={onOpenPurpose}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                ¿Por qué auditar?
              </button>
            )}
            <button
              type="button"
              onClick={toggleHeroBanner}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ChevronDown style={{ width: 13, height: 13 }} />
              <span>Mostrar guía</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. SELECTOR DE RUTA DE ENTRADA (PROGRESSIVE DISCLOSURE) */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '1.25rem',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 800, color: 'var(--brand-ink)' }}>
            Paso 1: ¿Cómo deseas aportar la información del software?
          </h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--brand-muted-light)' }}>
            Elige el método más cómodo según si ya tienes código publicado en GitHub, solo tienes una idea/asistente o dispones de documentación manual.
          </p>
        </div>

        {/* 3 Route Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          {/* Ruta A: GitHub */}
          <button
            type="button"
            onClick={() => setEntryRoute('github')}
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: entryRoute === 'github' ? '2px solid var(--brand-blue)' : '1px solid var(--color-border)',
              background: entryRoute === 'github' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.875rem', color: entryRoute === 'github' ? 'var(--brand-blue)' : 'var(--brand-ink)' }}>
                <FolderGit2 style={{ width: 16, height: 16 }} />
                <span>Ruta 1: Repositorio GitHub</span>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '999px' }}>
                Recomendada
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
              Pega la URL de tu repositorio público y la app extrae el README, el código y los agentes en 1 clic.
            </div>
          </button>

          {/* Ruta B: Asistente 4 Preguntas */}
          <button
            type="button"
            onClick={() => setEntryRoute('wizard')}
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: entryRoute === 'wizard' ? '2px solid #7c3aed' : '1px solid var(--color-border)',
              background: entryRoute === 'wizard' ? '#faf5ff' : '#f8fafc',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.875rem', color: entryRoute === 'wizard' ? '#7c3aed' : 'var(--brand-ink)' }}>
                <Wand2 style={{ width: 16, height: 16 }} />
                <span>Ruta 2: Sin Código (Asistente)</span>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '999px' }}>
                Para Directivos
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
              ¿No tienes código ni GitHub? Responde 4 preguntas guiadas sobre tu asistente y la IA hace el resto.
            </div>
          </button>

          {/* Ruta C: Carga Manual / Plantillas */}
          <button
            type="button"
            onClick={() => setEntryRoute('manual')}
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: entryRoute === 'manual' ? '2px solid #059669' : '1px solid var(--color-border)',
              background: entryRoute === 'manual' ? '#f0fdf4' : '#f8fafc',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.875rem', color: entryRoute === 'manual' ? '#059669' : 'var(--brand-ink)' }}>
                <FileText style={{ width: 16, height: 16 }} />
                <span>Ruta 3: Carga Manual / Plantillas</span>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#d1fae5', color: '#047857', padding: '1px 6px', borderRadius: '999px' }}>
                Avanzado
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
              Sube tus archivos markdown, pega textos directamente o carga una plantilla preconfigurada de prueba.
            </div>
          </button>
        </div>

        {/* 3. CONTENIDO SEGÚN LA RUTA SELECCIONADA */}

        {/* CONTENIDO RUTA A: GITHUB */}
        {entryRoute === 'github' && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-ink)', marginBottom: '0.375rem' }}>
              URL del Repositorio de GitHub a Auditar
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="https://github.com/usuario/nombre-del-repositorio (ej. ariaslombardero/Analizador-de-ayudas-y-subvenciones)"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScanGithub()}
                style={{ flex: 1, minWidth: '260px' }}
              />
              <button
                type="button"
                onClick={handleScanGithub}
                disabled={isScanningGithub || !githubUrl.trim()}
                className="btn-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontWeight: 600,
                }}
              >
                {isScanningGithub ? (
                  <>
                    <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                    <span>Escaneando...</span>
                  </>
                ) : (
                  <>
                    <FolderGit2 style={{ width: 15, height: 15 }} />
                    <span>Escanear Repositorio</span>
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {githubScanError && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>{githubScanError}</span>
              </div>
            )}

            {/* Success */}
            {githubScanSuccess && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#15803d', fontWeight: 700 }}>
                      <CheckCircle2 style={{ width: 16, height: 16 }} />
                      <span>Repositorio escaneado con éxito: {githubScanSuccess.appName}</span>
                    </div>
                    <a
                      href={githubScanSuccess.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                    >
                      <span>Ver en GitHub</span>
                      <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                  </div>

                  <div style={{ color: '#166534', lineHeight: 1.5 }}>
                    <div><strong>Pila detectada:</strong> {githubScanSuccess.techStack}</div>

                    {/* Detección Inteligente de IA vs Software Determinista */}
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: githubScanSuccess.isAiSystemDetected ? '#f0fdf4' : '#eff6ff',
                      border: `1px solid ${githubScanSuccess.isAiSystemDetected ? '#a7f3d0' : '#bfdbfe'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}>
                      <div>
                        {githubScanSuccess.isAiSystemDetected ? (
                          <span style={{ color: '#065f46', fontWeight: 600 }}>
                            🤖 <strong>Componentes de IA detectados:</strong> {githubScanSuccess.detectedAiSdk.length > 0 ? githubScanSuccess.detectedAiSdk.join(', ') : 'Modelos de lenguaje en README/código'}
                          </span>
                        ) : (
                          <span style={{ color: '#1e40af', fontWeight: 600 }}>
                            ⚙️ <strong>Software Determinista Tradicional:</strong> No se detectaron librerías de IA en las dependencias. Excluido del AI Act (Art. 3.1 RIA).
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          type="button"
                          onClick={() => onChange({ ...data, isAiSystem: false })}
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #93c5fd',
                            cursor: 'pointer',
                            background: data.isAiSystem === false ? '#1e40af' : 'white',
                            color: data.isAiSystem === false ? 'white' : '#1e40af',
                            fontWeight: data.isAiSystem === false ? 700 : 500,
                          }}
                        >
                          Software Sin IA (Art. 3.1)
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange({ ...data, isAiSystem: true })}
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd6fe',
                            cursor: 'pointer',
                            background: data.isAiSystem !== false ? '#6d28d9' : 'white',
                            color: data.isAiSystem !== false ? 'white' : '#6d28d9',
                            fontWeight: data.isAiSystem !== false ? 700 : 500,
                          }}
                        >
                          Utiliza IA / LLMs
                        </button>
                      </div>
                    </div>

                    {/* Detección de AGENTS.md */}
                    {githubScanSuccess.hasAgentsFile ? (
                      <div style={{ marginTop: '0.375rem', fontWeight: 600, color: '#15803d' }}>
                        🎉 ¡Archivo de directivas (AGENTS.md / CLAUDE.md) detectado e importado! La auditoría podrá examinar las directivas del modelo.
                      </div>
                    ) : (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: '#faf5ff',
                        border: '1px dashed #d8b4fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}>
                        <div>
                          <strong style={{ color: '#6d28d9' }}>⚠️ No se detectó <code>AGENTS.md</code> en el repositorio.</strong>
                          <div style={{ fontSize: '0.6875rem', color: '#581c87' }}>
                            Para examinar también las directivas del modelo y sus salvaguardas, puedes generarlo con IA a partir del código:
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={handleGenerateAgentsLlm}
                            disabled={isGeneratingAgents}
                            className="btn-primary"
                            style={{
                              fontSize: '0.6875rem',
                              padding: '0.3rem 0.6rem',
                              background: '#7c3aed',
                              borderColor: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isGeneratingAgents ? (
                              <>
                                <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} />
                                <span>Generando con IA...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles style={{ width: 12, height: 12 }} />
                                <span>Generar AGENTS.md con IA</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyPrompt}
                            className="btn-secondary"
                            style={{ fontSize: '0.6875rem', padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            {copiedPrompt ? <Check style={{ width: 11, height: 11, color: '#16a34a' }} /> : <Copy style={{ width: 11, height: 11 }} />}
                            <span>{copiedPrompt ? 'Copiado' : 'Copiar Prompt'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowWizardModal(true)}
                            className="btn-secondary"
                            style={{
                              fontSize: '0.6875rem',
                              padding: '0.3rem 0.5rem',
                              background: 'white',
                              color: '#6d28d9',
                              borderColor: '#ddd6fe',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Sliders style={{ width: 11, height: 11 }} />
                            <span>Asistente 4 Preguntas</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visor y Editor en vivo de Documentación importada de GitHub */}
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-ink)', marginBottom: '0.25rem' }}>
                    Documentación Técnica del Repositorio (Revisa y Edita el Contenido Extraído):
                  </div>
                  {renderDocTabs()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO RUTA B: ASISTENTE SIN CÓDIGO */}
        {entryRoute === 'wizard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              border: '1.5px solid #d8b4fe',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div style={{ maxWidth: '36rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9', fontWeight: 800, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  <Sparkles style={{ width: 18, height: 18 }} />
                  <span>Asistente Rápido de 4 Preguntas (Sin necesidad de código)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#581c87', lineHeight: 1.5 }}>
                  Pensado para directivos, letrados y jefes de servicio. Responde a 4 cuestiones sobre qué hace tu asistente, qué datos procesa y cómo se supervisa. La herramienta redactará automáticamente el <code>README.md</code> y el <code>AGENTS.md</code> de gobernanza.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowWizardModal(true)}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  borderColor: '#7c3aed',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sliders style={{ width: 16, height: 16 }} />
                <span>Abrir Asistente (4 Preguntas)</span>
              </button>
            </div>

            {/* Documentos generados tras usar el asistente */}
            {data.readmeContent.trim() && (
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-ink)', marginBottom: '0.25rem' }}>
                  Documentación Generada por el Asistente:
                </div>
                {renderDocTabs()}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO RUTA C: MANUAL / AVANZADO */}
        {entryRoute === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Quick Templates Bar */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles style={{ width: 13, height: 13, color: 'var(--brand-blue)' }} /> Cargar plantilla de simulación:
              </span>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => loadExample('opositor')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  {t('load_example_opositor', idioma)}
                </button>
                <button
                  type="button"
                  onClick={() => loadExample('prensa')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  {t('load_example_press', idioma)}
                </button>
                <button
                  type="button"
                  onClick={() => loadExample('rrhh')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#dc2626' }}
                >
                  {t('load_example_rrhh', idioma)}
                </button>
              </div>
            </div>

            {/* Documentation Tabs (README vs AGENTS) */}
            {renderDocTabs()}
          </div>
        )}
      </div>

      {/* 4. DATOS BASE DE LA APLICACIÓN (AUTORRELLENADOS Y EDITABLES) */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-ink)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText style={{ width: 18, height: 18, color: 'var(--brand-blue)' }} />
          Ficha Identificativa del Software a Auditar
        </h3>

        <div className="form-group">
          <label>Nombre de la Aplicación o Sistema de IA *</label>
          <input
            type="text"
            placeholder="Ej: Opositor Transparente / Asistente Documental de Subvenciones"
            value={data.appName}
            onChange={(e) => onChange({ ...data, appName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Descripción y Finalidad Declarada *</label>
          <input
            type="text"
            placeholder="Ej: Generación y verificación de borradores normativos para apoyo técnico a la tramitación"
            value={data.appDescription}
            onChange={(e) => onChange({ ...data, appDescription: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Destinatarios Principales del Sistema</label>
            <select
              value={data.targetAudience}
              onChange={(e) => onChange({ ...data, targetAudience: e.target.value as any })}
            >
              <option value="public_employees">Empleados Públicos / Funcionarios tramitadores</option>
              <option value="public_citizens">Ciudadanos / Administrados (Interacción directa)</option>
              <option value="mixed">Mixto (Ciudadanos y Empleados)</option>
              <option value="internal_only">Uso Exclusivo Interno de TI / Desarrolladores</option>
            </select>
          </div>

          <div className="form-group">
            <label>Pila Tecnológica Detectada / Declarada</label>
            <input
              type="text"
              placeholder="Ej: React 19, TypeScript, Ollama / Gemini API"
              value={data.techStack || ''}
              onChange={(e) => onChange({ ...data, techStack: e.target.value })}
            />
          </div>
        </div>

        {/* Selector de Naturaleza del Software: IA vs Determinista */}
        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <label style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Naturaleza Tecnológica y Ámbito de Aplicación (AI Act Art. 3.1)</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => onChange({ ...data, isAiSystem: true })}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: data.isAiSystem !== false ? 700 : 500,
                border: data.isAiSystem !== false ? '1.5px solid #7c3aed' : '1px solid var(--color-border)',
                background: data.isAiSystem !== false ? '#f5f3ff' : 'white',
                color: data.isAiSystem !== false ? '#6d28d9' : 'var(--brand-ink)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🤖 Sistema de Inteligencia Artificial (LLMs / Modelos de Lenguaje / ML)</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, isAiSystem: false })}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: data.isAiSystem === false ? 700 : 500,
                border: data.isAiSystem === false ? '1.5px solid #1e40af' : '1px solid var(--color-border)',
                background: data.isAiSystem === false ? '#eff6ff' : 'white',
                color: data.isAiSystem === false ? '#1e40af' : 'var(--brand-ink)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⚙️ Software Determinista Tradicional (Cálculos de plazos, formularios, CRUD sin IA)</span>
            </button>
          </div>
          {data.isAiSystem === false && (
            <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#1e40af', background: '#eff6ff', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
              ℹ️ <strong>Régimen Jurídico:</strong> Conforme al Artículo 3(1) del RIA, los sistemas basados únicamente en reglas algorítmicas sin aprendizaje automático están <strong>excluidos del AI Act</strong>. El informe auditará la exactitud algorítmica, Ley 40/2015 (Art. 41 para actuaciones automatizadas) y el ENS (RD 311/2022).
            </p>
          )}
        </div>

        {/* Coverage Badge */}
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: hasAgentsMd ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${hasAgentsMd ? '#bbf7d0' : 'var(--color-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div>
            <strong style={{ fontSize: '0.8125rem', color: hasAgentsMd ? '#15803d' : '#334155' }}>
              {hasAgentsMd
                ? '🛡️ Documentación completa (README funcional + AGENTS.md de gobernanza)'
                : '📄 Nivel Documental Estándar (README.md Funcional)'}
            </strong>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
              {hasAgentsMd
                ? 'El expediente auditará tanto la operativa funcional como los system prompts y la soberanía de inferencia.'
                : 'Se auditará la funcionalidad del sistema. Para examinar también los prompts, añade un AGENTS.md.'}
            </p>
          </div>
        </div>

        {/* Bottom Proceed Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            disabled={!isReady}
            onClick={onProceed}
            className="btn-primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem', fontWeight: 700 }}
          >
            <span>Continuar a la Entrevista Jurídica (Paso 2)</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Quick Agents Wizard Modal */}
      {showWizardModal && (
        <QuickAgentsWizardModal
          isOpen={showWizardModal}
          onClose={() => setShowWizardModal(false)}
          appName={data.appName}
          techStack={data.techStack || ''}
          onApply={(generatedMd) => {
            onChange({
              ...data,
              agentsMdContent: generatedMd,
              appName: data.appName || 'Asistente IA Sector Público',
              readmeContent: data.readmeContent || `# ${data.appName || 'Asistente IA'}\nHerramienta de asistencia técnica y apoyo a la gestión administrativa.`,
            });
            setShowWizardModal(false);
          }}
          idioma={idioma}
        />
      )}
    </div>
  );
};
