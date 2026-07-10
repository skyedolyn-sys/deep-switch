import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PRESET_ICONS } from '../lib/vendor-icons';
import type { ProviderPreset } from '../App';

interface Props {
  onAdd: (preset: ProviderPreset, apiKey: string, extras?: { name: string; baseUrl: string; model: string }) => void;
  onClose: () => void;
}

function presetDisplayName(p: ProviderPreset): string {
  return p.name + (p.cardSuffix ?? '');
}

function renderPresetLogo(presetId: string) {
  const entry = PRESET_ICONS[presetId];
  if (entry) {
    return (
      <div className="vendor-badge">
        <entry.Icon.Avatar size={24} shape="square" />
      </div>
    );
  }
  // Custom-blank fallback: + sign (the only preset id without a known
  // brand icon)
  return (
    <div className="vendor-badge preset-plus-fallback">＋</div>
  );
}

export function PresetSelector({ onAdd, onClose }: Props) {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<ProviderPreset[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [tsinghuaModel, setTsinghuaModel] = useState('DeepSeek-R1-671B');

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
    if (selectedId === 'tsinghua-deepseek-r1') {
      const presetCopy = { ...selected, model: tsinghuaModel };
      onAdd(presetCopy, apiKey.trim());
    } else if (isCustom) {
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
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <motion.form
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
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
                  {renderPresetLogo(p.id)}
                  <div className="preset-name">{presetDisplayName(p)}</div>
                  {p.homepageUrl && (
                    <a
                      className="preset-homepage"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.deepSwitch.openInBrowser(p.homepageUrl!);
                      }}
                    >
                      <span className="preset-homepage-label">{t('presetSelector.homepageLabel')}</span>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6"/>
                        <path d="M10 14 21 3"/>
                        <path d="M21 14v7H3V3h7"/>
                      </svg>
                    </a>
                  )}
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

          {selectedId === 'tsinghua-deepseek-r1' && (
            <div className="form-section">
              <label>选择模型 / Select Model</label>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9em' }}>
                  <input
                    type="radio"
                    name="tsinghuaModel"
                    value="DeepSeek-R1-671B"
                    checked={tsinghuaModel === 'DeepSeek-R1-671B'}
                    onChange={() => setTsinghuaModel('DeepSeek-R1-671B')}
                  />
                  <span>DeepSeek-R1-671B (默认)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9em' }}>
                  <input
                    type="radio"
                    name="tsinghuaModel"
                    value="DeepSeek-R1-32B"
                    checked={tsinghuaModel === 'DeepSeek-R1-32B'}
                    onChange={() => setTsinghuaModel('DeepSeek-R1-32B')}
                  />
                  <span>DeepSeek-R1-32B (蒸馏版)</span>
                </label>
              </div>
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
              {selectedId === 'tsinghua-deepseek-r1' && (
                <div style={{ marginTop: 8, fontSize: '0.85em', color: 'var(--text-muted)' }}>
                  <span>快速获取 API-KEY：</span>
                  <a
                    href="#"
                    style={{ textDecoration: 'underline', color: 'var(--primary)' }}
                    onClick={(e) => {
                      e.preventDefault();
                      window.deepSwitch.openInBrowser('https://madmodel.cs.tsinghua.edu.cn/');
                    }}
                  >
                    前往清华 MadModel 官网获取 (5小时有效期) →
                  </a>
                </div>
              )}
              {!isCustom && (
                <div className="form-hint">
                  <span dangerouslySetInnerHTML={{ __html: t('presetSelector.info.baseUrl', { baseUrl: selected.baseUrl }) }} />
                  <span dangerouslySetInnerHTML={{ __html: t('presetSelector.info.model', { model: selectedId === 'tsinghua-deepseek-r1' ? tsinghuaModel : selected.model }) }} />
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
      </motion.form>
    </motion.div>
  );
}
