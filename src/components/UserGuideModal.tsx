import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  ListChecks,
  Cpu,
  Terminal,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { AppIdioma } from '../types';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: AppIdioma;
}

export const DEVELOPER_AGENTS_MD_PROMPT = `Actúa como arquitecto de software y auditor de seguridad de inteligencia artificial.
Analiza el código fuente y la arquitectura de este proyecto y genera un archivo AGENTS.md para su revisión previa en el sector público español (Reglamento (UE) 2024/1689 de IA, Esquema Nacional de Seguridad y RGPD).
Describe solo lo que el código hace realmente; si un dato no consta en el código, indícalo como «No consta».

El archivo AGENTS.md debe documentar:

1. DESCRIPCIÓN Y FINALIDAD:
   - Nombre, propósito y si el sistema prepara borradores, recomienda o toma decisiones.
   - Destinatarios (personal de la administración, ciudadanía o uso interno).

2. MODELOS E INFERENCIA:
   - Modelos de lenguaje utilizados (familia, versión y proveedor: Gemini, Llama, Mistral, OpenAI…).
   - Dónde se ejecutan: servidor propio (Ollama, vLLM…) o servicio en la nube, y en qué país.
   - Si el proveedor puede usar los datos para entrenar sus modelos.

3. INSTRUCCIONES DEL SISTEMA:
   - Texto literal de las instrucciones del sistema (system prompts).
   - Restricciones y salvaguardas implementadas.

4. HERRAMIENTAS Y AUTONOMÍA:
   - Funciones o herramientas que el modelo puede invocar.
   - Si puede modificar bases de datos, enviar correos, dictar resoluciones o firmar documentos sin validación humana previa.

5. DATOS PERSONALES (RGPD):
   - Si trata datos personales o de categorías especiales (Art. 9 RGPD: salud, discapacidad, religión, afiliación sindical…).
   - Si trata datos de solvencia o deudas de personas físicas (concursos, embargos, impagos), aunque procedan de fuentes públicas.
   - Flujo de los datos: dónde se reciben, a dónde se envían y cuándo se borran.
   - Si hay un procedimiento para detectar y notificar brechas de datos personales (Arts. 33 y 34 RGPD).

6. REGISTRO DE ACTIVIDAD (ENS, [op.exp.8]):
   - Si se registran peticiones, respuestas, fecha, hora y usuario.
   - Periodo de conservación previsto de esos registros.

Entrega el resultado en Markdown, listo para guardarlo como AGENTS.md en la raíz del repositorio.`;

type Tab = 'inicio' | 'pasos' | 'resultado' | 'ia' | 'documentacion' | 'validez';

const caja: React.CSSProperties = {
  padding: '0.85rem 1rem',
  background: '#f8fafc',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
};
const titulo: React.CSSProperties = { fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' };
const parrafo: React.CSSProperties = { color: '#475569', marginBottom: '1rem' };
const celda: React.CSSProperties = { padding: '0.45rem 0.6rem', borderBottom: '1px solid var(--color-border)', verticalAlign: 'top', textAlign: 'left' };

/** Tabla sencilla de dos o tres columnas */
const Tabla: React.FC<{ cabecera: string[]; filas: React.ReactNode[][] }> = ({ cabecera, filas }) => (
  <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
      <thead>
        <tr style={{ background: '#f1f5f9' }}>
          {cabecera.map((c) => (
            <th key={c} style={{ ...celda, fontWeight: 700 }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i}>
            {fila.map((c, j) => (
              <td key={j} style={celda}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Aviso: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: '0.6rem', padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', color: '#92400e', fontSize: '0.8125rem', marginBottom: '1rem' }}>
    <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
    <div>{children}</div>
  </div>
);

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, idioma }) => {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const isGl = idioma === 'galego';
  const tx = (es: string, gl: string) => (isGl ? gl : es);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(DEVELOPER_AGENTS_MD_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const pestanas: Array<{ id: Tab; icono: React.ReactNode; texto: string }> = [
    { id: 'inicio', icono: <BookOpen style={{ width: 14, height: 14 }} />, texto: tx('1. Qué es', '1. Que é') },
    { id: 'pasos', icono: <ListChecks style={{ width: 14, height: 14 }} />, texto: tx('2. Paso a paso', '2. Paso a paso') },
    { id: 'resultado', icono: <ShieldCheck style={{ width: 14, height: 14 }} />, texto: tx('3. Cómo leer el resultado', '3. Como ler o resultado') },
    { id: 'ia', icono: <Cpu style={{ width: 14, height: 14 }} />, texto: tx('4. IA y privacidad', '4. IA e privacidade') },
    { id: 'documentacion', icono: <Terminal style={{ width: 14, height: 14 }} />, texto: tx('5. README y AGENTS.md', '5. README e AGENTS.md') },
    { id: 'validez', icono: <KeyRound style={{ width: 14, height: 14 }} />, texto: tx('6. Validez del informe', '6. Validez do informe') },
  ];

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
          maxWidth: '56rem',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={tx('Guía de usuario', 'Guía de usuario')}
      >
        {/* Cabecera */}
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
                {tx('Guía de usuario', 'Guía de usuario')}
              </h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--brand-muted-light)' }}>
                {tx('Qué hace la herramienta, cómo usarla y cómo leer sus resultados', 'Que fai a ferramenta, como usala e como ler os seus resultados')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--brand-muted-light)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)', display: 'flex' }}
            title={tx('Cerrar', 'Pechar')}
            aria-label={tx('Cerrar', 'Pechar')}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Pestañas */}
        <div role="tablist" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: '#ffffff', padding: '0 1rem', overflowX: 'auto' }}>
          {pestanas.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={activeTab === p.id}
              onClick={() => setActiveTab(p.id)}
              style={{
                padding: '0.75rem 0.85rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === p.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === p.id ? 'var(--color-primary)' : 'var(--brand-muted-light)',
                fontWeight: activeTab === p.id ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
              }}
            >
              {p.icono}
              <span>{p.texto}</span>
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--brand-ink)' }}>
          {activeTab === 'inicio' && (
            <div className="animate-fade-in">
              <h3 style={titulo}>{tx('¿Para qué sirve?', 'Para que serve?')}</h3>
              <p style={parrafo}>
                {tx(
                  'Ayuda a preparar un primer diagnóstico de una aplicación con inteligencia artificial antes de que una Administración la use: si le afecta el Reglamento europeo de IA, si está prohibida o es de alto riesgo, qué tiene que hacer la entidad, si hace falta una evaluación de impacto en protección de datos (EIPD) y qué nivel de seguridad (ENS) le corresponde.',
                  'Axuda a preparar un primeiro diagnóstico dunha aplicación con intelixencia artificial antes de que unha Administración a use: se lle afecta o Regulamento europeo de IA, se está prohibida ou é de alto risco, que ten que facer a entidade, se fai falta unha avaliación de impacto en protección de datos (AIPD) e que nivel de seguridade (ENS) lle corresponde.'
                )}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={caja}>
                  <strong style={{ color: 'var(--color-primary)' }}>{tx('Cómo trabaja', 'Como traballa')}</strong>
                  <ol style={{ margin: '0.4rem 0 0 1.1rem', fontSize: '0.8125rem', color: '#334155' }}>
                    <li>{tx('Usted describe la aplicación y contesta una entrevista.', 'Vostede describe a aplicación e contesta unha entrevista.')}</li>
                    <li>{tx('La herramienta aplica las normas a sus respuestas.', 'A ferramenta aplica as normas ás súas respostas.')}</li>
                    <li>{tx('Le devuelve una clasificación razonada y lo que falta por acreditar.', 'Devólvelle unha clasificación razoada e o que falta por acreditar.')}</li>
                    <li>{tx('Genera un informe en Word para que lo revisen los responsables.', 'Xera un informe en Word para que o revisen os responsables.')}</li>
                  </ol>
                </div>
                <div style={caja}>
                  <strong style={{ color: '#b45309' }}>{tx('Lo que no hace', 'O que non fai')}</strong>
                  <ul style={{ margin: '0.4rem 0 0 1.1rem', fontSize: '0.8125rem', color: '#334155' }}>
                    <li>{tx('No certifica ni dicta resoluciones: el informe es un borrador.', 'Non certifica nin dita resolucións: o informe é un borrador.')}</li>
                    <li>{tx('No inspecciona la aplicación por dentro: trabaja con lo que usted declara.', 'Non inspecciona a aplicación por dentro: traballa co que vostede declara.')}</li>
                    <li>{tx('No necesita IA: la IA es opcional y nunca cambia la clasificación.', 'Non precisa IA: a IA é opcional e nunca cambia a clasificación.')}</li>
                  </ul>
                </div>
              </div>

              <Aviso>
                {tx(
                  'Pruébela solo con datos inventados o documentación no sensible. Nunca con expedientes reales, datos personales ni claves reales.',
                  'Próbea só con datos inventados ou documentación non sensible. Nunca con expedientes reais, datos persoais nin claves reais.'
                )}
              </Aviso>

              <h3 style={titulo}>{tx('Prueba rápida (10 minutos)', 'Proba rápida (10 minutos)')}</h3>
              <ol style={{ margin: '0 0 0 1.1rem', color: '#334155' }}>
                <li>{tx('Paso 1: pulse «Ruta 3: Carga Manual / Plantillas» y elija «Ejemplo: Baremación RRHH (Alto Riesgo)».', 'Paso 1: prema «Ruta 3: Carga Manual / Plantillas» e escolla «Ejemplo: Baremación RRHH (Alto Riesgo)».')}</li>
                <li>{tx('Paso 2: conteste la entrevista como si fuera esa aplicación (puntúa méritos de aspirantes: ámbito «Empleo» y perfilado «Sí»).', 'Paso 2: conteste a entrevista como se fose esa aplicación (puntúa méritos de aspirantes: ámbito «Empleo» e perfilado «Sí»).')}</li>
                <li>{tx('Pulse «Emitir diagnóstico preliminar»: debe salir «ALTO RIESGO».', 'Prema «Emitir diagnóstico preliminar»: debe saír «ALTO RIESGO».')}</li>
                <li>{tx('Repita dejando preguntas en «No lo sé»: saldrá «REQUIERE REVISIÓN». Es intencionado.', 'Repita deixando preguntas en «No lo sé»: sairá «REQUIERE REVISIÓN». É intencionado.')}</li>
                <li>{tx('Paso 5: descargue el informe en Word y compruebe que dice lo mismo que la pantalla.', 'Paso 5: descargue o informe en Word e comprobe que di o mesmo ca pantalla.')}</li>
              </ol>
            </div>
          )}

          {activeTab === 'pasos' && (
            <div className="animate-fade-in">
              <h3 style={titulo}>{tx('Los seis pasos', 'Os seis pasos')}</h3>
              <Tabla
                cabecera={[tx('Paso', 'Paso'), tx('Qué hace usted', 'Que fai vostede'), tx('Qué obtiene', 'Que obtén')]}
                filas={[
                  [
                    tx('1. Ingesta', '1. Inxesta'),
                    tx('Describe la aplicación por una de tres rutas: repositorio público de GitHub (lee el README, el AGENTS.md y la lista de dependencias, no el resto del código), asistente de 4 preguntas (sin código ni IA) o carga manual y plantillas.', 'Describe a aplicación por unha de tres rutas: repositorio público de GitHub (le o README, o AGENTS.md e a lista de dependencias, non o resto do código), asistente de 4 preguntas (sen código nin IA) ou carga manual e modelos.'),
                    tx('Indicios para orientar la entrevista (nunca deciden la clasificación).', 'Indicios para orientar a entrevista (nunca deciden a clasificación).'),
                  ],
                  [
                    tx('2. Entrevista', '2. Entrevista'),
                    tx('Contesta ocho bloques (A a H): si es IA, prácticas prohibidas, alto riesgo, transparencia, papel de la entidad, supervisión humana, datos personales y seguridad. Casi todo es «Sí / No / No lo sé».', 'Contesta oito bloques (A a H): se é IA, prácticas prohibidas, alto risco, transparencia, papel da entidade, supervisión humana, datos persoais e seguridade. Case todo é «Sí / No / No lo sé» (a entrevista móstrase en castelán).'),
                    tx('«¿Qué significa?» en cada pregunta, preguntas pendientes resaltadas con «Ir a la siguiente», y sugerencias de respuesta que solo se aplican si las aceptas.', '«¿Qué significa?» en cada pregunta, preguntas pendentes resaltadas con «Ir á seguinte», e suxestións de resposta que só se aplican se as aceptas.'),
                  ],
                  [
                    tx('3. Diagnóstico', '3. Diagnóstico'),
                    tx('Lee la clasificación y su traza, contesta lo que falte en el panel «Lo que falta por contestar» y registra validaciones con su evidencia. Se actualiza solo al cambiar respuestas.', 'Le a clasificación e a súa traza, contesta o que falte no panel «Lo que falta por contestar» e rexistra validacións coa súa evidencia. Actualízase só ao cambiar respostas.'),
                    tx('Clasificación razonada, cuadro de mando de 4 pilares, alertas y recomendaciones.', 'Clasificación razoada, cadro de mando de 4 piares, alertas e recomendacións.'),
                  ],
                  [
                    tx('4. Kit de código', '4. Kit de código'),
                    tx('Copia los textos para el equipo que desarrolla la aplicación auditada.', 'Copia os textos para o equipo que desenvolve a aplicación auditada.'),
                    tx('Avisos de uso de IA (Art. 50) y pautas para no exponer claves.', 'Avisos de uso de IA (Art. 50) e pautas para non expoñer claves.'),
                  ],
                  [
                    tx('5. Informe técnico', '5. Informe técnico'),
                    tx('Rellena los datos de la entidad y descarga los documentos.', 'Enche os datos da entidade e descarga os documentos.'),
                    tx('Informe en Word y Markdown, manifiesto JSON y borrador de EIPD.', 'Informe en Word e Markdown, manifesto JSON e borrador de AIPD.'),
                  ],
                  [
                    tx('6. Laboratorio de pruebas', '6. Laboratorio de probas'),
                    tx('Lanza los ensayos adversarios, revisa la EIPD, inspecciona textos y consulta normas.', 'Lanza os ensaios adversarios, revisa a AIPD, inspecciona textos e consulta normas.'),
                    tx('Resultados de los ensayos, escáner de claves y huella del informe.', 'Resultados dos ensaios, escáner de claves e pegada do informe.'),
                  ],
                ]}
              />
              <div style={caja}>
                <strong>{tx('Consejo:', 'Consello:')}</strong>{' '}
                {tx(
                  '«No lo sé» es una respuesta válida. La herramienta nunca la trata como un «no»: marca el punto como pendiente. Puede volver a cualquier paso ya completado desde la barra de pasos.',
                  '«No lo sé» é unha resposta válida. A ferramenta nunca a trata como un «non»: marca o punto como pendente. Pode volver a calquera paso xa completado desde a barra de pasos.'
                )}
              </div>
            </div>
          )}

          {activeTab === 'resultado' && (
            <div className="animate-fade-in">
              <h3 style={titulo}>{tx('La clasificación', 'A clasificación')}</h3>
              <Tabla
                cabecera={[tx('Resultado', 'Resultado'), tx('Qué significa', 'Que significa'), tx('Qué implica', 'Que implica')]}
                filas={[
                  [tx('Excluido del RIA', 'Excluído do RIA'), tx('Funciona con reglas fijas: no es un sistema de IA.', 'Funciona con regras fixas: non é un sistema de IA.'), tx('Le aplican el ENS, el RGPD y las leyes 39 y 40/2015, no el Reglamento de IA.', 'Aplícanselle o ENS, o RGPD e as leis 39 e 40/2015, non o Regulamento de IA.')],
                  [tx('Riesgo inadmisible', 'Risco inadmisible'), tx('Incurre en una práctica prohibida (Art. 5).', 'Incorre nunha práctica prohibida (Art. 5).'), tx('No puede usarse.', 'Non pode usarse.')],
                  [tx('Alto riesgo', 'Alto risco'), tx('Ámbito del Anexo III (empleo, educación, prestaciones, justicia…) sin excepción.', 'Ámbito do Anexo III (emprego, educación, prestacións, xustiza…) sen excepción.'), tx('Obligaciones exigentes desde el 2/12/2027.', 'Obrigas esixentes desde o 2/12/2027.')],
                  [tx('Exceptuado (Art. 6.3)', 'Exceptuado (Art. 6.3)'), tx('Ámbito del Anexo III, pero tarea auxiliar sin valorar a personas.', 'Ámbito do Anexo III, pero tarefa auxiliar sen valorar a persoas.'), tx('Documentar la excepción y registrar el sistema.', 'Documentar a excepción e rexistrar o sistema.')],
                  [tx('Riesgo de transparencia', 'Risco de transparencia'), tx('Habla con personas o genera contenido.', 'Fala con persoas ou xera contido.'), tx('Avisar de que es una IA y marcar el contenido generado.', 'Avisar de que é unha IA e marcar o contido xerado.')],
                  [tx('Riesgo mínimo', 'Risco mínimo'), tx('Nada de lo anterior.', 'Nada do anterior.'), tx('Buenas prácticas voluntarias.', 'Boas prácticas voluntarias.')],
                  [tx('Requiere revisión', 'Require revisión'), tx('Faltan respuestas o hay contradicciones.', 'Faltan respostas ou hai contradicións.'), tx('Complete o corrija la entrevista.', 'Complete ou corrixa a entrevista.')],
                ]}
              />

              <h3 style={titulo}>{tx('Por qué ha salido ese resultado', 'Por que saíu ese resultado')}</h3>
              <ul style={{ margin: '0 0 1rem 1.1rem', color: '#334155' }}>
                <li><strong>{tx('Traza de la clasificación:', 'Traza da clasificación:')}</strong> {tx('cada paso del razonamiento, con la pregunta, la respuesta, la regla, la norma y sus límites.', 'cada paso do razoamento, coa pregunta, a resposta, a regra, a norma e os seus límites.')}</li>
                <li><strong>{tx('Motivos de revisión:', 'Motivos de revisión:')}</strong> {tx('qué falta si el resultado es «requiere revisión».', 'que falta se o resultado é «require revisión».')}</li>
                <li><strong>{tx('Alertas para la revisión:', 'Alertas para a revisión:')}</strong> {tx('avisos que no cambian la clasificación pero deben atenderse.', 'avisos que non cambian a clasificación pero deben atenderse.')}</li>
              </ul>

              <h3 style={titulo}>{tx('Respuestas pendientes y requisitos por validar', 'Respostas pendentes e requisitos por validar')}</h3>
              <Tabla
                cabecera={[tx('Recuadro', 'Recadro'), tx('Qué cuenta', 'Que conta'), tx('Cómo se reduce', 'Como se reduce')]}
                filas={[
                  [tx('Respuestas pendientes', 'Respostas pendentes'), tx('Preguntas en «No lo sé» o sin contestar.', 'Preguntas en «No lo sé» ou sen contestar.'), tx('Contestándolas, en la entrevista o en el panel «Lo que falta por contestar».', 'Contestándoas, na entrevista ou no panel «Lo que falta por contestar».')],
                  [tx('Requisitos por validar', 'Requisitos por validar'), tx('Obligaciones contestadas que nadie ha validado todavía.', 'Obrigas contestadas que ninguén validou aínda.'), tx('Solo con «Registrar validación humana». Contestar no los reduce: es normal.', 'Só con «Registrar validación humana». Contestar non os reduce: é normal.')],
                ]}
              />

              <h3 style={titulo}>{tx('Estado de los requisitos', 'Estado dos requisitos')}</h3>
              <Tabla
                cabecera={[tx('Estado', 'Estado'), tx('Significado', 'Significado')]}
                filas={[
                  [tx('Declarado', 'Declarado'), tx('Lo afirma el promotor; nadie lo ha comprobado.', 'Afírmao o promotor; ninguén o comprobou.')],
                  [tx('No verificado / pendiente', 'Non verificado / pendente'), tx('Falta información o comprobación.', 'Falta información ou comprobación.')],
                  [tx('No evaluado', 'Non avaliado'), tx('La herramienta no lo examina: debe revisarse a mano.', 'A ferramenta non o examina: debe revisarse a man.')],
                  [tx('Incumple', 'Incumpre'), tx('Lo declarado choca con la norma.', 'O declarado choca coa norma.')],
                  [tx('Acreditado', 'Acreditado'), tx('Solo tras «Registrar validación humana» (quién valida y con qué evidencia). Si cambia la entrevista, hay que repetirla.', 'Só tras «Registrar validación humana» (quen valida e con que evidencia). Se cambia a entrevista, hai que repetila.')],
                ]}
              />
            </div>
          )}

          {activeTab === 'ia' && (
            <div className="animate-fade-in">
              <h3 style={titulo}>{tx('¿Necesito un modelo de IA?', 'Preciso un modelo de IA?')}</h3>
              <p style={parrafo}>
                {tx(
                  'No. Sin proveedor, todo funciona con el motor de reglas («Modo determinista»). Con un proveedor, el modelo redacta un comentario complementario, que no cambia la clasificación, y ejecuta los ensayos adversarios del paso 6.',
                  'Non. Sen provedor, todo funciona co motor de regras («Modo determinista»). Cun provedor, o modelo redacta un comentario complementario, que non cambia a clasificación, e executa os ensaios adversarios do paso 6.'
                )}
              </p>
              <Tabla
                cabecera={[tx('Opción', 'Opción'), tx('Cómo se configura', 'Como se configura')]}
                filas={[
                  ['Google Gemini', tx('Consiga una clave en Google AI Studio y péguela. La lista de modelos se carga sola y solo muestra los que admite su clave.', 'Consiga unha clave en Google AI Studio e péguea. A lista de modelos cárgase soa e só mostra os que admite a súa clave.')],
                  [tx('Compatible con OpenAI', 'Compatible con OpenAI'), tx('Mistral (UE), OpenAI, OpenRouter, DeepSeek, Groq o un servidor propio: elija el servicio, pegue la clave y elija el modelo.', 'Mistral (UE), OpenAI, OpenRouter, DeepSeek, Groq ou un servidor propio: escolla o servizo, pegue a clave e escolla o modelo.')],
                  [tx('Modelo local', 'Modelo local'), tx('Instale Ollama, descargue un modelo (por ejemplo, qwen2.5:14b) y pulse «Detectar modelos del servidor local». Es la opción recomendada para uso institucional.', 'Instale Ollama, descargue un modelo (por exemplo, qwen2.5:14b) e prema «Detectar modelos do servidor local». É a opción recomendada para uso institucional.')],
                ]}
              />
              <h3 style={titulo}>{tx('Sugerencias de respuesta', 'Suxestións de resposta')}</h3>
              <p style={parrafo}>
                {tx(
                  'Si no sabes una respuesta, pulsa «Sugerir respuesta con IA» (o «Buscar indicios en la documentación» si no hay proveedor). La sugerencia aparece bajo la pregunta y nunca se aplica sola. La app comprueba la cita: «con cita comprobada» se puede aceptar en bloque; «inferida» (sin respaldo, o cualquier «no» sobre prácticas prohibidas, datos sensibles o perfilado) solo una a una. En las decisiones de la entidad la IA solo explica. El informe indica qué respuestas proceden de una sugerencia aceptada.',
                  'Se non sabes unha resposta, preme «Sugerir respuesta con IA» (ou «Buscar indicios en la documentación» se non hai provedor). A suxestión aparece baixo a pregunta e nunca se aplica soa. A app comproba a cita: «con cita comprobada» pódese aceptar en bloque; «inferida» (sen respaldo, ou calquera «non» sobre prácticas prohibidas, datos sensibles ou perfilado) só unha a unha. Nas decisións da entidade a IA só explica. O informe indica que respostas proceden dunha suxestión aceptada.'
                )}
              </p>

              <h3 style={titulo}>{tx('Privacidad', 'Privacidade')}</h3>
              <ul style={{ margin: '0 0 1rem 1.1rem', color: '#334155' }}>
                <li>{tx('La aplicación no tiene servidor propio: la clave solo se envía al proveedor elegido.', 'A aplicación non ten servidor propio: a clave só se envía ao provedor escollido.')}</li>
                <li>{tx('La clave se borra al cerrar la pestaña, salvo que marque «Recordar». No lo marque en equipos compartidos.', 'A clave bórrase ao pechar a lapela, agás que marque «Lembrar». Non o marque en equipos compartidos.')}</li>
                <li>{tx('Antes de enviar la documentación a un servicio externo para pedir sugerencias, la app pide confirmación.', 'Antes de enviar a documentación a un servizo externo para pedir suxestións, a app pide confirmación.')}</li>
                <li>{tx('Si declara datos de salud o penales y el proveedor es externo, la documentación no se envía al modelo y el informe lo indica.', 'Se declara datos de saúde ou penais e o provedor é externo, a documentación non se envía ao modelo e o informe indícao.')}</li>
                <li>{tx('El historial se guarda solo en este navegador. Borrar los datos del navegador lo elimina: exporte copias desde «Historial».', 'O historial gárdase só neste navegador. Borrar os datos do navegador elimínao: exporte copias desde «Historial».')}</li>
              </ul>
              <Aviso>
                {tx(
                  'En el nivel gratuito de Gemini, Google puede usar las peticiones para mejorar sus productos. No incluya datos personales ni información reservada.',
                  'No nivel gratuíto de Gemini, Google pode usar as peticións para mellorar os seus produtos. Non inclúa datos persoais nin información reservada.'
                )}
              </Aviso>
            </div>
          )}

          {activeTab === 'documentacion' && (
            <div className="animate-fade-in">
              <h3 style={titulo}>{tx('README y AGENTS.md', 'README e AGENTS.md')}</h3>
              <p style={parrafo}>
                {tx(
                  'El README explica qué hace la aplicación y cómo se usa. El AGENTS.md (o CLAUDE.md) explica cómo funciona su IA por dentro: qué modelo usa, sus instrucciones del sistema, qué herramientas puede invocar y a dónde van los datos. Cuanto más completo sea, mejor podrá examinarse la aplicación.',
                  'O README explica que fai a aplicación e como se usa. O AGENTS.md (ou CLAUDE.md) explica como funciona a súa IA por dentro: que modelo usa, as súas instrucións do sistema, que ferramentas pode invocar e a onde van os datos. Canto máis completo sexa, mellor poderá examinarse a aplicación.'
                )}
              </p>
              <div style={{ ...caja, background: '#ecfdf5', borderColor: '#a7f3d0', marginBottom: '1rem' }}>
                <strong style={{ color: '#065f46' }}>{tx('¿No tiene AGENTS.md? No es obligatorio.', 'Non ten AGENTS.md? Non é obrigatorio.')}</strong>{' '}
                <span style={{ color: '#047857' }}>
                  {tx(
                    'Puede usar el asistente de 4 preguntas del paso 1, o pedir a su herramienta de programación (Cursor, Claude, ChatGPT…) que lo redacte con este prompt. Revise siempre el resultado: el AGENTS.md es una declaración, no una comprobación.',
                    'Pode usar o asistente de 4 preguntas do paso 1, ou pedirlle á súa ferramenta de programación (Cursor, Claude, ChatGPT…) que o redacte con este prompt. Revise sempre o resultado: o AGENTS.md é unha declaración, non unha comprobación.'
                  )}
                </span>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '0.625rem 1rem', background: '#f8fafc', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-ink)', textTransform: 'uppercase' }}>
                    {tx('Prompt para generar el AGENTS.md', 'Prompt para xerar o AGENTS.md')}
                  </span>
                  <button type="button" onClick={handleCopyPrompt} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', minHeight: 32 }}>
                    {copiedPrompt ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    <span>{copiedPrompt ? tx('¡Copiado!', 'Copiado!') : tx('Copiar prompt', 'Copiar prompt')}</span>
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '1rem', fontSize: '0.75rem', background: '#1e293b', color: '#f1f5f9', whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
                  {DEVELOPER_AGENTS_MD_PROMPT}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'validez' && (
            <div className="animate-fade-in">
              <h3 style={titulo}>{tx('¿Qué valor tiene el informe?', 'Que valor ten o informe?')}</h3>
              <p style={parrafo}>
                {tx(
                  'El informe que genera la herramienta es un borrador: solo produce efectos en un procedimiento cuando el personal competente lo revisa, lo firma electrónicamente y se incorpora al expediente.',
                  'O informe que xera a ferramenta é un borrador: só produce efectos nun procedemento cando o persoal competente o revisa, o asina electronicamente e se incorpora ao expediente.'
                )}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={caja}>
                  <strong>{tx('1. Revisión:', '1. Revisión:')}</strong>{' '}
                  {tx(
                    'asesoría jurídica, Responsable de Seguridad, Delegado de Protección de Datos y responsable funcional revisan el informe con la lista de comprobación del proyecto (docs/revision-humana.md).',
                    'asesoría xurídica, Responsable de Seguridade, Delegado de Protección de Datos e responsable funcional revisan o informe coa lista de comprobación do proxecto (docs/revision-humana.md).'
                  )}
                </div>
                <div style={caja}>
                  <strong>{tx('2. Huella e identificador interno:', '2. Pegada e identificador interno:')}</strong>{' '}
                  {tx(
                    'el informe incluye la huella SHA-256 de las respuestas (cambia si cambia cualquier respuesta) y el paso 6 calcula la huella del documento y un identificador interno. No es un código seguro de verificación (CSV): el CSV lo asigna la sede electrónica de la entidad.',
                    'o informe inclúe a pegada SHA-256 das respostas (cambia se cambia calquera resposta) e o paso 6 calcula a pegada do documento e un identificador interno. Non é un código seguro de verificación (CSV): o CSV asígnao a sede electrónica da entidade.'
                  )}
                </div>
                <div style={caja}>
                  <strong>{tx('3. Firma con AutoFirma:', '3. Sinatura con AutoFirma:')}</strong>{' '}
                  {tx(
                    'el informe revisado puede firmarse con certificado de empleado público o DNIe (por ejemplo, en formato PAdES sobre su versión PDF).',
                    'o informe revisado pode asinarse con certificado de empregado público ou DNIe (por exemplo, en formato PAdES sobre a súa versión PDF).'
                  )}
                </div>
                <div style={caja}>
                  <strong>{tx('4. Incorporación al expediente:', '4. Incorporación ao expediente:')}</strong>{' '}
                  {tx(
                    'el documento firmado se incorpora al gestor de expedientes, que añade los metadatos del documento electrónico y el CSV (docs/formato-documental.md).',
                    'o documento asinado incorpórase ao xestor de expedientes, que engade os metadatos do documento electrónico e o CSV (docs/formato-documental.md).'
                  )}
                </div>
              </div>
              <p style={{ ...parrafo, marginBottom: 0, fontSize: '0.8125rem' }}>
                {tx(
                  'La guía completa, con problemas frecuentes y glosario, está en docs/guia-de-uso.md del repositorio.',
                  'A guía completa, con problemas frecuentes e glosario, está en docs/guia-de-uso.md do repositorio.'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Pie */}
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
            <strong>Arias Lombardero · Aplicaciones</strong> · {tx('Herramienta de apoyo al diagnóstico', 'Ferramenta de apoio ao diagnóstico')}
          </div>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem', minHeight: 36 }}>
            {tx('Entendido', 'Entendido')}
          </button>
        </div>
      </div>
    </div>
  );
};
