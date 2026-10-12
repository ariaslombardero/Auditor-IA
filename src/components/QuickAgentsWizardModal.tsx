import React, { useState } from 'react';
import {
  X,
  Bot,
  ShieldCheck,
  Check,
  Server,
  Zap,
  Lock,
  FileCheck,
  Scale,
  Sparkles,
} from 'lucide-react';
import type { AppIdioma } from '../types';

interface QuickAgentsWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  techStack: string;
  onApply: (generatedMarkdown: string) => void;
  idioma: AppIdioma;
}

export const QuickAgentsWizardModal: React.FC<QuickAgentsWizardModalProps> = ({
  isOpen,
  onClose,
  appName,
  techStack,
  onApply,
  idioma,
}) => {
  const [hostingModel, setHostingModel] = useState<'local' | 'eu' | 'commercial'>('local');
  const [modelName, setModelName] = useState('Modelo local en servidores propios (por ejemplo, Gemma, Llama o Mistral con Ollama o vLLM)');
  const [agencyLevel, setAgencyLevel] = useState<'strictly_assisted' | 'human_confirmed_tools' | 'semi_autonomous'>('strictly_assisted');
  const [requireOfficialCitation, setRequireOfficialCitation] = useState(true);
  const [forbidAutomatedActs, setForbidAutomatedActs] = useState(true);
  const [requireTransparencyBanner, setRequireTransparencyBanner] = useState(true);
  const [logRetentionMonths, setLogRetentionMonths] = useState(24);
  const [zeroDataRetention, setZeroDataRetention] = useState(true);
  const [promptGuard, setPromptGuard] = useState(true);

  if (!isOpen) return null;

  const resolvedAppName = appName.trim() || 'Sistema de Inteligencia Artificial';

  const generateMarkdown = (): string => {
    const hostingDesc =
      hostingModel === 'local'
        ? `Inferencia Local On-Premise en infraestructura propia (Ollama / vLLM). Soberanía técnica total sin salida a internet ni exposición de datos a proveedores externos.`
        : hostingModel === 'eu'
        ? `Inferencia en Nube Europea sujeta a Acuerdo de Encargo de Tratamiento (DPA) con centros de datos dentro del Espacio Económico Europeo.`
        : `Llamadas a API comercial de proveedor internacional (${modelName}) con política estricta de no retención de datos.`;

    const agencyDesc =
      agencyLevel === 'strictly_assisted'
        ? `- Nivel de autonomía: NULO (Asistencia estrictamente pasiva / generativa).
- Herramientas con efectos secundarios: Ninguna. El modelo no puede modificar bases de datos, enviar correos ni alterar registros sin intervención del usuario.
- Salvaguarda Art. 14 RIA: Cada salida constituye un borrador sujeto a validación humana preceptiva antes de cualquier efecto oficial.`
        : agencyLevel === 'human_confirmed_tools'
        ? `- Nivel de autonomía: INSTRUMENTAL ASISTIDO.
- Invocación de herramientas: Permitida exclusivamente para consulta o lectura documental.
- Salvaguarda Art. 14 RIA: Cualquier acción que modifique el estado del expediente o envíe comunicaciones externas exige un diálogo de confirmación humana previa (Human-in-the-Loop).`
        : `- Nivel de autonomía: SUPERVISADO POSTERIOR.
- El modelo realiza tareas programadas con registro de auditoría continuo y monitorización por parte del funcionario instructor.`;

    return `# AGENTS.MD - Manifiesto Técnico y Directivas del Agente (${resolvedAppName})

## 1. Naturaleza Jurídica y Delimitación Funcional
- **Nombre del Sistema:** ${resolvedAppName}
- **Naturaleza Administrativa:** Herramienta de apoyo técnico con intervención directa de un empleado público; no es una actuación administrativa automatizada (Art. 41 Ley 40/2015 de Régimen Jurídico del Sector Público).
- **Prohibición de Actuación Automatizada:** ${forbidAutomatedActs ? 'El sistema tiene taxativamente prohibido dictar actos administrativos, resolver procedimientos, calificar aspirantes o imponer sanciones de forma desatendida.' : 'Sujeto a resolución habilitante previa.'}
- **Pila Tecnológica:** ${techStack || 'Web Application / TypeScript / Modelos LLM'}

## 2. Inferencia, Modelos y Soberanía del Dato
- **Modelo Principal:** ${modelName}
- **Modo de Despliegue:** ${hostingDesc}
- **Política de Privacidad y Reentrenamiento:** ${zeroDataRetention ? 'Estricta cláusula de Zero Data Retention (ZDR). Las peticiones, documentos y consultas no se emplean para entrenar ni afinar modelos comerciales de terceros.' : 'Sujeto a contrato de proveedor.'}

## 3. Directivas Maestras del Sistema (System Prompts)
- **Instrucción de Neutralidad y Veracidad:** El modelo operará con el máximo rigor institucional, evitando especulaciones o juicios de valor subjetivos.
${requireOfficialCitation ? '- **Obligación de Cita Normativa:** Cualquier afirmación jurídica o técnica debe contrastarse y referenciarse con normas oficiales publicadas en el BOE o en boletines autonómicos correspondientes.' : ''}
${requireTransparencyBanner ? '- **Transparencia Activa (Art. 50 AI Act):** Todo documento o informe generado incluirá de manera obligatoria el aviso formal de asistencia algorítmica y la indicación de que requiere supervisión humana.' : ''}
${promptGuard ? '- **Barreras Sanitizadoras:** Filtros activos en entrada y salida para neutralizar inyecciones de prompts maliciosas (Jailbreaks) y evitar la incorporación accidental de datos protegidos del Art. 9 del RGPD.' : ''}

## 4. Grado de Autonomía y Llamadas a Herramientas (Agency)
${agencyDesc}

## 5. Trazabilidad, Seguridad y Esquema Nacional de Seguridad (RD 311/2022)
- **Sellado de Trazabilidad:** Registro estructurado de logs con marca de tiempo, usuario tramitador y hash criptográfico SHA-256 de peticiones y respuestas.
- **Periodo de Retención:** ${logRetentionMonths} meses según la documentación de seguridad del sistema (ENS, [op.exp.8]).
- **Seguridad en Front-End (ENS, [op.acc.5]):** Las credenciales y claves de API no viajan al cliente web; la inferencia se canaliza mediante proxy autenticado en la intranet del organismo.`;
  };

  const handleApply = () => {
    const md = generateMarkdown();
    onApply(md);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '48rem',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--brand-paper)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Bot style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-ink)', margin: 0 }}>
                Asistente Rápido de Directivas de Agente (AGENTS.md)
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
                Configura en 4 pasos el manifiesto técnico del modelo para que la auditoría pueda examinarlas.
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

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Question 1: Hosting & Model */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Server style={{ width: 16, height: 16, color: 'var(--brand-blue)' }} />
              <label style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-ink)' }}>
                1. ¿Dónde se ejecuta el modelo de Inteligencia Artificial y qué modelo es?
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setHostingModel('local');
                  setModelName('Modelo local en servidores propios (por ejemplo, Gemma, Llama o Mistral con Ollama o vLLM)');
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: hostingModel === 'local' ? '2px solid var(--brand-blue)' : '1px solid var(--color-border)',
                  background: hostingModel === 'local' ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: hostingModel === 'local' ? 700 : 500,
                }}
              >
                ✅ Inferencia Local On-Premise (Ollama / vLLM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHostingModel('eu');
                  setModelName('Mistral Large (Nube UE) / Aleph Alpha');
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: hostingModel === 'eu' ? '2px solid var(--brand-blue)' : '1px solid var(--color-border)',
                  background: hostingModel === 'eu' ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: hostingModel === 'eu' ? 700 : 500,
                }}
              >
                🇪🇺 Nube Europea con DPA (Centros de datos UE)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHostingModel('commercial');
                  setModelName('Modelo en la nube (por ejemplo, Gemini, GPT o Claude)');
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: hostingModel === 'commercial' ? '2px solid var(--brand-blue)' : '1px solid var(--color-border)',
                  background: hostingModel === 'commercial' ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: hostingModel === 'commercial' ? 700 : 500,
                }}
              >
                🌐 Nube Comercial Internacional (Google / OpenAI)
              </button>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Nombre o Versión del Modelo de Lenguaje:</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Ej.: Gemma con Ollama, o la API de Gemini"
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          {/* Question 2: Agency & Autonomy */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Zap style={{ width: 16, height: 16, color: 'var(--brand-blue)' }} />
              <label style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-ink)' }}>
                2. Grado de Autonomía del Modelo y Llamadas a Herramientas (Art. 14 RIA)
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                <input
                  type="radio"
                  name="agency"
                  checked={agencyLevel === 'strictly_assisted'}
                  onChange={() => setAgencyLevel('strictly_assisted')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong>Asistencia Estrictamente Pasiva / Generativa (Recomendado):</strong>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
                    El modelo solo responde o redacta borradores textuales. No ejecuta llamadas que modifiquen bases de datos ni envíe mensajes.
                  </p>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                <input
                  type="radio"
                  name="agency"
                  checked={agencyLevel === 'human_confirmed_tools'}
                  onChange={() => setAgencyLevel('human_confirmed_tools')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong>Herramientas con Confirmación Previa Obligatoria (Human-in-the-Loop):</strong>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--brand-muted-light)' }}>
                    El agente puede sugerir llamadas a APIs o bases de datos, pero el usuario debe autorizar cada acción con un clic explícito.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Question 3: Ethics & System Prompts */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Scale style={{ width: 16, height: 16, color: 'var(--brand-blue)' }} />
              <label style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-ink)' }}>
                3. Directivas Éticas y Salvaguardas en el System Prompt
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={forbidAutomatedActs}
                  onChange={(e) => setForbidAutomatedActs(e.target.checked)}
                />
                <span>Prohibición de actos automatizados (Art. 41 Ley 40/2015)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={requireOfficialCitation}
                  onChange={(e) => setRequireOfficialCitation(e.target.checked)}
                />
                <span>Exigencia de cita de fuentes normativas en BOE/DOG</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={requireTransparencyBanner}
                  onChange={(e) => setRequireTransparencyBanner(e.target.checked)}
                />
                <span>Banner de transparencia Art. 50 AI Act en todas las salidas</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={promptGuard}
                  onChange={(e) => setPromptGuard(e.target.checked)}
                />
                <span>Filtro de salida contra inyecciones y datos sensibles Art. 9</span>
              </label>
            </div>
          </div>

          {/* Question 4: Traceability & ENS */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Lock style={{ width: 16, height: 16, color: 'var(--brand-blue)' }} />
              <label style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-ink)' }}>
                4. Trazabilidad, Auditoría y ENS (RD 311/2022)
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem' }}>Retención de logs de auditoría:</span>
                <select
                  value={logRetentionMonths}
                  onChange={(e) => setLogRetentionMonths(Number(e.target.value))}
                  style={{ fontSize: '0.8125rem', width: 'auto', padding: '0.25rem 0.5rem' }}
                >
                  <option value={12}>12 meses (Mínimo básico)</option>
                  <option value={24}>24 meses (Recomendado ENS Medio)</option>
                  <option value={36}>36 meses (ENS Alto / Expedientes críticos)</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={zeroDataRetention}
                  onChange={(e) => setZeroDataRetention(e.target.checked)}
                />
                <span>Garantía de no reentrenamiento de modelos comerciales (Zero Data Retention)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--brand-paper)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-muted-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck style={{ width: 15, height: 15, color: '#16a34a' }} />
            <span>Genera un borrador de AGENTS.md con la información que necesita la auditoría.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Check style={{ width: 16, height: 16 }} />
              <span>Aplicar AGENTS.md a la Auditoría</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
