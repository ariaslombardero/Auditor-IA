import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/cellar': {
        target: 'https://publications.europa.eu/resource/celex',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cellar/, ''),
        headers: {
          'Accept': 'application/xhtml+xml',
          'Accept-Language': 'es-ES,es;q=0.9',
        },
      },
    },
  },
});
