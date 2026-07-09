import type { Provider, ProviderPreset } from './App';

const DEFAULT_PRESETS: ProviderPreset[] = [
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-v4-pro',
    vendor: 'DeepSeek',
    platform: 'DeepSeek Platform',
    platformEn: 'DeepSeek Platform',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'max',
    description: 'V4 Pro · 推荐 · 1M 上下文 · 深度思考 · Agent 主力',
    descriptionEn: 'V4 Pro · Recommended · 1M context · Deep reasoning · Agent-ready',
    hint: 'https://platform.deepseek.com/api_keys 获取 Key (sk- 开头)',
    hintEn: 'Get key at https://platform.deepseek.com/api_keys (sk- prefix)',
    homepageUrl: 'https://platform.deepseek.com',
  },
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-v4-flash',
    vendor: 'DeepSeek',
    platform: 'DeepSeek Platform',
    platformEn: 'DeepSeek Platform',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'high',
    description: 'V4 Flash · 快速响应 · 性价比高 · 轻量任务首选',
    descriptionEn: 'V4 Flash · Fast response · Cost-effective · Best for lightweight tasks',
    homepageUrl: 'https://platform.deepseek.com',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-reasoner',
    vendor: 'DeepSeek',
    platform: 'DeepSeek Platform',
    platformEn: 'DeepSeek Platform',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'max',
    description: 'R1 纯推理 · 数学/代码/逻辑 · 思维链',
    descriptionEn: 'R1 pure reasoning · Math / code / logic · Chain-of-thought',
    homepageUrl: 'https://platform.deepseek.com',
  },
  {
    id: 'kimi-k2.7-code',
    name: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'kimi-k2.7-code',
    vendor: 'Moonshot',
    platform: 'Moonshot 开放平台 (platform.moonshot.cn)',
    platformEn: 'Moonshot Open Platform (platform.moonshot.cn)',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'max',
    description: 'K2.7 Code · Coding 专用 · 256K 上下文 · 30% 减 thinking 用量',
    descriptionEn: 'K2.7 Code · Coding-optimized · 256K context · 30% less thinking usage',
    hint: 'platform.moonshot.cn 控制台 · Key 前缀 sk-',
    hintEn: 'Get key from platform.moonshot.cn console · sk- prefix',
    homepageUrl: 'https://platform.moonshot.cn',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    vendor: 'OpenAI',
    platform: 'OpenAI Platform',
    platformEn: 'OpenAI Platform',
    apiFormat: 'openai',
    thinkingEnabled: false,
    reasoningEffort: 'max',
    description: 'GPT-4o · 128K 上下文 · 多模态 · 通用标杆',
    descriptionEn: 'GPT-4o · 128K context · Multimodal · General benchmark',
    homepageUrl: 'https://platform.openai.com',
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V3',
    vendor: 'SiliconFlow',
    platform: 'SiliconFlow (siliconflow.cn)',
    platformEn: 'SiliconFlow (siliconflow.cn)',
    apiFormat: 'openai',
    thinkingEnabled: false,
    reasoningEffort: 'max',
    description: '硅基流动 · 模型聚合 · DeepSeek/Qwen 等开源模型 · 免费额度',
    descriptionEn: 'SiliconFlow · Model hub · DeepSeek/Qwen open models · Free tier',
    homepageUrl: 'https://siliconflow.cn',
  },
  {
    id: 'custom-blank',
    name: '自定义',
    baseUrl: '',
    model: '',
    vendor: 'Custom',
    platform: '任意 OpenAI 兼容端点',
    platformEn: 'Any OpenAI-compatible endpoint',
    apiFormat: 'openai',
    thinkingEnabled: false,
    reasoningEffort: 'max',
    description: '空白模板 · 手动填写 Base URL / Model / Name — 私有部署、自建代理',
    descriptionEn: 'Blank template · Fill in Base URL / Model / Name manually — self-hosted or private proxy',
    hint: '下一步会让你填完整信息',
    hintEn: 'Next step will ask for full details',
  },
];

const DEFAULT_PROVIDERS: Provider[] = [
  {
    id: 'prov-deepseek-r1',
    name: 'DeepSeek R1',
    baseUrl: 'https://api.deepseek.com',
    apiKey: '••••••••',
    model: 'deepseek-reasoner',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'max',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prov-deepseek-v4',
    name: 'DeepSeek V4 Pro',
    baseUrl: 'https://api.deepseek.com',
    apiKey: '••••••••',
    model: 'deepseek-v4-pro',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prov-openai-gpt4o',
    name: 'OpenAI GPT-4o',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '••••••••',
    model: 'gpt-4o',
    apiFormat: 'openai',
    thinkingEnabled: false,
    reasoningEffort: 'max',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prov-moonshot-kimi',
    name: 'Kimi K2.7 Code',
    baseUrl: 'https://api.moonshot.cn/v1',
    apiKey: '••••••••',
    model: 'kimi-k2.7-code',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'max',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prov-custom-proxy',
    name: 'Internal Proxy',
    baseUrl: 'https://llm.internal.company.com/v1',
    apiKey: '••••••••',
    model: 'gpt-4o-internal',
    apiFormat: 'openai',
    thinkingEnabled: false,
    reasoningEffort: 'max',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prov-minimax',
    name: 'Minimax abab',
    baseUrl: 'https://api.minimax.chat/v1',
    apiKey: '••••••••',
    model: 'abab6.5s-chat',
    apiFormat: 'openai',
    thinkingEnabled: false,
    reasoningEffort: 'max',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prov-qwen',
    name: 'Qwen3 Max',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '••••••••',
    model: 'qwen3-max',
    apiFormat: 'openai',
    thinkingEnabled: true,
    reasoningEffort: 'max',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function setupBrowserMock() {
  if (typeof window === 'undefined' || (window as any).deepSwitch) return;

  console.log('[Mock] Initializing browser mock layer for window.deepSwitch');

  // Helper storage keys
  const KEY_PROVIDERS = 'ds_mock_providers';
  const KEY_ACTIVE_ID = 'ds_mock_active_id';
  const KEY_SETTINGS = 'ds_mock_settings';
  const KEY_DC_EXISTS = 'ds_mock_dc_exists';

  // Seed storage if empty (or stale — bump version to refresh)
  const MOCK_VERSION = 'v3';
  if (!localStorage.getItem(KEY_PROVIDERS) || localStorage.getItem('ds_mock_version') !== MOCK_VERSION) {
    localStorage.setItem(KEY_PROVIDERS, JSON.stringify(DEFAULT_PROVIDERS));
    localStorage.setItem('ds_mock_version', MOCK_VERSION);
  }
  if (!localStorage.getItem(KEY_ACTIVE_ID)) {
    localStorage.setItem(KEY_ACTIVE_ID, 'prov-deepseek-r1');
  }
  if (!localStorage.getItem(KEY_SETTINGS)) {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify({ preferredLanguage: 'zh' }));
  }
  if (localStorage.getItem(KEY_DC_EXISTS) === null) {
    localStorage.setItem(KEY_DC_EXISTS, 'true');
  }

  const getProviders = (): Provider[] => {
    return JSON.parse(localStorage.getItem(KEY_PROVIDERS) || '[]');
  };

  const saveProviders = (list: Provider[]) => {
    localStorage.setItem(KEY_PROVIDERS, JSON.stringify(list));
  };

  (window as any).deepSwitch = {
    listProviders: async (): Promise<Provider[]> => {
      return getProviders().map((p) => ({
        ...p,
        apiKey: p.apiKey ? '••••••••' : '',
      }));
    },

    getProvider: async (id: string): Promise<Provider | null> => {
      const p = getProviders().find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        apiKey: p.apiKey === '••••••••' ? 'sk-mock-1234567890abcdef' : p.apiKey,
      };
    },

    saveProvider: async (provider: Partial<Provider> & { id?: string; name: string }): Promise<Provider> => {
      const list = getProviders();
      let saved: Provider;
      if (provider.id) {
        // Update
        const idx = list.findIndex((x) => x.id === provider.id);
        if (idx !== -1) {
          const existing = list[idx];
          saved = {
            ...existing,
            ...provider,
            apiKey: provider.apiKey === '••••••••' || !provider.apiKey ? existing.apiKey : provider.apiKey,
            updatedAt: new Date().toISOString(),
          } as Provider;
          list[idx] = saved;
        } else {
          throw new Error('Provider not found');
        }
      } else {
        // Create
        saved = {
          ...provider,
          id: 'prov-' + Math.random().toString(36).substring(2, 9),
          apiKey: provider.apiKey || '',
          thinkingEnabled: provider.thinkingEnabled ?? false,
          reasoningEffort: provider.reasoningEffort ?? 'max',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Provider;
        list.push(saved);
      }
      saveProviders(list);
      return {
        ...saved,
        apiKey: saved.apiKey ? '••••••••' : '',
      };
    },

    deleteProvider: async (id: string): Promise<boolean> => {
      const list = getProviders();
      const filtered = list.filter((x) => x.id !== id);
      saveProviders(filtered);
      const activeId = localStorage.getItem(KEY_ACTIVE_ID);
      if (activeId === id) {
        localStorage.removeItem(KEY_ACTIVE_ID);
      }
      return true;
    },

    setActiveProvider: async (id: string): Promise<void> => {
      localStorage.setItem(KEY_ACTIVE_ID, id);
    },

    getActiveProvider: async (): Promise<Provider | null> => {
      const activeId = localStorage.getItem(KEY_ACTIVE_ID);
      if (!activeId) return null;
      const found = getProviders().find((x) => x.id === activeId);
      if (!found) return null;
      return {
        ...found,
        apiKey: found.apiKey ? '••••••••' : '',
      };
    },

    applyProvider: async (provider: Provider): Promise<{ env: Record<string, string> }> => {
      localStorage.setItem(KEY_ACTIVE_ID, provider.id);
      return {
        env: {
          BASE_URL: provider.baseUrl,
          MODEL: provider.model,
        },
      };
    },

    listPresets: async (): Promise<ProviderPreset[]> => {
      const settings = JSON.parse(localStorage.getItem(KEY_SETTINGS) || '{}');
      const isZh = settings.preferredLanguage !== 'en';
      return DEFAULT_PRESETS.map((p) => ({
        ...p,
        description: isZh ? p.description : p.descriptionEn,
        platform: isZh ? p.platform : p.platformEn,
        hint: isZh ? p.hint : p.hintEn,
        cardSuffix: isZh ? p.cardSuffix : p.cardSuffixEn,
      }));
    },

    testProvider: async (providerId: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));
      const p = getProviders().find((x) => x.id === providerId);
      if (!p) {
        return { ok: false, latencyMs: 0, error: 'Provider not found' };
      }
      if (!p.baseUrl) {
        return { ok: false, latencyMs: 0, error: 'Base URL cannot be empty' };
      }
      if (!p.apiKey) {
        return { ok: false, latencyMs: 0, error: 'API Key cannot be empty' };
      }
      if (p.baseUrl.toLowerCase().includes('error')) {
        return { ok: false, latencyMs: 0, error: 'HTTP 502 Bad Gateway: Connection refused' };
      }
      return {
        ok: true,
        latencyMs: Math.round(150 + Math.random() * 200),
      };
    },

    fetchModels: async (baseUrl: string, apiKey: string): Promise<{ ok: boolean; models: string[]; error?: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (!apiKey) {
        return { ok: false, models: [], error: 'API Key is required' };
      }
      if (baseUrl.includes('deepseek')) {
        return {
          ok: true,
          models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner', 'deepseek-v4-pro', 'deepseek-v4-flash'],
        };
      }
      if (baseUrl.includes('openai')) {
        return {
          ok: true,
          models: ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'o1-preview', 'gpt-4-turbo'],
        };
      }
      if (baseUrl.includes('moonshot') || baseUrl.includes('kimi')) {
        return {
          ok: true,
          models: ['kimi-k2.7-code', 'kimi-for-coding', 'moonshot-v1-8k', 'moonshot-v1-32k'],
        };
      }
      return {
        ok: true,
        models: ['custom-model-1', 'custom-model-2', 'default-general-llm'],
      };
    },

    detectCurrentConfig: async (): Promise<any> => {
      return {
        baseUrl: 'https://api.deepseek.com',
        apiKey: 'sk-mock-detected',
        model: 'deepseek-reasoner',
        thinkingEnabled: true,
        reasoningEffort: 'max',
      };
    },

    getSettings: async (): Promise<any> => {
      return JSON.parse(localStorage.getItem(KEY_SETTINGS) || '{}');
    },

    saveSettings: async (settings: any): Promise<any> => {
      const current = JSON.parse(localStorage.getItem(KEY_SETTINGS) || '{}');
      const updated = { ...current, ...settings };
      localStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));
      return updated;
    },

    getDeepCodeConfigPath: async (): Promise<{ path: string; exists: boolean }> => {
      const exists = localStorage.getItem(KEY_DC_EXISTS) === 'true';
      return {
        path: '/Users/sky/.deepcode/settings.json',
        exists,
      };
    },

    ensureDeepCodeConfig: async (): Promise<{ path: string; exists: boolean }> => {
      localStorage.setItem(KEY_DC_EXISTS, 'true');
      return {
        path: '/Users/sky/.deepcode/settings.json',
        exists: true,
      };
    },
  };
}
