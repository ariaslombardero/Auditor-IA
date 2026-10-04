import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApiConfigProvider } from './context/ApiConfigContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiConfigProvider>
      <App />
    </ApiConfigProvider>
  </StrictMode>
);
