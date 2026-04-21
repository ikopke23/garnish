import { useEffect, useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../context/useAuth';
import { listFamilies, createFamily, addMember, Family } from '../api/families';

export default function FamilyManager() {
  const { token } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listFamilies(token)
      .then(setFamilies)
      .catch(() => setError('Failed to load families'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreateFamily = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newFamilyName.trim()) return;
    try {
      const f = await createFamily(token, newFamilyName.trim());
      setFamilies([f, ...families]);
      setNewFamilyName('');
    } catch {
      setError('Failed to create family');
    }
  };

  const handleAddMember = async (fid: string) => {
    if (!token || !newMemberUsername[fid]?.trim()) return;
    try {
      await addMember(token, fid, newMemberUsername[fid].trim());
      setNewMemberUsername({ ...newMemberUsername, [fid]: '' });
    } catch {
      setError('Failed to add member');
    }
  };

  if (loading) return <div className="py-8 px-4">Loading...</div>;

  return (
    <div className="max-w-[700px] mx-auto py-8 px-4">
      <h2 className="mb-4" style={{ color: 'var(--primary-hex)' }}>Family Manager</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error}{' '}
            <button onClick={() => setError(null)} className="ml-2 underline text-xs">
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardContent className="p-6">
          <h5>Create a Family</h5>
          <form onSubmit={handleCreateFamily}>
            <div className="flex gap-2">
              <Input
                placeholder="Family name"
                value={newFamilyName}
                onChange={e => setNewFamilyName(e.target.value)}
              />
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {families.length === 0 ? (
        <p className="text-muted-foreground">No families yet. Create one above!</p>
      ) : (
        families.map(family => (
          <Card key={family.fid} className="mb-3">
            <CardContent className="p-6">
              <h5>{family.name}</h5>
              <div className="flex gap-2 mt-2 items-center">
                <Input
                  placeholder="Member username to add"
                  value={newMemberUsername[family.fid] || ''}
                  onChange={e =>
                    setNewMemberUsername({ ...newMemberUsername, [family.fid]: e.target.value })
                  }
                />
                <Button variant="secondary" size="sm" onClick={() => handleAddMember(family.fid)}>
                  Add Member
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
