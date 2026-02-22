import { apiPrefix } from '../configuration';

export interface Ingredient {
  iid: string;
  name: string;
}

export async function listIngredients(): Promise<Ingredient[]> {
  const res = await fetch(`${apiPrefix}/ingredients`);
  if (!res.ok) throw new Error('Failed to list ingredients');
  return res.json();
}
