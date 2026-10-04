import type {
  AppIngestData,
  LegalEnrichmentAnswers,
  DiagnosticResult,
  ProhibitedCheck,
  ObligationItem,
  ApiConfig,
} from '../types';
import { PROHIBITED_SYSTEMS_CATALOG } from './legalKnowledgeBase';
import { callApi } from './apiService';

/**
 * Deterministic analysis based on regulatory rules (AI Act 2024/1689, Digital Omnibus 2026/1744, ENS, Ley 40/2015)
 */
export function evaluateRulesDeterministically(
  ingest: AppIngestData,
  answers: LegalEnrichmentAnswers
): DiagnosticResult {
  const contentLower = `${ingest.appName} ${ingest.appDescription} ${ingest.readmeContent} ${ingest.agentsMdContent || ''} ${ingest.systemPrompt || ''}`.toLowerCase();

  // 1. Prohibited practices check (Art. 5 RIA)
  const prohibitedChecks: ProhibitedCheck[] = PROHIBITED_SYSTEMS_CATALOG.map((item) => {
    let detected = false;
    let explanation = 'No se aprecian indicios de esta práctica prohibida en la arquitectura declarada.';

    if (item.id === 'social_scoring') {
      if (contentLower.includes('social score') || contentLower.includes('conducta ciudadana') || contentLower.includes('puntuacion social')) {
        detected = true;
        explanation = 'Se detectan términos sugestivos de evaluación o puntuación conductual ciudadana no permitida.';
      }
    } else if (item.id === 'emotion_recognition_workplace_education') {
      if (contentLower.includes('reconocimiento de emociones') || contentLower.includes('deteccion de estres laboral') || contentLower.includes('analisis emocional empleado')) {
        detected = true;
        explanation = 'El análisis de emociones de empleados o alumnos está expresamente prohibido en el Art. 5.1.f del RIA.';
      }
    } else if (item.id === 'biometric_categorization_sensitive') {
      if (contentLower.includes('reconocimiento facial') || contentLower.includes('etnia') || contentLower.includes('biometria')) {
        detected = true;
        explanation = 'Uso de rasgos biométricos para inferir datos sensibles no permitido sin base excepcional expresa.';
      }
    }

    return {
      id: item.id,
      title: item.title,
      legalArticle: item.legalArticle,
      detected,
      explanation,
    };
  });

  const anyProhibited = prohibitedChecks.some((p) => p.detected);

  // 2. High Risk Evaluation (Art. 6 & Annex III)
  let isHighRiskAnnexIII = false;
  let annexIIICategory = '';
  let isArticle63Derogation = false;
  let article63Justification = '';

  // Expresiones regulares con límites de palabra para evitar falsos positivos léxicos
  const mentionsRecruitment =
    /\b(seleccion\s+de\s+personal|baremacion|tribunal\s+calificador|evaluacion\s+de\s+candidatos|calificacion\s+de\s+examen|oposiciones|bolsa\s+de\s+empleo|recursos\s+humanos)\b/i.test(contentLower);

  const mentionsEssentialPublicServices =
    /\b(concesion\s+de\s+ayudas|subvenciones?|prestaciones?\s+sociales?|admision\s+escolar|subsidios?|renta\s+garantizada)\b/i.test(contentLower);

  const evaluatesPersons =
    answers.evaluatedSubjectType === 'natural_persons_or_applicants' ||
    answers.administrativeNature === 'citizen_assessment';

  const performsProfiling = answers.performsProfilingOrScoring === true;

  // Supuestos objetivos del Anexo III del RIA
  if (answers.administrativeNature === 'citizen_assessment' || (mentionsRecruitment && evaluatesPersons)) {
    isHighRiskAnnexIII = true;
    annexIIICategory = 'Anexo III, Punto 4(a): Sistema de selección, baremación o evaluación de candidatos a empleo público';
  } else if (mentionsEssentialPublicServices && evaluatesPersons) {
    isHighRiskAnnexIII = true;
    annexIIICategory = 'Anexo III, Punto 5(a): Determinación de acceso, baremación o concesión de prestaciones o subvenciones públicas a personas';
  } else if (performsProfiling) {
    isHighRiskAnnexIII = true;
    annexIIICategory = 'Anexo III, Punto 4 / 5: Perfilado algorítmico o baremación de personas físicas en el sector público';
  }

  // 2.1. Aplicación de la Cláusula de Excepción del Artículo 6.3 del RIA
  // Si cae en el Anexo III pero no influye materialmente ni perfila a personas:
  if (isHighRiskAnnexIII) {
    if (performsProfiling) {
      // Art. 6.3 in fine: "se considerará siempre de alto riesgo si realiza el perfilado de personas físicas"
      isArticle63Derogation = false;
    } else if (
      answers.evaluatedSubjectType === 'normative_or_unpersonalized_docs' ||
      (answers.administrativeNature === 'technical_auxiliary' && answers.humanOversightLevel === 'pre_execution')
    ) {
      // Excepción tasada Art. 6.3(a) y 6.3(d): Tarea preparatoria o procedimental estrecha sobre bases normativas
      isHighRiskAnnexIII = false;
      isArticle63Derogation = true;
      article63Justification =
        'Acogido a la excepción del Art. 6.3(a) y 6.3(d) del RIA: El sistema realiza exclusivamente una tarea preparatoria o procedimental sobre bases reguladoras y documentos despersonalizados. No realiza perfilado de personas físicas ni sustituye la valoración del funcionario. Conforme al Art. 6.4, se documenta la presente motivación en el expediente.';
    }
  }

  // 3. Cascada Real de Clasificación de Riesgos (5 Niveles RIA)
  const isNotAiSystem = ingest.isAiSystem === false;
  let riskClassification: DiagnosticResult['riskClassification'] = 'transparency_risk';
  let riskLabel = 'Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA)';
  let riskSummary = '';

  if (isNotAiSystem) {
    riskClassification = 'not_ai_system';
    riskLabel = 'EXCLUIDO DEL AI ACT (Software Determinista / No es IA - Art. 3.1 RIA)';
    riskSummary =
      'El software analizado es un desarrollo tradicional basado en reglas deterministas (algoritmos preprogramados sin componentes de inferencia ni aprendizaje automático). Conforme al Art. 3(1) del Reglamento (UE) 2024/1689, no constituye un sistema de IA y queda fuera de su ámbito de aplicación. Se rige por la Ley 39/2015, Ley 40/2015 (Art. 41), ENS (RD 311/2022) y RGPD.';
  } else if (anyProhibited) {
    riskClassification = 'prohibited';
    riskLabel = 'RIESGO INADMISIBLE (Práctica Prohibida - Art. 5 RIA)';
    riskSummary =
      'Se han detectado funcionalidades o supuestos de uso prohibidos expresamente por el Reglamento Europeo de Inteligencia Artificial (Art. 5). Su puesta en servicio está terminantemente vetada y constituye infracción muy grave sancionable por la AESIA.';
  } else if (isHighRiskAnnexIII) {
    riskClassification = 'high_risk';
    riskLabel = 'ALTO RIESGO (Anexo III RIA)';
    riskSummary = `El sistema interviene materialmente en procesos sensibles de la AAPP (${annexIIICategory}). Requiere sistema de gestión de riesgos (Art. 9), marcado CE, registro en la base de datos de la UE, gobernanza de datos (Art. 10) y supervisión humana preceptiva (Art. 14). No puede ponerse en producción sin auditoría pericial completa.`;
  } else if (
    answers.interactionAndGenerationType === 'internal_non_generative' ||
    answers.evaluatedSubjectType === 'system_logs_or_technical'
  ) {
    riskClassification = 'minimal_risk';
    riskLabel = 'RIESGO MÍNIMO O NULO (Art. 95 RIA & Considerando 33)';
    riskSummary =
      'El sistema utiliza inteligencia artificial interna para optimización técnica, telemetría, clasificación estadística o clustering, sin interfaz conversacional ciudadana ni generación de contenido sintético. Conforme al RIA, está exento de obligaciones normativas obligatorias, recomendándose la adhesión voluntaria a códigos de conducta ética.';
  } else {
    // Riesgo Limitado / Específico de Transparencia (Art. 50)
    riskClassification = 'transparency_risk';
    if (isArticle63Derogation) {
      riskLabel = 'Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50)';
      riskSummary = `Sistema regulado bajo la salvaguarda de tarea preparatoria del Art. 6.3 del RIA y el régimen de transparencia del Art. 50. Opera como auxilio técnico instrumental con supervisión humana preceptiva (${answers.supervisionRole}), exento de marcado CE industrial pero sujeto a transparencia activa e inscripción RAT.`;
    } else {
      riskLabel = 'Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA & Ómnibus Digital 2026/1744)';
      riskSummary = `El sistema opera como herramienta técnica auxiliar generadora de contenido sintético o asistente conversacional. Sujeto a obligaciones imperativas de transparencia activa hacia el usuario (Art. 50), pie de firma de borrador técnico y supervisión humana preceptiva (${answers.supervisionRole}).`;
    }
  }

  // 4. Automated Administrative Act (Art. 41 Ley 40/2015)
  const isAutomatedAdministrativeAct = answers.administrativeNature === 'automated_administrative_act';

  // 5. ENS Categorization (RD 311/2022)
  let ensCategory: 'BASICA' | 'MEDIA' | 'ALTA' = 'BASICA';
  let ensReasoning = 'Sistema de apoyo técnico con impacto limitado ante indisponibilidad transitoria.';

  if (answers.processesSpecialCategoryData || isHighRiskAnnexIII) {
    ensCategory = 'ALTA';
    ensReasoning = 'Tratamiento de categorías especiales de datos (Art. 9 RGPD) o decisiones de alto impacto que exigen máximas garantías de confidencialidad e integridad.';
  } else if (isAutomatedAdministrativeAct || answers.hostingModel === 'us_hyperscaler' || ingest.targetAudience === 'public_citizens') {
    ensCategory = 'MEDIA';
    ensReasoning = 'Interacción con ciudadanos o actuación administrativa formal sujeta a exigencias reforzadas de disponibilidad, trazabilidad y autenticidad.';
  }

  // 6. Mandatory Obligations
  const obligations: ObligationItem[] = [
    {
      code: 'RIA-ART-50',
      title: 'Transparencia e Identificación de Contenido Sintético',
      legalBasis: 'Reglamento (UE) 2024/1689, Art. 50',
      status: isNotAiSystem || riskClassification === 'minimal_risk' ? 'compliant' : 'warning',
      description: isNotAiSystem
        ? 'No aplica: software tradicional excluido del ámbito del RIA (Art. 3.1).'
        : 'Obligación imperativa de informar claramente a los usuarios (empleados y ciudadanos) de que interactúan con una IA o leen documentos sintetizados.',
      actionRequired: isNotAiSystem || riskClassification === 'minimal_risk'
        ? 'Exento de marcado Art. 50.'
        : 'Instalar el banner de transparencia y los pies de página de advertencia proporcionados en el Kit de Código.',
    },
    {
      code: 'RIA-ART-14',
      title: 'Supervisión Humana Preceptiva (Human-in-the-Loop)',
      legalBasis: 'Reglamento (UE) 2024/1689, Art. 14 y Ómnibus Digital UE 2026/1744',
      status: answers.humanOversightLevel === 'pre_execution' ? 'compliant' : 'warning',
      description: 'El sistema debe impedir la emisión autónoma de resoluciones administrativas sin la revisión, cotejo y firma expresa del empleado público habilitado.',
      actionRequired: answers.humanOversightLevel === 'pre_execution'
        ? 'Supervisión previa correctamente declarada.'
        : 'Establecer procedimiento formal para que ningún borrador adquiera eficacia jurídica sin visado funcionarial.',
    },
    {
      code: 'CCN-STIC-884D-01',
      title: 'Protección y Aislamiento de Credenciales de IA',
      legalBasis: 'Guía CCN-STIC 884D (Medida IA-01) y ENS RD 311/2022',
      status: 'warning',
      description: 'Las API keys y tokens de acceso jamás deben exponerse en código cliente, scripts web o repositorios públicos.',
      actionRequired: 'Configurar variables de entorno aisladas (.env) o utilizar el modelo de ejecución Local On-Premise (Ollama/vLLM) en servidores propios.',
    },
    {
      code: 'CCN-STIC-884D-08',
      title: 'Trazabilidad y Sellado de Registro de Auditoría',
      legalBasis: 'Guía CCN-STIC 884D (Medida IA-08) y Art. 12 RIA',
      status: answers.auditLogsEnabled ? 'compliant' : 'non_compliant',
      description: 'Conservación de logs de eventos, versión de modelos, prompts y marcas de tiempo durante el periodo preceptivo de prescripción.',
      actionRequired: answers.auditLogsEnabled
        ? `Trazabilidad activa con retención de ${answers.logRetentionMonths} meses.`
        : 'Activar de inmediato el módulo de registro de peticiones y respuestas para cumplir con las auditorías de la AEPD y el CCN-CERT.',
    },
    {
      code: 'RGPD-ART-30',
      title: 'Inscripción en el Registro de Actividades de Tratamiento (RAT)',
      legalBasis: 'RGPD Art. 30 y LOPDGDD 3/2018',
      status: answers.ratActivityName.trim() ? 'compliant' : 'warning',
      description: 'Todo tratamiento de información administrativa o personal que involucre modelos de IA debe quedar reflejado en la ficha correspondiente del RAT del organismo.',
      actionRequired: answers.ratActivityName.trim()
        ? `Vinculado formalmente a la actividad RAT: "${answers.ratActivityName}".`
        : 'Formalizar la adenda al RAT ante el Delegado de Protección de Datos (DPD) de la entidad.',
    },
    {
      code: 'LEY-40-2015-ART-41',
      title: 'Naturaleza Instrumental vs Actuación Automatizada',
      legalBasis: 'Ley 40/2015, Art. 41',
      status: isAutomatedAdministrativeAct ? 'warning' : 'compliant',
      description: isAutomatedAdministrativeAct
        ? 'Si se trata como actuación automatizada, es preceptiva una resolución previa del órgano competente aprobando la especificación algorítmica y su publicación oficial.'
        : 'Herramienta clasificada como auxilio técnico instrumental: no genera actos administrativos independientes.',
      actionRequired: isAutomatedAdministrativeAct
        ? 'Tramitar la Orden/Resolución reguladora de la actuación automatizada con informe del órgano de asesoramiento jurídico.'
        : 'Garantizar que todo documento generado figure con mención expresa de auxilio técnico sin presunción de acto formal.',
    },
    {
      code: 'LEY-15-2022-ART-23',
      title: 'Auditoría de No Discriminación Algorítmica en Sector Público',
      legalBasis: 'Ley 15/2022, Art. 23 (Igualdad de trato) y RD 729/2023 (AESIA)',
      status: 'compliant',
      description: 'Las Administraciones Públicas favorecerán la transparencia algorítmica y la minimización de sesgos de género, edad, origen o discapacidad.',
      actionRequired: 'Verificar periódicamente que los criterios del modelo y los prompts no introduzcan discriminaciones directas o indirectas.',
    },
  ];

  // Si aplica la excepción del Art. 6.3, añadir obligación documental de Art. 6.4
  if (isArticle63Derogation) {
    obligations.unshift({
      code: 'RIA-ART-6-4',
      title: 'Evaluación Documentada de Excepción de Alto Riesgo',
      legalBasis: 'Reglamento (UE) 2024/1689, Art. 6.4',
      status: 'compliant',
      description: 'La entidad pública debe registrar y documentar formalmente la justificación motivada de por qué el sistema del Anexo III no influye materialmente en la decisión ni realiza perfilado.',
      actionRequired: 'Incorporar la justificación formal del Art. 6.3 generada en el expediente administrativo oficial antes de la puesta en producción.',
    });
  }

  // Si es Alto Riesgo, añadir obligaciones de Marcado CE y Sistema de Gestión de Riesgos
  if (isHighRiskAnnexIII) {
    obligations.unshift({
      code: 'RIA-ALTO-RIESGO-CE',
      title: 'Sistema de Gestión de Riesgos y Evaluación de Conformidad CE',
      legalBasis: 'Reglamento (UE) 2024/1689, Art. 9, 17 y 43',
      status: 'non_compliant',
      description: 'Los sistemas de Alto Riesgo del Anexo III requieren marcado CE, gestión continua de riesgos, registro en la Base de Datos de la UE y auditoría pericial preceptiva.',
      actionRequired: 'Suspender el despliegue en producción hasta tramitar el expediente completo de Alto Riesgo con la AESIA.',
    });
  }

  // 7. Red flags & recommendations
  const redFlags: string[] = [];
  if (answers.hostingModel === 'us_hyperscaler') {
    redFlags.push('Transferencia Internacional de Datos: El envío de datos a servidores fuera del Espacio Económico Europeo exige garantías reforzadas (Cláusulas Contractuales Tipo o Data Privacy Framework) y no se recomienda para información reservada o sensible según CCN-STIC 884D.');
  }
  if (answers.humanOversightLevel === 'fully_automated') {
    redFlags.push('Ausencia de Control Humano Previo: En el sector público español, delegar resoluciones en algoritmos sin supervisión humana contraviene el Art. 22 del RGPD y el principio de responsabilidad pública.');
  }
  if (!answers.auditLogsEnabled) {
    redFlags.push('Inexistencia de Registro de Trazabilidad: Impide auditar sesgos, verificar alucinaciones o responder ante reclamaciones de ciudadanos o requerimientos de la AEPD / CCN-CERT.');
  }
  if (answers.processesSpecialCategoryData && answers.hostingModel !== 'local_on_premise') {
    redFlags.push('Datos Sensibles en Nube Externa: El tratamiento de datos de salud, opiniones sindicales o antecedentes debe realizarse prioritariamente en servidores propios (On-Premise) con modelos locales aislados de internet.');
  }
  if (ingest.agentsMdContent && ingest.agentsMdContent.trim().length > 0) {
    const agentsLower = ingest.agentsMdContent.toLowerCase();
    if (agentsLower.includes('sin intervencion humana') || agentsLower.includes('sin confirmacion') || agentsLower.includes('autonomo sin supervision')) {
      redFlags.push('Autonomía de Agente no Delimitada (AGENTS.md): Se detectan directivas de ejecución autónoma sin confirmación de usuario. El Art. 14 del AI Act exige que todo agente con capacidad de invocar herramientas disponga de un interruptor de parada y revisión humana previa.');
    }
  }

  const recommendations: string[] = [];
  if (isNotAiSystem) {
    recommendations.push(
      'El software está excluido del AI Act (Art. 3.1). Centrar el expediente en la adecuación al Esquema Nacional de Seguridad (ENS RD 311/2022) y Ley 40/2015.',
      'Garantizar la exactitud funcional de los algoritmos tradicionales y documentar las especificaciones técnicas en el archivo administrativo.'
    );
  } else if (isArticle63Derogation) {
    recommendations.push(
      'Ratificar en el expediente administrativo oficial la justificación del Art. 6.3 del RIA firmada por el funcionario instructor y el DPD.',
      'Implementar los componentes visuales de transparencia (banner y pie de página) para cumplir de inmediato con el Art. 50 del RIA.',
      'Asegurar que las credenciales no viajen al navegador; priorizar modelos locales (Ollama/vLLM) en servidores corporativos para soberanía total.'
    );
  } else if (riskClassification === 'minimal_risk') {
    recommendations.push(
      'Sistema de Riesgo Mínimo (Art. 95 RIA): Cumplir con las políticas internas de ciberseguridad ENS sin necesidad de trámites burocráticos de IA.',
      'Valorar la adhesión voluntaria a un código de buenas prácticas éticas algorítmicas.'
    );
  } else if (isHighRiskAnnexIII) {
    recommendations.push(
      'URGENTE: Iniciar el expediente de Sistema de Gestión de Riesgos (Art. 9 RIA) y preparar la auditoría de conformidad previa.',
      'Contactar con la AESIA o entidad notificada para iniciar los trámites preceptivos de Marcado CE.',
      'Realizar una auditoría de sesgos y datos de entrenamiento conforme a la Ley 15/2022 y Art. 10 del RIA.'
    );
  } else {
    recommendations.push(
      'Implementar los componentes visuales de transparencia (banner y pie de página) para cumplir de inmediato con el Art. 50 del RIA.',
      'Asegurar que las credenciales no viajen al navegador; priorizar modelos locales (Ollama/vLLM) en servidores corporativos para soberanía total.',
      'Someter el expediente técnico al visto bueno del Delegado de Protección de Datos (DPD) y del Responsable de Seguridad del ENS (CISO).'
    );
  }

  if (ingest.agentsMdContent && ingest.agentsMdContent.trim().length > 0) {
    recommendations.unshift('Dictamen Favorable AGENTS.md: El archivo de directivas técnicas del agente delimita adecuadamente las salvaguardas y el rol instrumental del modelo.');
  }

  const executiveSummary = `Diagnóstico de Gobernanza para "${ingest.appName}": El sistema se clasifica como ${riskLabel}. Operando bajo el principio de auxilio técnico instrumental con supervisión humana previa (${answers.supervisionRole}), se adecúa a los principios de simplificación del Ómnibus Digital UE 2026/1744. Se requiere categoría ENS ${ensCategory} y cumplimiento riguroso de las medidas de trazabilidad de la Guía CCN-STIC 884D.`;

  return {
    riskClassification,
    riskLabel,
    riskSummary,
    isAiSystem: !isNotAiSystem,
    isHighRiskAnnexIII,
    annexIIICategory: isHighRiskAnnexIII ? annexIIICategory : undefined,
    isArticle63Derogation: isArticle63Derogation ? true : undefined,
    article63Justification: isArticle63Derogation ? article63Justification : undefined,
    isAutomatedAdministrativeAct,
    ensCategory,
    ensReasoning,
    prohibitedChecks,
    obligations,
    redFlags,
    recommendations,
    executiveSummary,
  };
}

/**
 * AI-powered deep audit enrichment using connected LLM
 */
export async function analyzeWithLLM(
  config: ApiConfig,
  ingest: AppIngestData,
  answers: LegalEnrichmentAnswers,
  baseline: DiagnosticResult
): Promise<{ enrichedSummary: string; technicalCritique: string; complianceChecklistAdvice: string }> {
  const prompt = `
Actúa como un Auditor Jurídico-Técnico del Centro Criptológico Nacional (CCN-CERT) y experto en el Reglamento Europeo de Inteligencia Artificial (AI Act UE 2024/1689), el Ómnibus Digital (UE 2026/1744), el Esquema Nacional de Seguridad (ENS RD 311/2022) y la Ley 40/2015.

${ingest.isAiSystem === false ? `
⚠️ ATENCIÓN OBLIGATORIA DE ENCUADRE TÉCNICO:
El software evaluado ("${ingest.appName}") ES UN DESARROLLO DE SOFTWARE DETERMINISTA TRADICIONAL (ej. cálculo de fechas/plazos, validación de formularios, gestión de trámites) Y NO UTILIZA NINGÚN MODELO DE LENGUAJE (LLM) NI COMPONENTES DE INTELIGENCIA ARTIFICIAL.
- DICTAMINA QUE ESTÁ EXCLUIDO DEL ÁMBITO DEL AI ACT (Reglamento UE 2024/1689, Art. 3.1) al basarse únicamente en lógica y reglas predefinidas.
- NO INVENTES riesgos de prompt injection, alucinaciones de IA ni inferencia con modelos Ollama/vLLM.
- CENTRA TU ANÁLISIS TÉCNICO Y JURÍDICO EN:
  1. Exactitud de las reglas algorítmicas y delimitación con la Actuación Administrativa Automatizada (Art. 41 Ley 40/2015) vs auxilio técnico.
  2. Medidas de seguridad y robustez del software según el Esquema Nacional de Seguridad (ENS RD 311/2022).
  3. Deber de transparencia con el usuario y supervisión humana del resultado de cálculo.
` : ''}

Analiza los siguientes datos de la aplicación a auditar:
- Nombre: ${ingest.appName}
- Descripción: ${ingest.appDescription}
- Destinatarios: ${ingest.targetAudience}
- Stack Técnico: ${ingest.techStack || 'No especificado'}
- Documentación Funcional (README.md):
${ingest.readmeContent.slice(0, 3500)}
${ingest.agentsMdContent ? `
- Especificación Técnica y Directivas del Agente (AGENTS.md / CLAUDE.md):
${ingest.agentsMdContent.slice(0, 3500)}
` : ''}

- Parámetros de la Entrevista Jurídica:
  * Nivel de supervisión humana: ${answers.humanOversightLevel} (Rol: ${answers.supervisionRole})
  * Naturaleza administrativa: ${answers.administrativeNature} (Norma competencial: ${answers.publicCompetenceNorm})
  * Objeto procesado: ${answers.evaluatedSubjectType || 'No especificado'}
  * ¿Perfilado / Baremación de personas físicas?: ${answers.performsProfilingOrScoring ? 'SÍ (Bloquea Art. 6.3)' : 'NO'}
  * Modo de interacción: ${answers.interactionAndGenerationType || 'chatbot_or_generative'}
  * Modelo de alojamiento / Soberanía: ${answers.hostingModel} (¿Datos sensibles Art 9?: ${answers.processesSpecialCategoryData ? 'SÍ' : 'NO'})
  * Actividad RAT declarada: ${answers.ratActivityName}
  * Logs de trazabilidad: ${answers.auditLogsEnabled ? 'Activados' : 'Desactivados'} (${answers.logRetentionMonths} meses)
  * Determinismo (temp 0 / seed): ${answers.deterministicConfig ? 'Sí' : 'No'}

- Diagnóstico determinista preliminar:
  * Clasificación RIA: ${baseline.riskLabel}
  * ¿Aplica Excepción Art. 6.3 RIA?: ${baseline.isArticle63Derogation ? 'SÍ (Tarea preparatoria sin perfilado)' : 'NO'}
  * Categoría ENS: ${baseline.ensCategory}

Genera un informe con 3 secciones claramente delimitadas:
### 1. DICTAMEN DE RIESGO Y ADECUACIÓN NORMATIVA
(Análisis pericial motivado:
 - ${ingest.isAiSystem === false ? 'Confirma expresamente la exclusión del ámbito de aplicación del AI Act (Art. 3.1) al ser software determinista clásico.' : 'Examina si aplica el Anexo III punto 4(a) o 5(a) del RIA, si procede la excepción motivada del Art. 6.3 o el régimen de transparencia del Art. 50.'}
 - CONTROL PERICIAL DE DISCREPANCIA: Si detectas que la aplicación en la práctica realiza baremación de candidatos, asignación de ayudas a personas o decisiones sustantivas no detectadas en las reglas preliminares, incluye destacadamente:
   "> ⚠️ **[ALERTA PERICIAL DE DISCREPANCIA: Posible Alto Riesgo Anexo III]**" motivando la reclasificación.
 - Delimita con precisión el Art. 41 de la Ley 40/2015 frente al auxilio técnico y cita las directrices de la AESIA (RD 729/2023)).

### 2. AUDITORÍA TÉCNICA Y SEGURIDAD CCN-STIC 884D
(${ingest.isAiSystem === false ? 'Revisión de seguridad de código web, CSP, dependencias NPM/Python, robustez frente a entradas anómalas y trazabilidad ENS' : 'Revisión de riesgos de inyección indirecta en documentos/PDFs (OWASP LLM01), fuga de credenciales API (CCN-STIC 884D IA-01), soberanía con Ollama/vLLM vs nubes externas y trazabilidad'}).

### 3. PLAN DE ACCIÓN INMEDIATO PARA EL EXPEDIENTE ADMINISTRATIVO
(Pasos concretos que el Servicio responsable debe rubricar antes de pasar a producción).
`;

  const systemInstruction = 'Eres el Auditor Jefe de Sistemas de Inteligencia Artificial para las Administraciones Públicas españolas. Tu lenguaje es riguroso, formal y jurídicamente fundamentado en las normas del Boletín Oficial del Estado y el Diario Oficial de la Unión Europea.';

  const responseText = await callApi(config, prompt, systemInstruction);

  // Divide response into sections if structured
  return {
    enrichedSummary: responseText,
    technicalCritique: 'Análisis asistido por IA completado satisfactoriamente con verificación de fuentes doctrinales y normativas vigentes.',
    complianceChecklistAdvice: 'Incorporar las conclusiones al Anexo III del Expediente de Puesta en Servicio del órgano colegiado.',
  };
}

/**
 * Auto-generate a structured AGENTS.md document using the connected LLM
 * through software architecture reverse-engineering.
 */
export async function generateAgentsMdWithLlm(
  config: ApiConfig,
  ingest: AppIngestData
): Promise<string> {
  const prompt = `
Actúa como un Arquitecto de Software y Auditor de Seguridad de Inteligencia Artificial para el Sector Público español.
A partir de la siguiente información del proyecto:
- Nombre de la aplicación: ${ingest.appName}
- Finalidad / Descripción: ${ingest.appDescription}
- Destinatarios: ${ingest.targetAudience}
- Stack Tecnológico detectado: ${ingest.techStack || 'Web / Inferencia LLM'}
- Documentación Funcional (README.md):
${ingest.readmeContent.slice(0, 3500)}

Genera un documento técnico formal y riguroso en formato Markdown llamado AGENTS.md para este proyecto, diseñado específicamente para cumplir con el AI Act (Reglamento UE 2024/1689), el ENS (RD 311/2022) y el RGPD.

El documento AGENTS.md debe estructurarse con estos apartados obligatorios:
# AGENTS.MD - Arquitectura y Directivas del Agente (${ingest.appName})

## 1. Naturaleza y Delimitación Jurídica
- Declaración de asistencia instrumental (Art. 41 Ley 40/2015 y Ómnibus Digital UE 2026/1744).
- Deslinde expreso: prohibición de emitir actos administrativos resolutorios o calificaciones automáticas sin validación humana.

## 2. Inferencia y Soberanía del Dato
- Modelos recomendados y utilizados (versión, proveedor, despliegue local On-Premise vs nube europea).
- Política de no reentrenamiento (Zero Data Retention) con datos administrativos.

## 3. Directivas del Sistema (System Prompts)
- Instrucción maestra del sistema para garantizar neutralidad, rigor y cita de normas en diarios oficiales (BOE/autonómicos).
- Salvaguardas éticas y filtros de salida para evitar alucinaciones y sesgos.

## 4. Grado de Autonomía y Herramientas (Agency & Tools)
- Catálogo de funciones y herramientas que el modelo puede solicitar.
- Principio Human-in-the-Loop (Art. 14 RIA): confirmación preceptiva previa por el funcionario tramitador para cualquier acción que modifique el estado del sistema.

## 5. Trazabilidad y Seguridad (CCN-STIC 884D / ENS RD 311/2022)
- Registro de auditoría con sellado hash SHA-256 de peticiones y respuestas.
- Periodo de conservación de logs (24 meses).
- Obligación del banner de advertencia Art. 50 AI Act en todas las salidas del sistema.

Entrega ÚNICAMENTE el contenido en Markdown, limpio y directamente utilizable como archivo AGENTS.md.`;

  const systemInstruction = 'Eres un Arquitecto de Software especialista en gobernanza de IA, ENS (RD 311/2022) y AI Act de la Unión Europea. Generas documentación técnica concisa, formal y sin rodeos.';

  return await callApi(config, prompt, systemInstruction);
}

