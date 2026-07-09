import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  DeepSeek,
  OpenAI,
  Kimi,
  Moonshot,
  Zhipu,
  SiliconCloud,
  OpenRouter,
  Groq,
  Doubao,
  Minimax,
  Qwen,
} from '@lobehub/icons';
import type { ProviderPreset } from '../App';

interface Props {
  onAdd: (preset: ProviderPreset, apiKey: string, extras?: { name: string; baseUrl: string; model: string }) => void;
  onClose: () => void;
}

function presetDisplayName(p: ProviderPreset): string {
  return p.name + (p.cardSuffix ?? '');
}

/** Map preset id (or vendor name) → @lobehub/icons component. The
 *  Icon.Avatar paints the official white glyph on the brand-colored tile. */
const PRESET_VENDOR_ICON: Record<string, any> = {
  'deepseek-v4-pro':   DeepSeek,
  'deepseek-v4-flash':  DeepSeek,
  'deepseek-r1':        DeepSeek,
  'kimi-k2.7-code':     Kimi,
  'kimi-for-coding':    Kimi,
  'zhipu-glm':          Zhipu,
  'minimax-cn':         Minimax,
  'minimax-en':         Minimax,
  'doubao-pro':         Doubao,
  'siliconflow':        SiliconCloud,
  'openrouter':         OpenRouter,
  'openai':             OpenAI,
  'groq':               Groq,
  'qwen':               Qwen,
  'custom-blank':       null,
};

function renderPresetLogo(presetId: string) {
  const Icon = PRESET_VENDOR_ICON[presetId];
  if (Icon) {
    return (
      <div className="vendor-badge">
        <Icon.Avatar size={24} shape="square" />
      </div>
    );
  }
  // Custom-blank fallback: + sign
  return (
    <div className="vendor-badge">
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>＋</span>
    </div>
  );
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
                      href={p.homepageUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={(e) => e.stopPropagation()}
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
      </motion.form>
    </motion.div>
  );
}
