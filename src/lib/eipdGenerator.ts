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
import type { FullAuditState, AppIdioma, TriState } from '../types';
import { buildAepdCriteria, buildEipdCriteria, eipdScreening, type EipdCriterion } from './eipdCriteria';

export { buildAepdCriteria, buildEipdCriteria, eipdScreening, isEipdMandatoryFor } from './eipdCriteria';
export type { EipdCriterion, EipdScreening } from './eipdCriteria';

const FONT_BODY = 'Calibri';
const FONT_HEADING = 'Arial';
const COLOR_PRIMARY = '065F46'; // Verde institucional AEPD / Esmeralda oscuro
const COLOR_SECONDARY = '047857';
const COLOR_DARK = '0F172A';
const COLOR_MUTED = '64748B';

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
  const aepdCriteria = buildAepdCriteria(state);
  const screening = eipdScreening(state);

  return new Document({
    title: `Borrador de evaluación de impacto en la protección de datos: ${ingest.appName || 'sistema de IA'}`,
    subject: 'Borrador de EIPD (Art. 35 RGPD) para completar por el responsable del tratamiento con el asesoramiento del DPD',
    creator: 'Auditor IA, herramienta de apoyo',
    lastModifiedBy: 'Auditor IA, herramienta de apoyo',
    description: 'Borrador: no contiene el dictamen del DPD ni la decisión del responsable del tratamiento.',
    keywords: 'EIPD; Art. 35 RGPD; borrador',
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
                            text: screening === 'necesaria'
                              ? 'EIPD NECESARIA EN LA MAYORÍA DE LOS CASOS (2 o más criterios de WP248 o de la lista de la AEPD)'
                              : screening === 'por_determinar'
                              ? 'POR DETERMINAR (hay criterios sin contestar que podrían alcanzar el umbral)'
                              : 'NO INDICADA POR LOS CRITERIOS DECLARADOS (valoración pendiente del DPD)',
                            bold: true,
                            color: screening === 'no_indicada' ? '047857' : screening === 'necesaria' ? 'B91C1C' : 'D97706',
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

          // SECCIÓN 2: UMBRAL DE NECESIDAD (WP248 Y LISTA DE LA AEPD)
          new Paragraph({
            text: '2. ANÁLISIS DEL UMBRAL DE NECESIDAD',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: 'Valoración preliminar a partir de lo declarado, a revisar por el DPD. «POR VALORAR» indica un criterio sin contestar en la entrevista. Cada lista conserva su numeración.',
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: '2.1. CRITERIOS DE LAS DIRECTRICES WP248 (GRUPO DE TRABAJO DEL ARTÍCULO 29)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: 'Según las directrices WP248 rev.01 (asumidas por el Comité Europeo de Protección de Datos), en la mayoría de los casos un tratamiento que cumple dos o más criterios requiere una EIPD.',
            spacing: { after: 150 },
          }),
          criteriaTable(criteria, 'Criterio WP248'),
          new Paragraph({
            text: '2.2. LISTA DE LA AEPD DE TRATAMIENTOS QUE REQUIEREN EIPD (ART. 35.4 RGPD)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
          }),
          new Paragraph({
            text: 'Según la lista de la AEPD, será necesario realizar una EIPD en la mayoría de los casos en que el tratamiento cumpla dos o más criterios, salvo que figure en la lista de tratamientos que no la requieren (Art. 35.5 RGPD).',
            spacing: { after: 150 },
          }),
          criteriaTable(aepdCriteria, 'Criterio de la lista de la AEPD'),

          // SECCIÓN 3: CICLO DE VIDA DEL DATO
          new Paragraph({
            text: '3. CICLO DE VIDA DE LOS DATOS Y TRATAMIENTO ALGORÍTMICO',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 500, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Recogida e Ingesta: ', bold: true }),
              new TextRun({ text: answers.publicCompetenceNorm ? 'Declarado: las entradas proceden de la tramitación de expedientes en el procedimiento administrativo (' + answers.publicCompetenceNorm + ').' : 'No consta la norma que regula el procedimiento del que proceden los datos.' }),
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
                  : answers.hostingModel === 'us_hyperscaler'
                  ? 'Declarado: nube fuera del Espacio Económico Europeo. Debe valorarse la transferencia internacional y el riesgo de acceso por autoridades de terceros países.'
                  : 'No consta dónde se ejecuta el modelo.',
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Conservación y Trazabilidad: ', bold: true }),
              new TextRun({
                text: answers.auditLogsEnabled === 'si'
                  ? `Declarado: registro de actividad con conservación de ${answers.logRetentionMonths} meses. No se ha comprobado su existencia ni su protección.`
                  : answers.auditLogsEnabled === 'no'
                  ? 'Declarado que no existe registro de actividad.'
                  : 'No consta si existe registro de actividad.',
              }),
            ],
            spacing: { after: 200 },
          }),

          // SECCIÓN 3 BIS: NECESIDAD Y PROPORCIONALIDAD (ART. 35.7.b RGPD)
          ...necessityProportionalitySection(state),

          // SECCIÓN 4: MEDIDAS MITIGADORAS
          new Paragraph({
            text: '4. MEDIDAS DE MITIGACIÓN PREVISTAS (PENDIENTES DE VERIFICAR)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Intervención humana (Art. 22 RGPD; Art. 14 RIA en sistemas de alto riesgo): ', bold: true }),
              new TextRun({ text: answers.supervisionRole ? `Declarado: la supervisión corresponde a ${answers.supervisionRole}. Debe verificarse que ningún resultado produce efectos sin revisión humana.` : 'No consta quién supervisa los resultados.' }),
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

          // SECCIÓN 4 BIS: RIESGO INHERENTE, MEDIDAS Y RIESGO RESIDUAL
          new Paragraph({
            text: '4 bis. RIESGO INHERENTE, MEDIDAS Y RIESGO RESIDUAL',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: 'Para cada criterio que concurre o está por valorar se indica el riesgo inherente estimado y las medidas declaradas. El riesgo residual no lo calcula la herramienta: queda pendiente de valoración por el responsable del tratamiento con el asesoramiento del DPD.',
            spacing: { after: 150 },
          }),
          residualRiskTable([...criteria, ...aepdCriteria.filter((c) => c.id === 'AEPD-5' || c.id === 'AEPD-6')], declaredMeasures(answers)),

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

const ESTADO_LABEL: Record<TriState, string> = { si: 'SÍ', no: 'NO', desconocido: 'POR VALORAR' };
const ESTADO_COLOR: Record<TriState, string> = { si: 'B91C1C', no: '047857', desconocido: 'D97706' };

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    shading: { fill: '065F46' },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF' })] })],
    width: { size: width, type: WidthType.PERCENTAGE },
  });
}

function textCell(text: string, opts: { bold?: boolean; color?: string } = {}): TableCell {
  return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, size: 20, bold: opts.bold, color: opts.color })] })] });
}

function criteriaTable(list: EipdCriterion[], title: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell(title, 45), headerCell('Concurre', 15), headerCell('Justificación', 40)] }),
      ...list.map(
        (c) =>
          new TableRow({
            children: [
              textCell(c.title, { bold: true }),
              textCell(ESTADO_LABEL[c.estado], { bold: true, color: ESTADO_COLOR[c.estado] }),
              textCell(c.justification),
            ],
          })
      ),
    ],
  });
}

function declaredMeasures(answers: FullAuditState['answers']): string {
  const measures: string[] = [];
  if (answers.humanOversightLevel === 'pre_execution') measures.push('revisión humana previa (declarada)');
  if (answers.auditLogsEnabled === 'si') measures.push('registro de actividad (declarado)');
  if (answers.hostingModel === 'local_on_premise') measures.push('ejecución local (declarada)');
  return measures.length ? measures.join('; ') : 'Sin medidas declaradas';
}

function residualRiskTable(list: EipdCriterion[], measures: string): Table | Paragraph {
  const relevant = list.filter((c) => c.estado !== 'no');
  if (relevant.length === 0) {
    return new Paragraph({
      text: 'Según lo declarado no concurre ningún criterio. El riesgo residual del tratamiento debe valorarse igualmente si se tratan datos personales.',
      spacing: { after: 200 },
    });
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('Riesgo (criterio)', 35), headerCell('Riesgo inherente', 15), headerCell('Medidas declaradas', 25), headerCell('Riesgo residual', 25)] }),
      ...relevant.map(
        (c) =>
          new TableRow({
            children: [
              textCell(c.title, { bold: true }),
              textCell(c.impact, { bold: true, color: c.estado === 'si' ? 'B91C1C' : 'D97706' }),
              textCell(measures),
              textCell('Pendiente de valoración por el responsable con el DPD', { color: 'D97706' }),
            ],
          })
      ),
    ],
  });
}

const PENDIENTE_RESPONSABLE = 'A COMPLETAR por el responsable del tratamiento, con el asesoramiento del DPD.';

/**
 * Apartado de necesidad y proporcionalidad (Art. 35.7.b RGPD). Recoge lo declarado y plantea
 * las preguntas; no concluye: el juicio corresponde al responsable con el asesoramiento del DPD.
 * Las preguntas siguen el objetivo «Análisis de la proporcionalidad y necesidad» de los
 * Requisitos para auditorías de tratamientos que incluyan IA (AEPD).
 */
function necessityProportionalitySection(state: FullAuditState): (Paragraph | Table)[] {
  const { ingest, answers } = state;
  const personal = answers.processesPersonalData;

  const usoIa =
    answers.infersOutputs === 'si'
      ? 'Declarado que el sistema usa IA (infiere sus resultados).'
      : answers.infersOutputs === 'no'
        ? 'Declarado que el sistema no usa IA: aplica reglas fijas.'
        : 'No consta si el sistema usa IA.';
  const alojamiento =
    answers.hostingModel === 'local_on_premise'
      ? 'Se declara ejecución en servidores propios de la entidad.'
      : answers.hostingModel === 'eu_cloud_dpa'
        ? 'Se declara ejecución en una nube de la UE con contrato de encargo.'
        : answers.hostingModel === 'us_hyperscaler'
          ? 'Se declara ejecución fuera del EEE o sin garantía de tratamiento en la UE.'
          : 'No consta dónde se ejecuta el sistema.';

  const declaradas: string[] = [];
  if (answers.processesSpecialCategoryData === 'si') declaradas.push('categorías especiales (Art. 9)');
  if (answers.processesCriminalData === 'si') declaradas.push('datos penales (Art. 10)');
  if (answers.processesSolvencyData === 'si') declaradas.push('datos de solvencia');
  if (answers.biometricIdentification === 'si') declaradas.push('datos biométricos para identificar');
  if (answers.geneticData === 'si') declaradas.push('datos genéticos');
  if (answers.vulnerableSubjects === 'si') declaradas.push('datos de personas vulnerables');
  if (answers.largeScale === 'si') declaradas.push('tratamiento a gran escala');
  const minimizacion =
    personal === 'no'
      ? 'Declarado que no se tratan datos personales.'
      : declaradas.length
        ? `Se declaran: ${declaradas.join(', ')}. Debe justificarse que cada uno es imprescindible para la finalidad.`
        : personal === 'si'
          ? 'Se declaran datos personales, sin categorías especiales, penales ni de solvencia.'
          : 'No consta si se tratan datos personales.';

  const cribado = eipdScreening(state);
  const riesgo =
    (cribado === 'necesaria'
      ? 'Cribado: concurren dos o más criterios de riesgo.'
      : cribado === 'por_determinar'
        ? 'Cribado: hay criterios de riesgo sin contestar.'
        : 'Cribado: según lo declarado no concurren dos o más criterios de riesgo.') + ' Véase el apartado 4 bis.';

  const filas: Array<[string, string, string]> = [
    ['Idoneidad', '¿Sirve el tratamiento para alcanzar la finalidad declarada?', ingest.appDescription ? `Finalidad declarada: «${ingest.appDescription}».` : 'No consta la finalidad.'],
    [
      'Alternativas menos intrusivas',
      '¿Se ha comparado con opciones que traten menos datos o supongan menos riesgo: sin IA, sin datos personales o con datos seudonimizados, con un modelo en servidores propios?',
      `${usoIa} ${alojamiento}`,
    ],
    [
      'Motivos para usar este sistema',
      '¿Por qué se usa este sistema y no el procedimiento anterior? Si se aborda un problema nuevo, ¿por qué con IA?',
      'No consta en la entrevista.',
    ],
    ['Minimización', '¿Se tratan solo los datos imprescindibles para la finalidad?', minimizacion],
    ['Proporcionalidad en sentido estricto', '¿Compensan los beneficios para el interés público los riesgos para los derechos de los interesados?', riesgo],
  ];

  return [
    new Paragraph({
      text: '3 bis. EVALUACIÓN DE LA NECESIDAD Y LA PROPORCIONALIDAD (ART. 35.7.b RGPD)',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      text: 'La EIPD debe incluir una evaluación de la necesidad y la proporcionalidad de las operaciones de tratamiento con respecto a su finalidad (Art. 35.7.b RGPD). La herramienta recoge lo declarado y plantea las preguntas; no las responde. Las preguntas siguen el objetivo «Análisis de la proporcionalidad y necesidad» de los Requisitos para auditorías de tratamientos que incluyan IA de la AEPD.',
      spacing: { after: 150 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Juicio', 18), headerCell('Pregunta', 32), headerCell('Lo que consta', 30), headerCell('Conclusión', 20)] }),
        ...filas.map(
          ([juicio, pregunta, consta]) =>
            new TableRow({
              children: [textCell(juicio, { bold: true }), textCell(pregunta), textCell(consta), textCell(PENDIENTE_RESPONSABLE, { color: COLOR_MUTED })],
            })
        ),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}
