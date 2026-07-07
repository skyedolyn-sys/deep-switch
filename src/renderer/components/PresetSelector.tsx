import React, { useState, useEffect } from 'react';
import type { ProviderPreset } from '../App';
import { presetDisplayName } from '../../main/presets';

interface Props {
  onAdd: (preset: ProviderPreset, apiKey: string, extras?: { name: string; baseUrl: string; model: string }) => void;
  onClose: () => void;
}

export function PresetSelector({ onAdd, onClose }: Props) {
  const [presets, setPresets] = useState<ProviderPreset[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Custom-blank fields
  const [cName, setCName] = useState('');
  const [cBaseUrl, setCBaseUrl] = useState('');
  const [cModel, setCModel] = useState('');

  useEffect(() => {
    window.deepSwitch.listPresets().then((all) =>
      setPresets(all.filter((p: ProviderPreset) => p.apiFormat === 'openai'))
    );
  }, []);

  const selected = presets.find((p) => p.id === selectedId);
  const isCustom = selected?.id === 'custom-blank';

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Reset custom fields when switching
    if (id !== 'custom-blank') {
      setCName(''); setCBaseUrl(''); setCModel('');
    }
  };

  const canSubmit = selected && apiKey.trim() && !(
    isCustom && (!cName.trim() || !cBaseUrl.trim() || !cModel.trim())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !apiKey.trim()) return;
    if (isCustom && (!cName.trim() || !cBaseUrl.trim() || !cModel.trim())) return;
    if (isCustom) {
      onAdd(selected, apiKey.trim(), {
        name: cName.trim(),
        baseUrl: cBaseUrl.trim(),
        model: cModel.trim(),
      });
    } else {
      onAdd(selected, apiKey.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>添加供应商</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            <label>OpenAI 兼容预设（{presets.length}）</label>
            <div className="preset-grid">
              {presets.map((p) => (
                <div
                  key={p.id}
                  className={`preset-option ${selectedId === p.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(p.id)}
                >
                  <div className="preset-vendor">{p.vendor}</div>
                  <div className="preset-name">{presetDisplayName(p)}</div>
                  {p.model && <div className="preset-model mono">{p.model}</div>}
                  <div className="preset-desc">{p.description}</div>
                  <div className="preset-platform">{p.platform}</div>
                  {p.hint && <div className="preset-hint">{p.hint}</div>}
                </div>
              ))}
            </div>
          </div>

          {isCustom && (
            <div className="form-section">
              <label>自定义配置</label>
              <input
                className="form-input"
                placeholder="显示名称（如：我的私有代理）"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                autoFocus
              />
              <input
                className="form-input"
                placeholder="Base URL （如：https://llm.internal.company.com/v1）"
                value={cBaseUrl}
                onChange={(e) => setCBaseUrl(e.target.value)}
                style={{ marginTop: 8 }}
              />
              <input
                className="form-input"
                placeholder="Model ID （如：gpt-4o, claude-3-5-sonnet, my-custom-model）"
                value={cModel}
                onChange={(e) => setCModel(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          {selected && (
            <div className="form-section">
              <label>API Key</label>
              <input
                type="password"
                className="api-key-input"
                placeholder={`粘贴 ${selected.vendor} 的 API Key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoFocus={!isCustom}
              />
              {!isCustom && (
                <div className="form-hint">
                  <span>Base URL: <code>{selected.baseUrl}</code></span>
                  <span>Model: <code>{selected.model}</code></span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            添加并启用
          </button>
        </div>
      </form>
    </div>
  );
}