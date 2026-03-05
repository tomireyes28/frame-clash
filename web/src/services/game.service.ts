// src/services/game.service.ts
import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SubmitGamePayload {
  userId: string;
  categoryId: string;
  claimedScore: number;
  auditLog: AuditLogEntry[];
}

export interface SubmitGameResponse {
  success: boolean;
  sessionId: string;
  finalScore: number;
  isAdjusted: boolean;
  message: string;
}

export const gameService = {
  // AHORA DEVOLVEMOS UN OBJETO CON LAS PREGUNTAS Y LOS PODERES
  startRound: async (categoryId: string): Promise<{ questions: Question[], powerUps: PowerUp[] }> => {
    const response = await fetch(`${API_URL}/game/start?categoryId=${categoryId}`);
    
    if (!response.ok) {
      throw new Error('Error al conectar con el Coliseo (Backend).');
    }
    
    const json = await response.json();
    
    // Atajamos ambas cosas del JSON que manda NestJS
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
  }
};