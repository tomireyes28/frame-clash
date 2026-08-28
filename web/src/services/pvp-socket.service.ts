// web/src/services/pvp-socket.service.ts
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { Question } from '@/store/useGameStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000/pvp-live';

export interface LivePvpPlayer {
  userId: string;
  name: string;
  image: string | null;
  eloRating: number;
}

export interface MatchStartPayload {
  roomId: string;
  category: { key: string; name: string; icon: string };
  totalQuestions: number;
  player1: LivePvpPlayer;
  player2: LivePvpPlayer;
}

export interface QuestionStartPayload {
  questionIndex: number;
  totalQuestions: number;
  question: Question;
  timeLimit: number;
}

export interface LiveScoreUpdatePayload {
  userId: string;
  isCorrect: boolean;
  scoreAdded: number;
  totalScore: number;
}

export interface QuestionResultPayload {
  correctAnswer: string;
  p1Score: number;
  p2Score: number;
}

export interface MatchEndPayload {
  winnerId: string | null;
  player1: {
    userId: string;
    name: string;
    score: number;
    eloChange: number;
    newElo: number;
    rewards: { coins: number; xp: number };
  };
  player2: {
    userId: string;
    name: string;
    score: number;
    eloChange: number;
    newElo: number;
    rewards: { coins: number; xp: number };
  };
}

class PvpSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = Cookies.get('frameclash_token');

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    return this.socket;
  }

  joinQueue(categoryKey?: string, equippedCards?: string[]) {
    if (!this.socket) this.connect();
    this.socket?.emit('join_queue', { categoryKey, equippedCards });
  }

  leaveQueue() {
    this.socket?.emit('leave_queue');
  }

  submitAnswer(roomId: string, selectedAnswer: string, timeSpentMs: number) {
    this.socket?.emit('submit_answer', { roomId, selectedAnswer, timeSpentMs });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const pvpSocketService = new PvpSocketService();
