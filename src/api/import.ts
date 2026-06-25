import { apiPrefix } from '../configuration';

export interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  section: string;
}

export interface ParsedEquipment {
  name: string;
}

export interface ParsedSection {
  title: string;
  steps: string[];
  position: number;
}

export interface ParsedRecipe {
  name: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: ParsedIngredient[];
  equipment: ParsedEquipment[];
  sections: ParsedSection[];
  warnings: string[];
}

export async function importRecipe(
  token: string,
  payload: { text: string } | { url: string }
): Promise<ParsedRecipe> {
  const res = await fetch(`${apiPrefix}/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Import failed (${res.status})`);
  return data as ParsedRecipe;
}
