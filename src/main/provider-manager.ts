import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  apiFormat: 'openai' | 'anthropic';
  thinkingEnabled: boolean;
  reasoningEffort: 'high' | 'max';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  activeProviderId: string | null;
  deepCodeConfigPath: string;
  preferredLanguage: 'system' | 'zh' | 'en';
}

interface StoredData {
  providers: ProviderConfig[];
  settings: AppSettings;
}

const STORE_PATH = path.join(os.homedir(), '.deep-switch', 'config.json');
const DEFAULT_DEEPCODE_CONFIG = path.join(os.homedir(), '.deepcode', 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  activeProviderId: null,
  deepCodeConfigPath: DEFAULT_DEEPCODE_CONFIG,
  preferredLanguage: 'system',
};

export class ProviderManager {
  private data: StoredData;

  constructor() {
    this.data = this.load();
    this.migrateFromLegacy();
  }

  private load(): StoredData {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          providers: Array.isArray(parsed.providers) ? parsed.providers : [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch {
      // fall through
    }
    return { providers: [], settings: { ...DEFAULT_SETTINGS } };
  }

  /**
   * One-time migration: strip proxy-port and other legacy fields from saved settings.
   * Provider records keep all fields except we drop any provider whose baseUrl is the
   * local proxy (127.0.0.1:9527) — those were stale "Deep Code 配置" duplicates.
   */
  private migrateFromLegacy(): void {
    let changed = false;

    // Drop legacy settings keys (proxyPort, autoStartProxy, etc.)
    const legacyKeys: (keyof AppSettings)[] = [] as never;
    for (const key of Object.keys(this.data.settings)) {
      if (!(key in DEFAULT_SETTINGS)) {
        legacyKeys.push(key as never);
      }
    }
    for (const k of legacyKeys) {
      delete (this.data.settings as any)[k];
      changed = true;
    }

    // Drop provider entries pointing at the local proxy (127.0.0.1:9527)
    const before = this.data.providers.length;
    this.data.providers = this.data.providers.filter((p) => {
      const u = (p.baseUrl || '').toLowerCase();
      return !u.includes('127.0.0.1:9527') && !u.includes('localhost:9527');
    });
    if (this.data.providers.length !== before) changed = true;

    // Drop the provider whose apiKey got polluted with UI text (Kimi Moonshot bug)
    this.data.providers = this.data.providers.filter((p) => {
      const k = p.apiKey || '';
      // Real API keys are ~20-200 chars of mostly [A-Za-z0-9_\-]
      if (k.includes('Test Connection') || k.includes('BASIC INFO') || k.length > 500) {
        return false;
      }
      return true;
    });

    if (changed) this.save();
  }

  private save(): void {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  listProviders(): ProviderConfig[] {
    return this.data.providers.map((p) => ({
      ...p,
      apiKey: p.apiKey ? '••••••••' : '',
    }));
  }

  getProvider(id: string): ProviderConfig | undefined {
    return this.data.providers.find((p) => p.id === id);
  }

  /**
   * Save (create or update) a provider. The `apiKey` field is intentionally optional
   * on update: if the caller passes empty/undefined, the existing key is preserved
   * (fixes the bug where editing other fields wiped the saved key).
   */
  saveProvider(
    provider: Partial<ProviderConfig> & { name: string; baseUrl: string; model: string; apiKey?: string }
  ): ProviderConfig {
    if (provider.id) {
      const idx = this.data.providers.findIndex((p) => p.id === provider.id);
      if (idx >= 0) {
        const existing = this.data.providers[idx];
        const next: ProviderConfig = {
          ...existing,
          name: provider.name,
          baseUrl: provider.baseUrl,
          model: provider.model,
          apiKey: provider.apiKey && provider.apiKey.length > 0 ? provider.apiKey : existing.apiKey,
          apiFormat: provider.apiFormat ?? existing.apiFormat,
          thinkingEnabled: provider.thinkingEnabled ?? existing.thinkingEnabled,
          reasoningEffort: provider.reasoningEffort ?? existing.reasoningEffort,
          updatedAt: new Date().toISOString(),
        };
        this.data.providers[idx] = next;
        this.save();
        return next;
      }
    }
    // Create new
    const created: ProviderConfig = {
      id: uuidv4(),
      name: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey ?? '',
      model: provider.model,
      apiFormat: provider.apiFormat ?? 'openai',
      thinkingEnabled: provider.thinkingEnabled ?? false,
      reasoningEffort: provider.reasoningEffort ?? 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.providers.push(created);
    this.save();
    return created;
  }

  deleteProvider(id: string): boolean {
    const idx = this.data.providers.findIndex((p) => p.id === id);
    if (idx < 0) return false;
    this.data.providers.splice(idx, 1);
    if (this.data.settings.activeProviderId === id) {
      this.data.settings.activeProviderId = null;
    }
    this.save();
    return true;
  }

  setActiveProvider(id: string): boolean {
    if (!this.data.providers.find((p) => p.id === id)) return false;
    this.data.settings.activeProviderId = id;
    this.save();
    return true;
  }

  getActiveProvider(): ProviderConfig | undefined {
    if (!this.data.settings.activeProviderId) return undefined;
    return this.data.providers.find((p) => p.id === this.data.settings.activeProviderId);
  }

  getSettings(): AppSettings {
    return { ...this.data.settings };
  }

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  // ─── Deep Code settings.json bridge ──────────────────────────────────────

  /**
   * Resolves the active Deep Code settings.json path and ensures the parent
   * directory exists. Defaults to ~/.deepcode/settings.json if the user has
   * never configured a custom path.
   */
  getDeepCodeConfigPath(): string {
    const configured = this.data.settings.deepCodeConfigPath;
    return configured && configured.length > 0 ? configured : DEFAULT_DEEPCODE_CONFIG;
  }

  /**
   * Ensure the Deep Code config file exists. If it does not, create an empty
   * settings.json so Deep Switch can write to it immediately.
   */
  ensureDeepCodeConfigExists(): void {
    const configPath = this.getDeepCodeConfigPath();
    if (fs.existsSync(configPath)) return;

    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ env: {} }, null, 2), 'utf-8');
  }

  /**
   * True if the configured Deep Code settings.json exists.
   */
  hasDeepCodeConfig(): boolean {
    return fs.existsSync(this.getDeepCodeConfigPath());
  }

  /**
   * Read whatever Deep Code is currently configured to use. Used for the
   * "Detect" button and to decide if the user's current env already matches
   * one of our stored providers.
   */
  readCurrentDeepCodeConfig(): ProviderConfig | null {
    try {
      const configPath = this.getDeepCodeConfigPath();
      if (!fs.existsSync(configPath)) return null;
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const env = config.env || {};
      const baseUrl = env.BASE_URL || '';
      const apiKey = env.API_KEY || '';
      const model = env.MODEL || config.model || '';
      if (!baseUrl || !apiKey || !model) return null;
      return {
        id: '',
        name: `Deep Code (${model})`,
        baseUrl,
        apiKey,
        model,
        apiFormat: 'openai',
        thinkingEnabled: !!config.thinkingEnabled,
        reasoningEffort: (config.reasoningEffort as 'high' | 'max') ?? 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Apply the given provider's credentials directly into Deep Code's
   * settings.json. Deep Code reads this file on every query, so changes are
   * effective immediately for new prompts.
   *
   * Side effect: also marks the provider as active in our store.
   * Returns the freshly-written settings.json content for confirmation.
   */
  applyToDeepCode(provider: ProviderConfig): { env: Record<string, string> } {
    this.ensureDeepCodeConfigExists();

    const configPath = this.getDeepCodeConfigPath();
    let existing: any = {};
    if (fs.existsSync(configPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch {
        existing = {};
      }
    }

    existing.env = {
      ...(existing.env || {}),
      BASE_URL: provider.baseUrl,
      API_KEY: provider.apiKey,
      MODEL: provider.model,
    };
    if (typeof provider.thinkingEnabled === 'boolean') {
      existing.thinkingEnabled = provider.thinkingEnabled;
    }
    if (provider.reasoningEffort) {
      existing.reasoningEffort = provider.reasoningEffort;
    }

    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(existing, null, 2), 'utf-8');

    this.setActiveProvider(provider.id);

    return { env: existing.env };
  }
}