// api/src/roguelite/interfaces/roguelite.interface.ts
import { SafeQuestionPayload, PowerUpPayload } from '../../game/interfaces/game.interface';

export interface CategoryOption {
  key: string;
  name: string;
  slug: string;
  icon: string;
  type: string;
}

export interface ActiveRogueliteRun {
  runId: string;
  userId: string;
  wave: number;
  totalScore: number;
  accumulatedCoins: number;
  accumulatedXp: number;
  accumulatedPacks: string[]; // IDs de sobres ganados (ej: ['BRONZE', 'SILVER'])
  targetScore: number;
  selectedCategory: string | null;
  categoryChoices: CategoryOption[];
  equippedCardIds: string[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'GAME_OVER';
  createdAt: number;
}

export interface StartWaveResponse {
  runId: string;
  wave: number;
  targetScore: number;
  category: string;
  questions: SafeQuestionPayload[];
  powerUps: PowerUpPayload[];
}

export interface SubmitWaveResult {
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
