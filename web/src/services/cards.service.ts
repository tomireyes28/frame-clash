// web/src/services/cards.service.ts
import Cookies from 'js-cookie';
import { TmdbMovie } from './tmdb.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// 🔥 1. CREAMOS LOS TIPOS ESTRICTOS
export interface CardCategory {
  id: string;
  key: string;
}

export interface VaultCard {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  rarity: string;
  categories?: CardCategory[]; // Array de categorías opcional
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Cookies.get('frameclash_token')}`
});

export const CardsService = {
  saveCard: async (movie: TmdbMovie, rarity: string, categories: string[]) => {
    const payload = {
      tmdbId: movie.id,
      title: movie.title,
      year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0,
      posterPath: movie.poster_path,
      rarity,
      categories
    };

    const res = await fetch(`${API_URL}/admin/cards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al guardar la carta');
    }

    return res.json();
  },

  getAllCards: async (): Promise<VaultCard[]> => {
    const res = await fetch(`${API_URL}/admin/cards`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener el inventario de cartas');
    return res.json();
  },

  updateCard: async (id: string, rarity?: string, categories?: string[]) => {
    // 🔥 2. CHAU ANY. Usamos un Partial para decirle que son opcionales
    const payload: Partial<{ rarity: string; categories: string[] }> = {};
    if (rarity) payload.rarity = rarity;
    if (categories) payload.categories = categories;

    const res = await fetch(`${API_URL}/admin/cards/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al actualizar la carta');
    }

    return res.json();
  }
};