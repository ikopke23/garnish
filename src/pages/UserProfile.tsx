import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../context/useAuth';
import { listRecipes, Recipe } from '../api/recipes';
import { listFamilies, Family } from '../api/families';
import { getUserComments, getUserStats, CommentWithRecipe, UserStats } from '../api/users';
import { getUserStories, deleteStory, Story } from '../api/stories';

export default function UserProfile() {
  const { user, token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [comments, setComments] = useState<CommentWithRecipe[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    Promise.all([
      listRecipes(token).catch(() => [] as Recipe[]),
      getUserComments(user.uid).catch(() => [] as CommentWithRecipe[]),
      getUserStats(user.uid).catch(() => null),
      listFamilies(token).catch(() => [] as Family[]),
      getUserStories(user.uid).catch(() => [] as Story[]),
    ]).then(([allRecipes, userComments, userStats, allFamilies, userStories]) => {
      setRecipes(allRecipes.filter(r => r.author_uid === user.uid));
      setComments(userComments);
      setStats(userStats);
      setFamilies(allFamilies.filter(f => f.name !== 'Public'));
      setStories(userStories);
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

  const toggleExpanded = (sid: string) => {
    setExpandedStories(prev => {
      const next = new Set(prev);
      if (next.has(sid)) {
        next.delete(sid);
      } else {
        next.add(sid);
      }
      return next;
    });
  };

  const handleDeleteStory = async (sid: string) => {
    if (!window.confirm('Delete this story?')) return;
    if (!token) return;
    try {
      await deleteStory(token, sid);
      setStories(prev => prev.filter(s => s.sid !== sid));
    } catch {
      window.alert('Failed to delete story. Please try again.');
    }
  };

  return (
    <div className="max-w-[700px] mx-auto py-8 px-4">
      <div className="mb-4">
        <h2 style={{ color: 'var(--primary-hex)' }}>{user.username}</h2>
        <p className="text-muted-foreground">Member</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mb-4">
            {/* Recipes card */}
            <Card className="h-full">
              <CardContent className="p-6">
                <h5 style={{ color: 'var(--primary-hex)' }}>Your Recipes</h5>
                {dedupedRecipes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No recipes yet. <Link to="/recipes/create">Create one!</Link>
                  </p>
                ) : (
                  <ul className="list-none p-0 space-y-1 mb-0">
                    {dedupedRecipes.map(r => (
                      <li key={r.rid} className="mb-1">
                        <Link
                          to={`/recipes/${r.rid}`}
                          style={{ color: 'var(--primary-hex)', textDecoration: 'none' }}
                        >
                          {r.name}
                        </Link>
                        {!authoredRids.has(r.rid) && commentedRids.has(r.rid) && (
                          <span className="text-muted-foreground text-sm ml-1">(commented)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Comments card */}
            <Card className="h-full">
              <CardContent className="p-6">
                <h5 style={{ color: 'var(--primary-hex)' }}>Your Comments</h5>
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No comments yet.</p>
                ) : (
                  <ul className="list-none p-0 space-y-1 mb-0">
                    {comments.map(c => (
                      <li key={c.cid} className="mb-2">
                        <Link
                          to={`/recipes/${c.recipe_uid}`}
                          style={{ color: 'var(--primary-hex)', textDecoration: 'none', fontSize: '0.85rem' }}
                        >
                          {c.recipe_name}
                        </Link>
                        <p
                          className="text-muted-foreground text-sm mb-0"
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}
                        >
                          {c.body.length > 100 ? c.body.slice(0, 100) + '…' : c.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Stats card */}
            <Card className="h-full">
              <CardContent className="p-6">
                <h5 style={{ color: 'var(--primary-hex)' }}>Your Stats</h5>
                {stats ? (
                  <dl className="mb-0">
                    <dt className="text-muted-foreground text-sm">Recipes created</dt>
                    <dd>{stats.total_recipes}</dd>

                    <dt className="text-muted-foreground text-sm">Avg rating given</dt>
                    <dd>{stats.avg_rating != null ? stats.avg_rating.toFixed(1) + ' ★' : 'No ratings yet'}</dd>

                    <dt className="text-muted-foreground text-sm">Times cooked</dt>
                    <dd>{stats.total_times_cooked}</dd>

                    <dt className="text-muted-foreground text-sm">Favorite recipe</dt>
                    <dd>
                      {stats.favorite_recipe_rid ? (
                        <Link
                          to={`/recipes/${stats.favorite_recipe_rid}`}
                          style={{ color: 'var(--primary-hex)', textDecoration: 'none' }}
                        >
                          {stats.favorite_recipe_name}
                        </Link>
                      ) : '—'}
                    </dd>

                    <dt className="text-muted-foreground text-sm">Most reviewed author</dt>
                    <dd>{stats.most_reviewed_author_username ?? '—'}</dd>
                  </dl>
                ) : (
                  <p className="text-muted-foreground text-sm">No stats yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Family memberships */}
          {families.length > 0 && (
            <section>
              <h5 className="mb-2">Family Memberships</h5>
              <div className="flex flex-wrap gap-2">
                {families.map(f => (
                  <Badge key={f.fid} variant="secondary" className="text-base">{f.name}</Badge>
                ))}
              </div>
            </section>
          )}

          {/* Stories */}
          <section className="mt-4">
            <h5 className="mb-3" style={{ color: 'var(--primary-hex)' }}>Stories</h5>
            {stories.length === 0 ? (
              <p className="text-muted-foreground">No stories yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                {stories.map(s => {
                  const isExpanded = expandedStories.has(s.sid);
                  const preview = s.body.length > 100 ? s.body.slice(0, 100) + '…' : s.body;
                  const isOwner = user.uid === s.author_uid;
                  return (
                    <Card key={s.sid} className="h-full">
                      <CardContent className="p-6">
                        <h6 className="font-semibold" style={{ color: 'var(--primary-hex)' }}>{s.name}</h6>
                        <p className="text-muted-foreground text-sm mb-1">{new Date(s.created_at).toLocaleDateString()}</p>
                        <p style={{ fontStyle: 'italic' }}>{isExpanded ? s.body : preview}</p>
                        {s.body.length > 100 && (
                          <Button size="sm" variant="link" className="p-0" onClick={() => toggleExpanded(s.sid)}>
                            {isExpanded ? 'Show less' : 'Show more'}
                          </Button>
                        )}
                        {isOwner && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="secondary" asChild>
                              <Link to={`/stories/${s.sid}/edit`}>Edit</Link>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteStory(s.sid)}>
                              Delete
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
