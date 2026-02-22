import { apiPrefix } from '../configuration';

export interface RecipeIngredient {
  iid?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeEquipment {
  eid?: string;
  name: string;
}

export interface Recipe {
  rid: string;
  author_uid: string;
  name: string;
  steps: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  story_id?: string;
  disable_story: boolean;
  ingredients: RecipeIngredient[];
  equipment: RecipeEquipment[];
  created_at: string;
}

export interface RecipePayload {
  name: string;
  steps: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: RecipeIngredient[];
  equipment: RecipeEquipment[];
}

function authHeader(token: string | null): Record<string, string> {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function listRecipes(name?: string, ingredient?: string): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (ingredient) params.set('ingredient', ingredient);
  const res = await fetch(`${apiPrefix}/recipes?${params}`);
  if (!res.ok) throw new Error('Failed to list recipes');
  return res.json();
}

export async function getRecipe(rid: string): Promise<Recipe> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}`);
  if (!res.ok) throw new Error('Recipe not found');
  return res.json();
}

export async function createRecipe(token: string, payload: RecipePayload): Promise<Recipe> {
  const res = await fetch(`${apiPrefix}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create recipe');
  return res.json();
}

export async function updateRecipe(token: string, rid: string, payload: RecipePayload): Promise<Recipe> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update recipe');
  return res.json();
}

export async function deleteRecipe(token: string, rid: string): Promise<void> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to delete recipe');
}

export async function assignStory(token: string, rid: string, storyId: string | null, disableStory: boolean): Promise<void> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/story`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ story_id: storyId, disable_story: disableStory }),
  });
  if (!res.ok) throw new Error('Failed to assign story');
}
