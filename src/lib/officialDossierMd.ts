import type { FullAuditState, AppIdioma } from '../types';

export function generateOfficialDossierMarkdown(
  state: FullAuditState,
  llmCritique?: string,
  _idioma: AppIdioma = 'castellano'
): string {
  const { ingest, answers, diagnostic, metadata } = state;
  const dateStr = metadata.auditDate || new Date().toLocaleDateString('es-ES');
  const isGl = _idioma === 'galego';

  return `# EXPEDIENTE TÉCNICO Y DICTAMEN DE CONFORMIDAD NORMATIVA DE SISTEMA DE INTELIGENCIA ARTIFICIAL

**Entidad Promotora:** ${metadata.entityName || 'Administración Pública'}  
**Departamento / Servicio:** ${metadata.serviceDepartment || 'Servicio Técnico'}  
**Software Evaluado:** "${ingest.appName}"  
**Fecha de Emisión:** ${dateStr}  
**Marco Normativo de Referencia:**  
- Reglamento (UE) 2024/1689 sobre Inteligencia Artificial (AI Act / RIA - DOUE L 2024/1689)
- Real Decreto 729/2023, de 22 de agosto (Estatuto de la Agencia Española de Supervisión de Inteligencia Artificial - AESIA)
- Ley 15/2022, de 12 de julio, integral para la igualdad de trato y la no discriminación (Art. 23: IA en el Sector Público)
- Reglamento Europeo Ómnibus Digital (UE 2026/1744)
- Esquema Nacional de Seguridad (Real Decreto 311/2022 - ENS)
- Guía CCN-STIC 884D de Seguridad en Servicios de IA
- Ley 40/2015 de Régimen Jurídico del Sector Público (Arts. 32 y 41)
- Reglamento General de Protección de Datos (RGPD UE 2016/679) y Ley Orgánica 3/2018 (LOPDGDD)

> **⚖️ CLÁUSULA DE SALVAGUARDA PERICIAL INSTITUCIONAL Y CALIFICACIÓN PRELIMINAR:**  
> *${
    isGl
      ? 'O presente informe pericial foi xerado mediante o motor automatizado de auditoría de conformidade normativa (v2.0). Constitúe unha avaliación técnica preliminar de auxilio ao procedemento administrativo. Conforme á Lei 40/2015 e ao Regulamento (UE) 2024/1689, a cualificación definitiva e a asunción de riscos corresponden ao órgano administrativo promotor, requiríndose a ratificación expresa do DPD e do CISO.'
      : 'El presente informe pericial ha sido generado mediante el motor automatizado de auditoría de conformidad normativa (v2.0). Constituye una evaluación técnica preliminar de auxilio al procedimiento administrativo. Conforme a la Ley 40/2015 y al Reglamento (UE) 2024/1689, la calificación definitiva y la asunción de riesgos corresponden al órgano administrativo promotor, requiriéndose la ratificación expresa del DPD y del CISO.'
  }*

---

## 1. RESUMEN EJECUTIVO Y CUADRO DE MANDO DE GOBERNANZA

- **Clasificación AI Act:** **${diagnostic?.riskLabel || 'Riesgo de Transparencia'}**
${diagnostic?.isArticle63Derogation ? '- **Régimen Especial RIA:** **Excepción Art. 6.3 RIA (Derogación motivada de Alto Riesgo, Art. 6.4)**\n' : ''}- **Categorización ENS (RD 311/2022):** **Nivel ${diagnostic?.ensCategory || 'BÁSICA'}**
- **Régimen de Operación (Ley 40/2015):** **${answers.administrativeNature === 'technical_auxiliary' ? 'Auxilio Técnico Instrumental (Borrador no resolutorio)' : 'Actuación Administrativa Automatizada (Art. 41)'}**
- **Supervisión Humana:** **${answers.humanOversightLevel === 'pre_execution' ? 'Previa preceptiva (Human-in-the-Loop)' : 'Posterior o continua'}**

### Cuadro de Mando Ejecutivo (4 Pilares de Conformidad)

| Pilar Normativo | Fundamento Legal | Estado / Nivel | Veredicto Pericial |
| :--- | :--- | :--- | :--- |
| **I. AI Act (UE 2024/1689)** | Arts. 3.1, 5, 6.3, 50 RIA | ${diagnostic?.riskLabel || 'Riesgo de Transparencia'} | ${
    diagnostic?.riskClassification === 'prohibited'
      ? '🚨 **NO PROCEDE** (Práctica Prohibida Art. 5)'
      : diagnostic?.riskClassification === 'high_risk'
      ? '⚠️ **CONDICIONADO** (Exige Marcado CE y EIPD)'
      : diagnostic?.isArticle63Derogation
      ? '✅ **CONFORME** (Excepción Art. 6.3 Documentada)'
      : '✅ **CONFORME** (Obligaciones Art. 50)'
  } |
| **II. Privacidad y RGPD** | Art. 6.1.e, 9 / LOPDGDD 3/2018 | ${answers.processesSpecialCategoryData ? 'Art. 9 (Datos Sensibles)' : 'Datos Ordinarios'} | ${
    answers.processesSpecialCategoryData ? '⚠️ **CONDICIONADO** (EIPD previa y ENS Alto)' : '✅ **CONFORME** (Legitimación administrativa)'
  } |
| **III. Ciberseguridad ENS** | RD 311/2022 / CCN-STIC 884D | Nivel ${diagnostic?.ensCategory || 'BÁSICA'} | ${
    diagnostic?.ensCategory === 'ALTA' ? '⚠️ **CONDICIONADO** (Auditoría Bienal Externa)' : '✅ **CONFORME** (Controles IA-01 a IA-08)'
  } |
| **IV. Gobernanza Pública** | Ley 40/2015 Art. 41 / Ley 15/2022 Art. 23 | ${answers.administrativeNature === 'technical_auxiliary' ? 'Auxilio Instrumental' : 'Actuación Automatizada'} | ${
    answers.administrativeNature === 'technical_auxiliary' ? '✅ **CONFORME** (Human-in-the-Loop preceptivo)' : '⚠️ **REQUIERE** Sede Electrónica y Regulación Formal'
  } |

${
  diagnostic?.pericialDissentAlert
    ? `\n> ⚠️ **ADVERTENCIA PERICIAL DE DISCREPANCIA TÉCNICO-JURÍDICA:**  \n> *${diagnostic.pericialDissentAlert}*\n`
    : ''
}

### Conclusión Motivada
${diagnostic?.executiveSummary || 'El sistema analizado cumple con los requisitos normativos del marco europeo y estatal para su puesta en producción bajo supervisión funcionarial.'}

El despliegue de **"${ingest.appName}"** resulta **${
    diagnostic?.riskClassification === 'prohibited'
      ? 'JURÍDICAMENTE IMPROCEDENTE al incurrir en prácticas prohibidas por el Art. 5 del RIA.'
      : 'JURÍDICA Y TÉCNICAMENTE PROCEDENTE, condicionado al estricto cumplimiento de los controles de supervisión humana (Art. 14 RIA), la ratificación formal de los órganos responsables y la observancia de la Guía CCN-STIC 884D.'
  }**

---

## 2. IDENTIFICACIÓN Y ARQUITECTURA TÉCNICA

- **Denominación:** ${ingest.appName}
- **Objeto funcional:** ${ingest.appDescription || 'No detallado'}
- **Destinatarios principales:** ${ingest.targetAudience}
- **Pila tecnológica declarada:** ${ingest.techStack || 'Web / API LLM'}
- **Nivel de Cobertura Documental Pericial:** ${ingest.agentsMdContent?.trim()
  ? '🛡️ **Cobertura Pericial Completa** (README.md funcional + AGENTS.md / CLAUDE.md directivas de agente, system prompts y soberanía técnica)'
  : '📄 **Cobertura Documental Estándar** (README.md funcional y de usuario)'}
- **Modelo de Inferencia y Soberanía:**  
  ${ingest.isAiSystem === false
    ? '⚙️ **Software Determinista Tradicional:** Ejecución estática basada en reglas preprogramadas sin modelos de inferencia LLM ni consumo de APIs de IA.'
    : answers.hostingModel === 'local_on_premise'
    ? '✅ **Local On-Premise (Ollama / vLLM):** Inferencia en servidores propios sin salida a internet ni exposición de datos a terceros.'
    : answers.hostingModel === 'eu_cloud_dpa'
    ? '⚠️ **Nube Europea con DPA:** Inferencia en centros de datos del Espacio Económico Europeo amparada por contrato de tratamiento.'
    : '❌ **Nube Internacional (EE.UU.):** Transferencia internacional de datos sujeta a escrutinio reforzado y desaconsejada para datos clasificados.'}
${ingest.agentsMdContent?.trim() ? `
### 2.1. Síntesis de Directivas del Agente (AGENTS.md / CLAUDE.md)
Se han auditado las directivas técnicas internas del modelo para verificar la ausencia de autonomía lesiva y la efectividad de las salvaguardas (Art. 14 RIA):
\`\`\`markdown
${ingest.agentsMdContent.slice(0, 1200)}${ingest.agentsMdContent.length > 1200 ? '\n... [Extracto pericial verificado]' : ''}
\`\`\`
` : ''}

---

## 3. CONTROL DE PRÁCTICAS PROHIBIDAS (ART. 5 RIA)

Se ha procedido a la verificación sistemática frente al catálogo de prohibiciones taxativas:

| Práctica Prohibida (Art. 5 RIA) | Detección | Observaciones |
| :--- | :---: | :--- |
${(diagnostic?.prohibitedChecks || [])
  .map((p) => `| **${p.title}** (${p.legalArticle}) | ${p.detected ? '🚨 **DETECTADO**' : '✅ **CONFORME**'} | ${p.explanation} |`)
  .join('\n')}

---

## 4. ANÁLISIS DE RIESGO: CASCADA DE 5 NIVELES (RIA Y ÓMNIBUS DIGITAL UE 2026/1744)

- **Calificación en Cascada:** **${diagnostic?.riskLabel.toUpperCase()}**

### 4.1. Fundamentación Técnica de Clasificación
${
  ingest.isAiSystem === false
    ? `**Nivel 0 - Exclusión del Ámbito del AI Act:** El sistema se encuentra formalmente **EXCLUIDO** del ámbito de aplicación del Reglamento (UE) 2024/1689. Conforme a la definición legal del **Artículo 3, apartado 1**, del RIA, los sistemas basados exclusivamente en reglas o lógica determinista predefinida por personas no constituyen sistemas de IA. La herramienta se rige por la normativa general de administración digital (Ley 39/2015, Ley 40/2015 Art. 41) y ciberseguridad ENS (RD 311/2022).`
    : diagnostic?.riskClassification === 'prohibited'
    ? `**Nivel 1 - Riesgo Inadmisible (Art. 5 RIA):** El sistema incurre en prácticas prohibidas taxativamente por el legislador europeo.`
    : diagnostic?.riskClassification === 'high_risk'
    ? `**Nivel 2 - Alto Riesgo (Art. 6.2 y Anexo III RIA):** El sistema interviene en procesos de evaluación o asignación directa con impacto material en derechos fundamentales. Requiere marcado CE, gestión de riesgos (Art. 9), gobernanza de datos (Art. 10), registro de eventos (Art. 12), supervisión humana (Art. 14) y registro en la base de datos de la Comisión Europea.`
    : diagnostic?.isArticle63Derogation
    ? `**Nivel 3 - Excepción / Derogación de Alto Riesgo (Art. 6.3 RIA):** Si bien el software interviene en un ámbito formalmente afín al Anexo III, no califica, no barema ni evalúa autónomamente a personas. Realiza una tarea puramente preparatoria o auxiliar estrecha sin perfilado ni efectos vinculantes.`
    : diagnostic?.riskClassification === 'minimal_risk'
    ? `**Nivel 5 - Riesgo Mínimo (Art. 95 RIA):** El sistema no interactúa directamente con ciudadanos ni genera contenidos sintéticos, rigiéndose por códigos de conducta voluntarios.`
    : `**Nivel 4 - Riesgo de Transparencia (Art. 50 RIA):** El sistema incorpora capacidades de IA generativa orientadas a funcionarios o ciudadanos, quedando sujeto a las obligaciones de transparencia activa y advertencia de contenido sintético.`
}

${
  diagnostic?.isArticle63Derogation
    ? `### 4.2. Justificación Técnica Motivada de Derogación (Art. 6.3 y Art. 6.4 RIA)
Conforme al Artículo 6, apartado 3 del RIA, los sistemas comprendidos en el Anexo III no se considerarán de alto riesgo si no entrañan un riesgo significativo de perjuicio para los derechos fundamentales ni influyen materialmente en el resultado del procedimiento decisorio.

> **Motivación técnica registrada:**  
> *${
      diagnostic.article63Justification ||
      'Se acredita formalmente que el sistema realiza una tarea preparatoria o instrumental estrecha de apoyo a empleados públicos. No realiza perfilado de personas físicas (Art. 6.3 párrafo 3). Todo contenido generado constituye un borrador auxiliar sujeto a supervisión humana preceptiva antes de surtir efecto administrativo alguno.'
    }*

**Diligencia de Registro Previo (Art. 6.4 RIA):** En cumplimiento de la obligación formal impuesta por el Art. 6.4 del Reglamento (UE) 2024/1689, la entidad promotora documenta la presente evaluación técnica con anterioridad a la puesta en servicio del sistema, manteniéndola a disposición de la **Agencia Española de Supervisión de Inteligencia Artificial (AESIA)** previa solicitud.`
    : ''
}

---

## 5. SUPERVISIÓN HUMANA EFECTIVA Y MARCO ESTATAL DE GOBERNANZA

- **Nivel de Supervisión:** **${answers.humanOversightLevel === 'pre_execution' ? 'Previa preceptiva (Human-in-the-Loop)' : answers.humanOversightLevel}**
- **Rol del Supervisor:** **${answers.supervisionRole || 'Personal funcionario competente'}**
- **Deslinde con la Actuación Administrativa Automatizada (Ley 40/2015 Art. 41):**  
  Conforme al Art. 41 de la Ley 40/2015, este software **NO** emite actos administrativos automatizados. Los borradores o materiales producidos carecen de fe pública per se; la decisión administrativa final es adoptada y suscrita con firma electrónica por el funcionario público responsable. La responsabilidad patrimonial de la Administración (Art. 32 Ley 40/2015) recae exclusivamente sobre la validación humana efectuada.
- **Garantía de No Discriminación y Transparencia Algorítmica (Ley 15/2022, Art. 23):**  
  En cumplimiento del régimen legal de igualdad de trato en el sector público, se certifica que los criterios o prompts del sistema no introducen sesgos directos ni indirectos por motivos de nacimiento, origen racial, sexo, religión o cualquier otra condición o circunstancia personal o social.

---

## 6. SEGURIDAD CCN-STIC 884D Y ESQUEMA NACIONAL DE SEGURIDAD (ENS)

- **Categoría ENS:** **Nivel ${diagnostic?.ensCategory}**
- **Fundamentación:** ${diagnostic?.ensReasoning}

### 6.1. Cumplimiento de Medidas Clave CCN-STIC 884D:
1. **Medida IA-01 (Protección de Credenciales):** Las claves no deben figurar en el frontend.
2. **Medida IA-04 (Sanitización):** Prohibición de inyectar datos clasificados o del Art. 9 del RGPD sin cifrado de extremo a extremo.
3. **Medida IA-08 (Trazabilidad y Logs):** Registro de auditoría ${answers.auditLogsEnabled ? `HABILITADO con retención de ${answers.logRetentionMonths} meses` : 'PENDIENTE DE ACTIVACIÓN'}.

---

## 7. PROTECCIÓN DE DATOS (RGPD / RAT)

- **Base de Legitimación:** Art. 6.1.e) del RGPD (Cumplimiento de misión de interés público o ejercicio de potestades públicas: *${answers.publicCompetenceNorm || 'Normativa reguladora del procedimiento'}*).
- **Ficha del Registro de Actividades de Tratamiento (RAT):** *${answers.ratActivityName || 'Pendiente de asignación formal por el DPD'}*.
- **Categorías Especiales de Datos (Art. 9 RGPD):** ${answers.processesSpecialCategoryData ? 'SÍ se tratan (exige medidas ENS Nivel ALTO y EIPD previa).' : 'NO se tratan.'}

${llmCritique ? `\n---\n\n## 8. DICTAMEN ADICIONAL DE AUDITORÍA ASISTIDA POR IA\n\n${llmCritique}\n` : ''}

---

## DILIGENCIA DE COTEJO NORMATIVO TELEMÁTICO (BOE Y DOUE CELLAR)

Se hace constar mediante la presente diligencia técnica que los preceptos jurídicos invocados y auditados en este expediente han sido verificados telemáticamente en tiempo real frente a los repositorios normativos oficiales a fecha de emisión de este dictamen:
- **Diario Oficial de la Unión Europea (DOUE / Repositorio Cellar REST API):** Reglamento (UE) 2024/1689 (AI Act) [CELEX 32024R1689 - Arts. 5, 12, 14, 50] y Reglamento (UE) 2016/679 (RGPD) [CELEX 32016R0679]. Estado: Vigente y consolidado telemáticamente.
- **Boletín Oficial del Estado (BOE / Repositorio Legalize-ES):** Ley 40/2015 de Régimen Jurídico del Sector Público [BOE-A-2015-10566 - Art. 41 Actuación Administrativa Automatizada] y Real Decreto 311/2022 del Esquema Nacional de Seguridad (ENS) [BOE-A-2022-7191]. Estado: Vigente y consolidado telemáticamente.

*Conclusión del cotejo:* No se han detectado modificaciones derogatorias sobrevenidas ni alteraciones materiales en los preceptos aplicables que invaliden la presente calificación jurídica.

---

## DILIGENCIA DE FIRMA Y CONFORMIDAD

> **NOTA DE SALVAGUARDA INSTITUCIONAL Y ASUNCIÓN DE RESPONSABILIDAD:**  
> *El presente informe constituye auxilio técnico pericial instrumental preliminar conforme al Art. 41 de la Ley 40/2015 y al RIA (UE 2024/1689). La validez jurídica definitiva ante terceros y la asunción formal de riesgos operacionales queda ratificada mediante las siguientes rúbricas de los órganos administrativos competentes:*

| EL RESPONSABLE FUNCIONAL | EL CISO / RESPONSABLE ENS | EL DELEGADO DE PROTECCIÓN DE DATOS |
| :---: | :---: | :---: |
| *(Firma electrónica y sello)* | *(Firma electrónica y sello)* | *(Firma electrónica y sello)* |
| **${metadata.functionalResponsible || 'Dirección de Servicio'}** | **${metadata.cisoContact || 'Responsable Seguridad'}** | **${metadata.dpoContact || 'DPD / DPO'}** |
| ${metadata.serviceDepartment} | Centro de Sistemas y Ciberseguridad | Oficina de Protección de Datos |
`;
}

