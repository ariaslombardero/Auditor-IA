import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  Scale,
  Terminal,
  FileText,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import type { AppIdioma } from '../types';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: AppIdioma;
}

export const DEVELOPER_AGENTS_MD_PROMPT = `Actúa como arquitecto de software y auditor de seguridad de inteligencia artificial.
Analiza íntegramente el código fuente y la arquitectura de este proyecto y genera un archivo AGENTS.md exhaustivo para su auditoría técnica previa en el Sector Público español, de conformidad con el AI Act (Reglamento UE 2024/1689), el Esquema Nacional de Seguridad (RD 311/2022) y el RGPD.

El archivo AGENTS.md debe documentar con el máximo detalle y rigor técnico los siguientes apartados:

1. DESCRIPCIÓN Y FINALIDAD DEL SISTEMA:
   - Nombre de la aplicación, propósito y naturaleza (asistencia instrumental, auxilio técnico o toma de decisiones).
   - Destinatarios del software (empleados públicos tramitadores, ciudadanía en general o uso interno).

2. ARQUITECTURA DE MODELOS E INFERENCIA (SOBERANÍA DEL DATO):
   - Modelos de lenguaje utilizados (versión exacta, familia y proveedor: Gemini, Llama, Mistral, OpenAI, etc.).
   - Modo de despliegue: ¿Inferencia local on-premise en servidor propio (Ollama, vLLM) o llamadas a nubes comerciales extranjeras?
   - Declaración expresa de si los datos y peticiones se utilizan o no para reentrenamiento del proveedor.

3. DIRECTIVAS DEL SISTEMA Y SYSTEM PROMPTS:
   - Texto íntegro y literal de las instrucciones del sistema (System Prompts) configuradas.
   - Restricciones éticas, barreras de salida y cláusulas de salvaguarda implementadas.

4. HERRAMIENTAS Y GRADO DE AUTONOMÍA (AGENCY):
   - Listado de funciones o herramientas (tools/functions) que el modelo puede invocar de forma autónoma.
   - ¿Puede el modelo modificar bases de datos, enviar correos, dictar resoluciones o firmar documentos sin validación humana previa? (Art. 14 AI Act y Art. 41 Ley 40/2015).

5. PRIVACIDAD Y CICLO DE VIDA DEL DATO (RGPD):
   - ¿El sistema procesa datos personales o de categorías especiales (salud, discapacidad, religión, sindical) del Art. 9 del RGPD?
   - Flujo de datos: dónde se reciben, cómo se transmiten y cuándo se purgan.

6. TRAZABILIDAD Y REGISTRO DE LOGS (CCN-STIC 884D / ENS RD 311/2022):
   - ¿Existe un registro de auditoría con fecha, hora, usuario e identificación de peticiones y respuestas mediante hash SHA-256?
   - Periodo de conservación previsto de los logs (mínimo 24 meses en sistemas medios/altos).

Estructura la salida en formato Markdown limpio y profesional listo para guardar como AGENTS.md en la raíz del repositorio.`;

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  idioma,
}) => {
  const [activeTab, setActiveTab] = useState<'normativa' | 'proceso' | 'agents_md' | 'autofirma'>('normativa');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const isGl = idioma === 'galego';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(DEVELOPER_AGENTS_MD_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(19, 36, 58, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '54rem',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--brand-paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <img
              src="/brand/logo-arias-lombardero-aplicaciones-para-fondo-claro.svg"
              alt="Arias Lombardero · Aplicaciones"
              style={{ height: '28px', width: 'auto' }}
            />
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '0.875rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-ink)', lineHeight: 1.2 }}>
                {isGl ? 'Guía de Usuario e Metodoloxía de Auditoría IA' : 'Guía de Usuario y Metodología de Auditoría IA'}
              </h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--brand-muted-light)' }}>
                {isGl ? 'Marco regulatorio, protocolo de verificación e gobernanza no Sector Público' : 'Marco regulatorio, protocolo de verificación y gobernanza en el Sector Público'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--brand-muted-light)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isGl ? 'Pechar' : 'Cerrar'}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            background: '#ffffff',
            padding: '0 1rem',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('normativa')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'normativa' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'normativa' ? 'var(--color-primary)' : 'var(--brand-muted-light)',
              fontWeight: activeTab === 'normativa' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Scale style={{ width: 14, height: 14 }} />
            <span>{isGl ? '1. Marco Legal e Normativa' : '1. Marco Legal y Normativa'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proceso')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'proceso' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'proceso' ? 'var(--color-primary)' : 'var(--brand-muted-light)',
              fontWeight: activeTab === 'proceso' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <ShieldCheck style={{ width: 14, height: 14 }} />
            <span>{isGl ? '2. Proceso en 6 Pasos' : '2. Proceso en 6 Pasos'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agents_md')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'agents_md' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'agents_md' ? 'var(--color-primary)' : 'var(--brand-muted-light)',
              fontWeight: activeTab === 'agents_md' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Terminal style={{ width: 14, height: 14 }} />
            <span>{isGl ? '3. O Arquivo AGENTS.md / CLAUDE.md' : '3. El Archivo AGENTS.md / CLAUDE.md'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('autofirma')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'autofirma' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'autofirma' ? 'var(--color-primary)' : 'var(--brand-muted-light)',
              fontWeight: activeTab === 'autofirma' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <KeyRound style={{ width: 14, height: 14 }} />
            <span>{isGl ? '4. Valor Xurídico e AutoFirma' : '4. Valor Jurídico y AutoFirma'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--brand-ink)' }}>
          {/* TAB 1: MARCO LEGAL */}
          {activeTab === 'normativa' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                {isGl ? 'Por que unha Administración Pública debe auditar a súa IA?' : '¿Por qué una Administración Pública debe auditar su IA?'}
              </h3>
              <p style={{ color: '#475569', marginBottom: '1rem' }}>
                {isGl
                  ? 'A integración da IA nas Administracións Públicas está estritamente regulada por normativas europeas e estatais. Poñer en marcha un software de IA sen a debida acreditación técnica e documental expón ao organismo a responsabilidades xurídicas e sancións.'
                  : 'La integración de la IA en las Administraciones Públicas está estrictamente regulada por normativas europeas y estatales. Poner en marcha un software de IA sin la debida acreditación técnica y documental expone al organismo a responsabilidades jurídicas y sanciones.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    🇪🇺 AI Act (Regulamento UE 2024/1689)
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Clasificación obrigatoria do nivel de risco (Inadmisible, Alto Risco do Anexo III, Risco de Transparencia Art. 50 ou Risco Mínimo). Prohibición de puntuación social e esixencia de supervisión humana efectiva.
                  </p>
                </div>

                <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    🛡️ Esquema Nacional de Seguridade (RD 311/2022)
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Categorías de seguridade (BÁSICA, MEDIA, ALTA) e directrices CCN-STIC 884D: trazabilidade con hash SHA-256, custodia de logs durante 24 meses e prohibición de expoñer claves de API en cliente.
                  </p>
                </div>

                <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    ⚖️ Lei 40/2015 e Lei 39/2015
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Distinción entre auxilio técnico instrumental e actuación administrativa automatizada (Art. 41). Os actos administrativos firmes requiren sempre intervención e firma do funcionario competente.
                  </p>
                </div>

                <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    🔒 RGPD e Avaliación de Impacto (EIPD)
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Art. 9 (categorías especiais de datos), Art. 22 (dereito a non sufrir decisións automatizadas) e Art. 35 (EIPD preceptiva ante novas tecnoloxías segundo a metodoloxía da AEPD).
                  </p>
                </div>
              </div>

              {/* Live Legislation Engine Notice */}
              <div
                style={{
                  padding: '0.875rem 1rem',
                  background: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <Scale style={{ width: 22, height: 22, color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.8125rem', marginBottom: '0.2rem' }}>
                    {isGl
                      ? '⚖️ Sincronización Telemática en Tempo Real (BOE e DOUE Cellar)'
                      : '⚖️ Sincronización Telemática en Tiempo Real (BOE y DOUE Cellar)'}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e293b' }}>
                    {isGl
                      ? 'A aplicación incorpora un servizo de consulta en vivo que enlaza directamente co repositorio oficial Cellar da Unión Europea (Diario Oficial da UE / CELEX 32024R1689 e 32016R0679) e co repositorio consolidado do Boletín Oficial del Estado (Legalize-ES / Lei 40/2015, ENS RD 311/2022). Pode acceder a calquera precepto pulsando o botón [ ⚖️ BOE/DOUE ] ou directamente desde os controis do diagnóstico.'
                      : 'La aplicación incorpora un servicio de consulta en vivo que enlaza directamente con el repositorio oficial Cellar de la Unión Europea (Diario Oficial de la UE / CELEX 32024R1689 y 32016R0679) y con el repositorio consolidado del Boletín Oficial del Estado (Legalize-ES / Ley 40/2015, ENS RD 311/2022). Puede acceder a cualquier precepto pulsando el botón [ ⚖️ BOE/DOUE ] o directamente desde los controles del diagnóstico.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROCESO EN 6 PASOS */}
          {activeTab === 'proceso' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                {isGl ? 'Como funciona a auditoría paso a paso?' : '¿Cómo funciona la auditoría paso a paso?'}
              </h3>
              <p style={{ color: '#475569', marginBottom: '1.25rem' }}>
                A ferramenta guía ao técnico ou xurista ao longo dun fluxo progresivo en 6 etapas que culmina nun expediente formal e probas activas de ciberseguridade:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.875rem' }}>Paso 1:</span>
                  <div>
                    <strong>Inxesta Técnica:</strong> Introdución do nome, descrición e o contido técnico da aplicación (o seu <code>README.md</code> e opcionalmente o seu <code>AGENTS.md</code>).
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.875rem' }}>Paso 2:</span>
                  <div>
                    <strong>Entrevista Xurídica:</strong> 5 preguntas clave sobre supervisión humana, natureza do acto, soberanía dos datos (CPD local vs. nube), tratamento de datos sensibles e logs.
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.875rem' }}>Paso 3:</span>
                  <div>
                    <strong>Diagnóstico e Semáforo de Risco:</strong> Clasificación instantánea baixo o AI Act, nivel ENS asignado, fundamentación legal e recomendacións correctoras.
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.875rem' }}>Paso 4:</span>
                  <div>
                    <strong>Kits de Código:</strong> Xeración do cartel visual obrigatorio (Art. 50 RIA) en React e HTML, módulo de rexistro criptográfico SHA-256 e cancela de validación humana.
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.875rem' }}>Paso 5:</span>
                  <div>
                    <strong>Expediente Word (.DOCX):</strong> Descarga do documento formal completo listo para ser rubricado polo Responsable do Servizo, o CISO e o DPD.
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: '0.875rem' }}>Paso 6:</span>
                  <div>
                    <strong>Laboratorio de Blindaxe Pre-Produción:</strong> Simulador de ataques adversarios (Red Teaming en vivo), xerador da EIPD oficial da AEPD, escáner Prompt-Guard, RAG normativo offline e preparación para AutoFirma.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AGENTS.MD / CLAUDE.MD */}
          {activeTab === 'agents_md' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Sparkles style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {isGl ? 'O Poder do arquivo AGENTS.md e CLAUDE.md' : 'El Poder del archivo AGENTS.md y CLAUDE.md'}
                </h3>
              </div>
              <p style={{ color: '#475569', marginBottom: '1rem' }}>
                {isGl
                  ? 'Un README.md explica como se usa a aplicación a nivel de usuario, pero o AGENTS.md (ou CLAUDE.md) explica como funciona a máquina por dentro: que permisos ten a IA, cales son os seus System Prompts reais e onde se envían os datos.'
                  : 'Un README.md explica cómo se usa la aplicación a nivel de usuario, pero el AGENTS.md (o CLAUDE.md) explica cómo funciona la máquina por dentro: qué permisos tiene la IA, cuáles son sus System Prompts reales y a dónde viajan los datos.'}
              </p>

              <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                  💡 {isGl ? 'Non tes este arquivo? Non pasa nada, non é obrigatorio!' : '¿No tienes este archivo? ¡No pasa nada, no es obligatorio!'}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#047857' }}>
                  {isGl
                    ? 'A aplicación funciona perfectamente cun README estándar. Porén, se queres acadar unha Auditoría Pericial ao 100% de fiabilidade, podes pedirlle á túa IA de programación (Cursor, Claude, ChatGPT, Windsurf) que che xere este arquivo en 30 segundos usando o seguinte prompt:'
                    : 'La aplicación funciona perfectamente con un README estándar. Sin embargo, si quieres alcanzar una Auditoría Pericial al 100% de fiabilidad, puedes pedirle a tu IA de programación (Cursor, Claude, ChatGPT, Windsurf) que te genere este archivo en 30 segundos usando el siguiente prompt:'}
                </p>
              </div>

              {/* Caja de Copiado del Prompt Asistente */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '0.625rem 1rem', background: '#f8fafc', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-ink)', textTransform: 'uppercase' }}>
                    Prompt para xerar o teu AGENTS.md
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', minHeight: 32 }}
                  >
                    {copiedPrompt ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    <span>{copiedPrompt ? (isGl ? 'Copiado ao portapapeis!' : '¡Copiado al portapapeles!') : (isGl ? 'Copiar Prompt' : 'Copiar Prompt')}</span>
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '1rem', fontSize: '0.75rem', background: '#1e293b', color: '#f1f5f9', whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
                  {DEVELOPER_AGENTS_MD_PROMPT}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: AUTOFIRMA */}
          {activeTab === 'autofirma' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                {isGl ? 'Validez Xurídica, Sede Electrónica e AutoFirma' : 'Validez Jurídica, Sede Electrónica y AutoFirma'}
              </h3>
              <p style={{ color: '#475569', marginBottom: '1rem' }}>
                {isGl
                  ? 'Un informe en Word ou Markdown carece de eficacia legal nun procedemento administrativo se non conta cun selado criptográfico inmutable e unha sinatura electrónica recoñecida.'
                  : 'Un informe en Word o Markdown carece de eficacia legal en un procedimiento administrativo si no cuenta con un sellado criptográfico inmutable y una firma electrónica reconocida.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <strong>1. Código Seguro de Verificación (CSV):</strong> O Paso 6 calcula a pegada SHA-256 e xera un CSV oficial conforme ao Art. 42 da Lei 40/2015.
                </div>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <strong>2. Asinatura en AutoFirma (@firma):</strong> Permite abrir o arquivo oficial dende a app oficial de escritorio do Ministerio e asinalo con DNIe ou Certificado FNMT de Empregado Público nos formatos regulamentarios <code>CAdES-BES</code> ou <code>PAdES-BES</code>.
                </div>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <strong>3. Dilixencia de Custodia:</strong> O arquivo asinado incorpórase ao Xestor de Expedientes da Sede Electrónica municipal ou autonómica como anexo técnico preceptivo para a posta en servizo.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div
          style={{
            padding: '0.875rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--brand-paper)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
            <strong>Arias Lombardero · Aplicaciones</strong> · Sistema de Gobernanza Pública
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem', minHeight: 36 }}
          >
            {isGl ? 'Entendido' : 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );
};
