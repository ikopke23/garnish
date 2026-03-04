import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Button, Badge, Row, Col, Spinner } from 'reactstrap';
import { getRecipe, deleteRecipe, Recipe } from '../api/recipes';
import { getStory, Story } from '../api/stories';
import { useAuth } from '../context/useAuth';
import { RecipePhoto, listPhotos, uploadPhoto } from '../api/photos';
import { RecipeUser, getRecipeUserData, setRating as setRatingAPI, setNotes as setNotesAPI, incrementCooked } from '../api/userdata';
import StarRating from '../components/StarRating';
import CommentsSection from '../components/CommentsSection';

export default function RecipeDetail() {
  const { rid } = useParams<{ rid: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [photos, setPhotos] = useState<RecipePhoto[]>([]);
  const [story, setStory] = useState<Story | null>(null);
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
      getStory(recipe.story_id).then(setStory).catch(() => {});
    } else {
      setStory(null);
    }
  }, [recipe?.story_id, recipe?.disable_story]);

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

  const toggleIngredient = (key: string) =>
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });

  const toggleStep = (key: string) =>
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });

  if (loading) return <Container className="py-4"><Spinner /></Container>;
  if (error || !recipe) return <Container className="py-4"><p className="text-danger">{error || 'Recipe not found'}</p></Container>;

  const isOwner = isAuthenticated && user?.uid === recipe.author_uid;

  return (
    <Container className="py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h1 style={{ color: 'var(--color-teal)' }}>{recipe.name}</h1>
        {isOwner && (
          <div className="d-flex gap-2">
            <Link to={`/recipes/${rid}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
            <Button color="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        )}
      </div>

      {recipe.author_username && (
        <p className="text-muted small mb-3">By {recipe.author_username}</p>
      )}

      {/* Photo — top */}
      <div className="mb-4 rounded overflow-hidden"
           style={{ background: 'var(--border-color)', minHeight: '260px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {photos.length > 0
          ? <img src={photos[0].link} alt="" style={{ width: '100%', objectFit: 'cover', maxHeight: '260px' }} />
          : <span className="text-muted small">No photo yet</span>}
      </div>

      {/* Photo upload (owner only) */}
      {isOwner && (
        <div className="mb-4">
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="form-control form-control-sm" style={{boxSizing: "content-box"}}/>
        </div>
      )}

      {/* Story banner */}
      {story && (
        <div className="story-banner mb-4">
          <p className="fw-semibold mb-1" style={{ color: 'var(--color-teal)' }}>{story.name}</p>
          <p className="mb-1" style={{ fontStyle: 'italic' }}>{story.body}</p>
          <p className="mb-0 text-muted small">— {story.author_name}</p>
        </div>
      )}

      {/* Meta */}
      <Row className="mb-4 g-3">
        {recipe.prep_time > 0 && (
          <Col xs="auto">
            <div className="text-center">
              <div className="text-teal fw-bold">{recipe.prep_time} Minutes</div>
              <div className="text-muted small">Prep</div>
            </div>
          </Col>
        )}
        {recipe.cook_time > 0 && (
          <Col xs="auto">
            <div className="text-center">
              <div className="text-teal fw-bold">{recipe.cook_time} Minutes</div>
              <div className="text-muted small">Cook</div>
            </div>
          </Col>
        )}
        {recipe.servings > 0 && (
          <Col xs="auto">
            <div className="text-center">
              <div className="text-teal fw-bold">{recipe.servings}</div>
              <div className="text-muted small">Servings</div>
            </div>
          </Col>
        )}
      </Row>

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <section className="mb-4">
          <h4>Ingredients</h4>
          <div className="d-flex flex-column gap-2">
            {recipe.ingredients.map((ing, index) => {
              const key = ing.iid || ing.name;
              const done = checkedIngredients.has(key);
              return (
                <label
                  key={key}
                  className={`ingredient-chip ingredient-chip-${index % 2} d-flex align-items-center gap-2`}
                  style={{ cursor: 'pointer', opacity: done ? 0.7 : 1 }}
                >
                  <input type="checkbox" checked={done} onChange={() => toggleIngredient(key)} />
                  {` `}
                  {ing.quantity > 0 && `${ing.quantity} `}
                  {ing.unit && `${ing.unit} of `}
                  {ing.name}
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Photo — mid */}
      <div className="mb-4 rounded overflow-hidden"
           style={{ background: 'var(--border-color)', minHeight: '180px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {photos.length > 1
          ? <img src={photos[1].link} alt="" style={{ width: '100%', objectFit: 'cover', maxHeight: '180px' }} />
          : <span className="text-muted small">No photo yet</span>}
      </div>

      {/* Equipment */}
      {recipe.equipment && recipe.equipment.length > 0 && (
        <section className="mb-4">
          <h4>Equipment</h4>
          <div className="d-flex flex-wrap gap-1">
            {recipe.equipment.map(eq => (
              <Badge style={{fontSize: 14}}key={eq.eid || eq.name} color="secondary" pill className="me-1">
                {eq.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Steps */}
      {recipe.sections?.length > 0 && (
        <section className="mb-4">
          <h4>Steps</h4>
          {recipe.sections.map((sec, sIdx) => (
            <div key={sIdx} className="mb-3">
              {sec.title && (
                <h5 style={{ color: 'var(--color-teal)' }}>{sec.title}</h5>
              )}
              <ol>
                {sec.steps.map((step, i) => {
                  const key = `${sIdx}-${i}`;
                  const done = checkedSteps.has(key);
                  return (
                    <li key={key} className="mb-2">
                      <label className="d-flex align-items-start gap-2" style={{ cursor: 'pointer' }}>
                        <input type="checkbox" className="mt-1" checked={done}
                               onChange={() => toggleStep(key)} />
                        <span style={{ opacity: done ? 0.7 : 1 }}>{step}</span>
                      </label>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </section>
      )}

      {/* User interactions — authenticated users only */}
      {isAuthenticated && (
        <div className="mb-4">
          <div className="mb-3 d-flex align-items-center gap-3">
            <Button color="secondary" size="sm" onClick={handleCooked}>
              I Cooked This!
            </Button>
            {(recipeUser?.times_cooked ?? 0) > 0 && (
              <span className="text-muted small">Cooked {recipeUser!.times_cooked}×</span>
            )}
          </div>

          <section className="mb-4">
            <h5>Your Rating</h5>
            <StarRating value={userRating} onChange={saveRating} />
          </section>

          <section className="mb-4">
            <h5>Your Notes</h5>
            <textarea
              value={userNotes}
              onChange={e => setUserNotes(e.target.value)}
              onBlur={saveNotes}
              style={{ resize: 'both', width: '100%', minHeight: '80px' }}
              className="form-control"
              placeholder="Add a personal note..."
            />
          </section>
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

      <div className="mt-4">
        <Link to="/" className="text-muted small">&larr; Back to feed</Link>
      </div>
    </Container>
  );
}
