

export interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const TmdbService = {
  // AHORA ACEPTA LOS FILTROS
  getPopular: async (genre?: string, minYear?: string, maxYear?: string): Promise<TmdbMovie[]> => {
    // Armamos la URL dinámicamente según lo que nos pasen
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    if (minYear) params.append('minYear', minYear);
    if (maxYear) params.append('maxYear', maxYear);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_URL}/tmdb/popular${queryString}`);
    
    if (!res.ok) throw new Error('Error al obtener populares');
    return res.json();
  },

  search: async (query: string): Promise<TmdbMovie[]> => {
    const res = await fetch(`${API_URL}/tmdb/search?q=${query}`);
    if (!res.ok) throw new Error('Error en la búsqueda');
    return res.json();
  }
};