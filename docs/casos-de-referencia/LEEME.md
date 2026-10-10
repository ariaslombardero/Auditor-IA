# Casos de referencia del motor

> Generado por `npm run ejemplos` (`scripts/generarEjemplos.ts`) el 2026-10-10T12:01:44.261Z, con el motor v2.2.0.
> Corte normativo: Registro de fuentes de 05/10/2026: RIA (Reglamento (UE) 2024/1689) y Reglamento (UE) 2026/1744; Ley 40/2015; Ley 15/2022; RD 729/2023; ENS (RD 311/2022).
> Los diagnósticos proceden solo del motor determinista, sin ningún modelo de IA. Las entradas son sintéticas,
> salvo en los casos de aplicaciones reales, que usan la documentación pública de sus repositorios.
> Las mismas comprobaciones se ejecutan como pruebas en `src/lib/__tests__/referenceCases.test.ts`.

| Caso | Descripción | Resultado esperado | Resultado del motor | Coincide | Fundamento | Huella de las entradas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `no-ia` | Gestor de citas con reglas fijas | not_ai_system | EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado | Sí | No infiere sus resultados: aplica reglas predefinidas. No es un sistema de IA (Art. 3.1 RIA). | `469deaebabf9…` |
| `prohibido` | Puntuación social de la ciudadanía | prohibited | RIESGO INADMISIBLE (Práctica Prohibida - Art. 5 RIA) | Sí | Se declara una práctica del Art. 5.1.c RIA (puntuación social): prohibida. | `2e305ac26b24…` |
| `alto-riesgo-empleo` | Baremación de méritos en oposiciones | high_risk | ALTO RIESGO (Anexo III RIA) | Sí | Anexo III, punto 4 (empleo) con perfilado de personas: siempre alto riesgo (Art. 6.3, último párrafo). | `e28211ba0c4b…` |
| `prestaciones-esenciales` | Valoración de solicitudes de renta de inserción | high_risk | ALTO RIESGO (Anexo III RIA) | Sí | Anexo III, punto 5.a): evalúa la admisibilidad de personas físicas para prestaciones esenciales de asistencia pública, con perfilado. | `7cb102a8972a…` |
| `ayudas-a-entidades` | Analizador de subvenciones para entidades | transparency_risk | Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA) | Sí | Las ayudas a entidades no son prestaciones esenciales de asistencia pública a personas físicas: fuera del punto 5.a). Genera contenido: transparencia (Art. 50). | `84efce35c600…` |
| `excepcion-6-3` | Comprobación formal de documentación en un proceso selectivo | transparency_risk (Art. 6.3) | Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50) | Sí | Anexo III, punto 4, sin perfilado, tarea de procedimiento limitada (Art. 6.3.a) y sin influencia sustancial: se acogería a la excepción, pendiente de documentar (Art. 6.4) y registrar (Art. 49.2). | `40e2319a4ae4…` |
| `chatbot-transparencia` | Asistente de información a la ciudadanía | transparency_risk | Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA) | Sí | Interactúa con personas y genera texto, fuera del Anexo III: obligaciones de transparencia (Art. 50). | `2cc207e4b387…` |
| `minimo` | Clasificador interno de documentos | minimal_risk | RIESGO MÍNIMO O NULO (Art. 95 RIA) | Sí | No interactúa con personas ni genera contenido sintético y está fuera del Anexo III: riesgo mínimo (códigos de conducta voluntarios, Art. 95). | `fcd60aabbf03…` |
| `incompleto` | Entrevista sin contestar | requires_review | REQUIERE REVISIÓN (clasificación no concluyente) | Sí | Con respuestas desconocidas el motor no concluye: requiere revisión. | `043a84521aca…` |
| `contradictorio` | Respuestas contradictorias | requires_review | REQUIERE REVISIÓN (clasificación no concluyente) | Sí | Se declara una revisión humana previa y, a la vez, que no interviene ningún empleado público: requiere revisión. | `de3605c4fab5…` |
| `analizador-ayudas` | Analizador de convocatorias de ayudas y subvenciones (aplicación real) | transparency_risk | Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA) | Sí | Resume convocatorias para el personal técnico de la entidad; no evalúa a personas físicas ni decide. Fuera del Anexo III; genera contenido: transparencia (Art. 50). Se declara ejecución local, pero su documentación cita la API de Gemini: debe señalarse la discrepancia. | `fc2c898c889a…` |
| `calculadora-lcsp` | Calculadora de plazos de la LCSP (aplicación real, sin IA) | not_ai_system | EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado | Sí | Calcula vencimientos con reglas fijas (cómputo de días, festivos, prórroga al día hábil siguiente) con date-fns, sin ningún modelo. No infiere sus resultados: no es un sistema de IA (Art. 3.1 RIA). No trata datos personales. | `d0e5d7b65326…` |
| `monitor-boe` | Monitor de edictos concursales del BOE (aplicación real, sin IA, con datos personales) | not_ai_system | EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado | Sí | Extrae con reglas fijas (scraping) los edictos concursales del Tablón Edictal Judicial Único del BOE: no es un sistema de IA (Art. 3.1 RIA). Pero recoge el nombre y el DNI o NIE de deudores que pueden ser personas físicas: son datos de solvencia (lista de la AEPD, criterio 4), y que procedan de una fuente pública no los excluye del RGPD. La necesidad de EIPD queda por determinar hasta valorar si el tratamiento es a gran escala o supone una observación sistemática. | `42eac855f8d1…` |
| `notas-de-prensa` | Asistente de notas de prensa (aplicación real, con IA en la nube) | transparency_risk | Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA) | Sí | Genera con Gemini borradores de notas de prensa y publicaciones para redes sociales a partir de actas y resoluciones; el gabinete de comunicación los revisa antes de publicarlos. Fuera del Anexo III; genera contenido: transparencia (Art. 50). El modelo se ejecuta en la API de Google Gemini, fuera del EEE: debe señalarse la transferencia internacional. Como el gabinete revisa y aprueba cada texto antes de publicarlo, no es obligatorio divulgar que se generó con IA (Art. 50.4, párrafo segundo), siempre que pueda acreditarse ese control editorial. | `de1d051104bf…` |

## Aplicaciones reales

La documentación de cada aplicación (README y dependencias) se guarda en `src/test/casos-reales/` tal como
estaba en el commit indicado. Las respuestas de la entrevista son un **borrador** hecho a partir de esa
documentación: debe confirmarlas el autor de cada aplicación antes de dar el resultado por bueno.

| Caso | Repositorio | Commit | Cribado de la EIPD |
| :--- | :--- | :--- | :--- |
| `analizador-ayudas` | [ariaslombardero/Analizador-de-ayudas-y-subvenciones](https://github.com/ariaslombardero/Analizador-de-ayudas-y-subvenciones) | [`c672b9a`](https://github.com/ariaslombardero/Analizador-de-ayudas-y-subvenciones/tree/c672b9a93f75a5e36c5c8ab6910afff901ba9642) | no indicada |
| `calculadora-lcsp` | [ariaslombardero/Calculadora-LCSP-Lugo](https://github.com/ariaslombardero/Calculadora-LCSP-Lugo) | [`42980ee`](https://github.com/ariaslombardero/Calculadora-LCSP-Lugo/tree/42980eee3dff57d7cf514d9bfa74369917276b03) | no indicada |
| `monitor-boe` | [ariaslombardero/Monitor-BOE](https://github.com/ariaslombardero/Monitor-BOE) | [`a8fbe06`](https://github.com/ariaslombardero/Monitor-BOE/tree/a8fbe06055689f897af8e013b8ff1f5898ffa769) | por determinar |
| `notas-de-prensa` | [ariaslombardero/Asistente-notas-de-prensa](https://github.com/ariaslombardero/Asistente-notas-de-prensa) | [`c575343`](https://github.com/ariaslombardero/Asistente-notas-de-prensa/tree/c57534300ec40ff35ccdb803e42610bc0a3cb4a1) | no indicada |

Cada caso tiene su informe (`<caso>.md`) y su manifiesto (`<caso>.manifest.json`). Son informes técnicos
preliminares para probar la herramienta: no son actos administrativos ni acreditan el cumplimiento.
