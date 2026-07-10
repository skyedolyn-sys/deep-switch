import { useEffect, useState, useCallback } from 'react';
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
  /** Public API key / pricing page for this vendor — shown in the
   *  "Add Provider" preset card as a clickable link. Optional because
   *  the custom-blank preset has none. */
  homepageUrl?: string;
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
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
        (current.apiKey.length === 0 || p.apiKey === '••••••••')
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
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Deep Switch">
                {/* Two stacked nodes connected by a vertical line, with a small
                    chevron on the right hinting at the "switch" direction.
                    Monochrome path — color comes from .sidebar-logo { color: #fff } */}
                <circle cx="9" cy="6" r="2.6" />
                <circle cx="9" cy="18" r="2.6" />
                <path d="M9 8.6 V15.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <path d="M14 9.5 L16.6 12 L14 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
                  />
                ))
              )}
            </div>
          </div>
        )}

        {showPresetSelector && (
          <PresetSelector onAdd={handleAddFromPreset} onClose={() => setShowPresetSelector(false)} />
        )}

        {deleteConfirmId && (
          <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
            <div className="modal-panel delete-confirm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2>{t('dialog.deleteTitle') || '确认删除'}</h2>
              </div>
              <div className="modal-body">
                <p>{t('dialog.deleteProvider') || '确定要删除这个服务提供商吗？'}</p>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setDeleteConfirmId(null)}>{t('presetSelector.cancel')}</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--red)', borderColor: 'var(--red)' }}
                  onClick={async () => {
                    await api.deleteProvider(deleteConfirmId);
                    setDeleteConfirmId(null);
                    await refresh();
                  }}
                >
                  确定删除
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
