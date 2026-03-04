import { create } from 'zustand';

// 1. Definimos las interfaces estrictas
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

type GameStatus = 'idle' | 'playing' | 'finished';

interface GameState {
  // === ESTADO (Datos) ===
  status: GameStatus;
  questions: Question[];
  currentIndex: number;
  score: number;
  auditLog: AuditLogEntry[];

  // === ACCIONES (Funciones) ===
  startGame: (questions: Question[]) => void;
  answerQuestion: (logEntry: AuditLogEntry, pointsEarned: number) => void;
  advanceQuestion: () => void;
  resetGame: () => void;
}

// 2. Creamos el Store
export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  questions: [],
  currentIndex: 0,
  score: 0,
  auditLog: [],

  // Arranca la partida
  startGame: (questions) => set({
    questions: questions,
    status: 'playing',
    currentIndex: 0,
    score: 0,
    auditLog: [],
  }),

  // SOLO guarda el registro y los puntos (No avanza de pantalla)
  answerQuestion: (logEntry, pointsEarned) => set((state) => ({
    auditLog: [...state.auditLog, logEntry],
    score: state.score + pointsEarned,
  })),

  // SOLO se encarga de cambiar de pregunta o terminar la partida
  advanceQuestion: () => set((state) => {
    const isLastQuestion = state.currentIndex === state.questions.length - 1;
    return {
      currentIndex: isLastQuestion ? state.currentIndex : state.currentIndex + 1,
      status: isLastQuestion ? 'finished' : 'playing',
    };
  }),

  // Vuelve al menú principal
  resetGame: () => set({
    status: 'idle',
    questions: [],
    currentIndex: 0,
    score: 0,
    auditLog: [],
  }),
}));