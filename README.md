# Auditor IA · Sector Público

Herramienta de apoyo para preparar el **diagnóstico preliminar** de un sistema de inteligencia artificial que una Administración Pública española quiere poner en servicio. Cubre el Reglamento (UE) 2024/1689 de IA (RIA), modificado por el Reglamento (UE) 2026/1744, además del RGPD, el ENS y la Ley 40/2015.

> **Aviso.** Los informes que genera son **borradores técnicos basados en lo que declara el promotor**. No son actos administrativos, no certifican el cumplimiento y no sustituyen la revisión de la asesoría jurídica, del Responsable de Seguridad ni del Delegado de Protección de Datos. Pruébela con **datos sintéticos**.

Desarrollada por [Arias Lombardero · Aplicaciones](https://ariaslombardero.es/).

## Qué hace

1. **Ingesta.** Recoge la descripción, el README, el AGENTS.md y el prompt del sistema de la aplicación (pegados o desde un repositorio público de GitHub). Las palabras clave solo sugieren qué revisar.
2. **Entrevista.** Cada pregunta admite «sí», «no» o «no lo sé». Cubre:
   - definición de sistema de IA (Art. 3.1);
   - las prácticas prohibidas del Art. 5, una a una;
   - ámbito del Anexo III, perfilado y excepción del Art. 6.3;
   - transparencia (Art. 50) y papel de la entidad;
   - supervisión humana y Art. 41 de la Ley 40/2015;
   - datos personales y criterios de EIPD (WP248 y lista de la AEPD);
   - alojamiento del modelo y dimensiones del ENS.
3. **Diagnóstico.** Clasificación orientativa con su **traza** (pregunta, respuesta, regla, fuente y límites). Además:
   - requisitos con su estado de acreditación: nada se da por acreditado sin una validación humana registrada;
   - cuadro de mando de 4 pilares, alertas y recomendaciones;
   - si faltan respuestas o hay contradicciones, el resultado es **«requiere revisión»**.
4. **Kit de código.** Avisos de transparencia (Art. 50) para interfaces y documentos.
5. **Informe técnico.** Word (`.docx`) y Markdown, más un manifiesto `.json`, todos con la misma información, la versión del motor y la huella de las entradas. También un borrador de EIPD.
6. **Laboratorio de pruebas.**
   - Ensayos adversarios (OWASP Top 10 for LLM 2025) juzgados por su efecto observable.
   - Escáner de claves expuestas, con alcance declarado.
   - Consultor normativo sin conexión.

Sin proveedor de IA, todo funciona con el **motor determinista**. Con un proveedor, el modelo redacta un comentario complementario que **no altera la clasificación** y ejecuta los ensayos adversarios.

## Probarla

- **Demostración pública (Vercel).** Abra la aplicación y, si quiere usar IA, configure en «Configurar proveedor IA» su propia clave de Gemini o de un servicio compatible con OpenAI.
  - La aplicación **no tiene servidor propio**: la clave va solo al proveedor elegido y se guarda en el navegador durante la sesión, salvo que marque «Recordar».
  - En el nivel gratuito de Gemini, Google puede usar las peticiones para mejorar sus productos: no introduzca datos personales ni información reservada.
- **En local o en la intranet, con modelos locales.** Es la vía recomendada para uso institucional.

```bash
git clone <URL del repositorio>
cd auditor-ia-app
npm install
npm run dev
```

  Después, en «Configurar proveedor IA → Modelo local», elija Ollama, llama.cpp o vLLM e indique su dirección. Ollama debe admitir el origen de la aplicación (variable `OLLAMA_ORIGINS`). El selector muestra los modelos que ofrece el servidor.

Para servir la versión compilada con las mismas cabeceras de seguridad que en Vercel:

```bash
npm run build
```

```bash
npm run preview
```

Si el servidor de modelos está en otra máquina de la intranet y usa HTTP, añada su dirección a `connect-src` en la política de seguridad del servidor web (ver [ADR 001](docs/adr/001-credenciales-inferencia.md)).

## Desarrollo

```bash
npm test
```

```bash
npm run ejemplos
```

- `npm test` ejecuta las pruebas: motor, casos de referencia, concordancia de documentos, seguridad, historial y ensayos adversarios.
- `npm run ejemplos` regenera los casos de referencia con el motor real.

Las pautas para agentes de IA y para quien contribuya están en [agents.md](agents.md).

## Documentación

| Documento | Contenido |
| :--- | :--- |
| [docs/guia-de-uso.md](docs/guia-de-uso.md) | **Guía de uso completa** (para personas sin formación técnica) |
| [docs/alcance-piloto.md](docs/alcance-piloto.md) | Alcance del uso habilitado |
| [docs/piloto.md](docs/piloto.md) | Condiciones del piloto interno |
| [docs/revision-humana.md](docs/revision-humana.md) | Lista de comprobación para asesoría jurídica, Responsable de Seguridad, DPD y responsable funcional |
| [docs/casos-de-referencia/](docs/casos-de-referencia/LEEME.md) | 11 casos con su resultado esperado y el obtenido |
| [docs/adr/001-credenciales-inferencia.md](docs/adr/001-credenciales-inferencia.md) | Proveedores de IA, credenciales y cabeceras de seguridad |
| [docs/custodia-historial.md](docs/custodia-historial.md) | Conservación del historial en el navegador |
| [docs/formato-documental.md](docs/formato-documental.md) | Formato de los informes y su incorporación al expediente |
| [docs/auditoria/matriz-hallazgos.md](docs/auditoria/matriz-hallazgos.md) | Hallazgos de las auditorías y su corrección |
| [docs/auditoria/registro-fuentes.md](docs/auditoria/registro-fuentes.md) | Fuentes normativas cotejadas (BOE, EUR-Lex, AEPD, OWASP) |

## Límites conocidos

- **Se basa en lo declarado:** no inspecciona el funcionamiento real de la aplicación auditada.
- **Ensayos adversarios parciales:** prueban el modelo configurado, no la cadena completa de la aplicación auditada (documentos, búsqueda, presentación ni herramientas reales).
- **Anexo III:** del punto 5 solo se evalúa la letra a).
- **Guía CCN-STIC 884D:** no se ha podido cotejar, por lo que no se citan sus medidas.
- **Historial:** es una copia de trabajo en el navegador, no un sistema de custodia.
- **Informes:** son borradores en OOXML *Transitional* y Markdown. La versión firmada (PDF/A, metadatos ENI, CSV) corresponde al gestor de expedientes de la entidad.

## Pila

React 19 · TypeScript · Vite 8 · Vitest · `docx` · `@google/genai` (se carga solo si se usa Gemini).

## Autoría y licencia

Diseñado y desarrollado por **[Arias Lombardero · Aplicaciones](https://ariaslombardero.es/)**. Distribuido bajo licencia MIT.
