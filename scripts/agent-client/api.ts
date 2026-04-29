export interface ClientConfig {
  baseUrl: string;
  apiKey: string;
  locusApiKey?: string;
}

// Executes an authenticated JSON request against marketplace API routes.
export async function request<T>(config: ClientConfig, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
      ...(config.locusApiKey ? { "x-locus-api-key": config.locusApiKey } : {}),
      ...(init?.headers || {}),
    },
  });

  const json = await response.json();
  if (!response.ok || !json.success) throw new Error(json.error || `Request failed: ${response.status}`);
  return json.data as T;
}

// Lists active services discoverable by buyer agents.
export async function listListings(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/listings`);
  const json = await response.json();
  if (!response.ok || !json.success) throw new Error(json.error || `Request failed: ${response.status}`);
  return json.data as { listings: Array<Record<string, unknown>> };
}
