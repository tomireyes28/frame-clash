// web/src/services/leaderboard.service.ts
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LeaderboardPlayer {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  level: number;
  title?: string | null;
  primaryMetric: string;
  secondaryMetric?: string;
  isCurrentUser?: boolean;
}

export interface LeaderboardResult {
  type: string;
  title: string;
  description: string;
  players: LeaderboardPlayer[];
  currentUser?: LeaderboardPlayer | null;
}

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const leaderboardService = {
  getLeaderboard: async (type: string = 'SCORE'): Promise<LeaderboardResult> => {
    const response = await fetch(`${API_URL}/leaderboard?type=${type}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Error al cargar el ranking global.');
    }

    return response.json();
  },
};