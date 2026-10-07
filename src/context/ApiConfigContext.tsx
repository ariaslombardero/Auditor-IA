import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { ApiConfig } from '../types';
import { cargarConfigInicial, guardarConfig } from '../lib/almacenConfig';
import { PROVEEDORES_LOCALES } from '../lib/apiService';

interface ApiConfigContextType {
  config: ApiConfig | null;
  /** true si la configuración (con su clave) se guarda en este equipo entre sesiones */
  recordar: boolean;
  setConfig: (config: ApiConfig | null, recordar?: boolean) => void;
  isConfigured: boolean;
}

const ApiConfigContext = createContext<ApiConfigContextType>({
  config: null,
  recordar: false,
  setConfig: () => {},
  isConfigured: false,
});

export const ApiConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [estado, setEstado] = useState(cargarConfigInicial);

  const setConfig = (newConfig: ApiConfig | null, recordar = estado.recordar) => {
    setEstado({ config: newConfig, recordar });
    // Por defecto la clave solo vive mientras dure la pestaña.
    guardarConfig(newConfig, recordar);
  };

  const { config } = estado;
  const isConfigured = Boolean(
    config && config.model.trim() && (
      PROVEEDORES_LOCALES.includes(config.provider) ||
      config.provider === 'compatible' ||
      Boolean(config.apiKey?.trim())
    )
  );

  return (
    <ApiConfigContext.Provider value={{ config, recordar: estado.recordar, setConfig, isConfigured }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => useContext(ApiConfigContext);
