import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Button, Badge, Row, Col, Spinner } from 'reactstrap';
import { getRecipe, deleteRecipe, Recipe } from '../api/recipes';
import { useAuth } from '../context/AuthContext';

export default function RecipeDetail() {
  const { rid } = useParams<{ rid: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!rid) return;
    getRecipe(rid)
      .then(setRecipe)
      .catch(() => setError('Recipe not found'))
      .finally(() => setLoading(false));
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
              <div className="text-teal fw-bold">{recipe.prep_time}m</div>
              <div className="text-muted small">Prep</div>
            </div>
          </Col>
        )}
        {recipe.cook_time > 0 && (
          <Col xs="auto">
            <div className="text-center">
              <div className="text-teal fw-bold">{recipe.cook_time}m</div>
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
          <div className="d-flex flex-wrap gap-1">
            {recipe.ingredients.map(ing => (
              <span key={ing.iid || ing.name} className="ingredient-chip">
                {ing.quantity > 0 && `${ing.quantity} `}
                {ing.unit && `${ing.unit} `}
                {ing.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Equipment */}
      {recipe.equipment && recipe.equipment.length > 0 && (
        <section className="mb-4">
          <h4>Equipment</h4>
          <div className="d-flex flex-wrap gap-1">
            {recipe.equipment.map(eq => (
              <Badge key={eq.eid || eq.name} color="secondary" pill className="me-1">
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
            {recipe.steps.map((step, i) => (
              <li key={i} className="mb-2">{step}</li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-4">
        <Link to="/" className="text-muted small">&larr; Back to feed</Link>
      </div>
    </Container>
  );
}
