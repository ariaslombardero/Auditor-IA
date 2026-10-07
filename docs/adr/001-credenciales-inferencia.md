# ADR 001 · Credenciales y proveedores de inferencia

**Estado:** aceptada (07/10/2026) · **Decide:** la responsable del proyecto · **Hallazgos:** SEG-03, SEG-04, SEG-05, SEG-07, SEG-08

## Contexto

La aplicación tiene dos usos:

1. **Demostración pública** desplegada en Vercel desde el repositorio público, para que cualquiera la pruebe con su propia clave.
2. **Uso institucional** en la Diputación de Lugo: se clona el repositorio y se ejecuta en la intranet con modelos locales, sin que la documentación salga de la organización.

No hay servidor propio. La versión anterior guardaba la clave en claro en `localStorage`, enviaba la clave de Gemini en la URL y cargaba tipografías de Google.

## Decisión

Se adopta la misma arquitectura que *Opositor transparente* («trae tu propia clave», sin servidor):

| Aspecto | Decisión |
| :--- | :--- |
| Proveedores | `gemini` (SDK oficial), `compatible` (cualquier API compatible con OpenAI; la URL decide a quién se envía la clave), `ollama` (API nativa, con `num_ctx`), `llamacpp` y `vllm`. Las configuraciones antiguas (`openrouter`, `groq`, `custom`) se migran (`src/lib/migracionConfig.ts`). |
| Custodia de la clave | `sessionStorage` por defecto; `localStorage` solo si se marca «Recordar». La clave guardada por la versión anterior se pasa a la sesión y se borra del equipo (`src/lib/almacenConfig.ts`). |
| Transporte | La clave de Gemini va en la cabecera `x-goog-api-key`, nunca en la URL. En el resto, `Authorization: Bearer`, solo hacia el origen configurado; al cambiar la URL de destino se borra la clave escrita. |
| Selección de modelo | Sin listas fijas: el selector muestra solo los modelos que devuelve el proveedor con esa clave o ese servidor. Al guardar se prueba la conexión con el modelo elegido. |
| Proveedor efectivo | Cada diagnóstico registra proveedor, modelo y ubicación (local, red interna o externo), deducida de la dirección real, y aparece en el panel, el DOCX, el Markdown y el manifiesto. Si se declaran datos de los Arts. 9 o 10 RGPD, la documentación **no** se envía a un proveedor externo (`src/lib/proveedorEfectivo.ts`). |
| Cabeceras | `vercel.json`: CSP (`script-src 'self'`, `object-src 'none'`, `form-action 'none'`, `frame-ancestors 'none'`), `nosniff`, `no-referrer` y `Permissions-Policy`. La compilación añade la CSP como `<meta>` para cualquier servidor estático; `vite preview` aplica las mismas cabeceras. |
| Tipografía | Inter autoalojada (`@fontsource/inter`): sin conexiones a servicios de fuentes de terceros. |
| Legislación de EUR-Lex | La ruta `/api/cellar` funciona en desarrollo, en `vite preview` y en Vercel (`rewrites`). Si falla, el servicio lo declara (`online`, `cached` u `offline_fallback`). |

## Consecuencias y límites

- **La clave sigue en el navegador.** Cualquier script que se ejecutase en la página podría leerla; la CSP reduce ese riesgo, pero no lo elimina. Por eso la demostración pública es para pruebas con datos sintéticos, y el aviso del nivel gratuito de Gemini recuerda que Google puede usar las peticiones.
- **Uso institucional:** modelo local u on-premise (Ollama, vLLM, llama.cpp) en la intranet. La CSP admite `http://localhost:*` y `http://127.0.0.1:*`. Si el servidor de inferencia está en otra máquina de la intranet con HTTP, debe añadirse su origen a `connect-src` en la configuración del servidor web institucional, o servirse por HTTPS.
- **Desde la demostración pública hacia un Ollama local**, el navegador puede pedir permiso de acceso a la red local, y Ollama debe admitir el origen (`OLLAMA_ORIGINS`).
- **No se descarta una pasarela corporativa** (autenticación, lista de destinos, límites y registro) si el piloto lo requiere; sería una ADR posterior.
- La lista de modelos de Gemini refleja lo que Google declara para la clave; un modelo puede figurar y no tener cuota en el nivel gratuito. Por eso la prueba de conexión al guardar usa el modelo elegido.
