# 📋 Analizador de ayudas y subvenciones

<div align="center">

![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-Activo-success?style=for-the-badge)

**Herramienta institucional avanzada diseñada para automatizar el análisis de convocatorias de subvenciones, ayudas y fondos públicos utilizando Inteligencia Artificial.**

<br/>

<div align="center">
  <img src="thumbnail1.png" width="49%" alt="Vista previa de la interfaz del Analizador de Subvenciones" />
  <img src="thumbnail2.png" width="49%" alt="Vista previa del informe generado" />
</div>

<br/>

[🚀 Características](#-características) · [🏗️ Arquitectura](#️-arquitectura) · [🌍 Soporte multiidioma](#-soporte-multiidioma) · [⚡ Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha)

</div>

---

> **Nota:** Este proyecto demuestra la viabilidad de crear herramientas de productividad avanzadas utilizando metodologías de **Vibe Coding** (Inteligencia Artificial Generativa), acelerando radicalmente el ciclo de desarrollo desde la idea al despliegue.

---

## 🎯 ¿Qué es el Analizador de ayudas y subvenciones?

El **analizador de ayudas y subvenciones** es una aplicación web moderna que transforma convocatorias públicas extensas (PDF, DOCX, TXT) en fichas técnicas estructuradas, evaluando instantáneamente su viabilidad y encaje estratégico.

La aplicación está diseñada para agilizar el trabajo diario de análisis de fondos europeos y subvenciones, permitiendo generar resúmenes ejecutivos precisos, extraer los presupuestos, plazos e inversiones mínimas, y puntuar la relevancia de la convocatoria.

**Nota sobre el uso:** Esta aplicación está pensada como un apoyo para facilitar la labor del personal técnico y administrativo, proporcionando un análisis sólido sobre el cual trabajar. Es fundamental destacar que la herramienta no pretende sustituir el criterio técnico, la supervisión ni la capacidad de decisión del personal especializado, sino potenciar su productividad.

> 🏛️ Está previsto que esta aplicación forme parte del conjunto de herramientas tecnológicas de [**MencIA**](https://github.com/ariaslombardero/Landing-MencIA), la estrategia de Inteligencia Artificial de la Diputación de Lugo.

> [!NOTE]
> **Aviso de privacidad:** Todo el procesamiento de texto puede realizarse a través de la API de Google Gemini o mediante modelos locales. Asegúrese de configurar adecuadamente la herramienta según el nivel de confidencialidad de los documentos. No introduzca información confidencial no anonimizada si utiliza modelos en la nube.

---

## 📌  Características

- 📝 **Extracción Inteligente** — Procesa PDF, Word (.docx) y texto plano para extraer automáticamente presupuestos, plazos, beneficiarios y criterios de valoración.
- 🎯 **Sistema de Scoring** — Calcula un "Score de Encaje" (0-10) basado en la relevancia territorial, elegibilidad institucional y alineación estratégica.
- 🔍 **Trazabilidad y Modo Auditoría** — Añade marcadores de confianza (✅ Confirmado, ⚠️ Inferido, ❌ No consta) a cada dato extraído. Un interruptor (Toggle) permite alternar entre la verificación profunda (auditoría) y un formato "limpio" para generar documentación final.
- 🔐 **Privacidad "Bring Your Own Key" (BYOK) y Modelos Locales** — Configuración segura de la API Key de Gemini o uso de modelos alojados localmente (Ollama/vLLM) directamente desde la interfaz, sin necesidad de archivos de configuración externos.
- 🌍 **Traducción instantánea** — Cambio fluido entre Gallego y Castellano de la interfaz y los análisis en tiempo real mediante *streaming*, con sistema de caché inteligente.
- 📄 **Exportación Profesional** — Generación de informes en formato Word (DOCX) con saltos de página inteligentes, y formato de impresión optimizado en PDF. El documento se exporta automáticamente sanitizado y libre de indicadores internos, listo para su uso institucional.
- 🧩 **Integración JSON** — Genera automáticamente bloques JSON estructurados listos para alimentar bases de datos o dashboards. La UI proporciona la **opción de copiar o descargar directamente el JSON**, manteniendo la interfaz principal limpia y enfocada en la lectura.
- 🗂️ **Historial local** — Guardado automático de los análisis anteriores en el navegador para poder recuperarlos al instante en cualquier momento.
- 🎨 **Diseño premium UI/UX** — Interfaz institucional limpia, con la paleta de colores oficial de MencIA, elementos dinámicos y diseño totalmente responsivo (desktop y mobile).

---

## 🏗️ Arquitectura

```
analizador-convocatorias/
├── src/                        # Código fuente principal
│   ├── App.tsx                 # Componente principal y lógica de la aplicación
│   ├── main.tsx                # Punto de entrada de React
│   ├── index.css               # Estilos globales y configuración de Tailwind
│   ├── lib/                    # Utilidades y funciones auxiliares
│   │   ├── apiService.ts       # Gestor de comunicaciones con modelos de IA (streaming)
│   │   ├── docxExporter.ts     # Lógica de generación de documentos Word
│   │   └── systemPrompt.ts     # Instrucciones completas del sistema para el LLM
│   └── components/             # Componentes UI
│       └── ApiConfigModal.tsx  # Configuración de API y modelos locales
│
├── public/                     # Recursos estáticos
├── package.json                # Dependencias y scripts
├── vite.config.ts              # Configuración del bundler Vite
└── tsconfig.json               # Configuración de TypeScript
```

**Visión de futuro:** El objetivo estratégico es integrar esta interfaz con nuestro ecosistema local para que llame directamente a modelos de pesos abiertos (como Gemma 4 o la familia ALIA) que tenemos instalados en nuestro servidor, garantizando la máxima privacidad y soberanía sobre los datos procesados sin depender de servicios externos.

---

## 🌍 Soporte multiidioma

La aplicación está diseñada para trabajar de forma nativa en los dos idiomas oficiales de la comunidad autónoma de Galicia:

| Idioma | Estado | Uso |
|--------|--------|-----|
| 󠁧󠁢󠁥󠁮Gallego | ✅ Completo | Idioma principal de la interfaz por defecto. |
| Castellano | ✅ Completo | Traducción instantánea de la interfaz y del contenido generado. |

---

## 🤖 Desarrollo asistido por IA (Vibe Coding)

Este ecosistema ha sido desarrollado íntegramente mediante **AI-Driven Development**, orquestando modelos avanzados de lenguaje (LLMs) para la arquitectura, lógica y diseño. El flujo de trabajo ha incluido:

1.  **Arquitectura React + Vite:** Diseño de una estructura rápida y escalable en una aplicación de página única (SPA).
2.  **Ingeniería de Prompts (Prompt Engineering):** Creación de instrucciones complejas para que la IA actúe como un analista experto en fondos europeos y subvenciones, estructurando la salida en formato Markdown de alta legibilidad.
3.  **UI/UX Premium con Tailwind & Radix UI:** Creación de una interfaz fluida, accesible y alineada con la identidad visual de MencIA.
4.  **Gestión de estado avanzada:** Implementación de historial persistente en `localStorage` y soporte para *streaming* de respuestas de IA.

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| **React 19** | Librería de interfaz de usuario |
| **Vite** | Entorno de desarrollo y bundler ultrarrápido |
| **TypeScript** | Tipado estático para código robusto |
| **TailwindCSS 4** | Sistema de diseño utility-first |
| **Google Gemini API** | Motor de Inteligencia Artificial (`@google/genai`) |
| **Mammoth** | Extracción de texto desde documentos Word (.docx) |
| **pdfjs-dist** | Extracción de texto desde documentos PDF |
| **docx** | Generación de archivos Word estructurados |
| **Lucide React** | Iconografía moderna y consistente |
| **Radix UI** | Componentes accesibles sin estilo (Dialogs) |

---

## ⚡ Instalación y puesta en marcha

### Prerrequisitos
- **Node.js** `>= 18.x`
- **npm** `>= 9.x`
- **Clave de API de Google Gemini:** Opcional si se usa modelo local, pero recomendada para probar. Se obtiene gratis en [Google AI Studio — API Keys](https://aistudio.google.com/api-keys).

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd analizador-subvenciones
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en **[http://localhost:3000](http://localhost:3000)** (o el puerto que indique Vite). La primera vez que accedas, una ventana modal solicitará tu clave de API de Gemini o configuración local, guardándola de forma segura en el almacenamiento de tu navegador.

---

## 📖 Personalización del criterio de análisis

La aplicación está configurada por defecto para realizar el análisis de subvenciones con el enfoque de la **Diputación Provincial de Lugo**. Si deseas adaptar esta herramienta a las necesidades de otra institución, empresa o entidad, el elemento clave a modificar es la constante `SYSTEM_INSTRUCTION` situada en el archivo `src/lib/systemPrompt.ts`.

### Cómo afinar el análisis para tu entidad

Para conseguir que la IA pondere las convocatorias según tus intereses, puedes modificar el prompt o apoyarte en herramientas como **NotebookLM**:

1. Sube tu plan estratégico o manual de operaciones a NotebookLM.
2. Pídele a la IA que extraiga las directrices y prioridades de tu entidad (por ejemplo: digitalización, reto demográfico, transición verde).
3. Adapta el `systemPrompt.ts` para que el sistema de *scoring* beneficie específicamente esos ejes.

---

## 📄 Uso

Este proyecto ha sido concebido para uso demostrativo, educativo y como prueba de concepto (PoC) del potencial transformador que tienen las tecnologías generativas en la creación de software avanzado para entidades públicas.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas proponer mejoras en los prompts de análisis o añadir nuevas integraciones, abre un *Issue* o envía un *Pull Request*.

---

## 📜 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) incluido en el repositorio para más detalles.

---

## 👨‍💻 Autor

**Jose Antonio Arias Lombardero**
*Experto en Inteligencia Artificial aplicada al sector público, innovación, contratación y fondos europeos.*

Esta aplicación forma parte de un portfolio de soluciones tecnológicas conceptualizadas, desarrolladas y desplegadas en entornos cloud para su aplicación en el sector público. Mi objetivo es demostrar cómo el uso estratégico de modelos avanzados de IA (Vibe Coding) puede escalar radicalmente la digitalización, la operatividad y la alfabetización tecnológica de la Administración.

🔗 [Consulta mi portfolio completo de aplicaciones y trayectoria profesional](https://ariaslombardero.es/)