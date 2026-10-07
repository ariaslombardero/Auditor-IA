# Resultados del analizador de ayudas

Estos ficheros los genera **el motor de la aplicación** con `npm run ejemplos` (`scripts/generarEjemplos.ts`), a partir del caso de referencia `analizador-ayudas` (`src/test/referenceCases.ts`):

| Fichero | Contenido |
| :--- | :--- |
| `Expediente_Analizador_Ayudas.docx` | Informe técnico preliminar (Word) |
| `Expediente_Analizador_Ayudas.md` | El mismo informe en Markdown |
| `Expediente_Analizador_Ayudas.manifest.json` | Manifiesto con entradas, traza, requisitos y huella |
| `EIPD_Borrador_Analizador_Ayudas.docx` | Borrador de evaluación de impacto, para completar por el responsable del tratamiento con el DPD |

**Entradas:**
- la documentación pública del analizador (`historico-no-motor/AGENTS.md`);
- una entrevista declarada para el caso de prueba: herramienta de apoyo al personal técnico, fuera del Anexo III, sin datos personales y con ejecución local declarada.

**Resultado:** riesgo de transparencia (Art. 50 RIA), con una alerta. Se declara ejecución local, pero la documentación cita la API de Gemini, así que debe comprobarse qué proveedor procesa realmente los datos.

**Límites:**
- No se usó ningún modelo de IA: el diagnóstico procede solo del motor determinista.
- Es un informe técnico preliminar basado en lo declarado. No es un acto administrativo ni acredita el cumplimiento.
- La fecha y la huella de generación cambian en cada ejecución.

La carpeta `historico-no-motor/` conserva los ficheros anteriores, escritos a mano por un script que **no** ejecutaba el motor. Se mantienen solo como registro de procedencia.

Los demás casos de referencia están en `docs/casos-de-referencia/`.
