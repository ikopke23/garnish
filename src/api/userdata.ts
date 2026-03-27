import { apiFetch } from './client';

export interface RecipeUser {
  rid: string;
  uid: string;
  rating: number | null;
  notes: string | null;
  comment_count: number;
  times_cooked: number;
}

export async function getRecipeUserData(token: string, rid: string): Promise<RecipeUser> {
  return apiFetch(`/recipes/${rid}/user-data`, {}, token);
}

export async function setRating(token: string, rid: string, rating: number): Promise<RecipeUser> {
  return apiFetch(`/recipes/${rid}/user-data/rating`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  }, token);
}

export async function setNotes(token: string, rid: string, notes: string): Promise<RecipeUser> {
  return apiFetch(`/recipes/${rid}/user-data/notes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  }, token);
}

export async function incrementCooked(token: string, rid: string): Promise<RecipeUser> {
  return apiFetch(`/recipes/${rid}/user-data/cooked`, { method: 'POST' }, token);
}
