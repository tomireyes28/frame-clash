// web/src/services/cards.service.ts
import { TmdbMovie } from './tmdb.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const CardsService = {
  saveCard: async (movie: TmdbMovie, rarity: string) => {
    // Armamos el "paquete" exactamente como lo pide tu CreateCardDto en NestJS
    const payload = {
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path || '', 
      releaseDate: movie.release_date || '2000-01-01', // Por si alguna peli vieja no tiene fecha
      rarity: rarity,
    };

    const res = await fetch(`${API_URL}/admin/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al guardar la carta');
    }

    return res.json();
  },

  getAllCards: async () => {
    const res = await fetch(`${API_URL}/admin/cards`);
    if (!res.ok) throw new Error('Error al obtener el inventario de cartas');
    return res.json();
  }

};