import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from './scoring.service';
import { hashAnswer } from './utils/hash.util';
import { SubmitGameDto } from './dto/submit-game.dto';
import { GameRoundResponse, SafeQuestionPayload, PowerUpPayload } from './interfaces/game.interface';
import { MissionService } from '../mission/mission.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { GameMode } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly missionService: MissionService,
    private readonly leaderboardService: LeaderboardService,
    private readonly scoringService: ScoringService,
  ) {}

  /**
   * Genera una ronda de preguntas seguras (con hashes anti-cheat y sin respuestas expuestas)
   * y carga los power-ups de las cartas equipadas por el usuario para el modo de juego.
   */
  async generateRound(
    categoryId: string,
    amount: number = 10,
    userId: string,
    mode: GameMode = GameMode.CLASSIC,
  ): Promise<GameRoundResponse> {
    if (!categoryId) {
      throw new BadRequestException('El parámetro categoryId es obligatorio para iniciar una partida.');
    }

    // Buscamos la categoría por ID, Key o Slug
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { key: categoryId },
          { slug: categoryId },
        ],
      },
    });

    const categoryKey = category ? category.key : categoryId;

    const allQuestions = await this.prisma.question.findMany({
      where: {
        categories: {
          has: categoryKey,
        },
      },
    });

    if (allQuestions.length < amount) {
      throw new BadRequestException(
        `No hay suficientes preguntas para la categoría "${categoryKey}". Disponibles: ${allQuestions.length}, requeridas: ${amount}.`,
      );
    }

    const selectedQuestions = allQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, amount);

    const safeRound: SafeQuestionPayload[] = selectedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      difficulty: q.difficulty,
      imageUrl: q.imageUrl,
      block: q.block,
      typeNumber: q.typeNumber,
      answerHash: hashAnswer(q.correctAnswer, q.id),
    }));

    // Cartas equipadas por el usuario para este modo de juego
    const equippedUserCards = await this.prisma.userCard.findMany({
      where: {
        userId: userId,
        equippedModes: {
          has: mode,
        },
      },
      include: {
        card: true,
      },
    });

    const powerUps: PowerUpPayload[] = equippedUserCards.map((uc) => ({
      id: uc.card.id,
      title: uc.card.title,
      action: uc.card.powerUpAction ? String(uc.card.powerUpAction) : null,
      value: uc.card.powerUpValue,
    }));

    return {
      questions: safeRound,
      powerUps: powerUps,
    };
  }

  /**
   * Recibe el log de respuestas del cliente, valida la integridad de tiempo (anti-cheat),
   * calcula el puntaje oficial (10.000 pts base + ms restantes), estrellas y recompensas.
   */
  async submitRound(data: SubmitGameDto, mode: GameMode = GameMode.CLASSIC) {
    const questionIds = data.auditLog.map((log) => log.questionId);

    const realQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });

    if (realQuestions.length !== data.auditLog.length) {
      throw new BadRequestException('Discrepancia en la cantidad de preguntas enviadas.');
    }

    let backendCalculatedScore = 0;
    let correctCount = 0;
    let totalTimeSpentMs = 0;

    for (const log of data.auditLog) {
      // 1. Anti-cheat de velocidad de reacción humana
      this.scoringService.validateTimeIntegrity(log.timeSpentMs);
      totalTimeSpentMs += log.timeSpentMs;

      const realQ = realQuestions.find((q) => q.id === log.questionId);
      const isCorrect = Boolean(realQ && realQ.correctAnswer === log.selectedAnswer);

      if (isCorrect) {
        correctCount++;
      }

      // 2. Cálculo oficial de puntuación por pregunta (10.000 pts + ms restantes)
      const qScore = this.scoringService.calculateQuestionScore(isCorrect, log.timeSpentMs);
      backendCalculatedScore += qScore.totalPoints;
    }

    // 3. Validación de tolerancia de latencia y jitter de reloj (2%)
    const difference = Math.abs(backendCalculatedScore - data.claimedScore);
    const maxTolerance = backendCalculatedScore * ScoringService.TOLERANCE_PERCENTAGE;

    let finalScoreToSave = 0;
    let isAdjusted = false;

    if (difference <= maxTolerance) {
      finalScoreToSave = data.claimedScore;
    } else {
      finalScoreToSave = backendCalculatedScore;
      isAdjusted = true;
    }

    // 4. Verificación de uso legal de Power-Ups
    if (data.usedPowerUps && data.usedPowerUps.length > 0) {
      const usageCount: Record<string, number> = {};
      for (const powerUpId of data.usedPowerUps) {
        usageCount[powerUpId] = (usageCount[powerUpId] || 0) + 1;
      }

      const uniquePowerUpIds = Object.keys(usageCount);

      const userCards = await this.prisma.userCard.findMany({
        where: {
          userId: data.userId,
          cardId: { in: uniquePowerUpIds },
          quantity: { gt: 0 },
          equippedModes: { has: mode },
        },
      });

      if (userCards.length !== uniquePowerUpIds.length) {
        throw new BadRequestException('Intento de fraude: Cartas de power-up no equipadas o no poseídas.');
      }

      for (const userCard of userCards) {
        const usesInRound = usageCount[userCard.cardId];
        if (usesInRound > userCard.level) {
          throw new BadRequestException(
            `Intento de fraude: Usó la carta ${userCard.cardId} ${usesInRound} veces, pero su nivel es ${userCard.level}.`,
          );
        }
      }
    }

    // 5. Cálculo de Estrellas y Recompensas Oficiales
    const totalQuestions = data.auditLog.length;
    const stars = this.scoringService.calculateStars(finalScoreToSave, totalQuestions);
    const rewards = this.scoringService.calculateRewards(finalScoreToSave, stars, mode);
    const avgResponseTime = Math.round(totalTimeSpentMs / Math.max(1, totalQuestions));

    // 6. Guardado de la sesión de juego
    const session = await this.prisma.gameSession.create({
      data: {
        userId: data.userId,
        mode: mode,
        score: finalScoreToSave,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        stars: stars,
        coinsEarned: rewards.coins,
        xpEarned: rewards.xp,
        avgResponseTime: avgResponseTime,
        auditLog: data.auditLog.map((log) => ({
          questionId: log.questionId,
          selectedAnswer: log.selectedAnswer,
          timeSpentMs: log.timeSpentMs,
        })),
      },
    });

    // 7. Actualización de Monedas y XP del Usuario
    await this.prisma.user.update({
      where: { id: data.userId },
      data: {
        coins: { increment: rewards.coins },
        xp: { increment: rewards.xp },
      },
    });

    // 8. Progreso de Misiones y Leaderboard
    await this.missionService.advanceProgress(data.userId, {
      gamesPlayed: 1,
      coinsEarned: rewards.coins,
      scoreEarned: finalScoreToSave,
    });

    await this.leaderboardService.updateScore(data.userId, mode, finalScoreToSave);

    return {
      success: true,
      sessionId: session.id,
      finalScore: finalScoreToSave,
      correctCount,
      totalQuestions,
      stars,
      coinsEarned: rewards.coins,
      xpEarned: rewards.xp,
      avgResponseTime,
      isAdjusted,
      message: isAdjusted
        ? 'Discrepancia de tiempo detectada. Tu puntaje oficial fue recalculado por el servidor.'
        : 'Partida verificada y guardada con éxito.',
    };
  }

  /**
   * Obtiene el inventario de cartas y power-ups de un usuario
   */
  async getUserInventory(userId: string) {
    const userCards = await this.prisma.userCard.findMany({
      where: { userId: userId },
      include: {
        card: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userCards.map((uc) => ({
      id: uc.card.id,
      tmdbId: uc.card.tmdbId,
      title: uc.card.title,
      year: uc.card.year,
      posterPath: uc.card.posterPath,
      backdropPath: uc.card.backdropPath,
      rarity: uc.card.rarity,
      atk: uc.card.atk,
      def: uc.card.def,
      spd: uc.card.spd,
      box: uc.card.box,
      crt: uc.card.crt,
      powerUpTrigger: uc.card.powerUpTrigger,
      powerUpCondition: uc.card.powerUpCondition,
      powerUpAction: uc.card.powerUpAction,
      powerUpValue: uc.card.powerUpValue,
      quantity: uc.quantity,
      level: uc.level,
      isFavorite: uc.isFavorite,
      equippedModes: uc.equippedModes,
    }));
  }
}