import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  VENDOR_ICONS,
  guessVendorFromUrl,
  type Vendor,
} from '../lib/vendor-icons';
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

/** Map a vendor string to its lobehub icon. Vendor key comes from
 *  `guessVendorFromUrl` and is the typed Vendor union. The .Avatar
 *  sub-component paints the official white glyph on the brand tile. */
const VENDOR_ICON_KEYS = new Set<string>(Object.keys(VENDOR_ICONS));

function renderVendorLogo(vendor: string) {
  if (VENDOR_ICON_KEYS.has(vendor)) {
    const { Icon } = VENDOR_ICONS[vendor as keyof typeof VENDOR_ICONS];
    return (
      <div className="vendor-badge">
        <Icon.Avatar size={48} shape="square" />
      </div>
    );
  }
  // Custom / unknown vendor — monogram fallback
  const initials = vendor.slice(0, 2).toUpperCase();
  return (
    <div className="vendor-badge">
      <span>{initials}</span>
    </div>
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TuneIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function ProviderCard({
  provider,
  isActive,
  testResult,
  onApply,
  onSettings,
  onTest,
  onDelete,
  onModelPicked,
  onToggleThinking,
  onSetEffort,
}: Props) {
  const { t } = useTranslation();
  const vendor = guessVendorFromUrl(provider.baseUrl);
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
      <motion.div
        className={`provider-card ${isActive ? 'active' : ''}`}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <div className="card-left">
          {renderVendorLogo(vendor)}
          <div className="card-info">
            <div className="card-name-row">
              <span className="card-name">{provider.name}</span>
              {isActive && <span className="card-active-tag">{t('provider.status.active')}</span>}
              <button
                className="card-model-button"
                onClick={handleFetchModels}
                title={t('provider.tooltips.model')}
                style={{ marginLeft: '4px' }}
              >
                <span>{provider.model}</span>
                <span className="card-model-chevron">{models.open ? '▲' : '▼'}</span>
              </button>
            </div>

            <div className="card-status">
              <div className="card-status-item">
                {dot}
                <span>{txt}</span>
              </div>
              <span className="detail-sep">·</span>
              <div className="card-status-item">
                <span className="status-dot" style={{ background: provider.thinkingEnabled ? 'var(--green)' : 'var(--text-muted)' }} />
                <span>
                  {provider.thinkingEnabled
                    ? `${t('provider.status.thinking')} ${provider.reasoningEffort.toUpperCase()}`
                    : t('provider.status.thinkingOff')}
                </span>
              </div>
              <span className="detail-sep">·</span>
              <span className="mono card-url-text">{provider.baseUrl.replace(/^https?:\/\//, '')}</span>
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
          
          <button
            className="card-btn icon-btn"
            onClick={onTest}
            disabled={testResult?.status === 'testing'}
            title={t('provider.tooltips.test')}
          >
            {testResult?.status === 'testing' ? '⏳' : <SearchIcon />}
          </button>
          
          <button
            className="card-btn icon-btn"
            onClick={onSettings}
            title={t('provider.tooltips.settings')}
          >
            <TuneIcon />
          </button>
          
          <button
            className="card-btn icon-btn danger"
            onClick={onDelete}
            title={t('provider.tooltips.delete')}
          >
            <TrashIcon />
          </button>
        </div>
      </motion.div>

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

