# Lista de comprobación para la revisión humana de un informe

Cada informe que genera la herramienta es un **borrador basado en lo declarado**. Esta lista indica qué debe comprobar cada revisor antes de darle cualquier uso. Marque cada punto como ✅ comprobado, ❌ incorrecto (anote la corrección) o ➖ no aplica.

**Identificación del informe**
- Aplicación:
- Versión del motor:
- Huella de las entradas:
- Fecha:

## Para todos los revisores

- [ ] El informe declara que es preliminar y que no es un acto administrativo.
- [ ] La huella SHA-256 de las entradas coincide en el DOCX, el Markdown y el manifiesto: los tres parten de las mismas entradas.
- [ ] Se ha leído la **traza de la clasificación** y cada paso responde a lo que de verdad hace el sistema.
- [ ] Las **alertas para la revisión** están atendidas o justificadas.
- [ ] Si el informe incluye un comentario de IA, consta qué proveedor y modelo lo generaron, y no se ha tratado como fundamento.

## Asesoría jurídica

- [ ] **Art. 3.1 RIA.** La respuesta sobre la inferencia se ajusta a las capacidades reales del sistema (Directrices de la Comisión sobre la definición de sistema de IA).
- [ ] **Art. 5.** Se ha confirmado que no concurre ninguna práctica prohibida. Atención a las letras b bis y b ter (Reglamento 2026/1744), exigibles desde el 2/12/2026.
- [ ] **Anexo III.** El ámbito declarado es correcto. En el punto 5 solo se evalúa la letra a); el resto, a mano.
- [ ] **Art. 6.3:**
  - la condición invocada (a, b, c o d) se apoya en hechos;
  - no hay influencia sustancial en la decisión;
  - **no hay perfilado** de personas físicas.
- [ ] Si procede la excepción, consta la documentación del Art. 6.4 y el plan de registro del Art. 49.2.
- [ ] **Papel de la entidad** (proveedora, responsable del despliegue o ambos) y obligaciones correspondientes: Arts. 4, 26, 27, 49.3, 50 y 86 RIA.
- [ ] **Art. 41 Ley 40/2015.** Lo declarado sobre la intervención humana coincide con el funcionamiento real del procedimiento. Si hay actuación automatizada, constan los órganos responsables previamente establecidos.
- [ ] **Ley 15/2022, Art. 23.** Se valora si procede una evaluación de impacto discriminatorio.
- [ ] **Fechas de exigibilidad.** Según el calendario del Reglamento 2026/1744, las obligaciones del Anexo III son exigibles desde el 2/12/2027.

## Responsable de Seguridad

- [ ] La **categoría ENS** (Anexo I del RD 311/2022) corresponde a la valoración real de las cinco dimensiones. Si el informe la marca como orientativa, falta valorar alguna dimensión.
- [ ] Las **credenciales** del sistema auditado no están en el código cliente ni en el repositorio ([op.acc.5], [mp.sw.1]). El escáner solo analiza lo aportado y declara lo que no ha analizado.
- [ ] Existe un **registro de actividad** ([op.exp.8]) con su conservación definida.
- [ ] El **proveedor de inferencia** real coincide con el alojamiento declarado. Si hay alerta de discrepancia, se ha resuelto. Si es un servicio en la nube, se ha valorado [op.nub.1].
- [ ] **Ensayos adversarios:**
  - se ha leído el alcance declarado (modelo y prompt ensayados);
  - los fallos observados tienen corrección;
  - los indeterminados se han revisado a mano.

## Delegado de Protección de Datos

- [ ] Se confirma si hay **datos personales** y cuál es la **base jurídica** (Art. 6.1 RGPD), en particular la letra e) para misiones de interés público.
- [ ] **Categorías especiales y datos penales** (Arts. 9 y 10 RGPD): respuesta comprobada.
- [ ] **Cribado de EIPD.** Los criterios de WP248 y de la lista de la AEPD (Art. 35.4) marcados como «desconocido» se han resuelto. Con dos o más criterios, la EIPD suele ser necesaria.
- [ ] Si procede la EIPD, el **borrador** se ha completado: riesgos residuales, medidas y decisión del responsable. El dictamen del DPD es suyo, no de la herramienta.
- [ ] La actividad figura en el **Registro de Actividades de Tratamiento**.
- [ ] Las **transferencias internacionales** del proveedor de inferencia, si existen, tienen garantías.

## Responsable funcional

- [ ] La descripción del sistema y su finalidad son correctas.
- [ ] La **supervisión humana** declarada (quién revisa, cuándo y con qué capacidad de corregir) es la que se aplica en la práctica.
- [ ] Los avisos de **transparencia** (Art. 50) del kit de código se han incorporado, o se justifica por qué no.
- [ ] Las **recomendaciones** del informe tienen responsable y plazo.

## Resultado de la revisión

| Revisor | Conclusión (conforme con el borrador / con correcciones / no conforme) | Fecha | Firma |
| :--- | :--- | :--- | :--- |
| Asesoría jurídica | | | |
| Responsable de Seguridad | | | |
| Delegado de Protección de Datos | | | |
| Responsable funcional | | | |

Las correcciones que revelen un error de la herramienta se registran como hallazgo en la [matriz](auditoria/matriz-hallazgos.md).
