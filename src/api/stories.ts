import { apiFetch } from './client';

export interface Story {
  sid: string;
  author_name: string;
  name: string;
  body: string;
  created_at: string;
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

export async function listStories(token: string): Promise<Story[]> {
  return apiFetch('/stories', {}, token);
}
