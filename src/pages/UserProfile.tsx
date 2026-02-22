import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, CardBody, Row, Col, Badge, Spinner } from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { listRecipes, Recipe } from '../api/recipes';

export default function UserProfile() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listRecipes()
      .then(all => setRecipes(all.filter(r => r.author_uid === user.uid)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 style={{ color: 'var(--color-teal)' }}>{user.username}</h2>
        <p className="text-muted">Member</p>
      </div>

      <h4 className="mb-3">Your Recipes</h4>
      {loading ? (
        <Spinner />
      ) : recipes.length === 0 ? (
        <p className="text-muted">No recipes yet. <Link to="/recipes/create">Create one!</Link></p>
      ) : (
        <Row className="g-3">
          {recipes.map(recipe => (
            <Col key={recipe.rid} md={6} lg={4}>
              <Card className="recipe-card h-100">
                <CardBody>
                  <h5>
                    <Link to={`/recipes/${recipe.rid}`} style={{ color: 'var(--color-teal)', textDecoration: 'none' }}>
                      {recipe.name}
                    </Link>
                  </h5>
                  <p className="text-muted small mb-2">
                    {recipe.prep_time > 0 && `Prep: ${recipe.prep_time}m`}
                    {recipe.cook_time > 0 && ` · Cook: ${recipe.cook_time}m`}
                  </p>
                  <Link to={`/recipes/${recipe.rid}/edit`}>
                    <Badge color="secondary" pill>Edit</Badge>
                  </Link>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
