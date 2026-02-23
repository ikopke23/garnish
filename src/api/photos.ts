import { apiPrefix } from '../configuration';

export interface RecipePhoto {
  pid: string;
  rid: string;
  name: string;
  link: string;
  uploaded_at: string;
}

export async function listPhotos(rid: string): Promise<RecipePhoto[]> {
  const res = await fetch(`${apiPrefix}/recipes/${rid}/photos`);
  if (!res.ok) throw new Error('Failed to list photos');
  return res.json();
}

export async function uploadPhoto(token: string, rid: string, file: File): Promise<RecipePhoto> {
  const form = new FormData();
  form.append('photo', file);
  const res = await fetch(`${apiPrefix}/recipes/${rid}/photos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Failed to upload photo');
  return res.json();
}
