import { invoke } from '@tauri-apps/api/core';

export function setupTauriBridge() {
  if (typeof window === 'undefined') return;

  // Only setup if we are running inside Tauri
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  if (!isTauri) return;

  (window as any).deepSwitch = {
    listProviders: () => invoke('list_providers'),
    getProvider: (id: string) => invoke('get_provider', { id }),
    saveProvider: (provider: any) => invoke('save_provider', { provider }),
    deleteProvider: (id: string) => invoke('delete_provider', { id }),
    setActiveProvider: (id: string) => invoke('set_active_provider', { id }),
    getActiveProvider: () => invoke('get_active_provider'),
    applyProvider: (provider: any) => invoke('apply_provider', { provider }),
    listPresets: () => invoke('list_presets'),
    testProvider: (providerId: string) => invoke('test_provider', { providerId }),
    fetchModels: (baseUrl: string, apiKey: string) => invoke('fetch_models', { baseUrl, apiKey }),
    detectCurrentConfig: () => invoke('detect_config'),
    getSettings: () => invoke('get_settings'),
    saveSettings: (settings: any) => invoke('save_settings', { settings }),
    getDeepCodeConfigPath: () => invoke('get_deepcode_path'),
    ensureDeepCodeConfig: () => invoke('ensure_deepcode_config'),
    openInBrowser: (url: string) => invoke('open_in_browser', { url }),
  };
}
