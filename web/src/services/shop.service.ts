// src/services/shop.service.ts
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

export const shopService = {
  buyStandardPack: async (userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<BuyPackResponse> => {
    const response = await fetch(`${API_URL}/shop/buy-pack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al comprar el sobre.');
    }

    return response.json();
  }
};