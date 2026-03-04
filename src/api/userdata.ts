import { apiPrefix } from '../configuration';

export interface RecipeUser {
  rid: string;
  uid: string;
  rating: number | null;
  notes: string | null;
  comment_count: number;
  times_cooked: number;
}

export async function getRecipeUserData(token: string, rid: string): Promise<RecipeUser> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/user-data`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get user data');
  return res.json();
}

export async function setRating(token: string, rid: string, rating: number): Promise<RecipeUser> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/user-data/rating`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) throw new Error('Failed to set rating');
  return res.json();
}

export async function setNotes(token: string, rid: string, notes: string): Promise<RecipeUser> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/user-data/notes`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error('Failed to set notes');
  return res.json();
}

export async function incrementCooked(token: string, rid: string): Promise<RecipeUser> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/user-data/cooked`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to increment cooked');
  return res.json();
}
