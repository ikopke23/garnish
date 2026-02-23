import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Button, Badge, Row, Col, Spinner } from 'reactstrap';
import { getRecipe, deleteRecipe, Recipe } from '../api/recipes';
import { useAuth } from '../context/AuthContext';
import { RecipePhoto, listPhotos, uploadPhoto } from '../api/photos';

export default function RecipeDetail() {
  const { rid } = useParams<{ rid: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [photos, setPhotos] = useState<RecipePhoto[]>([]);
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

  const toggleIngredient = (key: string) =>
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });

  const toggleStep = (i: number) =>
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
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
        <div className="mb-4" >
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="form-control form-control-sm" style={{boxSizing: "content-box"}}/>
        </div>
      )}

      {/* Story banner */}
      {recipe.story_id && !recipe.disable_story && (
        <div className="story-banner mb-4">
          <p className="mb-0 text-muted small">Story attached</p>
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
      {recipe.steps && recipe.steps.length > 0 && (
        <section className="mb-4">
          <h4>Steps</h4>
          <ol>
            {recipe.steps.map((step, i) => {
              const done = checkedSteps.has(i);
              return (
                <li key={i} className="mb-2">
                  <label className="d-flex align-items-start gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" className="mt-1" checked={done} onChange={() => toggleStep(i)} />
                    <span style={{ opacity: done ? 0.7 : 1 }}>
                      {step}
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mt-4">
        <Link to="/" className="text-muted small">&larr; Back to feed</Link>
      </div>
    </Container>
  );
}
