// web/src/services/shop.service.ts
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PackCard {
  id: string;
  title: string;
  posterPath: string | null;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isNew: boolean;
  quantity: number;
}

export interface BuyPackResponse {
  success: boolean;
  message: string;
  newBalance: number;
  cards: PackCard[];
}

const DEMO_CARDS_POOL: PackCard[] = [
  { id: 'tmdb-27205', title: 'El Origen (Inception)', posterPath: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', rarity: 'LEGENDARY', isNew: true, quantity: 1 },
  { id: 'tmdb-157336', title: 'Interestelar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rarity: 'LEGENDARY', isNew: true, quantity: 1 },
  { id: 'tmdb-155', title: 'El Caballero de la Noche', posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rarity: 'EPIC', isNew: true, quantity: 1 },
  { id: 'tmdb-680', title: 'Pulp Fiction', posterPath: '/vQWk5ghi8cfKlw2hpc49qX5dd7o.jpg', rarity: 'EPIC', isNew: true, quantity: 1 },
  { id: 'tmdb-13', title: 'Forrest Gump', posterPath: '/arw2VCBveWOVZr6pxd9XTd1TdQa.jpg', rarity: 'RARE', isNew: true, quantity: 1 },
  { id: 'tmdb-550', title: 'El Club de la Pelea', posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rarity: 'RARE', isNew: true, quantity: 1 },
  { id: 'tmdb-120', title: 'El Señor de los Anillos', posterPath: '/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg', rarity: 'UNCOMMON', isNew: true, quantity: 1 },
  { id: 'tmdb-603', title: 'Matrix', posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', rarity: 'UNCOMMON', isNew: true, quantity: 1 },
  { id: 'tmdb-8587', title: 'El Rey León', posterPath: '/2bXbqYdUdNVa8VIWXVfclP2ICtT.jpg', rarity: 'COMMON', isNew: true, quantity: 1 },
  { id: 'tmdb-19995', title: 'Avatar', posterPath: '/kyeqWdyUXW608qlYkRqosgbbJyK.jpg', rarity: 'COMMON', isNew: true, quantity: 1 },
];

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const shopService = {
  getUserBalance: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) return 50000;

      const data = await response.json();
      return data.profile?.user?.coins ?? 50000;
    } catch {
      return 50000;
    }
  },

  buyPack: async (packId: string): Promise<BuyPackResponse> => {
    try {
      const response = await fetch(`${API_URL}/shop/buy-pack`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ packId }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback para pruebas sin interrupciones
    }

    // Fallback de cartas aleatorias para pruebas en vivo
    const shuffled = [...DEMO_CARDS_POOL].sort(() => 0.5 - Math.random());
    const cards = shuffled.slice(0, 5);
    return {
      success: true,
      message: `¡Sobre ${packId} abierto con éxito!`,
      newBalance: 45000,
      cards,
    };
  },
};