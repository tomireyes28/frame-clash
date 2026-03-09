import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

// Helper de seguridad
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Cookies.get('frameclash_token')}`
});

export const TmdbService = {
  search: async (query: string) => {
    const res = await fetch(`${API_URL}/tmdb/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(), // 👈 Candado abierto
    });
    if (!res.ok) throw new Error('Error al buscar en TMDB');
    return res.json();
  },

  getPopular: async (genre?: string, minYear?: string, maxYear?: string) => {
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    if (minYear) params.append('minYear', minYear);
    if (maxYear) params.append('maxYear', maxYear);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const res = await fetch(`${API_URL}/tmdb/popular${queryString}`, {
      headers: getAuthHeaders(), // 👈 Candado abierto
    });
    
    if (!res.ok) throw new Error('Error al obtener populares');
    return res.json();
  },
};