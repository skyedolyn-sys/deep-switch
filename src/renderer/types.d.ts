export interface LaunchResult {
  /** "launched" | "installing" | "node_missing" | "unsupported_platform" | "error" */
  status: string;
  hasNode: boolean;
  hasDeepcode: boolean;
  workDir: string;
  message: string;
}

export interface DeepSwitchAPI {
  listProviders: () => Promise<any[]>;
  getProvider: (id: string) => Promise<any>;
  saveProvider: (provider: any) => Promise<any>;
  deleteProvider: (id: string) => Promise<any>;
  setActiveProvider: (id: string) => Promise<any>;
  getActiveProvider: () => Promise<any>;
  applyProvider: (provider: any) => Promise<any>;
  listPresets: () => Promise<any[]>;
  testProvider: (providerId: string) => Promise<any>;
  fetchModels: (baseUrl: string, apiKey: string) => Promise<any>;
  detectCurrentConfig: () => Promise<any>;
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<any>;
  getDeepCodeConfigPath: () => Promise<{ path: string; exists: boolean }>;
  ensureDeepCodeConfig: () => Promise<{ path: string; exists: boolean }>;
  launchDeepCode: () => Promise<LaunchResult>;
  openInBrowser: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    deepSwitch: DeepSwitchAPI;
  }
}

export {};
