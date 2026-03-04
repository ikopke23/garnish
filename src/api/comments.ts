import { apiPrefix } from '../configuration';

export interface Comment {
  cid: string;
  recipe_uid: string;
  author_uid: string;
  author_username: string;
  body: string;
  parent_cid: string | null;
  hidden: boolean;
  created_at: string;
  replies?: Comment[];
}

export interface CommentsPage {
  comments: Comment[];
  total: number;
  page: number;
}

export async function listComments(rid: string, page = 1): Promise<CommentsPage> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/comments?page=${page}`);
  if (!res.ok) throw new Error('Failed to list comments');
  return res.json();
}

export async function createComment(token: string, rid: string, body: string, parentCid?: string): Promise<Comment> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, parent_cid: parentCid ?? null }),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
}

export async function deleteComment(token: string, cid: string): Promise<void> {
  const res = await fetch(`${apiPrefix}/comments/${cid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}

export async function hideComment(token: string, cid: string, hidden: boolean): Promise<void> {
  const res = await fetch(`${apiPrefix}/comments/${cid}/hidden`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ hidden }),
  });
  if (!res.ok) throw new Error('Failed to update comment');
}

export async function countComments(rid: string): Promise<number> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/comments/count`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.total ?? 0;
}
