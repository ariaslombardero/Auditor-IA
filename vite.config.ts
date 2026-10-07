import { defineConfig, type Plugin, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// Las cabeceras de seguridad viven en vercel.json (producción).
// `vite preview` las reutiliza para poder comprobarlas en local.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf-8')) as {
  headers: Array<{ headers: Array<{ key: string; value: string }> }>;
};
const cabecerasSeguridad = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]));

/**
 * La compilación incluye además la CSP como <meta>, para que se aplique en cualquier servidor
 * estático (por ejemplo, en la intranet). frame-ancestors no admite <meta> y se omite ahí.
 * No se aplica en desarrollo porque el refresco en caliente de Vite usa scripts en línea.
 */
function cspEnCompilacion(): Plugin {
  const csp = cabecerasSeguridad['Content-Security-Policy']
    .split(';')
    .map((d) => d.trim())
    .filter((d) => d && !d.startsWith('frame-ancestors'))
    .join('; ');
  return {
    name: 'csp-en-compilacion',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }],
  };
}

// Consulta del texto de los reglamentos en EUR-Lex (Cellar), que no admite llamadas desde el navegador.
// En producción la misma ruta la resuelve vercel.json (rewrites).
const proxyCellar: Record<string, ProxyOptions> = {
  '/api/cellar': {
    target: 'https://publications.europa.eu/resource/celex',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/cellar/, ''),
    headers: {
      Accept: 'application/xhtml+xml',
      'Accept-Language': 'es-ES,es;q=0.9',
    },
  },
};

export default defineConfig({
  plugins: [react(), cspEnCompilacion()],
  server: {
    port: 5174,
    proxy: proxyCellar,
  },
  preview: {
    port: 4174,
    headers: cabecerasSeguridad,
    proxy: proxyCellar,
  },
});
