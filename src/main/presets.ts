export interface ProviderPreset {
  id: string;
  /** Card name = vendor only (no model version). Model is shown in the chip. */
  name: string;
  baseUrl: string;
  model: string;
  vendor: string;
  /** Deep Code speaks OpenAI Chat Completions only — all presets below are openai format */
  apiFormat: 'openai' | 'anthropic';
  thinkingEnabled: boolean;
  reasoningEffort: 'high' | 'max';
  description: string;
  hint?: string;
  /** Which platform/auth system this uses */
  platform: string;
  /** Context window in tokens, if known */
  contextWindow?: number;
  /** Suffix appended to the card name when displayed in PresetSelector,
   *  to distinguish CN/EN variants of the same vendor. Stripped from
   *  the saved provider name. */
  cardSuffix?: string;
}

/**
 * Complete provider presets, one entry per (vendor, baseUrl) pair.
 * Card name = vendor name only — model version is shown in the chip.
 *
 * Sources cross-referenced:
 *   - farion1231/cc-switch (codexProviderPresets.ts) — model ID strings
 *   - platform.minimaxi.com/docs — MiniMax M2 confirmed code/agent optimized
 *   - api-docs.deepseek.com — deepseek-v4-pro confirmed real
 *
 * Each preset's model is the vendor's CURRENT flagship. Older models
 * (M2.7, glm-4-plus, etc.) are reachable via the /v1/models chip.
 */
export const BUILTIN_PRESETS: ProviderPreset[] = [
  // ══════════════════════════════════════════════════════
  // DeepSeek — three flavours (different model characters)
  // ══════════════════════════════════════════════════════
  {
    id: 'deepseek-v4-pro', name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com', model: 'deepseek-v4-pro',
    vendor: 'DeepSeek', platform: 'DeepSeek Platform',
    apiFormat: 'openai', thinkingEnabled: true, reasoningEffort: 'max',
    description: 'V4 Pro · 推荐 · 1M 上下文 · 深度思考 · Agent 主力',
    hint: 'https://platform.deepseek.com/api_keys 获取 Key (sk- 开头)',
  },
  {
    id: 'deepseek-v4-flash', name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com', model: 'deepseek-v4-flash',
    vendor: 'DeepSeek', platform: 'DeepSeek Platform',
    apiFormat: 'openai', thinkingEnabled: true, reasoningEffort: 'high',
    description: 'V4 Flash · 快速响应 · 性价比高 · 轻量任务首选',
  },
  {
    id: 'deepseek-r1', name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com', model: 'deepseek-reasoner',
    vendor: 'DeepSeek', platform: 'DeepSeek Platform',
    apiFormat: 'openai', thinkingEnabled: true, reasoningEffort: 'max',
    description: 'R1 纯推理 · 数学/代码/逻辑 · 思维链',
  },

  // ══════════════════════════════════════════════════════
  // Kimi / Moonshot — Open Platform (CN)
  // cc-switch equivalent: codexProviderPresets.ts "Kimi"
  // ══════════════════════════════════════════════════════
  {
    id: 'kimi-k2.7-code', name: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k2.7-code',
    vendor: 'Moonshot', platform: 'Moonshot 开放平台 (platform.moonshot.cn)',
    apiFormat: 'openai', thinkingEnabled: true, reasoningEffort: 'max',
    description: 'K2.7 Code · Coding 专用 · 256K 上下文 · 30% 减 thinking 用量',
    hint: 'platform.moonshot.cn 控制台 · Key 前缀 sk-',
    contextWindow: 262144,
  },

  // ══════════════════════════════════════════════════════
  // Kimi For Coding — Independent coding-plan platform
  // Different baseUrl and keys than the open platform above.
  // ══════════════════════════════════════════════════════
  {
    id: 'kimi-for-coding', name: 'Kimi',
    baseUrl: 'https://api.kimi.com/coding/v1', model: 'kimi-for-coding',
    vendor: 'Moonshot', platform: 'Kimi Code (www.kimi.com/code/)',
    apiFormat: 'openai', thinkingEnabled: true, reasoningEffort: 'max',
    description: 'For Coding · Kimi Plus 会员 Coding 专用 · 256K 上下文',
    hint: 'kimi.com/code 订阅 · Key 前缀 sk-kimi-',
    contextWindow: 262144,
    cardSuffix: ' · Coding',
  },

  // ══════════════════════════════════════════════════════
  // Zhipu / GLM — Open Platform
  // ══════════════════════════════════════════════════════
  {
    id: 'zhipu-glm', name: 'GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-plus',
    vendor: 'Zhipu', platform: '智谱开放平台 (open.bigmodel.cn)',
    apiFormat: 'openai', thinkingEnabled: false, reasoningEffort: 'max',
    description: 'GLM-4 Plus 旗舰 · 可下拉切换 glm-4-flash / glm-4-air 等',
    hint: 'open.bigmodel.cn 获取 Key',
  },

  // ══════════════════════════════════════════════════════
  // MiniMax — separate presets for CN and EN base URLs
  // Per official docs:
  //   CN:  api.minimaxi.com   (国内)
  //   EN:  api.minimax.io     (国际)
  // ══════════════════════════════════════════════════════
  {
    id: 'minimax-cn', name: 'MiniMax',
    baseUrl: 'https://api.minimaxi.com/v1', model: 'MiniMax-M3',
    vendor: 'MiniMax', platform: 'MiniMax 国内 (platform.minimaxi.com)',
    apiFormat: 'openai', thinkingEnabled: false, reasoningEffort: 'max',
    description: 'M3 旗舰 · 可下拉切换 M2.7 / M2 (Code 优化) / M2-highspeed 等',
    hint: 'platform.minimaxi.com 订阅 coding-plan',
    contextWindow: 200000,
    cardSuffix: ' · 国内',
  },
  {
    id: 'minimax-en', name: 'MiniMax',
    baseUrl: 'https://api.minimax.io/v1', model: 'MiniMax-M3',
    vendor: 'MiniMax', platform: 'MiniMax 国际 (platform.minimax.io)',
    apiFormat: 'openai', thinkingEnabled: false, reasoningEffort: 'max',
    description: 'M3 旗舰 · 国际版 · 可下拉切换其他模型',
    hint: 'platform.minimax.io 订阅 coding-plan',
    contextWindow: 200000,
    cardSuffix: ' · 国际',
  },

  // ══════════════════════════════════════════════════════
  // ByteDance / Doubao (Volcano Ark)
  // ══════════════════════════════════════════════════════
  {
    id: 'doubao-pro', name: '豆包',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-pro-32k',
    vendor: 'ByteDance', platform: '火山方舟 (console.volcengine.com)',
    apiFormat: 'openai', thinkingEnabled: true, reasoningEffort: 'max',
    description: 'Doubao Pro · 字节跳动 · 多模态 · 深度思考 · Coding Plan 推荐',
  },

  // ══════════════════════════════════════════════════════
  // SiliconFlow — Model Hub
  // ══════════════════════════════════════════════════════
  {
    id: 'siliconflow', name: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3',
    vendor: 'SiliconFlow', platform: 'SiliconFlow (siliconflow.cn)',
    apiFormat: 'openai', thinkingEnabled: false, reasoningEffort: 'max',
    description: '硅基流动 · 模型聚合 · DeepSeek/Qwen 等开源模型 · 免费额度',
  },

  // ══════════════════════════════════════════════════════
  // OpenRouter — Global Model Gateway
  // ══════════════════════════════════════════════════════
  {
    id: 'openrouter', name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1', model: 'deepseek/deepseek-r1',
    vendor: 'OpenRouter', platform: 'OpenRouter (openrouter.ai)',
    apiFormat: 'openai', thinkingEnabled: true, reasoningEffort: 'max',
    description: '全球模型网关 · 按量付费 · Claude/GPT/DeepSeek 等',
  },

  // ══════════════════════════════════════════════════════
  // OpenAI
  // ══════════════════════════════════════════════════════
  {
    id: 'openai', name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o',
    vendor: 'OpenAI', platform: 'OpenAI Platform',
    apiFormat: 'openai', thinkingEnabled: false, reasoningEffort: 'max',
    description: 'GPT-4o · 128K 上下文 · 多模态 · 通用标杆',
  },

  // ══════════════════════════════════════════════════════
  // Groq — Fast Inference
  // ══════════════════════════════════════════════════════
  {
    id: 'groq', name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile',
    vendor: 'Groq', platform: 'Groq Cloud',
    apiFormat: 'openai', thinkingEnabled: false, reasoningEffort: 'max',
    description: '超快推理 · LPU 芯片 · Llama 系列 · 免费额度',
  },

  // ══════════════════════════════════════════════════════
  // Custom — blank template
  // ══════════════════════════════════════════════════════
  {
    id: 'custom-blank', name: '自定义',
    baseUrl: '', model: '',
    vendor: 'Custom', platform: '任意 OpenAI 兼容端点',
    apiFormat: 'openai', thinkingEnabled: false, reasoningEffort: 'max',
    description: '空白模板 · 手动填写 Base URL / Model / Name — 私有部署、自建代理',
    hint: '下一步会让你填完整信息',
  },
];

export function getPreset(id: string): ProviderPreset | undefined {
  return BUILTIN_PRESETS.find((p) => p.id === id);
}

export function getOpenAIPresets(): ProviderPreset[] {
  return BUILTIN_PRESETS.filter((p) => p.apiFormat === 'openai');
}

/** Display name shown in the PresetSelector card (vendor + suffix, no model). */
export function presetDisplayName(p: ProviderPreset): string {
  return p.name + (p.cardSuffix ?? '');
}