import { apiFetch, apiFetchVoid } from './client';

export interface Family {
  fid: string;
  name: string;
  created_at: string;
}

export async function listFamilies(token: string): Promise<Family[]> {
  return apiFetch('/families', {}, token);
}

export async function createFamily(token: string, name: string): Promise<Family> {
  return apiFetch('/families', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }, token);
}

export async function addMember(token: string, fid: string, username: string): Promise<void> {
  return apiFetchVoid(`/families/${fid}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  }, token);
}

export async function removeMember(token: string, fid: string, uid: string): Promise<void> {
  return apiFetchVoid(`/families/${fid}/members/${uid}`, { method: 'DELETE' }, token);
}

export interface FamilyMember {
  uid: string;
  username: string;
  fid: string;
  role: 'admin' | 'member';
  recipe_count: number;
}

export async function listFamilyMembers(token: string, fid: string): Promise<FamilyMember[]> {
  return apiFetch(`/families/${fid}/members`, {}, token);
}

export async function patchFamily(token: string, fid: string, name: string): Promise<Family> {
  return apiFetch(`/families/${fid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }, token);
}

export async function deleteFamily(token: string, fid: string): Promise<void> {
  return apiFetchVoid(`/families/${fid}`, { method: 'DELETE' }, token);
}

export async function patchMemberRole(token: string, fid: string, uid: string, role: 'admin' | 'member'): Promise<void> {
  return apiFetchVoid(`/families/${fid}/members/${uid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  }, token);
}
