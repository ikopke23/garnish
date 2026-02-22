import { apiPrefix } from '../configuration';

export interface Equipment {
  eid: string;
  name: string;
}

export async function listEquipment(): Promise<Equipment[]> {
  const res = await fetch(`${apiPrefix}/equipment`);
  if (!res.ok) throw new Error('Failed to list equipment');
  return res.json();
}
