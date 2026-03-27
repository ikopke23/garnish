import { apiFetch } from './client';

export async function register(username: string, email: string, password: string): Promise<{ token: string }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(username: string, password: string): Promise<{ token: string }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function getMe(token: string): Promise<{ uid: string; username: string }> {
  return apiFetch('/auth/me', {}, token);
}
