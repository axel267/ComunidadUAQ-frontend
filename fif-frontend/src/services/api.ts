const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Facultade {
  id: number;
  nombre: string;
  abreviatura: string;
}

export const getFacultades = async (): Promise<Facultade[]> => {
  const res = await fetch(`${API_URL}/facultades`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener las facultades');
  return res.json();
};

export const createFacultade = async (data: Omit<Facultade, 'id'>): Promise<Facultade> => {
  const res = await fetch(`${API_URL}/facultades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear la facultad');
  return res.json();
};

export const deleteFacultade = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/facultades/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar la facultad');
};
