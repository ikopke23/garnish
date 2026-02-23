import { apiPrefix } from '../configuration';

export interface Family {
  fid: string;
  name: string;
  created_at: string;
}

function authHeader(token: string): Record<string, string> {
  return { 'Authorization': `Bearer ${token}` };
}

export async function listFamilies(token: string): Promise<Family[]> {
  const res = await fetch(`${apiPrefix}/families`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to list families');
  return res.json();
}

export async function createFamily(token: string, name: string): Promise<Family> {
  const res = await fetch(`${apiPrefix}/families`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create family');
  return res.json();
}

export async function addMember(token: string, fid: string, username: string): Promise<void> {
  const res = await fetch(`${apiPrefix}/families/${fid}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error('Failed to add member');
}

export async function removeMember(token: string, fid: string, uid: string): Promise<void> {
  const res = await fetch(`${apiPrefix}/families/${fid}/members/${uid}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to remove member');
}
