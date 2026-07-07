import React, { useState, useRef, useEffect } from 'react';
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
  const vendor = guessVendor(provider.baseUrl);
  const [models, setModels] = useState<ModelState>({ loading: false, open: false, models: [] });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
    console.log('[deep-switch] handleFetchModels clicked', { providerId: provider.id, baseUrl: provider.baseUrl });
    // If already open, just close
    if (models.open) {
      setModels((s) => ({ ...s, open: false }));
      return;
    }
    setModels({ loading: true, open: true, models: [] });
    const full = await window.deepSwitch.getProvider(provider.id);
    console.log('[deep-switch] getProvider result:', full ? `key_len=${(full.apiKey||'').length}` : 'null');
    if (!full) {
      setModels({ loading: false, open: true, models: [], error: '无法读取 provider' });
      return;
    }
    const result = await window.deepSwitch.fetchModels(full.baseUrl, full.apiKey);
    console.log('[deep-switch] fetchModels result:', result);
    if (result.ok) {
      // Sort: current model first, then by name
      const cur = provider.model;
      const sorted = [...result.models].sort((a, b) => {
        if (a === cur) return -1;
        if (b === cur) return 1;
        return a.localeCompare(b);
      });
      setModels({ loading: false, open: true, models: sorted });
    } else {
      setModels({ loading: false, open: true, models: [], error: result.error || '获取失败' });
    }
  };

  const handlePickModel = (model: string) => {
    onModelPicked(model);
    setModels((s) => ({ ...s, open: false }));
  };

  let dot: React.ReactNode, txt: string;
  if (testResult?.status === 'testing') {
    dot = <div className="status-dot testing" />;
    txt = '检测中…';
  } else if (testResult?.status === 'ok') {
    dot = <div className="status-dot online" />;
    txt = `${testResult.latencyMs}ms`;
  } else if (testResult?.status === 'error') {
    dot = <div className="status-dot error" />;
    txt = testResult.error || '连接失败';
  } else {
    dot = <div className="status-dot unknown" />;
    txt = '未测试';
  }

  return (
    <div className="provider-card-wrapper" ref={wrapperRef}>
      <div className={`provider-card ${isActive ? 'active' : ''}`}>
        <div className="card-left">
          <div className={`vendor-badge badge-${slug(vendor)}`}>{vendorTag(vendor)}</div>
          <div className="card-info">
            <div className="card-name-row">
              <span className="card-name">{provider.name}</span>
              {isActive && <span className="card-active-tag">已激活</span>}
              {provider.thinkingEnabled && <span className="card-thinking-tag">思考</span>}
            </div>
            <div className="card-detail">
              <button
                className="card-model-button"
                onClick={handleFetchModels}
                title="点击获取/切换可用模型"
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
                title="启用/禁用 思考链模式"
              >
                <span className="control-chip-dot" />
                <span>Thinking</span>
              </button>
              <select
                className="control-select"
                value={provider.reasoningEffort}
                disabled={!provider.thinkingEnabled}
                onChange={(e) => onSetEffort(e.target.value as 'high' | 'max')}
                title="推理深度（thinking 开启时生效）"
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
            title="切换 Deep Code 到这个 provider"
          >
            {isActive ? '✓ 已激活' : '启用'}
          </button>
          <button className="card-btn icon-btn" onClick={onTest} disabled={testResult?.status === 'testing'} title="测试连接">
            {testResult?.status === 'testing' ? '⏳' : '🔍'}
          </button>
          <button className="card-btn icon-btn" onClick={onSettings} title="设置">
            ⚙
          </button>
          <button className="card-btn icon-btn danger" onClick={onDelete} title="删除">
            🗑
          </button>
        </div>
      </div>

      {models.open && (
        <div className="model-dropdown">
          <div className="model-dropdown-header">
            {models.loading ? '加载模型列表…' : models.error ? `❌ ${models.error}` : `${models.models.length} 个可用模型 — 点选切换`}
          </div>
          {!models.loading && !models.error && models.models.length === 0 && (
            <div className="model-empty">该 provider 未返回任何模型</div>
          )}
          <div className="model-list">
            {models.models.map((m) => (
              <button
                key={m}
                className={`model-item ${m === provider.model ? 'current' : ''}`}
                onClick={() => handlePickModel(m)}
              >
                <span className="mono">{m}</span>
                {m === provider.model && <span className="model-current-tag">当前</span>}
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