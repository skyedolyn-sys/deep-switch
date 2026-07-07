/**
 * Vendor name inference from baseUrl. Shared between renderer (sidebar)
 * and main process (tray menu). Kept duplicated rather than refactored
 * into a shared module because:
 *  - tsconfig.json (renderer) and tsconfig.main.json have different includes
 *  - the function is ~10 lines and unlikely to diverge
 */
export function guessVendorFromUrl(baseUrl: string): string {
  const url = baseUrl.toLowerCase();
  if (url.includes('deepseek')) return 'DeepSeek';
  if (url.includes('openai')) return 'OpenAI';
  if (url.includes('moonshot') || url.includes('kimi')) return 'Moonshot (Kimi)';
  if (url.includes('bigmodel') || url.includes('z.ai')) return 'Zhipu (GLM)';
  if (url.includes('minimax') || url.includes('minimaxi')) return 'MiniMax';
  if (url.includes('volces')) return 'ByteDance (Doubao)';
  if (url.includes('siliconflow')) return 'SiliconFlow';
  if (url.includes('openrouter')) return 'OpenRouter';
  if (url.includes('groq')) return 'Groq';
  return 'Custom';
}