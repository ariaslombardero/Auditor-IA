# ⚖️ Auditor IA · Sector Público

<div align="center">

![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript)
![Vitest](https://img.shields.io/badge/Vitest-pruebas-6E9F18?style=for-the-badge&logo=vitest)
![Gemini AI](https://img.shields.io/badge/google%20gemini-opcional-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![Licencia](https://img.shields.io/badge/Licencia-Apache%202.0-D22128?style=for-the-badge&logo=apache)
![Estado](https://img.shields.io/badge/Estado-Piloto-orange?style=for-the-badge)

**Herramienta para preparar el diagnóstico preliminar de un sistema de inteligencia artificial antes de que una Administración Pública española lo ponga en servicio: Reglamento europeo de IA, RGPD, ENS y Ley 40/2015.**

<br/>

[🎯 Qué es](#-qué-es-auditor-ia) · [📌 Características](#-características) · [🏗️ Arquitectura](#️-arquitectura) · [🌍 Soporte multiidioma](#-soporte-multiidioma) · [⚡ Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha) · [📚 Documentación](#-documentación)

</div>

---

> **Nota:** Este proyecto demuestra la viabilidad de crear herramientas de apoyo a la gobernanza pública utilizando metodologías de **Vibe Coding** (Inteligencia Artificial Generativa), con un control de calidad propio: cada corrección tiene su prueba automática y cada precepto citado, su fuente oficial cotejada.

---

## 🎯 ¿Qué es Auditor IA?

**Auditor IA** ayuda a preparar el **diagnóstico preliminar** de una aplicación con inteligencia artificial que una Administración quiere usar. Responde a preguntas como estas:

- ¿Es un sistema de IA según el Reglamento europeo (Art. 3.1)? ¿Está prohibido, es de alto riesgo o tiene obligaciones de transparencia?
- ¿Trata datos personales? ¿Hace falta una evaluación de impacto (EIPD)? ¿Hay un procedimiento ante brechas de datos?
- ¿Qué categoría de seguridad le corresponde en el ENS?
- ¿Es una actuación administrativa automatizada (Art. 41 de la Ley 40/2015)?

El resultado es un informe en Word y Markdown, un manifiesto JSON y, si procede, un borrador de EIPD. Cada conclusión indica la pregunta, la respuesta, la regla y la fuente de la que procede.

**Nota sobre el uso:** los informes son **borradores técnicos basados en lo que declara el promotor**. No son actos administrativos, no certifican el cumplimiento y no sustituyen la revisión de la asesoría jurídica, del Responsable de Seguridad ni del Delegado de Protección de Datos, que son quienes los validan y firman.

> 🏛️ Está previsto que esta aplicación forme parte del conjunto de herramientas tecnológicas de [**MencIA**](https://github.com/ariaslombardero/Landing-MencIA), la estrategia de Inteligencia Artificial de la Diputación de Lugo. Hoy está en **piloto con datos sintéticos** ([condiciones del piloto](docs/piloto.md)).

> [!NOTE]
> **Aviso de privacidad:** la aplicación no tiene servidor propio. Funciona sin IA (motor determinista) o con el proveedor que usted elija: la API de Google Gemini con su propia clave, o modelos locales (Ollama, llama.cpp, vLLM). Si declara datos de salud o penales, la documentación no se envía a proveedores externos. Con una clave gratuita de Gemini, Google puede usar las peticiones para mejorar sus productos: no introduzca datos personales ni información reservada si usa modelos en la nube.

---

## 📌 Características

- 🧭 **Entrevista guiada** — Preguntas de «sí / no / no lo sé», cada una con un botón «¿Qué significa?» que la explica en lenguaje sencillo, con un ejemplo de «sí» y otro de «no». «No lo sé» nunca se trata como «no»: el resultado queda en «requiere revisión».
- ⚖️ **Clasificación trazable** — Reglamento (UE) 2024/1689 en su orden de examen: definición de IA (Art. 3.1), prácticas prohibidas (Art. 5), alto riesgo (Anexo III y excepción del Art. 6.3) y transparencia (Art. 50). Cada paso muestra pregunta, respuesta, regla, fuente y límites.
- 💡 **Sugerencias que nunca se aplican solas** — La IA puede proponer respuestas a partir de la documentación de la aplicación. La herramienta comprueba que la cita existe, y la persona decide. Las calificaciones decisivas (si es IA, si produce actos administrativos) se marcan siempre como «inferidas».
- 🔐 **Protección de datos** — Base jurídica, categorías especiales, datos de solvencia, brechas (Arts. 33 y 34 RGPD) y cribado de EIPD con los criterios de WP248 y de la lista de la AEPD. El borrador de EIPD incluye la evaluación de necesidad y proporcionalidad y deja en blanco el dictamen del DPD.
- 🛡️ **Seguridad (ENS)** — Categoría orientativa por dimensiones (confidencialidad, integridad, trazabilidad, autenticidad y disponibilidad) y escáner de claves expuestas.
- ✅ **Validación humana** — Ningún requisito se da por acreditado sin que una persona registre quién lo valida y con qué evidencia. La validación caduca si cambian las respuestas.
- 🧪 **Pruebas del modelo** — Ataques de prueba (OWASP Top 10 for LLM 2025) juzgados por su efecto observable, no por las palabras de la respuesta. Solo aparecen si el sistema usa IA.
- 🎚️ **Se adapta al caso** — Si el sistema no usa IA o no trata datos personales, la herramienta no muestra lo que no aplica.
- 📄 **Exportación** — Informe en Word (`.docx`) y Markdown, manifiesto `.json` y borrador de EIPD, con la misma información, la versión del motor y la huella SHA-256 de las entradas.
- 🗂️ **Historial local** — Copia de trabajo en el navegador, con revisiones que nunca se sobrescriben e importación validada.

---

## 🏗️ Arquitectura

```
auditor-ia/
├── src/
│   ├── App.tsx                     # Flujo de pasos y estado de la auditoría
│   ├── components/                 # Ingesta, entrevista, diagnóstico, informe y pruebas
│   ├── lib/
│   │   ├── engine/                 # Motor de clasificación y obligaciones (determinista)
│   │   ├── interviewCatalog.ts     # Catálogo único de preguntas
│   │   ├── interviewHelp.ts        # Ayuda en lenguaje sencillo con ejemplos
│   │   ├── interviewSuggestions.ts # Sugerencias de IA y comprobación de citas
│   │   ├── eipdCriteria.ts         # Criterios WP248 y lista de la AEPD
│   │   ├── eipdGenerator.ts        # Borrador de EIPD (.docx)
│   │   ├── officialDossier*.ts     # Informe en Word y Markdown
│   │   ├── adversarialSimulator.ts # Ataques de prueba al modelo
│   │   └── proveedores/            # Gemini, compatibles con OpenAI, Ollama, llama.cpp, vLLM
│   └── test/                       # Casos de referencia y documentación de apps reales
├── docs/                           # Guía de uso, piloto, cobertura AEPD, matrices y fuentes
├── scripts/generarEjemplos.ts      # Regenera los casos de referencia con el motor real
├── agents.md                       # Pautas para agentes de IA y para quien contribuya
└── vercel.json                     # Cabeceras de seguridad del despliegue
```

**Principio de diseño:** la IA propone, la persona decide y el motor clasifica. El motor de clasificación es determinista: el mismo conjunto de respuestas produce siempre el mismo resultado.

---

## 🌍 Soporte multiidioma

La aplicación trabaja en los dos idiomas oficiales de la comunidad autónoma de Galicia:

| Idioma | Estado | Uso |
|--------|--------|-----|
| Castellano | ✅ Completo | Idioma de la interfaz por defecto. |
| Gallego | ✅ Completo | Interfaz y documentos exportados. |

---

## 🤖 Desarrollo asistido por IA (Vibe Coding)

Este proyecto ha sido desarrollado mediante **AI-Driven Development**, orquestando modelos avanzados de lenguaje para la arquitectura, la lógica y el diseño, con controles de calidad propios:

1. **Revisiones independientes con IA:** la versión de partida la revisaron dos modelos de IA, Claude Opus 5.5 y GPT Sol 6.1. Sus hallazgos se contrastaron con fuentes oficiales, nunca con el criterio de un modelo.
2. **Matriz de hallazgos:** cada fallo detectado tiene su prueba automática y su corrección, incluidos los errores de las propias revisiones ([matriz](docs/auditoria/matriz-hallazgos.md)).
3. **Registro de fuentes:** cada precepto citado se ha cotejado en BOE, EUR-Lex, AEPD u OWASP ([registro](docs/auditoria/registro-fuentes.md)).
4. **Casos de referencia:** 15 casos con su resultado esperado, cinco de ellos aplicaciones reales del autor, se ejecutan como pruebas en cada cambio.

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| **React 19** | Librería de interfaz de usuario |
| **Vite 8** | Entorno de desarrollo y bundler |
| **TypeScript** | Tipado estático |
| **Vitest** | Pruebas automáticas y casos de referencia |
| **Google Gemini API** | Proveedor de IA opcional (`@google/genai`, se carga solo si se usa) |
| **Ollama, llama.cpp, vLLM** | Modelos locales en servidores propios |
| **docx** | Generación de informes y borradores de EIPD en Word |
| **Lucide React** | Iconografía |
| **Radix UI** | Componentes accesibles (diálogos) |

---

## ⚡ Instalación y puesta en marcha

### Prerrequisitos
- **Node.js** `20.19` o superior (o `22.12` o superior)
- **npm** `>= 10.x`
- **Clave de API de Google Gemini:** opcional. La herramienta funciona sin IA; con IA puede usar un modelo local o una clave gratuita de [Google AI Studio — API Keys](https://aistudio.google.com/api-keys).

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/ariaslombardero/Auditor-IA.git
   cd Auditor-IA
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en **[http://localhost:5174](http://localhost:5174)**. Sin configurar nada funciona en **modo determinista (sin IA)**. Para usar IA, abre «Configurar Proveedor IA» y elige Gemini con tu clave, o un modelo local (Ollama, llama.cpp o vLLM) indicando su dirección. La clave se guarda en el navegador solo durante la sesión, salvo que marques «Recordar».

### Otros comandos

| Comando | Qué hace |
|---|---|
| `npm test` | Ejecuta las pruebas: motor, casos de referencia, concordancia de documentos, seguridad, historial y ensayos |
| `npm run build` | Comprueba los tipos y compila |
| `npm run preview` | Sirve la versión compilada con las mismas cabeceras de seguridad que en Vercel |
| `npm run ejemplos` | Regenera los casos de referencia con el motor real |

Si el servidor de modelos está en otra máquina de la intranet y usa HTTP, añade su dirección a `connect-src` en la política de seguridad del servidor web ([ADR 001](docs/adr/001-credenciales-inferencia.md)). Ollama debe admitir el origen de la aplicación (variable `OLLAMA_ORIGINS`).

---

## 📖 Adaptación a tu entidad

La herramienta está pensada para cualquier Administración española. Para adaptarla:

1. **Datos de la entidad:** en el paso «Informe técnico» se indican la entidad, el servicio y los responsables que firmarán.
2. **Preguntas y ayuda:** el catálogo de preguntas está en `src/lib/interviewCatalog.ts` y su ayuda, en `src/lib/interviewHelp.ts`.
3. **Normas:** antes de citar un precepto nuevo, cotéjalo en la fuente oficial y anótalo en el [registro de fuentes](docs/auditoria/registro-fuentes.md). Las pautas completas están en [agents.md](agents.md).

---

## 📚 Documentación

| Documento | Contenido |
| :--- | :--- |
| [docs/guia-de-uso.md](docs/guia-de-uso.md) | **Guía de uso completa**, para personas sin formación técnica |
| [docs/alcance-piloto.md](docs/alcance-piloto.md) | Alcance del uso habilitado |
| [docs/piloto.md](docs/piloto.md) | Condiciones del piloto interno |
| [docs/revision-humana.md](docs/revision-humana.md) | Lista de comprobación para asesoría jurídica, Responsable de Seguridad, DPD y responsable funcional |
| [docs/casos-de-referencia/](docs/casos-de-referencia/LEEME.md) | 15 casos con su resultado esperado y el obtenido; cinco son aplicaciones reales del autor |
| [docs/cobertura-aepd.md](docs/cobertura-aepd.md) | Cobertura frente a los *Requisitos para auditorías de tratamientos que incluyan IA* de la AEPD: lo que la herramienta trata y lo que no |
| [docs/custodia-historial.md](docs/custodia-historial.md) | Conservación del historial en el navegador y procedimiento ante brechas e incidentes |
| [docs/formato-documental.md](docs/formato-documental.md) | Formato de los informes y su incorporación al expediente |
| [docs/adr/001-credenciales-inferencia.md](docs/adr/001-credenciales-inferencia.md) | Proveedores de IA, credenciales y cabeceras de seguridad |
| [docs/auditoria/matriz-hallazgos.md](docs/auditoria/matriz-hallazgos.md) | Hallazgos de las revisiones y su corrección |
| [docs/auditoria/registro-fuentes.md](docs/auditoria/registro-fuentes.md) | Fuentes normativas cotejadas (BOE, EUR-Lex, AEPD, OWASP) |
| [CHANGELOG.md](CHANGELOG.md) | Cambios por versión |

### ⚠️ Límites conocidos

- **Se basa en lo declarado:** no inspecciona el funcionamiento real de la aplicación auditada.
- **Pruebas del modelo parciales:** prueban el modelo configurado, no la cadena completa de la aplicación auditada.
- **Anexo III:** del punto 5 solo se evalúa la letra a).
- **Guía CCN-STIC 884D:** no se ha podido cotejar, por lo que no se citan sus medidas.
- **Historial:** es una copia de trabajo en el navegador, no un sistema de custodia.
- **Informes:** son borradores en OOXML *Transitional* y Markdown. La versión firmada (PDF/A, metadatos ENI, CSV) corresponde al gestor de expedientes de la entidad.

---

## 📄 Uso

Este proyecto se encuentra en **piloto con datos sintéticos** y se distribuye para que cualquier persona o entidad pueda probarlo, estudiarlo y adaptarlo. Los informes que genera son borradores que deben revisar y firmar los responsables competentes.

### Cómo citar

Arias Lombardero, J. A. (2026). *Auditor IA · Sector Público* (versión 2.2.0) [software]. https://github.com/ariaslombardero/Auditor-IA/releases/tag/v2.2.0

Cite siempre la versión etiquetada: las cifras de pruebas, hallazgos y casos de la documentación corresponden a esa versión.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Abre un *Issue* o envía un *Pull Request*. Cada cambio debe incluir la prueba que detecta el fallo y su registro en la [matriz de hallazgos](docs/auditoria/matriz-hallazgos.md). Los preceptos nuevos deben estar cotejados en su fuente oficial.

---

## 📜 Licencia

Este proyecto está bajo la Licencia **Apache 2.0**. Consulta el archivo [LICENSE](./LICENSE) y el aviso [NOTICE](./NOTICE) incluidos en el repositorio.

---

## 👨‍💻 Autor

**Jose Antonio Arias Lombardero**
*Experto en Inteligencia Artificial aplicada al sector público, innovación, contratación y fondos europeos.*

Esta aplicación forma parte de un portfolio de soluciones tecnológicas conceptualizadas, desarrolladas y desplegadas para su aplicación en el sector público. Mi objetivo es demostrar cómo el uso estratégico de modelos avanzados de IA (Vibe Coding) puede escalar radicalmente la digitalización, la operatividad y la alfabetización tecnológica de la Administración.

🔗 [Consulta mi portfolio completo de aplicaciones y trayectoria profesional](https://ariaslombardero.es/)
