import { apiPrefix } from '../configuration';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${apiPrefix}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiFetchVoid(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<void> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${apiPrefix}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
}
