# 🛡️ Auditor IA · Sector Público — Plataforma de Gobernanza y Verificación AI Act

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![DOCX](https://img.shields.io/badge/DOCX-Export-2B579A?style=for-the-badge&logo=microsoftword)
![AI Act](https://img.shields.io/badge/AI%20Act-UE%202024%2F1689-0A58CA?style=for-the-badge)
![ENS](https://img.shields.io/badge/ENS-RD%20311%2F2022-2E7D32?style=for-the-badge)
![Estado](https://img.shields.io/badge/Estado-Producci%C3%B3n%20%2F%20Activo-success?style=for-the-badge)

**Plataforma integral de gobernanza algorítmica, auditoría previa, blindaje técnico y dictamen oficial de conformidad para Administraciones Públicas.**

<br/>

🌐 [**Arias Lombardero · Aplicaciones**](https://ariaslombardero.es/) · [🚀 Flujo de Auditoría](#-flujo-de-auditoría-en-6-pasos) · [🛡️ Laboratorio de Blindaje](#️-laboratorio-de-blindaje-pre-producción) · [⚖️ Marco Normativo](#️-marco-normativo-aplicable) · [⚡ Instalación y Despliegue](#-instalación-y-puesta-en-marcha)

</div>

---

> **Nota institucional:** Esta aplicación forma parte de la suite tecnológica de **[Arias Lombardero · Aplicaciones](https://ariaslombardero.es/)**, diseñada para dotar al sector público de herramientas de verificación técnica, estricta soberanía de datos y plena seguridad jurídica ante el despliegue de sistemas de inteligencia artificial.

---

## 🎯 ¿Qué es Auditor IA?

**Auditor IA** es una estación de trabajo pericial orientada a letrados, secretarios, delegados de protección de datos (DPD), responsables de seguridad (CISO) y directores de IT en administraciones públicas españolas (estatales, autonómicas y locales).

Permite auditar cualquier aplicación, chatbot, asistente administrativo o automatización basada en IA antes de su puesta en producción, emitiendo:
1. **El Dictamen Oficial de Conformidad y Expediente Administrativo** en formato Word (`.docx`) y Markdown, con fundamentación jurídica exhaustiva y diligencias de firma formal.
2. **Kits de Código de Cumplimiento Inmediato:** Componentes visuales de aviso (Art. 50 RIA) en React y Vanilla HTML/CSS, barreras de validación humana (*Human-in-the-Loop*) y registradores criptográficos de auditoría (*Audit Logger* SHA-256).
3. **El Laboratorio de Blindaje Pre-Producción:** Un banco de pruebas dinámico con Red Teaming en vivo, generador oficial de Evaluación de Impacto (EIPD de la AEPD), escáner Prompt-Guard, RAG normativo offline y sellado para AutoFirma (@firma).

---

## 🚀 Flujo de Auditoría en 6 Pasos

```
[ 1. Ingesta Técnica ] ➔ [ 2. Entrevista Jurídica ] ➔ [ 3. Diagnóstico y Dictamen ] 
           │
           ▼
[ 4. Kit de Código ]   ➔ [ 5. Expediente Word (.docx) ] ➔ [ 6. Laboratorio de Blindaje (Extras) ]
```

1. **Paso 1: Ingesta Técnica**  
   Análisis automático del nombre, propósito, arquitectura, `README.md` y destinatarios (ciudadanos, empleados públicos o uso interno).
2. **Paso 2: Entrevista Jurídica de Enriquecimiento**  
   Cuestionario estructurado de 5 dimensiones críticas:
   - Grado de supervisión humana (Art. 14 RIA).
   - Naturaleza administrativa del acto (auxilio técnico vs. actuación automatizada pura Art. 41 Ley 40/2015).
   - Soberanía del dato y categorías especiales (Art. 9 RGPD).
   - Trazabilidad y políticas de log CCN-STIC 884D.
   - Determinismo algorítmico y temperatura de inferencia.
3. **Paso 3: Diagnóstico y Semáforo de Riesgo**  
   Determinación objetiva de la categoría del AI Act (*Inadmisible*, *Alto Riesgo - Anexo III*, *Riesgo de Transparencia* o *Riesgo Mínimo*), nivel exigido en el Esquema Nacional de Seguridad (BÁSICO, MEDIO o ALTO) y armonización con el Ómnibus Digital Europeo (UE 2026/1744).
4. **Paso 4: Kits de Código de Cumplimiento**  
   Generación de código listo para copiar e integrar en la aplicación auditada:
   - `AiTransparencyBanner.tsx` (React + Tailwind / Inline CSS).
   - `ai-transparency-banner.html` (Vanilla HTML/CSS para sedes electrónicas clásicas).
   - `audit-logger.ts` (Trazabilidad inmutable con sellado de tiempo y hash SHA-256).
   - `human-in-the-loop-gate.ts` (Barrera de contención para evitar actos firmes sin refrendo humano).
5. **Paso 5: Expediente Técnico Oficial (.DOCX)**  
   Exportación de un dossier formal maquetado con portada institucional, resumen ejecutivo, tabla de obligaciones normativas, análisis de necesidad, matriz de riesgos y cajas oficiales de firma para:
   - Responsable Funcional del Servicio.
   - Responsable de Seguridad ENS (CISO).
   - Delegado de Protección de Datos (DPD / DPO).
6. **Paso 6: Laboratorio de Blindaje Pre-Producción (Extras Avanzados)**  
   Herramientas activas de ciberseguridad y gobernanza en tiempo real.

---

## 🛡️ Laboratorio de Blindaje Pre-Producción

El Paso 6 integra cinco módulos avanzados:

### 1. Simulador de Red Teaming y Ensayos Adversarios en Vivo
- **Normas de referencia:** OWASP Top 10 for LLMs (2025/2026), AI Act Art. 14 y CCN-STIC 884D.
- **Batería de 12 Ensayos:** Inyecciones indirectas en expedientes, escape de delimitadores de rol, intento de extracción de datos personales simulados (DNI/cuentas), coacción para dictar sanciones firmes, alucinación con leyes derogadas (RD 3/2010), sesgos discriminatorios por origen o género y evasión mediante jailbreak DAN.
- **Métricas:** Cálculo del Índice de Robustez (%) en tiempo real, desglose heurístico por ensayo y exportación del Informe Técnico de Penetración.

### 2. Generador Oficial de EIPD (Metodología AEPD en Word .docx)
- **Normas de referencia:** Artículo 35 del RGPD, Ley Orgánica 3/2018 (LOPDGDD) y Guía Oficial de Gestión del Riesgo de la AEPD.
- **Matriz WP248:** Evalúa automáticamente los 9 criterios del Comité Europeo de Protección de Datos (decisiones automatizadas, colectivos vulnerables, uso de IA, datos sensibles y transferencias internacionales).
- **Descarga:** Documento Word formal de 15 a 20 páginas con el ciclo de vida del dato, riesgos para derechos y libertades, catálogo de medidas de seguridad y dictamen visado por el DPD.

### 3. Inspector y Sanitizador "Prompt-Guard"
- **Detección interactiva:** Analiza cualquier System Prompt o consulta de usuario identificando caracteres invisibles Unicode (`\u200B`), delimitadores crudos (`[INST]`, `<<SYS>>`), patrones de sobrescritura de rol y cargas en Base64.
- **Plantilla Hardened Prompt:** Genera un System Prompt blindado para el sector público con delimitación estricta de variables (`<datos_del_administrado>`), cláusula de auxilio técnico no vinculante y prohibición expresa de acatar órdenes de bypass.

### 4. Consultor RAG Normativo Offline
- **Base jurídica en memoria del navegador:** Funciona al 100% sin conexión externa, garantizando confidencialidad absoluta (Zero Data Leakage).
- **Preceptos indexados:**
  - AI Act (Reglamento UE 2024/1689): Art. 5, Art. 6, Anexo III, Art. 14, Art. 50 y Art. 26.
  - Esquema Nacional de Seguridad (RD 311/2022) y Guía CCN-STIC 884D: Trazabilidad, logs de 24 meses y soberanía On-Premise.
  - Ley 39/2015 y Ley 40/2015: Art. 41 y 42 (actuación administrativa automatizada y firma por CSV).
  - RGPD: Art. 9, Art. 22 y Art. 35.
  - Paquete Ómnibus Digital Europeo (Reglamento UE 2026/1744).
- **Contenido devuelto:** Texto literal consolidado de BOE/DOUE, aplicación práctica comentada e impacto en la administración pública.

### 5. Sellado Criptográfico y Preparación para AutoFirma (@firma)
- **Hash SHA-256 nativo:** Calculado mediante Web Crypto API sobre el expediente oficial generado.
- **Código Seguro de Verificación (CSV):** Generación de identificador formal conforme al Art. 42 de la Ley 40/2015.
- **Hoja de Diligencia Oficial:** Documento acreditativo de integridad técnica con guía paso a paso para firmar mediante el cliente de escritorio **AutoFirma** con DNIe o Certificado de Empleado Público (FNMT-RCM) en formatos `CAdES-BES` y `PAdES-BES`.

---

## 🏗️ Arquitectura del Proyecto

```
auditor-ia-app/
├── index.html                  # Punto de entrada con tipografía Inter y monograma JA
├── package.json                # Dependencias (React 19, TypeScript 5, Vite 8, docx, file-saver)
├── vite.config.ts              # Configuración de empaquetado Vite
│
├── public/                     # Recursos estáticos institucionales
│   ├── favicon.svg             # Monograma corporativo oficial JA
│   └── brand/                  # Kit de logotipos oficiales de Arias Lombardero
│       ├── logo-arias-lombardero-aplicaciones-para-fondo-claro.svg
│       └── ...
│
└── src/                        # Código fuente
    ├── main.tsx                # Montaje de la aplicación React
    ├── App.tsx                 # Controlador principal y navegación del Stepper en 6 pasos
    ├── index.css               # Tokens de diseño Arias Lombardero (Azul #2457A6, Tinta #13243A, Papel #F7F8F6)
    ├── types/index.ts          # Definiciones de tipos TypeScript
    │
    ├── components/             # Vistas y componentes modulares
    │   ├── Navbar.tsx                      # Cabecera institucional con logo y selector bilingüe
    │   ├── IngestionView.tsx               # Paso 1: Ingesta técnica
    │   ├── LegalInterviewView.tsx          # Paso 2: Entrevista jurídica
    │   ├── DiagnosticDashboard.tsx         # Paso 3: Semáforo y clasificación de riesgo
    │   ├── CodeKitView.tsx                 # Paso 4: Kits de código de transparencia y logs
    │   ├── OfficialDossierView.tsx         # Paso 5: Expediente Word y diligencias de firma
    │   ├── PreProductionHardeningView.tsx  # Paso 6: Laboratorio de blindaje pre-producción
    │   └── ApiConfigModal.tsx              # Gestor de inferencia híbrida (Ollama local, Gemini, Groq)
    │
    ├── context/
    │   └── ApiConfigContext.tsx            # Contexto seguro de configuración API en localStorage
    │
    └── lib/                    # Motores lógicos y generadores periciales
        ├── auditEngine.ts                  # Motor determinista de inferencia jurídica
        ├── codeKitGenerator.ts             # Generador de componentes React, HTML y middleware
        ├── officialDossierDocx.ts          # Generador de Word (.docx) formal con firmas
        ├── officialDossierMd.ts            # Exportador de expediente en Markdown
        ├── adversarialSimulator.ts         # Batería de 12 ensayos de Red Teaming
        ├── eipdGenerator.ts                # Generador oficial de EIPD según la AEPD (.docx)
        ├── securityGuard.ts                # Heurísticas de Prompt-Guard y sanitización
        ├── localRagEngine.ts               # Base de conocimiento jurídica offline en memoria
        ├── signatureService.ts             # Cálculo de hash SHA-256, CSV y diligencia técnica
        ├── apiService.ts                   # Conector unificado multi-proveedor
        └── i18n.ts                         # Soporte bilingüe completo (Castellano y Galego)
```

---

## ⚡ Instalación y Puesta en Marcha

### Requisitos previos
- Node.js 18+ (recomendado Node.js 20+)
- npm 9+ o pnpm

### Pasos
```bash
# 1. Clonar el repositorio o acceder al directorio
cd auditor-ia-app

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

El servidor estará accesible en: `http://localhost:5174/`

---

## 🔐 Privacidad y Seguridad por Diseño (BYOK & Soberanía)

- **Sin servidores intermedios:** La aplicación se ejecuta al 100% en el navegador del usuario (*Client-Side*).
- **Almacenamiento de claves:** Las claves de API se custodian exclusivamente en el `localStorage` del navegador y nunca se transmiten a bases de datos de terceros.
- **Soporte On-Premise:** Compatible con servidores locales sin internet mediante **Ollama** (`http://localhost:11434`), garantizando la soberanía de los datos bajo el Esquema Nacional de Seguridad.

---

## 🏛️ Autoría y Licencia

Diseñado y desarrollado por **[Arias Lombardero · Aplicaciones](https://ariaslombardero.es/)**.  
Distribuido bajo licencia MIT con mención expresa para uso en el Sector Público y entidades colaboradoras.
