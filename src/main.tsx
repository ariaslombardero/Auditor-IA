import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApiConfigProvider } from './context/ApiConfigContext';
import App from './App';
// Tipografía servida desde la propia aplicación: sin conexiones a servicios de fuentes de terceros.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiConfigProvider>
      <App />
    </ApiConfigProvider>
  </StrictMode>
);
