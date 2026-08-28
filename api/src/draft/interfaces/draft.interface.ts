// api/src/draft/interfaces/draft.interface.ts
import { SafeQuestionPayload, PowerUpPayload } from '../../game/interfaces/game.interface';

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

export interface DraftSession {
  sessionId: string;
  userId: string;
  status: 'DRAFTING' | 'READY_FOR_ROUND' | 'PLAYING_ROUND' | 'FINISHED';
  draftedCards: DraftCardOption[];
  currentDraftOptions: DraftCardOption[];
  roundCategories: { key: string; name: string; icon: string }[];
  currentRound: number; // 1, 2, 3
  roundScores: number[];
  roundTargets: number[]; // [50000, 75000, 95000]
  passedRounds: number; // 0, 1, 2, 3
  createdAt: number;
}

export interface StartDraftResponse {
  sessionId: string;
  draftStep: number; // 1 a 5
  options: DraftCardOption[];
  draftedCards: DraftCardOption[];
  roundCategories: { key: string; name: string; icon: string }[];
}

export interface StartDraftRoundResponse {
  sessionId: string;
  roundNumber: number;
  totalRounds: number; // 3
  targetScore: number;
  category: { key: string; name: string; icon: string };
  questions: SafeQuestionPayload[];
  powerUps: PowerUpPayload[]; // 5 power-ups reiniciados
}

export interface SubmitDraftRoundResponse {
  sessionId: string;
  roundNumber: number;
  roundScore: number;
  targetScore: number;
  passed: boolean;
  isDraftCompleted: boolean;
  prizeTier: number; // 0 (consuelo), 1, 2, 3 (campeón)
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
