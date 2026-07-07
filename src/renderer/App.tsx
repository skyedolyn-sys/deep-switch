import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProviderCard } from './components/ProviderCard';
import { ProviderDetail } from './components/ProviderDetail';
import { PresetSelector } from './components/PresetSelector';

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
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
          <div className="sidebar-logo">
            <img src="/icons/deepseek-sidebar.png" width="32" height="32" alt={t('appName')} />
          </div>
          <span className="sidebar-title">{t('appName')}</span>
        </div>
        <button className="sidebar-add-btn" onClick={() => setShowPresetSelector(true)}>
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

        <div className="sidebar-section-label">{t('sidebar.deepCodeConfig')}</div>
        <div className="sidebar-env-card">
          {activeProvider ? (
            <>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">{t('sidebar.active')}</span>
                <span className="sidebar-env-val" title={activeProvider.name}>{activeProvider.name}</span>
              </div>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">{t('sidebar.baseUrl')}</span>
                <span className="sidebar-env-val mono">{activeProvider.baseUrl}</span>
              </div>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">{t('sidebar.model')}</span>
                <span className="sidebar-env-val mono">{activeProvider.model}</span>
              </div>
            </>
          ) : (
            <div className="sidebar-env-empty">
              {t('sidebar.noActive')}
            </div>
          )}
        </div>

        {deepCodePath && (
          <div className={`sidebar-config-card ${deepCodePath.exists ? 'ok' : 'missing'}`}>
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
              <h2>{t('providerList.title')}</h2>
              <span className="page-hint">{t('providerList.hint')}</span>
            </div>

            <div className="provider-grid">
              {providers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔌</div>
                  <p>{t('providerList.empty.title')}</p>
                  <span>{t('providerList.empty.hint')}</span>
                </div>
              ) : (
                (() => {
                  const grouped: Record<string, Provider[]> = {};
                  providers.forEach((p) => {
                    const v = guessVendorFromUrl(p.baseUrl);
                    if (!grouped[v]) grouped[v] = [];
                    grouped[v].push(p);
                  });
                  return Object.entries(grouped).map(([vendor, group]) => (
                    <div key={vendor} className="vendor-group">
                      <div className="vendor-group-header">{vendor}</div>
                      {group.map((p) => (
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
                      ))}
                    </div>
                  ));
                })()
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
