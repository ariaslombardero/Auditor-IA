# 📅 Calculadora de plazos LCSP – Lugo

![alt text](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![alt text](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![alt text](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![alt text](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![alt text](https://img.shields.io/badge/Estado-activo-28a745?style=flat-square)
![alt text](https://img.shields.io/badge/Licencia-MIT-yellow?style=flat-square)

<img src="./thumbnail.png" alt="Calculadora LCSP Lugo — captura de pantalla principal" width="100%" style="border-radius:8px;" />

**Herramienta web para el cálculo automatizado de plazos administrativos establecidos en la Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público (LCSP), adaptada al calendario festivo de Lugo y la Comunidad Autónoma de Galicia.**

## 📋 Índice

1. [Descripción detallada](#descripción-detallada)
2. [Características ✨](#características-)
3. [Arquitectura 🏗️](#arquitectura-)
4. [Desarrollo asistido por IA (Vibe Coding) 🤖](#-desarrollo-asistido-por-ia-vibe-coding)
5. [Stack tecnológico 🛠️](#stack-tecnológico-)
6. [Instalación y puesta en marcha ⚡](#instalación-y-puesta-en-marcha-)
7. [Uso 📄](#-uso)
8. [Contribuciones 🤝](#-contribuciones)
9. [Licencia 📜](#-licencia)
10. [Autor 👨‍💻](#-autor)

> **Nota:** Este proyecto demuestra la viabilidad de crear plataformas digitales de alta complejidad técnica y visual utilizando exclusivamente metodologías de **Vibe Coding** (Inteligencia Artificial Generativa), acelerando radicalmente el ciclo de desarrollo desde la idea al despliegue.

## 📖 Descripción detallada

Esta aplicación está pensada para que los órganos de contratación que operen en la ciudad de Lugo puedan calcular de forma rápida y precisa las fechas de vencimiento de los diferentes plazos administrativos que marca la LCSP, teniendo en cuenta el modo de cómputo en días hábiles/naturales, el inicio ("Dies a Quo"), la prórroga automática y el calendario de festivos aplicable en la región. 

> 🏛️ Está previsto que esta aplicación forme parte del conjunto de herramientas tecnológicas de [**MencIA**](https://github.com/ariaslombardero/Landing-MencIA), la estrategia de Inteligencia Artificial de la Diputación de Lugo.

> [!NOTE]
> **Aviso de precisión:** Esta aplicación es un recurso diseñado con fines demostrativos y/o educativos que actualmente se encuentra en período de prueba. Su estructura y contenido han sido desarrollados mediante metodologías de **Vibe Coding** (IA Generativa), por lo que es posible que existan omisiones o errores en la aplicación y cálculo de algún plazo. Si detectas cualquier error o área de mejora, te agradecería que me lo comunicaras para proceder a su análisis y subsanación.

## 📌 Características 

- ✅ Cálculo preciso de plazos según la LCSP (Ley 9/2017).
- ✅ Computo en **días naturales** (por defecto) o **días hábiles**.
- ✅ Aplicación automática de la regla **Dies a Quo** (inicio al día siguiente).
- ✅ Prórroga automática al primer día hábil si el vencimiento cae en inhábil.
- ✅ Soporte completo de festivos: nacionales, autonómicos de Galicia y locales de Lugo (2025–2026).
- ✅ Indicador visual de urgencia del plazo (en curso, próximo, urgente, vencido).
- ✅ Desglose detallado del cómputo con lista de festivos del periodo.
- ✅ Interfaz bilingüe **Castellano / Gallego (Galego)**.
- ✅ **Modo oscuro** integrado.
- ✅ Totalmente **responsive** para escritorio y móvil.

## 🏗️ Arquitectura 

```text
calculadora-lcsp-lugo-react/
│
├── public/                        # Archivos estáticos
├── src/
│   ├── components/                # Componentes React reutilizables
│   ├── context/                   # Contextos de React (Idioma, Tema)
│   ├── data/                      # Datos (Plazos LCSP, festivos)
│   ├── hooks/                     # Lógica base de cómputo (useLCSPCalculator)
│   ├── i18n/                      # Traducciones
│   ├── App.tsx                    # Componente raíz
│   ├── main.tsx                   # Punto de entrada
│   └── index.css                  # Estilos y diseño
├── index.html                     # HTML Base
└── package.json                   # Dependencias y configuración
```

## 🤖 Desarrollo asistido por IA (Vibe Coding)

Este ecosistema ha sido desarrollado íntegramente mediante **AI-Driven Development**, orquestando modelos avanzados de lenguaje (LLMs) para la arquitectura, lógica y diseño. Las fases clave han incluido conceptualización arquitectónica, desarrollo de UI/UX premium mediante Tailwind y componentes modernos, así como un proceso iterativo de depuración de código guiado exclusivamente por IA.

## 🛠️ Stack tecnológico 

| Tecnología | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | 18.x | Framework de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tipado estático |
| [Vite](https://vitejs.dev/) | 6.x | Bundler y servidor de desarrollo |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Estilos y diseño responsive |

## ⚡ Instalación y puesta en marcha 

### Requisitos

- Node.js v18 o superior
- npm v9 o superior

### Pasos

1. Clonar el repositorio y acceder a la carpeta:
```bash
git clone https://github.com/ariaslombardero/Calculadora-LCSP-Lugo.git
cd Calculadora-LCSP-DPLugo
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar entorno de desarrollo:
```bash
npm run dev
```

## 📄 Uso

Este proyecto ha sido concebido para uso demostrativo, educativo y como prueba de concepto (PoC) del potencial transformador que tienen las tecnologías generativas en la creación rápida de software.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas ampliar el contenido, añadir funcionalidades, o sugerir mejoras arquitectónicas, puedes abrir un *Issue* o enviar un *Pull Request* al repositorio.

## 📜 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) incluido en el repositorio para más detalles.

## 👨‍💻 Autor

**Jose Antonio Arias Lombardero**
*Experto en Inteligencia Artificial aplicada al sector público, innovación, contratación y fondos europeos.*

Esta aplicación forma parte de un portfolio de soluciones tecnológicas conceptualizadas, desarrolladas y desplegadas en entornos cloud para su aplicación en el sector público. Mi objetivo es demostrar cómo el uso estratégico de modelos avanzados de IA (Vibe Coding) puede escalar radicalmente la digitalización, la operatividad y la alfabetización tecnológica de la Administración.

🔗 [Consulta mi portfolio completo de aplicaciones y trayectoria profesional](https://ariaslombardero.es/)

---

<div align="center">
Construido con ❤️ aprovechando el potencial de la Inteligencia Artificial Generativa
</div>