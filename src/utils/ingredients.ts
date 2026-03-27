export interface IngredientGroup<T> {
  label: string;
  ingredients: T[];
}

export function groupIngredientsBySection<T extends { section?: string }>(
  ingredients: T[],
): IngredientGroup<T>[] {
  const groups: IngredientGroup<T>[] = [];
  const seen = new Map<string, IngredientGroup<T>>();
  for (const ing of ingredients) {
    const key = ing.section ?? '';
    if (!seen.has(key)) {
      const g: IngredientGroup<T> = { label: key, ingredients: [] };
      groups.push(g);
      seen.set(key, g);
    }
    seen.get(key)!.ingredients.push(ing);
  }
  return groups;
}
