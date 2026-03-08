// src/services/leaderboard.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface RankedPlayer {
  rank: number;
  userId: string;
  score: number;
  name: string;
  image: string | null;
}

export interface LeaderboardResponse {
  success: boolean;
  mode: string;
  data: RankedPlayer[];
}

export const leaderboardService = {
  getLeaderboard: async (mode: string = 'ARCADE'): Promise<RankedPlayer[]> => {
    // Usamos 'no-store' porque el ranking en vivo cambia a cada segundo
    const response = await fetch(`${API_URL}/leaderboard?mode=${mode}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar el ranking global.');
    }
    
    const json: LeaderboardResponse = await response.json();
    return json.data;
  }
};