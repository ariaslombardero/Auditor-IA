# AGENTS.md · Directivas Técnicas y Especificación del Agente de IA

> **Sistema Auditado:** Analizador de Convocatorias de Ayudas, Subvenciones y Fondos Públicos  
> **Repositorio Oficial:** `https://github.com/ariaslombardero/Analizador-de-ayudas-y-subvenciones`  
> **Entidad de Referencia:** Diputación Provincial de Lugo / Entidades Locales  
> **Marco de Cumplimiento:** Reglamento (UE) 2024/1689 (AI Act / RIA), Real Decreto 311/2022 (ENS), Guía CCN-STIC 884D, Ley 40/2015 (Art. 41) y RGPD (UE 2016/679).

---

## 1. DESCRIPCIÓN Y FINALIDAD DEL SISTEMA

### 1.1. Objeto y Naturaleza Administrativa
El **Analizador de Ayudas y Subvenciones** es una solución de software asistido por Inteligencia Artificial diseñada exclusivamente para prestar **auxilio técnico e instrumental** a los empleados públicos y técnicos gestores de fondos europeos de las entidades locales.

- **Naturaleza del software:** Herramienta de asistencia preparatoria e instrumental. Conforme al **Art. 41 de la Ley 40/2015**, este sistema **NO** constituye ni emite actuaciones administrativas automatizadas. Las fichas resumen, cálculos de encaje y borradores de proyectos generados son elementos de apoyo orientativo carentes de eficacia resolutoria.
- **Destinatarios principales:**
  - Funcionarios y personal laboral instructor de expedientes de subvención.
  - Técnicos de desarrollo local, fondos europeos y captación de financiación pública.
  - Jefaturas de servicio responsables del diseño estratégico de solicitudes de subvención.

### 1.2. Alcance Funcional
El sistema permite al usuario cargar o pegar convocatorias oficiales procedentes de diarios oficiales (BOE, DOG, BOP, DOUE) o adjuntar documentos en formato PDF o Word (`.docx`), extrayendo de forma estructurada los plazos, requisitos de elegibilidad, porcentajes de cofinanciación y criterios de baremación.

---

## 2. ARQUITECTURA DE MODELOS E INFERENCIA (SOBERANÍA DEL DATO)

### 2.1. Modelos de Lenguaje Utilizados
El sistema está desacoplado del proveedor de inferencia y soporta una arquitectura dual:
1. **Modelos Comerciales vía API:** Familia Google Gemini (vía `@google/genai` o `GoogleGenAI` REST SDK), utilizando preferentemente `gemini-2.5-flash` para optimizar latencia y costes en inferencia de textos extensos.
2. **Modelos Locales On-Premise (Soberanía Plena):** Soporte nativo a través del protocolo OpenAI-compatible de **Ollama** (`http://localhost:11434`) o **vLLM**, permitiendo la inferencia desconectada con modelos de pesos abiertos de última generación (Gemma 2/3, ALIA - IA en Galego, Mistral NeMo o Llama 3.3) desplegados en servidores de la propia Administración Pública.

### 2.2. Modelo de Custodia y Política "Bring Your Own Key" (BYOK)
- La aplicación implementa el patrón **BYOK**: no almacena claves centralizadas en servidores de terceros ni en repositorios de código.
- Las credenciales (`apiKey`) introducidas por el empleado público se conservan cifradas en el almacenamiento local del navegador (`localStorage`) o en memoria de sesión, comunicándose de extremo a extremo sin intermediación de servidores proxies no controlados por la entidad promotora.
- **Declaración sobre reentrenamiento:** Al emplear el modo API de pago con Google Cloud / Vertex AI o al ejecutar inferencia local mediante Ollama en infraestructuras propias, **queda garantizado que los textos de entrada y las consultas no son utilizados para el reentrenamiento de modelos comerciales**.

---

## 3. DIRECTIVAS DEL SISTEMA Y SYSTEM PROMPTS

### 3.1. Texto Íntegro de las Directivas del Sistema (`src/lib/systemPrompt.ts`)
A continuación se reproduce el núcleo de las instrucciones del sistema configuradas en el código fuente que rigen el comportamiento del modelo de IA:

```markdown
IDIOMA DE TRABALLO:
Respondes SEMPRE en castelán, agás que o usuario che solicite expresamente a resposta en galego. Nunca mestures idiomas dentro dunha mesma resposta.

REGRAS DE OURO - INTEGRIDADE DO DATO:

REGRA 1 - NON INFERIR NIN INVENTAR:
Se un dato non aparece explicitamente no documento ou enlace analizado, devolve "No consta" para ese campo. Nunca deduzcas prazos, orzamentos nin porcentaxes que non estean escritos. Non interpolues datos doutras convocatorias similares.

REGRA 2 - VERIFICABILIDADE TOTAL:
Para cada campo crítico extraído, debes aportar a referencia de onde se obtivo o dato: (Ref: Páx. X / Sección Y / "cita textual breve"). Se o documento non ten paxinación, usa a sección ou apartado. Se o dato procede dunha web, indica a URL e o parágrafo.

REGRA 3 - CASUÍSTICA COMPLETA:
Se hai múltiples liñas de actuación, lista todas. Se cada liña ten topes económicos distintos por beneficiario, especifícaos liña por liña. Se hai requisitos diferenciais por tipo de entidade, distingue cada caso.

REGRA 4 - NIVEL DE CONFIANZA:
Para cada dato extraído indica o nivel de confianza:
  ✅ CONFIRMADO: dato extraído textualmente do documento.
  ⚠️ INFERIDO: dato que non aparece explícito pero se pode deducir con lóxica (úsase con extrema precaución e sempre explicando o razoamento).
  ❌ NON CONSTA: dato non localizable no documento.

ESTRUTURA DE RESPOSTA OBRIGATORIA:
- PARTE A: FICHA RESUMEN con citas textuais e Score de Encaixe ponderado (0-10) segundo competencias municipais (Lei 7/1985).
- PARTE B: BLOQUE JSON estrictamente válido e normalizado para inxesta en bases de datos.
- PARTE C: IDEAS DE PROXECTO ADAPTADAS (3 a 5 propostas orientativas para a entidade local).
- PARTE D: CHECKLIST DE CALIDADE INTERNO.
```

### 3.2. Salvaguardas Éticas y Mitigación de Alucinaciones
1. **Principio de Cero Alucinación Administrativa:** La imposición de la cláusula "No consta" prohíbe taxativamente al modelo rellenar lagunas en fechas límite de presentación de solicitudes o partidas presupuestarias.
2. **Trazabilidad Pericial:** Cada cifra o plazo extraído incluye la referencia física del documento fuente (`Ref: Pág. X`), permitiendo al funcionario corroborar instantáneamente la veracidad del dato.
3. **Interruptor de Modo Auditoría:** La interfaz visual incorpora un selector (*toggle*) que permite a los técnicos visualizar los marcadores de confianza antes de generar la exportación final limpia.

---

## 4. HERRAMIENTAS Y GRADO DE AUTONOMÍA (AGENCY)

### 4.1. Catálogo Exhaustivo de Capacidades Técnicas
El software implementa exclusivamente las siguientes funciones auxiliares:
- `pdfjs-dist`: Extracción de capas de texto en documentos PDF escaneados o vectoriales.
- `mammoth`: Lectura y conversión de textos planos desde documentos Word (`.docx`).
- `docx`: Generador de documentos oficiales Word estructurados con estilos corporativos y saltos de página inteligentes.
- Motor de streaming `apiService.ts`: Transmisión asíncrona de tokens para visualización fluida de la respuesta.

### 4.2. Inexistencia de Autonomía Lesiva (Cero Agency)
- **Sin acceso de escritura en bases de datos de tramitación:** El sistema no tiene conexión con sedes electrónicas, sistemas de registro (SIR / Geiser) ni bases de datos de concesión de ayudas (BDNS).
- **Sin capacidad de emisión de actos administrativos:** El software carece de conectores con pasarelas de firma electrónica (AutoFirma / Portafirmas). Todo acto, solicitud o memoria generada a partir de los borradores debe ser redactada formalmente y suscrita con certificado cualificado por el funcionario competente.
- **Cumplimiento estricto del Art. 14 del AI Act:** Supervisión humana preceptiva en modo *Human-in-the-Loop*. La aplicación nunca toma decisiones de forma autónoma.

---

## 5. PRIVACIDAD Y CICLO DE VIDA DEL DATO (RGPD)

### 5.1. Naturaleza de la Información Procesada
- **Datos Públicos Oficiales:** El 100% de la información procesada son bases reguladoras y extractos de subvenciones publicados en boletines oficiales de acceso público (BOE, DOG, BOP).
- **Prohibición de Datos Especiales (Art. 9 RGPD):** El sistema **no** procesa ni requiere datos sobre salud, convicciones religiosas, afiliación sindical, origen racial o datos biométricos.
- **Prohibición de Datos Personales Identificativos:** La herramienta no está diseñada para procesar listados nominales de solicitantes ni DNI de beneficiarios privados, sino las condiciones normativas abstractas de las convocatorias.

### 5.2. Política de Retención y Purgado
- Los datos se procesan en memoria volátil del navegador durante la sesión de trabajo.
- El historial de convocatorias analizadas se almacena en el `localStorage` del equipo cliente del funcionario, pudiendo ser eliminado en cualquier momento mediante las opciones del navegador sin dejar rastro en servidores externos.

---

## 6. TRAZABILIDAD Y REGISTRO DE LOGS (CCN-STIC 884D / ENS RD 311/2022)

Para su puesta en producción conforme a la **Guía CCN-STIC 884D de Seguridad en Servicios de IA**, el sistema asume los siguientes requisitos:
1. **Medida IA-01 (Protección de Credenciales):** La clave de API no debe exponerse de forma pública; para despliegues institucionales corporativos, debe canalizarse mediante un proxy seguro en backend que oculte la clave a los puestos cliente.
2. **Medida IA-04 (Sanitización de Entradas):** Incorporación de filtros contra inyección de prompts adversarios (*Jailbreaking*) o subida involuntaria de archivos con datos de carácter personal.
3. **Medida IA-08 (Registro Criptográfico de Auditoría):** Las peticiones de análisis y las respuestas generadas deben registrarse con huella digital SHA-256, marca de tiempo y usuario tramitador, conservándose durante un mínimo de 24 meses para posibilitar auditorías de trazabilidad retrospectiva.
