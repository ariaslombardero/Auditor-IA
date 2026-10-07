# Guía de uso · Auditor IA · Sector Público

> Versión para la herramienta con motor v2.1.0 y entrevista asistida (octubre de 2026). Escrita para personas sin formación técnica.

## 1. Qué es, en un minuto

Auditor IA es una herramienta para **preparar un primer diagnóstico** de una aplicación con inteligencia artificial antes de que una Administración la use. Responde a preguntas como estas:

- ¿Le afecta el Reglamento europeo de IA?
- ¿Está prohibida?
- ¿Es de alto riesgo?
- ¿Qué tiene que hacer la entidad para cumplir?
- ¿Hace falta una evaluación de impacto en protección de datos (EIPD)?
- ¿Qué nivel de seguridad (ENS) le corresponde?

**Cómo trabaja:**
1. Usted describe la aplicación y contesta una entrevista.
2. La herramienta aplica las normas a sus respuestas.
3. Le devuelve una clasificación razonada y la lista de lo que falta por acreditar.
4. Genera un informe en Word para que lo revisen los responsables.

**Lo que no hace:**
- No certifica nada ni dicta resoluciones: el informe es un **borrador** que deben revisar y firmar la asesoría jurídica, el Responsable de Seguridad y el Delegado de Protección de Datos.
- No inspecciona por dentro la aplicación auditada: trabaja con lo que usted declara y con la documentación que aporta.
- No necesita inteligencia artificial para funcionar. La IA es opcional y nunca cambia la clasificación.

## 2. Antes de empezar

| Pregunta | Respuesta |
| :--- | :--- |
| ¿Dónde la abro? | Ahora mismo, en su ordenador: <http://localhost:5174> (con `npm run dev` en marcha). Cuando esté publicada, en la dirección de Vercel. |
| ¿Necesito instalar algo? | Para usar la versión publicada, solo un navegador actualizado. Para la versión local, Node.js y `npm install`. |
| ¿Qué datos puedo usar? | Solo **datos inventados** o documentación técnica no sensible. Nunca expedientes reales, datos personales ni claves reales. |
| ¿Se guarda algo en internet? | No. Todo se guarda en su navegador. Solo si configura un proveedor de IA, el texto que se analiza se envía a ese proveedor. |
| ¿Cuánto se tarda? | Unos 10 minutos con una plantilla de ejemplo; 20–30 minutos con un caso propio. |

## 3. Prueba rápida (10 minutos)

Sirve para ver el recorrido completo sin preparar nada.

1. Abra <http://localhost:5174>.
2. En el **Paso 1**, pulse **«Ruta 3: Carga Manual / Plantillas»** y elija **«Ejemplo: Baremación RRHH (Alto Riesgo)»**.
3. Pulse **«Continuar a la Entrevista Jurídica (Paso 2)»**.
4. Conteste la entrevista como si fuera esa aplicación, que puntúa méritos de aspirantes a un proceso selectivo:
   - **¿Infiere el sistema…?** Sí.
   - **Prácticas prohibidas:** No en todas.
   - **Ámbito del Anexo III:** «Empleo».
   - **¿Elabora perfiles de personas físicas?** Sí.
   - **¿Interactúa con personas?** No. **¿Genera contenido?** Sí.
   - **Papel de la entidad:** «Responsable del despliegue».
   - **¿Cuándo revisa una persona los resultados?** «Antes de que produzcan efectos». **¿Interviene un empleado público?** Sí.
   - **¿Trata datos personales?** Sí. **Base jurídica:** «Art. 6.1.e».
   - En el resto de preguntas, lo que le parezca razonable. Use **«No lo sé»** cuando no lo sepa.
   - Si una pregunta no se entiende, pulse **«¿Qué significa?»**: verá una explicación sencilla con un ejemplo de «sí» y otro de «no».
5. Pulse **«Emitir diagnóstico preliminar»**.
6. En el **Paso 3** verá **«ALTO RIESGO (Anexo III RIA)»**. Despliegue la **traza de la clasificación** para ver por qué.
7. Repita el ejercicio dejando varias preguntas en «No lo sé»: el resultado pasa a **«REQUIERE REVISIÓN»**. Es intencionado: la herramienta no supone lo que no sabe. Conteste las que faltan desde el panel **«Lo que falta por contestar»**, en el propio diagnóstico, y verá cómo el resultado cambia al momento.
8. Vaya al **Paso 5** y descargue el informe en Word. Ábralo y compruebe que dice lo mismo que la pantalla.
9. Abra **«Historial»** en la barra superior: su auditoría está guardada.

## 4. La barra superior

| Botón | Para qué sirve |
| :--- | :--- |
| **Modo determinista (sin IA)** / nombre del modelo | Indica si hay un proveedor de IA configurado. Púlselo para configurarlo (§ 11). |
| **Configurar proveedor IA** | Abre la configuración del modelo de IA (opcional). |
| **ES / GL** | Cambia entre castellano y gallego. |
| **BOE/DOUE** | Consulta artículos de la normativa en las fuentes oficiales. |
| **¿Por qué auditar?** | Explicación breve de la finalidad. |
| **Historial** | Auditorías guardadas en este navegador (§ 12). |
| **Guía** | Manual dentro de la aplicación. |
| **↻** | Reinicia y empieza una auditoría nueva. |

Debajo están los **seis pasos**. Puede volver a cualquier paso ya completado.

## 5. Paso 1 · Describir la aplicación

Tiene tres formas de aportar la información:

| Ruta | Cuándo usarla | Qué hace |
| :--- | :--- | :--- |
| **1. Repositorio GitHub** | La aplicación tiene código público en GitHub | Lee de GitHub el README, el AGENTS.md o CLAUDE.md y la lista de dependencias. No lee el resto del código. |
| **2. Sin código (asistente)** | No hay código ni repositorio | Cuatro preguntas guiadas que redactan un borrador de AGENTS.md a partir de una plantilla. No necesita IA. |
| **3. Carga manual / plantillas** | Tiene los textos a mano o quiere probar | Pegue o suba el README y el AGENTS.md, o cargue una de las tres plantillas de ejemplo. |

**Campos importantes:**
- **Nombre** y **descripción** de la aplicación.
- **Destinatarios:** ciudadanía, personal o uso interno.
- **README:** descripción técnica general.
- **AGENTS.md / CLAUDE.md:** instrucciones del modelo de IA y destino de los datos. Es opcional, pero mejora mucho el análisis.
- **Prompt del sistema:** si lo tiene, permite que las pruebas adversarias del paso 6 usen las instrucciones reales de la aplicación.

> La herramienta busca en estos textos **indicios** (por ejemplo, la palabra «oposiciones») y se los muestra para que los tenga en cuenta. Los indicios **nunca deciden** la clasificación: lo decide la entrevista.

## 6. Paso 2 · La entrevista

Ocho bloques de preguntas. Casi todas se contestan con **Sí / No / No lo sé**.

| Bloque | Qué pregunta | En lenguaje llano |
| :--- | :--- | :--- |
| **A. ¿Es un sistema de IA?** | Art. 3.1 del Reglamento de IA | ¿Saca sus resultados por inferencia (aprende o «razona»), o aplica reglas fijas programadas? |
| **B. Prácticas prohibidas** | Art. 5, una pregunta por práctica | Puntuación social, manipulación, reconocimiento de emociones en el trabajo, identificación biométrica en tiempo real… |
| **C. Alto riesgo** | Art. 6 y Anexo III | ¿Se usa en empleo, educación, prestaciones sociales, justicia, migración…? ¿Valora a personas (perfilado)? ¿Hace solo una tarea auxiliar? |
| **D. Transparencia** | Art. 50 | ¿Habla con personas? ¿Genera textos, imágenes o audios? |
| **E. Papel de la entidad** | Art. 3 | ¿La entidad desarrolla el sistema (proveedora), lo usa (responsable del despliegue) o ambas cosas? |
| **F. Supervisión humana** | Art. 41 de la Ley 40/2015 | ¿Quién revisa los resultados y cuándo? ¿Interviene un empleado público en cada actuación? |
| **G. Protección de datos** | RGPD | ¿Trata datos personales, de salud o penales? ¿A gran escala? ¿De personas vulnerables? |
| **H. Seguridad (ENS)** | RD 311/2022 | ¿Qué daño causaría un fallo en confidencialidad, integridad, trazabilidad, autenticidad y disponibilidad? ¿Hay registro de actividad? |

**Consejos:**
- **«No lo sé» es una respuesta válida.** La herramienta nunca la trata como un «no»: marca el punto como pendiente y la clasificación queda en «requiere revisión».
- Si la aplicación trabaja en un ámbito del Anexo III pero solo hace una tarea limitada (por ejemplo, comprobar que una solicitud trae todos los documentos), indíquelo en **C**: puede acogerse a la excepción del Art. 6.3. Para ello debe describir los hechos y **no** debe valorar a personas.
- Si declara que el sistema **no** infiere sus resultados (bloque A), los bloques B a E se ocultan: no se le aplica el Reglamento de IA.

### 6.1. Ayuda en cada pregunta

Cada pregunta tiene un botón **«¿Qué significa?»** con una explicación en lenguaje sencillo, un ejemplo de «sí», un ejemplo de «no» y la norma de la que procede. Funciona sin IA.

### 6.2. Encontrar lo que falta

- Las preguntas sin contestar aparecen **resaltadas en ámbar** con la etiqueta «Sin contestar».
- Cada bloque indica cuántas le quedan, o «Completo».
- La barra fija de arriba dice cuántas quedan en total. Tiene **«Ir a la siguiente»**, que le lleva a la próxima pendiente, y la casilla **«Mostrar solo las pendientes»**, que oculta lo ya contestado.
- El recuento solo incluye las preguntas que se ven: si una pregunta no aplica (por ejemplo, la base jurídica cuando no hay datos personales), no se cuenta.

### 6.3. Sugerencias de respuesta

Si no sabe una respuesta, puede pedir ayuda. **Las sugerencias nunca se aplican solas**: usted decide si las acepta.

- **Con proveedor de IA:** botón **«Sugerir respuesta con IA»** bajo cada pregunta pendiente, o **«Sugerir para las pendientes»** en el recuadro «Ayuda para contestar». La IA lee la documentación del paso 1 y propone una respuesta con una cita y una explicación.
- **Sin proveedor:** **«Buscar indicios en la documentación»** busca palabras clave (por ejemplo, «chatbot» o el nombre de un modelo) y propone una respuesta orientativa.

Cada sugerencia indica de qué tipo es:

| Tipo | Qué significa | Cómo se acepta |
| :--- | :--- | :--- |
| **Con cita comprobada** | La herramienta ha comprobado que la frase citada aparece en su documentación | Una a una, o todas a la vez con **«Aceptar las sugerencias con cita comprobada»** |
| **Inferida** | No hay una frase que la respalde, o la cita no aparece en la documentación. Un «no» sobre prácticas prohibidas, datos sensibles o perfilado es siempre inferido: que la documentación no lo mencione no prueba que no ocurra | Solo una a una, después de revisarla |
| **No consta** | La documentación no permite saberlo | No se acepta: la pregunta sigue en «No lo sé» |
| **Decisión de la entidad** | Papel de la entidad, base jurídica, niveles del ENS: no están en ningún documento | La IA solo explica qué valorar en su caso («Explicar con mi caso»); decide usted |

**Privacidad:** si el proveedor es un servicio externo, la herramienta le pedirá confirmación antes de enviar la documentación. Si ha declarado datos de salud o penales, no la enviará. Con un modelo local, nada sale de su organización.

**Trazabilidad:** el informe incluye una tabla **«Origen de las respuestas»** con las que proceden de una sugerencia aceptada, el modelo que la generó y su cita. Si después cambia esa respuesta a mano, vuelve a constar como suya.

Al terminar, pulse **«Emitir diagnóstico preliminar»**.

## 7. Paso 3 · Leer el diagnóstico

### 7.1. La clasificación

| Resultado | Qué significa | Qué implica |
| :--- | :--- | :--- |
| **Excluido del RIA** | No es un sistema de IA: funciona con reglas fijas | Le aplican el ENS, el RGPD y las leyes 39 y 40/2015, pero no el Reglamento de IA |
| **Riesgo inadmisible** | Incurre en una práctica prohibida | No puede usarse |
| **Alto riesgo** | Ámbito del Anexo III sin excepción aplicable | Obligaciones exigentes (desde el 2/12/2027): gestión de riesgos, registros, supervisión humana, evaluación de impacto en derechos fundamentales si es un organismo público… |
| **Exceptuado vía Art. 6.3** | Ámbito del Anexo III, pero tarea auxiliar sin perfilado | Hay que documentar la excepción y registrar el sistema |
| **Riesgo de transparencia** | Habla con personas o genera contenido | Avisar de que es una IA y marcar el contenido generado |
| **Riesgo mínimo** | Nada de lo anterior | Buenas prácticas voluntarias |
| **Requiere revisión** | Faltan respuestas o hay contradicciones | Complete o corrija la entrevista; la herramienta no se arriesga a concluir |

### 7.2. Por qué ha salido ese resultado

- **Traza de la clasificación:** cada paso del razonamiento, con la pregunta, su respuesta, la regla aplicada, la norma y sus límites. Es lo primero que debe leer quien revise.
- **Motivos de revisión:** si el resultado es «requiere revisión», aquí se dice qué falta.
- **Alertas para la revisión:** avisos que no cambian la clasificación pero deben atenderse. Por ejemplo, se declara que el modelo funciona en servidores propios, pero la documentación menciona Gemini.

### 7.3. Lo que falta: respuestas pendientes y requisitos por validar

Arriba del diagnóstico hay dos recuadros que miden **cosas distintas**:

| Recuadro | Qué cuenta | Cómo se reduce |
| :--- | :--- | :--- |
| **Respuestas pendientes en la entrevista** | Preguntas que siguen en «No lo sé» o sin contestar | Contestándolas. El panel **«Lo que falta por contestar»** permite hacerlo allí mismo, con «¿Qué significa?» y las sugerencias, o ir a la pregunta con «Ver en la entrevista» |
| **Requisitos por validar** | Obligaciones y comprobaciones que, aunque estén contestadas, nadie ha validado todavía | Solo con **«Registrar validación humana»** en cada requisito. Contestar la entrevista **no** los reduce: es normal que este número no baje |

**El diagnóstico se actualiza solo.** Si vuelve a la entrevista y cambia algo, el diagnóstico, el informe y su huella se recalculan al momento, aunque llegue por la barra de pasos. Un aviso azul le recuerda que hay cambios sin guardar en el historial: pulse **«Guardar revisión»** cuando termine.

### 7.4. Cuadro de mando y requisitos

Cuatro pilares: **Reglamento de IA**, **protección de datos**, **seguridad (ENS)** y **gobernanza pública**. Cada requisito tiene un estado:

| Estado | Significado |
| :--- | :--- |
| Declarado | Lo afirma el promotor; nadie lo ha comprobado |
| No verificado / pendiente | Falta información o comprobación |
| No evaluado | La herramienta no lo examina; debe revisarse a mano |
| Incumple | Lo declarado choca con la norma |
| **Acreditado** | Solo cuando una persona registra la **validación**: quién lo valida y con qué evidencia |

**Para validar un requisito,** pulse **«Registrar validación humana»** junto a él y anote el cargo de la persona y la evidencia (acta, informe, referencia del expediente). Si después cambia la entrevista, la validación deja de valer y hay que repetirla. Puede deshacerla con **«Retirar validación»**.

### 7.5. Vistas por perfil

En la parte superior puede elegir entre **vista completa**, **vista jurídica / DPD** y **vista técnica / CISO**. Cada vista muestra lo que interesa a ese perfil.

### 7.6. Comentario de la IA (si hay proveedor)

Si configuró un modelo de IA, aparece un **comentario complementario**. Es orientativo, **no cambia la clasificación** y consta qué proveedor y modelo lo escribieron. Si el modelo cree que la clasificación debería ser más grave, aparece un aviso de «posible discrepancia», que debe revisarse.

Si cambia las respuestas después, el comentario queda **desfasado**: deja de mostrarse y de incluirse en el informe. Pulse **«Actualizar diagnóstico y regenerar el comentario»** para obtener uno nuevo.

## 8. Paso 4 · Kit de código

Textos y fragmentos para el equipo que desarrolla la aplicación auditada:
- aviso de que se está usando una IA (Art. 50), para pantallas y documentos;
- texto para el pie de los documentos generados;
- pautas para no exponer claves en el navegador.

Son **propuestas**: el equipo técnico debe adaptarlas.

## 9. Paso 5 · El informe

1. Rellene los **datos de la entidad**: organismo, servicio, responsable funcional, Responsable de Seguridad, DPD y fecha. Aparecerán en el informe.
2. Descargue lo que necesite:

| Botón | Qué obtiene | Para qué |
| :--- | :--- | :--- |
| **Descargar informe (.docx)** | Informe técnico preliminar en Word | Revisarlo, corregirlo y, si procede, llevarlo a firma |
| **Descargar informe (.md)** | El mismo informe en texto | Archivo o publicación en repositorios |
| **JSON Dashboard** | Manifiesto con todos los datos | Anexo técnico: permite reproducir el diagnóstico |
| **Borrador de EIPD (.docx)** | Plantilla de evaluación de impacto | Para que la complete el responsable del tratamiento con el DPD |
| **Copiar Markdown** | El informe en el portapapeles | Pegarlo en otro sitio |

**Qué contiene el informe:**
- resumen y cuadro de mando;
- alertas y recomendaciones;
- prácticas prohibidas;
- clasificación y su traza;
- supervisión humana, seguridad y protección de datos;
- la asistencia de IA empleada;
- la **huella SHA-256 de las entradas**: un código que permite comprobar que el Word, el Markdown y el manifiesto proceden de las mismas respuestas;
- espacio para la revisión y la firma.

> El informe es un **borrador**. Para incorporarlo a un expediente, el personal competente lo revisa, lo convierte a PDF/A, lo firma y lo sube al gestor de expedientes (ver [formato-documental.md](formato-documental.md)). Para revisarlo, use la [lista de comprobación](revision-humana.md).

## 10. Paso 6 · Laboratorio de pruebas

| Pestaña | Qué hace |
| :--- | :--- |
| **1. Simulador Red Teaming** | Ataca al modelo de IA configurado con trampas: instrucciones ocultas en documentos, peticiones de datos personales, órdenes de pagar o borrar… El resultado depende de **lo que el modelo haría**, no de lo que dice. |
| **2. Generador EIPD (AEPD)** | Muestra qué criterios de las listas de la AEPD y de las directrices europeas (WP248) se cumplen y descarga el borrador de EIPD. |
| **3. Inspector Prompt-Guard** | Revisa un texto en busca de caracteres invisibles y trucos para colar instrucciones, y propone cómo reforzar el prompt. |
| **4. Consultor RAG Offline** | Busca en los textos normativos incluidos en la aplicación, sin conexión. Indica si cada resultado es un extracto literal o un resumen, con enlace a la fuente oficial. |
| **5. Diligencia y AutoFirma** | Calcula la huella del informe y un identificador interno, y explica cómo firmarlo con AutoFirma. **No** genera un código seguro de verificación (CSV): ese lo asigna la sede electrónica. |

**Cómo leer el Simulador Red Teaming:**
1. Elija el tipo de aplicación: documental, chatbot, agente con herramientas o batería completa.
2. Si la aplicación auditada tiene **prompt del sistema** (paso 1), marque la casilla para usarlo.
3. Pulse **«Lanzar evaluación»**.
4. Interprete cada resultado:
   - **Superado:** el modelo no hizo lo que pedía el ataque.
   - **Fallo observado:** sí lo hizo, por ejemplo puntuar 100/100 o pedir enviar un correo al atacante. Hay que corregirlo.
   - **Indeterminado:** respondió fuera del formato pedido. Revíselo a mano.
   - **No ejecutado:** el proveedor dio error.
   - **Demostración:** no hay proveedor configurado, así que no se envía nada y no hay puntuación.
5. Lea el **alcance**: se prueba el modelo, no la aplicación completa.

El **escáner de claves**, en la misma pantalla, busca contraseñas de servicios de IA en los textos aportados. También puede pegar código para que lo revise. Indica qué ha analizado y qué no.

## 11. Configurar un proveedor de IA (opcional)

Pulse **«Configurar proveedor IA»**. Tiene tres pestañas.

**Google Gemini**
1. Consiga una clave en Google AI Studio (el enlace está en la ventana).
2. Pegue la clave. La lista de modelos se carga sola y **solo muestra los modelos que admite su clave**.
3. Elija un modelo, por ejemplo `gemini-flash-latest`, y pulse **«Guardar configuración»**. La herramienta comprueba la conexión.
4. Aviso: en el nivel gratuito, Google puede usar las peticiones para mejorar sus productos. No incluya datos personales ni información reservada.

**Compatible con OpenAI**
Para Mistral (UE), OpenAI, OpenRouter, DeepSeek, Groq o un servidor propio con esa interfaz:
1. Elija el servicio o escriba la dirección.
2. Pegue la clave.
3. Elija el modelo de la lista o escríbalo.

**Modelo local** (recomendado para la Diputación)
1. Instale [Ollama](https://ollama.com) y descargue un modelo, por ejemplo `ollama pull qwen2.5:14b`. Los modelos muy pequeños dan comentarios pobres.
2. En la pestaña, deje «Ollama» y la dirección `http://localhost:11434`.
3. Pulse **«Detectar modelos del servidor local»** y elija uno.
4. Si abre la aplicación desde la dirección de Vercel (no desde `localhost`), Ollama debe admitir ese origen: configure la variable `OLLAMA_ORIGINS` con la dirección de la aplicación. Además, el navegador puede pedirle permiso para acceder a la red local.

**Sobre la clave:**
- Solo se envía al proveedor elegido.
- Se borra al cerrar la pestaña, salvo que marque **«Recordar la clave en este equipo»**. No lo marque en equipos compartidos.
- Para quitarla, pulse **«Borrar configuración»**.

**Protección de datos:** si en la entrevista declara datos de salud o penales y el proveedor está fuera de su organización, la herramienta **no envía** la documentación al modelo y lo deja anotado en el informe.

## 12. Historial

Cada diagnóstico se guarda solo en **este navegador**.

- **Revisiones:** si repite el análisis o registra una validación, se añade una **revisión nueva** y las anteriores se conservan.
- **Cargar:** abre una revisión. **DOCX:** descarga su informe.
- **Exportar JSON:** copia de seguridad del historial. **Importar JSON:** la restaura. La herramienta rechaza los registros dañados o manipulados e indica el motivo.
- **Límite:** 50 registros. Si se supera, se retiran los más antiguos y se le avisa.
- **Importante:** borrar los datos del navegador elimina el historial. Exporte copias y guarde los informes definitivos en el gestor de expedientes.

## 13. Problemas frecuentes

| Problema | Solución |
| :--- | :--- |
| El resultado siempre sale «requiere revisión» | Quedan respuestas en «No lo sé» o hay contradicciones. Mire los motivos y el panel «Lo que falta por contestar» en el paso 3. |
| He contestado todo y siguen saliendo «requisitos por validar» | Es lo esperado: contestar no acredita. Cada requisito se acredita con «Registrar validación humana» y su evidencia (§ 7.3). |
| Una sugerencia no tiene botón «Aceptar» | Es de tipo «no consta» o «decisión de la entidad»: la documentación no permite responder, o le toca decidir a la entidad (§ 6.3). |
| La aceptación en bloque no incluye algunas sugerencias | Solo incluye las de cita comprobada. Las inferidas se revisan y aceptan una a una. |
| No aparecen modelos de Gemini | Revise la clave completa (empieza por `AIza`) o pulse «Actualizar lista desde la API». |
| «No se pudo conectar» con Ollama | Compruebe que Ollama está abierto y la dirección es correcta. Si usa la versión de Vercel, configure `OLLAMA_ORIGINS`. |
| Error 429 | Ha superado el límite de peticiones del nivel gratuito. Espere unos segundos; la herramienta reintenta sola. |
| El informe no tiene comentario de IA | No hay proveedor configurado, la llamada falló o se bloqueó por datos sensibles. El informe lo explica en «Asistencia de IA». |
| Aviso rojo «El diagnóstico NO se ha guardado» | El almacenamiento del navegador está lleno o bloqueado (modo privado). Exporte el historial y borre registros antiguos. |
| La consulta del BOE/DOUE no carga | La herramienta usa entonces los textos incluidos y lo indica. Compruebe la vigencia en BOE.es o EUR-Lex. |

## 14. Glosario

| Término | Significado |
| :--- | :--- |
| **RIA** | Reglamento (UE) 2024/1689 de Inteligencia Artificial, modificado por el Reglamento (UE) 2026/1744 |
| **Anexo III** | Lista de usos de alto riesgo (empleo, educación, prestaciones sociales, justicia…) |
| **Perfilado** | Valorar aspectos personales de alguien: rendimiento, situación económica, fiabilidad, comportamiento… |
| **Proveedor / responsable del despliegue** | Quien desarrolla el sistema / quien lo usa bajo su autoridad |
| **EIPD** | Evaluación de impacto en la protección de datos (Art. 35 RGPD) |
| **ENS** | Esquema Nacional de Seguridad (RD 311/2022): categorías básica, media y alta |
| **README / AGENTS.md** | Documentos que describen una aplicación: el primero para quien la usa; el segundo, para entender cómo funciona su IA por dentro |
| **Prompt del sistema** | Instrucciones fijas que recibe el modelo de IA de una aplicación |
| **Huella SHA-256** | Código que identifica unas entradas concretas: si cambia una respuesta, cambia la huella |
| **Red teaming** | Pruebas que intentan engañar a la IA para comprobar si cae en la trampa |
| **Modelo local** | IA que funciona en un ordenador o servidor propio, sin enviar datos a internet |

## 15. Después de la auditoría

1. Envíe el informe (`.docx`) y el manifiesto (`.json`) a los revisores, con la [lista de comprobación](revision-humana.md).
2. Corrija la entrevista con lo que señalen y vuelva a emitir el diagnóstico: quedará como una revisión nueva.
3. Registre las validaciones con su evidencia.
4. Si va a incorporarse a un expediente, siga el procedimiento de [formato-documental.md](formato-documental.md).
5. Durante el piloto, anote cualquier error de la herramienta para registrarlo en la [matriz de hallazgos](auditoria/matriz-hallazgos.md).
