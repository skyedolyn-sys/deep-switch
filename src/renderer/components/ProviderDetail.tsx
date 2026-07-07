import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [name, setName] = useState(provider.name);
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl);
  const [model, setModel] = useState(provider.model);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [thinkingEnabled, setThinkingEnabled] = useState(provider.thinkingEnabled);
  const [reasoningEffort, setReasoningEffort] = useState(provider.reasoningEffort);
  const [changed, setChanged] = useState(false);

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
    if (confirm(t('providerDetail.delete.confirm', { name: provider.name }))) {
      onDelete(provider.id);
    }
  };

  const handleFetchModels = async () => {
    setFetchingModels(true);
    setModelError('');

    let key = apiKey;
    if (!key) {
      const full = await window.deepSwitch.getProvider(provider.id);
      key = full?.apiKey ?? '';
    }
    if (!key) {
      setFetchingModels(false);
      setModelError(t('providerDetail.modelFetch.error'));
      return;
    }

    const result = await window.deepSwitch.fetchModels(baseUrl, key);
    setFetchingModels(false);

    if (result.ok) {
      setModels(result.models);
    } else {
      setModelError(result.error || t('providerDetail.modelFetch.errorFetch'));
    }
  };

  const statusMap: Record<string, string> = {
    ok: t('providerDetail.connection.ok'),
    error: t('providerDetail.connection.error'),
    testing: t('providerDetail.connection.testing'),
  };
  const statusLabel = statusMap[testResult?.status ?? ''] || t('providerDetail.connection.untested');

  const statusClass = testResult?.status === 'ok' ? 'status-ok' :
    testResult?.status === 'error' ? 'status-err' :
    testResult?.status === 'testing' ? 'status-testing' : '';

  return (
    <div className="detail-page">
      <div className="detail-nav">
        <button className="nav-back" onClick={onBack}><span className="nav-arrow">←</span> {t('providerDetail.back')}</button>
        <span className="nav-title">{t('providerDetail.title', { name: provider.name })}</span>
        <button className={`btn btn-primary ${changed ? '' : 'dimmed'}`} onClick={handleSave} disabled={!changed}>
          {t('providerDetail.save')}
        </button>
      </div>

      <div className="detail-body">
        <section className="detail-section">
          <div className="section-label">{t('providerDetail.section.connection')}</div>
          <div className="status-card">
            <div className={`status-badge ${statusClass}`}>
              <div className="status-dot-sm" />
              <span>{statusLabel}</span>
              {testResult?.latencyMs ? <span className="latency">{t('providerDetail.connection.latency', { ms: testResult.latencyMs })}</span> : null}
            </div>
            {testResult?.error && <div className="status-error-msg">{testResult.error}</div>}
            <button className="btn btn-sm test-btn-detail" onClick={onTest} disabled={testResult?.status === 'testing'}>
              {testResult?.status === 'testing' ? t('providerDetail.connection.testingButton') : t('providerDetail.connection.testButton')}
            </button>
          </div>
        </section>

        <section className="detail-section">
          <div className="section-label">{t('providerDetail.section.basicInfo')}</div>
          <div className="form-card">
            <div className="form-row">
              <label>{t('providerDetail.fields.name')}</label>
              <input value={name} onChange={(e) => { setName(e.target.value); markChanged(); }} />
            </div>
            <div className="form-row">
              <label>{t('providerDetail.fields.baseUrl')}</label>
              <input
                value={baseUrl}
                onChange={(e) => { setBaseUrl(e.target.value); markChanged(); setModels([]); setModelError(''); }}
                placeholder={t('providerDetail.fields.placeholder.baseUrl')}
              />
            </div>
            <div className="form-row">
              <label>{t('providerDetail.fields.model')}</label>
              {models.length > 0 ? (
                <select value={model} onChange={(e) => { setModel(e.target.value); markChanged(); }}>
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input
                    value={model}
                    onChange={(e) => { setModel(e.target.value); markChanged(); }}
                    placeholder={t('providerDetail.fields.placeholder.model')}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={handleFetchModels}
                    disabled={fetchingModels}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {fetchingModels ? t('providerDetail.modelFetch.loading') : t('providerDetail.modelFetch.button')}
                  </button>
                </div>
              )}
              {modelError && <span style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{modelError}</span>}
            </div>
          </div>
        </section>

        <section className="detail-section">
          <div className="section-label">{t('providerDetail.section.apiKey')}</div>
          <div className="form-card">
            <div className="form-row">
              <label>{t('providerDetail.fields.apiKey')}</label>
              <div className="key-input-wrap">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); markChanged(); setModels([]); setModelError(''); }}
                  placeholder={provider.apiKey === '••••••••' ? t('providerDetail.fields.placeholder.apiKeySaved') : t('providerDetail.fields.placeholder.apiKeyNew')}
                />
                <button type="button" className="btn-eye" onClick={() => setShowKey(!showKey)}>
                  {showKey ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <div className="section-label">{t('providerDetail.section.modelParams')}</div>
          <div className="form-card">
            <div className="form-row switch-row">
              <div>
                <label>{t('providerDetail.advanced.thinkingMode')}</label>
                <p className="form-desc">{t('providerDetail.advanced.thinkingDesc')}</p>
              </div>
              <div className={`toggle ${thinkingEnabled ? 'on' : ''}`} onClick={() => { setThinkingEnabled(!thinkingEnabled); markChanged(); }} />
            </div>
            {thinkingEnabled && (
              <div className="form-row">
                <label>{t('providerDetail.advanced.reasoning')}</label>
                <select value={reasoningEffort} onChange={(e) => { setReasoningEffort(e.target.value as 'max' | 'high'); markChanged(); }}>
                  <option value="max">{t('providerDetail.advanced.max')}</option>
                  <option value="high">{t('providerDetail.advanced.high')}</option>
                </select>
              </div>
            )}
          </div>
        </section>

        <section className="detail-section">
          <div className="section-label danger-label">{t('providerDetail.section.danger')}</div>
          <div className="form-card danger-card">
            <div className="form-row danger-row">
              <div>
                <label>{t('providerDetail.delete.label')}</label>
                <p className="form-desc">{t('providerDetail.delete.desc')}</p>
              </div>
              <button className="btn btn-danger" onClick={handleDelete}>{t('providerDetail.delete.button')}</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
