// web/src/services/pvp.service.ts
import Cookies from 'js-cookie';
import { Question } from '@/store/useGameStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PvpPowerUp {
  id: string;
  title: string;
  action: string | null;
  value?: number | null;
}

export interface PvpPlayerInfo {
  userId: string;
  name: string;
  image: string | null;
  eloRating: number;
  score?: number;
  eloChange?: number;
}

export interface PvpMatchSummary {
  id: string;
  status: 'PENDING' | 'WAITING_OPPONENT' | 'FINISHED';
  categoryKey: string | null;
  categoryName: string;
  categoryIcon: string;
  player1: PvpPlayerInfo;
  player2: PvpPlayerInfo | null;
  winnerId: string | null;
  isCurrentUserWinner?: boolean;
  currentUserScore?: number;
  opponentScore?: number;
  eloChange?: number;
  createdAt: string;
}

export interface PvpMatchesResponse {
  userElo: number;
  rankTier: string;
  pendingCount: number;
  activeMatches: PvpMatchSummary[];
  historyMatches: PvpMatchSummary[];
}

export interface PvpStartResponse {
  matchId: string;
  role: 'PLAYER_1' | 'PLAYER_2';
  category: { key: string; name: string; icon: string };
  opponent: PvpPlayerInfo | null;
  questions: Question[];
  powerUps: PvpPowerUp[];
}

export interface PvpSubmitPayload {
  matchId: string;
  claimedScore: number;
  auditLog: {
    questionId: string;
    selectedAnswer: string;
    timeSpentMs: number;
  }[];
  usedPowerUps?: string[];
}

export interface PvpSubmitResponse {
  matchId: string;
  status: 'WAITING_OPPONENT' | 'FINISHED';
  result: 'VICTORY' | 'DEFEAT' | 'DRAW' | 'PENDING';
  myScore: number;
  opponentScore?: number;
  opponentName?: string;
  eloChange: number;
  newEloRating: number;
  rankTier: string;
  rewards: {
    coins: number;
    xp: number;
  };
  message: string;
}

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const pvpService = {
  getMyMatches: async (): Promise<PvpMatchesResponse> => {
    const res = await fetch(`${API_URL}/pvp/matches`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Error al obtener los duelos PvP.');
    return res.json();
  },

  createOrFindMatch: async (
    categoryKey?: string,
    equippedCardIds?: string[],
  ): Promise<PvpStartResponse> => {
    const res = await fetch(`${API_URL}/pvp/challenge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ categoryKey, equippedCardIds }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al iniciar el duelo PvP.');
    }
    return res.json();
  },

  submitMatch: async (payload: PvpSubmitPayload): Promise<PvpSubmitResponse> => {
    const res = await fetch(`${API_URL}/pvp/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al procesar el resultado del duelo.');
    }
    return res.json();
  },
};
