// api/src/game/interfaces/game.interface.ts
import { Difficulty } from '@prisma/client';

export interface PowerUpPayload {
  id: string;
  title: string;
  action: string | null;
  value: number | null;
}

export interface SafeQuestionPayload {
  id: string;
  text: string;
  options: string[];
  difficulty: Difficulty;
  imageUrl?: string | null;
  block?: number | null;
  typeNumber?: number | null;
  answerHash: string;
}

export interface GameRoundResponse {
  questions: SafeQuestionPayload[];
  powerUps: PowerUpPayload[];
}