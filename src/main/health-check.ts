export interface TestResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  model?: string;
}

/** Normalize base URL: strip trailing slashes and /vN suffix */
function normalizeUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '').replace(/\/v\d+$/, '');
}

/**
 * Test an OpenAI-compatible endpoint by sending a minimal chat request.
 * Returns latency in ms and whether it succeeded.
 */
export async function testProviderConnection(
  baseUrl: string,
  apiKey: string,
  model: string,
  apiFormat: 'openai' | 'anthropic' = 'openai'
): Promise<TestResult> {
  const base = normalizeUrl(baseUrl);
  const isAnthropic = apiFormat === 'anthropic';

  const url = isAnthropic ? `${base}/v1/messages` : `${base}/v1/chat/completions`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (isAnthropic) {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (response.ok) {
      return { ok: true, latencyMs, model };
    }

    const errText = await response.text().catch(() => '');
    // 401/403 means key is invalid but endpoint is reachable
    if (response.status === 401 || response.status === 403) {
      return { ok: false, latencyMs, error: 'API Key 无效或已过期', model };
    }
    return { ok: false, latencyMs, error: `HTTP ${response.status}: ${errText.slice(0, 200)}`, model };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    if (err.name === 'AbortError') {
      return { ok: false, latencyMs, error: '连接超时 (8s)', model };
    }
    return { ok: false, latencyMs, error: err.message || '连接失败', model };
  }
}

/**
 * Fetch available model list from an OpenAI-compatible endpoint.
 * Returns sorted model IDs.
 */
export async function fetchModelList(baseUrl: string, apiKey: string): Promise<string[]> {
  const url = `${normalizeUrl(baseUrl)}/v1/models`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: any = await response.json();
  const models: string[] = (data.data || [])
    .map((m: any) => m.id)
    .filter((id: string) => id && typeof id === 'string');

  // Sort: put common model types first
  return models.sort();
}
