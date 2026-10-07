> **Documento histórico (versión 1.0, sustituido).** Contiene afirmaciones que se corrigieron durante el saneamiento: «auxilio técnico instrumental amparado por el Ómnibus», medidas de la Guía CCN-STIC 884D no cotejadas, claves custodiadas en `localStorage` y consulta normativa «en tiempo real», entre otras. No debe usarse como descripción de la herramienta. La información vigente para el DPD está en [revision-humana.md](../revision-humana.md), [piloto.md](../piloto.md), [ADR 001](../adr/001-credenciales-inferencia.md) y [custodia-historial.md](../custodia-historial.md); los hallazgos, en la [matriz](../auditoria/matriz-hallazgos.md).

# DOSSIER TÉCNICO-METODOLÓGICO PARA EL DELEGADO DE PROTECCIÓN DE DATOS (DPD / DPO)
## Arquitectura, Base Normativa, Funcionamiento y Garantías de Soberanía de "Auditor IA · Sector Público"

**Destinatario:** Delegado/a de Protección de Datos (DPD / DPO) · Responsable de Seguridad ENS (CISO) · Asesoría Jurídica  
**Entidad Promotora:** Arias Lombardero · Aplicaciones  
**Versión del Sistema Evaluado:** Auditor IA · Sector Público España v1.0  
**Fecha de Emisión:** Octubre 2026  
**Marco de Conformidad:** Reglamento General de Protección de Datos (RGPD UE 2016/679) · Ley Orgánica 3/2018 (LOPDGDD) · Reglamento Europeo de IA (AI Act UE 2024/1689) · Reglamento Ómnibus Digital (UE 2026/1744) · Esquema Nacional de Seguridad (Real Decreto 311/2022) · Guía CCN-STIC 884D · Ley 40/2015

---

## 1. RESUMEN EJECUTIVO PARA EL DPD

El presente documento tiene por finalidad exponer con total transparencia técnica y jurídica los fundamentos, arquitectura y metodología de **Auditor IA · Sector Público**, permitiendo al Delegado de Protección de Datos (DPD) y a la Comisión de Seguridad de la Información verificar:

1. **Cómo garantiza el principio de integridad y confidencialidad (Art. 5.1.f RGPD):** La aplicación opera en el entorno local del usuario (navegador web o intranet corporativa) sin transferir código, consultas ni credenciales a servidores externos no autorizados.
2. **Cómo conoce y aplica la normativa (¿Base interna o consulta en tiempo real?):** La herramienta dispone de un **Motor Determinista Simbólico con la normativa codificada en reglas formales fijas**. No confía la calificación jurídica a la memoria estocástica o probabilística de un modelo de lenguaje (evitando alucinaciones), reservando la IA conectada exclusivamente para la redacción explicativa y la síntesis dogmática.
3. **Cómo delimita el régimen jurídico del sistema auditado:** Aplica de forma estricta el deslinde entre **Auxilio Técnico Instrumental** (asistencia al empleado público sin fe pública propia, amparado por el Ómnibus Digital UE 2026/1744) y **Actuación Administrativa Automatizada** (Art. 41 de la Ley 40/2015 y Art. 22 del RGPD sobre decisiones individuales automatizadas).
4. **Cómo materializa las obligaciones de la AEPD:** Genera de forma asistida el informe de **Evaluación de Impacto en Protección de Datos (EIPD)** según la taxonomía oficial de la Agencia Española de Protección de Datos y el enlace con el **Registro de Actividades de Tratamiento (RAT, Art. 30 RGPD)**.

---

## 2. ARQUITECTURA NORMATIVA: ¿CÓMO CONOCE LA LEY LA APLICACIÓN?

Una de las principales preocupaciones para un Delegado de Protección de Datos al evaluar herramientas basadas en IA es el **riesgo de alucinación jurídica**: que un modelo generativo invente artículos, confunda directivas o aplique normativas derogadas.

**Auditor IA resuelve este problema mediante una Arquitectura Híbrida en Dos Capas:**

```
                  ┌────────────────────────────────────────────────────────┐
                  │          ENTRADA DOCUMENTAL (README + AGENTS)          │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
               ┌──────────────────────────────────────────────────────────────┐
               │ CAPA 1: MOTOR DETERMINISTA SIMBÓLICO (ZERO-HALLUCINATION)    │
               │  - Reglas algorítmicas codificadas en TypeScript puro        │
               │  - Catálogo de Prohibiciones Art. 5 RIA                      │
               │  - Taxonomía de Alto Riesgo Anexo III RIA                    │
               │  - Matrices de Calificación D-A-I-C-T del ENS (RD 311/2022)   │
               │  - Verificación Art. 41 Ley 40/2015 y Art. 22 RGPD          │
               │  - Medidas de Ciberseguridad Guía CCN-STIC 884D             │
               └──────────────────────────────┬───────────────────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       │                                             │
                       ▼                                             ▼
       ┌──────────────────────────────┐              ┌──────────────────────────────┐
       │   DIAGNÓSTICO FORMAL FIJO    │              │ CAPA 2: ENRIQUECIMIENTO LLM  │
       │  - Nivel de Riesgo Legal     │              │  (OPCIONAL Y SUPERVISADO)    │
       │  - Categoría ENS             │              │  - Redacción de dictamen     │
       │  - Ficha RAT y Medidas ENS   │              │  - Sugerencias doctrinales   │
       │  - Red Flags y Obligaciones  │              │  - Inferencia Local u Cloud  │
       └───────────────┬──────────────┘              └──────────────┬───────────────┘
                       │                                            │
                       └──────────────────────┬─────────────────────┘
                                              ▼
                             ┌─────────────────────────────────┐
                             │ EXPEDIENTE OFICIAL TÉCNICO Y    │
                             │ EIPD WORD / MARKDOWN AUDITABLE  │
                             └─────────────────────────────────┘
```

### 2.1. Capa 1: Base de Conocimiento Simbólica y Determinista (Local)
La normativa **no se busca en tiempo real en internet mediante scraping aleatorio ni se deja al criterio de un prompt**, sino que reside codificada de forma inmutable en el módulo [`legalKnowledgeBase.ts`](file:///c:/Users/lombi/Desktop/Varios/Inteligencia%20artificial/Aplicaciones%20vibe%20coding/Creador%20de%20temas/auditor-ia-app/src/lib/legalKnowledgeBase.ts):

* **AI Act (Reglamento UE 2024/1689):**
  * Catálogo taxativo de prácticas prohibidas del Art. 5 (manipulación cognitiva subliminal, explotación de vulnerabilidades, categorización biométrica sensible y puntuación ciudadana/social scoring).
  * Supuestos de Alto Riesgo del Anexo III, con especial foco en el **Punto 4.a** (sistemas destinados a la contratación o selección de personas físicas y baremación en oposiciones) y **Punto 5** (acceso a prestaciones públicas esenciales).
  * Régimen de supervisión humana efectiva (*Human-in-the-loop* / *Human-on-the-loop*, Art. 14).
  * Obligaciones de transparencia activa (Art. 50).
* **Reglamento Europeo Ómnibus Digital (UE 2026/1744):**
  * Cláusulas de simplificación administrativa e interoperabilidad (Art. 18 y 24) que eximen de trámites burocráticos desproporcionados a herramientas que actúan como mero auxilio técnico sin efectos vinculantes directos sobre el ciudadano.
* **Esquema Nacional de Seguridad (Real Decreto 311/2022):**
  * Parámetros de categorización del sistema (Nivel BÁSICA, MEDIA o ALTA) en función del impacto en las cinco dimensiones: Disponibilidad, Autenticidad, Integridad, Confidencialidad y Trazabilidad (D-A-I-C-T).
* **Guía de Seguridad CCN-STIC 884D (CCN-CERT):**
  * Medida IA-01: Prohibición de exposición de credenciales y API keys en el frontend.
  * Medida IA-04: Sanitización previa para evitar filtración de secretos oficiales o datos protegidos.
  * Medida IA-08: Trazabilidad, sellado de tiempo y retención segura de peticiones/respuestas (mínimo 24 meses).
  * Medida IA-12: Prioridad a modelos locales On-Premise para datos reservados o sensibles.
* **Régimen Administrativo y de Privacidad Estatal:**
  * Art. 41 de la Ley 40/2015: Deslinde formal de la Actuación Administrativa Automatizada.
  * Art. 6.1.e) y Art. 9 del RGPD: Base jurídica de misión pública y tratamiento restrictivo de categorías especiales de datos.

### 2.2. Capa 2: Motor de Lenguaje Natural (LLM) Conectable (Opcional)
Si la entidad decide activar un proveedor de IA (como un modelo local mediante **Ollama / vLLM** dentro de la propia red corporativa, o una API en la nube con DPA firmado):
* El LLM **no decide** la categoría del ENS ni la clasificación de riesgo (lo hace la Capa 1 determinista).
* El LLM recibe los hechos ya clasificados y actúa como redactor técnico-jurídico, redactando los considerandos del expediente con lenguaje formal del sector público y citando los preceptos de aplicación.
* Se fija una temperatura reducida (`temperature: 0.0 - 0.2`) para garantizar predictibilidad y coherencia dogmática.

---

## 3. OBJETIVOS ESPECÍFICOS DEL SISTEMA

1. **Evitar la "IA en la sombra" (*Shadow AI*) en la Administración:** Permitir que los servicios promotores de software validen formalmente cualquier desarrollo antes de su pase a explotación.
2. **Garantizar la Soberanía Tecnológica del Dato Público:** Fomentar el uso de modelos locales (*On-Premise*) frente a nubes hiperescalares extranjeras, mitigando los riesgos de transferencia internacional de datos (Capítulo V RGPD).
3. **Proteger al Funcionario Tramitador:** Asegurar que ningún software desplace la responsabilidad funcionarial ni sustituya la firma electrónica del empleado público (garantizando el principio *Human-in-the-Loop*).
4. **Simplificar el Trabajo del DPD y del CISO:** Proporcionar al DPD y al Responsable de Seguridad del ENS un informe pre-estructurado, con matrices de riesgo, catálogo de prácticas prohibidas auditadas y la propuesta de EIPD lista para firmar.

---

## 4. METODOLOGÍA Y FUNCIONAMIENTO PASO A PASO

La aplicación guía al usuario a través de un procedimiento estructurado en **6 pasos secuenciales**:

```
[ Paso 1: Ingesta ] ──▶ [ Paso 2: Entrevista ] ──▶ [ Paso 3: Diagnóstico ]
                                                            │
[ Paso 6: Blindaje ] ◀── [ Paso 5: Expediente ] ◀── [ Paso 4: Código Art. 50 ]
```

---

### PASO 1: Identificación e Ingesta Técnica (Doble Nivel Documental)
El usuario identifica el software a auditar. Para no depender de entornos de desarrollo ni licencias privativas, Auditor IA implementa una **ingesta multi-canal**:

1. **Documentación Funcional (`README.md`):** Describe qué hace la app a nivel de usuario, qué servicios ofrece y a qué destinatarios se dirige (empleados públicos, ciudadanía o TI).
2. **Especificación Técnica y de Agentes (`AGENTS.md` / `CLAUDE.md`):** Documenta las directivas maestras (*System Prompts*), el grado de autonomía de las herramientas (*tools/functions*), la política de retención de datos y la soberanía de inferencia.
3. **Escáner Directo de Repositorios Públicos de GitHub:**
   * La app se conecta directamente con GitHub y descarga el `README.md` oficial.
   * Analiza el `package.json` o `requirements.txt` para detectar librerías de IA (`@google/genai`, `openai`, `ollama`, `langchain`, `fastapi`, etc.) y auto-rellena la Pila Tecnológica.
   * Comprueba si ya existía un `AGENTS.md` en la raíz del repositorio.
4. **Mecanismos de Generación en caso de no disponer de `AGENTS.md`:**
   * *Opción A (Con IA conectada):* Pulsar "Generar con IA de Auditoría", que realiza ingeniería inversa de la arquitectura y redacta el manifiesto en 10 segundos.
   * *Opción B (Sin IA / Asistente de 4 Preguntas):* Un cuestionario guiado que permite al funcionario declarar el modelo, grado de autonomía, filtros de salida y retención de logs, ensamblando el `AGENTS.md` al instante.
5. **Insignia de Cobertura Documental:**
   * *Cobertura Estándar:* Solo `README.md`.
   * *🛡️ Cobertura Pericial Completa:* `README.md` + `AGENTS.md` (garantiza auditoría tanto del comportamiento externo como de las tripas del modelo).

---

### PASO 2: Entrevista Jurídica y de Gobernanza Paramétrica
A través de preguntas estandarizadas, el usuario declara las condiciones operativas reales del despliegue:

* **Control Humano (Art. 14 RIA):** ¿Supervisión previa obligatoria (*Human-in-the-loop*), supervisión posterior o actuación desatendida?
* **Régimen de la Decisión (Art. 41 Ley 40/2015 y Art. 22 RGPD):** ¿El sistema emite resoluciones vinculantes o actúa como auxilio técnico instrumental (borradores sin presunción de fe pública)?
* **Soberanía y Ubicación del Dato:** ¿Inferencia local On-Premise (Ollama/vLLM), nube europea con DPA amparado en el RGPD, o nube comercial internacional?
* **Categorías Especiales de Datos (Art. 9 RGPD):** ¿Se procesan datos de salud, opiniones sindicales, convicciones religiosas o datos biométricos?
* **Trazabilidad y RAT:** ¿Está la actividad vinculada formalmente al Registro de Actividades de Tratamiento (RAT) del organismo? ¿Se conservan logs con sellado de tiempo y retención mínima de 24 meses?

---

### PASO 3: Diagnóstico de Gobernanza y Matriz de Riesgo
El motor determinista evalúa las respuestas frente al marco normativo:

1. **Verificación de Prácticas Prohibidas (Art. 5 RIA):** Certificación una a una de la ausencia de manipulación subliminal, detección de estrés en el puesto de trabajo o perfilado biométrico.
2. **Evaluación de Alto Riesgo (Anexo III RIA):**
   * Si la app interviene en selección de personal o baremación de empleo público pero **no decide de forma autónoma**, sino que elabora borradores que el tribunal calificador coteja y aprueba, se desvincula formalmente del Anexo III al amparo del **Reglamento Ómnibus Digital (UE 2026/1744)**.
   * Si pretendiera puntuar automáticamente sin revisión, se clasifica como **ALTO RIESGO**, activando la exigencia de marcado CE y auditoría externa de sesgos.
3. **Categorización ENS (RD 311/2022):**
   * *Nivel BÁSICA:* Herramientas de consulta interna o redacción de textos públicos sin datos personales.
   * *Nivel MEDIA:* Tratamiento de datos de empleados públicos o ciudadanos en expedientes reglados.
   * *Nivel ALTA:* Tratamiento de datos del Art. 9 RGPD o servicios públicos esenciales cuya interrupción cause grave perjuicio.
4. **Alertas Rojas (*Red Flags*):** Detección automática de inconsistencias críticas (ejemplo: usar nubes internacionales para tratar datos de salud, o carecer de registro de logs).

---

### PASO 4: Kit de Código y Componentes Correctivos
Auditor IA no se limita a señalar defectos: **genera el código informático listo para subsanarlos**:

1. **Banner de Transparencia Obligatoria (Art. 50 AI Act):** Código modular para React y HTML nativo que inserta el aviso imperativo:  
   * *"Aviso Art. 50 AI Act (Reglamento UE 2024/1689): Este contenido ha sido generado con auxilio de IA. Requiere la lectura crítica y validación humana preceptiva antes de su uso oficial."*
2. **Pie de Página Oficial para Documentos Word (.docx):** Snippet con la biblioteca `docx` para insertar la cláusula de advertencia en cada hoja emitida.
3. **Módulo de Auditoría y Trazabilidad (CCN-STIC 884D):** Código en TypeScript/Node.js para registrar en base de datos cada consulta, respuesta, usuario tramitador y **hash SHA-256** inalterable.
4. **Manifiesto de Conformidad (`ai-compliance.json`):** Archivo de metadatos auditable para incorporar al repositorio del proyecto.

---

### PASO 5: Expediente Técnico Administrativo Oficial y Diligencia de Firma
El sistema compila un informe pericial completo exportable en dos formatos:

* **Expediente en Formato Markdown (.md):** Para control de versiones en repositorios Git y auditoría técnica.
* **Expediente Oficial en Formato Word (.docx):** Maquetado con diseño institucional conforme a la Guía de Comunicación de la AGE, incluyendo:
  * Portada oficial y marco legal.
  * Resumen ejecutivo y dictamen motivado.
  * Descripción técnica, arquitectura y nivel de cobertura documental (Estándar vs. Pericial).
  * Tabla de prácticas prohibidas del Art. 5 del RIA.
  * Deslinde competencial con el Art. 41 de la Ley 40/2015.
  * Medidas de ciberseguridad CCN-STIC 884D.
  * **Diligencia de Conformidad y Firma:** Cuadro formal de rúbricas tripartito:
    1. *El Responsable Funcional del Servicio.*
    2. *El Responsable de Seguridad ENS (CISO).*
    3. *El Delegado de Protección de Datos (DPD / DPO).*
* **Soporte para AutoFirma:** Instrucciones y metadatos preparados para el sellado electrónico mediante la aplicación oficial **AutoFirma** de la Administración General del Estado (AGE), generando firmas XAdES / PAdES con certificado digital de empleado público cualificado.

---

### PASO 6: Laboratorio de Blindaje Pre-Producción (*Hardening*)
Es el módulo pericial más avanzado, diseñado para que el DPD y el CISO puedan poner a prueba la solución antes de autorizar su paso a producción:

1. **Simulador de Inyección de Prompts (*Red Teaming*):** Ejecuta 10 vectores de ataque adversario (fugas de información, inyecciones Base64, suplantación de roles tipo DAN, bypass de directivas del sistema) para verificar si el modelo respeta las restricciones institucionales.
2. **Generador Oficial de EIPD (Evaluación de Impacto en Protección de Datos):** Exporta un documento Word (.docx) completo estructurado exactamente conforme a la **Guía de la AEPD para la Evaluación de Impacto**, detallando la necesidad, proporcionalidad, matriz de riesgos para los derechos y libertades, y medidas mitigadoras.
3. **Filtro Guardián en Tiempo Real (*Prompt-Guard & Data Leakage*):** Módulo de software que intercepta las peticiones de los usuarios y bloquea en tiempo real DNI/NIE españoles, números de cuenta IBAN, tarjetas bancarias y patrones maliciosos de inyección antes de que lleguen al modelo de IA.
4. **Verificador de Soberanía RAG Local:** Inspecciona si las bases de datos vectoriales y documentos normativos residen en local (ChromaDB / SQLite) o si se envían a motores de embeddings comerciales extranjeros.
5. **Diligencia Pre-Producción Firmable:** Certificado formal de superación del laboratorio de pruebas técnicas.

---

## 5. TABLA COMPARATIVA: ¿QUÉ GARANTÍAS OFRECE AL DPD?

| Requisito Legal / Exigencia AEPD | ¿Cómo lo aborda Auditor IA? | Beneficio Concreto para el DPD |
| :--- | :--- | :--- |
| **Confidencialidad y Seguridad (Art. 32 RGPD)** | Ejecución en el navegador / intranet. Sin bases de datos intermedias en servidores ajenos. | No hay cesión de datos del expediente de auditoría a terceros. |
| **Decisiones Automatizadas (Art. 22 RGPD)** | Exige y audita la supervisión humana preceptiva (*Human-in-the-Loop*). | Garantiza que ningún algoritmo emita actos resolutorios sobre ciudadanos. |
| **Soberanía y Transferencias (Cap. V RGPD)** | Premia y prioriza arquitecturas locales On-Premise (Ollama/vLLM) frente a nubes foráneas. | Elimina el riesgo de transferencias internacionales ilícitas a EE.UU. |
| **Exactitud y No Alucinación (Art. 5.1.d RGPD)** | Capa 1 determinista basada en reglas normativas formales inmutables. | El dictamen de riesgo no varía por capricho de un algoritmo probabilístico. |
| **Registro de Tratamientos (Art. 30 RGPD)** | Vincula formalmente la aplicación con la ficha correspondiente del RAT del organismo. | Facilita la actualización inmediata del inventario de actividades de tratamiento. |
| **Evaluación de Impacto (Art. 35 RGPD)** | Generador integrado de EIPD en Word según la metodología de la AEPD. | Ahorra decenas de horas en la redacción formal del expediente de impacto. |
| **Transparencia Activa (Art. 50 AI Act)** | Proporciona el código listo para insertar el banner y pie de página de advertencia de IA. | Cumplimiento técnico inmediato y auditable por cualquier ciudadano o inspector. |
| **Trazabilidad (CCN-STIC 884D)** | Genera código para sellado de logs con hash criptográfico SHA-256 (24 meses). | Evidencias inalterables ante reclamaciones ante el Consejo de Transparencia o AEPD. |

---

## 6. CONCLUSIÓN PARA EL DELEGADO DE PROTECCIÓN DE DATOS

**Auditor IA · Sector Público** no es un "chat" de inteligencia artificial genérico ni una herramienta lúdica de asistencia. Es una **plataforma pericial de gobernanza y aseguramiento normativo** diseñada por y para el sector público español.

Su arquitectura híbrida (motor determinista + LLM opcional explicativo), su total independencia de entornos privativos, su capacidad de ingeniería inversa documental y su enfoque preventivo permiten al DPD y a la Dirección de Servicios Jurídicos:

1. **Tener el control total del ciclo de vida de la IA en la organización.**
2. **Autorizar despliegues de innovación tecnológica con pleno respaldo documental, técnico y jurídico.**
3. **Disponer en todo momento de las evidencias requeridas por el AI Act, la AEPD y el Esquema Nacional de Seguridad.**
