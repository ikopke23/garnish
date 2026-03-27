import { apiFetch } from './client';
import { apiPrefix } from '../configuration';

export interface RecipePhoto {
  pid: string;
  rid: string;
  name: string;
  link: string;
  uploaded_at: string;
}

export async function listPhotos(rid: string): Promise<RecipePhoto[]> {
  const photos = await apiFetch<RecipePhoto[]>(`/recipes/${rid}/photos`);
  return photos.map(p => ({ ...p, link: apiPrefix + p.link }));
}

export async function uploadPhoto(token: string, rid: string, file: File): Promise<RecipePhoto> {
  const form = new FormData();
  form.append('photo', file);
  const photo = await apiFetch<RecipePhoto>(`/recipes/${rid}/photos`, {
    method: 'POST',
    body: form,
  }, token);
  return { ...photo, link: apiPrefix + photo.link };
}
