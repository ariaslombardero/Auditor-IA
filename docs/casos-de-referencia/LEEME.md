# Casos de referencia del motor

> Generado por `npm run ejemplos` (`scripts/generarEjemplos.ts`) el 2026-10-07T21:26:37.645Z, con el motor v2.1.0.
> Corte normativo: Registro de fuentes de 05/10/2026: RIA (Reglamento (UE) 2024/1689) y Reglamento (UE) 2026/1744; Ley 40/2015; Ley 15/2022; RD 729/2023; ENS (RD 311/2022).
> Los diagnósticos proceden solo del motor determinista, sin ningún modelo de IA. Las entradas son sintéticas,
> salvo el caso `analizador-ayudas`, que usa la documentación pública de esa aplicación.
> Las mismas comprobaciones se ejecutan como pruebas en `src/lib/__tests__/referenceCases.test.ts`.

| Caso | Descripción | Resultado esperado | Resultado del motor | Coincide | Fundamento | Huella de las entradas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `no-ia` | Gestor de citas con reglas fijas | not_ai_system | EXCLUIDO DEL RIA (No es un sistema de IA - Art. 3.1 RIA), según lo declarado | Sí | No infiere sus resultados: aplica reglas predefinidas. No es un sistema de IA (Art. 3.1 RIA). | `ce98a2da84ea…` |
| `prohibido` | Puntuación social de la ciudadanía | prohibited | RIESGO INADMISIBLE (Práctica Prohibida - Art. 5 RIA) | Sí | Se declara una práctica del Art. 5.1.c RIA (puntuación social): prohibida. | `d925c43afcb6…` |
| `alto-riesgo-empleo` | Baremación de méritos en oposiciones | high_risk | ALTO RIESGO (Anexo III RIA) | Sí | Anexo III, punto 4 (empleo) con perfilado de personas: siempre alto riesgo (Art. 6.3, último párrafo). | `b43fac96bcec…` |
| `prestaciones-esenciales` | Valoración de solicitudes de renta de inserción | high_risk | ALTO RIESGO (Anexo III RIA) | Sí | Anexo III, punto 5.a): evalúa la admisibilidad de personas físicas para prestaciones esenciales de asistencia pública, con perfilado. | `01814b47f31c…` |
| `ayudas-a-entidades` | Analizador de subvenciones para entidades | transparency_risk | Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA) | Sí | Las ayudas a entidades no son prestaciones esenciales de asistencia pública a personas físicas: fuera del punto 5.a). Genera contenido: transparencia (Art. 50). | `7ab475223a3c…` |
| `excepcion-6-3` | Comprobación formal de documentación en un proceso selectivo | transparency_risk (Art. 6.3) | Riesgo Limitado (Exceptuado de Alto Riesgo vía Art. 6.3 RIA & Art. 50) | Sí | Anexo III, punto 4, sin perfilado, tarea de procedimiento limitada (Art. 6.3.a) y sin influencia sustancial: se acogería a la excepción, pendiente de documentar (Art. 6.4) y registrar (Art. 49.2). | `002d3df1afdd…` |
| `chatbot-transparencia` | Asistente de información a la ciudadanía | transparency_risk | Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA) | Sí | Interactúa con personas y genera texto, fuera del Anexo III: obligaciones de transparencia (Art. 50). | `a6581cb9524a…` |
| `minimo` | Clasificador interno de documentos | minimal_risk | RIESGO MÍNIMO O NULO (Art. 95 RIA) | Sí | No interactúa con personas ni genera contenido sintético y está fuera del Anexo III: riesgo mínimo (códigos de conducta voluntarios, Art. 95). | `1f8e10162e3c…` |
| `incompleto` | Entrevista sin contestar | requires_review | REQUIERE REVISIÓN (clasificación no concluyente) | Sí | Con respuestas desconocidas el motor no concluye: requiere revisión. | `8789a329490e…` |
| `contradictorio` | Respuestas contradictorias | requires_review | REQUIERE REVISIÓN (clasificación no concluyente) | Sí | Se declara una revisión humana previa y, a la vez, que no interviene ningún empleado público: requiere revisión. | `8a57e63f5029…` |
| `analizador-ayudas` | Analizador de convocatorias de ayudas y subvenciones (aplicación real) | transparency_risk | Riesgo de Transparencia (Riesgo Limitado - Art. 50 RIA) | Sí | Resume convocatorias para el personal técnico de la entidad; no evalúa a personas físicas ni decide. Fuera del Anexo III; genera contenido: transparencia (Art. 50). Se declara ejecución local, pero su documentación cita la API de Gemini: debe señalarse la discrepancia. | `3d6105e30269…` |

Cada caso tiene su informe (`<caso>.md`) y su manifiesto (`<caso>.manifest.json`). Son informes técnicos
preliminares para probar la herramienta: no son actos administrativos ni acreditan el cumplimiento.
