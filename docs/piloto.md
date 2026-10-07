# Condiciones del piloto interno

**Estado:** propuesta pendiente de decisión expresa de los responsables (§ 6) · **Versión de la herramienta:** motor v2.1.0 · **Fecha:** 07/10/2026

Desarrolla el [alcance del uso habilitado](alcance-piloto.md). El piloto sirve para comprobar si la herramienta ayuda al personal a preparar diagnósticos preliminares de sistemas de IA, y con qué calidad. **No** sirve para tramitar expedientes reales.

## 1. Participantes

| Papel | Quién | Función en el piloto |
| :--- | :--- | :--- |
| Responsable del piloto | *(a designar)* | Coordina, registra incidencias y propone la continuidad o la retirada |
| Usuarios | Personal identificado del área promotora (*nombres a designar*) | Ejecutan auditorías de prueba y anotan discrepancias |
| Revisores | Asesoría jurídica, Responsable de Seguridad, DPD y responsable funcional | Revisan cada informe con la [lista de comprobación](revision-humana.md) |

Antes de empezar, los usuarios reciben una sesión breve sobre los límites de la herramienta (apartado «Límites conocidos» del README y este documento).

## 2. Datos permitidos

- **Sí:**
  - datos sintéticos;
  - documentación técnica no sensible (README, AGENTS.md, descripciones funcionales);
  - los casos de referencia del repositorio.
- **No:**
  - expedientes reales;
  - datos personales, de categorías especiales (Art. 9 RGPD) o penales (Art. 10 RGPD);
  - información clasificada o reservada;
  - claves o credenciales reales en la documentación auditada.

## 3. Configuración

| Aspecto | Condición |
| :--- | :--- |
| Instalación | Repositorio clonado y servido en la intranet (`npm run build` y servidor web con las cabeceras de `vercel.json`) |
| Modelo de IA | **Modelo local** en la intranet (Ollama o vLLM). No se usarán proveedores en la nube con documentación de la entidad |
| Clave | Sin «Recordar» en equipos compartidos |
| Historial | Exportar copia JSON al final de cada sesión de prueba; los informes que se conserven van al repositorio documental del piloto, no al expediente |
| Versión | La del commit indicado en la decisión (§ 6); los cambios posteriores requieren repetir `npm test` y los casos de referencia |

## 4. Funciones dentro del piloto

| Función | Situación |
| :--- | :--- |
| Entrevista, diagnóstico, traza y requisitos | Incluida |
| Informe (DOCX y Markdown) y manifiesto | Incluida, como **borrador** de trabajo |
| Borrador de EIPD | Incluida, como plantilla para el DPD |
| Comentario del modelo de IA | Incluida con modelo local; no altera la clasificación |
| Ensayos adversarios | Incluida para el modelo local y, si se aporta, el prompt del sistema de la app auditada; su alcance es parcial |
| Validación humana de requisitos | Incluida para probarla; no produce efectos fuera del piloto |
| Firma con AutoFirma y CSV | **Fuera del piloto** (ver [formato-documental.md](formato-documental.md)) |

## 5. Qué se mide

1. **Concordancia.** Para cada informe, ¿coincide la clasificación con la que darían los revisores? Se anotan las discrepancias y su causa: pregunta mal entendida, regla del motor o caso no soportado.
2. **Utilidad.** Tiempo de preparación, comparado con hacerlo sin la herramienta, y claridad de la traza.
3. **Errores.** Cualquier afirmación del informe que un revisor considere incorrecta o no respaldada se registra como hallazgo en la [matriz](auditoria/matriz-hallazgos.md).
4. **Incidencias de seguridad:**
   - claves expuestas;
   - datos enviados a un destino no previsto;
   - pérdida del historial.

## 6. Decisión y condiciones de retirada

**Decisión de inicio.** El piloto empieza cuando el responsable funcional, el Responsable de Seguridad y el DPD dejen constancia de su conformidad con este documento. La constancia indica:
- la fecha;
- el commit de la versión;
- la duración prevista (propuesta: 3 meses).

**Retirada inmediata** si ocurre cualquiera de estos hechos:
- se usan datos reales o personales, o un proveedor en la nube con documentación de la entidad;
- un informe de la herramienta se incorpora a un expediente o se le atribuyen efectos;
- se detecta una afirmación del informe sin respaldo que pudiera inducir a error y no se corrige en la versión siguiente;
- se produce una incidencia de seguridad en el propio auditor.

**Al terminar,** el responsable del piloto presenta un informe con:
- los resultados del § 5;
- los hallazgos abiertos;
- una propuesta: continuar, ampliar (por ejemplo, a datos reales con una EIPD previa) o retirar.

## 7. Pendiente antes de iniciar

- Designar a las personas del § 1.
- Instalar el modelo local y comprobar la conexión desde la intranet (CSP `connect-src`, `OLLAMA_ORIGINS`).
- Validar el [formato documental](formato-documental.md) con secretaría y archivo.
- Cotejar con el texto oficial lo que el [registro de fuentes](auditoria/registro-fuentes.md) marca como parcial, pendiente o no accesible: RGPD, WP248, Guía CCN-STIC 884D y Directrices de la Comisión sobre la definición de sistema de IA.
