import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import {
  getMe,
  getMeStats,
  getMeRecipes,
  getMeStories,
  getMeFamilies,
  patchMe,
  type MeUser,
  type UserStats,
  type FamilyWithMeta,
} from '../api/me';
import { type Recipe } from '../api/recipes';
import { type Story } from '../api/stories';
import { Avatar } from '../components/Avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfile() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [families, setFamilies] = useState<FamilyWithMeta[]>([]);

  // Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      getMe(token),
      getMeStats(token),
      getMeRecipes(token, 4, 'times_cooked'),
      getMeStories(token, 2),
      getMeFamilies(token),
    ])
      .then(([meData, statsData, recipesData, storiesData, familiesData]) => {
        setMe(meData);
        setStats(statsData);
        setRecipes(recipesData);
        setStories(storiesData);
        setFamilies(familiesData);
      })
      .catch(() => { /* silent on error */ })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Hero */}
      <header className="flex items-center gap-5 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-[74px] w-[74px] rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </>
        ) : (
          <>
            <Avatar name={me?.username ?? user?.username ?? '?'} size={74} ring />
            <div className="flex-1">
              {/* Page-level eyebrow */}
              <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 4 }}>
                your profile
              </p>
              <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 26, fontWeight: 600, margin: 0 }}>
                {me?.username ?? user?.username}
              </h1>
              <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12, color: 'var(--g-muted)', marginTop: 2 }}>
                Member since {me?.created_at ? new Date(me.created_at).getFullYear() : '—'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setEditUsername(me?.username ?? ''); setDialogOpen(true); }}
            >
              Edit profile
            </Button>
          </>
        )}
      </header>

      {/* Stats strip — 3 cells */}
      <div
        className="grid grid-cols-3 divide-x border rounded-md mb-8"
        style={{ borderColor: 'var(--g-border)', borderRadius: 6 }}
      >
        {loading ? (
          [0, 1, 2].map(i => (
            <div key={i} className="flex flex-col items-center p-4 gap-1">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))
        ) : (
          [
            { label: 'Recipes', value: stats?.total_recipes ?? '—' },
            { label: 'Cooked', value: stats?.total_times_cooked ?? '—' },
            { label: 'Avg ★', value: stats?.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center p-4">
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 600, color: 'var(--g-primary)' }}>
                {value}
              </span>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--g-muted)' }}>
                {label}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Favorite spotlight */}
      {!loading && stats?.favorite_recipe_rid && (
        <Card
          className="mb-6"
          style={{
            borderLeft: '4px solid var(--g-primary)',
            background: 'color-mix(in oklab, var(--g-primary) 8%, var(--g-card))',
          }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div
              style={{
                width: 60,
                height: 60,
                flexShrink: 0,
                borderRadius: 4,
                background: 'color-mix(in oklab, var(--g-primary) 15%, var(--g-bg))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: 'var(--g-primary)' }}>★</span>
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 2 }}>
                most cooked
              </p>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 600, margin: 0 }}>
                {stats.favorite_recipe_name}
              </p>
              <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12, color: 'var(--g-muted)', marginTop: 2 }}>
                Cooked {stats.favorite_recipe_times_cooked}×
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={`/recipes/${stats.favorite_recipe_rid}`}>Open →</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Two-column: Recipes + Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recipes column */}
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 10 }}>
            Recipes
          </p>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
            </div>
          ) : recipes.length === 0 ? (
            <div
              className="border border-dashed rounded-md p-4 text-center"
              style={{ borderColor: 'var(--g-border)', color: 'var(--g-muted)', fontFamily: 'Lora, Georgia, serif', fontSize: 13 }}
            >
              No recipes yet
            </div>
          ) : (
            <div className="space-y-2">
              {recipes.map(r => (
                <a key={r.rid} href={`/recipes/${r.rid}`} className="block no-underline">
                  <Card className="p-3" style={{ borderRadius: 6 }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                      {(r.times_cooked ?? 0) > 0 && (
                        <span
                          style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: 11,
                            fontWeight: 500,
                            background: 'color-mix(in oklab, var(--g-primary) 15%, var(--g-bg))',
                            color: 'var(--g-primary)',
                            borderRadius: 20,
                            padding: '2px 8px',
                          }}
                        >
                          {r.times_cooked}×
                        </span>
                      )}
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Stories column */}
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 10 }}>
            Stories
          </p>
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map(i => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
            </div>
          ) : stories.length === 0 ? (
            <div
              className="border border-dashed rounded-md p-4 text-center"
              style={{ borderColor: 'var(--g-border)', color: 'var(--g-muted)', fontFamily: 'Lora, Georgia, serif', fontSize: 13 }}
            >
              No stories yet
            </div>
          ) : (
            <div className="space-y-2">
              {stories.map(s => (
                <Card key={s.sid} className="p-3" style={{ borderLeft: '3px solid var(--g-accent)', borderRadius: 6 }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.name}</p>
                  <p
                    style={{
                      fontFamily: 'Lora, Georgia, serif',
                      fontStyle: 'italic',
                      fontSize: 12,
                      color: 'var(--g-muted)',
                      margin: 0,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {s.body}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Family chips */}
      {!loading && families.length > 0 && (
        <div className="mb-6">
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 10 }}>
            Families
          </p>
          <div className="flex flex-wrap gap-2">
            {families.map(f => (
              <a key={f.fid} href="/family" className="no-underline">
                <div
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: 12,
                    fontWeight: 500,
                    background: 'color-mix(in oklab, var(--g-primary) 10%, var(--g-bg))',
                    color: 'var(--g-primary)',
                    border: '1px solid color-mix(in oklab, var(--g-primary) 30%, transparent)',
                    borderRadius: 20,
                    padding: '4px 12px',
                  }}
                >
                  {f.name}
                  <span style={{ marginLeft: 6, color: 'var(--g-muted)', fontSize: 10 }}>{f.member_count} members</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Edit profile dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditError(null); }}
      >
        <DialogContent style={{ borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <DialogHeader>
            <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)' }}>
              Edit profile
            </p>
            <DialogTitle style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 600 }}>
              Change username
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 10.5,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: 'var(--g-muted)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Username
              </label>
              <Input
                value={editUsername}
                onChange={e => { setEditUsername(e.target.value); setEditError(null); }}
                placeholder="Enter new username"
                style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13 }}
              />
            </div>
            {editError && (
              <Alert variant="destructive">
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={editSaving || editUsername.trim().length < 2}
              onClick={async () => {
                setEditSaving(true);
                setEditError(null);
                try {
                  const updated = await patchMe(token!, editUsername.trim());
                  setMe(updated);
                  setDialogOpen(false);
                } catch (err: unknown) {
                  const e = err as { status?: number; message?: string };
                  if (e?.status === 409 || e?.message?.includes('409')) {
                    setEditError('Username already taken');
                  } else {
                    setEditError('Failed to save — try again');
                  }
                } finally {
                  setEditSaving(false);
                }
              }}
            >
              {editSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
