import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Users, Flame, X } from 'lucide-react';
import { listRecipes, Recipe } from '../api/recipes';
import { useAuth } from '../context/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function IngredientSummary({ ingredients }: { ingredients: Recipe['ingredients'] }) {
  if (!ingredients || ingredients.length === 0) return null;
  const shown = ingredients.slice(0, 6).map(i => i.name).join(' · ');
  const extra = ingredients.length > 6 ? ` +${ingredients.length - 6} more` : '';
  return (
    <p
      className="text-sm text-muted-foreground"
      style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {shown}{extra}
    </p>
  );
}

function RecipeCard({ recipe, searchedCount }: { recipe: Recipe; searchedCount: number }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const showMatch = searchedCount > 0 && recipe.match_count != null;
  const fullMatch = recipe.match_count === searchedCount;
  return (
    <Link to={`/recipes/${recipe.rid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        className={cn(
          'recipe-card rounded-md overflow-hidden border flex md:flex-row flex-col',
          'transition-transform duration-150 cursor-pointer'
        )}
        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-hex)' }}
      >
        {/* Image */}
        <div
          className="md:w-[90px] flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ minHeight: 0, background: 'var(--muted-hex)' }}
        >
          <div className="w-full h-[180px] md:h-full" style={{ minHeight: 160 }}>
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--primary-hex) 12%, var(--card-bg))' }}
            >
              <span style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 56, color: 'var(--primary-hex)', opacity: 0.4 }}>
                {recipe.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-1">
          {showMatch && (
            <span
              className="inline-flex items-center self-start px-2 py-0.5 text-[11px] uppercase tracking-[1px]"
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                borderRadius: 20,
                background: fullMatch
                  ? 'color-mix(in oklab, var(--g-primary) 14%, var(--g-bg))'
                  : 'var(--g-muted-bg)',
                border: fullMatch ? '1px solid var(--g-primary)' : '1px solid var(--border-hex)',
                color: fullMatch ? 'var(--g-primary)' : 'var(--muted-hex)',
              }}
            >
              {recipe.match_count}/{searchedCount} ingredients
            </span>
          )}
          <p
            className="text-[10.5px] uppercase tracking-[1.5px] truncate"
            style={{ fontFamily: '"Lora", Georgia, serif', color: 'var(--muted-hex)' }}
          >
            @{recipe.author_username ?? recipe.author_uid}
          </p>
          <h2
            className="font-semibold truncate md:text-[22px] text-[20px]"
            style={{
              fontFamily: '"Cinzel", Georgia, serif',
              color: 'var(--text)',
            }}
          >
            {recipe.name}
          </h2>
          <div
            className="flex items-center gap-4 text-[12px]"
            style={{ fontFamily: '"Lora", Georgia, serif', color: 'var(--muted-hex)' }}
          >
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={12} />{totalTime}m
              </span>
            )}
            {recipe.servings > 0 && (
              <span className="flex items-center gap-1">
                <Users size={12} />{recipe.servings}
              </span>
            )}
            {recipe.calories > 0 && (
              <span className="flex items-center gap-1">
                <Flame size={12} />{recipe.calories}
              </span>
            )}
          </div>
          <IngredientSummary ingredients={recipe.ingredients} />
        </div>
      </div>
    </Link>
  );
}

export default function RecipeFeed() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const initialFamily = searchParams.get('family') ?? '';
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [pendingIngredient, setPendingIngredient] = useState('');
  const [familyFilter, setFamilyFilter] = useState(initialFamily);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  const addIngredient = () => {
    const trimmed = pendingIngredient.trim();
    if (trimmed && !ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
    }
    setPendingIngredient('');
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const fetchRecipes = async (name?: string, ingredientList?: string[], family?: string) => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;
    setLoading(true);
    setError(null);
    try {
      const data = await listRecipes(token, name || undefined, ingredientList?.length ? ingredientList : undefined, family || undefined);
      setRecipes(data);
    } catch {
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    listRecipes(token, undefined, undefined, familyFilter || undefined)
      .then(data => setRecipes(data))
      .catch(() => setError('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, [token, familyFilter]);

  const hasQuery = nameFilter || ingredients.length > 0;

  const clearSearch = () => {
    setNameFilter('');
    setIngredients([]);
    setPendingIngredient('');
    setFamilyFilter('');
    fetchRecipes(undefined, undefined, undefined);
  };

  const runSearch = () => {
    const trimmed = pendingIngredient.trim();
    const effective = trimmed && !ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())
      ? [...ingredients, trimmed]
      : ingredients;
    if (effective !== ingredients) setIngredients(effective);
    setPendingIngredient('');
    fetchRecipes(nameFilter, effective, familyFilter);
  };

  return (
    <div style={{ maxWidth: 1680, width: '100%', margin: '0 auto', padding: '2rem 2rem' }} className="max-md:px-4">
      {/* Feed header */}
      <div className="flex items-baseline justify-between mb-6">
        <h1
          className="md:text-[34px] text-[26px] font-medium"
          style={{ fontFamily: '"Cinzel", Georgia, serif' }}
        >
          Tonight
        </h1>
        <span style={{ fontFamily: '"Lora", Georgia, serif', color: 'var(--muted-hex)', fontSize: 14 }}>
          {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search panel */}
      <Card className="mb-6" style={{ background: 'var(--card-bg)' }}>
        <CardContent className="pt-4">
          <div className="flex md:flex-row flex-col gap-3">
            <Input
              placeholder="Recipe name..."
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecipes(nameFilter, ingredients, familyFilter)}
            />
            <div className="flex-1 flex flex-col gap-2">
              <Input
                placeholder="Add ingredient..."
                value={pendingIngredient}
                onChange={e => setPendingIngredient(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
              />
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing, idx) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border"
                      style={{
                        borderRadius: 20,
                        background: 'color-mix(in oklab, var(--g-muted) 15%, var(--g-bg))',
                        color: 'var(--g-text)',
                      }}
                    >
                      {ing}
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        aria-label={`Remove ${ing}`}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', display: 'inline-flex' }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {hasQuery && (
              <Button variant="ghost" onClick={clearSearch}>Clear</Button>
            )}
            <Button onClick={runSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {loading && <p style={{ color: 'var(--muted-hex)' }}>Loading recipes...</p>}
      {error && <p style={{ color: 'var(--accent-hex)' }}>{error}</p>}

      {/* Family filter indicator */}
      {familyFilter && (
        <div className="flex items-center gap-2 mb-4 text-sm"
          style={{ color: 'var(--g-muted)', fontFamily: 'Lora, Georgia, serif' }}>
          <span>Showing recipes from a family</span>
          <button
            onClick={() => { setFamilyFilter(''); }}
            style={{ color: 'var(--g-primary)', fontFamily: 'Lora, Georgia, serif', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            × clear filter
          </button>
        </div>
      )}

      {/* Recipe list */}
      <div
        className="max-md:flex max-md:flex-col md:grid"
        style={{ gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
      >
        {!loading && recipes.length === 0 ? (
          <div
            className="rounded-md p-8 text-center"
            style={{
              border: '2px dashed var(--border-hex)',
              color: 'var(--muted-hex)',
            }}
          >
            No recipes match - try a different search.
          </div>
        ) : (
          recipes.map(recipe => <RecipeCard key={recipe.rid} recipe={recipe} searchedCount={ingredients.length} />)
        )}
      </div>
    </div>
  );
}
