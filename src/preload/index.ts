import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('deepSwitch', {
  // Providers
  listProviders: (): Promise<any[]> => ipcRenderer.invoke('providers:list'),
  getProvider: (id: string): Promise<any> => ipcRenderer.invoke('providers:get', id),
  saveProvider: (provider: any): Promise<any> => ipcRenderer.invoke('providers:save', provider),
  deleteProvider: (id: string): Promise<any> => ipcRenderer.invoke('providers:delete', id),
  setActiveProvider: (id: string): Promise<any> => ipcRenderer.invoke('providers:setActive', id),
  getActiveProvider: (): Promise<any> => ipcRenderer.invoke('providers:getActive'),
  applyProvider: (provider: any): Promise<any> => ipcRenderer.invoke('providers:apply', provider),

  // Presets
  listPresets: (): Promise<any[]> => ipcRenderer.invoke('presets:list'),

  // Health check / model fetch (uses real key — backend looks it up)
  testProvider: (providerId: string): Promise<any> =>
    ipcRenderer.invoke('providers:test', { providerId }),
  fetchModels: (baseUrl: string, apiKey: string): Promise<any> =>
    ipcRenderer.invoke('models:fetch', { baseUrl, apiKey }),

  // Detect current Deep Code settings.json
  detectCurrentConfig: (): Promise<any> => ipcRenderer.invoke('detect:run'),

  // Settings
  getSettings: (): Promise<any> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: any): Promise<any> => ipcRenderer.invoke('settings:save', settings),

  // Deep Code config path
  getDeepCodeConfigPath: (): Promise<{ path: string; exists: boolean }> =>
    ipcRenderer.invoke('deepcode:path'),
  ensureDeepCodeConfig: (): Promise<{ path: string; exists: boolean }> =>
    ipcRenderer.invoke('deepcode:ensureConfig'),
});