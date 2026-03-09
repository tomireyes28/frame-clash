import Cookies from 'js-cookie'; // 👈 Importamos js-cookie

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
  
  // Datos de la película (aplanados o dentro de un objeto 'card', según tu backend)
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  rarity: string;
  
  // 🔥 Acá sumamos las categorías y los poderes para que TypeScript no llore
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

// 🛠️ Nuestro helper para inyectar el token en cada petición
const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const inventoryService = {
  // 🧹 1. Chau userId
  getInventory: async (): Promise<InventoryCard[]> => {
    // 🧹 2. Chau ?userId= de la URL y agregamos headers
    const response = await fetch(`${API_URL}/inventory`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar el inventario.');
    }
    
    const json = await response.json();
    return json.data;
  },

  // 🧹 3. Chau userId de los parámetros
  upgradeCard: async (cardId: string): Promise<UpgradeResponse> => {
    const response = await fetch(`${API_URL}/inventory/upgrade`, {
      method: 'POST',
      headers: getAuthHeaders(), // 👈 4. Inyectamos el token
      // 🧹 5. En el body SOLO mandamos la carta. El backend ya sabe quién somos.
      body: JSON.stringify({ cardId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al mejorar la carta.');
    }

    return response.json();
  }
};