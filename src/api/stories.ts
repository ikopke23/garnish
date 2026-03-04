import { apiPrefix } from '../configuration';

export interface Story {
  sid: string;
  author_name: string;
  name: string;
  body: string;
  created_at: string;
}

export async function getStory(sid: string): Promise<Story> {
  const res = await fetch(`${apiPrefix}/stories/${sid}`);
  if (!res.ok) throw new Error('Story not found');
  return res.json();
}

export async function createStory(token: string, name: string, body: string): Promise<Story> {
  const res = await fetch(`${apiPrefix}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, body }),
  });
  if (!res.ok) throw new Error('Failed to create story');
  return res.json();
}

export async function listStories(token: string): Promise<Story[]> {
  const res = await fetch(`${apiPrefix}/stories`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to list stories');
  return res.json();
}
