import { apiFetch } from './client';

export interface CommentWithRecipe {
  cid: string;
  recipe_uid: string;
  recipe_name: string;
  author_uid: string;
  body: string;
  hidden: boolean;
  created_at: string;
}

export interface UserStats {
  total_recipes: number;
  avg_rating: number | null;
  total_times_cooked: number;
  favorite_recipe_rid: string | null;
  favorite_recipe_name: string | null;
  favorite_recipe_times_cooked: number | null;
  most_reviewed_author_uid: string | null;
  most_reviewed_author_username: string | null;
}

export async function getUserComments(uid: string): Promise<CommentWithRecipe[]> {
  return apiFetch(`/users/${uid}/comments`);
}

export async function getUserStats(uid: string): Promise<UserStats> {
  return apiFetch(`/users/${uid}/stats`);
}
