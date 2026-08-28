import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface InventoryCategory {
  id?: string;
  key: string;
}

export interface InventoryCard {
  id: string;          // ID de la relación UserCard
  cardId: string;      // ID de la carta base
  quantity: number;
  level: number;
  
  // Datos de la película
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  rarity: string;
  
  categories?: InventoryCategory[];
  powerUpAction?: string;
  powerUpValue?: number;
}

export interface UpgradeResponse {
  success: boolean;
  message: string;
  newLevel: number;
  remainingQuantity: number;
  newBalance: number;
}

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const inventoryService = {
  getInventory: async (): Promise<InventoryCard[]> => {
    const response = await fetch(`${API_URL}/inventory`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar el inventario.');
    }
    
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  upgradeCard: async (cardId: string): Promise<UpgradeResponse> => {
    const response = await fetch(`${API_URL}/inventory/${cardId}/upgrade`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al mejorar la carta.');
    }

    return response.json();
  },
};