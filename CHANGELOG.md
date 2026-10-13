# Cambios

Cada versión indica la del motor de clasificación (`ENGINE_VERSION`), que figura en todos los informes. El detalle de cada corrección, con su prueba, está en la [matriz de hallazgos](docs/auditoria/matriz-hallazgos.md).

## 2.2.1 · 13/10/2026 · Coherencia de los informes

- **Las preguntas ocultas no cuentan (DOC-17).** Cuando una pregunta no aplica al caso (por ejemplo, las del Reglamento de IA en un sistema sin IA, o la del empleado público si el sistema no produce actos administrativos), su respuesta se trata como no contestada en el motor y en los tres documentos. Así ningún informe dice a la vez «no aplica» y «declarado que el sistema interactúa con personas».
- **Art. 41 coherente en todo el informe.** El resumen y el párrafo de deslinde dicen lo mismo que el requisito: «no produce actos administrativos», «actuación automatizada», «interviene un empleado público» o «no consta».
- **Art. 50 en sistemas sin IA:** el requisito explica que no se aplica porque el sistema no es de IA.
- Sin puntos dobles al encadenar textos. La Calculadora LCSP tiene su propia descripción del procedimiento.
- Una prueba recorre los 15 casos de referencia y falla si un informe se contradice.
- README: el código se ha programado con asistentes de IA (Claude Code) bajo la dirección y la revisión del autor.

## 2.2.0 · 10/10/2026 · Casos reales y protección de datos

- **Casos de aplicaciones reales.** Se añaden tres aplicaciones de la Diputación de Lugo como casos de referencia (Calculadora LCSP, Monitor BOE y Asistente de notas de prensa), y el analizador de ayudas pasa a usar su README real. Su documentación se guarda con el commit de cada repositorio. Las respuestas de la entrevista las confirma el autor.
- **Datos de solvencia (EIPD-06).** Nueva pregunta que activa el criterio 4 de la lista de la AEPD. Que los datos procedan de una fuente pública, como el BOE, no los excluye del RGPD.
- **Brechas de datos (BRE-01).** Pregunta y requisito `RGPD-BRECHAS` (Arts. 33 y 34 RGPD), con las herramientas Asesora Brecha y Comunica-Brecha RGPD. Procedimiento ante incidentes de la propia herramienta.
- **Alojamiento (ALO-01).** La pregunta sirve también para aplicaciones sin IA.
- **Art. 50 (TRA-01).** La acción distingue el aviso de interacción (50.1), el marcado (50.2) y los textos publicados sobre asuntos de interés público, con la excepción por control editorial (50.4).
- **Indicios (IND-01 a IND-03).** Ya no cuentan como uso de IA las frases sobre cómo se desarrolló la aplicación. Se corrigen el falso indicio de empleo por «criterios de baremación» y las negaciones largas.
- **Cobertura AEPD (COB-01).** Matriz frente a los 25 objetivos de control de los *Requisitos para auditorías de tratamientos que incluyan IA*, incluido lo que no cubre.
- **Necesidad y proporcionalidad (EIPD-07).** Nuevo apartado en el borrador de EIPD (Art. 35.7.b RGPD) con cinco juicios. La conclusión la completa el responsable con el asesoramiento del DPD.
- **Evaluación de impacto en los derechos fundamentales (FRIA-01).** En alto riesgo, el requisito del Art. 27 RIA aclara que complementa la EIPD y remite al modelo FRIA de la APDCAT.
- **Prueba con Oasis-Madrid (quinto caso real, sin IA).** La herramienta se adapta al caso: sin IA no ofrece el kit de código ni las pruebas del modelo (UX-03); sin datos personales, «No procede la EIPD» (EIPD-08). Las sugerencias sobre el Art. 3.1 y el Art. 41 son siempre «inferidas» (SUG-04). Nueva pregunta «¿produce actos administrativos?»: si no, el Art. 41 no aplica (ADM-01).
- **Textos (DOC-16).** Se retira la diligencia con huella e identificador del documento, y los textos que prometían de más. Los ejemplos de modelos ya no llevan números de versión.
- La revisión del 5/10 pasa a `docs/historico/revision-ia-linea-base-v2.0/`.
- Licencia Apache 2.0 (con fichero NOTICE) y versión unificada en el paquete y el motor.

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
