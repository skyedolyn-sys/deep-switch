import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProviderPreset } from '../App';

interface Props {
  onAdd: (preset: ProviderPreset, apiKey: string, extras?: { name: string; baseUrl: string; model: string }) => void;
  onClose: () => void;
}

function presetDisplayName(p: ProviderPreset): string {
  return p.name + (p.cardSuffix ?? '');
}

export function PresetSelector({ onAdd, onClose }: Props) {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<ProviderPreset[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [apiKey, setApiKey] = useState('');

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
          <h2>{t('presetSelector.title')}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>{t('presetSelector.close')}</button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            <label>{t('presetSelector.presetLabel', { count: presets.length })}</label>
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
              <label>{t('presetSelector.customSection')}</label>
              <input
                className="form-input"
                placeholder={t('presetSelector.customPlaceholder.name')}
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                autoFocus
              />
              <input
                className="form-input"
                placeholder={t('presetSelector.customPlaceholder.baseUrl')}
                value={cBaseUrl}
                onChange={(e) => setCBaseUrl(e.target.value)}
                style={{ marginTop: 8 }}
              />
              <input
                className="form-input"
                placeholder={t('presetSelector.customPlaceholder.model')}
                value={cModel}
                onChange={(e) => setCModel(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          {selected && (
            <div className="form-section">
              <label>{t('presetSelector.apiKey')}</label>
              <input
                type="password"
                className="api-key-input"
                placeholder={t('presetSelector.apiKeyPlaceholder', { vendor: selected.vendor })}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoFocus={!isCustom}
              />
              {!isCustom && (
                <div className="form-hint">
                  <span dangerouslySetInnerHTML={{ __html: t('presetSelector.info.baseUrl', { baseUrl: selected.baseUrl }) }} />
                  <span dangerouslySetInnerHTML={{ __html: t('presetSelector.info.model', { model: selected.model }) }} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t('presetSelector.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {t('presetSelector.add')}
          </button>
        </div>
      </form>
    </div>
  );
}
