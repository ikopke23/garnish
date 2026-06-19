import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, Flame } from 'lucide-react';
import { getRecipe, deleteRecipe, Recipe } from '../api/recipes';
import { groupIngredientsBySection } from '../utils/ingredients';
import { getStory, getRandomStory, Story } from '../api/stories';
import { useAuth } from '../context/useAuth';
import { RecipePhoto, listPhotos, uploadPhoto } from '../api/photos';
import { RecipeUser, getRecipeUserData, setRating as setRatingAPI, setNotes as setNotesAPI, incrementCooked } from '../api/userdata';
import StarRating from '../components/StarRating';
import CommentsSection from '../components/CommentsSection';
import ProgressMini from '../components/ProgressMini';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRecipeProgress } from '../hooks/useRecipeProgress';
import CookMode from '../components/CookMode';

export default function RecipeDetail() {
  const { rid } = useParams<{ rid: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useRecipeProgress(rid ?? '');
  const checkedIngredients = new Set(progress.ingredients);
  const checkedSteps = new Set(progress.steps);
  const [cookModeOpen, setCookModeOpen] = useState(false);
  const [photos, setPhotos] = useState<RecipePhoto[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [randomStory, setRandomStory] = useState<Story | null>(null);
  const [recipeUser, setRecipeUser] = useState<RecipeUser | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!rid) return;
    getRecipe(rid)
      .then(setRecipe)
      .catch(() => setError('Recipe not found'))
      .finally(() => setLoading(false));
  }, [rid]);

  useEffect(() => {
    if (rid) listPhotos(rid).then(setPhotos).catch(() => {});
  }, [rid]);

  useEffect(() => {
    if (recipe?.story_id && !recipe.disable_story) {
      getStory(token ?? '', recipe.story_id).then(s => {
        setStory(s);
        if (s.is_placeholder) {
          getRandomStory(s.sid).then(setRandomStory).catch(() => setRandomStory(null));
        } else {
          setRandomStory(null);
        }
      }).catch(() => {});
    } else {
      setStory(null);
      setRandomStory(null);
    }
  }, [recipe?.story_id, recipe?.disable_story, token]);

  useEffect(() => {
    if (isAuthenticated && token && rid) {
      getRecipeUserData(token, rid)
        .then(ru => {
          setRecipeUser(ru);
          setUserRating(ru.rating);
          setUserNotes(ru.notes ?? '');
        })
        .catch(() => {});
    }
  }, [rid, isAuthenticated, token]);

  const handleDelete = async () => {
    if (!token || !rid || !confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(token, rid);
      navigate('/');
    } catch {
      setError('Failed to delete recipe');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !rid) return;
    try {
      const photo = await uploadPhoto(token, rid, file);
      setPhotos(prev => [...prev, photo]);
    } catch {
      setError('Failed to upload photo');
    }
  };

  const handleCooked = async () => {
    if (!token || !rid) return;
    try {
      const updated = await incrementCooked(token, rid);
      setRecipeUser(updated);
    } catch {
      setError('Failed to update cooked count');
    }
  };

  const saveRating = async (r: number) => {
    if (!token || !rid) return;
    setUserRating(r);
    await setRatingAPI(token, rid, r).catch(() => {});
  };

  const saveNotes = async () => {
    if (!token || !rid) return;
    await setNotesAPI(token, rid, userNotes).catch(() => {});
  };

  const toggleIngredient = (key: string) => {
    const next = new Set(checkedIngredients);
    if (next.has(key)) { next.delete(key); } else { next.add(key); }
    setProgress({ ingredients: [...next] });
  };

  const toggleStep = (key: string) => {
    const next = new Set(checkedSteps);
    if (next.has(key)) { next.delete(key); } else { next.add(key); }
    setProgress({ steps: [...next] });
  };

  if (loading) return <div className="py-8 px-4">Loading...</div>;
  if (error || !recipe) return <div className="py-8 px-4" style={{ color: 'var(--accent-hex)' }}>{error || 'Recipe not found'}</div>;

  const isOwner = isAuthenticated && user?.uid === recipe.author_uid;
  const primaryPhoto = photos[0];

  const allIngredients = recipe.ingredients ?? [];
  const ingTotal = allIngredients.length;
  const ingDone = checkedIngredients.size;

  const allSteps = recipe.sections?.flatMap((s, si) => s.steps.map((_, i) => `${si}-${i}`)) ?? [];
  const stepsDone = allSteps.filter(k => checkedSteps.has(k)).length;
  const stepsTotal = allSteps.length;

  const stats = [
    { label: 'Prep', value: recipe.prep_time > 0 ? `${recipe.prep_time}m` : '—' },
    { label: 'Cook', value: recipe.cook_time > 0 ? `${recipe.cook_time}m` : '—' },
    { label: 'Serves', value: recipe.servings > 0 ? recipe.servings : '—' },
    { label: 'kcal', value: recipe.calories > 0 ? recipe.calories : '—' },
    { label: 'Protein', value: recipe.proteins > 0 ? `${recipe.proteins}g` : '—' },
    { label: 'Carbs', value: recipe.carbs > 0 ? `${recipe.carbs}g` : '—' },
    { label: 'Fat', value: recipe.fats > 0 ? `${recipe.fats}g` : '—' },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 360, background: 'var(--muted-hex)' }}
      >
        {primaryPhoto && (
          <img
            src={primaryPhoto.link}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)' }}
        />
        {/* Back button */}
        <Link to="/" className="absolute top-4 left-4">
          <button
            className="rounded-full px-4 py-2 text-white text-sm"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer' }}
          >
            ← Back
          </button>
        </Link>
        {/* Title block */}
        <div className="absolute bottom-0 left-0 right-0" style={{ padding: '0 2rem 1.5rem' }}>
          <p style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, opacity: 0.9, color: 'white' }}>
            Family Recipe · @{recipe.author_username}
          </p>
          <h1
            className="md:text-[42px] text-[26px] font-semibold leading-tight mb-3"
            style={{ fontFamily: '"Cinzel", Georgia, serif', color: 'white' }}
          >
            {recipe.name}
          </h1>
          <div className="flex items-center gap-5" style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 12, color: 'white' }}>
            {recipe.prep_time > 0 && (
              <span className="flex items-center gap-1"><Clock size={14} />{recipe.prep_time}m prep</span>
            )}
            {recipe.servings > 0 && (
              <span className="flex items-center gap-1"><Users size={14} />{recipe.servings} serves</span>
            )}
            {recipe.calories > 0 && (
              <span className="flex items-center gap-1"><Flame size={14} />{recipe.calories} kcal</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Story banner ── */}
      {story && !story.is_placeholder && (
        <div className="story-banner mx-8 max-md:mx-4 relative z-10" style={{ marginTop: '-28px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
          <p style={{ fontFamily: '"Cinzel", Georgia, serif', fontWeight: 600, color: 'var(--primary-hex)', marginBottom: 4 }}>{story.name}</p>
          <p style={{ fontStyle: 'italic', fontFamily: '"Lora", Georgia, serif' }}>{story.body}</p>
          <p className="text-sm" style={{ color: 'var(--muted-hex)', marginTop: 12 }}>— {story.author_name}</p>
        </div>
      )}
      {story?.is_placeholder && (
        <div className="mx-8 max-md:mx-4 mt-4 p-3 rounded" style={{ background: 'color-mix(in srgb, var(--secondary-hex) 20%, var(--card-bg))', borderLeft: '4px solid var(--secondary-hex)' }}>
          <strong>Story needed:</strong> {story.body}
        </div>
      )}
      {story?.is_placeholder && randomStory && (
        <div className="story-banner mx-8 max-md:mx-4 mt-4">
          <p className="text-sm mb-1" style={{ color: 'var(--muted-hex)' }}>You might enjoy this story:</p>
          <p style={{ fontFamily: '"Cinzel", Georgia, serif', fontWeight: 600, color: 'var(--primary-hex)', marginBottom: 4 }}>{randomStory.name}</p>
          <p style={{ fontStyle: 'italic' }}>{randomStory.body}</p>
          <p className="text-sm mt-3" style={{ color: 'var(--muted-hex)' }}>— {randomStory.author_name}</p>
        </div>
      )}

      {/* ── Stats strip ── */}
      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0', padding: '0 2rem' }} className="max-md:px-4">
        <div
          className="md:grid md:grid-cols-7 flex overflow-x-auto border rounded-md"
          style={{ borderColor: 'var(--border-hex)' }}
        >
          {stats.map(stat => (
            <div
              key={stat.label}
              className="p-4 text-center flex-shrink-0 border-r last:border-r-0"
              style={{ borderColor: 'var(--border-hex)', minWidth: 100 }}
            >
              <p style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted-hex)' }}>{stat.label}</p>
              <p style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 18, fontWeight: 600, color: 'var(--primary-hex)' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body grid ── */}
      <div
        style={{ maxWidth: 1200, margin: '2rem auto 0', padding: '0 2rem' }}
        className="max-md:px-4 grid md:grid-cols-[300px_1fr] gap-10 max-md:gap-7"
      >
        {/* Left: Ingredients + Equipment */}
        <div>
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>Ingredients</h2>
                <ProgressMini done={ingDone} total={ingTotal} />
              </div>
              {(() => {
                const groups = groupIngredientsBySection(recipe.ingredients!);
                return groups.map((group, gi) => (
                  <div key={gi} className="mb-3">
                    {group.label && <div className="ing-section-header">{group.label}</div>}
                    {group.ingredients.map(ing => {
                      const key = ing.iid || ing.name;
                      const done = checkedIngredients.has(key);
                      return (
                        <label
                          key={key}
                          className={cn('ingredient-row flex items-start gap-3 py-2 cursor-pointer', done && 'checked')}
                          style={{ borderBottom: '1px dotted var(--border-hex)' }}
                        >
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => toggleIngredient(key)}
                            style={{ accentColor: 'var(--primary-hex)', marginTop: 2, flexShrink: 0 }}
                          />
                          <span style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 13.5 }}>
                            {ing.quantity > 0 && (
                              <span style={{ fontWeight: 700, color: 'var(--primary-hex)' }}>
                                {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}
                              </span>
                            )}{' '}
                            <span style={{ color: 'var(--text)' }}>{ing.name}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ));
              })()}
            </section>
          )}

          {recipe.equipment && recipe.equipment.length > 0 && (
            <section>
              <div className="ing-section-header mb-3">Equipment</div>
              <div className="flex flex-wrap gap-2">
                {recipe.equipment.map(eq => (
                  <Badge key={eq.eid || eq.name} variant="secondary">{eq.name}</Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Method */}
        <div>
          {recipe.sections && recipe.sections.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>Method</h2>
                <div className="flex items-center gap-2">
                  <ProgressMini done={stepsDone} total={stepsTotal} />
                  <Button variant="outline" size="sm" className="no-print" onClick={() => setCookModeOpen(true)}>
                    Cook Mode
                  </Button>
                </div>
              </div>
              {(() => {
                let globalStepNum = 0;
                return recipe.sections!.map((sec, sIdx) => (
                  <div key={sIdx} className="mb-6">
                    {sec.title && <div className="method-section-header">{sec.title}</div>}
                    {sec.steps.map((step, i) => {
                      const key = `${sIdx}-${i}`;
                      const done = checkedSteps.has(key);
                      const num = ++globalStepNum;
                      return (
                        <div
                          key={key}
                          className={cn('flex items-start gap-3 mb-4 cursor-pointer', done && 'opacity-45')}
                          onClick={() => toggleStep(key)}
                        >
                          <div className={cn('step-badge', done && 'done')}>{done ? '✓' : num}</div>
                          <p
                            className={cn('flex-1', done && 'line-through')}
                            style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 14.5, lineHeight: 1.6 }}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </section>
          )}
        </div>
      </div>

      {/* ── Bottom action row ── */}
      <div
        style={{ maxWidth: 1200, margin: '2rem auto 3rem', padding: '0 2rem' }}
        className="max-md:px-4 flex flex-col gap-4"
      >
        {/* Photo upload (owner only) */}
        {isOwner && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="text-sm"
              style={{ color: 'var(--muted-hex)' }}
            />
          </div>
        )}

        {/* User interactions */}
        {isAuthenticated && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button onClick={handleCooked} variant="secondary">I Cooked This!</Button>
              {(recipeUser?.times_cooked ?? 0) > 0 && (
                <span className="text-sm" style={{ color: 'var(--muted-hex)' }}>
                  Cooked {recipeUser!.times_cooked}×
                </span>
              )}
            </div>
            <div>
              <p className="mb-2" style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 13 }}>Your Rating</p>
              <StarRating value={userRating} onChange={saveRating} />
            </div>
            <div>
              <p className="mb-2" style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 13 }}>Your Notes</p>
              <textarea
                value={userNotes}
                onChange={e => setUserNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Add a personal note..."
                style={{ resize: 'both', width: '100%', minHeight: 80, padding: '8px 12px', borderRadius: 4, border: '1px solid var(--border-hex)', background: 'var(--bg)', color: 'var(--text)', fontFamily: '"Lora", Georgia, serif', fontSize: 13.5 }}
              />
            </div>
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/recipes/${rid}/edit`}>Edit</Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              style={{ borderColor: 'var(--accent-hex)', color: 'var(--accent-hex)' }}
            >
              Delete
            </Button>
          </div>
        )}

        {/* Comments */}
        <CommentsSection
          rid={rid!}
          recipeAuthorUid={recipe.author_uid}
          isAuthenticated={isAuthenticated}
          user={user}
          token={token}
        />
      </div>
      <CookMode
        recipe={recipe}
        open={cookModeOpen}
        onClose={() => setCookModeOpen(false)}
        checkedSteps={checkedSteps}
        onStepToggle={(key) => {
          const next = new Set(checkedSteps);
          if (next.has(key)) { next.delete(key); } else { next.add(key); }
          setProgress({ steps: [...next] });
        }}
      />
    </div>
  );
}
