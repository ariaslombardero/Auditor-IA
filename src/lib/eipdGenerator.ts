/**
 * Generador de Evaluación de Impacto en la Protección de Datos (EIPD / DPIA)
 * Conforme a la Guía Oficial de la Agencia Española de Protección de Datos (AEPD)
 * y las directrices del Comité Europeo de Protección de Datos (WP248).
 */

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
const COLOR_PRIMARY = '065F46'; // Verde institucional AEPD / Esmeralda oscuro
const COLOR_SECONDARY = '047857';
const COLOR_DARK = '0F172A';
const COLOR_MUTED = '64748B';

export interface EipdCriterion {
  id: string;
  title: string;
  applies: boolean;
  impact: string;
  justification: string;
}

export async function exportEipdDocx(
  state: FullAuditState,
  idioma: AppIdioma = 'castellano'
): Promise<void> {
  const doc = buildEipdDocument(state, idioma);
  const blob = await Packer.toBlob(doc);
  const cleanName = state.ingest.appName ? state.ingest.appName.replace(/\s+/g, '_') : 'Sistema_IA';
  const fileName = `EIPD_Borrador_${cleanName}_${Date.now()}.docx`;
  saveAs(blob, fileName);
}

/**
 * Construye el borrador de EIPD sin descargarlo. Es un borrador para completar por el
 * responsable del tratamiento con el asesoramiento del DPD: no contiene su dictamen.
 */
export function buildEipdDocument(state: FullAuditState, idioma: AppIdioma = 'castellano'): Document {
  const { ingest, answers, metadata } = state;
  const isGl = idioma === 'galego';

  const criteria = buildEipdCriteria(state);
  const isEipdMandatory = isEipdMandatoryFor(state, criteria);

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_BODY, size: 22, color: COLOR_DARK },
          paragraph: { spacing: { line: 276 } },
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
                    text: `   Arias Lombardero · Aplicaciones | EIPD (Art. 35 RGPD / AEPD) · ${metadata.entityName.toUpperCase()}`,
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
                      ? 'Avaliación de Impacto en Protección de Datos (Art. 35 REXPD / AEPD) · Páxina '
                      : 'Evaluación de Impacto en Protección de Datos (Art. 35 RGPD / AEPD) · Página ',
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
                  ? 'AVALIACIÓN DE IMPACTO RELATIVA Á PROTECCIÓN DE DATOS (EIPD)'
                  : 'EVALUACIÓN DE IMPACTO RELATIVA A LA PROTECCIÓN DE DATOS (EIPD)',
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
                text: isGl
                  ? 'Borrador preliminar para completar polo responsable do tratamento co asesoramento do DPD · Artigo 35 do RXPD'
                  : 'Borrador preliminar para completar por el responsable del tratamiento con el asesoramiento del DPD · Artículo 35 del RGPD',
                size: 20,
                italics: true,
                color: COLOR_SECONDARY,
              }),
            ],
            spacing: { after: 800 },
          }),

          // CAJA RESUMEN
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'ECFDF5' },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 8, color: '10B981' },
                      bottom: { style: BorderStyle.SINGLE, size: 8, color: '10B981' },
                      left: { style: BorderStyle.SINGLE, size: 8, color: '10B981' },
                      right: { style: BorderStyle.SINGLE, size: 8, color: '10B981' },
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'SISTEMA EVALUADO: ', bold: true, color: COLOR_PRIMARY }),
                          new TextRun({ text: ingest.appName, bold: true }),
                        ],
                        spacing: { before: 120, after: 120 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'ACTIVIDAD EN EL RAT: ', bold: true, color: COLOR_PRIMARY }),
                          new TextRun({ text: answers.ratActivityName }),
                        ],
                        spacing: { after: 120 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'CRIBADO PRELIMINAR DE NECESIDAD: ', bold: true, color: COLOR_PRIMARY }),
                          new TextRun({
                            text: isEipdMandatory
                              ? 'EIPD PROBABLEMENTE NECESARIA (2 o más criterios WP248 o datos sensibles declarados)'
                              : 'NO INDICADA POR LOS CRITERIOS EVALUADOS (valoración pendiente del DPD)',
                            bold: true,
                            color: isEipdMandatory ? 'B91C1C' : '047857',
                          }),
                        ],
                        spacing: { after: 120 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'FECHA DEL BORRADOR: ', bold: true, color: COLOR_PRIMARY }),
                          new TextRun({ text: metadata.auditDate }),
                        ],
                        spacing: { after: 120 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // SECCIÓN 1: IDENTIFICACIÓN
          new Paragraph({
            text: '1. IDENTIFICACIÓN DEL TRATAMIENTO Y ACTORES',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'El presente borrador recoge una valoración preliminar, basada en lo declarado por el promotor, de los riesgos para los derechos y libertades de las personas físicas derivados del sistema de inteligencia artificial "',
              }),
              new TextRun({ text: ingest.appName, bold: true }),
              new TextRun({
                text: '", tomando como referencia el Artículo 35 del Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD) y las guías de la AEPD. No sustituye la evaluación de impacto completa, que corresponde al responsable del tratamiento con el asesoramiento del DPD.',
              }),
            ],
            spacing: { after: 200 },
          }),

          // SECCIÓN 2: UMBRAL DE NECESIDAD (9 CRITERIOS WP248)
          new Paragraph({
            text: '2. ANÁLISIS DEL UMBRAL DE NECESIDAD (9 CRITERIOS DEL GRUPO DEL ART. 29 / AEPD)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: 'Según las directrices WP248 del Grupo de Trabajo del Artículo 29 (asumidas por el Comité Europeo de Protección de Datos), en la mayoría de los casos un tratamiento que cumple dos o más de los siguientes criterios requiere una EIPD. Debe consultarse además la lista de la AEPD del Art. 35.4 RGPD. Valoración preliminar, a revisar por el DPD:',
            spacing: { after: 200 },
          }),

          // TABLA DE CRITERIOS
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: '065F46' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Criterio WP248', bold: true, color: 'FFFFFF' })] })],
                    width: { size: 45, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    shading: { fill: '065F46' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Aplica', bold: true, color: 'FFFFFF' })] })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    shading: { fill: '065F46' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Justificación y Hallazgo', bold: true, color: 'FFFFFF' })] })],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              ...criteria.map((c) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: c.title, bold: true, size: 20 })] })],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: c.applies ? 'SÍ' : 'NO',
                              bold: true,
                              color: c.applies ? 'B91C1C' : '047857',
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: c.justification, size: 20 })] })],
                    }),
                  ],
                })
              ),
            ],
          }),

          // SECCIÓN 3: CICLO DE VIDA DEL DATO
          new Paragraph({
            text: '3. CICLO DE VIDA DE LOS DATOS Y TRATAMIENTO ALGORÍTMICO',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 500, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Recogida e Ingesta: ', bold: true }),
              new TextRun({ text: 'Declarado: las entradas proceden de la tramitación de expedientes en el procedimiento administrativo (' + answers.publicCompetenceNorm + ').' }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Modelo de Alojamiento e Inferencia: ', bold: true }),
              new TextRun({
                text: answers.hostingModel === 'local_on_premise'
                  ? 'Declarado: ejecución local en servidores propios (Ollama/vLLM). Debe comprobarse que el proveedor configurado es efectivamente local.'
                  : answers.hostingModel === 'eu_cloud_dpa'
                  ? 'Declarado: nube de la Unión Europea con contrato de encargo del tratamiento (Art. 28 RGPD).'
                  : 'Declarado: nube fuera del Espacio Económico Europeo. Debe valorarse la transferencia internacional y el riesgo de acceso por autoridades de terceros países.',
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Conservación y Trazabilidad: ', bold: true }),
              new TextRun({
                text: answers.auditLogsEnabled
                  ? `Declarado: registro de actividad con conservación de ${answers.logRetentionMonths} meses. No se ha comprobado su existencia ni su protección.`
                  : 'Declarado que no existe registro de actividad.',
              }),
            ],
            spacing: { after: 200 },
          }),

          // SECCIÓN 4: MEDIDAS MITIGADORAS
          new Paragraph({
            text: '4. MEDIDAS DE MITIGACIÓN PREVISTAS (PENDIENTES DE VERIFICAR)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Intervención humana (Art. 22 RGPD; Art. 14 RIA en sistemas de alto riesgo): ', bold: true }),
              new TextRun({ text: `Declarado: la supervisión corresponde a ${answers.supervisionRole}. Debe verificarse que ningún resultado produce efectos sin revisión humana.` }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Información y transparencia (Art. 13 RGPD; Art. 50 RIA): ', bold: true }),
              new TextRun({ text: 'Previsto: incorporar el aviso de uso de IA y rotular los documentos generados. Pendiente de implantación y verificación.' }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Uso de los datos por el proveedor: ', bold: true }),
              new TextRun({ text: 'Pendiente: comprobar en el contrato o en las condiciones del proveedor que las peticiones y los datos no se utilizan para entrenar sus modelos.' }),
            ],
            spacing: { after: 300 },
          }),

          // SECCIÓN 5: CONCLUSIÓN Y FIRMAS
          new Paragraph({
            text: '5. DICTAMEN DEL DELEGADO DE PROTECCIÓN DE DATOS (A CUMPLIMENTAR POR EL DPD)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Este apartado lo redacta el Delegado de Protección de Datos tras revisar la evaluación. La herramienta no emite el dictamen del DPD.',
                italics: true,
                color: COLOR_MUTED,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Sentido del dictamen:  ☐ Favorable    ☐ Favorable con condiciones    ☐ Desfavorable', bold: true })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Motivación y condiciones: ______________________________________________________________' })],
            spacing: { after: 400 },
          }),

          // TABLA DE FIRMAS
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'RESPONSABLE DEL TRATAMIENTO', bold: true, size: 18 })] }),
                      new Paragraph({ text: '', spacing: { before: 600 } }),
                      new Paragraph({ children: [new TextRun({ text: `Fdo.: ${metadata.functionalResponsible}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Cargo: ${metadata.serviceDepartment}`, size: 16, color: COLOR_MUTED })] }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'DELEGADO DE PROTECCIÓN DE DATOS (DPD)', bold: true, size: 18 })] }),
                      new Paragraph({ text: '', spacing: { before: 600 } }),
                      new Paragraph({ children: [new TextRun({ text: `Fdo.: ${metadata.dpoContact}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Oficina de Privacidad y DPD', size: 16, color: COLOR_MUTED })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });
}

/**
 * Evaluación de los 9 criterios del Grupo del Art. 29 (WP248).
 */
export function buildEipdCriteria(state: FullAuditState): EipdCriterion[] {
  const { ingest, answers } = state;
  return [
    {
      id: 'C1',
      title: '1. Evaluación o puntuación (Scoring/Profiling)',
      applies: answers.administrativeNature === 'citizen_assessment',
      impact: answers.administrativeNature === 'citizen_assessment' ? 'ALTO' : 'BAJO',
      justification: answers.administrativeNature === 'citizen_assessment'
        ? 'El sistema procesa y evalúa méritos o situaciones individuales de ciudadanos.'
        : 'El sistema actúa como auxilio documental técnico sin perfilado sistemático.',
    },
    {
      id: 'C2',
      title: '2. Toma de decisiones automatizadas con efectos jurídicos (Art. 22 RGPD)',
      applies: answers.humanOversightLevel === 'fully_automated',
      impact: answers.humanOversightLevel === 'fully_automated' ? 'CRÍTICO' : 'BAJO',
      justification: answers.humanOversightLevel === 'fully_automated'
        ? 'Se detecta riesgo de acto administrativo automatizado sin filtro humano directo.'
        : 'Existe supervisión humana preceptiva que valida previamente cualquier salida.',
    },
    {
      id: 'C3',
      title: '3. Observación, monitorización o control sistemático',
      applies: false,
      impact: 'BAJO',
      justification: 'No se realiza geolocalización ni videovigilancia continuada de interesados.',
    },
    {
      id: 'C4',
      title: '4. Datos de categorías especiales o altamente personales (Art. 9 RGPD)',
      applies: answers.processesSpecialCategoryData,
      impact: answers.processesSpecialCategoryData ? 'ALTO' : 'BAJO',
      justification: answers.processesSpecialCategoryData
        ? 'Se tratan datos de salud, discapacidad, afiliación o categorías protegidas.'
        : 'No se declaran datos de categorías especiales según el Art. 9 del RGPD.',
    },
    {
      id: 'C5',
      title: '5. Tratamiento de datos a gran escala',
      applies: ingest.targetAudience === 'public_citizens',
      impact: ingest.targetAudience === 'public_citizens' ? 'MEDIO' : 'BAJO',
      justification: ingest.targetAudience === 'public_citizens'
        ? 'Dirigido potencialmente a una colectividad amplia de ciudadanos o administrados.'
        : 'Uso circunscrito al personal empleado público tramitador.',
    },
    {
      id: 'C6',
      title: '6. Cruce o combinación de conjuntos de datos',
      applies: false,
      impact: 'BAJO',
      justification: 'No se cruzan bases de datos masivas heterogéneas para inferir perfiles.',
    },
    {
      id: 'C7',
      title: '7. Datos relativos a interesados vulnerables',
      applies: answers.administrativeNature === 'citizen_assessment' && answers.processesSpecialCategoryData,
      impact: (answers.administrativeNature === 'citizen_assessment' && answers.processesSpecialCategoryData) ? 'ALTO' : 'BAJO',
      justification: 'Requiere cautela reforzada si los administrados se encuentran en situación de asimetría o vulnerabilidad social.',
    },
    {
      id: 'C8',
      title: '8. Uso innovador o aplicación de nuevas soluciones tecnológicas / IA',
      applies: true,
      impact: 'MEDIO',
      justification: 'Uso de Inteligencia Artificial Generativa / Modelos de Lenguaje Avanzados.',
    },
    {
      id: 'C9',
      title: '9. Transferencias internacionales de datos fuera del Espacio Económico Europeo',
      applies: answers.hostingModel === 'us_hyperscaler',
      impact: answers.hostingModel === 'us_hyperscaler' ? 'CRÍTICO' : 'BAJO',
      justification: answers.hostingModel === 'us_hyperscaler'
        ? 'Uso de nubes bajo jurisdicción extracomunitaria (FISA 702 / CLOUD Act).'
        : 'Inferencia local soberana en CPD propio o en nube europea con garantías DPA.',
    },
  ];
}

export function isEipdMandatoryFor(state: FullAuditState, criteria: EipdCriterion[]): boolean {
  const { answers } = state;
  const applicableCount = criteria.filter((c) => c.applies).length;
  return applicableCount >= 2 || answers.processesSpecialCategoryData || answers.humanOversightLevel === 'fully_automated';
}
