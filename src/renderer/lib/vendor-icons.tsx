/**
 * Shared vendor → @lobehub/icons brand component map and URL-based vendor
 * detector. Used by both ProviderCard.tsx (provider list) and PresetSelector.tsx
 * (Add Provider dialog) so adding a new vendor is one place, not three.
 *
 * Why a typed string union matters: the `Vendor` keys appear in both the
 * icon map and the renderer state. If a future `guessVendor` returns a
 * string that's missing from the map, TS flags it here instead of silently
 * falling back to the monogram at render time.
 */
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

export type Vendor =
  | 'DeepSeek'
  | 'OpenAI'
  | 'Moonshot (Kimi)'
  | 'Moonshot'
  | 'Zhipu (GLM)'
  | 'SiliconFlow'
  | 'OpenRouter'
  | 'Groq'
  | 'ByteDance (Doubao)'
  | 'MiniMax'
  | 'Qwen';

/** Vendor → lobehub icon component. The .Avatar sub-component paints
 *  the official white glyph on the vendor's brand-colored tile and
 *  ships with a circular "Center" wrapper for consistent padding.
 *
 *  Side note: .Avatar transitively pulls in @lobehub/ui, antd, and
 *  @lobehub/fluent-emoji — these are all on the dependency tree
 *  because lobehub's "Center" wrapper needs them. The bundle is
 *  ~700KB unminified (~150KB gzip) but that's the cost of using
 *  the canonical lobehub Avatar instead of CDN URLs. */
export const VENDOR_ICONS: Record<Vendor, { Icon: any }> = {
  'DeepSeek':           { Icon: DeepSeek },
  'OpenAI':             { Icon: OpenAI },
  'Moonshot (Kimi)':    { Icon: Kimi },
  'Moonshot':           { Icon: Moonshot },
  'Zhipu (GLM)':        { Icon: Zhipu },
  'SiliconFlow':        { Icon: SiliconCloud },
  'OpenRouter':         { Icon: OpenRouter },
  'Groq':               { Icon: Groq },
  'ByteDance (Doubao)': { Icon: Doubao },
  'MiniMax':            { Icon: Minimax },
  'Qwen':               { Icon: Qwen },
};

/** Vendor → preset id map. PresetSelector's icon lookup keys on preset
 *  id (not vendor string) because the same vendor can ship multiple
 *  presets (e.g. DeepSeek V4 Pro / Flash / R1 → all resolve to the same
 *  DeepSeek icon). Uses .Color (see VENDOR_ICONS comment for rationale). */
export const PRESET_ICONS: Record<string, { Icon: any }> = {
  'deepseek-v4-pro':   { Icon: DeepSeek },
  'deepseek-v4-flash':  { Icon: DeepSeek },
  'deepseek-r1':        { Icon: DeepSeek },
  'kimi-k2.7-code':     { Icon: Kimi },
  'kimi-for-coding':    { Icon: Kimi },
  'zhipu-glm':          { Icon: Zhipu },
  'minimax-cn':         { Icon: Minimax },
  'minimax-en':         { Icon: Minimax },
  'doubao-pro':         { Icon: Doubao },
  'siliconflow':        { Icon: SiliconCloud },
  'openrouter':         { Icon: OpenRouter },
  'openai':             { Icon: OpenAI },
  'groq':               { Icon: Groq },
  'qwen':               { Icon: Qwen },
};

/** Substring-based vendor detection. Runs on a URL only — never on user
 *  input — so the unmatched fallback to 'Custom' is safe. Order matters:
 *  longer / more specific substrings come first. */
export function guessVendorFromUrl(baseUrl: string): Vendor | 'Custom' {
  const u = baseUrl.toLowerCase();
  if (u.includes('dashscope') || u.includes('qwen') || u.includes('tongyi')) return 'Qwen';
  if (u.includes('bigmodel') || u.includes('z.ai')) return 'Zhipu (GLM)';
  if (u.includes('minimax') || u.includes('minimaxi')) return 'MiniMax';
  if (u.includes('siliconflow')) return 'SiliconFlow';
  if (u.includes('openrouter')) return 'OpenRouter';
  if (u.includes('volces')) return 'ByteDance (Doubao)';
  if (u.includes('moonshot') || u.includes('kimi')) return 'Moonshot (Kimi)';
  if (u.includes('deepseek')) return 'DeepSeek';
  if (u.includes('openai')) return 'OpenAI';
  if (u.includes('groq')) return 'Groq';
  return 'Custom';
}
