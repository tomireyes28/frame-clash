

export interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const TmdbService = {
  getPopular: async (): Promise<TmdbMovie[]> => {
    const res = await fetch(`${API_URL}/tmdb/popular`);
    if (!res.ok) throw new Error('Error al obtener populares');
    return res.json();
  },

  search: async (query: string): Promise<TmdbMovie[]> => {
    const res = await fetch(`${API_URL}/tmdb/search?q=${query}`);
    if (!res.ok) throw new Error('Error en la búsqueda');
    return res.json();
  }
};