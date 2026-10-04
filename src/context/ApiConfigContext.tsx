import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { ApiConfig } from '../types';

interface ApiConfigContextType {
  config: ApiConfig | null;
  setConfig: (config: ApiConfig | null) => void;
  isConfigured: boolean;
}

const ApiConfigContext = createContext<ApiConfigContextType>({
  config: null,
  setConfig: () => {},
  isConfigured: false,
});

const STORAGE_KEY = 'auditor_ia_api_config';

export const ApiConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<ApiConfig | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setConfig = (newConfig: ApiConfig | null) => {
    setConfigState(newConfig);
    if (newConfig) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isConfigured = Boolean(
    config && (
      (['ollama', 'llamacpp', 'vllm', 'custom'].includes(config.provider) && config.model) ||
      (config.apiKey && config.apiKey.trim().length > 0)
    )
  );

  return (
    <ApiConfigContext.Provider value={{ config, setConfig, isConfigured }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => useContext(ApiConfigContext);
