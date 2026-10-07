import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useApiConfig } from '../context/ApiConfigContext';
import { X, Key, ExternalLink, ShieldCheck, Loader2, Server, Globe2, RefreshCw, Search, CheckCircle2, Plug, AlertTriangle } from 'lucide-react';
import { testApiConnection, fetchAvailableModels, formatApiError, PROVIDER_DEFAULT_ENDPOINTS, PROVEEDORES_LOCALES, origenDe, type ModelOption } from '../lib/apiService';
import { t } from '../lib/i18n';
import type { Provider, AppIdioma } from '../types';

/** Servicios con API compatible con OpenAI. La URL decide a quién se envía la clave. */
const SERVICIOS_COMPATIBLES = [
  { id: 'openai',     nombre: 'OpenAI',                  endpoint: 'https://api.openai.com/v1',       claves: 'https://platform.openai.com/api-keys' },
  { id: 'mistral',    nombre: 'Mistral AI (UE)',         endpoint: 'https://api.mistral.ai/v1',       claves: 'https://console.mistral.ai/api-keys' },
  { id: 'openrouter', nombre: 'OpenRouter',              endpoint: 'https://openrouter.ai/api/v1',    claves: 'https://openrouter.ai/keys' },
  { id: 'deepseek',   nombre: 'DeepSeek',                endpoint: 'https://api.deepseek.com/v1',     claves: 'https://platform.deepseek.com/api_keys' },
  { id: 'groq',       nombre: 'Groq',                    endpoint: 'https://api.groq.com/openai/v1',  claves: 'https://console.groq.com/keys' },
  { id: 'otro',       nombre: 'Otro servicio (URL propia)', endpoint: '',                             claves: '' },
];

const LOCAL_BACKENDS = [
  { id: 'ollama' as Provider,   name: 'Ollama',    defaultEndpoint: PROVIDER_DEFAULT_ENDPOINTS.ollama },
  { id: 'llamacpp' as Provider, name: 'llama.cpp', defaultEndpoint: PROVIDER_DEFAULT_ENDPOINTS.llamacpp },
  { id: 'vllm' as Provider,     name: 'vLLM',      defaultEndpoint: PROVIDER_DEFAULT_ENDPOINTS.vllm },
];

/** Longitud mínima de una clave de Gemini antes de consultar la lista (evita peticiones mientras se escribe). */
const LONGITUD_MINIMA_CLAVE_GEMINI = 30;

interface ModelPickerProps {
  provider: Provider;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  apiKey?: string;
  endpoint?: string;
  idioma: AppIdioma;
}

type EstadoLista = 'esperando' | 'cargando' | 'cargada' | 'vacia';

/**
 * Selector de modelo sin lista fija: solo muestra los modelos que devuelve el proveedor
 * con la clave o el servidor indicados. La lista se pide sola al introducir la clave o la URL.
 */
const ModelPicker: React.FC<ModelPickerProps> = ({ provider, selectedModel, onSelectModel, apiKey, endpoint, idioma }) => {
  const gl = idioma === 'galego';
  const esGemini = provider === 'gemini';
  const [models, setModels] = useState<ModelOption[]>([]);
  const [estado, setEstado] = useState<EstadoLista>('esperando');
  const [aviso, setAviso] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [recarga, setRecarga] = useState(0);

  // Hay datos suficientes para pedir la lista: clave en Gemini; URL válida en el resto.
  const listo = esGemini ? (apiKey?.trim().length ?? 0) >= LONGITUD_MINIMA_CLAVE_GEMINI : Boolean(origenDe(endpoint || ''));

  // El modelo elegido se lee de una referencia para no repetir la petición al cambiarlo.
  const seleccionado = React.useRef(selectedModel);
  seleccionado.current = selectedModel;

  useEffect(() => {
    if (!listo) {
      setModels([]);
      setEstado('esperando');
      setAviso(null);
      return;
    }
    let vigente = true;
    setEstado('cargando');
    // Espera breve para no consultar en cada pulsación mientras se escribe la clave o la URL
    const temporizador = setTimeout(async () => {
      const lista = await fetchAvailableModels(provider, apiKey, endpoint);
      if (!vigente) return;
      setModels(lista);
      setEstado(lista.length > 0 ? 'cargada' : 'vacia');
      const actual = seleccionado.current;
      if (lista.length === 0) {
        setAviso(null);
      } else if (!actual) {
        onSelectModel(lista[0].id);
        setAviso(null);
      } else if (!lista.some((m) => m.id === actual) && (esGemini || !isCustomMode)) {
        onSelectModel(lista[0].id);
        setAviso(gl
          ? `O modelo gardado «${actual}» non figura entre os dispoñibles para esta configuración; seleccionouse «${lista[0].id}».`
          : `El modelo guardado «${actual}» no figura entre los disponibles para esta configuración; se ha seleccionado «${lista[0].id}».`);
      } else {
        setAviso(null);
      }
    }, 600);
    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, apiKey, endpoint, listo, recarga]);

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;
    const q = searchQuery.toLowerCase();
    return models.filter((m) =>
      m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || (m.description?.toLowerCase().includes(q) ?? false)
    );
  }, [models, searchQuery]);

  // Entrada manual: solo fuera de Gemini (servidores que no publican su lista de modelos)
  const permiteManual = !esGemini;
  const modoManual = permiteManual && (isCustomMode || estado === 'vacia');

  const explicacion = esGemini
    ? (gl
      ? 'A lista pídese a Google coa túa chave: só aparecen os modelos de texto que esa chave pode usar. Algúns poden non ter cota no nivel gratuíto; ao gardar compróbase a conexión co modelo elixido.'
      : 'La lista se pide a Google con tu clave: solo aparecen los modelos de texto que esa clave puede usar. Algunos pueden no tener cuota en el nivel gratuito; al guardar se comprueba la conexión con el modelo elegido.')
    : (gl
      ? 'A lista pídese ao servizo ou servidor indicado: só aparecen os modelos que este publica. Se non publica a lista, escribe o identificador exacto. Ao gardar compróbase a conexión.'
      : 'La lista se pide al servicio o servidor indicado: solo aparecen los modelos que publica. Si no publica la lista, escribe el identificador exacto. Al guardar se comprueba la conexión.');

  const textoEspera = esGemini
    ? (gl ? 'Introduce a túa chave para ver os modelos dispoñibles' : 'Introduce tu clave para ver los modelos disponibles')
    : (gl ? 'Indica a URL do servizo para ver os modelos dispoñibles' : 'Indica la URL del servicio para ver los modelos disponibles');

  const textoBoton = estado === 'cargando'
    ? t('api_models_loading', idioma)
    : PROVEEDORES_LOCALES.includes(provider) ? t('api_models_detect_local', idioma) : t('api_models_refresh', idioma);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
        <label className="label" style={{ marginBottom: 0 }}>{t('api_model_label', idioma)}</label>
        <button
          type="button"
          onClick={() => setRecarga((n) => n + 1)}
          disabled={!listo || estado === 'cargando'}
          style={{
            background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.6875rem', fontWeight: 600,
            cursor: !listo || estado === 'cargando' ? 'not-allowed' : 'pointer', opacity: listo ? 1 : 0.5,
            display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '2px 6px', borderRadius: '4px',
          }}
        >
          <RefreshCw style={{ width: 11, height: 11 }} className={estado === 'cargando' ? 'spin' : ''} />
          {textoBoton}
        </button>
      </div>

      {estado === 'cargada' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: '#059669' }}>
          <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0 }} />
          <span>{models.length} {t('api_models_synced', idioma)}</span>
        </div>
      )}
      {estado === 'vacia' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', fontSize: '0.6875rem', color: '#b45309', lineHeight: 1.4 }}>
          <AlertTriangle style={{ width: 12, height: 12, flexShrink: 0, marginTop: 1 }} />
          <span>
            {esGemini
              ? (gl ? 'Non se obtivo ningún modelo con esta chave. Revisa que sexa correcta.' : 'No se ha obtenido ningún modelo con esta clave. Revisa que sea correcta.')
              : (gl ? 'O servidor non devolveu a súa lista de modelos (ou non é accesible). Podes escribir o identificador do modelo.' : 'El servidor no ha devuelto su lista de modelos (o no es accesible). Puedes escribir el identificador del modelo.')}
          </span>
        </div>
      )}
      {aviso && (
        <div style={{ fontSize: '0.6875rem', color: '#b45309', lineHeight: 1.4 }}>{aviso}</div>
      )}

      {estado === 'cargada' && models.length > 5 && !modoManual && (
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('api_models_search_placeholder', idioma)}
            className="input-field"
            style={{ paddingLeft: '1.75rem', fontSize: '0.75rem', height: '1.875rem', marginBottom: '0.25rem', background: '#f8fafc' }}
          />
        </div>
      )}

      {modoManual ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="input-field"
            placeholder={gl ? 'Identificador do modelo (ex: qwen2.5:32b)' : 'Identificador del modelo (ej: qwen2.5:32b)'}
            style={{ fontFamily: 'monospace', fontSize: '0.8125rem', flex: 1 }}
          />
          {estado === 'cargada' && (
            <button type="button" onClick={() => setIsCustomMode(false)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', whiteSpace: 'nowrap' }}>
              {gl ? 'Ver lista' : 'Ver lista'}
            </button>
          )}
        </div>
      ) : (
        <select
          value={estado === 'cargada' ? selectedModel : ''}
          onChange={(e) => {
            if (e.target.value === '__custom__') setIsCustomMode(true);
            else onSelectModel(e.target.value);
          }}
          className="select-field"
          style={{ fontSize: '0.8125rem' }}
          disabled={estado !== 'cargada'}
        >
          {estado !== 'cargada' && (
            <option value="">{estado === 'cargando' ? t('api_models_loading', idioma) : textoEspera}</option>
          )}
          {estado === 'cargada' && filteredModels.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
          {estado === 'cargada' && filteredModels.length === 0 && (
            <option disabled value="">{gl ? 'Ningún modelo coincide coa busca' : 'Ningún modelo coincide con la búsqueda'}</option>
          )}
          {estado === 'cargada' && permiteManual && <option value="__custom__">✍️ {t('api_models_custom', idioma)}</option>}
        </select>
      )}

      <span style={{ fontSize: '0.625rem', color: '#64748b', lineHeight: 1.4 }}>{explicacion}</span>
    </div>
  );
};

interface ApiConfigModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  idioma?: AppIdioma;
}

type TabType = 'gemini' | 'compatible' | 'local';

const estiloPestana = (activa: boolean): React.CSSProperties => ({
  flex: 1, padding: '0.625rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
  background: activa ? 'white' : 'transparent',
  color: activa ? 'var(--color-accent)' : '#64748b',
  borderBottom: activa ? '2px solid var(--color-accent)' : '2px solid transparent',
  whiteSpace: 'nowrap',
});

/** Campo de clave con botón para mostrarla u ocultarla */
const CampoClave: React.FC<{
  valor: string;
  onCambio: (v: string) => void;
  placeholder: string;
  visible: boolean;
  onAlternar: () => void;
}> = ({ valor, onCambio, placeholder, visible, onAlternar }) => (
  <div style={{ position: 'relative' }}>
    <input
      type={visible ? 'text' : 'password'}
      value={valor}
      onChange={e => onCambio(e.target.value)}
      className="input-field"
      placeholder={placeholder}
      autoComplete="off"
      style={{ paddingRight: '2.5rem' }}
    />
    <Key
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8', cursor: 'pointer' }}
      onClick={onAlternar}
    />
  </div>
);

const tabDe = (p?: Provider): TabType =>
  p === 'gemini' || !p ? 'gemini' : p === 'compatible' ? 'compatible' : 'local';

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ open = false, onOpenChange, idioma = 'castellano' }) => {
  const { config, recordar: recordarGuardado, setConfig } = useApiConfig();
  const gl = idioma === 'galego';

  const [tab, setTab] = useState<TabType>(tabDe(config?.provider));

  // Una clave por pestaña: nunca se reutiliza la de otro proveedor.
  const [geminiKey, setGeminiKey] = useState(config?.provider === 'gemini' ? config.apiKey || '' : '');
  const [geminiModel, setGeminiModel] = useState(config?.provider === 'gemini' ? config.model : '');

  const [compatibleEndpoint, setCompatibleEndpoint] = useState(
    config?.provider === 'compatible' ? config.endpoint || PROVIDER_DEFAULT_ENDPOINTS.compatible : PROVIDER_DEFAULT_ENDPOINTS.compatible
  );
  const [compatibleKey, setCompatibleKey] = useState(config?.provider === 'compatible' ? config.apiKey || '' : '');
  // Origen al que pertenece la clave escrita: si cambia la URL de destino, la clave se borra.
  const [origenClaveCompatible, setOrigenClaveCompatible] = useState(origenDe(compatibleEndpoint));
  const [compatibleModel, setCompatibleModel] = useState(config?.provider === 'compatible' ? config.model : '');

  const configLocal = config && PROVEEDORES_LOCALES.includes(config.provider) ? config : null;
  const [localBackend, setLocalBackend] = useState<Provider>(configLocal ? configLocal.provider : 'ollama');
  const [localEndpoint, setLocalEndpoint] = useState(
    configLocal ? configLocal.endpoint || PROVIDER_DEFAULT_ENDPOINTS[configLocal.provider] : PROVIDER_DEFAULT_ENDPOINTS.ollama
  );
  const [localKey, setLocalKey] = useState(configLocal?.apiKey || '');
  const [localModel, setLocalModel] = useState(configLocal ? configLocal.model : '');

  const [recordar, setRecordar] = useState(recordarGuardado);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    setTab(tabDe(config.provider));
    setRecordar(recordarGuardado);
    if (config.provider === 'gemini') {
      setGeminiKey(config.apiKey || '');
      setGeminiModel(config.model);
    } else if (config.provider === 'compatible') {
      const endpoint = config.endpoint || PROVIDER_DEFAULT_ENDPOINTS.compatible;
      setCompatibleEndpoint(endpoint);
      setCompatibleKey(config.apiKey || '');
      setOrigenClaveCompatible(origenDe(endpoint));
      setCompatibleModel(config.model);
    } else {
      setLocalBackend(config.provider);
      setLocalEndpoint(config.endpoint || PROVIDER_DEFAULT_ENDPOINTS[config.provider]);
      setLocalKey(config.apiKey || '');
      setLocalModel(config.model);
    }
  }, [config, recordarGuardado]);

  const cambiarEndpointCompatible = (endpoint: string) => {
    setCompatibleEndpoint(endpoint);
    setError(null);
    if (origenDe(endpoint) !== origenClaveCompatible) {
      setCompatibleKey('');
      setOrigenClaveCompatible(origenDe(endpoint));
    }
  };

  const servicioCompatible = useMemo(
    () => SERVICIOS_COMPATIBLES.find(s => s.endpoint && origenDe(s.endpoint) === origenDe(compatibleEndpoint))
      ?? SERVICIOS_COMPATIBLES[SERVICIOS_COMPATIBLES.length - 1],
    [compatibleEndpoint]
  );

  const handleLocalBackendChange = (backend: Provider) => {
    setLocalBackend(backend);
    const info = LOCAL_BACKENDS.find(b => b.id === backend);
    if (info) {
      setLocalEndpoint(info.defaultEndpoint);
      setLocalModel('');
    }
  };

  const handleSave = async () => {
    setIsValidating(true);
    setError(null);

    try {
      if (tab === 'gemini') {
        if (!geminiKey.trim()) { setError(gl ? 'Introduce unha API Key.' : 'Introduce una API Key.'); return; }
        const testConfig = { provider: 'gemini' as Provider, apiKey: geminiKey.trim(), model: geminiModel };
        const ok = await testApiConnection(testConfig);
        if (!ok) throw new Error(gl ? 'Non se puido validar a API Key de Gemini.' : 'No se pudo validar la API Key de Gemini.');
        setConfig(testConfig, recordar);
      } else if (tab === 'compatible') {
        if (!origenDe(compatibleEndpoint)) { setError(gl ? 'Introduce unha URL válida (https://…/v1).' : 'Introduce una URL válida (https://…/v1).'); return; }
        if (!compatibleModel.trim()) { setError(gl ? 'Indica o identificador do modelo.' : 'Indica el identificador del modelo.'); return; }
        const testConfig = {
          provider: 'compatible' as Provider,
          endpoint: compatibleEndpoint.trim(),
          apiKey: compatibleKey.trim() || undefined,
          model: compatibleModel.trim(),
        };
        const ok = await testApiConnection(testConfig);
        if (!ok) throw new Error(gl
          ? 'Non se puido conectar. Revisa a URL, a clave e que o servizo admita chamadas desde o navegador (CORS).'
          : 'No se pudo conectar. Revisa la URL, la clave y que el servicio admita llamadas desde el navegador (CORS).');
        setConfig(testConfig, recordar);
      } else {
        if (!localEndpoint.trim()) { setError(gl ? 'Introduce a URL do endpoint.' : 'Introduce la URL del endpoint.'); return; }
        const testConfig = { provider: localBackend, model: localModel, endpoint: localEndpoint.trim(), apiKey: localKey.trim() || undefined };
        const ok = await testApiConnection(testConfig);
        if (!ok) throw new Error(gl
          ? `Non se puido conectar con ${localBackend} en ${localEndpoint}. Está o servidor en execución e admite esta orixe (OLLAMA_ORIGINS)?`
          : `No se pudo conectar con ${localBackend} en ${localEndpoint}. ¿Está el servidor en ejecución y admite este origen (OLLAMA_ORIGINS)?`);
        setConfig(testConfig, recordar);
      }
      onOpenChange?.(false);
    } catch (e) {
      setError(formatApiError(e, idioma));
    } finally {
      setIsValidating(false);
    }
  };

  const isConfigured = !!config;
  const guardarDeshabilitado = isValidating
    || (tab === 'gemini' && (!geminiKey.trim() || !geminiModel.trim()))
    || (tab === 'local' && !localModel.trim())
    || (tab === 'compatible' && (!compatibleEndpoint.trim() || !compatibleModel.trim()));

  const enlaceExterno = (href: string, texto: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textDecoration: 'none' }}
    >
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{texto}</span>
      <ExternalLink style={{ width: 14, height: 14, color: '#94a3b8' }} />
    </a>
  );

  const nota = (texto: string) => (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', color: '#475569', lineHeight: 1.4 }}>
      {texto}
    </div>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
              {onOpenChange && (
                <button onClick={() => onOpenChange(false)} style={{ padding: 6, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%' }}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              )}
            </div>
            <Dialog.Description style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {t('api_modal_desc', idioma)}
            </Dialog.Description>
          </div>

          {/* Pestañas */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto' }}>
            <button onClick={() => { setTab('gemini'); setError(null); }} style={estiloPestana(tab === 'gemini')}>
              <Globe2 style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {t('api_tab_gemini', idioma)}
            </button>
            <button onClick={() => { setTab('compatible'); setError(null); }} style={estiloPestana(tab === 'compatible')}>
              <Plug style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {t('api_tab_compatible', idioma)}
            </button>
            <button onClick={() => { setTab('local'); setError(null); }} style={estiloPestana(tab === 'local')}>
              <Server style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {t('api_tab_local', idioma)}
            </button>
          </div>

          {/* Cuerpo */}
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', maxHeight: '68vh' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck style={{ width: 16, height: 16, color: '#059669', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.6875rem', color: '#065f46', lineHeight: 1.4 }}>
                {t('api_secure_note', idioma)}
              </p>
            </div>

            {tab === 'gemini' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="label">{t('api_key_label', idioma)} (Google AI Studio)</label>
                  <CampoClave
                    valor={geminiKey}
                    onCambio={v => { setGeminiKey(v); setError(null); }}
                    placeholder="AIzaSy..."
                    visible={showKey}
                    onAlternar={() => setShowKey(!showKey)}
                  />
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', color: '#92400e', display: 'flex', gap: '0.375rem', lineHeight: 1.4 }}>
                  <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1 }} />
                  <span>{t('api_gemini_free_notice', idioma)}</span>
                </div>
                <ModelPicker
                  provider="gemini"
                  selectedModel={geminiModel}
                  onSelectModel={setGeminiModel}
                  apiKey={geminiKey}
                  idioma={idioma}
                />
                {enlaceExterno('https://aistudio.google.com/app/apikey', gl ? 'Obter chave API en Google AI Studio' : 'Obtener clave API en Google AI Studio')}
              </div>
            )}

            {tab === 'compatible' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="label">{gl ? 'Servizo' : 'Servicio'}</label>
                  <select
                    value={servicioCompatible.id}
                    onChange={e => {
                      const servicio = SERVICIOS_COMPATIBLES.find(s => s.id === e.target.value);
                      if (servicio) cambiarEndpointCompatible(servicio.endpoint);
                    }}
                    className="select-field"
                  >
                    {SERVICIOS_COMPATIBLES.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('api_endpoint_label', idioma)}</label>
                  <input
                    type="text"
                    value={compatibleEndpoint}
                    onChange={e => cambiarEndpointCompatible(e.target.value)}
                    className="input-field"
                    style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
                    placeholder="https://…/v1"
                  />
                </div>
                <div>
                  <label className="label">
                    {t('api_key_label', idioma)}{' '}
                    {origenDe(compatibleEndpoint) && (
                      <span style={{ fontWeight: 400, color: '#64748b' }}>
                        ({gl ? 'só se envía a' : 'solo se envía a'} {origenDe(compatibleEndpoint)})
                      </span>
                    )}
                  </label>
                  <CampoClave
                    valor={compatibleKey}
                    onCambio={v => { setCompatibleKey(v); setOrigenClaveCompatible(origenDe(compatibleEndpoint)); setError(null); }}
                    placeholder="sk-..."
                    visible={showKey}
                    onAlternar={() => setShowKey(!showKey)}
                  />
                </div>
                <ModelPicker
                  key={origenDe(compatibleEndpoint)}
                  provider="compatible"
                  selectedModel={compatibleModel}
                  onSelectModel={setCompatibleModel}
                  apiKey={compatibleKey}
                  endpoint={compatibleEndpoint}
                  idioma={idioma}
                />
                {nota(t('api_compatible_note', idioma))}
                {servicioCompatible.claves && enlaceExterno(
                  servicioCompatible.claves,
                  gl ? `Obter chave en ${servicioCompatible.nombre}` : `Obtener clave en ${servicioCompatible.nombre}`,
                )}
              </div>
            )}

            {tab === 'local' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="label">{gl ? 'Tipo de servidor' : 'Tipo de servidor'}</label>
                  <select
                    value={localBackend}
                    onChange={e => handleLocalBackendChange(e.target.value as Provider)}
                    className="select-field"
                  >
                    {LOCAL_BACKENDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('api_endpoint_label', idioma)}</label>
                  <input
                    type="text"
                    value={localEndpoint}
                    onChange={e => { setLocalEndpoint(e.target.value); setError(null); }}
                    className="input-field"
                    style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
                    placeholder={PROVIDER_DEFAULT_ENDPOINTS.ollama}
                  />
                </div>
                <ModelPicker
                  key={localBackend}
                  provider={localBackend}
                  selectedModel={localModel}
                  onSelectModel={setLocalModel}
                  endpoint={localEndpoint}
                  apiKey={localKey}
                  idioma={idioma}
                />
                <div>
                  <label className="label">
                    {t('api_key_label', idioma)} ({gl ? 'opcional se o servidor a require' : 'opcional si el servidor la requiere'})
                  </label>
                  <input
                    type="password"
                    value={localKey}
                    onChange={e => setLocalKey(e.target.value)}
                    className="input-field"
                    autoComplete="off"
                    placeholder="Opcional"
                  />
                </div>
                {nota(t('api_local_note', idioma))}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={recordar} onChange={e => setRecordar(e.target.checked)} style={{ marginTop: 2 }} />
              <span>{t('api_remember_key', idioma)}</span>
            </label>

            {error && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.75rem', marginLeft: 4 }}>{error}</p>
            )}
          </div>

          {/* Pie */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#fafbfc', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={guardarDeshabilitado}
              className="btn-primary"
              style={{ width: '100%', padding: '0.625rem' }}
            >
              {isValidating && <Loader2 style={{ width: 15, height: 15 }} className="spin" />}
              {isValidating ? t('api_validating', idioma) : t('api_save_btn', idioma)}
            </button>
            {isConfigured && (
              <button
                onClick={() => {
                  setConfig(null, false);
                  setGeminiKey(''); setCompatibleKey(''); setLocalKey('');
                  onOpenChange?.(false);
                }}
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
