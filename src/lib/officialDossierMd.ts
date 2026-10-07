import type { FullAuditState, AppIdioma, RequirementAssessment } from '../types';
import { applicabilityLabel, obligations, originLabel, prohibitedPractices, requirementsByPillar, resultLabel } from './assessmentModel';
import { computeExecutivePillars, computeExecutiveVerdict } from './dashboardPillars';
import { effectiveDiagnostic } from './validations';
import { describirAsistencia } from './proveedorEfectivo';
import { answerProvenanceRows, PROVENANCE_NOTE } from './answerProvenance';
import { ENGINE_VERSION, NORMATIVE_SNAPSHOT, TRACEABILITY_NOT_COMPUTED, type DocumentTraceability } from './traceability';

/** Escapa los separadores de tabla para que un texto no rompa la tabla Markdown. */
function cell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function requirementBlock(r: RequirementAssessment, idioma: AppIdioma): string {
  const status = r.aplicabilidad === 'no_aplica' ? applicabilityLabel(r.aplicabilidad, idioma) : resultLabel(r.resultado, idioma);
  const exigible = r.exigibleDesde ? ` · Exigible desde ${new Date(r.exigibleDesde).toLocaleDateString('es-ES')}` : '';
  return `### ${r.title} — **${status}**
*${r.norma} · ${r.precepto} · ${originLabel(r.origen, idioma)}${exigible}*

${r.hechos}
${r.resultado === 'acreditado' && r.evidencia ? `\n**Validación:** ${r.revisadoPor} · **Evidencia:** ${r.evidencia}\n` : ''}
**Acción:** ${r.accionRequerida}
`;
}

export function generateOfficialDossierMarkdown(
  state: FullAuditState,
  llmCritique?: string,
  _idioma: AppIdioma = 'castellano',
  traceability?: DocumentTraceability
): string {
  const { ingest, answers, metadata } = state;
  const diagnostic = effectiveDiagnostic(state);
  const dateStr = metadata.auditDate || new Date().toLocaleDateString('es-ES');
  const isGl = _idioma === 'galego';
  const requirements = diagnostic?.requirements || [];
  const pillars = diagnostic ? computeExecutivePillars(diagnostic) : null;
  const verdict = diagnostic ? computeExecutiveVerdict(diagnostic) : null;
  const engineVersion = traceability?.engineVersion || diagnostic?.engineVersion || ENGINE_VERSION;

  return `# INFORME TÉCNICO PRELIMINAR DE ADECUACIÓN NORMATIVA DE SISTEMA DE INTELIGENCIA ARTIFICIAL

**Entidad Promotora:** ${metadata.entityName || 'Administración Pública'}
**Departamento / Servicio:** ${metadata.serviceDepartment || 'Servicio Técnico'}
**Software Evaluado:** "${ingest.appName}"
**Fecha de Emisión:** ${dateStr}
**Marco Normativo de Referencia:**
- Reglamento (UE) 2024/1689 sobre Inteligencia Artificial (RIA), modificado por el Reglamento (UE) 2026/1744 (Ómnibus digital sobre IA)
- Real Decreto 729/2023, de 22 de agosto (Estatuto de la Agencia Española de Supervisión de Inteligencia Artificial - AESIA)
- Ley 15/2022, de 12 de julio, integral para la igualdad de trato y la no discriminación (Art. 23)
- Esquema Nacional de Seguridad (Real Decreto 311/2022 - ENS)
- Ley 40/2015 de Régimen Jurídico del Sector Público (Arts. 32, 36, 41 y 43)
- Reglamento General de Protección de Datos (RGPD UE 2016/679) y Ley Orgánica 3/2018 (LOPDGDD)

> **⚖️ CLÁUSULA DE SALVAGUARDA Y CALIFICACIÓN PRELIMINAR:**
> *${
    isGl
      ? `O presente informe técnico foi xerado mediante unha ferramenta automatizada de diagnóstico (motor v${engineVersion}) a partir do declarado polo promotor. Non é un acto administrativo nin acredita o cumprimento: a cualificación definitiva e a asunción de riscos corresponden ao órgano competente, coa revisión expresa do DPD e do Responsable de Seguridade.`
      : `El presente informe técnico ha sido generado mediante una herramienta automatizada de diagnóstico (motor v${engineVersion}) a partir de lo declarado por el promotor. No es un acto administrativo ni acredita el cumplimiento: la calificación definitiva y la asunción de riesgos corresponden al órgano competente, con la revisión expresa del DPD y del Responsable de Seguridad.`
  }*

---

## 1. RESUMEN EJECUTIVO Y CUADRO DE MANDO

- **Clasificación RIA (preliminar, según lo declarado):** **${diagnostic?.riskLabel || '—'}**
${diagnostic?.isArticle63Derogation ? '- **Régimen declarado:** **Excepción del Art. 6.3 RIA, pendiente de documentar (Art. 6.4) y registrar (Art. 49.2)**\n' : ''}- **Categoría ENS orientativa (RD 311/2022):** **${diagnostic?.ensCategory || '—'}**
- **Régimen de operación declarado (Ley 40/2015):** **${diagnostic?.isAutomatedAdministrativeAct ? 'Actuación administrativa automatizada (Art. 41)' : 'Apoyo técnico con intervención directa de un empleado público'}**

### Cuadro de mando (4 pilares)

| Pilar | Fundamento | Estado / Nivel | Estado de acreditación |
| :--- | :--- | :--- | :--- |
| **I. RIA (UE 2024/1689)** | Arts. 3.1, 5, 6 y 50 RIA | ${cell(diagnostic?.riskLabel || '—')} | ${cell(pillars?.ria.text || '—')} |
| **II. Privacidad y RGPD** | RGPD Arts. 6.1, 9, 10 y 30 / LOPDGDD | ${cell(pillars?.rgpd.label || '—')} | ${cell(pillars?.rgpd.text || '—')} |
| **III. Ciberseguridad ENS** | RD 311/2022, Anexo II | ${cell(pillars?.ens.label || '—')} | ${cell(pillars?.ens.text || '—')} |
| **IV. Gobernanza pública** | Ley 40/2015 Art. 41 / Ley 15/2022 Art. 23 | ${cell(pillars?.gobernanza.label || '—')} | ${cell(pillars?.gobernanza.text || '—')} |

${
  diagnostic?.pericialDissentAlert
    ? `\n> ⚠️ **POSIBLE DISCREPANCIA DE CLASIFICACIÓN (NO VERIFICADA):**  \n> *${diagnostic.pericialDissentAlert}*\n`
    : ''
}

### Conclusión preliminar
${diagnostic?.executiveSummary || 'Diagnóstico no disponible.'}

**${verdict ? `${verdict.label.replace('VEREDICTO: ', '')}.** ${verdict.detail}` : 'Conclusión no disponible.**'}
${
  diagnostic?.redFlags?.length
    ? `
### ${isGl ? 'Alertas para a revisión' : 'Alertas para la revisión'}
${diagnostic.redFlags.map((f) => `- ${f}`).join('\n')}
`
    : ''
}${
  diagnostic?.recommendations?.length
    ? `
### ${isGl ? 'Recomendacións' : 'Recomendaciones'}
${diagnostic.recommendations.map((r) => `- ${r}`).join('\n')}
`
    : ''
}
---

## 2. IDENTIFICACIÓN Y ARQUITECTURA TÉCNICA

- **Denominación:** ${ingest.appName}
- **Objeto funcional:** ${ingest.appDescription || 'No detallado'}
- **Destinatarios principales:** ${ingest.targetAudience}
- **Pila tecnológica declarada:** ${ingest.techStack || 'No especificada'}
- **Documentación aportada:** ${ingest.agentsMdContent?.trim()
  ? 'README.md y AGENTS.md / CLAUDE.md (directivas del agente). Ambos son declaraciones del promotor.'
  : 'README.md (documentación funcional y de usuario).'}
- **Modelo de inferencia (declarado):**
  ${diagnostic?.riskClassification === 'not_ai_system'
    ? 'Software basado en reglas predefinidas, sin modelos de inferencia ni APIs de IA (declarado).'
    : answers.hostingModel === 'local_on_premise'
    ? 'Ejecución local en servidores propios (Ollama / vLLM). No se ha comprobado el proveedor efectivamente utilizado.'
    : answers.hostingModel === 'eu_cloud_dpa'
    ? 'Nube europea con contrato de encargo del tratamiento.'
    : 'Nube internacional: transferencia internacional de datos sujeta a garantías reforzadas.'}
${ingest.agentsMdContent?.trim() ? `
### 2.1. Extracto de las directivas del agente (AGENTS.md / CLAUDE.md)
Declaraciones del promotor; no se ha verificado que el sistema las cumpla en funcionamiento:
\`\`\`markdown
${ingest.agentsMdContent.slice(0, 1200)}${ingest.agentsMdContent.length > 1200 ? '\n... [extracto]' : ''}
\`\`\`
` : ''}

---

## 3. PRÁCTICAS PROHIBIDAS (ART. 5 RIA)

«No evaluado» significa que la herramienta no ha examinado la práctica y que debe confirmarse en la revisión jurídica; «Pendiente» indica un indicio que requiere verificación.

| Práctica (Art. 5 RIA) | Estado | Hechos |
| :--- | :---: | :--- |
${prohibitedPractices(requirements)
  .map((r) => `| **${cell(r.title)}** (${cell(r.precepto)}) | ${resultLabel(r.resultado, _idioma)} | ${cell(r.hechos)} |`)
  .join('\n')}

---

## 4. CLASIFICACIÓN SEGÚN EL RIA (ANEXO III Y EXCEPCIÓN DEL ART. 6.3)

- **Clasificación preliminar, basada en lo declarado:** **${diagnostic?.riskLabel.toUpperCase() || '—'}**

### 4.1. Fundamento
${
  diagnostic?.riskClassification === 'requires_review'
    ? `**Clasificación no concluyente:** ${diagnostic.reviewReasons.join(' ')}`
    : diagnostic?.riskClassification === 'not_ai_system'
    ? `**Nivel 0 - Exclusión del ámbito del RIA:** según lo declarado, el sistema se basa exclusivamente en reglas predefinidas, sin capacidad de inferencia, por lo que no sería un sistema de IA (Art. 3.1 del Reglamento (UE) 2024/1689). En ese caso se rige por la normativa de administración electrónica (Ley 39/2015, Ley 40/2015) y por el ENS.`
    : diagnostic?.riskClassification === 'prohibited'
    ? `**Nivel 1 - Práctica prohibida declarada (Art. 5 RIA):** se ha declarado que el sistema incurre en una práctica prohibida. No puede introducirse en el mercado, ponerse en servicio ni utilizarse; requiere revisión jurídica.`
    : diagnostic?.riskClassification === 'high_risk'
    ? `**Nivel 2 - Alto Riesgo (Art. 6.2 y Anexo III RIA):** según lo declarado, el sistema interviene en un ámbito del Anexo III. Como proveedor: gestión de riesgos (Art. 9), gobernanza de datos (Art. 10), registro de eventos (Art. 12), supervisión humana (Art. 14), evaluación de la conformidad por control interno sin organismo notificado (Art. 43.2 y Anexo VI), marcado CE y registro (Art. 49). Como responsable del despliegue: Art. 26 y evaluación de impacto en los derechos fundamentales (Art. 27). Exigibles para el Anexo III desde el 2 de diciembre de 2027 (Reglamento (UE) 2026/1744).`
    : diagnostic?.isArticle63Derogation
    ? `**Nivel 3 - Excepción del Art. 6.3 RIA:** según lo declarado, el sistema interviene en un ámbito del Anexo III pero se acogería a la excepción del Art. 6.3, que exige que concurra al menos una de sus condiciones a) a d), que no influya sustancialmente en el resultado de la decisión y que no haya perfilado de personas físicas.`
    : diagnostic?.riskClassification === 'minimal_risk'
    ? `**Nivel 5 - Riesgo Mínimo (Art. 95 RIA):** según lo declarado, el sistema no interactúa con personas ni genera contenido sintético; puede adherirse a códigos de conducta voluntarios.`
    : `**Nivel 4 - Riesgo de Transparencia (Art. 50 RIA):** según lo declarado, el sistema interactúa con personas o genera contenido, por lo que debe informar de que se interactúa con una IA y marcar el contenido generado.`
}

${
  diagnostic?.isArticle63Derogation
    ? `### 4.2. Fundamento declarado de la excepción (Art. 6.3 RIA)

> *${diagnostic.article63Justification || 'Sin fundamento declarado.'}*

**Pendiente (Arts. 6.4 y 49.2 RIA):** el proveedor debe documentar su evaluación antes de la puesta en servicio, facilitarla a las autoridades que la soliciten y registrar el sistema en la base de datos de la UE. Este informe recoge lo declarado, pero no sustituye esa documentación ni el registro.`
    : ''
}

### 4.3. Traza de la clasificación
*Corte normativo: ${diagnostic?.normativeVersion || '—'}.*

| Paso | Pregunta | Respuesta | Conclusión | Regla y fuente | Límites |
| :--- | :--- | :--- | :--- | :--- | :--- |
${(diagnostic?.classificationTrace || [])
  .map((s) => `| ${s.id} | ${cell(s.pregunta)} | ${cell(s.respuesta)} | ${cell(s.conclusion)} | ${cell(s.regla)} (${cell(s.fuente)}) | ${cell(s.limites || '—')} |`)
  .join('\n')}

---

## 5. SUPERVISIÓN HUMANA Y MARCO ESTATAL DE GOBERNANZA

- **Supervisión humana (declarada):** ${
    answers.humanOversightLevel === 'pre_execution'
      ? 'previa; los resultados se presentan como borradores que revisa un empleado público antes de producir efectos. No se ha verificado el funcionamiento real del procedimiento.'
      : answers.humanOversightLevel === 'post_execution'
      ? 'posterior; debe verificarse si un empleado público interviene de forma directa antes de que el resultado produzca efectos.'
      : 'sin intervención humana; puede quedar sujeta a la prohibición del Art. 22 RGPD y exige los requisitos del Art. 41 de la Ley 40/2015.'
  }
- **Rol del supervisor (declarado):** ${answers.supervisionRole || 'No indicado'}
- **Deslinde con la actuación administrativa automatizada (Ley 40/2015, Art. 41):**
  ${
    diagnostic?.isAutomatedAdministrativeAct
      ? 'Se ha declarado que el sistema realiza actuaciones administrativas automatizadas, es decir, sin intervención directa de un empleado público. Antes de su puesta en servicio deben establecerse los órganos competentes para la definición de especificaciones, programación, mantenimiento, supervisión, control de calidad y auditoría, y el órgano responsable a efectos de impugnación (Art. 41.2).'
      : 'El promotor declara que un empleado público interviene de forma directa en cada actuación, por lo que no habría actuación administrativa automatizada. Esta afirmación no se ha verificado y debe contrastarse con el funcionamiento real del procedimiento.'
  }
- **Responsabilidad patrimonial:**
  Los particulares exigen directamente a la Administración Pública correspondiente la indemnización de las lesiones causadas por el funcionamiento de los servicios públicos, también cuando intervenga este sistema (Arts. 32.1 y 36.1 de la Ley 40/2015). La Administración solo puede exigir responsabilidad a sus autoridades y personal cuando haya concurrido dolo, o culpa o negligencia graves (Art. 36.2).
- **No discriminación algorítmica (Ley 15/2022, Art. 23):**
  Las administraciones públicas favorecerán mecanismos de minimización de sesgos, transparencia y rendición de cuentas, y se promoverán evaluaciones del posible impacto discriminatorio. No se han aportado evaluaciones de sesgo, por lo que este extremo figura como no evaluado.

---

## 6. MEDIDAS DE SEGURIDAD (ENS, RD 311/2022)

- **Categoría ENS orientativa:** **${diagnostic?.ensCategory || '—'}**
- **Fundamentación:** ${diagnostic?.ensReasoning || '—'}

### 6.1. Medidas del Anexo II relacionadas con el uso de servicios de IA
${requirementsByPillar(requirements, 'ens')
  .map((r, i) => `${i + 1}. **${r.precepto}** — ${resultLabel(r.resultado, _idioma)}: ${r.hechos}`)
  .join('\n')}

---

## 7. OBLIGACIONES Y ESTADO DE ACREDITACIÓN

Solo «Acreditado» equivale a cumplimiento y exige validación humana con evidencia. «Declarado» recoge lo afirmado por el promotor sin comprobar.

${obligations(requirements).map((r) => requirementBlock(r, _idioma)).join('\n')}

### 7.1. Datos declarados en materia de protección de datos
- **Norma competencial declarada:** *${answers.publicCompetenceNorm || 'No indicada'}*. La base jurídica del tratamiento (Art. 6.1 RGPD) debe verificarla el DPD.
- **Tratamiento de datos personales (declarado):** ${answers.processesPersonalData === 'si' ? 'sí' : answers.processesPersonalData === 'no' ? 'no' : 'no consta'}.
- **Actividad del Registro de Actividades de Tratamiento (declarada):** *${answers.ratActivityName || 'No indicada'}*.
- **Categorías especiales de datos (Art. 9 RGPD):** ${answers.processesSpecialCategoryData === 'si' ? 'declarado que SÍ se tratan (exige garantías adicionales y probablemente EIPD).' : answers.processesSpecialCategoryData === 'no' ? 'declarado que NO se tratan.' : 'no consta.'}
- **Datos relativos a condenas e infracciones penales (Art. 10 RGPD):** ${answers.processesCriminalData === 'si' ? 'declarado que SÍ se tratan.' : answers.processesCriminalData === 'no' ? 'declarado que NO se tratan.' : 'no consta.'}

${llmCritique ? `\n---\n\n## 8. ANÁLISIS ASISTIDO POR IA (CONTENIDO NO VERIFICADO)\n\n> *Texto generado por un modelo de lenguaje. Es contenido no verificado: no modifica la clasificación ni acredita requisitos, y sus citas deben comprobarse antes de cualquier uso.*\n\n${llmCritique}\n` : ''}

---

## NOTA SOBRE LAS FUENTES Y TRAZABILIDAD DEL DOCUMENTO

${
  isGl
    ? `Os preceptos citados proceden da base de coñecemento da ferramenta (${NORMATIVE_SNAPSHOT}). Non se verificou a súa vixencia no momento de emitir este documento: debe comprobarse no BOE e en EUR-Lex antes de calquera uso.`
    : `Los preceptos citados proceden de la base de conocimiento de la herramienta (${NORMATIVE_SNAPSHOT}). No se ha verificado su vigencia en el momento de emitir este documento: debe comprobarse en el BOE y en EUR-Lex antes de cualquier uso.`
}

- **Versión del motor:** ${engineVersion}
- **Huella SHA-256 de las entradas (ingesta y entrevista):** ${traceability?.inputFingerprint || TRACEABILITY_NOT_COMPUTED} (permite comprobar que dos documentos parten de las mismas entradas; no acredita la integridad del documento)
- **Fecha de generación:** ${traceability?.generatedAt || TRACEABILITY_NOT_COMPUTED}
- **Asistencia de IA:** ${describirAsistencia(diagnostic?.aiAssistance)}

### ${isGl ? 'Orixe das respostas' : 'Origen de las respuestas'}
${(() => {
  const filas = answerProvenanceRows(state);
  if (!filas.length) return isGl ? 'Todas as respostas introduciunas a persoa usuaria.' : 'Todas las respuestas las introdujo la persona usuaria.';
  return `| Pregunta | Respuesta | Origen | Respaldo |\n| :--- | :--- | :--- | :--- |\n${filas.map((f) => `| ${f.pregunta} | ${f.respuesta} | ${f.origen} | ${f.respaldo.replace(/\|/g, '/')} |`).join('\n')}\n\n*${PROVENANCE_NOTE}*`;
})()}

---

## REVISIÓN Y FIRMA

> *El presente documento es un informe técnico preliminar generado con una herramienta automatizada. No es un acto administrativo ni una actuación administrativa automatizada. Solo adquiere valor cuando lo revisan y firman los responsables competentes, que pueden modificar o rechazar sus conclusiones (firma electrónica del personal, Art. 43 de la Ley 40/2015).*

| EL RESPONSABLE FUNCIONAL | EL RESPONSABLE DE SEGURIDAD (ENS) | EL DELEGADO DE PROTECCIÓN DE DATOS |
| :---: | :---: | :---: |
| *(Firma electrónica)* | *(Firma electrónica)* | *(Firma electrónica)* |
| **${metadata.functionalResponsible || 'Dirección de Servicio'}** | **${metadata.cisoContact || 'Responsable de Seguridad'}** | **${metadata.dpoContact || 'DPD'}** |
| ${metadata.serviceDepartment} | Centro de Sistemas y Ciberseguridad | Oficina de Protección de Datos |
`;
}
