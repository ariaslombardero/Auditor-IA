# Custodia del historial de diagnósticos

**Hallazgos:** ALM-01 a ALM-06 · **Código:** `src/lib/auditHistoryService.ts`, `src/components/AuditHistoryModal.tsx`

## Qué es y qué no es

El historial es una **copia de trabajo** guardada en el navegador (`localStorage`, clave `auditor_ia_history`). Sirve para retomar un análisis y descargar sus informes.

**No es un sistema de custodia.** Quien tenga acceso al equipo puede modificarlo o borrarlo, y borrar los datos del navegador lo elimina. Los informes que se vayan a usar en un procedimiento se conservan en el **gestor de expedientes** de la entidad, firmados por los responsables (Art. 43 de la Ley 40/2015).

## Revisiones

- Cada análisis abre un **expediente** (`auditId`).
- Repetir el análisis, o registrar o revocar una validación humana, añade una **revisión nueva** (`revision` 2, 3…). Las anteriores se conservan; nada se sobrescribe.
- Al cargar un registro del historial, los cambios posteriores son revisiones de ese expediente. «Reiniciar» abre un expediente nuevo.

## Conservación

- **Límite:** 50 registros (revisiones) en el navegador.
- Si un guardado supera el límite, se retiran los registros más antiguos y **la interfaz lo comunica**, indicando cuántos se han retirado. Nunca se retiran en silencio.
- Si el navegador no permite guardar (almacenamiento lleno, modo privado o bloqueado), la interfaz muestra que **el diagnóstico no se ha guardado**.
- Recomendación: exportar una copia JSON periódicamente y antes de vaciar el historial.

## Copias JSON

- **La exportación** incluye todos los registros con su versión de formato (`schemaVersion`).
- **La importación** admite hasta 10 MB y valida cada registro:
  - identificador, fecha y nombre de la aplicación;
  - clasificación de riesgo y categoría ENS dentro de los valores admitidos;
  - número de revisión;
  - estado completo: ingesta, entrevista, metadatos y diagnóstico;
  - **coincidencia** entre la clasificación del registro y la de su diagnóstico.
- La interfaz informa de los registros importados, los duplicados (que no se vuelven a añadir), los **rechazados con su motivo** y los retirados por el límite.
- Los registros importados se marcan como «importado de una copia».

## Registros de versiones anteriores

- Se leen sin recalcular: se muestran como revisión 1 y con la versión del motor «no recalculado».
- Ningún requisito se presenta como acreditado si no consta una validación humana.
- Los registros guardados que no superan la validación no se muestran, pero tampoco se borran. La interfaz indica cuántos hay.

## Huella SHA-256

La huella de las entradas que figura en los informes permite comprobar que dos documentos parten de las mismas entradas (ingesta y entrevista).

**No acredita la integridad del documento:** quien modifique un registro puede recalcularla. La integridad la aporta la firma electrónica y la custodia en el gestor de expedientes.
