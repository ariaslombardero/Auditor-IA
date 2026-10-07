# Formato documental de los informes (DOC-10)

**Estado:** propuesta para validar por la Diputación (secretaría, archivo y responsable del gestor de expedientes) · **Fecha:** 07/10/2026

## Qué genera la herramienta

| Salida | Formato | Uso previsto |
| :--- | :--- | :--- |
| Informe técnico preliminar | `.docx` (Office Open XML) y `.md` | Borrador editable para la revisión de los responsables |
| Borrador de EIPD | `.docx` | Plantilla que completa el responsable del tratamiento con el DPD |
| Manifiesto | `.json` | Datos estructurados: entradas, traza, requisitos y huella |

Cada informe incluye:
- un identificador interno (no es un CSV verificable en sede);
- la fecha de generación;
- la versión del motor y el corte normativo;
- la huella SHA-256 de las entradas;
- metadatos de fichero (título, asunto, autor «Auditor IA, herramienta de apoyo» y una descripción que declara que no es un acto administrativo).

## Marco aplicable (cotejado en el BOE el 07/10/2026)

- **Ley 39/2015, Art. 26.2.** Requisitos de validez de un documento electrónico administrativo:
  - formato susceptible de identificación;
  - datos de identificación;
  - referencia temporal;
  - **metadatos mínimos exigidos**;
  - **firmas electrónicas que correspondan**.

  El Art. 26.3 exime de firma a los documentos que no forman parte de un expediente, pero obliga a identificar su origen.
- **Ley 39/2015, Art. 70.4.** No forma parte del expediente la información auxiliar o de apoyo (borradores, resúmenes, informes internos), salvo los informes preceptivos o facultativos solicitados antes de la resolución.
- **NTI de Documento Electrónico** (BOE-A-2011-13169). El documento se compone de contenido, firma y metadatos. Los metadatos mínimos obligatorios (Anexo I) son:
  - versión de la NTI;
  - identificador;
  - órgano;
  - fecha de captura;
  - origen;
  - estado de elaboración;
  - nombre de formato;
  - tipo documental;
  - tipo de firma;
  - y, cuando proceda, CSV e identificador del documento de origen.

  Los formatos se rigen por la NTI de Catálogo de estándares, y el intercambio se hace con la estructura del Anexo II (XML).
- **NTI de Catálogo de estándares** (BOE-A-2012-13501, texto consultado sin modificaciones posteriores a 2013). Formatos de documento admitidos:
  - PDF/A (ISO 19005-1 y 19005-2);
  - ODF (ISO/IEC 26300);
  - Strict Open XML (ISO/IEC 29500-1:2012).

## Diagnóstico

1. **Por sí solo, el informe no cumple el Art. 26.2.** La herramienta no conoce el órgano (código DIR3), el tipo documental ni el estado de elaboración ENI, y no firma. Lo honesto es no simularlo: el informe declara que es preliminar y que su identificador no es un CSV.
2. **El `.docx` que genera la librería es OOXML *Transitional*,** no la variante *Strict* que recoge el Catálogo. Sirve como borrador editable, pero no es el formato de conservación.
3. **Mientras no se firme, el informe es información de apoyo** (Art. 70.4). Si el órgano competente lo solicita como informe antes de resolver, pasa a integrarse en el expediente, y entonces debe cumplir el Art. 26.2.

## Decisión propuesta

1. La herramienta produce **borradores editables** (`.docx` y `.md`) y el manifiesto `.json`. No genera PDF/A firmado ni metadatos ENI: no tiene acceso al órgano, al certificado ni a la sede.
2. **Incorporación al expediente,** a través del gestor de expedientes de la Diputación:
   - la persona responsable revisa y corrige el borrador;
   - lo convierte a **PDF/A**;
   - el gestor añade los **metadatos ENI**;
   - los responsables lo **firman** en el portafirmas (firma del personal, Art. 43 de la Ley 40/2015);
   - el gestor asigna el **CSV** de la sede.
3. **El manifiesto JSON se adjunta como anexo técnico,** porque permite reproducir el diagnóstico (entradas, versión del motor y huella).
4. **Se revisará** si la Diputación decide otro formato de conservación (ODF o Strict Open XML) o si el gestor de expedientes exige metadatos adicionales.

## Pendiente de validar por la Diputación

- Tipo documental ENI aplicable (por ejemplo, «Informe») y serie documental del cuadro de clasificación.
- Quién firma: responsable funcional, Responsable de Seguridad y DPD, según el uso.
- Plazo de conservación del informe y del manifiesto.
