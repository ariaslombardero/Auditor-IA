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
import type { FullAuditState, AppIdioma, RequirementAssessment, RequirementResult } from '../types';
import { obligations, prohibitedPractices, requirementsByPillar, resultLabel, originLabel, applicabilityLabel } from './assessmentModel';
import { computeExecutivePillars, computeExecutiveVerdict, type PillarStatus } from './dashboardPillars';
import { effectiveDiagnostic } from './validations';
import { describirAsistencia } from './proveedorEfectivo';
import { answerProvenanceRows, PROVENANCE_NOTE } from './answerProvenance';
import { buildDocumentTraceability, ENGINE_VERSION, NORMATIVE_SNAPSHOT, TRACEABILITY_NOT_COMPUTED, type DocumentTraceability } from './traceability';

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
  const traceability = await buildDocumentTraceability(state);
  const doc = buildOfficialDossierDocument(state, llmCritique, idioma, traceability);
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
  idioma: AppIdioma = 'castellano',
  traceability?: DocumentTraceability
): Document {
  const { ingest, answers, metadata } = state;
  const diagnostic = effectiveDiagnostic(state);
  const isGl = idioma === 'galego';
  const requirements = diagnostic?.requirements || [];
  const pillars = diagnostic ? computeExecutivePillars(diagnostic) : null;
  const verdict = diagnostic ? computeExecutiveVerdict(diagnostic) : null;

  return new Document({
    // Metadatos del fichero. Los metadatos ENI del documento electrónico (NTI) los añade el gestor de expedientes.
    title: `Informe técnico preliminar de adecuación normativa: ${ingest.appName || 'sistema de IA'}`,
    subject: 'Diagnóstico preliminar de un sistema de IA (RIA, RGPD, ENS y Ley 40/2015)',
    creator: `Auditor IA, herramienta de apoyo (motor v${diagnostic?.engineVersion || ENGINE_VERSION})`,
    lastModifiedBy: 'Auditor IA, herramienta de apoyo',
    description: 'Informe técnico preliminar generado a partir de lo declarado por el promotor. No es un acto administrativo ni acredita el cumplimiento: requiere la revisión y firma de los responsables competentes.',
    keywords: 'RIA; Reglamento (UE) 2024/1689; ENS; RGPD; informe preliminar',
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
                      ? 'Informe técnico preliminar RIA (Reg. UE 2024/1689) e ENS (RD 311/2022) · Páxina '
                      : 'Informe técnico preliminar RIA (Reg. UE 2024/1689) y ENS (RD 311/2022) · Página ',
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
                  ? 'INFORME TÉCNICO PRELIMINAR DE ADECUACIÓN NORMATIVA DE SISTEMA DE INTELIXENCIA ARTIFICIAL'
                  : 'INFORME TÉCNICO PRELIMINAR DE ADECUACIÓN NORMATIVA DE SISTEMA DE INTELIGENCIA ARTIFICIAL',
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
              makeMetadataRow('Régimen Jurídico (Ley 40/2015)', answers.directHumanIntervention === 'no' ? 'Actuación administrativa automatizada declarada (Art. 41)' : answers.directHumanIntervention === 'si' ? 'Intervención directa de un empleado público (declarada)' : 'No consta'),
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
                              ? '⚖️ CLÁUSULA DE SALVAGARDA E CUALIFICACIÓN PRELIMINAR:'
                              : '⚖️ CLÁUSULA DE SALVAGUARDA Y CALIFICACIÓN PRELIMINAR:',
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
                              ? `O presente informe técnico foi xerado mediante unha ferramenta automatizada de diagnóstico (motor v${diagnostic?.engineVersion || ENGINE_VERSION}) a partir do declarado polo promotor. Non é un acto administrativo nin acredita o cumprimento: a cualificación definitiva e a asunción de riscos corresponden ao órgano competente, coa revisión expresa do DPD e do Responsable de Seguridade.`
                              : `El presente informe técnico ha sido generado mediante una herramienta automatizada de diagnóstico (motor v${diagnostic?.engineVersion || ENGINE_VERSION}) a partir de lo declarado por el promotor. No es un acto administrativo ni acredita el cumplimiento: la calificación definitiva y la asunción de riesgos corresponden al órgano competente, con la revisión expresa del DPD y del Responsable de Seguridad.`,
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
                  ? 'MARCO XURÍDICO APLICABLE: Regulamento (UE) 2024/1689 (AI Act), Real Decreto 729/2023 (Estatuto AESIA), Lei 15/2022 (Art. 23 Igualdade e Non Discriminación Algorítmica), Real Decreto 311/2022 (ENS), Regulamento (UE) 2026/1744 (Ómnibus dixital sobre IA), Lei 40/2015 de Réxime Xurídico do Sector Público (Arts. 32, 36, 41 e 43), Regulamento (UE) 2016/679 (RGPD) e Lei Orgánica 3/2018 (LOPDGDD).'
                  : 'MARCO JURÍDICO APLICABLE: Reglamento (UE) 2024/1689 (AI Act), Real Decreto 729/2023 (Estatuto AESIA), Ley 15/2022 (Art. 23 Igualdad y No Discriminación Algorítmica), Real Decreto 311/2022 (ENS), Reglamento (UE) 2026/1744 (Ómnibus digital sobre IA), Ley 40/2015 de Régimen Jurídico del Sector Público (Arts. 32, 36, 41 y 43), Reglamento (UE) 2016/679 (RGPD) y Ley Orgánica 3/2018 (LOPDGDD).',
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
                text: diagnostic?.executiveSummary || 'Diagnóstico no disponible.',
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
                                  text: '⚠️ POSIBLE DISCREPANCIA DE CLASIFICACIÓN (NO VERIFICADA):',
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
                  makeScorecardHeaderCell('Estado de acreditación'),
                ],
              }),
              makeScorecardRow('I. RIA (UE 2024/1689)', 'Arts. 3.1, 5, 6 y 50 RIA', diagnostic?.riskLabel || '—', pillars?.ria.text || '—', pillars?.ria.status || 'neutral'),
              makeScorecardRow('II. Privacidad y RGPD', 'RGPD Arts. 6.1, 9, 10 y 30 / LOPDGDD', pillars?.rgpd.label || '—', pillars?.rgpd.text || '—', pillars?.rgpd.status || 'neutral'),
              makeScorecardRow('III. Ciberseguridad ENS', 'RD 311/2022, Anexo II', pillars?.ens.label || '—', pillars?.ens.text || '—', pillars?.ens.status || 'neutral'),
              makeScorecardRow('IV. Gobernanza pública', 'Ley 40/2015 Art. 41 / Ley 15/2022 Art. 23', pillars?.gobernanza.label || '—', pillars?.gobernanza.text || '—', pillars?.gobernanza.status || 'neutral'),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: verdict ? `Conclusión preliminar: ${verdict.label.replace('VEREDICTO: ', '')}. ${verdict.detail}` : 'Conclusión no disponible.',
                bold: true,
                color: verdict?.level === 'blocked' ? 'DC2626' : verdict?.level === 'conditioned' ? 'D97706' : COLOR_PRIMARY,
              }),
            ],
            spacing: { after: 400 },
          }),
          ...(diagnostic?.redFlags?.length
            ? [
                new Paragraph({ children: [new TextRun({ text: isGl ? 'Alertas para a revisión' : 'Alertas para la revisión', bold: true, color: 'B91C1C' })], spacing: { after: 100 } }),
                ...diagnostic.redFlags.map((f) => makeBulletPoint(f)),
              ]
            : []),
          ...(diagnostic?.recommendations?.length
            ? [
                new Paragraph({ children: [new TextRun({ text: isGl ? 'Recomendacións' : 'Recomendaciones', bold: true, color: COLOR_PRIMARY })], spacing: { before: 200, after: 100 } }),
                ...diagnostic.recommendations.map((r) => makeBulletPoint(r)),
                new Paragraph({ text: '', spacing: { after: 300 } }),
              ]
            : []),

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
                text: diagnostic?.riskClassification === 'not_ai_system'
                  ? 'Software Determinista Tradicional. Sin modelos de inferencia LLM ni agentes autónomos. Ejecución basada en reglas estáticas en servidor/cliente web institucional.'
                  : answers.hostingModel === 'local_on_premise'
                  ? 'Declarado: ejecución local en servidores propios (Ollama / vLLM). No se ha comprobado el proveedor efectivamente utilizado.'
                  : answers.hostingModel === 'eu_cloud_dpa'
                  ? 'Declarado: alojamiento en nube europea con contrato de encargo del tratamiento.'
                  : 'Declarado: alojamiento en proveedor internacional sujeto a cláusulas contractuales.',
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Documentación aportada: ', bold: true }),
              new TextRun({
                text: ingest.agentsMdContent?.trim()
                  ? 'README.md y AGENTS.md (directivas del agente). Ambos son declaraciones del promotor.'
                  : 'README.md (documentación funcional y de usuario).',
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
                    new TextRun({ text: 'Directivas del agente (AGENTS.md): ', bold: true }),
                    new TextRun({
                      text: 'Se han tenido en cuenta como declaraciones del promotor. No se ha verificado que el sistema las cumpla en funcionamiento.',
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
                text: 'Estado de cada práctica del Artículo 5 del Reglamento (UE) 2024/1689. «No evaluado» significa que la herramienta no la ha examinado y que debe confirmarse en la revisión jurídica; «Pendiente» indica un indicio que requiere verificación:',
              }),
            ],
            spacing: { after: 200 },
          }),
          ...buildProhibitedChecksList(prohibitedPractices(requirements)),

          // SECCIÓN 4: CALIFICACIÓN DE ALTO RIESGO Y ÓMNIBUS DIGITAL
          makeSectionHeading('4. CLASIFICACIÓN SEGÚN EL RIA (ANEXO III Y EXCEPCIÓN DEL ART. 6.3)'),
          new Paragraph({
            children: [
              new TextRun({
                text: `Clasificación preliminar, basada en lo declarado: ${diagnostic?.riskLabel.toUpperCase()}.`,
                bold: true,
                color: COLOR_PRIMARY,
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: diagnostic?.riskClassification === 'requires_review'
                  ? `Clasificación no concluyente: ${diagnostic.reviewReasons.join(' ')}`
                  : diagnostic?.riskClassification === 'not_ai_system'
                  ? 'Nivel 0 - Exclusión del ámbito del RIA: según lo declarado, el sistema se basa exclusivamente en reglas predefinidas, sin capacidad de inferencia, por lo que no sería un sistema de IA (Art. 3.1 del Reglamento (UE) 2024/1689). En ese caso se rige por la normativa de administración electrónica (Ley 39/2015, Ley 40/2015) y por el ENS.'
                  : diagnostic?.riskClassification === 'prohibited'
                  ? 'Nivel 1 - Práctica prohibida declarada: se ha declarado que el sistema incurre en una práctica del Artículo 5 del RIA. No puede introducirse en el mercado, ponerse en servicio ni utilizarse; requiere revisión jurídica.'
                  : diagnostic?.riskClassification === 'high_risk'
                  ? 'Nivel 2 - Alto Riesgo (Art. 6.2 y Anexo III): según lo declarado, el sistema interviene en un ámbito del Anexo III. Como proveedor: gestión de riesgos (Art. 9), gobernanza de datos (Art. 10), documentación técnica (Art. 11), registro de eventos (Art. 12), transparencia (Art. 13), supervisión humana (Art. 14), precisión y ciberseguridad (Art. 15), evaluación de la conformidad por control interno sin organismo notificado (Art. 43.2 y Anexo VI), marcado CE y registro (Arts. 49 y 71). Como responsable del despliegue: Art. 26 y evaluación de impacto en los derechos fundamentales (Art. 27). Exigibles para el Anexo III desde el 2 de diciembre de 2027 (Reglamento (UE) 2026/1744).'
                  : diagnostic?.isArticle63Derogation
                  ? 'Nivel 3 - Excepción del Art. 6.3 RIA: según lo declarado, el sistema interviene en un ámbito del Anexo III pero se acogería a la excepción del Art. 6.3, que exige que concurra al menos una de sus condiciones a) a d), que no influya sustancialmente en el resultado de la decisión y que no haya perfilado de personas físicas. Debe documentarse (Art. 6.4) y registrarse (Art. 49.2).'
                  : diagnostic?.riskClassification === 'minimal_risk'
                  ? 'Nivel 5 - Riesgo Mínimo: según lo declarado, el sistema no interactúa con personas ni genera contenido sintético; puede adherirse a códigos de conducta voluntarios (Art. 95 RIA).'
                  : 'Nivel 4 - Riesgo de Transparencia (Art. 50 RIA): según lo declarado, el sistema interactúa con personas o genera contenido, por lo que debe informar de que se interactúa con una IA y marcar el contenido generado.',
              }),
            ],
            spacing: { after: 200 },
          }),
          ...(diagnostic?.isArticle63Derogation
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '4.2. FUNDAMENTO DECLARADO DE LA EXCEPCIÓN (ART. 6.3 RIA):',
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
                      text: diagnostic.article63Justification || 'Sin fundamento declarado.',
                      italics: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Pendiente (Arts. 6.4 y 49.2 RIA): el proveedor debe documentar su evaluación antes de la puesta en servicio, facilitarla a las autoridades que la soliciten y registrar el sistema en la base de datos de la UE. Este informe recoge lo declarado, pero no sustituye esa documentación ni el registro.',
                      size: 18,
                      color: COLOR_MUTED,
                    }),
                  ],
                  spacing: { after: 300 },
                }),
              ]
            : []),

          // 4.3. TRAZA DE LA CLASIFICACIÓN
          new Paragraph({
            children: [new TextRun({ text: '4.3. TRAZA DE LA CLASIFICACIÓN', bold: true, size: 20, color: COLOR_SECONDARY })],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Corte normativo: ${diagnostic?.normativeVersion || '—'}. Cada paso indica la pregunta, la respuesta declarada, la regla aplicada, la fuente y sus límites.`, italics: true, size: 18, color: COLOR_MUTED })],
            spacing: { after: 100 },
          }),
          ...(diagnostic?.classificationTrace || []).flatMap((step) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${step.id} · ${step.pregunta}`, bold: true, size: 19 }),
              ],
              spacing: { before: 80, after: 20 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Respuesta: ', bold: true, size: 18 }),
                new TextRun({ text: step.respuesta, size: 18 }),
                new TextRun({ text: ' · Conclusión: ', bold: true, size: 18 }),
                new TextRun({ text: step.conclusion, size: 18 }),
              ],
              spacing: { after: 20 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Regla: ${step.regla} Fuente: ${step.fuente}.${step.limites ? ` Límites: ${step.limites}` : ''}`, size: 16, color: COLOR_MUTED }),
              ],
              spacing: { after: 60 },
            }),
          ]),
          new Paragraph({ text: '', spacing: { before: 200 } }),

          // SECCIÓN 5: SUPERVISIÓN HUMANA Y ART. 41 LEY 40/2015
          makeSectionHeading('5. SUPERVISIÓN HUMANA EFECTIVA Y MARCO ESTATAL DE GOBERNANZA'),
          new Paragraph({
            children: [
              new TextRun({ text: 'Nivel de Control Humano: ', bold: true }),
              new TextRun({
                text: answers.humanOversightLevel === 'pre_execution'
                  ? 'Declarada supervisión humana previa: los resultados se presentan como borradores que revisa un empleado público antes de producir efectos. No se ha verificado el funcionamiento real del procedimiento.'
                  : answers.humanOversightLevel === 'post_execution'
                  ? 'Declarada supervisión humana posterior: debe verificarse si un empleado público interviene de forma directa antes de que el resultado produzca efectos.'
                  : 'Declarada actuación sin intervención humana: puede quedar sujeta a la prohibición del Art. 22 RGPD y exige los requisitos del Art. 41 de la Ley 40/2015.',
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
                text: diagnostic?.isAutomatedAdministrativeAct
                  ? 'Deslinde con el Artículo 41 de la Ley 40/2015: se ha declarado que el sistema realiza actuaciones administrativas automatizadas, es decir, sin intervención directa de un empleado público. Antes de su puesta en servicio deben establecerse los órganos competentes para la definición de especificaciones, programación, mantenimiento, supervisión, control de calidad y auditoría, y el órgano responsable a efectos de impugnación (Art. 41.2).'
                  : 'Deslinde con el Artículo 41 de la Ley 40/2015: el promotor declara que un empleado público interviene de forma directa en cada actuación, por lo que no habría actuación administrativa automatizada. Esta afirmación no se ha verificado y debe contrastarse con el funcionamiento real del procedimiento.',
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Responsabilidad patrimonial: los particulares exigen directamente a la Administración Pública correspondiente la indemnización de las lesiones causadas por el funcionamiento de los servicios públicos, también cuando intervenga este sistema (Arts. 32.1 y 36.1 de la Ley 40/2015). La Administración solo puede exigir responsabilidad a sus autoridades y personal cuando haya concurrido dolo, o culpa o negligencia graves (Art. 36.2).',
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'No discriminación algorítmica (Ley 15/2022, Art. 23): las administraciones públicas favorecerán mecanismos de minimización de sesgos, transparencia y rendición de cuentas, y se promoverán evaluaciones del posible impacto discriminatorio. No se han aportado evaluaciones de sesgo, por lo que este extremo figura como no evaluado.',
              }),
            ],
            spacing: { after: 400 },
          }),

          // SECCIÓN 6: SEGURIDAD ENS
          makeSectionHeading('6. MEDIDAS DE SEGURIDAD (ENS, RD 311/2022)'),
          new Paragraph({
            children: [
              new TextRun({ text: `Categoría ENS orientativa: ${diagnostic?.ensCategory}. `, bold: true }),
              new TextRun({ text: diagnostic?.ensReasoning || '' }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Medidas del Anexo II del ENS relacionadas con el uso de servicios de IA y su estado:',
                bold: true,
              }),
            ],
            spacing: { after: 100 },
          }),
          ...requirementsByPillar(requirements, 'ens').map((r) =>
            makeBulletPoint(`${r.precepto} — ${resultLabel(r.resultado)}: ${r.hechos}`)
          ),
          new Paragraph({ text: '', spacing: { before: 200 } }),

          // SECCIÓN 7: OBLIGACIONES Y ESTADO DE ACREDITACIÓN (modelo común)
          makeSectionHeading('7. OBLIGACIONES Y ESTADO DE ACREDITACIÓN'),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Solo «Acreditado» equivale a cumplimiento y exige validación humana con evidencia. «Declarado» recoge lo afirmado por el promotor sin comprobar.',
                italics: true,
                size: 18,
                color: COLOR_MUTED,
              }),
            ],
            spacing: { after: 150 },
          }),
          ...obligations(requirements).flatMap((r) => buildRequirementParagraphs(r, idioma)),

          // SECCIÓN 7: ANÁLISIS CUALITATIVO / AUDITORÍA DE IA (si hay LLM)
          ...(llmCritique
            ? [
                makeSectionHeading('8. ANÁLISIS ASISTIDO POR IA (CONTENIDO NO VERIFICADO)'),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Texto generado por un modelo de lenguaje. Es contenido no verificado: no modifica la clasificación ni acredita requisitos, y sus citas deben comprobarse antes de cualquier uso.',
                      italics: true,
                      size: 18,
                      color: 'D97706',
                    }),
                  ],
                  spacing: { after: 150 },
                }),
                ...parseMarkdownToDocx(llmCritique),
              ]
            : []),

          // NOTA SOBRE LAS FUENTES Y TRAZABILIDAD DEL DOCUMENTO
          makeSectionHeading(isGl ? 'NOTA SOBRE AS FONTES E TRAZABILIDADE DO DOCUMENTO' : 'NOTA SOBRE LAS FUENTES Y TRAZABILIDAD DEL DOCUMENTO'),
          new Paragraph({
            children: [
              new TextRun({
                text: isGl
                  ? `Os preceptos citados proceden da base de coñecemento da ferramenta (${NORMATIVE_SNAPSHOT}). Non se verificou a súa vixencia no momento de emitir este documento: debe comprobarse no BOE e en EUR-Lex antes de calquera uso.`
                  : `Los preceptos citados proceden de la base de conocimiento de la herramienta (${NORMATIVE_SNAPSHOT}). No se ha verificado su vigencia en el momento de emitir este documento: debe comprobarse en el BOE y en EUR-Lex antes de cualquier uso.`,
                size: 20,
              }),
            ],
            spacing: { after: 150 },
          }),
          makeBulletPoint(`${isGl ? 'Versión do motor' : 'Versión del motor'}: ${traceability?.engineVersion || diagnostic?.engineVersion || ENGINE_VERSION}`),
          makeBulletPoint(`${isGl ? 'Pegada SHA-256 das entradas (inxesta e entrevista)' : 'Huella SHA-256 de las entradas (ingesta y entrevista)'}: ${traceability?.inputFingerprint || TRACEABILITY_NOT_COMPUTED} (${isGl ? 'permite comprobar que dous documentos parten das mesmas entradas; non acredita a integridade do documento' : 'permite comprobar que dos documentos parten de las mismas entradas; no acredita la integridad del documento'})`),
          makeBulletPoint(`${isGl ? 'Data de xeración' : 'Fecha de generación'}: ${traceability?.generatedAt || TRACEABILITY_NOT_COMPUTED}`),
          makeBulletPoint(`${isGl ? 'Asistencia de IA' : 'Asistencia de IA'}: ${describirAsistencia(diagnostic?.aiAssistance)}`),
          new Paragraph({ children: [new TextRun({ text: isGl ? 'Orixe das respostas' : 'Origen de las respuestas', bold: true, color: COLOR_PRIMARY })], spacing: { before: 200, after: 100 } }),
          ...(answerProvenanceRows(state).length
            ? [
                ...answerProvenanceRows(state).map((f) => makeBulletPoint(`${f.pregunta} → ${f.respuesta}. ${f.origen}. ${f.respaldo}.`)),
                new Paragraph({ children: [new TextRun({ text: PROVENANCE_NOTE, italics: true, size: 18, color: COLOR_MUTED })], spacing: { after: 100 } }),
              ]
            : [makeBulletPoint(isGl ? 'Todas as respostas introduciunas a persoa usuaria.' : 'Todas las respuestas las introdujo la persona usuaria.')]),
          new Paragraph({ text: '', spacing: { before: 200 } }),

          // DILIGENCIA DE FIRMAS
          makeSectionHeading(isGl ? 'REVISIÓN E SINATURA' : 'REVISIÓN Y FIRMA'),
          new Paragraph({
            children: [
              new TextRun({
                text: isGl
                  ? 'NOTA: O presente documento é un informe técnico preliminar xerado cunha ferramenta automatizada. Non é un acto administrativo nin unha actuación administrativa automatizada. Só adquire valor cando o revisan e asinan os responsables competentes, que poden modificar ou rexeitar as súas conclusións (sinatura electrónica do persoal, Art. 43 da Lei 40/2015):'
                  : 'NOTA: El presente documento es un informe técnico preliminar generado con una herramienta automatizada. No es un acto administrativo ni una actuación administrativa automatizada. Solo adquiere valor cuando lo revisan y firman los responsables competentes, que pueden modificar o rechazar sus conclusiones (firma electrónica del personal, Art. 43 de la Ley 40/2015):',
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

const RESULT_COLORS: Record<RequirementResult, string> = {
  acreditado: '16A34A',
  declarado: '2563EB',
  no_verificado: '64748B',
  no_evaluado: '64748B',
  pendiente: 'D97706',
  incumple: 'DC2626',
};

function buildProhibitedChecksList(practices: RequirementAssessment[]): Paragraph[] {
  return practices.map((r) => {
    return new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({ text: `${r.precepto} (${r.title}): `, bold: true }),
        new TextRun({ text: resultLabel(r.resultado), bold: true, color: RESULT_COLORS[r.resultado] }),
        new TextRun({ text: ` — ${r.hechos}` }),
      ],
      spacing: { after: 100 },
    });
  });
}

function buildRequirementParagraphs(r: RequirementAssessment, idioma: AppIdioma): Paragraph[] {
  const status = r.aplicabilidad === 'no_aplica' ? applicabilityLabel(r.aplicabilidad, idioma) : resultLabel(r.resultado, idioma);
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `${r.title}: `, bold: true }),
        new TextRun({ text: status, bold: true, color: r.aplicabilidad === 'no_aplica' ? COLOR_MUTED : RESULT_COLORS[r.resultado] }),
      ],
      spacing: { before: 120, after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${r.norma} · ${r.precepto} · ${originLabel(r.origen, idioma)}${r.exigibleDesde ? ` · Exigible desde ${new Date(r.exigibleDesde).toLocaleDateString('es-ES')}` : ''}`,
          size: 16,
          color: COLOR_MUTED,
        }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({ children: [new TextRun({ text: r.hechos, size: 19 })], spacing: { after: 40 } }),
    ...(r.resultado === 'acreditado' && r.evidencia
      ? [new Paragraph({ children: [new TextRun({ text: `Validación: ${r.revisadoPor} · Evidencia: ${r.evidencia}`, size: 19, bold: true, color: '16A34A' })], spacing: { after: 40 } })]
      : []),
    new Paragraph({ children: [new TextRun({ text: `Acción: ${r.accionRequerida}`, size: 19, italics: true })], spacing: { after: 80 } }),
  ];
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
        children: [new TextRun({ text: '[ Firma electrónica ]', italics: true, size: 14, color: COLOR_MUTED })],
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

const PILLAR_COLORS: Record<PillarStatus, string> = {
  danger: 'DC2626',
  warning: 'D97706',
  info: '2563EB',
  neutral: '64748B',
  success: '16A34A',
};

function makeScorecardRow(pillar: string, norm: string, level: string, verdict: string, status: PillarStatus): TableRow {
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
        children: [new Paragraph({ children: [new TextRun({ text: verdict, bold: true, size: 15, color: PILLAR_COLORS[status] })] })],
        margins: { top: convertMillimetersToTwip(2), bottom: convertMillimetersToTwip(2), left: convertMillimetersToTwip(2), right: convertMillimetersToTwip(2) },
      }),
    ],
  });
}

