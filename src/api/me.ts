import { apiFetch } from './client';

export interface MeUser {
  uid: string;
  username: string;
  created_at: string;
}

export interface UserStats {
  total_recipes: number;
  total_times_cooked: number;
  avg_rating: number | null;
  favorite_recipe_rid: string | null;
  favorite_recipe_name: string | null;
  favorite_recipe_times_cooked: number | null;
}

export interface FamilyWithMeta {
  fid: string;
  name: string;
  member_count: number;
  recipe_count: number;
  my_role: 'admin' | 'member';
}

export async function getMe(token: string): Promise<MeUser> {
  return apiFetch('/me', {}, token);
}

export async function patchMe(token: string, username: string): Promise<MeUser> {
  return apiFetch('/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  }, token);
}

export async function getMeStats(token: string): Promise<UserStats> {
  return apiFetch('/me/stats', {}, token);
}

export async function getMeRecipes(token: string, limit = 20, sort = 'created_at'): Promise<import('./recipes').Recipe[]> {
  const params = new URLSearchParams({ limit: String(limit), sort });
  return apiFetch(`/me/recipes?${params}`, {}, token);
}

export async function getMeStories(token: string, limit = 20): Promise<import('./stories').Story[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiFetch(`/me/stories?${params}`, {}, token);
}

export async function getMeFamilies(token: string): Promise<FamilyWithMeta[]> {
  return apiFetch('/me/families', {}, token);
}

