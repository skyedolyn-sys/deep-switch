import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provider } from '../App';

interface Props {
  provider: Provider;
  isActive: boolean;
  testResult?: { status: string; latencyMs: number; error?: string };
  onApply: () => void;
  onSettings: () => void;
  onTest: () => void;
  onDelete: () => void;
  onModelPicked: (model: string) => void;
  onToggleThinking: (enabled: boolean) => void;
  onSetEffort: (effort: 'high' | 'max') => void;
}

interface ModelState {
  loading: boolean;
  open: boolean;
  models: string[];
  error?: string;
}

function vendorTag(vendor: string): string {
  const m: Record<string, string> = {
    DeepSeek: 'DS', OpenAI: 'OA', 'Moonshot (Kimi)': 'KM',
    'Zhipu (GLM)': 'GL', MiniMax: 'MM', 'ByteDance (Doubao)': 'BD',
    SiliconFlow: 'SF', OpenRouter: 'OR', Groq: 'GQ',
  };
  return m[vendor] || vendor.slice(0, 2).toUpperCase();
}

export function ProviderCard({ provider, isActive, testResult, onApply, onSettings, onTest, onDelete, onModelPicked, onToggleThinking, onSetEffort }: Props) {
  const { t } = useTranslation();
  const vendor = guessVendor(provider.baseUrl);
  const [models, setModels] = useState<ModelState>({ loading: false, open: false, models: [] });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!models.open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setModels((s) => ({ ...s, open: false }));
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [models.open]);

  const handleFetchModels = async () => {
    if (models.open) {
      setModels((s) => ({ ...s, open: false }));
      return;
    }
    setModels({ loading: true, open: true, models: [] });
    const full = await window.deepSwitch.getProvider(provider.id);
    if (!full) {
      setModels({ loading: false, open: true, models: [], error: t('providerDetail.modelFetch.error') });
      return;
    }
    const result = await window.deepSwitch.fetchModels(full.baseUrl, full.apiKey);
    if (result.ok) {
      const cur = provider.model;
      const sorted = [...result.models].sort((a, b) => {
        if (a === cur) return -1;
        if (b === cur) return 1;
        return a.localeCompare(b);
      });
      setModels({ loading: false, open: true, models: sorted });
    } else {
      setModels({ loading: false, open: true, models: [], error: result.error || t('providerDetail.modelFetch.errorFetch') });
    }
  };

  const handlePickModel = (model: string) => {
    onModelPicked(model);
    setModels((s) => ({ ...s, open: false }));
  };

  let dot: React.ReactNode, txt: string;
  if (testResult?.status === 'testing') {
    dot = <div className="status-dot testing" />;
    txt = t('provider.status.testing');
  } else if (testResult?.status === 'ok') {
    dot = <div className="status-dot online" />;
    txt = `${testResult.latencyMs}ms`;
  } else if (testResult?.status === 'error') {
    dot = <div className="status-dot error" />;
    txt = testResult.error || t('provider.status.error');
  } else {
    dot = <div className="status-dot unknown" />;
    txt = t('provider.status.untested');
  }

  return (
    <div className="provider-card-wrapper" ref={wrapperRef}>
      <div className={`provider-card ${isActive ? 'active' : ''}`}>
        <div className="card-left">
          <div className={`vendor-badge badge-${slug(vendor)}`}>{vendorTag(vendor)}</div>
          <div className="card-info">
            <div className="card-name-row">
              <span className="card-name">{provider.name}</span>
              {isActive && <span className="card-active-tag">{t('provider.status.active')}</span>}
              {provider.thinkingEnabled && <span className="card-thinking-tag">{t('provider.status.thinking')}</span>}
            </div>
            <div className="card-detail">
              <button
                className="card-model-button"
                onClick={handleFetchModels}
                title={t('provider.tooltips.model')}
              >
                <span className="mono">{provider.model}</span>
                <span className="card-model-chevron">{models.open ? '▴' : '▾'}</span>
              </button>
              <span className="detail-sep">·</span>
              <span className="mono">{provider.baseUrl.replace(/^https?:\/\//, '')}</span>
            </div>
            <div className="card-status">
              {dot}
              <span>{txt}</span>
            </div>
            <div className="card-controls">
              <button
                className={`control-chip ${provider.thinkingEnabled ? 'on' : ''}`}
                onClick={() => onToggleThinking(!provider.thinkingEnabled)}
                title={t('provider.tooltips.thinking')}
              >
                <span className="control-chip-dot" />
                <span>Thinking</span>
              </button>
              <select
                className="control-select"
                value={provider.reasoningEffort}
                disabled={!provider.thinkingEnabled}
                onChange={(e) => onSetEffort(e.target.value as 'high' | 'max')}
                title={t('provider.tooltips.reasoning')}
              >
                <option value="max">max</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-actions">
          <button
            className={`card-btn apply-btn ${isActive ? 'active' : 'primary'}`}
            onClick={onApply}
            title={t('provider.tooltips.apply')}
          >
            {isActive ? t('provider.status.active') : t('provider.actions.activate')}
          </button>
          <button className="card-btn icon-btn" onClick={onTest} disabled={testResult?.status === 'testing'} title={t('provider.tooltips.test')}>
            {testResult?.status === 'testing' ? '⏳' : '🔍'}
          </button>
          <button className="card-btn icon-btn" onClick={onSettings} title={t('provider.tooltips.settings')}>
            ⚙
          </button>
          <button className="card-btn icon-btn danger" onClick={onDelete} title={t('provider.tooltips.delete')}>
            🗑
          </button>
        </div>
      </div>

      {models.open && (
        <div className="model-dropdown">
          <div className="model-dropdown-header">
            {models.loading
              ? t('provider.modelDropdown.loading')
              : models.error
                ? t('provider.modelDropdown.error', { error: models.error })
                : t('provider.modelDropdown.available', { count: models.models.length })}
          </div>
          {!models.loading && !models.error && models.models.length === 0 && (
            <div className="model-empty">{t('provider.modelDropdown.empty')}</div>
          )}
          <div className="model-list">
            {models.models.map((m) => (
              <button
                key={m}
                className={`model-item ${m === provider.model ? 'current' : ''}`}
                onClick={() => handlePickModel(m)}
              >
                <span className="mono">{m}</span>
                {m === provider.model && <span className="model-current-tag">{t('provider.modelDropdown.current')}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, '');
}

function guessVendor(baseUrl: string): string {
  const u = baseUrl.toLowerCase();
  if (u.includes('deepseek')) return 'DeepSeek';
  if (u.includes('openai')) return 'OpenAI';
  if (u.includes('moonshot') || u.includes('kimi')) return 'Moonshot (Kimi)';
  if (u.includes('bigmodel') || u.includes('z.ai')) return 'Zhipu (GLM)';
  if (u.includes('minimax') || u.includes('minimaxi')) return 'MiniMax';
  if (u.includes('volces')) return 'ByteDance (Doubao)';
  if (u.includes('siliconflow')) return 'SiliconFlow';
  if (u.includes('openrouter')) return 'OpenRouter';
  if (u.includes('groq')) return 'Groq';
  return 'Custom';
}
