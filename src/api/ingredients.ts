import { apiFetch } from './client';

export interface Ingredient {
  iid: string;
  name: string;
}

export async function listIngredients(): Promise<Ingredient[]> {
  return apiFetch('/ingredients');
}
