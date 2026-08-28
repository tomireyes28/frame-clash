// api/src/pvp/interfaces/pvp.interface.ts
import { SafeQuestionPayload, PowerUpPayload } from '../../game/interfaces/game.interface';

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
  createdAt: Date;
}

export interface PvpStartResponse {
  matchId: string;
  role: 'PLAYER_1' | 'PLAYER_2';
  category: { key: string; name: string; icon: string };
  opponent: PvpPlayerInfo | null;
  questions: SafeQuestionPayload[];
  powerUps: PowerUpPayload[];
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
