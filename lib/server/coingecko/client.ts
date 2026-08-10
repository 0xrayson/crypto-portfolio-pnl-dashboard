const BASE_URL = process.env.COINGECKO_API_BASE || "https://api.coingecko.com/api/v3";

export async function coingeckoFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = {};
  if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

  const res = await fetch(url, { headers, next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status} ${res.statusText} (${url.pathname})`);
  }
  return res.json() as Promise<T>;
}
