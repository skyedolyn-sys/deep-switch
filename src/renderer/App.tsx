import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProviderCard } from './components/ProviderCard';
import { ProviderDetail } from './components/ProviderDetail';
import { PresetSelector } from './components/PresetSelector';
import { BackgroundGrid } from './components/BackgroundGrid';
import { Sparkle } from './components/Sparkle';

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  apiFormat: 'openai' | 'anthropic';
  thinkingEnabled: boolean;
  reasoningEffort: 'high' | 'max';
  createdAt: string;
  updatedAt: string;
}

export interface ProviderPreset {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  vendor: string;
  apiFormat: 'openai' | 'anthropic';
  thinkingEnabled: boolean;
  reasoningEffort: 'high' | 'max';
  description: string;
  descriptionEn: string;
  hint?: string;
  hintEn?: string;
  platform: string;
  platformEn: string;
  cardSuffix?: string;
  cardSuffixEn?: string;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; latencyMs: number; error?: string }>>({});
  const [deepCodePath, setDeepCodePath] = useState<{ path: string; exists: boolean } | null>(null);

  const api = window.deepSwitch;

  const refresh = useCallback(async () => {
    const [pList, active, dcPath] = await Promise.all([
      api.listProviders(),
      api.getActiveProvider(),
      api.getDeepCodeConfigPath(),
    ]);
    setProviders(pList);
    setActiveId(active?.id ?? null);
    setDeepCodePath(dcPath);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Sync preferred language from backend on mount
  useEffect(() => {
    api.getSettings().then((s) => {
      const lang = s?.preferredLanguage;
      if (lang === 'zh' || lang === 'en') {
        void i18n.changeLanguage(lang);
      } else {
        const systemLang = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        void i18n.changeLanguage(systemLang);
      }
    });
  }, [api, i18n]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  /** Apply = set active AND write to ~/.deepcode/settings.json in one step. */
  const handleApply = async (id: string, full?: Provider) => {
    const resolved = full ?? providers.find((x) => x.id === id);
    if (!resolved) return;
    const fullProvider = resolved.apiKey === '••••••••' || !resolved.apiKey
      ? await api.getProvider(id)
      : resolved;
    if (!fullProvider) return;
    const result = await api.applyProvider(fullProvider);
    setActiveId(id);
    await refresh();
    const env = result?.env ?? {};
    flash(t('toast.providerSwitched', { name: resolved.name, baseUrl: env.BASE_URL, model: env.MODEL }));
  };

  const handleAddFromPreset = async (
    preset: ProviderPreset,
    apiKey: string,
    extras?: { name: string; baseUrl: string; model: string }
  ) => {
    const saved = await api.saveProvider({
      name: extras?.name ?? preset.name,
      baseUrl: extras?.baseUrl ?? preset.baseUrl,
      apiKey,
      model: extras?.model ?? preset.model,
      apiFormat: preset.apiFormat,
      thinkingEnabled: preset.thinkingEnabled,
      reasoningEffort: preset.reasoningEffort,
    });
    await refresh();
    setShowPresetSelector(false);
    await handleApply(saved.id, saved);
    void handleTest(saved.id);
  };

  const handleTest = async (id: string) => {
    setTestResults((prev) => ({ ...prev, [id]: { status: 'testing', latencyMs: 0 } }));
    const result = await api.testProvider(id);
    setTestResults((prev) => ({
      ...prev,
      [id]: {
        status: result.ok ? 'ok' : 'error',
        latencyMs: result.latencyMs,
        error: result.error,
      },
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dialog.deleteProvider'))) return;
    await api.deleteProvider(id);
    await refresh();
  };

  const handleDetect = async () => {
    const current = await api.detectCurrentConfig();
    if (!current) {
      alert(t('dialog.noConfigFound'));
      return;
    }
    const matched = providers.find(
      (p) =>
        p.baseUrl === current.baseUrl &&
        p.model === current.model &&
        (current.apiKey.length === 0 || p.apiKey === '••••••••' || true)
    );
    if (matched) {
      await handleApply(matched.id);
      flash(t('toast.configDetected'));
    } else {
      const saved = await api.saveProvider({
        name: `Detected (${current.model})`,
        baseUrl: current.baseUrl,
        apiKey: current.apiKey,
        model: current.model,
        apiFormat: 'openai',
        thinkingEnabled: current.thinkingEnabled,
        reasoningEffort: current.reasoningEffort,
      });
      await handleApply(saved.id);
      flash(t('toast.configImported'));
    }
  };

  const handleSaveProviderDetail = async (data: any) => {
    await api.saveProvider(data);
    setSelectedProviderId(null);
    await refresh();
    if (data.id === activeId) {
      const full = await api.getProvider(data.id);
      if (full) await api.applyProvider(full);
    }
  };

  const handleModelPicked = async (id: string, model: string) => {
    const full = await api.getProvider(id);
    if (!full) return;
    const updated = { ...full, model };
    const saved = await api.saveProvider(updated);
    await refresh();
    if (saved.id === activeId) {
      await api.applyProvider(saved);
      flash(t('toast.modelUpdatedActive', { name: saved.name, model }));
    } else {
      flash(t('toast.modelUpdated', { model }));
    }
  };

  const handleToggleThinking = async (id: string, enabled: boolean) => {
    const full = await api.getProvider(id);
    if (!full) return;
    const updated = { ...full, thinkingEnabled: enabled };
    const saved = await api.saveProvider(updated);
    await refresh();
    if (saved.id === activeId) {
      await api.applyProvider(saved);
      flash(enabled ? t('toast.thinkingEnabled') : t('toast.thinkingDisabled'));
    }
  };

  const handleSetEffort = async (id: string, effort: 'high' | 'max') => {
    const full = await api.getProvider(id);
    if (!full) return;
    const updated = { ...full, reasoningEffort: effort };
    const saved = await api.saveProvider(updated);
    await refresh();
    if (saved.id === activeId) {
      await api.applyProvider(saved);
      flash(t('toast.effortSet', { effort }));
    }
  };

  const handleDeleteFromDetail = async (id: string) => {
    await api.deleteProvider(id);
    setSelectedProviderId(null);
    await refresh();
  };

  const selectedProvider = selectedProviderId
    ? providers.find((p) => p.id === selectedProviderId)
    : undefined;

  const activeProvider = providers.find((p) => p.id === activeId);

  return (
    <div className="app-shell">
      <div className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-container">
            <div className="sidebar-logo">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
              </svg>
            </div>
            <span className="sidebar-title">{t('appName')}</span>
            <span className="sidebar-tag">Switch</span>
          </div>
        </div>
        <button className="sidebar-add-btn" onClick={() => setShowPresetSelector(true)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>{t('sidebar.addProvider')}</span>
        </button>

        <div className="sidebar-section-label">{t('settings.title')}</div>
        <div className="sidebar-setting-row">
          <span className="sidebar-setting-key">{t('settings.language')}</span>
          <select
            className="sidebar-setting-select"
            value={i18n.language.startsWith('zh') ? 'zh' : 'en'}
            onChange={async (e) => {
              const lang = e.target.value as 'zh' | 'en';
              await i18n.changeLanguage(lang);
              await api.saveSettings({ preferredLanguage: lang });
            }}
          >
            <option value="zh">{t('settings.zh')}</option>
            <option value="en">{t('settings.en')}</option>
          </select>
        </div>

        <div className="sidebar-section-label">Active Profile</div>
        <div className="sidebar-env-card">
          {activeProvider ? (
            <>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">{t('sidebar.active')}</span>
                <span className="sidebar-env-val" title={activeProvider.name}>{activeProvider.name}</span>
              </div>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">{t('sidebar.baseUrl')}</span>
                <span className="sidebar-env-val mono" title={activeProvider.baseUrl}>{activeProvider.baseUrl}</span>
              </div>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">{t('sidebar.model')}</span>
                <span className="sidebar-env-val mono" title={activeProvider.model}>{activeProvider.model}</span>
              </div>
            </>
          ) : (
            <div className="sidebar-env-empty">
              {t('sidebar.noActive')}
            </div>
          )}
        </div>

        {deepCodePath && (
          <div className="sidebar-config-card">
            <div className="sidebar-config-card-header">
              <span className="sidebar-config-card-title">{t('sidebar.configPath')}</span>
              <span className={`sidebar-config-card-badge ${deepCodePath.exists ? 'ok' : 'missing'}`}>
                {deepCodePath.exists ? t('sidebar.configFound') : t('sidebar.configMissing')}
              </span>
            </div>
            <div className="sidebar-config-card-path mono" title={deepCodePath.path}>
              {deepCodePath.path}
            </div>
            {!deepCodePath.exists && (
              <button
                className="sidebar-config-card-action"
                onClick={async () => {
                  await api.ensureDeepCodeConfig();
                  await refresh();
                  flash(t('toast.configCreated'));
                }}
              >
                {t('sidebar.createConfigFile')}
              </button>
            )}
          </div>
        )}

        <button className="sidebar-detect-btn" onClick={handleDetect}>
          {t('sidebar.detectCurrentConfig')}
        </button>

        <div className="sidebar-spacer" />
        <div className="sidebar-foot">{t('version')}</div>
      </div>

      <div className="app-main">
        <BackgroundGrid />
        <Sparkle />
        {selectedProvider ? (
          <ProviderDetail
            provider={selectedProvider}
            onSave={handleSaveProviderDetail}
            onDelete={handleDeleteFromDetail}
            onBack={() => setSelectedProviderId(null)}
            onTest={() => handleTest(selectedProvider.id)}
            testResult={testResults[selectedProvider.id]}
          />
        ) : (
          <div className="provider-list-page">
            <div className="page-header">
              <div className="page-header-left">
                <h2>{t('providerList.title')}</h2>
                <span className="page-hint">{t('providerList.hint')}</span>
              </div>
              <span className="sidebar-config-card-badge ok">
                {t('providerList.providerCount', { count: providers.length })}
              </span>
            </div>

            <div className="provider-grid">
              {providers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔌</div>
                  <p>{t('providerList.empty.title')}</p>
                  <span>{t('providerList.empty.hint')}</span>
                </div>
              ) : (
                providers.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    isActive={p.id === activeId}
                    testResult={testResults[p.id]}
                    onApply={() => handleApply(p.id)}
                    onSettings={() => setSelectedProviderId(p.id)}
                    onTest={() => handleTest(p.id)}
                    onDelete={() => handleDelete(p.id)}
                    onModelPicked={(model) => handleModelPicked(p.id, model)}
                    onToggleThinking={(enabled) => handleToggleThinking(p.id, enabled)}
                    onSetEffort={(effort) => handleSetEffort(p.id, effort)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {showPresetSelector && (
          <PresetSelector onAdd={handleAddFromPreset} onClose={() => setShowPresetSelector(false)} />
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

function guessVendorFromUrl(baseUrl: string): string {
  const url = baseUrl.toLowerCase();
  if (url.includes('deepseek')) return 'DeepSeek';
  if (url.includes('openai')) return 'OpenAI';
  if (url.includes('moonshot') || url.includes('kimi')) return 'Moonshot (Kimi)';
  if (url.includes('bigmodel') || url.includes('z.ai')) return 'Zhipu (GLM)';
  if (url.includes('minimax') || url.includes('minimaxi')) return 'MiniMax';
  if (url.includes('volces')) return 'ByteDance (Doubao)';
  if (url.includes('siliconflow')) return 'SiliconFlow';
  if (url.includes('openrouter')) return 'OpenRouter';
  if (url.includes('groq')) return 'Groq';
  return 'Custom';
}
