import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Flame } from 'lucide-react';
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

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
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
          className="md:w-[200px] flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ minHeight: 0, background: 'var(--muted-hex)' }}
        >
          <div className="w-full h-[180px] md:h-full" style={{ minHeight: 160 }}>
            <div
              className="w-full h-full flex items-center justify-center text-xs"
              style={{ color: 'var(--nav-fg)', opacity: 0.4 }}
            >
              No photo
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-1">
          <p
            className="text-[10.5px] uppercase tracking-[1.5px]"
            style={{ fontFamily: '"Lora", Georgia, serif', color: 'var(--muted-hex)' }}
          >
            @{recipe.author_username ?? recipe.author_uid}
          </p>
          <h2
            className="font-semibold leading-snug md:text-[22px] text-[20px]"
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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchRecipes = async (name?: string, ingredient?: string) => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;
    setLoading(true);
    setError(null);
    try {
      const data = await listRecipes(token, name || undefined, ingredient || undefined);
      setRecipes(data);
    } catch {
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    listRecipes(token, undefined, undefined)
      .then(data => setRecipes(data))
      .catch(() => setError('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, [token]);

  const hasQuery = nameFilter || ingredientFilter;

  const clearSearch = () => {
    setNameFilter('');
    setIngredientFilter('');
    fetchRecipes(undefined, undefined);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 2rem' }} className="max-md:px-4">
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
              onKeyDown={e => e.key === 'Enter' && fetchRecipes(nameFilter, ingredientFilter)}
            />
            <Input
              placeholder="Filter by ingredient..."
              value={ingredientFilter}
              onChange={e => setIngredientFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecipes(nameFilter, ingredientFilter)}
            />
            {hasQuery && (
              <Button variant="ghost" onClick={clearSearch}>Clear</Button>
            )}
            <Button onClick={() => fetchRecipes(nameFilter, ingredientFilter)}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {loading && <p style={{ color: 'var(--muted-hex)' }}>Loading recipes...</p>}
      {error && <p style={{ color: 'var(--accent-hex)' }}>{error}</p>}

      {/* Recipe list */}
      <div className="flex flex-col" style={{ gap: 14 }}>
        {!loading && recipes.length === 0 ? (
          <div
            className="rounded-md p-8 text-center"
            style={{
              border: '2px dashed var(--border-hex)',
              color: 'var(--muted-hex)',
            }}
          >
            No recipes match — try a different search.
          </div>
        ) : (
          recipes.map(recipe => <RecipeCard key={recipe.rid} recipe={recipe} />)
        )}
      </div>
    </div>
  );
}
