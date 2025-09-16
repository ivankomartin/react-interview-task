const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function request<T>(
  path: string,
  init?: RequestInit,
  params?: Record<string, any>
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    headers: { accept: "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || `Request failed ${res.status}`);
  return json as T;
}

export const get = <T>(
  path: string,
  params?: Record<string, any>,
  signal?: AbortSignal
) =>
  request<T>(
    path,
    {
      method: "GET",
      signal,
    },
    params
  );

export const post = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
