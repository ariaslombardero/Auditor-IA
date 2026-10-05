import React from 'react';
import { ArrowLeft, ArrowRight, Ban, Building2, Cpu, Eye, Lock, Scale, ShieldCheck, UserCheck } from 'lucide-react';
import type {
  AnnexIIIArea,
  AppIdioma,
  AppIngestData,
  Article63Condition,
  EnsLevel,
  InstitutionalRole,
  LegalEnrichmentAnswers,
  TriState,
} from '../types';
import { PROHIBITED_SYSTEMS_CATALOG } from '../lib/legalKnowledgeBase';
import { ENS_DIMENSIONS, ENS_DIMENSION_LABELS, countUnknownAnswers } from '../lib/answersModel';
import { aiUsageHint, annexIIIHints, prohibitedPracticeHints } from '../lib/documentHints';
import { ANNEX_III_LABELS, ARTICLE_63_CONDITIONS } from '../lib/engine/evaluators';

interface LegalInterviewViewProps {
  answers: LegalEnrichmentAnswers;
  ingest: AppIngestData;
  onChange: (answers: LegalEnrichmentAnswers) => void;
  onBack: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  idioma: AppIdioma;
}

const TRI_OPTIONS: Array<{ value: TriState; label: string }> = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'desconocido', label: 'No lo sé' },
];

/** Pregunta de tres respuestas. «No lo sé» se conserva como desconocido: nunca equivale a «no». */
const TriField: React.FC<{
  label: string;
  help?: string;
  value: TriState;
  onChange: (v: TriState) => void;
  hint?: string;
}> = ({ label, help, value, onChange, hint }) => (
  <div className="form-group">
    <span className="form-label">{label}</span>
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {TRI_OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          style={{
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: value === o.value ? 700 : 500,
            cursor: 'pointer',
            border: value === o.value ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: value === o.value ? (o.value === 'desconocido' ? '#fffbeb' : '#eff6ff') : 'white',
            color: 'var(--color-text)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
    {help && <p className="form-help">{help}</p>}
    {hint && <p className="form-help" style={{ color: '#92400e' }}>Indicio en la documentación: «{hint}». Solo orienta la respuesta.</p>}
  </div>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
  <div className="card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: subtitle ? '0.35rem' : '1rem' }}>
      <div style={{ background: '#dbeafe', color: '#1e40af', padding: '0.4rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>{icon}</div>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>{title}</h3>
    </div>
    {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{subtitle}</p>}
    {children}
  </div>
);

const SelectField = <T extends string>({
  label,
  help,
  value,
  options,
  onChange,
}: {
  label: string;
  help?: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {help && <p className="form-help">{help}</p>}
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

const AREA_OPTIONS: Array<{ value: AnnexIIIArea; label: string }> = [
  { value: 'desconocido', label: 'No lo sé' },
  { value: 'ninguno', label: 'Ninguno de los ámbitos del Anexo III' },
  ...(Object.entries(ANNEX_III_LABELS) as Array<[AnnexIIIArea, string]>).map(([value, label]) => ({ value, label })),
];

const CONDITION_OPTIONS: Array<{ value: Article63Condition; label: string }> = [
  { value: 'desconocido', label: 'No lo sé' },
  { value: 'ninguna', label: 'No concurre ninguna condición' },
  ...(Object.entries(ARTICLE_63_CONDITIONS) as Array<[Article63Condition, string]>).map(([value, text]) => ({ value, label: `Letra ${value}): ${text}` })),
];

const ROLE_OPTIONS: Array<{ value: InstitutionalRole; label: string }> = [
  { value: 'desconocido', label: 'No lo sé' },
  { value: 'proveedor', label: 'Proveedora: desarrolla el sistema (o lo encarga) y lo pone en servicio con su propio nombre' },
  { value: 'responsable_despliegue', label: 'Responsable del despliegue: utiliza bajo su autoridad un sistema de un tercero' },
  { value: 'ambos', label: 'Ambas: lo desarrolla y lo utiliza (caso habitual de las aplicaciones propias)' },
];

const ENS_LEVEL_OPTIONS: Array<{ value: EnsLevel; label: string }> = [
  { value: 'desconocido', label: 'Sin valorar' },
  { value: 'no_afectada', label: 'No afectada' },
  { value: 'bajo', label: 'Bajo (perjuicio limitado)' },
  { value: 'medio', label: 'Medio (perjuicio grave)' },
  { value: 'alto', label: 'Alto (perjuicio muy grave)' },
];

export const LegalInterviewView: React.FC<LegalInterviewViewProps> = ({ answers, ingest, onChange, onBack, onAnalyze, isAnalyzing }) => {
  const set = <K extends keyof LegalEnrichmentAnswers>(key: K, value: LegalEnrichmentAnswers[K]) => onChange({ ...answers, [key]: value });
  const pHints = prohibitedPracticeHints(ingest);
  const aHints = annexIIIHints(ingest);
  const aiHint = aiUsageHint(ingest);
  const pending = countUnknownAnswers(answers);
  const inAnnexArea = answers.annexIIIArea !== 'ninguno' && answers.annexIIIArea !== 'desconocido';
  const personalRelevant = answers.processesPersonalData !== 'no';

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Paso 2: Entrevista jurídica
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Las respuestas son declaraciones del promotor y determinan la clasificación preliminar según el Reglamento (UE) 2024/1689 (modificado por el Reglamento (UE) 2026/1744), el RGPD, el ENS y la Ley 40/2015.
          Contesta «No lo sé» cuando no conste: el resultado será <strong>«requiere revisión»</strong> en lugar de presumir que no hay riesgo.
        </p>
        <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.5rem', color: pending ? '#92400e' : '#166534' }}>
          {pending ? `Quedan ${pending} respuestas sin contestar.` : 'Todas las preguntas principales están contestadas.'}
        </p>
      </div>

      <Section icon={<Cpu style={{ width: 18, height: 18 }} />} title="A. ¿Es un sistema de IA? (Art. 3.1 RIA)">
        <TriField
          label="¿Infiere el sistema, a partir de la información de entrada, la manera de generar resultados (predicciones, contenidos, recomendaciones o decisiones)?"
          help="Un sistema basado únicamente en reglas fijas definidas por personas (calcular plazos, validar formularios) no infiere. Un modelo de lenguaje o de aprendizaje automático sí."
          value={answers.infersOutputs}
          onChange={(v) => set('infersOutputs', v)}
          hint={aiHint?.evidence}
        />
      </Section>

      <Section
        icon={<Ban style={{ width: 18, height: 18 }} />}
        title="B. Prácticas prohibidas (Art. 5 RIA)"
        subtitle="Indica si el sistema incurre en cada práctica. Si no consta, la clasificación no podrá concluirse."
      >
        <button
          type="button"
          className="btn-secondary"
          style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}
          onClick={() => set('prohibitedPractices', Object.fromEntries(PROHIBITED_SYSTEMS_CATALOG.map((p) => [p.id, 'no' as TriState])))}
        >
          He revisado todas y declaro que no concurre ninguna
        </button>
        {PROHIBITED_SYSTEMS_CATALOG.map((p) => (
          <TriField
            key={p.id}
            label={`${p.legalArticle}: ${p.title}${p.applicableFrom ? ` (aplicable desde el ${new Date(p.applicableFrom).toLocaleDateString('es-ES')})` : ''}`}
            value={answers.prohibitedPractices[p.id] ?? 'desconocido'}
            onChange={(v) => set('prohibitedPractices', { ...answers.prohibitedPractices, [p.id]: v })}
            hint={pHints.find((h) => h.target === p.id)?.evidence}
          />
        ))}
      </Section>

      <Section icon={<Scale style={{ width: 18, height: 18 }} />} title="C. Alto riesgo (Art. 6 y Anexo III RIA)">
        <SelectField
          label="¿En qué ámbito del Anexo III se utiliza el sistema?"
          help={aHints.length ? `Indicios en la documentación: ${aHints.map((h) => h.target.replace('annexIII:', '')).join(', ')}. Solo orientan la respuesta.` : undefined}
          value={answers.annexIIIArea}
          options={AREA_OPTIONS}
          onChange={(v) => set('annexIIIArea', v)}
        />
        {inAnnexArea && (
          <TextField
            label="Describe el uso concreto en ese ámbito"
            value={answers.annexIIIUseDescription}
            onChange={(v) => set('annexIIIUseDescription', v)}
            placeholder="Por ejemplo: ordena las solicitudes según los méritos alegados"
          />
        )}
        {answers.annexIIIArea === 'servicios_esenciales' && (
          <TriField
            label="¿Evalúa la admisibilidad de personas físicas para servicios y prestaciones esenciales de asistencia pública (o los concede, reduce, retira o reclama)?"
            help="Punto 5.a) del Anexo III. No toda ayuda o subvención es una prestación esencial de asistencia pública, y las ayudas a personas jurídicas no están en este punto."
            value={answers.essentialPublicAssistance}
            onChange={(v) => set('essentialPublicAssistance', v)}
          />
        )}
        <TriField
          label="¿Elabora perfiles de personas físicas (evalúa aspectos personales como rendimiento, situación económica, fiabilidad o comportamiento)?"
          help="Comprobar si una solicitud incluye los documentos exigidos no es, por sí solo, perfilar. Puntuar o valorar la idoneidad de una persona sí lo es. En el ámbito del Anexo III, el perfilado impide la excepción del Art. 6.3."
          value={answers.performsProfiling}
          onChange={(v) => set('performsProfiling', v)}
        />
        {inAnnexArea && answers.performsProfiling === 'no' && (
          <>
            <SelectField
              label="¿Qué condición del Art. 6.3 concurre? (basta una)"
              value={answers.article63Condition}
              options={CONDITION_OPTIONS}
              onChange={(v) => set('article63Condition', v)}
            />
            {answers.article63Condition !== 'ninguna' && answers.article63Condition !== 'desconocido' && (
              <>
                <TextField
                  label="Hechos que justifican esa condición"
                  help="Se incorporan literalmente a la justificación. El proveedor debe documentar la evaluación antes de la puesta en servicio (Art. 6.4)."
                  value={answers.article63Facts}
                  onChange={(v) => set('article63Facts', v)}
                  multiline
                />
                <TriField
                  label="¿Influye sustancialmente el sistema en el resultado de la toma de decisiones?"
                  value={answers.materialInfluence}
                  onChange={(v) => set('materialInfluence', v)}
                />
              </>
            )}
          </>
        )}
      </Section>

      <Section icon={<Eye style={{ width: 18, height: 18 }} />} title="D. Transparencia (Art. 50 RIA)">
        <TriField label="¿Interactúa directamente con personas físicas (por ejemplo, un asistente conversacional)?" value={answers.interactsWithPersons} onChange={(v) => set('interactsWithPersons', v)} />
        <TriField label="¿Genera contenido sintético (texto, imagen, audio o vídeo)?" value={answers.generatesSyntheticContent} onChange={(v) => set('generatesSyntheticContent', v)} />
      </Section>

      <Section icon={<Building2 style={{ width: 18, height: 18 }} />} title="E. Papel de la entidad (Art. 3, puntos 3 y 4, RIA)" subtitle="De este papel dependen las obligaciones: el proveedor responde del sistema; el responsable del despliegue, de su uso.">
        <SelectField label="¿Qué papel tiene la entidad respecto del sistema?" value={answers.institutionalRole} options={ROLE_OPTIONS} onChange={(v) => set('institutionalRole', v)} />
      </Section>

      <Section icon={<UserCheck style={{ width: 18, height: 18 }} />} title="F. Supervisión humana y actuación administrativa automatizada (Art. 41 Ley 40/2015)">
        <SelectField
          label="¿Cuándo revisa una persona los resultados?"
          value={answers.humanOversightLevel}
          options={[
            { value: 'desconocido', label: 'No lo sé' },
            { value: 'pre_execution', label: 'Antes de que produzcan efectos (revisión previa)' },
            { value: 'post_execution', label: 'Después de que produzcan efectos (revisión posterior)' },
            { value: 'fully_automated', label: 'Nunca: el sistema actúa sin intervención humana' },
          ]}
          onChange={(v) => set('humanOversightLevel', v)}
        />
        <TextField label="¿Quién supervisa? (rol)" value={answers.supervisionRole} onChange={(v) => set('supervisionRole', v)} placeholder="Por ejemplo: técnico de la unidad tramitadora" />
        <TriField
          label="¿Interviene de forma directa un empleado público en cada acto o actuación?"
          help="Si no interviene, es actuación administrativa automatizada (Art. 41): deben establecerse previamente los órganos competentes y el responsable a efectos de impugnación."
          value={answers.directHumanIntervention}
          onChange={(v) => set('directHumanIntervention', v)}
        />
        <TextField
          label="Describe cómo funciona realmente el procedimiento"
          help="Quién interviene, en qué momento y con qué capacidad de modificar o descartar el resultado. Sin esta descripción el deslinde del Art. 41 queda pendiente."
          value={answers.procedureDescription}
          onChange={(v) => set('procedureDescription', v)}
          multiline
        />
        <TextField label="Norma que regula el procedimiento o la competencia" value={answers.publicCompetenceNorm} onChange={(v) => set('publicCompetenceNorm', v)} placeholder="Por ejemplo: bases de la convocatoria, Ley 39/2015" />
      </Section>

      <Section icon={<Lock style={{ width: 18, height: 18 }} />} title="G. Protección de datos (RGPD)">
        <TriField label="¿Trata datos personales?" value={answers.processesPersonalData} onChange={(v) => set('processesPersonalData', v)} />
        {personalRelevant && (
          <>
            <SelectField
              label="Base jurídica del tratamiento (Art. 6.1 RGPD)"
              value={answers.legalBasis}
              options={[
                { value: 'desconocida', label: 'No lo sé' },
                { value: 'art_6_1_e', label: 'Art. 6.1.e): misión de interés público o ejercicio de poderes públicos' },
                { value: 'art_6_1_c', label: 'Art. 6.1.c): cumplimiento de una obligación legal' },
                { value: 'otra', label: 'Otra base del Art. 6.1' },
              ]}
              onChange={(v) => set('legalBasis', v)}
            />
            <TriField label="¿Trata categorías especiales de datos (Art. 9 RGPD: salud, origen étnico, opiniones políticas, afiliación sindical, etc.)?" value={answers.processesSpecialCategoryData} onChange={(v) => set('processesSpecialCategoryData', v)} />
            <TriField label="¿Trata datos relativos a condenas e infracciones penales (Art. 10 RGPD)?" value={answers.processesCriminalData} onChange={(v) => set('processesCriminalData', v)} />
            <TriField label="¿Usa datos biométricos para identificar de manera única a una persona?" value={answers.biometricIdentification} onChange={(v) => set('biometricIdentification', v)} />
            <TriField label="¿Trata datos genéticos?" value={answers.geneticData} onChange={(v) => set('geneticData', v)} />
            <TriField label="¿Observa, monitoriza o controla a los interesados de forma sistemática?" value={answers.systematicMonitoring} onChange={(v) => set('systematicMonitoring', v)} />
            <TriField label="¿Trata datos a gran escala?" value={answers.largeScale} onChange={(v) => set('largeScale', v)} />
            <TriField label="¿Combina o enlaza datos de distintos tratamientos o responsables?" value={answers.datasetCombination} onChange={(v) => set('datasetCombination', v)} />
            <TriField label="¿Afecta a personas vulnerables o en riesgo de exclusión social?" value={answers.vulnerableSubjects} onChange={(v) => set('vulnerableSubjects', v)} />
            <TriField label="¿Puede impedir a los interesados ejercer un derecho o acceder a un servicio o contrato?" value={answers.preventsRightsOrService} onChange={(v) => set('preventsRightsOrService', v)} />
            <TextField label="Actividad del Registro de Actividades de Tratamiento" value={answers.ratActivityName} onChange={(v) => set('ratActivityName', v)} help="Indicar el nombre no acredita la inscripción: debe verificarla el DPD." />
          </>
        )}
        <SelectField
          label="¿Dónde se ejecuta el modelo?"
          value={answers.hostingModel}
          options={[
            { value: 'desconocido', label: 'No lo sé' },
            { value: 'local_on_premise', label: 'En servidores propios (Ollama, vLLM u otro modelo local)' },
            { value: 'eu_cloud_dpa', label: 'En una nube de la Unión Europea con contrato de encargo del tratamiento' },
            { value: 'us_hyperscaler', label: 'En una nube fuera del Espacio Económico Europeo' },
          ]}
          onChange={(v) => set('hostingModel', v)}
        />
      </Section>

      <Section
        icon={<ShieldCheck style={{ width: 18, height: 18 }} />}
        title="H. Seguridad (ENS, Anexo I) y trazabilidad"
        subtitle="Valora el perjuicio que causaría un incidente en cada dimensión. La categoría del sistema es la del nivel más alto."
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
          {ENS_DIMENSIONS.map((d) => (
            <SelectField
              key={d}
              label={`${ENS_DIMENSION_LABELS[d]} [${d}]`}
              value={answers.ensImpact[d]}
              options={ENS_LEVEL_OPTIONS}
              onChange={(v) => set('ensImpact', { ...answers.ensImpact, [d]: v })}
            />
          ))}
        </div>
        <TriField label="¿Se registran las peticiones, respuestas y eventos (registro de actividad)?" value={answers.auditLogsEnabled} onChange={(v) => set('auditLogsEnabled', v)} />
        {answers.auditLogsEnabled === 'si' && (
          <div className="form-group">
            <label className="form-label">Meses de conservación del registro</label>
            <input type="number" min={0} value={answers.logRetentionMonths} onChange={(e) => set('logRetentionMonths', Number(e.target.value) || 0)} />
          </div>
        )}
        <TriField label="¿Se fija la configuración del modelo (versión, temperatura) para que los resultados sean reproducibles?" value={answers.deterministicConfig} onChange={(v) => set('deterministicConfig', v)} />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button type="button" onClick={onBack} className="btn-secondary">
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span>Volver a la ingesta</span>
        </button>
        <button type="button" onClick={onAnalyze} className="btn-primary" disabled={isAnalyzing}>
          <span>{isAnalyzing ? 'Analizando...' : 'Emitir Diagnóstico y Dictamen'}</span>
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};
