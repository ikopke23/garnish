import { apiFetch } from './client';

export interface Equipment {
  eid: string;
  name: string;
}

export async function listEquipment(): Promise<Equipment[]> {
  return apiFetch('/equipment');
}
