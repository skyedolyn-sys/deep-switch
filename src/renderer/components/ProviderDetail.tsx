import React, { useState, useEffect } from 'react';
import type { Provider } from '../App';

interface Props {
  provider: Provider;
  onSave: (data: { id: string; name: string; baseUrl: string; model: string; apiKey?: string; thinkingEnabled: boolean; reasoningEffort: 'high' | 'max' }) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onTest: () => void;
  testResult?: { status: string; latencyMs: number; error?: string };
}

export function ProviderDetail({ provider, onSave, onDelete, onBack, onTest, testResult }: Props) {
  const [name, setName] = useState(provider.name);
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl);
  const [model, setModel] = useState(provider.model);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [thinkingEnabled, setThinkingEnabled] = useState(provider.thinkingEnabled);
  const [reasoningEffort, setReasoningEffort] = useState(provider.reasoningEffort);
  const [changed, setChanged] = useState(false);

  // Model fetching
  const [models, setModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [modelError, setModelError] = useState('');

  useEffect(() => {
    setName(provider.name);
    setBaseUrl(provider.baseUrl);
    setModel(provider.model);
    setThinkingEnabled(provider.thinkingEnabled);
    setReasoningEffort(provider.reasoningEffort);
    setChanged(false);
    setApiKey('');
    setModels([]);
    setModelError('');
  }, [provider.id]);

  const markChanged = () => setChanged(true);

  const handleSave = () => {
    onSave({
      id: provider.id,
      name, baseUrl, model,
      apiKey: apiKey || undefined,
      thinkingEnabled, reasoningEffort,
    });
    setChanged(false);
    setApiKey('');
  };

  const handleDelete = () => {
    if (confirm(`Delete "${provider.name}"? This cannot be undone.`)) {
      onDelete(provider.id);
    }
  };

  // Fetch available models from the provider
  const handleFetchModels = async () => {
    setFetchingModels(true);
    setModelError('');

    // Resolve the API key:
    //   1. If the user typed a new key in this session, use it
    //   2. Otherwise ask main process for the real (unmasked) key for this provider
    let key = apiKey;
    if (!key) {
      const full = await window.deepSwitch.getProvider(provider.id);
      key = full?.apiKey ?? '';
    }
    if (!key) {
      setFetchingModels(false);
      setModelError('缺少 API Key — 请先在上方 Key 框输入');
      return;
    }

    const result = await window.deepSwitch.fetchModels(baseUrl, key);
    setFetchingModels(false);

    if (result.ok) {
      setModels(result.models);
    } else {
      setModelError(result.error || 'Failed to fetch models');
    }
  };

  const statusLabel = testResult?.status === 'ok' ? 'Connected' :
    testResult?.status === 'error' ? 'Failed' :
    testResult?.status === 'testing' ? 'Testing...' : 'Not tested';

  const statusClass = testResult?.status === 'ok' ? 'status-ok' :
    testResult?.status === 'error' ? 'status-err' :
    testResult?.status === 'testing' ? 'status-testing' : '';

  return (
    <div className="detail-page">
      <div className="detail-nav">
        <button className="nav-back" onClick={onBack}><span className="nav-arrow">←</span> Back</button>
        <span className="nav-title">{provider.name}</span>
        <button className={`btn btn-primary ${changed ? '' : 'dimmed'}`} onClick={handleSave} disabled={!changed}>
          Save
        </button>
      </div>

      <div className="detail-body">
        {/* Connection Status */}
        <section className="detail-section">
          <div className="section-label">Connection</div>
          <div className="status-card">
            <div className={`status-badge ${statusClass}`}>
              <div className="status-dot-sm" />
              <span>{statusLabel}</span>
              {testResult?.latencyMs ? <span className="latency">{testResult.latencyMs}ms</span> : null}
            </div>
            {testResult?.error && <div className="status-error-msg">{testResult.error}</div>}
            <button className="btn btn-sm test-btn-detail" onClick={onTest} disabled={testResult?.status === 'testing'}>
              {testResult?.status === 'testing' ? '⏳ Testing' : '🔍 Test Connection'}
            </button>
          </div>
        </section>

        {/* Basic Info */}
        <section className="detail-section">
          <div className="section-label">Basic Info</div>
          <div className="form-card">
            <div className="form-row">
              <label>Name</label>
              <input value={name} onChange={(e) => { setName(e.target.value); markChanged(); }} />
            </div>
            <div className="form-row">
              <label>Base URL</label>
              <input value={baseUrl} onChange={(e) => { setBaseUrl(e.target.value); markChanged(); setModels([]); setModelError(''); }} placeholder="https://api.deepseek.com" />
            </div>
            <div className="form-row">
              <label>Model</label>
              {models.length > 0 ? (
                <select value={model} onChange={(e) => { setModel(e.target.value); markChanged(); }}>
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input value={model} onChange={(e) => { setModel(e.target.value); markChanged(); }} placeholder="deepseek-v4-pro" style={{ flex: 1 }} />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={handleFetchModels}
                    disabled={fetchingModels}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {fetchingModels ? '⏳ Loading...' : '📋 Fetch Models'}
                  </button>
                </div>
              )}
              {modelError && <span style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{modelError}</span>}
            </div>
          </div>
        </section>

        {/* API Key */}
        <section className="detail-section">
          <div className="section-label">API Key</div>
          <div className="form-card">
            <div className="form-row">
              <label>Key</label>
              <div className="key-input-wrap">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); markChanged(); setModels([]); setModelError(''); }}
                  placeholder={provider.apiKey === '••••••••' ? '•••••••• (saved)' : 'Enter new key'}
                />
                <button type="button" className="btn-eye" onClick={() => setShowKey(!showKey)}>
                  {showKey ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Model Parameters */}
        <section className="detail-section">
          <div className="section-label">Model Parameters</div>
          <div className="form-card">
            <div className="form-row switch-row">
              <div>
                <label>Thinking Mode</label>
                <p className="form-desc">Enables reasoning chain for complex tasks</p>
              </div>
              <div className={`toggle ${thinkingEnabled ? 'on' : ''}`} onClick={() => { setThinkingEnabled(!thinkingEnabled); markChanged(); }} />
            </div>
            {thinkingEnabled && (
              <div className="form-row">
                <label>Reasoning</label>
                <select value={reasoningEffort} onChange={(e) => { setReasoningEffort(e.target.value as 'max' | 'high'); markChanged(); }}>
                  <option value="max">Max — deeper reasoning (more tokens)</option>
                  <option value="high">High — balanced (fewer tokens)</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Danger */}
        <section className="detail-section">
          <div className="section-label danger-label">Danger Zone</div>
          <div className="form-card danger-card">
            <div className="form-row danger-row">
              <div>
                <label>Delete this provider</label>
                <p className="form-desc">Cannot be undone</p>
              </div>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
