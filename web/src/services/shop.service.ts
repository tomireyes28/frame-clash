import Cookies from 'js-cookie'; // 👈 1. Importamos la bóveda de credenciales

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

// 🛠️ Nuestro helper de seguridad
const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 👈 2. El pase VIP
  };
};

export const shopService = {
  // 🧹 3. Chau userId de los parámetros
  buyStandardPack: async (): Promise<BuyPackResponse> => {
    const response = await fetch(`${API_URL}/shop/buy-pack`, {
      method: 'POST',
      headers: getAuthHeaders(), // 👈 4. Adjuntamos el token
      // 🧹 5. Borramos la propiedad `body` por completo. El backend ya no la necesita.
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al comprar el sobre.');
    }

    return response.json();
  }
};