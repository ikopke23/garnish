import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, CardBody, Row, Col, Spinner } from 'reactstrap';
import { useAuth } from '../context/useAuth';
import { listRecipes, Recipe } from '../api/recipes';
import { listFamilies, Family } from '../api/families';
import { getUserComments, getUserStats, CommentWithRecipe, UserStats } from '../api/users';

export default function UserProfile() {
  const { user, token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [comments, setComments] = useState<CommentWithRecipe[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    Promise.all([
      listRecipes(token).catch(() => [] as Recipe[]),
      getUserComments(user.uid).catch(() => [] as CommentWithRecipe[]),
      getUserStats(user.uid).catch(() => null),
      listFamilies(token).catch(() => [] as Family[]),
    ]).then(([allRecipes, userComments, userStats, allFamilies]) => {
      setRecipes(allRecipes.filter(r => r.author_uid === user.uid));
      setComments(userComments);
      setStats(userStats);
      setFamilies(allFamilies.filter(f => f.name !== 'Public'));
    }).finally(() => setLoading(false));
  }, [user, token]);

  if (!user) return null;

  const commentedRids = new Set(comments.map(c => c.recipe_uid));
  const authoredRids = new Set(recipes.map(r => r.rid));
  const interactedRecipes: { rid: string; name: string }[] = [
    ...recipes.map(r => ({ rid: r.rid, name: r.name })),
    ...comments
      .filter(c => !authoredRids.has(c.recipe_uid))
      .map(c => ({ rid: c.recipe_uid, name: c.recipe_name })),
  ];
  const seen = new Set<string>();
  const dedupedRecipes = interactedRecipes.filter(r => {
    if (seen.has(r.rid)) return false;
    seen.add(r.rid);
    return true;
  });

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 style={{ color: 'var(--color-teal)' }}>{user.username}</h2>
        <p className="text-muted">Member</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <Row className="g-3 mb-4">
            {/* Recipes card */}
            <Col md={4}>
              <Card className="h-100">
                <CardBody>
                  <h5 style={{ color: 'var(--color-teal)' }}>Your Recipes</h5>
                  {dedupedRecipes.length === 0 ? (
                    <p className="text-muted small">No recipes yet. <Link to="/recipes/create">Create one!</Link></p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {dedupedRecipes.map(r => (
                        <li key={r.rid} className="mb-1">
                          <Link to={`/recipes/${r.rid}`} style={{ color: 'var(--color-teal)', textDecoration: 'none' }}>
                            {r.name}
                          </Link>
                          {!authoredRids.has(r.rid) && commentedRids.has(r.rid) && (
                            <span className="text-muted small ms-1">(commented)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Comments card */}
            <Col md={4}>
              <Card className="h-100">
                <CardBody>
                  <h5 style={{ color: 'var(--color-teal)' }}>Your Comments</h5>
                  {comments.length === 0 ? (
                    <p className="text-muted small">No comments yet.</p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {comments.map(c => (
                        <li key={c.cid} className="mb-2">
                          <Link to={`/recipes/${c.recipe_uid}`} style={{ color: 'var(--color-teal)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            {c.recipe_name}
                          </Link>
                          <p className="text-muted small mb-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                            {c.body.length > 100 ? c.body.slice(0, 100) + '…' : c.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Stats card */}
            <Col md={4}>
              <Card className="h-100">
                <CardBody>
                  <h5 style={{ color: 'var(--color-teal)' }}>Your Stats</h5>
                  {stats ? (
                    <dl className="mb-0">
                      <dt className="text-muted small">Recipes created</dt>
                      <dd>{stats.total_recipes}</dd>

                      <dt className="text-muted small">Avg rating given</dt>
                      <dd>{stats.avg_rating != null ? stats.avg_rating.toFixed(1) + ' ★' : 'No ratings yet'}</dd>

                      <dt className="text-muted small">Times cooked</dt>
                      <dd>{stats.total_times_cooked}</dd>

                      <dt className="text-muted small">Favorite recipe</dt>
                      <dd>
                        {stats.favorite_recipe_rid ? (
                          <Link to={`/recipes/${stats.favorite_recipe_rid}`} style={{ color: 'var(--color-teal)', textDecoration: 'none' }}>
                            {stats.favorite_recipe_name}
                          </Link>
                        ) : '—'}
                      </dd>

                      <dt className="text-muted small">Most reviewed author</dt>
                      <dd>{stats.most_reviewed_author_username ?? '—'}</dd>
                    </dl>
                  ) : (
                    <p className="text-muted small">No stats yet.</p>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Family memberships */}
          {families.length > 0 && (
            <section>
              <h5 className="mb-2">Family Memberships</h5>
              <div className="d-flex flex-wrap gap-2">
                {families.map(f => (
                  <span key={f.fid} className="badge bg-secondary fs-6">{f.name}</span>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </Container>
  );
}
