import { apiPrefix } from '../configuration';
import { apiFetch, apiFetchVoid } from './client';

export interface Story {
  sid: string;
  author_uid: string | null;
  author_name: string;
  name: string;
  body: string;
  is_placeholder: boolean;
  created_at: string;
  updated_at: string;
}

export async function getStory(sid: string): Promise<Story> {
  return apiFetch(`/stories/${sid}`);
}

export async function createStory(token: string, name: string, body: string): Promise<Story> {
  return apiFetch('/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, body }),
  }, token);
}

export async function listStories(): Promise<Story[]> {
  return apiFetch('/stories');
}

export async function updateStory(token: string, sid: string, name: string, body: string): Promise<Story> {
  return apiFetch(`/stories/${sid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, body }),
  }, token);
}

export async function deleteStory(token: string, sid: string): Promise<void> {
  return apiFetchVoid(`/stories/${sid}`, { method: 'DELETE' }, token);
}

export async function getUserStories(uid: string): Promise<Story[]> {
  return apiFetch(`/users/${uid}/stories`);
}

export async function getRandomStory(excludeSID?: string): Promise<Story | null> {
  const url = excludeSID
    ? `${apiPrefix}/stories/random?exclude=${encodeURIComponent(excludeSID)}`
    : `${apiPrefix}/stories/random`;
  const res = await fetch(url);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
