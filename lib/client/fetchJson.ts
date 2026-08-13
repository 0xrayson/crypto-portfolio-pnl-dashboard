/** Fetches JSON, surfacing the real server error (our API routes return `{ error }`) and HTTP status instead of a generic message. */
export async function fetchJsonOrThrow<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.error ?? res.statusText ?? "Unknown error";
    throw new Error(`${detail} (HTTP ${res.status})`);
  }
  return res.json() as Promise<T>;
}
