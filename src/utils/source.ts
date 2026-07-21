export const SOURCE_LABELS: Record<string, { label: string; href: (id: string) => string }> = {
  themealdb: { label: 'TheMealDB', href: (id) => `https://www.themealdb.com/meal/${id}` },
};

export interface DerivedSource {
  prefix: string;
  label: string;
  href?: string;
}

export function deriveSource(recipe: { source?: string; external_id?: string }): DerivedSource | null {
  const source = recipe.source;
  if (!source) return null;

  const catalog = SOURCE_LABELS[source];
  if (catalog && recipe.external_id) {
    return { prefix: 'Imported', label: catalog.label, href: catalog.href(recipe.external_id) };
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    try {
      const label = new URL(source).hostname.replace(/^www\./, '');
      return { prefix: 'Imported', label, href: source };
    } catch {
      // fall through to free text
    }
  }

  return { prefix: 'Source', label: source };
}
