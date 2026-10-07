# Procedencia de estos ficheros

**Estos resultados no fueron generados por el motor de la aplicación.** Los produjo el script
`generateAuditOutputs.js` (conservado en esta misma carpeta), que escribía textos fijos redactados a mano (por ejemplo, las filas
«✅ CONFORME» del Art. 5 o el estado «CONFORME» de la medida IA-01 para claves alojadas en el cliente).

Por tanto:

- No deben presentarse como resultado de una auditoría ejecutada con `auditor-ia-app`.
- Algunas de sus afirmaciones contradicen los criterios actuales de la herramienta (claves en el
  cliente como «conforme», medidas «IA-xx» atribuidas a la Guía CCN-STIC 884D, verificación normativa
  «en tiempo real», responsabilidad atribuida «única y exclusivamente» a los funcionarios).
- Se conservan sin modificar para mantener su procedencia (línea base `48956a6`).

En la Fase 4 del plan de saneamiento se regeneraron los resultados ejecutando el motor real (carpeta superior); estos
ficheros pasaron a esta subcarpeta de histórico.

Más información: `docs/auditoria/matriz-hallazgos.md` (hallazgo DOC-09).
