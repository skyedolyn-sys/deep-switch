/**
 * Per-provider quota fetchers. Best-effort: each entry tries a known
 * billing/credits endpoint and returns a short label, or null if the
 * endpoint isn't reachable / doesn't apply.
 *
 * Results are cached for 5 minutes per (baseUrl, apiKey hash).
 */

export interface QuotaInfo {
  text: string; // pre-formatted, e.g. "¥12.30" or "h17% w5%"
}

interface QuotaFetcher {
  matches: (baseUrl: string) => boolean;
  fetch: (baseUrl: string, apiKey: string) => Promise<QuotaInfo | null>;
}

// ─── Helpers ──────────────────────────────────────────────────────

function normalizeUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '').replace(/\/v\d+$/, '');
}

async function safeJson(url: string, headers: Record<string, string>): Promise<any | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function bearerHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}` };
}

// ─── DeepSeek ────────────────────────────────────────────────────
// Endpoint shape: { balance: [{ currency: "CNY", total_balance: "12.30", ... }, ...] }
const deepseek: QuotaFetcher = {
  matches: (u) => u.toLowerCase().includes('deepseek'),
  fetch: async (baseUrl, apiKey) => {
    const url = `${normalizeUrl(baseUrl)}/user/balance`;
    const data = await safeJson(url, bearerHeaders(apiKey));
    const entry = data?.balance?.[0];
    if (!entry || entry.total_balance == null) return null;
    const amount = Number(entry.total_balance);
    if (!Number.isFinite(amount)) return null;
    const symbol = entry.currency === 'USD' ? '$' : '¥';
    return { text: `${symbol}${amount.toFixed(2)}` };
  },
};

// ─── MiniMax (CN + EN) ──────────────────────────────────────
// Endpoint shape mirrors OpenAI's billing response.
const minimax: QuotaFetcher = {
  matches: (u) => u.toLowerCase().includes('minimax'),
  fetch: async (baseUrl, apiKey) => {
    const url = `${normalizeUrl(baseUrl)}/v1/billing/balance`;
    const data = await safeJson(url, bearerHeaders(apiKey));
    // OpenAI-like shape: { granted_balance, balance, ... } or wrapper
    const balance = data?.balance ?? data?.granted_balance;
    if (balance == null) return null;
    const amount = Number(balance);
    if (!Number.isFinite(amount)) return null;
    return { text: `¥${amount.toFixed(2)}` };
  },
};

// ─── OpenRouter ──────────────────────────────────────────────────
// Endpoint: GET https://openrouter.ai/api/v1/credits
// Response: { data: { total_credits, total_usage } }
const openrouter: QuotaFetcher = {
  matches: (u) => u.toLowerCase().includes('openrouter'),
  fetch: async (_baseUrl, apiKey) => {
    const data = await safeJson('https://openrouter.ai/api/v1/credits', bearerHeaders(apiKey));
    const d = data?.data;
    if (!d) return null;
    const remaining = Number(d.total_credits) - Number(d.total_usage);
    if (!Number.isFinite(remaining)) return null;
    return { text: `$${remaining.toFixed(2)}` };
  },
};

// ─── Zhipu GLM ───────────────────────────────────────────────────
// Endpoint shape: { data: [{ amount, currency, ... }] } or similar.
const zhipu: QuotaFetcher = {
  matches: (u) => {
    const l = u.toLowerCase();
    return l.includes('bigmodel') || l.includes('z.ai');
  },
  fetch: async (baseUrl, apiKey) => {
    // Try both common paths
    const candidates = [
      `${normalizeUrl(baseUrl)}/api/paas/v4/billing/balance`,
      `${normalizeUrl(baseUrl)}/billing/balance`,
    ];
    for (const url of candidates) {
      const data = await safeJson(url, bearerHeaders(apiKey));
      const amount = data?.data?.[0]?.amount ?? data?.balance ?? data?.amount;
      if (amount != null) {
        const n = Number(amount);
        if (Number.isFinite(n)) {
          return { text: `¥${n.toFixed(2)}` };
        }
      }
    }
    return null;
  },
};

// ─── Kimi (Moonshot) ─────────────────────────────────────────────
// Moonshot doesn't publicly document a balance endpoint. We could call
// /v1/users/me to verify the key works, but it returns user info not
// quota. Skip in v1 — tray menu falls back to latency-only display.
const kimi: QuotaFetcher = {
  matches: (u) => {
    const l = u.toLowerCase();
    return l.includes('moonshot') || l.includes('kimi');
  },
  fetch: async () => null,
};

// ─── Registry ────────────────────────────────────────────────────

export const QUOTA_FETCHERS: QuotaFetcher[] = [deepseek, openrouter, minimax, zhipu, kimi];

// ─── Cache ───────────────────────────────────────────────────────

const QUOTA_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { info: QuotaInfo | null; fetchedAt: number }>();

function cacheKey(baseUrl: string, apiKey: string): string {
  // Key hash = last 8 chars of apiKey is enough for cache identity;
  // baseUrl catches the case of multiple providers reusing the same key.
  return `${baseUrl}::${apiKey.slice(-8)}`;
}

export async function fetchQuota(baseUrl: string, apiKey: string): Promise<QuotaInfo | null> {
  const key = cacheKey(baseUrl, apiKey);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < QUOTA_TTL_MS) {
    return cached.info;
  }

  const fetcher = QUOTA_FETCHERS.find((f) => f.matches(baseUrl));
  if (!fetcher) {
    cache.set(key, { info: null, fetchedAt: Date.now() });
    return null;
  }

  const info = await fetcher.fetch(baseUrl, apiKey);
  cache.set(key, { info, fetchedAt: Date.now() });
  return info;
}