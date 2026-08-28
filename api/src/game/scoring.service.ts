import { Injectable, BadRequestException } from '@nestjs/common';
import { GameMode } from '@prisma/client';

export interface PowerUpScoreModifiers {
  pointsMultiplier?: number;       // ej: 1.1 (+10%), 2.0 (x2), 3.0 (x3)
  timeBonusMultiplier?: number;    // ej: 1.1 (+10%), 2.0 (x2), 3.0 (x3)
  globalMultiplier?: number;       // ej: 2.0 (x2), 3.0 (x3)
}

export interface QuestionScoreResult {
  isCorrect: boolean;
  basePoints: number;
  timeBonus: number;
  totalPoints: number;
  timeSpentMs: number;
  timeRemainingMs: number;
}

export interface RoundScoreSummary {
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  stars: number; // 0, 1, 2, 3
  avgResponseTimeMs: number;
  coinsEarned: number;
  xpEarned: number;
  questionScores: QuestionScoreResult[];
}

@Injectable()
export class ScoringService {
  // CONSTANTES OFICIALES DE SCORING
  public static readonly BASE_POINTS_PER_CORRECT = 10_000;
  public static readonly MAX_TIMER_MS = 10_000;
  public static readonly MAX_POSSIBLE_QUESTION_SCORE = 20_000; // 10.000 base + 10.000 tiempo
  public static readonly MAX_ROUND_SCORE_10_QUESTIONS = 200_000;

  // UMBRALES DE ESTRELLAS (Sobre 200.000 máx de 10 preguntas)
  public static readonly STAR_1_THRESHOLD = 60_000;  // 30% (Aprobado)
  public static readonly STAR_2_THRESHOLD = 120_000; // 60% (Bueno)
  public static readonly STAR_3_THRESHOLD = 160_000; // 80% (Excelente)

  // ANTI-CHEAT: TIEMPO MÍNIMO HUMANO
  public static readonly MIN_HUMAN_TIME_MS = 300; // Menos de 300ms es físicamente imposible para leer y responder
  public static readonly TOLERANCE_PERCENTAGE = 0.02; // 2% de tolerancia por jitter de reloj

  /**
   * Calcula el puntaje de una pregunta individual:
   * 10.000 pts base (si es correcta) + milisegundos restantes (0 a 10.000)
   */
  calculateQuestionScore(
    isCorrect: boolean,
    timeSpentMs: number,
    modifiers?: PowerUpScoreModifiers,
  ): QuestionScoreResult {
    if (!isCorrect) {
      return {
        isCorrect: false,
        basePoints: 0,
        timeBonus: 0,
        totalPoints: 0,
        timeSpentMs: Math.max(0, timeSpentMs),
        timeRemainingMs: Math.max(0, ScoringService.MAX_TIMER_MS - timeSpentMs),
      };
    }

    const timeRemainingMs = Math.max(0, Math.min(ScoringService.MAX_TIMER_MS, ScoringService.MAX_TIMER_MS - timeSpentMs));

    let basePoints = ScoringService.BASE_POINTS_PER_CORRECT;
    if (modifiers?.pointsMultiplier) {
      basePoints = Math.round(basePoints * modifiers.pointsMultiplier);
    }

    let timeBonus = timeRemainingMs;
    if (modifiers?.timeBonusMultiplier) {
      timeBonus = Math.round(timeBonus * modifiers.timeBonusMultiplier);
    }

    let totalPoints = basePoints + timeBonus;
    if (modifiers?.globalMultiplier) {
      totalPoints = Math.round(totalPoints * modifiers.globalMultiplier);
    }

    return {
      isCorrect: true,
      basePoints,
      timeBonus,
      totalPoints,
      timeSpentMs,
      timeRemainingMs,
    };
  }

  /**
   * Calcula las estrellas obtenidas en una ronda según el puntaje
   */
  calculateStars(score: number, totalQuestions: number = 10): number {
    // Normalizamos el puntaje si la cantidad de preguntas difiere de 10
    const normalizedScore = totalQuestions === 10
      ? score
      : Math.round((score / (totalQuestions * ScoringService.MAX_POSSIBLE_QUESTION_SCORE)) * ScoringService.MAX_ROUND_SCORE_10_QUESTIONS);

    if (normalizedScore >= ScoringService.STAR_3_THRESHOLD) return 3;
    if (normalizedScore >= ScoringService.STAR_2_THRESHOLD) return 2;
    if (normalizedScore >= ScoringService.STAR_1_THRESHOLD) return 1;
    return 0;
  }

  /**
   * Calcula las recompensas de Monedas y XP según modo, puntaje y estrellas
   */
  calculateRewards(score: number, stars: number, mode: GameMode = GameMode.CLASSIC): { coins: number; xp: number } {
    let baseCoins = 50;
    let baseXp = 50;

    // Bonus por estrellas
    if (stars === 1) {
      baseCoins += 30;
      baseXp += 25;
    } else if (stars === 2) {
      baseCoins += 70;
      baseXp += 50;
    } else if (stars === 3) {
      baseCoins += 120;
      baseXp += 100;
    }

    // Modificadores por modo
    switch (mode) {
      case GameMode.ROGUELITE:
        baseCoins = Math.round(baseCoins * 1.2);
        baseXp = Math.round(baseXp * 1.3);
        break;
      case GameMode.DOMINATION:
        baseCoins = Math.round(baseCoins * 1.5);
        baseXp = Math.round(baseXp * 1.2);
        break;
      case GameMode.PVP_ASYNC:
      case GameMode.PVP_LIVE:
        baseCoins = Math.round(baseCoins * 1.8);
        baseXp = Math.round(baseXp * 2.0);
        break;
      default:
        break;
    }

    return {
      coins: baseCoins,
      xp: baseXp,
    };
  }

  /**
   * Validación Anti-Cheat para un registro de respuesta
   */
  validateTimeIntegrity(timeSpentMs: number): void {
    if (timeSpentMs < ScoringService.MIN_HUMAN_TIME_MS) {
      throw new BadRequestException(
        `Tiempo de respuesta no humano detectado (${timeSpentMs}ms). Mínimo permitido: ${ScoringService.MIN_HUMAN_TIME_MS}ms.`,
      );
    }
  }
}
