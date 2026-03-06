// src/services/inventory.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface InventoryCard {
  id: string;
  title: string;
  posterPath: string | null;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  powerUpAction: string | null;
  powerUpValue: number | null;
  quantity: number;
  level: number;
  equippedModes: string[];
}

export interface UpgradeResponse {
  success: boolean;
  message: string;
  newLevel: number;
  remainingQuantity: number;
  newBalance: number;
}

export const inventoryService = {
  getInventory: async (userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<InventoryCard[]> => {
    const response = await fetch(`${API_URL}/inventory?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar el inventario.');
    }
    
    const json = await response.json();
    return json.data;
  },

  upgradeCard: async (cardId: string, userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<UpgradeResponse> => {
    const response = await fetch(`${API_URL}/inventory/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, cardId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al mejorar la carta.');
    }

    return response.json();
  }
};