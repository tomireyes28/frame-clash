// api/src/game/interfaces/game.interface.ts

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
  difficulty: string;
  answerHash: string;
}

export interface GameRoundResponse {
  questions: SafeQuestionPayload[];
  powerUps: PowerUpPayload[];
}