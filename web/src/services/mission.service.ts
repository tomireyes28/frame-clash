// src/services/mission.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Mission {
  id: string;
  type: string;
  title: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  rewardCoins: number;
  expiresAt: string;
}

export interface MissionsResponse {
  success: boolean;
  data: Mission[];
}

export const missionService = {
  // Por ahora hardcodeamos tu ID de prueba, luego lo sacaremos de la sesión de NextAuth
  getDailyMissions: async (userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<Mission[]> => {
    const response = await fetch(`${API_URL}/mission?userId=${userId}`, {
      // Usamos 'no-store' para que Next.js no cachee esto y siempre traiga el progreso real
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar las misiones del servidor.');
    }
    
    const json: MissionsResponse = await response.json();
    return json.data;
  }
};