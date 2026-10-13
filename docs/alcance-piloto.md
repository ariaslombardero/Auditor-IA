# Alcance del uso habilitado: piloto interno

> Documento de Fase 0 del plan de saneamiento. Define para qué se prepara la herramienta y qué queda fuera.
> Fecha: 05/10/2026 · Línea base: commit `fa9a67e` («Línea base v2.0 (estado inicial)»).

## 1. Uso que se pretende habilitar

**Piloto interno** en la Diputación, con estas condiciones:

| Aspecto | Condición |
| :--- | :--- |
| Usuarios | Personal identificado del área promotora, con formación previa sobre los límites de la herramienta. |
| Datos | Solo **datos sintéticos o documentación no sensible** (README, AGENTS.md, descripciones funcionales). Sin expedientes reales, datos personales ni información clasificada. |
| Resultado | Borrador de **informe técnico preparatorio**. Cada informe lo revisa una persona experta antes de cualquier uso. |
| Inferencia | Se decidirá en la Fase 3 (ADR 001). Hasta entonces, cualquier proveedor en la nube se considera de uso en demostración. |

## 2. Fuera de alcance

- Incorporar los informes a expedientes administrativos reales o atribuirles efectos jurídicos.
- Sustituir la valoración de la asesoría jurídica, el Responsable de Seguridad (CISO), el Delegado de Protección de Datos (DPD) o el responsable funcional.
- Presentar la herramienta o sus resultados como certificación ENS, evaluación de conformidad del RIA o EIPD aprobada.
- Tratar datos de categorías especiales (Art. 9 RGPD) o relativos a infracciones y condenas (Art. 10 RGPD).

## 3. Dos objetos de evaluación que no deben confundirse

| Objeto | Pregunta | Dónde se trata |
| :--- | :--- | :--- |
| **A. Seguridad del propio auditor** | ¿Es seguro usar `auditor-ia-app`? (credenciales, destinos de red, custodia del historial, integridad de los documentos que genera) | Fases 0, 1 y 3 de este plan. Pruebas `SEG-*`, `ALM-*`, `DOC-*`. |
| **B. Conclusiones sobre la aplicación auditada** | ¿Qué dice el auditor sobre otra aplicación? (clasificación RIA, obligaciones, EIPD, ensayos adversarios) | Fases 1, 2 y 3. Pruebas `MOT-*`, `NOR-*`, `RT-*`, `EIPD-*`. |

Un fallo en A afecta a la entidad que usa el auditor. Un fallo en B afecta a la calidad del informe sobre un tercero. Ninguna conclusión de B puede suplir una carencia de A, ni a la inversa.

## 4. Criterio de cierre del piloto

El piloto solo podrá autorizarse cuando las Fases 0 a 4 estén cerradas con sus criterios de aceptación y exista una decisión expresa de los responsables indicados en `docs/piloto.md` (Fase 4). Lo que no se haya validado figurará como pendiente.
