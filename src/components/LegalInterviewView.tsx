import React from 'react';
import {
  UserCheck,
  Building2,
  Lock,
  History,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import type { LegalEnrichmentAnswers, AppIdioma } from '../types';

interface LegalInterviewViewProps {
  answers: LegalEnrichmentAnswers;
  onChange: (answers: LegalEnrichmentAnswers) => void;
  onBack: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  idioma: AppIdioma;
}

export const LegalInterviewView: React.FC<LegalInterviewViewProps> = ({
  answers,
  onChange,
  onBack,
  onAnalyze,
  isAnalyzing,
}) => {
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Intro Box */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Paso 2: Entrevista Jurídica de Gobernanza (4 Puntos Ciegos)
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          El README técnico suele omitir las condiciones jurídicas críticas. Responde a estas 4 preguntas clave para determinar de forma preceptiva el régimen aplicable según el <strong>Reglamento (UE) 2024/1689 (AI Act)</strong>, el <strong>Ómnibus Digital (UE 2026/1744)</strong> y el <strong>ENS (RD 311/2022)</strong>.
        </p>
      </div>

      {/* Question 1: Supervisión Humana */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <div style={{ background: '#dbeafe', color: '#1e40af', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
            <UserCheck style={{ width: 18, height: 18 }} />
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
            1. Supervisión Humana y Control Operativo (Art. 14 RIA)
          </h3>
        </div>

        <div className="form-group">
          <label>¿Cuál es el grado de intervención humana en los resultados producidos?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="humanOversightLevel"
                checked={answers.humanOversightLevel === 'pre_execution'}
                onChange={() => onChange({ ...answers, humanOversightLevel: 'pre_execution' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Previa y Preceptiva (Human-in-the-Loop):</strong> La IA produce únicamente un <em>borrador o propuesta técnica</em>. Ningún documento o resultado adquiere efectos jurídicos ni validez sin la revisión crítica y firma del funcionario competente. (Recomendado).
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="humanOversightLevel"
                checked={answers.humanOversightLevel === 'post_execution'}
                onChange={() => onChange({ ...answers, humanOversightLevel: 'post_execution' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Posterior o por Muestreo (Human-on-the-Loop):</strong> El sistema ejecuta acciones directas y un funcionario audita periódicamente una muestra de los expedientes.
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="humanOversightLevel"
                checked={answers.humanOversightLevel === 'fully_automated'}
                onChange={() => onChange({ ...answers, humanOversightLevel: 'fully_automated' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div style={{ color: '#dc2626' }}>
                <strong>Completamente Automatizada:</strong> La decisión se notifica o surte efectos sin intervención humana previa ni posterior. (Alto Riesgo / Sujeto a Art. 22 RGPD).
              </div>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Órgano, Puesto o Rol del Supervisor Humano Preceptivo</label>
          <input
            type="text"
            placeholder="Ej: Funcionario instructor / Tribunal calificador / Jefatura de Sección"
            value={answers.supervisionRole}
            onChange={(e) => onChange({ ...answers, supervisionRole: e.target.value })}
          />
        </div>
      </div>

      {/* Question 2: Función Pública, Objeto y Delimitación RIA */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
            <Building2 style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
              2. Objeto Evaluado, Perfilado y Delimitación de Riesgo RIA (Art. 6.3 & Anexo III)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Determina con precisión pericial si aplica Alto Riesgo, la excepción motivada del Art. 6.3 o Riesgo de Transparencia.
            </p>
          </div>
        </div>

        {/* 2.1 Objeto procesado */}
        <div className="form-group">
          <label><strong>2.1. ¿Cuál es la materia prima u objeto principal que procesa la herramienta?</strong></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="evaluatedSubjectType"
                checked={answers.evaluatedSubjectType === 'normative_or_unpersonalized_docs'}
                onChange={() => onChange({ ...answers, evaluatedSubjectType: 'normative_or_unpersonalized_docs' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Documentos Normativos o Despersonalizados:</strong> Bases reguladoras, pliegos, leyes, ordenanzas, memorias técnicas o expedientes sin datos directos de personas físicas (ej. <em>Analizador de Convocatorias en PDF</em>). Permite auxilio instrumental o Art. 6.3.
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="evaluatedSubjectType"
                checked={answers.evaluatedSubjectType === 'natural_persons_or_applicants'}
                onChange={() => onChange({ ...answers, evaluatedSubjectType: 'natural_persons_or_applicants' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Solicitudes, Candidatos o Personas Físicas:</strong> Instancias ciudadanas, currículums, alegaciones, solicitudes de ayudas o evaluaciones de empleados públicos (Gatillo potencial de Anexo III).
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="evaluatedSubjectType"
                checked={answers.evaluatedSubjectType === 'system_logs_or_technical'}
                onChange={() => onChange({ ...answers, evaluatedSubjectType: 'system_logs_or_technical' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Datos Técnicos o Telemetría Interna:</strong> Logs de red, métricas de servidores, sensores de consumo o bases de datos sin impacto en derechos (Apto para Riesgo Mínimo).
              </div>
            </label>
          </div>
        </div>

        {/* 2.2 Perfilado y baremación */}
        <div className="form-group" style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={answers.performsProfilingOrScoring === true}
              onChange={(e) => onChange({ ...answers, performsProfilingOrScoring: e.target.checked })}
              style={{ width: 'auto', marginTop: '3px' }}
            />
            <div>
              <strong style={{ color: answers.performsProfilingOrScoring ? '#b91c1c' : 'inherit' }}>
                ¿El algoritmo realiza perfilado de personas físicas o calcula puntuaciones de baremo/admisibilidad?
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                Conforme al Art. 6.3 in fine del RIA, <strong>todo sistema que realice perfilado de personas se considerará SIEMPRE de Alto Riesgo</strong>, sin posibilidad de acogerse a la excepción de tarea preparatoria.
              </span>
            </div>
          </label>
        </div>

        {/* 2.3 Naturaleza administrativa tradicional */}
        <div className="form-group">
          <label><strong>2.3. Régimen competencial en el procedimiento administrativo:</strong></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="administrativeNature"
                checked={answers.administrativeNature === 'technical_auxiliary'}
                onChange={() => onChange({ ...answers, administrativeNature: 'technical_auxiliary' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Auxilio Técnico Instrumental:</strong> Apoyo material para redacción, síntesis, formación u organización interna. No dicta resoluciones. Acogido a la simplificación del Ómnibus Digital (UE 2026/1744).
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="administrativeNature"
                checked={answers.administrativeNature === 'automated_administrative_act'}
                onChange={() => onChange({ ...answers, administrativeNature: 'automated_administrative_act' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Actuación Administrativa Automatizada (Art. 41 Ley 40/2015):</strong> El acto administrativo formal es generado por el sistema mediante sello electrónico o algoritmo formalmente aprobado en boletín oficial.
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="administrativeNature"
                checked={answers.administrativeNature === 'citizen_assessment'}
                onChange={() => onChange({ ...answers, administrativeNature: 'citizen_assessment' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div style={{ color: '#dc2626' }}>
                <strong>Evaluación / Selección / Puntuación Directa de Ciudadanos:</strong> Interviene en la calificación de personas o acceso a prestaciones esenciales. (Clasificación obligatoria de ALTO RIESGO en Anexo III RIA).
              </div>
            </label>
          </div>
        </div>

        {/* 2.4 Generación sintética o chatbot */}
        <div className="form-group">
          <label><strong>2.4. Modo de interacción y producción de contenidos (Art. 50 RIA):</strong></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="interactionAndGenerationType"
                checked={answers.interactionAndGenerationType !== 'internal_non_generative'}
                onChange={() => onChange({ ...answers, interactionAndGenerationType: 'chatbot_or_generative' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Chatbot Conversacional o Generador de Contenido Sintético:</strong> El usuario conversa con una IA o el sistema redacta textos, resúmenes, informes o borradores (Aplica obligaciones de transparencia activa del Art. 50 RIA).
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="interactionAndGenerationType"
                checked={answers.interactionAndGenerationType === 'internal_non_generative'}
                onChange={() => onChange({ ...answers, interactionAndGenerationType: 'internal_non_generative' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Procesamiento Interno No Generativo:</strong> Algoritmos de clustering, optimización de rutas, filtros antispam o cálculos estadísticos sin chat ni generación de texto nuevo (Apto para Riesgo Mínimo Art. 95).
              </div>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Norma o Base Jurídica que Ampara la Competencia del Órgano</label>
          <input
            type="text"
            placeholder="Ej: Ley 39/2015 / Bases de la Convocatoria OEP 2024 / Reglamento Orgánico"
            value={answers.publicCompetenceNorm}
            onChange={(e) => onChange({ ...answers, publicCompetenceNorm: e.target.value })}
          />
        </div>
      </div>

      {/* Question 3: Soberanía del Dato y Privacidad */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
            <Lock style={{ width: 18, height: 18 }} />
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
            3. Soberanía del Dato, Ubicación y Privacidad (ENS RD 311/2022 y RGPD)
          </h3>
        </div>

        <div className="form-group">
          <label>¿Dónde se procesan e infieren las peticiones del modelo de IA?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="hostingModel"
                checked={answers.hostingModel === 'local_on_premise'}
                onChange={() => onChange({ ...answers, hostingModel: 'local_on_premise' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Local On-Premise (Ollama / vLLM):</strong> Servidores e infraestructura propios de la Administración. Si el proveedor configurado es realmente local, los datos no salen de la red corporativa.
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="hostingModel"
                checked={answers.hostingModel === 'eu_cloud_dpa'}
                onChange={() => onChange({ ...answers, hostingModel: 'eu_cloud_dpa' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div>
                <strong>Nube en el Espacio Económico Europeo (con DPA firmado):</strong> Proveedor europeo con Acuerdo de Encargo de Tratamiento conforme al Art. 28 RGPD.
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontWeight: 400, cursor: 'pointer' }}>
              <input
                type="radio"
                name="hostingModel"
                checked={answers.hostingModel === 'us_hyperscaler'}
                onChange={() => onChange({ ...answers, hostingModel: 'us_hyperscaler' })}
                style={{ width: 'auto', marginTop: '3px' }}
              />
              <div style={{ color: '#d97706' }}>
                <strong>Nube Internacional (EE.UU. / APIs externas):</strong> Requiere garantías reforzadas de transferencia internacional (Data Privacy Framework / CTT).
              </div>
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Nombre de la Actividad en el RAT del Organismo</label>
            <input
              type="text"
              placeholder="Ej: Gestión de Selección de Personal / Expedientes de Urbanismo"
              value={answers.ratActivityName}
              onChange={(e) => onChange({ ...answers, ratActivityName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={answers.processesSpecialCategoryData}
                onChange={(e) => onChange({ ...answers, processesSpecialCategoryData: e.target.checked })}
                style={{ width: 'auto' }}
              />
              <span style={{ fontSize: '0.8125rem' }}>¿Trata categorías especiales (Art. 9 RGPD: salud, religión, etnia)?</span>
            </label>
          </div>
        </div>
      </div>

      {/* Question 4: Trazabilidad y Logs */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
            <History style={{ width: 18, height: 18 }} />
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
            4. Trazabilidad y registro de la actividad (ENS)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={answers.auditLogsEnabled}
                onChange={(e) => onChange({ ...answers, auditLogsEnabled: e.target.checked })}
                style={{ width: 'auto' }}
              />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Registro de Logs de Peticiones y Respuestas Habilitado</span>
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
              Medida [op.exp.8] del ENS (RD 311/2022) y Art. 12 del RIA para sistemas de alto riesgo.
            </span>
          </div>

          <div className="form-group">
            <label>Periodo de Retención de Logs (Meses)</label>
            <input
              type="number"
              min={1}
              max={120}
              value={answers.logRetentionMonths}
              onChange={(e) => onChange({ ...answers, logRetentionMonths: parseInt(e.target.value) || 24 })}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={answers.deterministicConfig}
              onChange={(e) => onChange({ ...answers, deterministicConfig: e.target.checked })}
              style={{ width: 'auto' }}
            />
            <span style={{ fontSize: '0.8125rem' }}>Configuración Determinista (Temperatura fija ≤ 0.2 / Semilla constante para reproducibilidad)</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <button type="button" onClick={onBack} className="btn-secondary">
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span>Volver al README</span>
        </button>

        <button
          type="button"
          disabled={isAnalyzing}
          onClick={onAnalyze}
          className="btn-primary"
          style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}
        >
          {isAnalyzing ? (
            <span>Analizando con Normativa Europea...</span>
          ) : (
            <>
              <span>Emitir Diagnóstico y Dictamen</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
