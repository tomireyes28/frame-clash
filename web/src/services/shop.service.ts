// src/services/shop.service.ts
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

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };
};

export const shopService = {
  
  getUserBalance: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_URL}/profile`, { 
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return 0;
      
      const data = await response.json();
      return data.profile?.user?.coins ?? 0;
    } catch (error) {
      console.error('Error al obtener balance:', error);
      return 0;
    }
  },

  // 🛠️ Recibe el ID del sobre y lo manda por POST
  buyPack: async (packId: string): Promise<BuyPackResponse> => {
    const response = await fetch(`${API_URL}/shop/buy-pack`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ packId }) 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al comprar el sobre.');
    }

    return response.json();
  }
};