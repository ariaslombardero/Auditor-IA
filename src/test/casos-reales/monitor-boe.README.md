# Monitor BOE — Edictos concursales

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-1.x-FF4B4B?style=flat-square&logo=streamlit&logoColor=white)
![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup4-scraping-4B8BBE?style=flat-square)
![Pandas](https://img.shields.io/badge/Pandas-data-150458?style=flat-square&logo=pandas&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-activo-28a745?style=flat-square)
![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow?style=flat-square)

---

<img src="./thumbnail.png" alt="Monitor BOE — captura de pantalla principal" width="100%" style="border-radius:8px;" />

---

**Monitor automatizado de los edictos de procedimientos concursales publicados en el Tablón Edictal Judicial Único del BOE. Extrae, estructura y exporta la información relevante con filtrado por ámbito geográfico, selección de fechas e historial de ejecuciones.**

---

## 🔗 Prueba la aplicación en tu navegador

- 🚀 [Demo en vivo — Streamlit Community Cloud](https://monitorboe.streamlit.app/)

---

> **Nota:** Este proyecto demuestra la viabilidad de crear plataformas digitales de alta complejidad técnica y visual utilizando exclusivamente metodologías de **Vibe Coding** (Inteligencia Artificial Generativa), acelerando radicalmente el ciclo de desarrollo desde la idea al despliegue.

---

## 📖 Descripción detallada

El **Monitor BOE** es una aplicación web desarrollada con Streamlit que automatiza la consulta diaria del [Tablón Edictal Judicial Único](https://www.boe.es/edictos_judiciales/) del Boletín Oficial del Estado. Su objetivo es facilitar a profesionales jurídicos, administraciones públicas y operadores económicos la detección temprana de procedimientos concursales que les puedan afectar.

La aplicación accede al BOE, navega por el suplemento judicial correspondiente a la fecha indicada, identifica todos los edictos de procedimientos concursales, extrae los datos estructurados de cada uno (deudor, NIF/CIF, número de concurso, fecha del auto) y genera informes listos para descargar en los formatos más habituales.

El filtrado por Galicia está especialmente orientado al uso interno en la **Diputación Provincial de Lugo**, aunque la opción de procesar todos los edictos de España hace que la herramienta sea igualmente válida para cualquier organización a nivel nacional.

> [!NOTE]
> **Aviso de precisión:** Esta aplicación es un recurso diseñado con fines demostrativos y/o educativos. Su estructura y contenido han sido desarrollados mediante metodologías de **Vibe Coding** (IA Generativa), por lo que es posible que existan omisiones o errores en la ejecución. Si detectas cualquier error o área de mejora, te agradecería que me lo comunicaras para proceder a su análisis y subsanación.

---

## 📌  Características principales

- 🔍 **Scraping automático del BOE** — accede al Tablón Edictal Judicial Único y extrae todos los edictos de procedimientos concursales de la fecha indicada.
- 📅 **Selección flexible de fechas** — búsqueda por fecha única o por rango de fechas con selector de calendario.
- 🗺️ **Filtrado geográfico** — opción de procesar solo edictos de Galicia o todos los edictos de España.
- 📊 **Tabla de resultados interactiva** — visualización clara con deudor, CIF/DNI/NIE, número de concurso, fecha del auto y enlace directo al edicto original.
- 📈 **Métricas de resumen** — tarjetas con número de edictos encontrados, total de candidatos en la jornada y tiempo de proceso.
- 📥 **Exportación múltiple** — descarga de resultados en Excel (.xlsx), JSON y TXT con un solo clic.
- 📚 **Historial de ejecuciones** — almacena las últimas 10 búsquedas para recuperar resultados anteriores sin necesidad de volver a ejecutar el scraping.
- 📄 **Texto completo de los edictos** — visualización del contenido íntegro de cada edicto directamente en la aplicación, con formato fiel al original del BOE.
- 🌗 **Diseño adaptativo claro/oscuro** — interfaz que responde automáticamente al tema seleccionado en Streamlit.

---

## 🏗️ Arquitectura

```
monitor-boe/
├── app_boe_monitor.py       # Aplicación principal (scraper + interfaz Streamlit)
├── requirements.txt         # Dependencias Python para despliegue
├── README.md                # Este archivo
├── LICENSE                  # Licencia MIT
├── thumbnail.png            # Imagen de portada del proyecto
└── output/                  # Directorio generado en ejecución (informes)
    ├── boe_concursal_report_YYYYMMDD_HHMMSS.xlsx
    ├── boe_concursal_data_YYYYMMDD_HHMMSS.json
    └── boe_concursal_report_YYYYMMDD_HHMMSS.txt
```

> **Nota:** El directorio `output/` se crea automáticamente en el primer uso y no se incluye en el repositorio. Añádelo a tu `.gitignore`.

---

## 🤖 Desarrollo asistido por IA (Vibe Coding)

Este ecosistema ha sido desarrollado íntegramente mediante **AI-Driven Development**, orquestando modelos avanzados de lenguaje (LLMs) para la arquitectura, lógica y diseño. Las fases clave han incluido conceptualización arquitectónica, desarrollo de UI/UX premium mediante Tailwind y componentes modernos, así como un proceso iterativo de depuración de código guiado exclusivamente por IA.

- 🕷️ La lógica de scraping (detección de edictos, extracción de secciones, limpieza de texto) fue diseñada y depurada de forma iterativa con Claude (Anthropic).
- 🎨 El sistema de diseño adaptativo claro/oscuro con variables CSS y tarjetas de métricas fue conceptualizado y refinado mediante prompting avanzado.
- 🔄 Todo el ciclo de refactorización, corrección de bugs y mejoras UX se realizó en conversación continua con el modelo, sin intervención manual en el código.

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| [Python](https://www.python.org/) | 3.10+ | Lenguaje base |
| [Streamlit](https://streamlit.io/) | 1.x | Framework de interfaz web |
| [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/) | 4.x | Scraping y parsing HTML |
| [lxml](https://lxml.de/) | latest | Parser HTML/XML de alto rendimiento |
| [Requests](https://requests.readthedocs.io/) | latest | Cliente HTTP |
| [Pandas](https://pandas.pydata.org/) | latest | Manipulación y exportación de datos |
| [openpyxl](https://openpyxl.readthedocs.io/) | latest | Generación de archivos Excel (.xlsx) |

---

## ⚡ Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/ariaslombardero/monitor-boe.git
cd monitor-boe
```

### 2. Crear y activar un entorno virtual (recomendado)

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Ejecutar la aplicación

```bash
streamlit run app_boe_monitor.py
```

La aplicación se abrirá automáticamente en `http://localhost:8501`.

---

## 📄 Uso

Este proyecto ha sido concebido para uso demostrativo, educativo y como prueba de concepto (PoC) del potencial transformador que tienen las tecnologías generativas en la creación rápida de software.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas ampliar el contenido, añadir funcionalidades, o sugerir mejoras arquitectónicas, puedes abrir un *Issue* o enviar un *Pull Request* al repositorio.

---

## 📜 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) incluido en el repositorio para más detalles.

---

## 👨‍💻 Autor

**Jose Antonio Arias Lombardero**
*Experto en Inteligencia Artificial aplicada al sector público, innovación, contratación y fondos europeos.*

Esta aplicación forma parte de un portfolio de soluciones tecnológicas conceptualizadas, desarrolladas y desplegadas en entornos cloud para su aplicación en el sector público. Mi objetivo es demostrar cómo el uso estratégico de modelos avanzados de IA (Vibe Coding) puede escalar radicalmente la digitalización, la operatividad y la alfabetización tecnológica de la Administración.

🔗 [Consulta mi portfolio completo de aplicaciones y trayectoria profesional](https://ariaslombardero.es/)