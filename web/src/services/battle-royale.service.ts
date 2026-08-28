// web/src/services/battle-royale.service.ts
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { Question } from '@/store/useGameStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000/battle-royale';

export interface BRPlayerSummary {
  userId?: string;
  name: string;
  image: string | null;
  eloRating?: number;
  score?: number;
  isBot?: boolean;
}

export interface BRLobbyUpdatePayload {
  playerCount: number;
  players: { name: string; image: string | null }[];
}

export interface BRMatchStartPayload {
  roomId: string;
  totalPlayers: number;
  players: BRPlayerSummary[];
}

export interface BRLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  score: number;
  isEliminated: boolean;
  hasAnswered: boolean;
}

export interface BRQuestionStartPayload {
  round: number;
  questionNumber: number;
  totalRounds: number;
  activePlayerCount: number;
  question: Question;
  timeLimit: number;
  leaderboard: BRLeaderboardEntry[];
}

export interface BRRoundEliminationPayload {
  roundEnded: number;
  eliminatedPlayers: { userId: string; name: string; score: number }[];
  survivingPlayers: { userId: string; name: string; score: number }[];
  nextRound: number;
}

export interface BRMatchEndPayload {
  champion: { name: string; score: number };
  podium: { rank: number; name: string; score: number; isBot?: boolean }[];
  allPlayers: { rank: number; name: string; score: number; isBot?: boolean }[];
}

class BattleRoyaleSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = Cookies.get('frameclash_token');

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    return this.socket;
  }

  joinLobby() {
    this.socket?.emit('join_br_lobby');
  }

  leaveLobby() {
    this.socket?.emit('leave_br_lobby');
  }

  submitAnswer(roomId: string, selectedOption: string, timeSpentMs: number) {
    this.socket?.emit('submit_br_answer', {
      roomId,
      selectedOption,
      timeSpentMs,
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const battleRoyaleSocketService = new BattleRoyaleSocketService();
