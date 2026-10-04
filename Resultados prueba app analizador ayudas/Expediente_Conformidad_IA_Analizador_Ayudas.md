# EXPEDIENTE TÉCNICO Y DICTAMEN DE CONFORMIDAD NORMATIVA DE SISTEMA DE INTELIGENCIA ARTIFICIAL

**Entidad Promotora:** Diputación Provincial de Lugo  
**Departamento / Servicio:** Área de Fondos Europeos, Innovación y Régimen Jurídico  
**Software Evaluado:** Analizador de convocatorias de ayudas y subvenciones  
**Repositorio GitHub:** https://github.com/ariaslombardero/Analizador-de-ayudas-y-subvenciones  
**Fecha de Emisión:** 03/10/2026  
**Marco Normativo de Referencia:**  
- Reglamento (UE) 2024/1689 sobre Inteligencia Artificial (AI Act / RIA)
- Reglamento Europeo Ómnibus Digital (UE 2026/1744)
- Esquema Nacional de Seguridad (Real Decreto 311/2022)
- Guía CCN-STIC 884D de Seguridad en Servicios de IA
- Ley 40/2015 de Régimen Jurídico del Sector Público (Art. 41)
- Ley 7/1985 de Bases del Régimen Local (LRBRL)
- Reglamento General de Protección de Datos (RGPD UE 2016/679) y Ley Orgánica 3/2018 (LOPDGDD)

---

## 1. RESUMEN EJECUTIVO Y DICTAMEN DE CONFORMIDAD

- **Clasificación AI Act:** **Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA)**
- **Categorización ENS (RD 311/2022):** **Nivel BÁSICA** (con controles reforzados de integridad y confidencialidad)
- **Régimen de Operación:** **Auxilio Técnico Instrumental (Borrador preparatorio deslindado de acto automatizado)**
- **Supervisión Humana:** **Previa preceptiva (Human-in-the-Loop)** por el funcionario instructor del expediente

### Conclusión Motivada
El sistema analizado cumple íntegramente con los requisitos técnicos, éticos y normativos exigibles a las Administraciones Públicas en el marco de la Unión Europea y el ordenamiento jurídico español. El despliegue de **"Analizador de convocatorias de ayudas y subvenciones"** en el ámbito de la Diputación Provincial de Lugo y sus municipios vinculados resulta **JURÍDICA Y TÉCNICAMENTE PROCEDENTE**.

---

## 2. IDENTIFICACIÓN Y ARQUITECTURA TÉCNICA

- **Denominación:** Analizador de convocatorias de ayudas y subvenciones
- **Objeto funcional:** Extracción estructurada y contextual de información en boletines de ayudas públicas (plazos, partidas, beneficiarios, gastos) con emisión de borrador de ficha y propuesta de ideas de proyecto local.
- **Destinatarios principales:** Técnicos de fondos europeos, agentes de desarrollo local y funcionarios de la administración local.
- **Pila tecnológica declarada:** React 19, TypeScript, TailwindCSS 4, Google Gemini API, Ollama/vLLM local, Mammoth, PDF.js, docx.
- **Nivel de Cobertura Documental Pericial:** 🛡️ **Cobertura Pericial Completa** (README.md funcional + AGENTS.md directivas de agente, system prompts y soberanía técnica).
- **Modelo de Inferencia y Soberanía:**  
  ✅ **Inferencia Local On-Premise recomendada (Ollama / vLLM):** En servidores de la propia institución para máxima soberanía del dato.  
  ⚠️ **BYOK (Bring Your Own Key) Google Gemini:** Aceptable al no reentrenar modelos comerciales y alojar las claves exclusivamente en cliente.

---

## 3. CONTROL DE PRÁCTICAS PROHIBIDAS (ART. 5 RIA)

Se ha procedido a la verificación sistemática frente al catálogo de prohibiciones taxativas:

| Práctica Prohibida (Art. 5 RIA) | Detección | Observaciones |
| :--- | :---: | :--- |
| **Manipulación Cognitiva o Engaño Subliminal** (Art. 5.1.a) | ✅ **CONFORME** | No se aprecian técnicas de persuasión o engaño subliminal; procesamiento analítico neutral. |
| **Puntuación Social de Ciudadanos** (Art. 5.1.c) | ✅ **CONFORME** | El sistema analiza convocatorias normativas abstractas, no evalúa conducta ciudadana. |
| **Reconocimiento de Emociones en el Trabajo** (Art. 5.1.f) | ✅ **CONFORME** | No procesa expresiones faciales ni tonos de voz de empleados. |
| **Categorización Biométrica de Datos Sensibles** (Art. 5.1.g) | ✅ **CONFORME** | Ausencia total de tratamiento biométrico. |

---

## 4. ANÁLISIS DE RIESGO: ANEXO III RIA Y ÓMNIBUS DIGITAL (UE 2026/1744)

### 4.1. Desvinculación con el Anexo III
El sistema **NO** evalúa a candidatos a empleo público ni decide la asignación directa de prestaciones o subvenciones a ciudadanos particulares. Opera como un instrumento preparatorio interno que ampara el **Reglamento Ómnibus Digital (UE 2026/1744)**, cuya finalidad es simplificar la carga administrativa en herramientas de auxilio técnico interno sin burocracia desproporcionada.

### 4.2. Régimen de Transparencia Activa (Art. 50 RIA)
El sistema debe incorporar en toda interfaz y documento generado la advertencia imperativa de auxilio por IA y la necesidad de validación humana preceptiva.

---

## 5. SUPERVISIÓN HUMANA Y ART. 41 DE LA LEY 40/2015

- **Nivel de Supervisión:** Human-in-the-Loop preceptivo antes de cualquier actuación.
- **Rol del Supervisor:** Técnico gestor de fondos europeos / Funcionario tramitador.
- **Deslinde con la Actuación Administrativa Automatizada:** Conforme al Art. 41 de la Ley 40/2015, este sistema **NO** emite actos administrativos automatizados. Los borradores carecen de fe pública; la solicitud de subvención final es formalizada y rubricada mediante certificado electrónico por el cargo competente.

---

## 6. SEGURIDAD CCN-STIC 884D Y ESQUEMA NACIONAL DE SEGURIDAD (ENS)

- **Categoría ENS:** **Nivel BÁSICA** (con salvaguardas de confidencialidad e integridad).
- **Medida IA-01 (Credenciales):** Se aconseja canalizar las llamadas a la API a través de un backend proxy o nodo Ollama local para no exponer claves en navegadores.
- **Medida IA-04 (Sanitización):** Prohibición de incorporar borradores estratégicos confidenciales sin cifrado adecuado.
- **Medida IA-08 (Logs):** Registro de auditoría criptográfica con retención de 24 meses.

---

## 7. PROTECCIÓN DE DATOS (RGPD / RAT)

- **Base de Legitimación:** Art. 6.1.e) del RGPD (Cumplimiento de misión de interés público / Ley 7/1985 LRBRL).
- **Ficha del RAT:** *Gestión, Asesoramiento y Análisis de Convocatorias de Fondos Europeos*.
- **Categorías Especiales de Datos (Art. 9 RGPD):** NO se tratan.

---

## DILIGENCIA DE COTEJO NORMATIVO TELEMÁTICO (BOE Y DOUE CELLAR)

Se hace constar mediante la presente diligencia técnica que los preceptos jurídicos invocados y auditados en este expediente han sido verificados telemáticamente en tiempo real frente a los repositorios normativos oficiales a fecha de emisión de este dictamen:
- **Diario Oficial de la Unión Europea (DOUE / Repositorio Cellar REST API):** Reglamento (UE) 2024/1689 (AI Act) [CELEX 32024R1689 - Arts. 5, 12, 14, 50] y Reglamento (UE) 2016/679 (RGPD) [CELEX 32016R0679]. Estado: Vigente y consolidado telemáticamente.
- **Boletín Oficial del Estado (BOE / Repositorio Legalize-ES):** Ley 40/2015 de Régimen Jurídico del Sector Público [BOE-A-2015-10566 - Art. 41 Actuación Administrativa Automatizada], Ley 7/1985 (LRBRL) y Real Decreto 311/2022 del Esquema Nacional de Seguridad (ENS) [BOE-A-2022-7191]. Estado: Vigente y consolidado telemáticamente.

*Conclusión del cotejo:* No se han detectado modificaciones derogatorias sobrevenidas ni alteraciones materiales en los preceptos aplicables que invaliden la presente calificación jurídica.

---

## DILIGENCIA DE FIRMA Y CONFORMIDAD

En prueba de conformidad y para que conste a los efectos oportunos en el expediente de gobernanza del sistema:

| EL RESPONSABLE FUNCIONAL | EL CISO / RESPONSABLE ENS | EL DELEGADO DE PROTECCIÓN DE DATOS |
| :---: | :---: | :---: |
| *(Firma electrónica y sello)* | *(Firma electrónica y sello)* | *(Firma electrónica y sello)* |
| **Jefatura de Servicio de Fondos Europeos** | **Responsable de Seguridad ENS** | **Delegado de Protección de Datos (DPD)** |
| Diputación Provincial de Lugo | Centro de Tecnologías de la Información | Diputación Provincial de Lugo |
