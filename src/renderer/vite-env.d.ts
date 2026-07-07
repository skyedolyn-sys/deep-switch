/// <reference types="vite/client" />

interface DeepSwitchAPI {
  listProviders: () => Promise<any[]>;
  getProvider: (id: string) => Promise<any>;
  saveProvider: (provider: any) => Promise<any>;
  deleteProvider: (id: string) => Promise<any>;
  setActiveProvider: (id: string) => Promise<any>;
  getActiveProvider: () => Promise<any>;
  applyProvider: (provider: any) => Promise<{ env: Record<string, string> }>;
  restoreBackup: () => Promise<boolean>;

  listPresets: () => Promise<any[]>;

  testProvider: (providerId: string) => Promise<{
    ok: boolean;
    latencyMs: number;
    error?: string;
    model?: string;
  }>;

  fetchModels: (baseUrl: string, apiKey: string) => Promise<{ ok: boolean; models?: string[]; error?: string }>;

  detectCurrentConfig: () => Promise<any | null>;

  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<any>;

  hasBackup: () => Promise<boolean>;
}

declare global {
  interface Window {
    deepSwitch: DeepSwitchAPI;
  }
}