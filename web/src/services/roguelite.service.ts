// web/src/services/roguelite.service.ts
import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CategoryOption {
  key: string;
  name: string;
  slug: string;
  icon: string;
  type: string;
}

export interface StartRunResponse {
  runId: string;
  wave: number;
  targetScore: number;
  categoryChoices: CategoryOption[];
  bestWave: number;
  bestScore: number;
}

export interface StartWaveResponse {
  runId: string;
  wave: number;
  targetScore: number;
  category: string;
  questions: Question[];
  powerUps: PowerUp[];
}

export interface SubmitWaveResponse {
  runId: string;
  wave: number;
  roundScore: number;
  targetScore: number;
  passed: boolean;
  totalScore: number;
  accumulatedCoins: number;
  accumulatedXp: number;
  accumulatedPacks: string[];
  nextCategoryChoices?: CategoryOption[];
  nextTargetScore?: number;
  isNewRecord?: boolean;
  message: string;
}

export interface RogueliteProgressResponse {
  bestWave: number;
  bestScore: number;
  totalRuns: number;
  unlockedPowerUpSlots: number;
}

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const rogueliteService = {
  getProgress: async (): Promise<RogueliteProgressResponse> => {
    const response = await fetch(`${API_URL}/roguelite/progress`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar progreso de Roguelike.');
    return response.json();
  },

  startRun: async (equippedCardIds: string[] = []): Promise<StartRunResponse> => {
    const response = await fetch(`${API_URL}/roguelite/start-run`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ equippedCardIds }),
    });
    if (!response.ok) throw new Error('Error al iniciar la corrida de Roguelike.');
    return response.json();
  },

  startWave: async (runId: string, categoryId: string): Promise<StartWaveResponse> => {
    const response = await fetch(`${API_URL}/roguelite/start-wave`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ runId, categoryId }),
    });
    if (!response.ok) throw new Error('Error al iniciar la ronda.');
    return response.json();
  },

  submitWave: async (
    runId: string,
    claimedScore: number,
    auditLog: AuditLogEntry[],
    usedPowerUps?: string[],
  ): Promise<SubmitWaveResponse> => {
    const response = await fetch(`${API_URL}/roguelite/submit-wave`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        runId,
        claimedScore,
        auditLog,
        usedPowerUps,
      }),
    });
    if (!response.ok) throw new Error('Error al enviar los resultados de la ronda.');
    return response.json();
  },
};
