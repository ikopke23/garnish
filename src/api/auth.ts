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

export async function forgotPassword(identifier: string): Promise<void> {
  await apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
}
