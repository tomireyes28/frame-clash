// web/src/services/draft.service.ts
import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface DraftCardOption {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  rarity: string;
  powerUpAction: string | null;
  powerUpValue: number | null;
}

export interface StartDraftResponse {
  sessionId: string;
  draftStep: number;
  options: DraftCardOption[];
  draftedCards: DraftCardOption[];
  roundCategories: { key: string; name: string; icon: string }[];
}

export interface PickCardResponse {
  sessionId: string;
  draftStep: number;
  options: DraftCardOption[];
  draftedCards: DraftCardOption[];
  isDraftComplete: boolean;
  roundCategories: { key: string; name: string; icon: string }[];
}

export interface StartDraftRoundResponse {
  sessionId: string;
  roundNumber: number;
  totalRounds: number;
  targetScore: number;
  category: { key: string; name: string; icon: string };
  questions: Question[];
  powerUps: PowerUp[];
}

export interface SubmitDraftRoundResponse {
  sessionId: string;
  roundNumber: number;
  roundScore: number;
  targetScore: number;
  passed: boolean;
  isDraftCompleted: boolean;
  prizeTier: number;
  rewards: {
    coins: number;
    xp: number;
    stardust: number;
    packId?: string;
  };
  nextCategory?: { key: string; name: string; icon: string };
  nextTargetScore?: number;
  message: string;
}

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const draftService = {
  startDraft: async (): Promise<StartDraftResponse> => {
    const response = await fetch(`${API_URL}/draft/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al iniciar el modo Draft.');
    return response.json();
  },

  pickCard: async (sessionId: string, cardId: string): Promise<PickCardResponse> => {
    const response = await fetch(`${API_URL}/draft/pick`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId, cardId }),
    });
    if (!response.ok) throw new Error('Error al elegir carta del draft.');
    return response.json();
  },

  startRound: async (sessionId: string, roundNumber: number): Promise<StartDraftRoundResponse> => {
    const response = await fetch(`${API_URL}/draft/start-round`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId, roundNumber }),
    });
    if (!response.ok) throw new Error('Error al iniciar la ronda del draft.');
    return response.json();
  },

  submitRound: async (
    sessionId: string,
    roundNumber: number,
    claimedScore: number,
    auditLog: AuditLogEntry[],
    usedPowerUps?: string[],
  ): Promise<SubmitDraftRoundResponse> => {
    const response = await fetch(`${API_URL}/draft/submit-round`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        sessionId,
        roundNumber,
        claimedScore,
        auditLog,
        usedPowerUps,
      }),
    });
    if (!response.ok) throw new Error('Error al enviar respuestas de la ronda de draft.');
    return response.json();
  },
};
