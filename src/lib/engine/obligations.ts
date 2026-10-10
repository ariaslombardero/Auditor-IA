import type {
  AnnexIIIArea,
  AppIngestData,
  EnsDimension,
  LegalEnrichmentAnswers,
  RequirementAssessment,
  RequirementApplicability,
  RiskClassification,
  TriState,
} from '../../types';
import { REGULATORY_CALENDAR, applicabilityNote } from '../regulatoryCalendar';
import { ENS_DIMENSIONS, ENS_DIMENSION_LABELS } from '../answersModel';
import { eipdScreening } from '../eipdCriteria';

const RIA = 'Reglamento (UE) 2024/1689';

// ---------------------------------------------------------------------------------------------
// ENS: categoría por dimensiones (Anexo I del RD 311/2022)
// ---------------------------------------------------------------------------------------------

export interface EnsEvaluation {
  category: 'BASICA' | 'MEDIA' | 'ALTA';
  orientative: boolean;
  reasoning: string;
}

export function evaluateEns(answers: LegalEnrichmentAnswers, ingest: AppIngestData, highRisk: boolean): EnsEvaluation {
  const levels = ENS_DIMENSIONS.map((d) => answers.ensImpact[d]);
  const known = levels.filter((l) => l !== 'desconocido');
  const unknownDims = ENS_DIMENSIONS.filter((d) => answers.ensImpact[d] === 'desconocido').map((d) => ENS_DIMENSION_LABELS[d]);
  const detail = ENS_DIMENSIONS.map((d: EnsDimension) => `${d}: ${answers.ensImpact[d].replace('_', ' ')}`).join(', ');

  if (known.length === 0) {
    // Sin valoración de dimensiones: estimación orientativa a partir de otras respuestas
    let category: EnsEvaluation['category'] = 'BASICA';
    if (answers.processesSpecialCategoryData === 'si' || answers.processesCriminalData === 'si' || highRisk) category = 'ALTA';
    else if (answers.directHumanIntervention === 'no' || answers.hostingModel === 'us_hyperscaler' || ingest.targetAudience === 'public_citizens') category = 'MEDIA';
    return {
      category,
      orientative: true,
      reasoning: `Categoría orientativa: no se ha valorado ninguna dimensión de seguridad. Se estima a partir de otras respuestas y debe sustituirse por la valoración del Anexo I del RD 311/2022.`,
    };
  }

  const category: EnsEvaluation['category'] = known.includes('alto') ? 'ALTA' : known.includes('medio') ? 'MEDIA' : 'BASICA';
  const orientative = unknownDims.length > 0;
  return {
    category,
    orientative,
    reasoning: orientative
      ? `Categoría orientativa (${detail}): faltan por valorar ${unknownDims.join(', ')}. La categoría es la del nivel más alto de cualquier dimensión (Anexo I del RD 311/2022).`
      : `Categoría según el nivel más alto de las dimensiones valoradas (${detail}), conforme al Anexo I del RD 311/2022.`,
  };
}

// ---------------------------------------------------------------------------------------------
// Obligaciones por papel, clasificación y calendario
// ---------------------------------------------------------------------------------------------

export interface ObligationsContext {
  ingest: AppIngestData;
  answers: LegalEnrichmentAnswers;
  classification: RiskClassification;
  isAi: TriState;
  highRisk: TriState;
  exception: TriState;
  appliesArt50: TriState;
  area: AnnexIIIArea;
  ens: EnsEvaluation;
  annexIIICategory?: string;
  fecha: string;
  today: string;
}

const roleApplicability = (role: LegalEnrichmentAnswers['institutionalRole'], wanted: 'proveedor' | 'responsable_despliegue'): RequirementApplicability | null => {
  if (role === 'ambos' || role === wanted) return 'aplica';
  if (role === 'desconocido') return 'desconocida';
  return null; // no le corresponde a este papel
};

export function buildObligations(ctx: ObligationsContext): RequirementAssessment[] {
  const { answers: a, fecha, today } = ctx;
  const reqs: RequirementAssessment[] = [];
  const isAiApplic: RequirementApplicability = ctx.isAi === 'si' ? 'aplica' : ctx.isAi === 'no' ? 'no_aplica' : 'desconocida';
  const withDate = (text: string, date?: string) => (date ? `${text} ${applicabilityNote(date, today)}` : text);
  const highRisk = ctx.classification === 'high_risk';
  const deployerPublicArea = ctx.area !== 'infraestructuras_criticas';

  // Papel de la entidad
  if (ctx.isAi !== 'no' && a.institutionalRole === 'desconocido') {
    reqs.push({
      id: 'RIA-PAPEL',
      kind: 'obligacion',
      pillar: 'ria',
      title: 'Papel de la entidad respecto del sistema',
      norma: RIA,
      precepto: 'Art. 3, puntos 3 y 4',
      aplicabilidad: 'aplica',
      resultado: 'pendiente',
      origen: 'declaracion_promotor',
      hechos: 'No consta si la entidad es proveedora (desarrolla el sistema o lo pone en servicio con su propio nombre), responsable del despliegue (lo utiliza bajo su autoridad) o ambas. Las obligaciones dependen de ese papel.',
      accionRequerida: 'Determinar el papel de la entidad en la entrevista.',
      fecha,
    });
  }

  // Alfabetización en IA (Art. 4, en la redacción del Reglamento (UE) 2026/1744)
  reqs.push({
    id: 'RIA-ART-4',
    kind: 'obligacion',
    pillar: 'gobernanza',
    title: 'Medidas de apoyo a la alfabetización en IA del personal',
    norma: `${RIA}, modificado por el Reglamento (UE) 2026/1744`,
    precepto: 'Art. 4',
    aplicabilidad: isAiApplic,
    resultado: 'no_verificado',
    origen: 'comprobacion_automatica',
    hechos: withDate('Proveedores y responsables del despliegue deben adoptar medidas para apoyar la alfabetización en IA de su personal. No se han aportado evidencias de esas medidas.', REGULATORY_CALENDAR.art5.fecha),
    accionRequerida: 'Documentar la formación o las medidas adoptadas para el personal que usa el sistema.',
    exigibleDesde: REGULATORY_CALENDAR.art5.fecha,
    fecha,
  });

  // Alto riesgo: proveedor
  const hrDate = REGULATORY_CALENDAR.altoRiesgoAnexoIII.fecha;
  if (highRisk) {
    const provider = roleApplicability(a.institutionalRole, 'proveedor');
    if (provider) {
      reqs.push({
        id: 'RIA-ALTO-RIESGO-CE',
        kind: 'obligacion',
        pillar: 'ria',
        title: 'Requisitos del proveedor de un sistema de alto riesgo y evaluación de la conformidad',
        norma: RIA,
        precepto: 'Arts. 9 a 17, 43.2, 47 a 49; Anexo VI',
        aplicabilidad: provider,
        resultado: 'pendiente',
        origen: 'declaracion_promotor',
        hechos: withDate(`Clasificación basada en lo declarado (${ctx.annexIIICategory || 'Anexo III'}). Para los puntos 2 a 8 del Anexo III, la evaluación de la conformidad sigue el control interno del Anexo VI, sin organismo notificado (Art. 43.2).`, hrDate),
        accionRequerida: 'Gestión de riesgos (Art. 9), gobernanza de datos (Art. 10), documentación técnica (Art. 11), registros (Art. 12), transparencia (Art. 13), supervisión humana (Art. 14), precisión y ciberseguridad (Art. 15), gestión de la calidad (Art. 17), evaluación de la conformidad por control interno, declaración UE, marcado CE y registro (Arts. 47 a 49).',
        exigibleDesde: hrDate,
        fecha,
      });
    }

    // Alto riesgo: responsable del despliegue
    const deployer = roleApplicability(a.institutionalRole, 'responsable_despliegue');
    if (deployer) {
      reqs.push({
        id: 'RIA-ART-26',
        kind: 'obligacion',
        pillar: 'ria',
        title: 'Obligaciones del responsable del despliegue de un sistema de alto riesgo',
        norma: RIA,
        precepto: 'Art. 26',
        aplicabilidad: deployer,
        resultado: 'pendiente',
        origen: 'declaracion_promotor',
        hechos: withDate('Uso conforme a las instrucciones (26.1), supervisión humana por personas con competencia, formación y autoridad (26.2), datos de entrada pertinentes (26.4), vigilancia del funcionamiento (26.5), conservación de los registros (26.6), información a los trabajadores (26.7) y uso de la información del Art. 13 para la EIPD (26.9).', hrDate),
        accionRequerida: 'Documentar cada una de estas medidas antes de utilizar el sistema.',
        exigibleDesde: hrDate,
        fecha,
      });
      if (deployerPublicArea) {
        reqs.push({
          id: 'RIA-ART-27',
          kind: 'obligacion',
          pillar: 'ria',
          title: 'Evaluación de impacto en los derechos fundamentales',
          norma: RIA,
          precepto: 'Art. 27',
          aplicabilidad: deployer,
          resultado: 'pendiente',
          origen: 'declaracion_promotor',
          hechos: withDate('Los responsables del despliegue que sean organismos de Derecho público deben evaluar el impacto del sistema en los derechos fundamentales antes de utilizarlo (salvo los sistemas del Anexo III, punto 2).', hrDate),
          accionRequerida: 'Realizar la evaluación de impacto en los derechos fundamentales y notificar sus resultados a la autoridad de vigilancia del mercado.',
          exigibleDesde: hrDate,
          fecha,
        });
        reqs.push({
          id: 'RIA-ART-49-3',
          kind: 'obligacion',
          pillar: 'ria',
          title: 'Registro del uso del sistema por una autoridad pública',
          norma: RIA,
          precepto: 'Art. 49.3',
          aplicabilidad: deployer,
          resultado: 'pendiente',
          origen: 'declaracion_promotor',
          hechos: 'Los responsables del despliegue que sean autoridades públicas deben registrarse, seleccionar el sistema y registrar su utilización en la base de datos de la UE antes de ponerlo en servicio o utilizarlo. Su fecha de exigibilidad debe confirmarse.',
          accionRequerida: 'Registrar el uso en la base de datos de la UE antes de utilizar el sistema.',
          fecha,
        });
        reqs.push({
          id: 'RIA-ART-86',
          kind: 'obligacion',
          pillar: 'gobernanza',
          title: 'Derecho a explicación de decisiones individuales',
          norma: RIA,
          precepto: 'Art. 86',
          aplicabilidad: deployer,
          resultado: 'pendiente',
          origen: 'declaracion_promotor',
          hechos: 'Las personas afectadas por decisiones basadas en los resultados de un sistema de alto riesgo del Anexo III (salvo el punto 2) que produzcan efectos jurídicos tienen derecho a explicaciones claras y significativas sobre el papel del sistema. Su exigibilidad depende de la aplicación del régimen de alto riesgo y debe confirmarse.',
          accionRequerida: 'Preparar el procedimiento para atender solicitudes de explicación.',
          fecha,
        });
      }
    }
  }

  // Excepción del Art. 6.3: documentación (Art. 6.4) y registro (Art. 49.2)
  if (ctx.exception === 'si' && ctx.isAi === 'si') {
    const provider = roleApplicability(a.institutionalRole, 'proveedor');
    reqs.push({
      id: 'RIA-ART-6-4',
      kind: 'obligacion',
      pillar: 'ria',
      title: 'Documentación y registro de la excepción del Art. 6.3',
      norma: `${RIA}, modificado por el Reglamento (UE) 2026/1744`,
      precepto: 'Arts. 6.3, 6.4 y 49.2; Anexo VIII',
      aplicabilidad: provider || 'aplica',
      resultado: 'pendiente',
      origen: 'declaracion_promotor',
      hechos: `${provider ? 'Corresponde a la entidad como proveedora' : 'Corresponde al proveedor del sistema; la entidad, como responsable del despliegue, debe recabar esa documentación'}: documentar la evaluación antes de la puesta en servicio (Art. 6.4) y registrar el sistema en la base de datos de la UE (Art. 49.2), registro que mantiene el Reglamento (UE) 2026/1744 con un contenido simplificado del Anexo VIII. La sección 1 del capítulo III (Art. 6) es exigible para el Anexo III desde el ${new Date(hrDate).toLocaleDateString('es-ES')}; la fecha del registro debe confirmarse.`,
      accionRequerida: 'Redactar la evaluación motivada (condición del Art. 6.3, hechos y ausencia de perfilado e influencia sustancial) y registrar el sistema.',
      fecha,
    });
  }

  // Transparencia (Art. 50)
  const art50Date = REGULATORY_CALENDAR.art50.fecha;
  const art50Actions: string[] = [];
  if (a.interactsWithPersons === 'si') art50Actions.push('Informar a las personas de que interactúan con un sistema de IA (Art. 50.1).');
  else if (a.interactsWithPersons === 'desconocido') art50Actions.push('Si interactúa directamente con personas, informarlas de que interactúan con un sistema de IA (Art. 50.1).');
  if (a.generatesSyntheticContent !== 'no') {
    art50Actions.push('Marcar el contenido generado en un formato legible por máquina (Art. 50.2). Corresponde al proveedor del sistema, salvo que solo apoye la edición estándar o no altere sustancialmente los datos de entrada.');
    if (a.publishesPublicInterestText === 'si') {
      art50Actions.push(
        a.editorialReview === 'si'
          ? 'Según lo declarado, no es obligatorio divulgar que el texto publicado se ha generado con IA, porque pasa por revisión humana o control editorial y hay un responsable editorial (Art. 50.4, párrafo segundo). Conservar evidencia de ese control: quién revisa y quién aprueba cada texto.'
          : a.editorialReview === 'no'
            ? 'Al publicarlo, divulgar que el texto se ha generado o manipulado de manera artificial (Art. 50.4, párrafo segundo).'
            : 'Determinar si los textos publicados pasan por revisión humana o control editorial con un responsable editorial; si no, hay que divulgar que se han generado con IA (Art. 50.4, párrafo segundo).'
      );
    } else if (a.publishesPublicInterestText === 'desconocido') {
      art50Actions.push('Si el texto se publica para informar al público sobre asuntos de interés público, divulgar que se ha generado con IA, salvo que pase por revisión humana o control editorial con un responsable editorial (Art. 50.4, párrafo segundo).');
    }
  }
  art50Actions.push('Conservar evidencia de lo implantado.');
  reqs.push({
    id: 'RIA-ART-50',
    kind: 'obligacion',
    pillar: 'ria',
    title: 'Transparencia hacia las personas (interacción con IA y contenido sintético)',
    norma: RIA,
    precepto: 'Art. 50',
    aplicabilidad: ctx.isAi === 'no' || ctx.appliesArt50 === 'no' ? 'no_aplica' : ctx.appliesArt50 === 'si' && ctx.isAi === 'si' ? 'aplica' : 'desconocida',
    resultado: ctx.appliesArt50 === 'si' ? 'pendiente' : ctx.appliesArt50 === 'no' ? 'no_evaluado' : 'pendiente',
    origen: 'declaracion_promotor',
    hechos:
      ctx.appliesArt50 === 'si'
        ? withDate('Declarado: el sistema interactúa con personas o genera contenido. La herramienta no comprueba que la información de transparencia esté implantada.', art50Date)
        : ctx.appliesArt50 === 'no'
          ? 'Declarado: no interactúa con personas ni genera contenido sintético.'
          : 'No consta si el sistema interactúa con personas o genera contenido sintético.',
    accionRequerida:
      ctx.appliesArt50 === 'no'
        ? 'Revisar la declaración si el sistema llega a interactuar con personas o a generar contenido.'
        : art50Actions.join(' '),
    exigibleDesde: ctx.appliesArt50 === 'no' ? undefined : art50Date,
    fecha,
  });

  // Supervisión humana
  reqs.push({
    id: 'SUPERVISION-HUMANA',
    kind: 'obligacion',
    pillar: 'gobernanza',
    title: 'Supervisión humana de los resultados',
    norma: `${RIA}; RGPD; Ley 40/2015`,
    precepto: 'Art. 14 RIA (alto riesgo); Art. 22 RGPD; Art. 41 Ley 40/2015',
    aplicabilidad: ctx.isAi === 'si' ? 'aplica' : 'desconocida',
    resultado: a.humanOversightLevel === 'pre_execution' ? 'declarado' : 'pendiente',
    origen: 'declaracion_promotor',
    hechos:
      a.humanOversightLevel === 'pre_execution'
        ? `Declarada revisión humana previa${a.supervisionRole ? ` por: ${a.supervisionRole}` : ''}. No se ha comprobado el funcionamiento real del procedimiento.`
        : a.humanOversightLevel === 'post_execution'
          ? 'Declarada revisión humana posterior: debe verificarse si un empleado público interviene de forma directa antes de que el resultado produzca efectos.'
          : a.humanOversightLevel === 'fully_automated'
            ? 'Declarada actuación sin intervención humana: puede quedar sujeta a la prohibición del Art. 22 RGPD y exige los requisitos del Art. 41 Ley 40/2015.'
            : 'No consta el grado de supervisión humana.',
    accionRequerida: 'Documentar quién revisa, en qué momento y con qué capacidad de modificar o descartar el resultado.',
    fecha,
  });

  // ENS
  reqs.push({
    id: 'ENS-CATEGORIZACION',
    kind: 'obligacion',
    pillar: 'ens',
    title: 'Categorización del sistema según el impacto en cada dimensión',
    norma: 'ENS (RD 311/2022)',
    precepto: 'Arts. 40 y 41; Anexo I',
    aplicabilidad: 'aplica',
    resultado: ctx.ens.orientative ? 'pendiente' : 'declarado',
    origen: 'declaracion_promotor',
    hechos: ctx.ens.reasoning,
    accionRequerida: ctx.ens.orientative
      ? 'Valorar el nivel (bajo, medio o alto) de cada dimensión de seguridad afectada.'
      : 'El responsable de seguridad debe confirmar la valoración de las dimensiones.',
    fecha,
  });
  reqs.push({
    id: 'ENS-CREDENCIALES',
    kind: 'obligacion',
    pillar: 'ens',
    title: 'Protección de las credenciales de acceso a servicios de IA',
    norma: 'ENS (RD 311/2022), Anexo II',
    precepto: '[op.acc.5] y [op.acc.6] mecanismos de autenticación; [mp.sw.1] desarrollo de aplicaciones',
    aplicabilidad: ctx.isAi === 'si' ? 'aplica' : 'desconocida',
    resultado: 'no_verificado',
    origen: 'comprobacion_automatica',
    hechos: 'Las credenciales deben estar bajo control exclusivo y no exponerse en código cliente ni en repositorios. Esta evaluación no ha examinado el código del sistema auditado.',
    accionRequerida: 'Revisar el código y la configuración del sistema auditado; trasladar las claves a un servidor o usar modelos locales.',
    fecha,
  });
  reqs.push({
    id: 'ENS-REGISTRO-ACTIVIDAD',
    kind: 'obligacion',
    pillar: 'ens',
    title: 'Registro de la actividad y trazabilidad',
    norma: `ENS (RD 311/2022), Anexo II; ${RIA}`,
    precepto: '[op.exp.8] Registro de la actividad; Art. 12 RIA (alto riesgo)',
    aplicabilidad: 'aplica',
    resultado: a.auditLogsEnabled === 'si' ? 'declarado' : 'pendiente',
    origen: 'declaracion_promotor',
    hechos:
      a.auditLogsEnabled === 'si'
        ? `Declarado registro de actividad con conservación de ${a.logRetentionMonths} meses. No se ha comprobado su existencia ni su contenido.`
        : a.auditLogsEnabled === 'no'
          ? 'Declarado que no existe registro de actividad.'
          : 'No consta si existe registro de actividad.',
    accionRequerida:
      a.auditLogsEnabled === 'si'
        ? 'Aportar evidencia del registro (usuario, fecha y hora, objeto, tipo y resultado del evento) y de su política de conservación.'
        : 'Activar el registro de peticiones y respuestas con conservación definida en la documentación de seguridad.',
    fecha,
  });

  // RGPD
  const personal = a.processesPersonalData;
  const personalApplic: RequirementApplicability = personal === 'si' ? 'aplica' : personal === 'no' ? 'no_aplica' : 'desconocida';
  const basisLabel: Record<LegalEnrichmentAnswers['legalBasis'], string> = {
    art_6_1_c: 'Art. 6.1.c) (obligación legal)',
    art_6_1_e: 'Art. 6.1.e) (misión de interés público o ejercicio de poderes públicos)',
    otra: 'otra base del Art. 6.1',
    desconocida: '',
  };
  reqs.push({
    id: 'RGPD-BASE-JURIDICA',
    kind: 'obligacion',
    pillar: 'rgpd',
    title: 'Base jurídica del tratamiento',
    norma: 'RGPD (UE 2016/679)',
    precepto: 'Art. 6.1',
    aplicabilidad: personalApplic,
    resultado: personal === 'no' ? 'no_evaluado' : a.legalBasis === 'desconocida' ? 'pendiente' : 'declarado',
    origen: 'declaracion_promotor',
    hechos:
      personal === 'no'
        ? 'Declarado que no se tratan datos personales.'
        : a.legalBasis === 'desconocida'
          ? 'No consta la base jurídica del tratamiento.'
          : `Declarada la base jurídica: ${basisLabel[a.legalBasis]}${a.publicCompetenceNorm ? `, con fundamento en: ${a.publicCompetenceNorm}` : ''}. No se ha verificado.`,
    accionRequerida: 'El DPD debe verificar la base jurídica y la norma que la sustenta.',
    fecha,
  });
  reqs.push({
    id: 'RGPD-ART-30',
    kind: 'obligacion',
    pillar: 'rgpd',
    title: 'Registro de Actividades de Tratamiento',
    norma: 'RGPD (UE 2016/679)',
    precepto: 'Art. 30',
    aplicabilidad: personalApplic,
    resultado: personal === 'no' ? 'no_evaluado' : a.ratActivityName.trim() ? 'declarado' : 'pendiente',
    origen: 'declaracion_promotor',
    hechos:
      personal === 'no'
        ? 'Declarado que no se tratan datos personales.'
        : a.ratActivityName.trim()
          ? `Declarada la actividad de tratamiento «${a.ratActivityName}». Indicar un nombre no acredita su inscripción en el RAT.`
          : 'No se ha indicado la actividad de tratamiento.',
    accionRequerida: 'El DPD debe verificar la inscripción en el RAT.',
    fecha,
  });
  if (a.processesSpecialCategoryData !== 'no' && personal !== 'no') {
    reqs.push({
      id: 'RGPD-ART-9',
      kind: 'obligacion',
      pillar: 'rgpd',
      title: 'Tratamiento de categorías especiales de datos',
      norma: 'RGPD (UE 2016/679)',
      precepto: 'Art. 9',
      aplicabilidad: a.processesSpecialCategoryData === 'si' ? 'aplica' : 'desconocida',
      resultado: 'pendiente',
      origen: 'declaracion_promotor',
      hechos: a.processesSpecialCategoryData === 'si' ? 'Declarado que se tratan categorías especiales de datos.' : 'No consta si se tratan categorías especiales de datos.',
      accionRequerida: 'Identificar la excepción del Art. 9.2 aplicable y las garantías adicionales.',
      fecha,
    });
  }
  if (a.processesCriminalData !== 'no' && personal !== 'no') {
    reqs.push({
      id: 'RGPD-ART-10',
      kind: 'obligacion',
      pillar: 'rgpd',
      title: 'Tratamiento de datos relativos a condenas e infracciones penales',
      norma: 'RGPD (UE 2016/679)',
      precepto: 'Art. 10',
      aplicabilidad: a.processesCriminalData === 'si' ? 'aplica' : 'desconocida',
      resultado: 'pendiente',
      origen: 'declaracion_promotor',
      hechos: a.processesCriminalData === 'si' ? 'Declarado que se tratan datos relativos a condenas o infracciones penales.' : 'No consta si se tratan datos relativos a condenas o infracciones penales.',
      accionRequerida: 'Verificar que el tratamiento está autorizado por una norma con las garantías adecuadas.',
      fecha,
    });
  }
  const screening = eipdScreening({ ingest: ctx.ingest, answers: a });
  reqs.push({
    id: 'RGPD-EIPD',
    kind: 'obligacion',
    pillar: 'rgpd',
    title: 'Evaluación de impacto en la protección de datos',
    norma: 'RGPD (UE 2016/679)',
    precepto: 'Art. 35; lista de la AEPD (Art. 35.4)',
    aplicabilidad: screening === 'necesaria' ? 'aplica' : screening === 'no_indicada' ? 'no_aplica' : 'desconocida',
    resultado: screening === 'no_indicada' ? 'no_evaluado' : 'pendiente',
    origen: 'comprobacion_automatica',
    hechos:
      screening === 'necesaria'
        ? 'Cribado preliminar: concurren dos o más criterios de WP248 o de la lista de la AEPD; en la mayoría de los casos será necesaria una EIPD.'
        : screening === 'por_determinar'
          ? 'Cribado preliminar: hay criterios sin contestar que podrían alcanzar el umbral de dos.'
          : 'Cribado preliminar: según lo declarado no concurren dos o más criterios.',
    accionRequerida: 'Completar el borrador de EIPD con el asesoramiento del DPD.',
    fecha,
  });
  reqs.push({
    id: 'RGPD-BRECHAS',
    kind: 'obligacion',
    pillar: 'rgpd',
    title: 'Gestión y notificación de brechas de datos personales',
    norma: 'RGPD (UE 2016/679)',
    precepto: 'Arts. 33 y 34',
    aplicabilidad: personalApplic,
    resultado: personal === 'no' ? 'no_evaluado' : a.breachProcedure === 'si' ? 'declarado' : a.breachProcedure === 'no' ? 'incumple' : 'pendiente',
    origen: 'declaracion_promotor',
    hechos:
      personal === 'no'
        ? 'Declarado que no se tratan datos personales.'
        : a.breachProcedure === 'si'
          ? 'Declarado que existe un procedimiento para detectar, documentar y notificar brechas de datos personales. No se ha verificado.'
          : a.breachProcedure === 'no'
            ? 'Declarado que no existe un procedimiento para gestionar brechas de datos personales.'
            : 'No consta si existe un procedimiento para gestionar brechas de datos personales.',
    accionRequerida:
      'Prever cómo se detecta y documenta cualquier brecha (Art. 33.5) y quién la notifica a la AEPD sin dilación indebida y, de ser posible, en 72 horas (Art. 33.1), y a los interesados si entraña un alto riesgo (Art. 34). La AEPD ofrece las herramientas Asesora Brecha (notificación) y Comunica-Brecha RGPD (comunicación a los interesados).',
    fecha,
  });

  // Ley 40/2015: actuación administrativa automatizada
  const direct = a.directHumanIntervention;
  const procedure = a.procedureDescription.trim();
  reqs.push({
    id: 'LEY-40-2015-ART-41',
    kind: 'obligacion',
    pillar: 'gobernanza',
    title: 'Actuación administrativa automatizada',
    norma: 'Ley 40/2015',
    precepto: 'Art. 41',
    aplicabilidad: direct === 'no' ? 'aplica' : direct === 'si' ? 'no_aplica' : 'desconocida',
    resultado: direct === 'si' && procedure ? 'declarado' : 'pendiente',
    origen: 'declaracion_promotor',
    hechos:
      direct === 'no'
        ? 'Declarado que no interviene de forma directa un empleado público: es actuación administrativa automatizada. El Art. 41.2 exige establecer previamente los órganos competentes para la definición de especificaciones, programación, mantenimiento, supervisión, control de calidad y auditoría, y el órgano responsable a efectos de impugnación.'
        : direct === 'si'
          ? procedure
            ? `Declarado que un empleado público interviene de forma directa. Funcionamiento descrito: ${procedure}. No se ha verificado.`
            : 'Declarado que un empleado público interviene de forma directa, pero falta describir el funcionamiento real del procedimiento.'
          : 'No consta si un empleado público interviene de forma directa en cada actuación.',
    accionRequerida:
      direct === 'no'
        ? 'Aprobar la resolución que determine los órganos del Art. 41.2 antes de la puesta en servicio.'
        : 'Describir el procedimiento real: quién interviene, en qué momento y con qué capacidad de decisión.',
    fecha,
  });

  // Ley 15/2022
  reqs.push({
    id: 'LEY-15-2022-ART-23',
    kind: 'obligacion',
    pillar: 'gobernanza',
    title: 'Minimización de sesgos y no discriminación algorítmica',
    norma: 'Ley 15/2022',
    precepto: 'Art. 23',
    aplicabilidad: isAiApplic === 'no_aplica' ? 'desconocida' : isAiApplic,
    resultado: 'no_evaluado',
    origen: 'comprobacion_automatica',
    hechos: 'Las administraciones públicas favorecerán mecanismos de minimización de sesgos, transparencia y rendición de cuentas, y se promoverán evaluaciones de impacto. No se han aportado evaluaciones de sesgo.',
    accionRequerida: 'Valorar y documentar una evaluación del posible impacto discriminatorio del sistema.',
    fecha,
  });

  return reqs;
}
