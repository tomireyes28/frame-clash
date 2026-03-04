// src/services/game.service.ts
import { Question, AuditLogEntry } from '@/store/useGameStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tipamos lo que enviamos
export interface SubmitGamePayload {
  userId: string;
  categoryId: string;
  claimedScore: number;
  auditLog: AuditLogEntry[];
}

// Tipamos lo que recibimos del backend
export interface SubmitGameResponse {
  success: boolean;
  sessionId: string;
  finalScore: number;
  isAdjusted: boolean;
  message: string;
}

export const gameService = {
  startRound: async (categoryId: string): Promise<Question[]> => {
    const response = await fetch(`${API_URL}/game/start?categoryId=${categoryId}`);
    if (!response.ok) throw new Error('Error al conectar con el backend.');
    const json = await response.json();
    return json.data;
  },

  submitRound: async (payload: SubmitGamePayload): Promise<SubmitGameResponse> => {
    const response = await fetch(`${API_URL}/game/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('El Juez rechazó la partida.');
    return response.json();
  }
};