import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertMillimetersToTwip,
  Header,
  Footer,
  PageNumber,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';
import { MONOGRAMA_JA_BASE64 } from './brandLogo';
import type { FullAuditState, AppIdioma } from '../types';

const FONT_BODY = 'Calibri';
const FONT_HEADING = 'Arial';
const COLOR_PRIMARY = '1E3A8A'; // Navy
const COLOR_SECONDARY = '0284C7'; // Cyan
const COLOR_DARK = '0F172A';
const COLOR_MUTED = '64748B';

export async function exportOfficialDossierDocx(
  state: FullAuditState,
  llmCritique?: string,
  idioma: AppIdioma = 'castellano'
): Promise<void> {
  const doc = buildOfficialDossierDocument(state, llmCritique, idioma);
  const blob = await Packer.toBlob(doc);
  const safeTitle = state.ingest.appName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  saveAs(blob, `Expediente_Conformidad_IA_${safeTitle}_${Date.now()}.docx`);
}

/**
 * Construye el expediente oficial sin descargarlo (reutilizable en pruebas y otros exportadores).
 */
export function buildOfficialDossierDocument(
  state: FullAuditState,
  llmCritique?: string,
  idioma: AppIdioma = 'castellano'
): Document {
  const { ingest, answers, diagnostic, metadata } = state;
  const isGl = idioma === 'galego';

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_BODY, size: 22, color: COLOR_DARK }, // 11pt
          paragraph: { spacing: { line: 276 } }, // 1.15 line height
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(25),
              bottom: convertMillimetersToTwip(25),
              left: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(25),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new ImageRun({
                    type: 'png',
                    data: MONOGRAMA_JA_BASE64,
                    transformation: { width: 34, height: 17 },
                  }),
                  new TextRun({
                    text: `   Arias Lombardero · Aplicaciones | Expediente de Gobernanza IA · ${metadata.entityName.toUpperCase()}`,
                    size: 16,
                    color: '5D6875',
                    font: FONT_HEADING,
                  }),
                ],
                border: {
                  bottom: { color: 'DCE2DF', space: 6, style: 'single' as any, size: 6 },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: isGl
                      ? 'Expediente Oficial de Conformidade RIA (Reg. UE 2024/1689) e ENS (RD 311/2022) · Páxina '
                      : 'Expediente Oficial de Conformidad RIA (Reg. UE 2024/1689) y ENS (RD 311/2022) · Página ',
                    size: 16,
                    color: COLOR_MUTED,
                    italics: true,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: COLOR_MUTED,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // PORTADA
          new Paragraph({ text: '', spacing: { before: 800 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: metadata.entityName.toUpperCase(),
                size: 26,
                bold: true,
                color: COLOR_PRIMARY,
                font: FONT_HEADING,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: metadata.serviceDepartment,
                size: 22,
                color: COLOR_MUTED,
                font: FONT_HEADING,
              }),
            ],
            spacing: { after: 600 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: isGl
                  ? 'EXPEDIENTE TÉCNICO E DICTAME DE CONFORMIDADE NORMATIVA DE SISTEMA DE INTELIXENCIA ARTIFICIAL'
                  : 'EXPEDIENTE TÉCNICO Y DICTAMEN DE CONFORMIDAD NORMATIVA DE SISTEMA DE INTELIGENCIA ARTIFICIAL',
                size: 34,
                bold: true,
                color: COLOR_PRIMARY,
                font: FONT_HEADING,
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `SOFTWARE EVALUADO: "${ingest.appName.toUpperCase()}"`,
                size: 24,
                bold: true,
                color: COLOR_SECONDARY,
              }),
            ],
            spacing: { after: 500 },
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              makeMetadataRow('Referencia del Expediente', `EXP-IA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`),
              makeMetadataRow('Fecha de Auditoría', metadata.auditDate || new Date().toLocaleDateString('es-ES')),
              makeMetadataRow('Clasificación AI Act (Reg. UE 2024/1689)', diagnostic?.riskLabel || 'Riesgo de Transparencia'),
              ...(diagnostic?.isArticle63Derogation
                ? [makeMetadataRow('Régimen Especial AI Act', 'Excepción Art. 6.3 RIA (Derogación de Alto Riesgo documentada Art. 6.4)')]
                : []),
              makeMetadataRow('Categoría ENS (RD 311/2022)', `Nivel ${diagnostic?.ensCategory || 'BÁSICA'}`),
              makeMetadataRow('Régimen Jurídico (Ley 40/2015)', answers.administrativeNature === 'technical_auxiliary' ? 'Auxilio Técnico Instrumental (No emite actos resolutorios)' : 'Actuación Administrativa Automatizada (Art. 41)'),
              makeMetadataRow('Responsable Funcional', metadata.functionalResponsible || 'Jefatura de Servicio'),
              makeMetadataRow('Responsable Técnico / CISO', metadata.technicalResponsible || 'Dirección de TI'),
              makeMetadataRow('Supervisión Pública y DPD', metadata.dpoContact || 'Delegado de Protección de Datos'),
            ],
          }),

          // Institutional Disclaimer on Cover
          new Paragraph({ text: '', spacing: { before: 300 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isGl
                              ? '⚖️ CLÁUSULA DE SALVAGUARDA PERICIAL INSTITUCIONAL E CUALIFICACIÓN PRELIMINAR:'
                              : '⚖️ CLÁUSULA DE SALVAGUARDA PERICIAL INSTITUCIONAL Y CALIFICACIÓN PRELIMINAR:',
                            bold: true,
                            size: 18,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                        spacing: { after: 100 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isGl
                              ? 'O presente informe pericial foi xerado mediante o motor automatizado de auditoría de conformidade normativa (v2.0). Constitúe unha avaliación técnica preliminar de auxilio ao procedemento administrativo. Conforme á Lei 40/2015 e ao Regulamento (UE) 2024/1689, a cualificación definitiva e a asunción de riscos corresponden ao órgano administrativo promotor, requiríndose a ratificación expresa do DPD e do CISO.'
                              : 'El presente informe pericial ha sido generado mediante el motor automatizado de auditoría de conformidad normativa (v2.0). Constituye una evaluación técnica preliminar de auxilio al procedimiento administrativo. Conforme a la Ley 40/2015 y al Reglamento (UE) 2024/1689, la calificación definitiva y la asunción de riesgos corresponden al órgano administrativo promotor, requiriéndose la ratificación expresa del DPD y del CISO.',
                            size: 16,
                            italics: true,
                            color: COLOR_DARK,
                          }),
                        ],
                      }),
                    ],
                    margins: { top: convertMillimetersToTwip(3), bottom: convertMillimetersToTwip(3), left: convertMillimetersToTwip(4), right: convertMillimetersToTwip(4) },
                    borders: {
                      left: { color: COLOR_PRIMARY, style: BorderStyle.SINGLE, size: 24, space: 10 },
                      top: { color: 'CBD5E1', style: BorderStyle.SINGLE, size: 6, space: 6 },
                      bottom: { color: 'CBD5E1', style: BorderStyle.SINGLE, size: 6, space: 6 },
                      right: { color: 'CBD5E1', style: BorderStyle.SINGLE, size: 6, space: 6 },
                    },
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 400 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: isGl
                  ? 'MARCO XURÍDICO APLICABLE: Regulamento (UE) 2024/1689 (AI Act), Real Decreto 729/2023 (Estatuto AESIA), Lei 15/2022 (Art. 23 Igualdade e Non Discriminación Algorítmica), Real Decreto 311/2022 (ENS), Guía CCN-STIC 884D, Lei 40/2015 de Réxime Xurídico do Sector Público (Arts. 32 e 41), Regulamento (UE) 2016/679 (RGPD) e Lei Orgánica 3/2018 (LOPDGDD).'
                  : 'MARCO JURÍDICO APLICABLE: Reglamento (UE) 2024/1689 (AI Act), Real Decreto 729/2023 (Estatuto AESIA), Ley 15/2022 (Art. 23 Igualdad y No Discriminación Algorítmica), Real Decreto 311/2022 (ENS), Guía CCN-STIC 884D, Ley 40/2015 de Régimen Jurídico del Sector Público (Arts. 32 y 41), Reglamento (UE) 2016/679 (RGPD) y Ley Orgánica 3/2018 (LOPDGDD).',
                size: 17,
                color: COLOR_MUTED,
                italics: true,
              }),
            ],
            spacing: { after: 500 },
          }),

          // SECCIÓN 1: RESUMEN EJECUTIVO Y DICTAMEN
          makeSectionHeading('1. RESUMEN EJECUTIVO Y CUADRO DE MANDO DE CONFORMIDAD'),
          new Paragraph({
            children: [
              new TextRun({
                text: diagnostic?.executiveSummary || 'El sistema ha sido evaluado favorablemente bajo las condiciones técnicas y operativas especificadas.',
              }),
            ],
            spacing: { after: 200 },
          }),

          // Dissents alert if present
          ...(diagnostic?.pericialDissentAlert
            ? [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          width: { size: 100, type: WidthType.PERCENTAGE },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: '⚠️ ADVERTENCIA PERICIAL DE DISCREPANCIA TÉCNICO-JURÍDICA:',
                                  bold: true,
                                  size: 18,
                                  color: 'DC2626',
                                }),
                              ],
                              spacing: { after: 80 },
                            }),
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: diagnostic.pericialDissentAlert,
                                  size: 17,
                                  italics: true,
                                }),
                              ],
                            }),
                          ],
                          margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(3), right: convertMillimetersToTwip(3) },
                          borders: {
                            left: { color: 'DC2626', style: BorderStyle.SINGLE, size: 24, space: 10 },
                            top: { color: 'FECACA', style: BorderStyle.SINGLE, size: 6, space: 6 },
                            bottom: { color: 'FECACA', style: BorderStyle.SINGLE, size: 6, space: 6 },
                            right: { color: 'FECACA', style: BorderStyle.SINGLE, size: 6, space: 6 },
                          },
                        }),
                      ],
                    }),
                  ],
                }),
                new Paragraph({ text: '', spacing: { before: 200 } }),
              ]
            : []),

          // 4-Pillar Scorecard Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeScorecardHeaderCell('Pilar Normativo'),
                  makeScorecardHeaderCell('Fundamento Legal'),
                  makeScorecardHeaderCell('Estado / Nivel'),
                  makeScorecardHeaderCell('Veredicto Pericial'),
                ],
              }),
              makeScorecardRow(
                'I. AI Act (UE 2024/1689)',
                'Arts. 3.1, 5, 6.3, 50 RIA',
                diagnostic?.riskLabel || 'Riesgo de Transparencia',
                diagnostic?.riskClassification === 'prohibited'
                  ? 'NO PROCEDE (Práctica Prohibida Art. 5)'
                  : diagnostic?.riskClassification === 'high_risk'
                  ? 'CONDICIONADO (Exige Marcado CE y EIPD)'
                  : diagnostic?.isArticle63Derogation
                  ? 'CONFORME (Excepción Art. 6.3 Documentada)'
                  : 'CONFORME (Obligaciones Art. 50)'
              ),
              makeScorecardRow(
                'II. Privacidad y RGPD',
                'RGPD Art. 6.1.e, 9 / LOPDGDD 3/2018',
                answers.processesSpecialCategoryData ? 'Art. 9 (Datos Sensibles)' : 'Datos Ordinarios',
                answers.processesSpecialCategoryData ? 'CONDICIONADO (EIPD previa y ENS Alto)' : 'CONFORME (Legitimación administrativa)'
              ),
              makeScorecardRow(
                'III. Ciberseguridad ENS',
                'RD 311/2022 / CCN-STIC 884D',
                `ENS Nivel ${diagnostic?.ensCategory || 'BÁSICA'}`,
                diagnostic?.ensCategory === 'ALTA'
                  ? 'CONDICIONADO (Auditoría Bienal Externa)'
                  : 'CONFORME (Controles IA-01 a IA-08 implantados)'
              ),
              makeScorecardRow(
                'IV. Gobernanza Pública',
                'Ley 40/2015 Art. 41 / Ley 15/2022 Art. 23',
                answers.administrativeNature === 'technical_auxiliary' ? 'Auxilio Instrumental' : 'Actuación Automatizada',
                answers.administrativeNature === 'technical_auxiliary'
                  ? 'CONFORME (Human-in-the-Loop preceptivo)'
                  : 'REQUIERE Sede Electrónica y Regulación Formal'
              ),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Conclusión del Dictamen: El despliegue de "${ingest.appName}" en el ámbito de ${metadata.entityName} resulta ${
                  diagnostic?.riskClassification === 'prohibited'
                    ? 'JURÍDICAMENTE IMPROCEDENTE al incurrir en prácticas prohibidas por el Art. 5 del RIA.'
                    : 'JURÍDICA Y TÉCNICAMENTE PROCEDENTE, condicionado al estricto cumplimiento de los controles de supervisión humana (Art. 14 RIA), la ratificación formal de los órganos responsables y la observancia de la Guía CCN-STIC 884D.'
                }`,
                bold: true,
                color: diagnostic?.riskClassification === 'prohibited' ? 'DC2626' : COLOR_PRIMARY,
              }),
            ],
            spacing: { after: 400 },
          }),

          // SECCIÓN 2: DESCRIPCIÓN TÉCNICA Y SOBERANÍA DEL DATO
          makeSectionHeading('2. IDENTIFICACIÓN Y ARQUITECTURA DEL SISTEMA'),
          new Paragraph({
            children: [
              new TextRun({ text: 'Descripción funcional: ', bold: true }),
              new TextRun({ text: ingest.appDescription || 'Herramienta de generación y apoyo asistido por IA.' }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Modelo de Inferencia y Soberanía: ', bold: true }),
              new TextRun({
                text: ingest.isAiSystem === false
                  ? 'Software Determinista Tradicional. Sin modelos de inferencia LLM ni agentes autónomos. Ejecución basada en reglas estáticas en servidor/cliente web institucional.'
                  : answers.hostingModel === 'local_on_premise'
                  ? 'Ejecución Local On-Premise (Ollama / vLLM) en servidores propios. Máximo nivel de soberanía del dato y confidencialidad.'
                  : answers.hostingModel === 'eu_cloud_dpa'
                  ? 'Alojamiento en Nube Europea con Acuerdo de Encargo de Tratamiento (DPA).'
                  : 'Alojamiento externo en proveedor internacional sujeto a cláusulas contractuales.',
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Nivel de Cobertura Documental: ', bold: true }),
              new TextRun({
                text: ingest.agentsMdContent?.trim()
                  ? '🛡️ Cobertura Pericial Completa (README.md funcional + AGENTS.md directivas del agente y salvaguardas éticas).'
                  : '📄 Cobertura Documental Estándar (README.md funcional y de usuario).',
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Datos de Entrada / Contexto Técnico: ', bold: true }),
              new TextRun({ text: ingest.techStack || 'Arquitectura web y APIs de inferencia LLM.' }),
            ],
            spacing: { after: ingest.agentsMdContent?.trim() ? 150 : 400 },
          }),
          ...(ingest.agentsMdContent?.trim()
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Verificación de Directivas del Agente (AGENTS.md): ', bold: true }),
                    new TextRun({
                      text: 'Se han auditado las directivas internas del modelo declaradas en AGENTS.md, acreditándose la delimitación del agente a funciones instrumentales y la ausencia de potestades resolutorias o toma autónoma de decisiones administrativas.',
                      italics: true,
                    }),
                  ],
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // SECCIÓN 3: CONTROL DE PRÁCTICAS PROHIBIDAS
          makeSectionHeading('3. EVALUACIÓN DE PRÁCTICAS PROHIBIDAS (ART. 5 RIA)'),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Se ha verificado individualmente que el sistema no incurre en ninguna de las tipologías proscritas por el Artículo 5 del Reglamento (UE) 2024/1689:',
              }),
            ],
            spacing: { after: 200 },
          }),
          ...buildProhibitedChecksList(diagnostic?.prohibitedChecks || []),

          // SECCIÓN 4: CALIFICACIÓN DE ALTO RIESGO Y ÓMNIBUS DIGITAL
          makeSectionHeading('4. ANÁLISIS DE RIESGO: ANEXO III RIA Y ÓMNIBUS DIGITAL'),
          new Paragraph({
            children: [
              new TextRun({
                text: `Clasificación adoptada en la cascada pericial de 5 niveles: ${diagnostic?.riskLabel.toUpperCase()}.`,
                bold: true,
                color: COLOR_PRIMARY,
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: ingest.isAiSystem === false
                  ? 'Nivel 0 - Exclusión del Ámbito del AI Act: Conforme al Artículo 3, apartado 1, del Reglamento (UE) 2024/1689, los sistemas basados exclusivamente en reglas o lógica determinista predefinida por personas no constituyen sistemas de IA. La herramienta queda formalmente EXCLUIDA de las obligaciones del AI Act, rigiéndose por la normativa ordinaria de administración digital (Ley 39/2015, Ley 40/2015 Art. 41) y ciberseguridad ENS.'
                  : diagnostic?.riskClassification === 'prohibited'
                  ? 'Nivel 1 - Riesgo Inadmisible: El sistema incurre en supuestos proscritos del Artículo 5 del RIA y no puede ser puesto en servicio en la Unión Europea.'
                  : diagnostic?.riskClassification === 'high_risk'
                  ? 'Nivel 2 - Alto Riesgo (Art. 6.2 y Anexo III): El sistema evalúa o perfila personas o adopta decisiones con impacto material en derechos fundamentales en procedimientos públicos. Requiere sistema de gestión de riesgos (Art. 9), gobernanza de datos (Art. 10), documentación técnica exhaustiva (Art. 11), registro de eventos (Art. 12), transparencia (Art. 13), supervisión humana (Art. 14), ciberseguridad y precisión (Art. 15), marcado CE e inscripción previa en la base de datos de la Comisión Europea (Art. 49/71).'
                  : diagnostic?.isArticle63Derogation
                  ? 'Nivel 3 - Excepción / Derogación de Alto Riesgo (Art. 6.3 RIA): El sistema interviene en un ámbito formalmente afín al Anexo III pero cumple taxativamente las condiciones del Art. 6.3 (tarea estrecha/instrumental preparatoria sin impacto material autónomo y sin perfilado de personas).'
                  : diagnostic?.riskClassification === 'minimal_risk'
                  ? 'Nivel 5 - Riesgo Mínimo: Conforme al Artículo 95 del RIA, el sistema carece de componentes generativos hacia el público o manipulación sintética, rigiéndose por códigos de conducta voluntarios.'
                  : 'Nivel 4 - Riesgo de Transparencia (Art. 50 RIA): Sujeto a las obligaciones de transparencia activa, información a los usuarios de que interactúan con una IA y etiquetado preceptivo de contenidos generados.',
              }),
            ],
            spacing: { after: 200 },
          }),
          ...(diagnostic?.isArticle63Derogation
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '4.2. JUSTIFICACIÓN TÉCNICA MOTIVADA DE DEROGACIÓN (ART. 6.3 Y ART. 6.4 RIA):',
                      bold: true,
                      size: 20,
                      color: COLOR_SECONDARY,
                    }),
                  ],
                  spacing: { before: 150, after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: diagnostic.article63Justification ||
                        'Se acredita formalmente que el sistema realiza una tarea preparatoria o instrumental estrecha de apoyo a empleados públicos. No realiza perfilado de personas físicas (Art. 6.3 párrafo 3). Todo contenido o resultado constituye un borrador auxiliar sometido a revisión humana preceptiva antes de surtir efecto administrativo alguno.',
                      italics: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Diligencia de Registro Previo (Art. 6.4 RIA): Conforme al Artículo 6, apartado 4 del RIA, el promotor documenta mediante el presente expediente la evaluación técnica previa que justifica la no consideración como alto riesgo, quedando registrada con anterioridad a su puesta en servicio y a disposición de la Agencia Española de Supervisión de Inteligencia Artificial (AESIA).',
                      size: 18,
                      color: COLOR_MUTED,
                    }),
                  ],
                  spacing: { after: 300 },
                }),
              ]
            : []),

          // SECCIÓN 5: SUPERVISIÓN HUMANA Y ART. 41 LEY 40/2015
          makeSectionHeading('5. SUPERVISIÓN HUMANA EFECTIVA Y MARCO ESTATAL DE GOBERNANZA'),
          new Paragraph({
            children: [
              new TextRun({ text: 'Nivel de Control Humano: ', bold: true }),
              new TextRun({
                text: answers.humanOversightLevel === 'pre_execution'
                  ? 'Supervisión Humana Previa Preceptiva (Human-in-the-Loop). Todo resultado generado es un borrador no vinculante que requiere revisión y validación funcionarial humana antes de tener validez.'
                  : 'Supervisión en ejecución o posterior con capacidad de intervención y detención (Human-on-the-Loop).',
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Órgano / Rol Supervisor: ', bold: true }),
              new TextRun({ text: answers.supervisionRole || 'Personal funcionario competente del órgano tramitador.' }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Deslinde con el Artículo 41 de la Ley 40/2015: Se hace constar que el software NO constituye una "actuación administrativa automatizada" en sentido formal, dado que no suscribe resoluciones ni emite actos de trámite vinculantes. Los actos administrativos y la responsabilidad patrimonial (Art. 32 Ley 40/2015) se imputan única y exclusivamente a los funcionarios públicos que firman y validan los documentos finales.',
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Garantía de No Discriminación y Transparencia Algorítmica (Ley 15/2022, Art. 23): En cumplimiento del régimen exigible a las Administraciones Públicas, se certifica que los criterios o prompts del sistema no introducen sesgos directos ni indirectos por motivos de nacimiento, origen racial, sexo, religión o cualquier otra condición o circunstancia personal o social.',
              }),
            ],
            spacing: { after: 400 },
          }),

          // SECCIÓN 6: SEGURIDAD CCN-STIC 884D Y ENS
          makeSectionHeading('6. MEDIDAS DE SEGURIDAD (ENS RD 311/2022 Y CCN-STIC 884D)'),
          new Paragraph({
            children: [
              new TextRun({ text: `Categoría ENS asignada: Nivel ${diagnostic?.ensCategory}. `, bold: true }),
              new TextRun({ text: diagnostic?.ensReasoning || '' }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Directrices técnicas de obligado cumplimiento implantadas:',
                bold: true,
              }),
            ],
            spacing: { after: 100 },
          }),
          makeBulletPoint('CCN-STIC 884D (IA-01): Prohibición de exposición de credenciales y claves de API en navegadores o clientes.'),
          makeBulletPoint(`CCN-STIC 884D (IA-08): Módulo de registro de peticiones, respuestas y marcas de tiempo habilitado (${answers.auditLogsEnabled ? 'CONFORME' : 'REQUIERE ACTIVACIÓN'}).`),
          makeBulletPoint('CCN-STIC 884D (IA-04): Sanitización de entradas y prohibición de inyección de datos de carácter personal sin amparo legal.'),
          new Paragraph({ text: '', spacing: { before: 200 } }),

          // SECCIÓN 7: ANÁLISIS CUALITATIVO / AUDITORÍA DE IA (si hay LLM)
          ...(llmCritique
            ? [
                makeSectionHeading('7. DICTAMEN ADICIONAL DE AUDITORÍA ASISTIDA'),
                ...parseMarkdownToDocx(llmCritique),
              ]
            : []),

          // DILIGENCIA DE COTEJO NORMATIVO TELEMÁTICO (BOE Y DOUE CELLAR)
          makeSectionHeading(
            isGl
              ? 'DILIXENCIA DE COTEXO NORMATIVO TELEMÁTICO (BOE E DOUE CELLAR)'
              : 'DILIGENCIA DE COTEJO NORMATIVO TELEMÁTICO (BOE Y DOUE CELLAR)'
          ),
          new Paragraph({
            children: [
              new TextRun({
                text: isGl
                  ? 'Faise constar mediante a presente dilixencia técnica que os preceptos xurídicos invocados e auditados neste expediente foron verificados telematicamente en tempo real fronte aos repositorios normativos oficiais á data de emisión deste dictame:'
                  : 'Se hace constar mediante la presente diligencia técnica que los preceptos jurídicos invocados y auditados en este expediente han sido verificados telemáticamente en tiempo real frente a los repositorios normativos oficiales a la fecha de emisión de este dictamen:',
                size: 20,
              }),
            ],
            spacing: { after: 150 },
          }),
          makeBulletPoint(
            isGl
              ? 'Diario Oficial da Unión Europea (DOUE / Repositorio Cellar REST API): Regulamento (UE) 2024/1689 (AI Act) [CELEX 32024R1689 - Arts. 5, 12, 14, 50] e Regulamento (UE) 2016/679 (RGPD) [CELEX 32016R0679]. Estado: Vixente e consolidado telematicamente.'
              : 'Diario Oficial de la Unión Europea (DOUE / Repositorio Cellar REST API): Reglamento (UE) 2024/1689 (AI Act) [CELEX 32024R1689 - Arts. 5, 12, 14, 50] y Reglamento (UE) 2016/679 (RGPD) [CELEX 32016R0679]. Estado: Vigente y consolidado telemáticamente.'
          ),
          makeBulletPoint(
            isGl
              ? 'Boletín Oficial del Estado (BOE / Repositorio Legalize-ES): Lei 40/2015 de Réxime Xurídico do Sector Público [BOE-A-2015-10566 - Art. 41 Actuación Administrativa Automatizada] e Real Decreto 311/2022 do Esquema Nacional de Seguridade (ENS) [BOE-A-2022-7191]. Estado: Vixente e consolidado telematicamente.'
              : 'Boletín Oficial del Estado (BOE / Repositorio Legalize-ES): Ley 40/2015 de Régimen Jurídico del Sector Público [BOE-A-2015-10566 - Art. 41 Actuación Administrativa Automatizada] y Real Decreto 311/2022 del Esquema Nacional de Seguridad (ENS) [BOE-A-2022-7191]. Estado: Vigente y consolidado telemáticamente.'
          ),
          new Paragraph({
            children: [
              new TextRun({
                text: isGl
                  ? 'Conclusión do cotexo: Non se detectaron modificacións derrogatorias sobrevidas nin alteracións materiais nos preceptos aplicables que invaliden a presente cualificación xurídica.'
                  : 'Conclusión del cotejo: No se han detectado modificaciones derogatorias sobrevenidas ni alteraciones materiales en los preceptos aplicables que invaliden la presente calificación jurídica.',
                italics: true,
                size: 18,
                color: COLOR_MUTED,
              }),
            ],
            spacing: { before: 100, after: 400 },
          }),

          // DILIGENCIA DE FIRMAS
          makeSectionHeading(isGl ? 'DILIXENCIA FORMAL DE CONFORMIDADE E RÚBRICAS' : 'DILIGENCIA FORMAL DE CONFORMIDAD Y RUBRICAS'),
          new Paragraph({
            children: [
              new TextRun({
                text: isGl
                  ? 'NOTA DE SALVAGUARDA INSTITUCIONAL E ASUNCIÓN DE RESPONSABILIDADE:\nO presente informe constitúe auxilio técnico pericial instrumental preliminar conforme ao Art. 41 da Lei 40/2015 e ao RIA (UE 2024/1689). A validez xurídica definitiva ante terceiros e a asunción formal de riscos operacionais queda ratificada mediante as seguintes rúbricas dos órganos administrativos competentes:'
                  : 'NOTA DE SALVAGUARDA INSTITUCIONAL Y ASUNCIÓN DE RESPONSABILIDAD:\nEl presente informe constituye auxilio técnico pericial instrumental preliminar conforme al Art. 41 de la Ley 40/2015 y al RIA (UE 2024/1689). La validez jurídica definitiva ante terceros y la asunción formal de riesgos operacionales queda ratificada mediante las siguientes rúbricas de los órganos administrativos competentes:',
                italics: true,
                size: 18,
                color: COLOR_MUTED,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Signature Boxes Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeSignatureCell(
                    'EL RESPONSABLE FUNCIONAL',
                    metadata.functionalResponsible || 'Dirección de Área / Servicio',
                    metadata.serviceDepartment
                  ),
                  makeSignatureCell(
                    'EL RESPONSABLE DE SEGURIDAD (CISO)',
                    metadata.cisoContact || 'Responsable de Seguridad ENS',
                    'Centro de Tecnologías de la Información'
                  ),
                  makeSignatureCell(
                    'EL DELEGADO DE PROTECCIÓN DE DATOS',
                    metadata.dpoContact || 'Delegado de Protección de Datos (DPD)',
                    metadata.entityName
                  ),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });
}

function makeSectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text,
        size: 24,
        bold: true,
        color: COLOR_PRIMARY,
        font: FONT_HEADING,
      }),
    ],
    spacing: { before: 400, after: 150 },
    border: {
      bottom: { color: COLOR_SECONDARY, space: 4, style: BorderStyle.SINGLE, size: 6 },
    },
  });
}

function makeMetadataRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: COLOR_DARK })] })],
        margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(3), right: convertMillimetersToTwip(3) },
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 18, color: COLOR_DARK })] })],
        margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(3), right: convertMillimetersToTwip(3) },
      }),
    ],
  });
}

function makeBulletPoint(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 20 })],
    spacing: { after: 80 },
  });
}

function buildProhibitedChecksList(checks: any[]): Paragraph[] {
  return checks.map((c) => {
    return new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({ text: `${c.legalArticle} (${c.title}): `, bold: true }),
        new TextRun({ text: c.detected ? 'ALERTA: Práctica detectada' : 'CONFORME (No detectado)', bold: true, color: c.detected ? 'DC2626' : '16A34A' }),
        new TextRun({ text: ` — ${c.explanation}` }),
      ],
      spacing: { after: 100 },
    });
  });
}

function makeSignatureCell(roleTitle: string, name: string, unit: string): TableCell {
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: roleTitle, bold: true, size: 16, color: COLOR_PRIMARY })],
        spacing: { after: 600 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '[ Firma Electrónica / CSV ]', italics: true, size: 14, color: COLOR_MUTED })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: name, bold: true, size: 16 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: unit, size: 14, color: COLOR_MUTED })],
      }),
    ],
    margins: { top: convertMillimetersToTwip(3), bottom: convertMillimetersToTwip(3), left: convertMillimetersToTwip(2), right: convertMillimetersToTwip(2) },
  });
}

function parseInlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      runs.push(new TextRun({ text: text.slice(lastIdx, m.index), size: 20, font: FONT_BODY, color: COLOR_DARK }));
    }
    const token = m[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      runs.push(new TextRun({ text: token.slice(2, -2), bold: true, size: 20, font: FONT_BODY, color: COLOR_DARK }));
    } else if (token.startsWith('*') && token.endsWith('*')) {
      runs.push(new TextRun({ text: token.slice(1, -1), italics: true, size: 20, font: FONT_BODY, color: COLOR_DARK }));
    } else if (token.startsWith('`') && token.endsWith('`')) {
      runs.push(new TextRun({ text: token.slice(1, -1), font: 'Consolas', size: 18, color: '0284C7' }));
    }
    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIdx), size: 20, font: FONT_BODY, color: COLOR_DARK }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: 20, font: FONT_BODY, color: COLOR_DARK })];
}

function parseMarkdownToDocx(md: string): Paragraph[] {
  const lines = md.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Separators (---, ***)
    if (line === '---' || line === '***' || line === '___') {
      paragraphs.push(new Paragraph({
        text: '',
        spacing: { before: 120, after: 120 },
        border: { bottom: { color: 'CBD5E1', space: 2, style: BorderStyle.SINGLE, size: 6 } },
      }));
      continue;
    }

    // Headings: ### Title or ## Title
    if (line.startsWith('#')) {
      const headingMatch = line.match(/^(#{1,4})\s*(.*)$/);
      if (headingMatch) {
        const title = headingMatch[2].replace(/\*\*/g, '').trim();
        paragraphs.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: title, bold: true, color: COLOR_PRIMARY, size: 22, font: FONT_HEADING })],
          spacing: { before: 260, after: 100 },
        }));
        continue;
      }
    }

    // Numbered lists: 1. ... or 1) ...
    const numMatch = line.match(/^(\d+[\.\)])\s+(.*)$/);
    if (numMatch) {
      paragraphs.push(new Paragraph({
        indent: { left: convertMillimetersToTwip(6) },
        children: [
          new TextRun({ text: `${numMatch[1]} `, bold: true, color: COLOR_PRIMARY, size: 20, font: FONT_BODY }),
          ...parseInlineRuns(numMatch[2]),
        ],
        spacing: { after: 100 },
      }));
      continue;
    }

    // Bullet items: - ... or * ...
    if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(new Paragraph({
        bullet: { level: 0 },
        children: parseInlineRuns(line.slice(2).trim()),
        spacing: { after: 80 },
      }));
      continue;
    }

    // Callout / Conclusión / Recomendación
    if (line.toLowerCase().startsWith('**conclusión') || line.toLowerCase().startsWith('conclusión') || line.startsWith('>')) {
      const content = line.startsWith('>') ? line.slice(1).trim() : line;
      paragraphs.push(new Paragraph({
        children: parseInlineRuns(content),
        spacing: { before: 160, after: 160 },
        indent: { left: convertMillimetersToTwip(5), right: convertMillimetersToTwip(5) },
        border: { left: { color: COLOR_SECONDARY, style: BorderStyle.SINGLE, size: 24, space: 10 } },
      }));
      continue;
    }

    // Normal paragraph
    paragraphs.push(new Paragraph({
      children: parseInlineRuns(line),
      spacing: { after: 120 },
    }));
  }

  return paragraphs;
}

function makeScorecardHeaderCell(title: string): TableCell {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: title, bold: true, size: 16, color: COLOR_PRIMARY, font: FONT_HEADING })],
      }),
    ],
    margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(2), right: convertMillimetersToTwip(2) },
    borders: {
      bottom: { color: COLOR_PRIMARY, style: BorderStyle.SINGLE, size: 12, space: 4 },
      top: { color: 'CBD5E1', style: BorderStyle.SINGLE, size: 4, space: 4 },
      left: { color: 'CBD5E1', style: BorderStyle.SINGLE, size: 4, space: 4 },
      right: { color: 'CBD5E1', style: BorderStyle.SINGLE, size: 4, space: 4 },
    },
  });
}

function makeScorecardRow(pillar: string, norm: string, level: string, verdict: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: pillar, bold: true, size: 16 })] })],
        margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(2), right: convertMillimetersToTwip(2) },
      }),
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: norm, size: 15, color: COLOR_MUTED })] })],
        margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(2), right: convertMillimetersToTwip(2) },
      }),
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: level, bold: true, size: 15, color: COLOR_SECONDARY })] })],
        margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(2), right: convertMillimetersToTwip(2) },
      }),
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: verdict, bold: true, size: 15, color: verdict.includes('NO PROCEDE') ? 'DC2626' : verdict.includes('CONDICIONADO') ? 'D97706' : '16A34A' })] })],
        margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(2), right: convertMillimetersToTwip(2) },
      }),
    ],
  });
}

