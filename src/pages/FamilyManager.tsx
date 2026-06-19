import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/useAuth';
import { getMeFamilies, type FamilyWithMeta } from '../api/me';
import {
  createFamily,
  addMember,
  listFamilyMembers,
  type FamilyMember,
} from '../api/families';
import { AvatarStack } from '../components/AvatarStack';
import { ManageFamilyModal } from '../components/ManageFamilyModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function FamilyManager() {
  const { user, token } = useAuth();
  const [families, setFamilies] = useState<FamilyWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersMap, setMembersMap] = useState<Record<string, FamilyMember[]>>({});
  const [addInputMap, setAddInputMap] = useState<Record<string, string>>({});
  const [createMode, setCreateMode] = useState(false);
  const [createName, setCreateName] = useState('');
  const [managingFid, setManagingFid] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMeFamilies(token)
      .then(setFamilies)
      .catch(() => toast.error('Failed to load families'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || families.length === 0) return;
    families.forEach(f => {
      listFamilyMembers(token, f.fid)
        .then(members => setMembersMap(m => ({ ...m, [f.fid]: members })))
        .catch(() => {}); // silent
    });
  }, [token, families.length]); // note: families.length not families, to avoid infinite re-run

  const handleInvite = async (fid: string) => {
    const username = addInputMap[fid]?.trim();
    if (!username) return;
    try {
      await addMember(token!, fid, username);
      const updated = await listFamilyMembers(token!, fid);
      setMembersMap(m => ({ ...m, [fid]: updated }));
      setAddInputMap(m => ({ ...m, [fid]: '' }));
      toast.success('Member added');
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number };
      toast.error(e?.message?.includes('409') || e?.status === 409
        ? 'User is already a member'
        : 'Could not add member — check the username');
    }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await createFamily(token!, createName.trim());
      const updated = await getMeFamilies(token!);
      setFamilies(updated);
      setCreateMode(false);
      setCreateName('');
      toast.success('Family created');
    } catch {
      toast.error('Failed to create family');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 4 }}>
            You belong to {families.length} {families.length === 1 ? 'family' : 'families'}
          </p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 26, fontWeight: 600, margin: 0 }}>
            Your Families
          </h1>
        </div>
        <Button onClick={() => setCreateMode(true)}>+ New family</Button>
      </div>

      {/* Create family form (inline) */}
      {createMode && (
        <Card className="mb-4 p-4" style={{ borderRadius: 6 }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 8 }}>
            New family
          </p>
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreateMode(false); }}
              placeholder="Family name"
              style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13 }}
            />
            <Button onClick={handleCreate} disabled={!createName.trim()}>Create</Button>
            <Button variant="ghost" onClick={() => { setCreateMode(false); setCreateName(''); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Family cards */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
        </div>
      ) : families.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-md" style={{ borderColor: 'var(--g-border)' }}>
          <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 14, color: 'var(--g-muted)', marginBottom: 12 }}>
            No families yet
          </p>
          <Button onClick={() => setCreateMode(true)}>+ Create your first family</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {families.map(family => {
            const members = membersMap[family.fid] ?? [];
            const memberRole = members.find(m => m.uid === user?.uid)?.role;
            const isAdmin = memberRole !== undefined ? memberRole === 'admin' : family.my_role === 'admin';
            return (
              <Card key={family.fid} style={{ borderTop: '3px solid var(--g-primary)', borderRadius: 6 }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 600, margin: 0 }}>{family.name}</h2>
                      <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12, color: 'var(--g-muted)', marginTop: 2 }}>
                        {family.member_count} member{family.member_count !== 1 ? 's' : ''} · {family.recipe_count} recipe{family.recipe_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => setManagingFid(family.fid)}
                        style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12 }}>
                        Manage
                      </Button>
                    )}
                  </div>
                  {/* Member avatars */}
                  {members.length > 0 && (
                    <div className="mb-3">
                      <AvatarStack members={members} max={5} size={28} />
                    </div>
                  )}
                  {/* Invite input (admins only) */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 mt-3" style={{ borderTop: '1px dashed var(--g-border)', paddingTop: 12 }}>
                      <input
                        value={addInputMap[family.fid] ?? ''}
                        onChange={e => setAddInputMap(m => ({ ...m, [family.fid]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleInvite(family.fid); }}
                        placeholder="Add member by username…"
                        style={{
                          flex: 1, background: 'var(--g-bg)', border: '1px solid var(--g-border)',
                          borderRadius: 4, padding: '6px 10px', fontFamily: 'Lora, Georgia, serif',
                          fontSize: 12.5, color: 'var(--g-text)', outline: 'none',
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleInvite(family.fid)}>Add</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Manage modal — rendered once, controlled by managingFid */}
      {managingFid && families.find(f => f.fid === managingFid) && (
        <ManageFamilyModal
          open={managingFid !== null}
          family={families.find(f => f.fid === managingFid)!}
          currentUID={user!.uid}
          token={token!}
          onClose={() => setManagingFid(null)}
          onFamilyDeleted={() => {
            setFamilies(fs => fs.filter(f => f.fid !== managingFid));
            setManagingFid(null);
          }}
          onFamilyRenamed={(fid, name) => {
            setFamilies(fs => fs.map(f => f.fid === fid ? { ...f, name } : f));
          }}
        />
      )}
    </div>
  );
}
