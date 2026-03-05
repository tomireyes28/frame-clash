import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SubmitGamePayload {
  userId: string;
  categoryId: string;
  claimedScore: number;
  auditLog: AuditLogEntry[];
  usedPowerUps?: string[]; 
}

// NUEVO: Agregamos coinsEarned y xpEarned a la respuesta del servidor
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
  title: string;
  year: number;
  posterPath: string | null;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  powerUpAction: string | null;
  powerUpValue: number | null;
  quantity: number;
  level: number;
  equippedModes: string[];
}

export const gameService = {
  startRound: async (categoryId: string): Promise<{ questions: Question[], powerUps: PowerUp[] }> => {
    const response = await fetch(`${API_URL}/game/start?categoryId=${categoryId}`);
    
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('El Juez rechazó la partida.');
    }

    return response.json();
  },

  getInventory: async (userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<InventoryCard[]> => {
    const response = await fetch(`${API_URL}/game/inventory?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar el inventario.');
    }
    
    const json = await response.json();
    return json.data; 
  },

  getEquippedCards: async (mode: string, userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<InventoryCard[]> => {
    const allCards = await gameService.getInventory(userId);
    return allCards.filter(card => card.equippedModes.includes(mode));
  }
};