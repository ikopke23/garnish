import { apiFetch, apiFetchVoid } from './client';

export interface RecipeIngredient {
  iid?: string;
  name: string;
  quantity: number;
  unit: string;
  section?: string;
  position?: number;
}

export interface IngredientGroup {
  label: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeEquipment {
  eid?: string;
  name: string;
}

export interface RecipeSection {
  section_id?: string;
  title: string;
  steps: string[];
}

export interface Recipe {
  rid: string;
  author_uid: string;
  author_username?: string;
  name: string;
  sections: RecipeSection[];
  prep_time: number;
  cook_time: number;
  servings: number;
  story_id?: string;
  disable_story: boolean;
  ingredients: RecipeIngredient[];
  equipment: RecipeEquipment[];
  created_at: string;
  is_public: boolean;
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
}

export interface RecipePayload {
  name: string;
  sections: RecipeSection[];
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: RecipeIngredient[];
  equipment: RecipeEquipment[];
  is_public?: boolean;
}

export async function listRecipes(token: string | null, name?: string, ingredient?: string): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (ingredient) params.set('ingredient', ingredient);
  return apiFetch(`/recipes?${params}`, {}, token);
}

export async function getRecipe(rid: string): Promise<Recipe> {
  return apiFetch(`/recipes/${rid}`);
}

export async function createRecipe(token: string, payload: RecipePayload): Promise<Recipe> {
  return apiFetch('/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, token);
}

export async function updateRecipe(token: string, rid: string, payload: RecipePayload): Promise<Recipe> {
  return apiFetch(`/recipes/${rid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, token);
}

export async function deleteRecipe(token: string, rid: string): Promise<void> {
  return apiFetchVoid(`/recipes/${rid}`, { method: 'DELETE' }, token);
}

export async function assignStory(token: string, rid: string, storyId: string | null, disableStory: boolean): Promise<void> {
  return apiFetchVoid(`/recipes/${rid}/story`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story_id: storyId, disable_story: disableStory }),
  }, token);
}
