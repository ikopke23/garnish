import { useState, useCallback, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { listComments, createComment, deleteComment, hideComment, countComments, Comment } from '../api/comments';

// Small form that appears inline when replying to a sub-comment
function ReplyToSubForm({ targetCid, onReply }: { targetCid: string; onReply: (targetCid: string, body: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!body.trim()) return;
    setPosting(true);
    try {
      await onReply(targetCid, body);
      setBody('');
      setOpen(false);
    } finally {
      setPosting(false);
    }
  };

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Reply
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        className="flex h-7 w-full rounded border border-input bg-background px-2 py-0.5 text-xs outline-none focus:border-primary"
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write a reply..."
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handlePost(); } }}
        autoFocus
      />
      <Button size="sm" variant="default" onClick={handlePost} disabled={posting || !body.trim()}>
        Post
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  recipeAuthorUid: string;
  currentUid?: string;
  token?: string;
  onDelete: (cid: string) => void;
  onDeleteReply: (parentCid: string, cid: string) => void;
  onHide: (cid: string, hidden: boolean) => void;
  onReply: (targetCid: string, body: string) => Promise<void>;
}

const CommentItem = memo(function CommentItem({
  comment, recipeAuthorUid, currentUid, token, onDelete, onDeleteReply, onHide, onReply,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replying, setReplying] = useState(false);

  const isAuthor = currentUid === comment.author_uid;
  const isRecipeOwner = currentUid === recipeAuthorUid;

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setReplying(true);
    try {
      await onReply(comment.cid, replyBody);
      setReplyBody('');
      setShowReplyForm(false);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="flex justify-between items-start">
        <div>
          <strong>{comment.author_username}</strong>
          <span className="text-muted-foreground text-sm ml-2">· {new Date(comment.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          {currentUid && token && (
            <Button size="sm" variant="outline" onClick={() => setShowReplyForm(v => !v)}>
              Reply
            </Button>
          )}
          {isAuthor && (
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => onDelete(comment.cid)}>
              Delete
            </Button>
          )}
          {isRecipeOwner && !isAuthor && (
            <Button size="sm" variant="outline" onClick={() => onHide(comment.cid, !comment.hidden)}>
              {comment.hidden ? 'Unhide' : 'Hide'}
            </Button>
          )}
        </div>
      </div>
      <p className="mb-1 mt-1">{comment.body}</p>

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginLeft: '1.5rem', borderLeft: '2px solid var(--border-hex)', paddingLeft: '0.75rem', marginTop: '0.5rem' }}>
          {comment.replies.map(reply => {
            const isReplyAuthor = currentUid === reply.author_uid;
            return (
              <div key={reply.cid} style={{ marginBottom: '0.75rem' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <strong>{reply.author_username}</strong>
                    <span className="text-muted-foreground text-sm ml-2">· {new Date(reply.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {currentUid && token && (
                      <ReplyToSubForm targetCid={reply.cid} onReply={onReply} />
                    )}
                    {isReplyAuthor && (
                      <Button size="sm" variant="outline" className="text-destructive"
                        onClick={() => onDeleteReply(comment.cid, reply.cid)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mb-0 mt-1">{reply.body}</p>
              </div>
            );
          })}
        </div>
      )}

      {showReplyForm && (
        <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }} className="flex gap-2">
          <input
            type="text"
            className="flex h-7 w-full rounded border border-input bg-background px-2 py-0.5 text-xs outline-none focus:border-primary"
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder="Write a reply..."
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleReply(); } }}
          />
          <Button size="sm" variant="default" onClick={handleReply} disabled={replying || !replyBody.trim()}>
            Post
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowReplyForm(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
});

interface CommentsSectionProps {
  rid: string;
  recipeAuthorUid: string;
  isAuthenticated: boolean;
  user: { uid: string; username: string } | null;
  token: string | null;
}

export default function CommentsSection({ rid, recipeAuthorUid, isAuthenticated, user, token }: CommentsSectionProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);

  // Fetch count immediately so the toggle shows the real number before opening
  useEffect(() => {
    countComments(rid).then(setTotal).catch(() => {});
  }, [rid]);

  const fetchComments = useCallback(async (p: number) => {
    const data = await listComments(rid, p);
    setComments(data.comments ?? []);
    setTotal(data.total);
    setPage(p);
  }, [rid]);

  const handleOpen = () => {
    if (!loaded) {
      fetchComments(1).then(() => setLoaded(true)).catch(() => setLoaded(true));
    }
    setOpen(v => !v);
  };

  const handlePost = async () => {
    if (!token || !newBody.trim()) return;
    setPosting(true);
    try {
      const comment = await createComment(token, rid, newBody);
      setComments(prev => [...prev, comment]);
      setTotal(prev => prev + 1);
      setNewBody('');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = useCallback(async (cid: string) => {
    if (!token) return;
    await deleteComment(token, cid);
    setComments(prev => prev.filter(c => c.cid !== cid));
    setTotal(prev => prev - 1);
  }, [token]);

  const handleDeleteReply = useCallback(async (parentCid: string, cid: string) => {
    if (!token) return;
    await deleteComment(token, cid);
    setComments(prev => prev.map(c =>
      c.cid === parentCid
        ? { ...c, replies: (c.replies ?? []).filter(r => r.cid !== cid) }
        : c
    ));
  }, [token]);

  const handleHide = useCallback(async (cid: string, hidden: boolean) => {
    if (!token) return;
    await hideComment(token, cid, hidden);
    setComments(prev => prev.map(c => c.cid === cid ? { ...c, hidden } : c));
  }, [token]);

  const handleReply = useCallback(async (topLevelCid: string, targetCid: string, body: string) => {
    if (!token) return;
    const reply = await createComment(token, rid, body, targetCid);
    setComments(prev => prev.map(c =>
      c.cid === topLevelCid ? { ...c, replies: [...(c.replies ?? []), reply] } : c
    ));
  }, [token, rid]);

  const totalPages = Math.ceil(total / 10);

  return (
    <section className="mt-4 mb-4">
      <Button
        variant="link"
        className="p-0 mb-3"
        style={{ textDecoration: 'none', color: 'var(--primary-hex)' }}
        onClick={handleOpen}
      >
        {open ? '▲ Hide Comments' : `▼ View Comments (${total})`}
      </Button>

      {open && (
        <>
          {loaded && comments.length === 0 && (
            <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
          )}

          {comments.map(comment => {
            if (comment.hidden && user?.uid !== recipeAuthorUid) return null;
            return (
              <CommentItem
                key={comment.cid}
                comment={comment}
                recipeAuthorUid={recipeAuthorUid}
                currentUid={user?.uid}
                token={token ?? undefined}
                onDelete={handleDelete}
                onDeleteReply={handleDeleteReply}
                onHide={handleHide}
                onReply={(targetCid, body) => handleReply(comment.cid, targetCid, body)}
              />
            );
          })}

          {totalPages > 1 && (
            <div className="flex gap-2 mt-2 mb-3">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => fetchComments(page - 1)}>
                Previous
              </Button>
              <span className="self-center text-muted-foreground text-sm">{page} / {totalPages}</span>
              <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => fetchComments(page + 1)}>
                Next
              </Button>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                className="flex h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm outline-none focus:border-primary"
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handlePost(); } }}
              />
              <Button size="sm" variant="default" onClick={handlePost} disabled={posting || !newBody.trim()}>
                Post
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
