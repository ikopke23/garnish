import { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Input, InputGroup, Button, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';
import { listRecipes, Recipe } from '../api/recipes';
import { useAuth } from '../context/useAuth';


export default function RecipeFeed() {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastFetchRef = useRef<number>(0);

  const fetchRecipes = async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;
    setLoading(true);
    setError(null);
    try {
      const data = await listRecipes(token, nameFilter || undefined, ingredientFilter || undefined);
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

  return (
    <Container className="py-4">
      <h1 className="mb-4" style={{ color: 'var(--color-teal)' }}>Recipe Feed</h1>

      <Row className="mb-4 g-2">
        <Col md={5}>
          <InputGroup>
            <Input
              style={{ padding: '0.5rem 0.75rem' }} 
              placeholder="Search by name..."
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecipes()}
            />
          </InputGroup>
        </Col>
        <Col md={5}>
          <InputGroup>
            <Input
              style={{ padding: '0.5rem 0.75rem' }} 
              placeholder="Filter by ingredient..."
              value={ingredientFilter}
              onChange={e => setIngredientFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecipes()}
            />
          </InputGroup>
        </Col>
        <Col md={2}>
          <Button color="primary" onClick={fetchRecipes} className="w-100">Search</Button>
        </Col>
      </Row>

      {loading && <p className="text-muted">Loading recipes...</p>}
      {error && <p className="text-danger">{error}</p>}

      <Row className="gx-3 gy-4">
        {recipes.map(recipe => (
          <Col key={recipe.rid} md={6} lg={4} style={{paddingTop:'1em'}}>
            <Card className="recipe-card h-100">
              <CardBody>
                <CardTitle tag="h5">
                  <Link to={`/recipes/${recipe.rid}`} style={{ color: 'var(--color-teal)', textDecoration: 'none' }}>
                    {recipe.name}
                  </Link>
                </CardTitle>
                <CardText className="text-muted small mb-2">
                  {recipe.prep_time > 0 && `Prep: ${recipe.prep_time} Minutes`}
                  {recipe.prep_time > 0 && recipe.cook_time > 0 && ' · '}
                  {recipe.cook_time > 0 && `Cook: ${recipe.cook_time} Minutes`}
                  {recipe.servings > 0 && ` · ${recipe.servings} servings`}
                </CardText>
                {(recipe.calories > 0 || recipe.carbs > 0 || recipe.proteins > 0 || recipe.fats > 0) && (
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {recipe.calories > 0 && <span className="badge rounded-pill bg-secondary">{recipe.calories} kcal</span>}
                    {recipe.proteins > 0 && <span className="badge rounded-pill bg-secondary">{recipe.proteins}g protein</span>}
                    {recipe.carbs > 0 && <span className="badge rounded-pill bg-secondary">{recipe.carbs}g carbs</span>}
                    {recipe.fats > 0 && <span className="badge rounded-pill bg-secondary">{recipe.fats}g fat</span>}
                  </div>
                )}
                <div>
                  {(recipe.ingredients || []).slice(0, 4).map(ing => (
                    <span key={ing.iid || ing.name} className="ingredient-chip me-1 mb-1">
                      {ing.name}
                    </span>
                  ))}
                  {(recipe.ingredients || []).length > 4 && (
                    <Badge color="secondary" pill>+{(recipe.ingredients || []).length - 4}</Badge>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
        {!loading && recipes.length === 0 && (
          <Col>
            <p className="text-muted">No recipes found. <Link to="/recipes/create">Create the first one!</Link></p>
          </Col>
        )}
      </Row>
    </Container>
  );
}
