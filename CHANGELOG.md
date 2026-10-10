# Cambios

Cada versión indica la del motor de clasificación (`ENGINE_VERSION`), que figura en todos los informes. El detalle de cada corrección, con su prueba, está en la [matriz de hallazgos](docs/auditoria/matriz-hallazgos.md).

## 2.2.0 · 10/10/2026 · Casos reales y protección de datos

- **Casos de aplicaciones reales.** Se añaden tres aplicaciones de la Diputación de Lugo como casos de referencia (Calculadora LCSP, Monitor BOE y Asistente de notas de prensa), y el analizador de ayudas pasa a usar su README real. Su documentación se guarda con el commit de cada repositorio. Las respuestas de la entrevista las confirma el autor.
- **Datos de solvencia (EIPD-06).** Nueva pregunta que activa el criterio 4 de la lista de la AEPD. Que los datos procedan de una fuente pública, como el BOE, no los excluye del RGPD.
- **Brechas de datos (BRE-01).** Pregunta y requisito `RGPD-BRECHAS` (Arts. 33 y 34 RGPD), con las herramientas Asesora Brecha y Comunica-Brecha RGPD. Procedimiento ante incidentes de la propia herramienta.
- **Alojamiento (ALO-01).** La pregunta sirve también para aplicaciones sin IA.
- **Art. 50 (TRA-01).** La acción distingue el aviso de interacción (50.1), el marcado (50.2) y los textos publicados sobre asuntos de interés público, con la excepción por control editorial (50.4).
- **Indicios (IND-01 a IND-03).** Ya no cuentan como uso de IA las frases sobre cómo se desarrolló la aplicación. Se corrigen el falso indicio de empleo por «criterios de baremación» y las negaciones largas.
- **Cobertura AEPD (COB-01).** Matriz frente a los 25 objetivos de control de los *Requisitos para auditorías de tratamientos que incluyan IA*, incluido lo que no cubre.
- Licencia MIT y versión unificada en el paquete y el motor.

## 2.1.0 · 5–8/10/2026 · Saneamiento (fases 0 a 5)

Saneamiento completo tras dos revisiones técnicas hechas con modelos de IA (Claude Opus 5.5 y GPT Sol 6.1), contrastadas con fuentes oficiales.

- **Fase 0.** Lógica separada de la interfaz, batería de pruebas, alcance del piloto, matriz de hallazgos y registro de fuentes.
- **Fase 1.** Cotejo de fuentes oficiales y modelo común de requisitos. Se retiran las citas que no se pudieron verificar. El borrador de EIPD deja de redactar el dictamen del DPD.
- **Fase 2.** Clasificación jurídica trazable, con respuestas «sí / no / no lo sé», y validación humana registrada.
- **Fase 3.** Proveedores y credenciales sin listas fijas de modelos. Historial con revisiones e importación validada. Ensayos adversarios juzgados por su efecto.
- **Fase 4.** Casos de referencia y ejemplos generados por el motor. Formato documental. Documentación y condiciones del piloto.
- **Fase 5.** Diagnóstico siempre coherente con las respuestas. Ayuda en lenguaje sencillo. Navegación a lo pendiente. Sugerencias de respuesta que nunca se aplican solas, con la cita comprobada por la aplicación.

## 2.0 · anterior al 5/10/2026 · Línea base

Versión de partida, conservada en el historial de git como «Línea base v2.0». Sus errores están registrados en la matriz de hallazgos.
