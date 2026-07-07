import React, { useEffect, useState, useCallback } from 'react';
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
  hint?: string;
  platform: string;
}

export default function App() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasBackup, setHasBackup] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; latencyMs: number; error?: string }>>({});

  const api = window.deepSwitch;

  const refresh = useCallback(async () => {
    const [pList, active, backup] = await Promise.all([
      api.listProviders(),
      api.getActiveProvider(),
      api.hasBackup(),
    ]);
    setProviders(pList);
    setActiveId(active?.id ?? null);
    setHasBackup(backup);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  /** Apply = set active AND write to ~/.deepcode/settings.json in one step. */
  const handleApply = async (id: string, full?: Provider) => {
    // If full provider object is supplied, skip the state lookup (state may be stale
    // — e.g. immediately after creating a new provider from a preset).
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
    flash(`✓ ${resolved.name} 已切换 · ${env.BASE_URL} / ${env.MODEL}`);
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
    // Refresh first so the new provider appears in the list AND is findable
    // by handleApply's lookup. Then close modal, then apply (writes settings.json
    // and re-activates).
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
    if (!confirm('Delete this provider?')) return;
    await api.deleteProvider(id);
    await refresh();
  };

  const handleRestore = async () => {
    const ok = await api.restoreBackup();
    if (ok) {
      setActiveId(null);
      await refresh();
      flash('✓ Deep Code settings.json 已从备份恢复');
    } else {
      alert('没有备份（你可能从未使用过 Deep Switch 切换）');
    }
  };

  const handleDetect = async () => {
    const current = await api.detectCurrentConfig();
    if (!current) {
      alert('未在 ~/.deepcode/settings.json 中找到完整配置');
      return;
    }
    // If a matching provider exists, just apply it; otherwise create + apply.
    const matched = providers.find(
      (p) =>
        p.baseUrl === current.baseUrl &&
        p.model === current.model &&
        // Don't re-add if apiKey matches (heuristic: apiKey shown as mask)
        (current.apiKey.length === 0 || p.apiKey === '••••••••' || true)
    );
    if (matched) {
      await handleApply(matched.id);
      flash('✓ 检测到 Deep Code 当前配置，已应用对应 provider');
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
      flash('✓ 已从 settings.json 导入并应用');
    }
  };

  const handleSaveProviderDetail = async (data: any) => {
    await api.saveProvider(data);
    setSelectedProviderId(null);
    await refresh();
    // Re-apply if this was the active one
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
      flash(`✓ ${saved.name} 已切换到 ${model}`);
    } else {
      flash(`✓ 模型已更新为 ${model}`);
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
      flash(enabled ? `✓ 已开启思考模式` : `✓ 已关闭思考模式`);
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
      flash(`✓ 推理深度设为 ${effort}`);
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
            <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#ffffff"
                d="M7.16 0 L24.84 0 L31.99 4.75 L31.98 3.99 L31.94 3.44 L31.9 2.99 L31.85 2.61 L31.78 2.28 L31.69 1.99 L31.6 1.73 L31.49 1.5 L31.37 1.29 L31.23 1.1 L31.07 0.93 L30.9 0.77 L30.71 0.63 L30.5 0.51 L30.27 0.4 L30.01 0.31 L29.72 0.22 L29.39 0.15 L29.01 0.1 L28.56 0.06 L28.01 0.02 L27.25 0.01 L32 7.16 L32 24.84 L31.99 27.25 L31.98 28.01 L31.94 28.56 L31.9 29.01 L31.85 29.39 L31.78 29.72 L31.69 30.01 L31.6 30.27 L31.49 30.5 L31.37 30.71 L31.23 30.9 L31.07 31.07 L30.9 31.23 L30.71 31.37 L30.5 31.49 L30.27 31.6 L30.01 31.69 L29.72 31.78 L29.39 31.85 L29.01 31.9 L28.56 31.94 L28.01 31.98 L27.25 31.99 L24.84 32 L7.16 32 L0.01 27.25 L0.02 28.01 L0.06 28.56 L0.1 29.01 L0.15 29.39 L0.22 29.72 L0.31 30.01 L0.4 30.27 L0.51 30.5 L0.63 30.71 L0.77 30.9 L0.93 31.07 L1.1 31.23 L1.29 31.37 L1.5 31.49 L1.73 31.6 L1.99 31.69 L2.28 31.78 L2.61 31.85 L2.99 31.9 L3.44 31.94 L3.99 31.98 L4.75 31.99 L0 24.84 L0 7.16 L0.01 4.75 L0.02 3.99 L0.06 3.44 L0.1 2.99 L0.15 2.61 L0.22 2.28 L0.31 1.99 L0.4 1.73 L0.51 1.5 L0.63 1.29 L0.77 1.1 L0.93 0.93 L1.1 0.77 L1.29 0.63 L1.5 0.51 L1.73 0.4 L1.99 0.31 L2.28 0.22 L2.61 0.15 L2.99 0.1 L3.44 0.06 L3.99 0.02 L4.75 0.01 L7.16 0 Z"
              />
              <g transform="translate(6.7,6.7) scale(0.76)">
                <path
                  fill="#4D6BFE"
                  d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"
                />
              </g>
            </svg>
          </div>
          <span className="sidebar-title">Deep Switch</span>
        </div>
        <button className="sidebar-add-btn" onClick={() => setShowPresetSelector(true)}>
          <span>+ 添加供应商</span>
        </button>

        <div className="sidebar-section-label">Deep Code 配置</div>
        <div className="sidebar-env-card">
          {activeProvider ? (
            <>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">激活</span>
                <span className="sidebar-env-val" title={activeProvider.name}>{activeProvider.name}</span>
              </div>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">BASE_URL</span>
                <span className="sidebar-env-val mono">{activeProvider.baseUrl}</span>
              </div>
              <div className="sidebar-env-row">
                <span className="sidebar-env-key">MODEL</span>
                <span className="sidebar-env-val mono">{activeProvider.model}</span>
              </div>
            </>
          ) : (
            <div className="sidebar-env-empty">
              未激活 — 点下方任一 provider 的「启用」按钮
            </div>
          )}
        </div>

        <button className="sidebar-detect-btn" onClick={handleDetect}>
          🔄 检测 Deep Code 当前配置
        </button>
        {hasBackup && (
          <button className="sidebar-restore-btn" onClick={handleRestore}>
            ↶ 还原初始配置（备份）
          </button>
        )}

        <div className="sidebar-spacer" />
        <div className="sidebar-foot">v0.2 · 直接改写 ~/.deepcode/settings.json</div>
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
              <h2>供应商</h2>
              <span className="page-hint">点「启用」直接切换 Deep Code 的 API</span>
            </div>

            <div className="provider-grid">
              {providers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔌</div>
                  <p>还没有供应商</p>
                  <span>点左侧 <strong>+ 添加供应商</strong></span>
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