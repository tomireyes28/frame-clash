import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';
import Cookies from 'js-cookie'; // 👈 1. Importamos las cookies

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SubmitGamePayload {
  // 🧹 Borramos el userId de acá, ya no viaja en el body
  categoryId: string;
  claimedScore: number;
  auditLog: AuditLogEntry[];
  usedPowerUps?: string[]; 
}

export interface SubmitGameResponse {
  success: boolean;
  sessionId: string;
  finalScore: number;
  coinsEarned: number; 
  xpEarned: number;
  isAdjusted: boolean;
  message: string;
}

export interface InventoryCard {
  id: string;
  cardId: string;
  tmdbId: number;           // 🔥 Faltaba
  title: string;
  year: number;             // 🔥 Faltaba
  posterPath: string | null;
  rarity: string;
  level: number;
  quantity: number;
  equippedModes: string[];
  categories?: { key: string }[]; // 🔥 Faltaba
  powerUpAction: string | null;
  powerUpValue: number | null;
}

// 🛠️ Helper function para no repetir código: Obtiene los headers de autorización
const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 👈 2. La llave maestra para el Backend
  };
};

export const gameService = {
  startRound: async (categoryId: string): Promise<{ questions: Question[], powerUps: PowerUp[] }> => {
    const response = await fetch(`${API_URL}/game/start?categoryId=${categoryId}`, {
      headers: getAuthHeaders(), // 👈 3. Inyectamos los headers
    });
    
    if (!response.ok) {
      throw new Error('Error al conectar con el Coliseo (Backend).');
    }
    
    const json = await response.json();
    
    return {
      questions: json.data,
      powerUps: json.powerUps || [],
    };
  },

  submitRound: async (payload: SubmitGamePayload): Promise<SubmitGameResponse> => {
    const response = await fetch(`${API_URL}/game/submit`, {
      method: 'POST',
      headers: getAuthHeaders(), // 👈 3. Inyectamos los headers
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('El Juez rechazó la partida.');
    }

    return response.json();
  },

  // 🧹 Borramos el parámetro userId hardcodeado
  getInventory: async (): Promise<InventoryCard[]> => {
    // 🧹 Borramos el ?userId= de la URL
    const response = await fetch(`${API_URL}/game/inventory`, {
      headers: getAuthHeaders(), // 👈 3. Inyectamos los headers
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar el inventario.');
    }
    
    const json = await response.json();
    return json.data; 
  },

  // 🧹 Borramos el parámetro userId hardcodeado
  getEquippedCards: async (mode: string): Promise<InventoryCard[]> => {
    // 🧹 Llamamos a getInventory sin parámetros
    const allCards = await gameService.getInventory();
    return allCards.filter(card => card.equippedModes.includes(mode));
  }
};