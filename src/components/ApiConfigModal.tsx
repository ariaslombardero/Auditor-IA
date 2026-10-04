import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useApiConfig } from '../context/ApiConfigContext';
import { X, Key, ExternalLink, ShieldCheck, Loader2, Server, Zap, Globe2, RefreshCw, Search, CheckCircle2 } from 'lucide-react';
import {
  testApiConnection,
  fetchAvailableModels,
  formatApiError,
  PROVIDER_DEFAULT_ENDPOINTS,
  GEMINI_MODELS,
  OPENROUTER_MODELS,
  GROQ_MODELS,
  LOCAL_DEFAULT_MODELS,
  LOCAL_BACKENDS,
  type ModelOption,
} from '../lib/apiService';
import { t } from '../lib/i18n';
import type { ProviderType, AppIdioma } from '../types';

interface ModelPickerProps {
  provider: ProviderType;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  defaultModels: ModelOption[];
  apiKey?: string;
  endpoint?: string;
  idioma: AppIdioma;
}

const ModelPicker: React.FC<ModelPickerProps> = ({
  provider,
  selectedModel,
  onSelectModel,
  defaultModels,
  apiKey,
  endpoint,
  idioma,
}) => {
  const [fetchedModels, setFetchedModels] = useState<ModelOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customModelInput, setCustomModelInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [onlyFree, setOnlyFree] = useState(false);

  const rawModels = fetchedModels && fetchedModels.length > 0 ? fetchedModels : defaultModels;

  // Carga automática inicial para OpenRouter
  useEffect(() => {
    if (provider === 'openrouter' && !fetchedModels && !isLoading) {
      handleFetch();
    }
  }, [provider]);

  const handleFetch = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const list = await fetchAvailableModels(provider, apiKey, endpoint);
      if (list && list.length > 0) {
        setFetchedModels(list);
        setStatusMessage(`${list.length} ${t('api_models_synced', idioma)}`);
      } else {
        setStatusMessage(idioma === 'galego' ? 'Non se puideron obter modelos adicionais.' : 'No se pudieron obtener modelos adicionales.');
      }
    } catch {
      setStatusMessage(idioma === 'galego' ? 'Erro ao conectar coa API.' : 'Error al conectar con la API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Asegurar que el modelo actual se muestre si no está en la lista inicial
  const allModels = useMemo(() => {
    const list = [...rawModels];
    if (selectedModel && !isCustomMode && !list.some((m) => m.id === selectedModel)) {
      list.unshift({ id: selectedModel, name: `${selectedModel} (${idioma === 'galego' ? 'Actual' : 'Actual'})` });
    }
    return list;
  }, [rawModels, selectedModel, isCustomMode, idioma]);

  // Filtrar modelos por el buscador en tiempo real y filtro gratuito
  const filteredModels = useMemo(() => {
    let list = allModels;
    if (onlyFree) {
      list = list.filter((m) => m.isFree || m.id.includes(':free'));
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
    );
  }, [allModels, searchQuery, onlyFree]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
        <label className="label" style={{ marginBottom: 0 }}>
          {t('api_model_label', idioma)}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {provider === 'openrouter' && (
            <button
              type="button"
              onClick={() => setOnlyFree(!onlyFree)}
              style={{
                background: onlyFree ? '#ecfdf5' : 'none',
                border: onlyFree ? '1px solid #10b981' : '1px solid #cbd5e1',
                color: onlyFree ? '#047857' : '#64748b',
                fontSize: '0.625rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '999px',
                cursor: 'pointer',
              }}
            >
              {onlyFree
                ? idioma === 'galego' ? '✓ Só gratuítos' : '✓ Solo gratuitos'
                : idioma === 'galego' ? 'Filtrar gratuítos (:free)' : 'Filtrar gratuitos (:free)'}
            </button>
          )}
          <button
            type="button"
            onClick={handleFetch}
            disabled={isLoading || (['gemini', 'groq'].includes(provider) && !apiKey?.trim())}
            title={['gemini', 'groq'].includes(provider) && !apiKey?.trim() ? (idioma === 'galego' ? 'Introduce a API Key primeiro' : 'Introduce la API Key primero') : t('api_models_refresh', idioma)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: isLoading || (['gemini', 'groq'].includes(provider) && !apiKey?.trim()) ? 'not-allowed' : 'pointer',
              opacity: ['gemini', 'groq'].includes(provider) && !apiKey?.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            <RefreshCw style={{ width: 11, height: 11 }} className={isLoading ? 'animate-spin' : ''} />
            {isLoading
              ? t('api_models_loading', idioma)
              : ['ollama', 'llamacpp', 'vllm', 'custom'].includes(provider)
              ? t('api_models_detect_local', idioma)
              : t('api_models_refresh', idioma)}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: '#059669', marginBottom: 2 }}>
          <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0 }} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Buscador interactivo rápido */}
      {(allModels.length > 5 || fetchedModels) && !isCustomMode && (
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('api_models_search_placeholder', idioma)}
            className="input-field"
            style={{
              paddingLeft: '1.75rem',
              paddingRight: searchQuery ? '1.75rem' : '0.5rem',
              fontSize: '0.75rem',
              height: '1.875rem',
              marginBottom: '0.25rem',
              background: '#f8fafc',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X style={{ width: 11, height: 11 }} />
            </button>
          )}
        </div>
      )}

      {/* Selector o entrada manual */}
      {!isCustomMode ? (
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <select
            value={selectedModel}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setIsCustomMode(true);
                setCustomModelInput(selectedModel);
              } else {
                onSelectModel(e.target.value);
              }
            }}
            className="select-field"
            style={{ fontSize: '0.8125rem' }}
          >
            {filteredModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
            <option value="__custom__">✏️ {t('api_models_custom', idioma)}</option>
          </select>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <input
              type="text"
              value={customModelInput}
              onChange={(e) => {
                setCustomModelInput(e.target.value);
                onSelectModel(e.target.value);
              }}
              placeholder="Ex: gemini-flash-latest, mistralai/mistral-large..."
              className="input-field"
              style={{ fontSize: '0.8125rem' }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                onSelectModel(rawModels[0]?.id || selectedModel);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', whiteSpace: 'nowrap' }}
            >
              {idioma === 'galego' ? 'Ver lista' : 'Ver lista'}
            </button>
          </div>
          <span style={{ fontSize: '0.625rem', color: '#64748b' }}>
            {idioma === 'galego'
              ? 'Podes usar calquera modelo compatible do provedor introducindo o seu identificador exacto.'
              : 'Puedes usar cualquier modelo compatible del proveedor introduciendo su identificador exacto.'}
          </span>
        </div>
      )}
    </div>
  );
};

interface ApiConfigModalProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  idioma?: AppIdioma;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  open,
  isOpen,
  onOpenChange,
  onClose,
  idioma = 'castellano',
}) => {
  const isModalOpen = isOpen !== undefined ? isOpen : open;
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const { config, setConfig } = useApiConfig();

  type TabType = 'gemini' | 'openrouter' | 'groq' | 'local';

  const initialTab: TabType =
    config?.provider === 'openrouter'
      ? 'openrouter'
      : config?.provider === 'groq'
      ? 'groq'
      : config && config.provider !== 'gemini'
      ? 'local'
      : 'gemini';

  const [tab, setTab] = useState<TabType>(initialTab);
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [geminiModel, setGeminiModel] = useState(config?.provider === 'gemini' ? config.model : GEMINI_MODELS[0].id);
  const [openrouterModel, setOpenrouterModel] = useState(config?.provider === 'openrouter' ? config.model : OPENROUTER_MODELS[0].id);
  const [groqModel, setGroqModel] = useState(config?.provider === 'groq' ? config.model : GROQ_MODELS[0].id);

  const [localBackend, setLocalBackend] = useState<ProviderType>(
    config && !['gemini', 'openrouter', 'groq'].includes(config.provider) ? config.provider : 'ollama'
  );
  const [localEndpoint, setLocalEndpoint] = useState(config?.endpoint || config?.baseUrl || 'http://localhost:11434');
  const [localModel, setLocalModel] = useState(
    config && !['gemini', 'openrouter', 'groq'].includes(config.provider) ? config.model : 'llama3.3'
  );

  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      if (config.provider === 'gemini') {
        setTab('gemini');
        setApiKey(config.apiKey || '');
        setGeminiModel(config.model);
      } else if (config.provider === 'openrouter') {
        setTab('openrouter');
        setApiKey(config.apiKey || '');
        setOpenrouterModel(config.model);
      } else if (config.provider === 'groq') {
        setTab('groq');
        setApiKey(config.apiKey || '');
        setGroqModel(config.model);
      } else {
        setTab('local');
        setLocalBackend(config.provider);
        setLocalEndpoint(config.endpoint || config.baseUrl || PROVIDER_DEFAULT_ENDPOINTS[config.provider] || '');
        setLocalModel(config.model);
      }
    }
  }, [config]);

  const handleLocalBackendChange = (backend: ProviderType) => {
    setLocalBackend(backend);
    const info = LOCAL_BACKENDS.find((b) => b.id === backend);
    if (info) {
      setLocalEndpoint(info.defaultEndpoint);
      setLocalModel(info.defaultModel);
    }
  };

  const handleSave = async () => {
    setIsValidating(true);
    setError(null);

    try {
      if (tab === 'gemini') {
        if (!apiKey.trim()) {
          setError(idioma === 'galego' ? 'Introduce unha API Key.' : 'Introduce una API Key.');
          setIsValidating(false);
          return;
        }
        const testConfig = { provider: 'gemini' as ProviderType, apiKey: apiKey.trim(), model: geminiModel };
        const ok = await testApiConnection(testConfig);
        if (!ok) throw new Error(idioma === 'galego' ? 'Non se puido validar a API Key de Gemini.' : 'No se pudo validar la API Key de Gemini.');
        setConfig(testConfig);
      } else if (tab === 'openrouter') {
        if (!apiKey.trim()) {
          setError(idioma === 'galego' ? 'Introduce a API Key de OpenRouter.' : 'Introduce la API Key de OpenRouter.');
          setIsValidating(false);
          return;
        }
        const testConfig = { provider: 'openrouter' as ProviderType, apiKey: apiKey.trim(), model: openrouterModel, endpoint: PROVIDER_DEFAULT_ENDPOINTS.openrouter };
        const ok = await testApiConnection(testConfig);
        if (!ok) throw new Error(idioma === 'galego' ? 'Non se puido conectar con OpenRouter. Revisa a clave.' : 'No se pudo conectar con OpenRouter. Revisa la clave.');
        setConfig(testConfig);
      } else if (tab === 'groq') {
        if (!apiKey.trim()) {
          setError(idioma === 'galego' ? 'Introduce a API Key de Groq.' : 'Introduce la API Key de Groq.');
          setIsValidating(false);
          return;
        }
        const testConfig = { provider: 'groq' as ProviderType, apiKey: apiKey.trim(), model: groqModel, endpoint: PROVIDER_DEFAULT_ENDPOINTS.groq };
        const ok = await testApiConnection(testConfig);
        if (!ok) throw new Error(idioma === 'galego' ? 'Non se puido conectar con Groq. Revisa a clave.' : 'No se pudo conectar con Groq. Revisa la clave.');
        setConfig(testConfig);
      } else {
        if (!localEndpoint.trim()) {
          setError(idioma === 'galego' ? 'Introduce a URL do endpoint.' : 'Introduce la URL del endpoint.');
          setIsValidating(false);
          return;
        }
        const testConfig = { provider: localBackend, model: localModel, endpoint: localEndpoint.trim(), apiKey: apiKey.trim() || undefined };
        const ok = await testApiConnection(testConfig);
        if (!ok) throw new Error(idioma === 'galego' ? `Non se puido conectar con ${localBackend} en ${localEndpoint}.` : `No se pudo conectar con ${localBackend} en ${localEndpoint}. ¿Está el servidor en ejecución?`);
        setConfig(testConfig);
      }
      handleClose();
    } catch (e: any) {
      setError(formatApiError(e, idioma));
    } finally {
      setIsValidating(false);
    }
  };

  const isConfigured = !!config;

  return (
    <Dialog.Root open={isModalOpen !== undefined ? isModalOpen : !isConfigured} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content" style={{ maxWidth: '34rem' }}>
          {/* Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <Dialog.Title style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key style={{ width: 18, height: 18, color: 'var(--color-accent)' }} />
                {t('api_modal_title', idioma)}
              </Dialog.Title>
              <button onClick={handleClose} style={{ padding: 6, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <Dialog.Description style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {t('api_modal_desc', idioma)}
            </Dialog.Description>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto' }}>
            <button
              onClick={() => { setTab('gemini'); setError(null); }}
              style={{
                flex: 1, padding: '0.625rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: tab === 'gemini' ? 'white' : 'transparent',
                color: tab === 'gemini' ? 'var(--color-accent)' : '#64748b',
                borderBottom: tab === 'gemini' ? '2px solid var(--color-accent)' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <Globe2 style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {t('api_tab_gemini', idioma)}
            </button>
            <button
              onClick={() => { setTab('openrouter'); setError(null); }}
              style={{
                flex: 1, padding: '0.625rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: tab === 'openrouter' ? 'white' : 'transparent',
                color: tab === 'openrouter' ? 'var(--color-accent)' : '#64748b',
                borderBottom: tab === 'openrouter' ? '2px solid var(--color-accent)' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <Server style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {t('api_tab_openrouter', idioma)}
            </button>
            <button
              onClick={() => { setTab('groq'); setError(null); }}
              style={{
                flex: 1, padding: '0.625rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: tab === 'groq' ? 'white' : 'transparent',
                color: tab === 'groq' ? 'var(--color-accent)' : '#64748b',
                borderBottom: tab === 'groq' ? '2px solid var(--color-accent)' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <Zap style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {t('api_tab_groq', idioma)}
            </button>
            <button
              onClick={() => { setTab('local'); setError(null); }}
              style={{
                flex: 1, padding: '0.625rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: tab === 'local' ? 'white' : 'transparent',
                color: tab === 'local' ? 'var(--color-accent)' : '#64748b',
                borderBottom: tab === 'local' ? '2px solid var(--color-accent)' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <Server style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {t('api_tab_local', idioma)}
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', maxHeight: '68vh' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck style={{ width: 16, height: 16, color: '#059669', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.6875rem', color: '#065f46', lineHeight: 1.4 }}>
                {t('api_secure_note', idioma)}
              </p>
            </div>

            {/* TAB: GEMINI */}
            {tab === 'gemini' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="label">{t('api_key_label', idioma)} (Google AI Studio)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                      className="input-field"
                      placeholder="AIzaSy..."
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <Key
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8', cursor: 'pointer' }}
                      onClick={() => setShowKey(!showKey)}
                    />
                  </div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 style={{ width: 13, height: 13, color: '#16a34a', flexShrink: 0 }} />
                  <span>{idioma === 'galego' ? 'Modelos dispoñibles no Free Tier de Google AI Studio (sen tarxeta)' : 'Modelos disponibles en el Free Tier de Google AI Studio (sin tarjeta)'}</span>
                </div>
                <ModelPicker
                  provider="gemini"
                  selectedModel={geminiModel}
                  onSelectModel={setGeminiModel}
                  defaultModels={GEMINI_MODELS}
                  apiKey={apiKey}
                  idioma={idioma}
                />
                <div style={{ paddingTop: '0.25rem' }}>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textDecoration: 'none' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', display: 'block' }}>Obter API Key de Google AI Studio</span>
                      <span style={{ fontSize: '0.625rem', color: '#64748b' }}>Cota gratuíta con Google Search Grounding</span>
                    </div>
                    <ExternalLink style={{ width: 14, height: 14, color: '#94a3b8' }} />
                  </a>
                </div>
              </div>
            )}

            {/* TAB: OPENROUTER */}
            {tab === 'openrouter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="label">{t('api_key_label', idioma)} (OpenRouter)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                      className="input-field"
                      placeholder="sk-or-v1-..."
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <Key
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8', cursor: 'pointer' }}
                      onClick={() => setShowKey(!showKey)}
                    />
                  </div>
                </div>
                <ModelPicker
                  provider="openrouter"
                  selectedModel={openrouterModel}
                  onSelectModel={setOpenrouterModel}
                  defaultModels={OPENROUTER_MODELS}
                  apiKey={apiKey}
                  idioma={idioma}
                />
                <div style={{ paddingTop: '0.25rem' }}>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textDecoration: 'none' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', display: 'block' }}>OpenRouter.ai</span>
                      <span style={{ fontSize: '0.625rem', color: '#64748b' }}>Acceso a centos de modelos (Llama, DeepSeek, Claude, Mistral)</span>
                    </div>
                    <ExternalLink style={{ width: 14, height: 14, color: '#94a3b8' }} />
                  </a>
                </div>
              </div>
            )}

            {/* TAB: GROQ */}
            {tab === 'groq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="label">{t('api_key_label', idioma)} (Groq Cloud)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                      className="input-field"
                      placeholder="gsk_..."
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <Key
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8', cursor: 'pointer' }}
                      onClick={() => setShowKey(!showKey)}
                    />
                  </div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 style={{ width: 13, height: 13, color: '#16a34a', flexShrink: 0 }} />
                  <span>{idioma === 'galego' ? 'Inferencia gratuíta de alta velocidade (Llama 3.3, Mixtral)' : 'Inferencia gratuita de alta velocidad (Llama 3.3, Mixtral)'}</span>
                </div>
                <ModelPicker
                  provider="groq"
                  selectedModel={groqModel}
                  onSelectModel={setGroqModel}
                  defaultModels={GROQ_MODELS}
                  apiKey={apiKey}
                  idioma={idioma}
                />
                <div style={{ paddingTop: '0.25rem' }}>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textDecoration: 'none' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', display: 'block' }}>Groq Cloud Console</span>
                      <span style={{ fontSize: '0.625rem', color: '#64748b' }}>Inferencia ultrarrápida gratuíta con Llama 3.3</span>
                    </div>
                    <ExternalLink style={{ width: 14, height: 14, color: '#94a3b8' }} />
                  </a>
                </div>
              </div>
            )}

            {/* TAB: LOCAL / PROPIO */}
            {tab === 'local' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="label">Tipo de Servidor / Backend</label>
                  <select
                    value={localBackend}
                    onChange={(e) => handleLocalBackendChange(e.target.value as ProviderType)}
                    className="select-field"
                  >
                    {LOCAL_BACKENDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t('api_endpoint_label', idioma)}</label>
                  <input
                    type="text"
                    value={localEndpoint}
                    onChange={(e) => { setLocalEndpoint(e.target.value); setError(null); }}
                    className="input-field"
                    style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
                    placeholder="http://localhost:11434"
                  />
                </div>
                <ModelPicker
                  provider={localBackend}
                  selectedModel={localModel}
                  onSelectModel={setLocalModel}
                  defaultModels={LOCAL_DEFAULT_MODELS[localBackend] || []}
                  endpoint={localEndpoint}
                  apiKey={apiKey}
                  idioma={idioma}
                />
                <div>
                  <label className="label">{t('api_key_label', idioma)} (Opcional se o servidor a require)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="input-field"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            )}

            {error && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.75rem', marginLeft: 4 }}>{error}</p>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#fafbfc', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={isValidating || (['gemini', 'openrouter', 'groq'].includes(tab) && !apiKey.trim())}
              className="btn-primary"
              style={{ width: '100%', padding: '0.625rem' }}
            >
              {isValidating && <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />}
              {isValidating ? t('api_validating', idioma) : t('api_save_btn', idioma)}
            </button>
            {isConfigured && (
              <button
                onClick={() => { setConfig(null); setApiKey(''); handleClose(); }}
                style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', padding: '0.25rem' }}
              >
                {t('api_delete_btn', idioma)}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
