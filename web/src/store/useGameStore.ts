// src/store/useGameStore.ts
import { create } from 'zustand';

export interface Question {
  id: string;
  text: string;
  options: string[];
  difficulty: string;
  answerHash: string;
}

export interface AuditLogEntry {
  questionId: string;
  selectedAnswer: string;
  timeSpentMs: number;
}

export interface PowerUp {
  id: string;
  title: string;
  action: string;
  value: number;
}

type GameStatus = 'idle' | 'playing' | 'finished';

interface GameState {
  status: GameStatus;
  questions: Question[];
  currentIndex: number;
  score: number;
  auditLog: AuditLogEntry[];
  activePowerUps: PowerUp[];

  startGame: (questions: Question[], powerUps: PowerUp[]) => void;
  answerQuestion: (logEntry: AuditLogEntry, pointsEarned: number) => void;
  advanceQuestion: () => void;
  consumePowerUp: (id: string) => void; // NUEVO: Para "quemar" la carta usada
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  questions: [],
  currentIndex: 0,
  score: 0,
  auditLog: [],
  activePowerUps: [],

  startGame: (questions, powerUps) => set({
    questions: questions,
    activePowerUps: powerUps,
    status: 'playing',
    currentIndex: 0,
    score: 0,
    auditLog: [],
  }),

  answerQuestion: (logEntry, pointsEarned) => set((state) => ({
    auditLog: [...state.auditLog, logEntry],
    score: state.score + pointsEarned,
  })),

  advanceQuestion: () => set((state) => {
    const isLastQuestion = state.currentIndex === state.questions.length - 1;
    return {
      currentIndex: isLastQuestion ? state.currentIndex : state.currentIndex + 1,
      status: isLastQuestion ? 'finished' : 'playing',
    };
  }),

  // NUEVO: Filtramos la carta que acabamos de usar para sacarla de la "mano"
  consumePowerUp: (id) => set((state) => ({
    activePowerUps: state.activePowerUps.filter(p => p.id !== id)
  })),

  resetGame: () => set({
    status: 'idle',
    questions: [],
    currentIndex: 0,
    score: 0,
    auditLog: [],
    activePowerUps: [],
  }),
}));