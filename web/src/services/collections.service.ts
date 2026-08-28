// web/src/services/collections.service.ts
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SetCardItem {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  rarity: string;
  isOwned: boolean;
}

export interface UserCollectionItem {
  id: string;
  name: string;
  description: string | null;
  rewardType: 'COINS' | 'STARDUST' | 'PACK';
  rewardValue: string;
  totalCards: number;
  ownedCardsCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  cards: SetCardItem[];
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
  rewardType: 'COINS' | 'STARDUST' | 'PACK';
  rewardValue: string;
  cardIds: string[];
}

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const collectionsService = {
  getUserCollections: async (): Promise<UserCollectionItem[]> => {
    const response = await fetch(`${API_URL}/collections`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar colecciones de sets.');
    return response.json();
  },

  claimReward: async (collectionId: string): Promise<{ success: boolean; message: string; rewardDescription: string }> => {
    const response = await fetch(`${API_URL}/collections/${collectionId}/claim`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al reclamar la recompensa.');
    }
    return response.json();
  },

  getAdminCollections: async () => {
    const response = await fetch(`${API_URL}/collections/admin/list`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar colecciones del administrador.');
    return response.json();
  },

  createCollection: async (payload: CreateCollectionPayload) => {
    const response = await fetch(`${API_URL}/collections/admin/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al crear la colección.');
    }
    return response.json();
  },

  deleteCollection: async (collectionId: string) => {
    const response = await fetch(`${API_URL}/collections/admin/${collectionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar la colección.');
    return response.json();
  },
};
