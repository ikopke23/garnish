import { apiFetch, apiFetchVoid } from './client';

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
  return apiFetch(`/recipes/${rid}/comments?page=${page}`);
}

export async function createComment(token: string, rid: string, body: string, parentCid?: string): Promise<Comment> {
  return apiFetch(`/recipes/${rid}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, parent_cid: parentCid ?? null }),
  }, token);
}

export async function deleteComment(token: string, cid: string): Promise<void> {
  return apiFetchVoid(`/comments/${cid}`, { method: 'DELETE' }, token);
}

export async function hideComment(token: string, cid: string, hidden: boolean): Promise<void> {
  return apiFetchVoid(`/comments/${cid}/hidden`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hidden }),
  }, token);
}

export async function countComments(rid: string): Promise<number> {
  try {
    const data = await apiFetch<{ total: number }>(`/recipes/${rid}/comments/count`);
    return data.total ?? 0;
  } catch {
    return 0;
  }
}
