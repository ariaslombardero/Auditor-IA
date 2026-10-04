# INFORME TÉCNICO: PROCESO COMPLETO DE AUDITORÍA Y GOBERNANZA IA

> **Aplicación Auditada:** [Analizador de convocatorias de ayudas y subvenciones](https://github.com/ariaslombardero/Analizador-de-ayudas-y-subvenciones)  
> **Repositorio de Origen:** `ariaslombardero/Analizador-de-ayudas-y-subvenciones` (Rama `main`)  
> **Entidad Promotora Evaluada:** Diputación Provincial de Lugo  
> **Motor de Auditoría:** `Auditor IA · Sector Público España` (Arias Lombardero · Aplicaciones)  
> **Fecha de Ejecución:** 03/10/2026  
> **Carpeta de Artefactos Generados:** `auditor-ia-app/Resultados prueba app analizador ayudas/`

---

## 1. INTRODUCCIÓN Y OBJETO DE LA AUDITORÍA SIMULADA

El presente informe documenta de forma exhaustiva, paso a paso y con rigor metodológico, la auditoría técnica y jurídica realizada sobre la aplicación real de GitHub **"Analizador de convocatorias de ayudas y subvenciones"**, creada bajo el paradigma *Vibe Coding*.

El objetivo primordial ha sido someter el código fuente, la arquitectura de inferencia y la documentación pública del repositorio a los estándares preceptivos de despliegue en las Administraciones Públicas españolas:
1. **Reglamento (UE) 2024/1689 sobre Inteligencia Artificial (AI Act / RIA).**
2. **Reglamento Europeo Ómnibus Digital (UE 2026/1744)** de simplificación administrativa.
3. **Esquema Nacional de Seguridad (Real Decreto 311/2022)** y Guía **CCN-STIC 884D**.
4. **Ley 40/2015 de Régimen Jurídico del Sector Público** (deslinde del Art. 41 de actuación administrativa automatizada).
5. **Reglamento General de Protección de Datos (RGPD UE 2016/679)** y Ley Orgánica 3/2018 (LOPDGDD).

---

## 2. PASO 1: INGESTA TÉCNICA Y DIAGNÓSTICO DEL REPOSITORIO GITHUB

A través de la API pública y el repositorio raw de GitHub, se procedió a la ingesta sistemática de los componentes del software:

```
ariaslombardero/Analizador-de-ayudas-y-subvenciones
├── README.md               # Documentación funcional y de usuario (11.6 KB)
├── package.json            # Pila tecnológica, dependencias y librerías
├── src/
│   ├── App.tsx             # Flujo de trabajo, componentes UI y gestión de estado
│   └── lib/
│       ├── systemPrompt.ts # Directivas completas del sistema para el LLM (9.4 KB)
│       ├── apiService.ts   # Comunicaciones de inferencia streaming y BYOK
│       └── docxExporter.ts # Exportador de informes limpios para uso institucional
```

### Hallazgo Documental Previo:
- **README.md presente:** Excelente detalle sobre instalación, personalización institucional para la Diputación de Lugo, soporte bilingüe (Gallego / Castellano) y tecnologías utilizadas.
- **Ausencia de directivas periciales de agente:** El repositorio no contenía un archivo específico `AGENTS.md` o `CLAUDE.md`. Si un evaluador externo o Delegado de Protección de Datos (DPD) audita únicamente el código desplegado, desconoce formalmente el grado de autonomía de las herramientas, la política de reentrenamiento del proveedor LLM y los mecanismos de contención contra alucinaciones.

---

## 3. PASO 2: GENERACIÓN PERICIAL DEL ARCHIVO `AGENTS.md`

Para salvar la brecha entre el código de desarrollo y el escrutinio pericial que exige la Administración Pública, se activó la directiva metodológica del auditor (accesible desde el modal de Guía de Usuario mediante el botón *"Copiar Prompt para el Desarrollador"*).

### 3.1. Proceso de Análisis e Ingeniería Inversa
A partir de la inspección del código fuente, se sintetizaron las 6 dimensiones clave:

1. **Naturaleza Administrativa:** Se acreditó que la aplicación no barema a personas físicas ni resuelve solicitudes ciudadanas, sino que actúa como **auxilio técnico preparatorio** para empleados públicos tramitadores de fondos europeos.
2. **Soberanía y Custodia del Modelo:** Se verificó que `apiService.ts` implementa una política **BYOK** (las claves de API residen únicamente en el navegador cliente) y que el sistema soporta la conexión con nodos locales de **Ollama** (`http://localhost:11434`), permitiendo la ejecución de modelos de pesos abiertos (Gemma, ALIA) en servidores propios sin salida a internet.
3. **Directivas Literales y Reglas de Oro:** En `src/lib/systemPrompt.ts` se descubrió un marco defensivo excepcional:
   - **Regla 1:** No inferir ni inventar (obligación taxativa de emitir *"No consta"* si el dato no aparece escrito).
   - **Regla 2:** Verificabilidad total con citación documental obligatoria (`Ref: Pág. X / Sección Y`).
   - **Regla 3:** Casuística completa desglosada por líneas de ayuda.
   - **Regla 4:** Marcadores de confianza explícitos (`✅ CONFIRMADO`, `⚠️ INFERIDO`, `❌ NO CONSTA`).
4. **Grado de Autonomía (Agency): CERO (0%):** La aplicación no posee conectores de escritura en sedes electrónicas, ni registra entradas en el registro general (SIR/GEISER), ni firma actos administrativos.
5. **Ciclo de Vida del Dato:** 100% datos públicos (boletines oficiales). Cero datos sensibles del Art. 9 del RGPD.
6. **Trazabilidad:** Recomendación de incorporar registro criptográfico SHA-256 conforme a la Medida IA-08 de la Guía CCN-STIC 884D.

### 3.2. Artefacto Generado
Se generó el archivo estructurado [AGENTS.md](./AGENTS.md) (9.7 KB), quedando guardado de forma permanente en la carpeta de resultados para su incorporación inmediata a la raíz del repositorio de GitHub.

---

## 4. PASO 3: ENTREVISTA JURÍDICA Y ENRIQUECIMIENTO CONTEXTUAL

Con los datos técnicos asimilados, se completó la entrevista jurídica con las siguientes variables declaradas:

| Pregunta / Parámetro de Gobernanza | Opción Seleccionada | Justificación Jurídica y Técnica |
| :--- | :--- | :--- |
| **1. Nivel de Supervisión Humana** | `pre_execution` *(Human-in-the-Loop)* | El funcionario instructor valida y contrasta los datos de la ficha antes de tomar cualquier decisión. Cumple el Art. 14 RIA. |
| **2. Naturaleza Administrativa** | `technical_auxiliary` *(Auxilio técnico)* | No constituye actuación administrativa automatizada. Se desvincula formalmente del Art. 41 de la Ley 40/2015. |
| **3. Modelo de Alojamiento y Soberanía** | `local_on_premise` / `BYOK` | Inferencia recomendada en servidores corporativos propios (Ollama) o con contrato comercial que prohíbe reentrenamiento. |
| **4. Tratamiento de Datos del Art. 9 RGPD** | `false` *(No trata datos sensibles)* | La materia prima son diarios oficiales (BOE, DOG, BOP, DOUE); no concurren datos de salud, religión, etnia o sindicales. |
| **5. Registro Criptográfico de Auditoría** | `true` *(Retención 24 meses)* | Cumplimiento estricto del principio de rendición de cuentas (Accountability) y la Guía CCN-STIC 884D. |

---

## 5. PASO 4: DICTAMEN DEL MOTOR DETERMINISTA DE EVALUACIÓN

El motor de reglas determinista de `Auditor IA` procesó la combinación de la ingesta técnica y la entrevista jurídica, arrojando el siguiente dictamen pericial:

### 1. Control de Prácticas Prohibidas (Art. 5 RIA):
- **Manipulación subliminal (Art. 5.1.a):** ✅ CONFORME (No detectado).
- **Puntuación social de ciudadanos (Art. 5.1.c):** ✅ CONFORME (No detectado).
- **Reconocimiento de emociones en el entorno laboral (Art. 5.1.f):** ✅ CONFORME (No detectado).
- **Categorización biométrica de datos sensibles (Art. 5.1.g):** ✅ CONFORME (No detectado).

### 2. Clasificación bajo el AI Act y Reglamento Ómnibus Digital (UE 2026/1744):
- **Dictamen:** **RIESGO DE TRANSPARENCIA (Art. 50 RIA)**.
- **Fundamentación:** El software no entra en el Anexo III (Puntos 4 o 5) porque **no selecciona ni evalúa a personas físicas**. Interviene evaluando convocatorias normativas objetivas para asistir al personal de la entidad. Amparado por el **Reglamento Ómnibus Digital (UE 2026/1744)**, se exime de marcado CE y auditorías de sesgos desproporcionadas, requiriendo únicamente el cumplimiento del deber de transparencia activa.

### 3. Categorización en el Esquema Nacional de Seguridad (RD 311/2022):
- **Categoría Asignada:** **Nivel BÁSICA** (con salvaguardas de confidencialidad e integridad aplicadas a las memorias de proyectos).

---

## 6. PASO 5: COTEJO TELEMÁTICO EN TIEMPO REAL (BOE Y DOUE CELLAR)

La aplicación ejecutó la verificación telemática de los preceptos aplicados frente a las fuentes legislativas oficiales conectadas:
- **Diario Oficial de la Unión Europea (DOUE / Cellar REST API):** Consulta y verificación de los Artículos 5, 14 y 50 del Reglamento (UE) 2024/1689 (CELEX `32024R1689`) y Art. 35 del RGPD (CELEX `32016R0679`).
- **Boletín Oficial del Estado (BOE / Legalize-ES):** Verificación del Artículo 41 de la Ley 40/2015 (`BOE-A-2015-10566`) y el Real Decreto 311/2022 (`BOE-A-2022-7191`).

Se certificó formalmente en el expediente que todos los artículos se encuentran plenamente vigentes y consolidados sin reformas derogatorias sobrevenidas.

---

## 7. PASO 6: GENERACIÓN Y CUSTODIA DE ARTEFACTOS FORMALES

En la carpeta designada `Resultados prueba app analizador ayudas/` se han generado y validado con éxito todos los documentos acreditativos:

### 📄 1. Expediente Oficial de Gobernanza en Word (`.docx`)
- **Archivo:** `Expediente_Conformidad_IA_Analizador_Ayudas.docx` (64.8 KB).
- **Identidad Visual Corporativa:** Incorpora en la cabecera el monograma oficial de alta resolución de Arias Lombardero (`MONOGRAMA_JA_BASE64`), el texto institucional de la Diputación de Lugo y la línea separadora inferior en color `#DCE2DF`.
- **Estructura Documental:** Portada formal, metadatos del expediente, 7 secciones de fundamentación jurídica y técnica, la **Diligencia de Cotejo Normativo Telemático** y la tabla final para las rúbricas con firma electrónica del **Responsable Funcional**, el **CISO** y el **DPD**.

### 🔒 2. Evaluación de Impacto en Protección de Datos (`.docx`)
- **Archivo:** `EIPD_AEPD_Analizador_Ayudas.docx` (62.6 KB).
- **Metodología Oficial:** Conforme a la Guía de la AEPD y el análisis sistemático de los 9 criterios del Grupo de Trabajo del Art. 29 (WP248).
- **Branding Institucional:** Cabecera homologada con monograma Arias Lombardero y paleta esmeralda oficial AEPD (`#065F46`).
- **Conclusión del DPD:** Dictamen favorable que acredita un riesgo residual bajo y valida la compatibilidad con el RGPD.

### 📝 3. Expediente Completo en Formato Markdown (`.md`)
- **Archivo:** `Expediente_Conformidad_IA_Analizador_Ayudas.md` (7.8 KB).
- Versión para su publicación en portales de transparencia institucional o repositorios Git.

### 💻 4. Kit de Código para Producción (Code Kit)
- **`BannerTransparencia.tsx`:** Componente visual en React 19 listo para insertar en la cabecera de `src/App.tsx`, informando a los técnicos sobre la asistencia por IA y la naturaleza instrumental del informe (Art. 50 RIA).
- **`auditLogger.ts`:** Módulo criptográfico Node.js con funciones de hash SHA-256 para registrar de forma inmutable cada petición, respuesta y marca de tiempo (Guía CCN-STIC 884D, Medida IA-08).
- **`.env.example.hardened`:** Plantilla de configuración segura de variables de entorno para servidores corporativos, impidiendo la exposición de claves en cliente (Medida IA-01).

---

## 8. CONCLUSIÓN Y HOJA DE RUTA PARA EL DESPLIEGUE

La auditoría simulada demuestra con éxito que el **Analizador de ayudas y subvenciones** de `ariaslombardero`:
1. Está listo para su implantación en cualquier Diputación, Ayuntamiento o Mancomunidad.
2. Cuenta con una protección documental y pericial completa gracias a la generación del archivo `AGENTS.md`.
3. Ofrece plena seguridad jurídica a los funcionarios instructores al deslindarse taxativamente de la actuación administrativa automatizada y garantizar la supervisión humana preceptiva.
4. Genera de forma automatizada tanto el expediente de gobernanza como la EIPD preceptiva con el branding corporativo de Arias Lombardero.
