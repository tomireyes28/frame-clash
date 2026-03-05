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
  usedPowerUps: string[]; // NUEVO: La "libretita" donde anotamos lo que gastamos

  startGame: (questions: Question[], powerUps: PowerUp[]) => void;
  answerQuestion: (logEntry: AuditLogEntry, pointsEarned: number) => void;
  advanceQuestion: () => void;
  consumePowerUp: (id: string) => void; 
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  questions: [],
  currentIndex: 0,
  score: 0,
  auditLog: [],
  activePowerUps: [],
  usedPowerUps: [], // Inicializamos vacío

  startGame: (questions, powerUps) => set({
    questions: questions,
    activePowerUps: powerUps,
    status: 'playing',
    currentIndex: 0,
    score: 0,
    auditLog: [],
    usedPowerUps: [], // Vaciamos la libreta al empezar nueva partida
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

  // MAGIA ACÁ: Sacamos la carta de la mano Y anotamos su ID en la libreta
  consumePowerUp: (id) => set((state) => ({
    activePowerUps: state.activePowerUps.filter(p => p.id !== id),
    usedPowerUps: [...state.usedPowerUps, id] 
  })),

  resetGame: () => set({
    status: 'idle',
    questions: [],
    currentIndex: 0,
    score: 0,
    auditLog: [],
    activePowerUps: [],
    usedPowerUps: [], // Vaciamos
  }),
}));