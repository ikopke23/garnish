import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from './Avatar';
import {
  listFamilyMembers,
  removeMember,
  patchMemberRole,
  patchFamily,
  deleteFamily,
  type FamilyMember,
} from '../api/families';
import type { FamilyWithMeta } from '../api/me';

interface Props {
  family: FamilyWithMeta;
  currentUID: string;
  token: string;
  open: boolean;
  onClose: () => void;
  onFamilyDeleted: () => void;
  onFamilyRenamed: (fid: string, name: string) => void;
}

export function ManageFamilyModal({
  family,
  currentUID,
  token,
  open,
  onClose,
  onFamilyDeleted,
  onFamilyRenamed,
}: Props) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  const filteredMembers = useMemo(
    () => members.filter(m => m.username.toLowerCase().includes(search.toLowerCase())),
    [members, search]
  );

  const adminCount = useMemo(() => members.filter(m => m.role === 'admin').length, [members]);
  const isCurrentAdmin = members.find(m => m.uid === currentUID)?.role === 'admin';

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listFamilyMembers(token, family.fid)
      .then(setMembers)
      .catch(() => toast.error('Failed to load members'))
      .finally(() => setLoading(false));
  }, [open, family.fid, token]);

  const handleRoleChange = async (uid: string, newRole: 'admin' | 'member') => {
    const prev = members.find(m => m.uid === uid)!.role;
    setMembers(ms => ms.map(m => m.uid === uid ? { ...m, role: newRole } : m));
    try {
      await patchMemberRole(token, family.fid, uid, newRole);
    } catch (err: unknown) {
      setMembers(ms => ms.map(m => m.uid === uid ? { ...m, role: prev } : m));
      const e = err as { message?: string; status?: number };
      toast.error(e?.message?.includes('409') || e?.status === 409
        ? 'Cannot demote the last admin — promote someone else first'
        : 'Failed to update role');
    }
  };

  const handleRemove = async (uid: string) => {
    const prev = [...members];
    setMembers(ms => ms.filter(m => m.uid !== uid));
    setConfirmingRemove(null);
    try {
      await removeMember(token, family.fid, uid);
      if (uid === currentUID) onClose();
    } catch {
      setMembers(prev);
      toast.error('Failed to remove member');
    }
  };

  const handleRename = async () => {
    if (!renameValue.trim()) return;
    setRenameSaving(true);
    try {
      await patchFamily(token, family.fid, renameValue.trim());
      onFamilyRenamed(family.fid, renameValue.trim());
      setRenaming(false);
    } catch {
      toast.error('Failed to rename family');
    } finally {
      setRenameSaving(false);
    }
  };

  const handleDeleteFamily = async () => {
    try {
      await deleteFamily(token, family.fid);
      onFamilyDeleted();
    } catch {
      toast.error('Failed to delete family');
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        style={{
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          maxWidth: 520,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--g-border)' }}>
          <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', margin: 0 }}>
            Manage family
          </p>
          <DialogTitle style={{ fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 600, margin: 0 }}>
            {renaming ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
                  style={{ fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: '2px solid var(--g-primary)', outline: 'none', flex: 1 }}
                />
                <Button size="sm" onClick={handleRename} disabled={renameSaving}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setRenaming(false)}>Cancel</Button>
              </div>
            ) : (
              <span
                onClick={() => isCurrentAdmin && (setRenameValue(family.name), setRenaming(true))}
                title={isCurrentAdmin ? 'Click to rename' : undefined}
                style={{ cursor: isCurrentAdmin ? 'pointer' : 'default' }}
              >
                {family.name}
              </span>
            )}
          </DialogTitle>
          <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12, color: 'var(--g-muted)', marginTop: 2 }}>
            {family.member_count} member{family.member_count !== 1 ? 's' : ''}
          </p>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--g-border)' }}>
          <div
            className="flex items-center gap-2"
            style={{ border: '1px solid var(--g-border)', borderRadius: 4, padding: '6px 12px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--g-muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Lora, Georgia, serif', fontSize: 13, color: 'var(--g-text)' }}
            />
          </div>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredMembers.map(member => (
            <div key={member.uid}>
              <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--g-border)' }}>
                <Avatar name={member.username} size={32} />
                <div className="flex-1">
                  <span style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 14 }}>{member.username}</span>
                  {member.recipe_count > 0 && (
                    <span style={{ marginLeft: 8, fontFamily: 'Lora, Georgia, serif', fontSize: 11, color: 'var(--g-muted)' }}>
                      {member.recipe_count} recipe{member.recipe_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {/* Role pills */}
                <div className="flex items-center gap-1">
                  {member.uid === currentUID && (
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9.5, textTransform: 'uppercase', borderRadius: 20, padding: '2px 8px', border: '1.5px solid var(--g-primary)', color: 'var(--g-primary)' }}>
                      you
                    </span>
                  )}
                  {member.role === 'admin' && (
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9.5, textTransform: 'uppercase', borderRadius: 20, padding: '2px 8px', background: 'color-mix(in oklab, var(--g-secondary) 20%, var(--g-card))', color: 'var(--g-text)' }}>
                      admin
                    </span>
                  )}
                </div>
                {/* Actions — only visible to admins, for other members */}
                {isCurrentAdmin && member.uid !== currentUID && (
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost"
                      onClick={() => handleRoleChange(member.uid, member.role === 'admin' ? 'member' : 'admin')}
                      disabled={member.role === 'admin' && adminCount === 1}
                      style={{ fontSize: 11, fontFamily: 'Lora, Georgia, serif' }}>
                      {member.role === 'admin' ? 'Demote' : 'Promote'}
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => setConfirmingRemove(confirmingRemove === member.uid ? null : member.uid)}
                      style={{ fontSize: 11, fontFamily: 'Lora, Georgia, serif', color: 'var(--g-accent)' }}>
                      Remove
                    </Button>
                  </div>
                )}
                {/* Self-leave (non-admin or admin with others available) */}
                {member.uid === currentUID && !(member.role === 'admin' && adminCount === 1) && (
                  <Button size="sm" variant="ghost"
                    onClick={() => setConfirmingRemove(member.uid)}
                    style={{ fontSize: 11, fontFamily: 'Lora, Georgia, serif', color: 'var(--g-accent)' }}>
                    Leave
                  </Button>
                )}
              </div>
              {/* Inline remove confirmation */}
              {confirmingRemove === member.uid && (
                <div className="py-2 px-3 mb-1 rounded" style={{ background: 'color-mix(in oklab, var(--g-accent) 8%, var(--g-card))', border: '1px solid color-mix(in oklab, var(--g-accent) 30%, transparent)' }}>
                  <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12.5, marginBottom: 8 }}>
                    {member.uid === currentUID
                      ? 'Leave this family? Your recipes will stay but be removed from the shared list.'
                      : `Remove ${member.username}? Their recipes will be removed from this family.`}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm"
                      style={{ background: 'var(--g-accent)', color: '#fff', fontSize: 12, fontFamily: 'Lora, Georgia, serif' }}
                      onClick={() => handleRemove(member.uid)}>
                      {member.uid === currentUID ? 'Leave family' : 'Remove member'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmingRemove(null)}
                      style={{ fontSize: 12, fontFamily: 'Lora, Georgia, serif' }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer — admin-only delete zone */}
        {isCurrentAdmin && (
          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--g-border)' }}>
            {!confirmingDelete ? (
              <Button variant="ghost" size="sm"
                onClick={() => setConfirmingDelete(true)}
                style={{ color: 'var(--g-accent)', fontFamily: 'Lora, Georgia, serif', fontSize: 12 }}>
                Delete family
              </Button>
            ) : (
              <div className="rounded p-3" style={{ background: 'color-mix(in oklab, var(--g-accent) 8%, var(--g-card))', border: '1px solid color-mix(in oklab, var(--g-accent) 30%, transparent)' }}>
                <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12.5, marginBottom: 8 }}>
                  Delete <strong>{family.name}</strong>? All members will lose access. Recipes are preserved.
                </p>
                <div className="flex gap-2">
                  <Button size="sm"
                    style={{ background: 'var(--g-accent)', color: '#fff', fontSize: 12, fontFamily: 'Lora, Georgia, serif' }}
                    onClick={handleDeleteFamily}>
                    Delete family
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}
                    style={{ fontSize: 12, fontFamily: 'Lora, Georgia, serif' }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
