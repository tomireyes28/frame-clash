// api/src/roguelite/roguelite.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../game/scoring.service';
import { hashAnswer } from '../game/utils/hash.util';
import { SafeQuestionPayload, PowerUpPayload } from '../game/interfaces/game.interface';
import {
  ActiveRogueliteRun,
  CategoryOption,
  StartWaveResponse,
  SubmitWaveResult,
} from './interfaces/roguelite.interface';
import { SubmitWaveDto } from './dto/submit-wave.dto';
import { GameMode } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class RogueliteService {
  private readonly logger = new Logger(RogueliteService.name);

  // Almacén en memoria de corridas activas (con TTL automático)
  private activeRuns = new Map<string, ActiveRogueliteRun>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  /**
   * Calcula el puntaje objetivo mínimo para sobrevivir a una ronda
   */
  calculateTargetScore(wave: number): number {
    if (wave === 1) return 50_000;
    if (wave === 2) return 70_000;
    if (wave === 3) return 90_000;
    if (wave === 4) return 110_000;
    if (wave === 5) return 130_000;
    // Ronda 6+: escala hasta un tope de 170.000 pts
    return Math.min(170_000, 130_000 + (wave - 5) * 10_000);
  }

  /**
   * Recompensas ganadas al superar una ronda específica
   */
  calculateWaveRewards(wave: number): { coins: number; xp: number; packId?: string } {
    const coins = 100 + wave * 25;
    const xp = 75 + wave * 20;
    let packId: string | undefined;

    // Hitos de sobres por rondas clave
    if (wave === 3) packId = 'BRONZE';
    else if (wave === 5) packId = 'SILVER';
    else if (wave === 7) packId = 'GOLD';
    else if (wave === 10) packId = 'PLATINUM';
    else if (wave === 15) packId = 'DIAMOND';

    return { coins, xp, packId };
  }

  /**
   * 1. Inicia una nueva corrida de Roguelike
   */
  async startRun(userId: string, equippedCardIds: string[] = []): Promise<{
    runId: string;
    wave: number;
    targetScore: number;
    categoryChoices: CategoryOption[];
    bestWave: number;
    bestScore: number;
  }> {
    const runId = randomUUID();
    const targetScore = this.calculateTargetScore(1);
    const categoryChoices = await this.getRandomCategoryOptions(3);

    // Obtener estadísticas históricas del jugador
    const progress = await this.prisma.rogueliteProgress.findUnique({
      where: { userId },
    });

    const run: ActiveRogueliteRun = {
      runId,
      userId,
      wave: 1,
      totalScore: 0,
      accumulatedCoins: 0,
      accumulatedXp: 0,
      accumulatedPacks: [],
      targetScore,
      selectedCategory: null,
      categoryChoices,
      equippedCardIds,
      status: 'IN_PROGRESS',
      createdAt: Date.now(),
    };

    this.activeRuns.set(runId, run);

    return {
      runId,
      wave: 1,
      targetScore,
      categoryChoices,
      bestWave: progress?.bestWave || 0,
      bestScore: progress?.bestScore || 0,
    };
  }

  /**
   * 2. Inicia una ronda específica con la categoría elegida por el jugador
   */
  async startWave(userId: string, runId: string, categoryId: string): Promise<StartWaveResponse> {
    const run = this.activeRuns.get(runId);
    if (!run || run.userId !== userId || run.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Corrida de Roguelike no válida o ya finalizada.');
    }

    // Buscamos la categoría
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: categoryId }, { key: categoryId }, { slug: categoryId }],
      },
    });

    const categoryKey = category ? category.key : categoryId;
    run.selectedCategory = categoryKey;

    // Buscamos preguntas para esa categoría
    let allQuestions = await this.prisma.question.findMany({
      where: { categories: { has: categoryKey } },
    });

    // Fallback si la categoría específica tiene pocas preguntas en DB
    if (allQuestions.length < 10) {
      allQuestions = await this.prisma.question.findMany({ take: 20 });
    }

    const selectedQuestions = allQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    const safeQuestions: SafeQuestionPayload[] = selectedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      difficulty: q.difficulty,
      imageUrl: q.imageUrl,
      block: q.block,
      typeNumber: q.typeNumber,
      answerHash: hashAnswer(q.correctAnswer, q.id),
    }));

    // Power-ups equipados por el usuario
    const userCards = await this.prisma.userCard.findMany({
      where: {
        userId,
        cardId: { in: run.equippedCardIds },
      },
      include: { card: true },
    });

    const powerUps: PowerUpPayload[] = userCards.map((uc) => ({
      id: uc.card.id,
      title: uc.card.title,
      action: uc.card.powerUpAction ? String(uc.card.powerUpAction) : null,
      value: uc.card.powerUpValue,
    }));

    return {
      runId,
      wave: run.wave,
      targetScore: run.targetScore,
      category: category?.name || categoryKey,
      questions: safeQuestions,
      powerUps,
    };
  }

  /**
   * 3. Envía los resultados de la ronda, valida el puntaje mínimo y avanza de ronda o decreta Game Over
   */
  async submitWave(userId: string, data: SubmitWaveDto): Promise<SubmitWaveResult> {
    const run = this.activeRuns.get(data.runId);
    if (!run || run.userId !== userId || run.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Corrida de Roguelike no válida o expirada.');
    }

    const questionIds = data.auditLog.map((log) => log.questionId);
    const realQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });

    let roundScore = 0;
    for (const log of data.auditLog) {
      this.scoringService.validateTimeIntegrity(log.timeSpentMs);
      const realQ = realQuestions.find((q) => q.id === log.questionId);
      const isCorrect = Boolean(realQ && realQ.correctAnswer === log.selectedAnswer);
      const qScore = this.scoringService.calculateQuestionScore(isCorrect, log.timeSpentMs);
      roundScore += qScore.totalPoints;
    }

    // Tolerancia del 2%
    const difference = Math.abs(roundScore - data.claimedScore);
    const maxTolerance = roundScore * ScoringService.TOLERANCE_PERCENTAGE;
    const finalRoundScore = difference <= maxTolerance ? data.claimedScore : roundScore;

    const passed = finalRoundScore >= run.targetScore;

    if (passed) {
      // ✅ RONDA SUPERADA: Acumular recompensas y preparar la siguiente ronda
      const rewards = this.calculateWaveRewards(run.wave);
      run.accumulatedCoins += rewards.coins;
      run.accumulatedXp += rewards.xp;
      if (rewards.packId) {
        run.accumulatedPacks.push(rewards.packId);
      }

      run.totalScore += finalRoundScore;
      const nextWave = run.wave + 1;
      const nextTargetScore = this.calculateTargetScore(nextWave);
      const nextChoices = await this.getRandomCategoryOptions(3);

      run.wave = nextWave;
      run.targetScore = nextTargetScore;
      run.categoryChoices = nextChoices;

      return {
        runId: run.runId,
        wave: nextWave - 1,
        roundScore: finalRoundScore,
        targetScore: run.targetScore,
        passed: true,
        totalScore: run.totalScore,
        accumulatedCoins: run.accumulatedCoins,
        accumulatedXp: run.accumulatedXp,
        accumulatedPacks: run.accumulatedPacks,
        nextCategoryChoices: nextChoices,
        nextTargetScore,
        message: `¡Ronda ${nextWave - 1} superada con éxito!`,
      };
    } else {
      // 💀 GAME OVER: No alcanzó el puntaje mínimo
      run.status = 'GAME_OVER';
      run.totalScore += finalRoundScore;

      // Pagar todas las recompensas acumuladas al usuario
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: run.accumulatedCoins },
          xp: { increment: run.accumulatedXp },
        },
      });

      // Actualizar o crear récord en RogueliteProgress
      const currentProgress = await this.prisma.rogueliteProgress.findUnique({
        where: { userId },
      });

      const isNewBestWave = run.wave > (currentProgress?.bestWave || 0);
      const isNewBestScore = run.totalScore > (currentProgress?.bestScore || 0);

      await this.prisma.rogueliteProgress.upsert({
        where: { userId },
        update: {
          bestWave: Math.max(run.wave, currentProgress?.bestWave || 0),
          bestScore: Math.max(run.totalScore, currentProgress?.bestScore || 0),
          totalRuns: { increment: 1 },
        },
        create: {
          userId,
          bestWave: run.wave,
          bestScore: run.totalScore,
          totalRuns: 1,
        },
      });

      // Guardar sesión de juego para auditoría
      await this.prisma.gameSession.create({
        data: {
          userId,
          mode: GameMode.ROGUELITE,
          score: run.totalScore,
          coinsEarned: run.accumulatedCoins,
          xpEarned: run.accumulatedXp,
          totalQuestions: data.auditLog.length,
          auditLog: data.auditLog.map((l) => ({
            questionId: l.questionId,
            selectedAnswer: l.selectedAnswer,
            timeSpentMs: l.timeSpentMs,
          })),
        },
      });

      // Eliminar corrida de la memoria
      this.activeRuns.delete(run.runId);

      return {
        runId: run.runId,
        wave: run.wave,
        roundScore: finalRoundScore,
        targetScore: run.targetScore,
        passed: false,
        totalScore: run.totalScore,
        accumulatedCoins: run.accumulatedCoins,
        accumulatedXp: run.accumulatedXp,
        accumulatedPacks: run.accumulatedPacks,
        isNewRecord: isNewBestWave || isNewBestScore,
        message: `Fin de la corrida. Alcanzaste la Ronda ${run.wave}.`,
      };
    }
  }

  /**
   * Obtiene el progreso histórico de Roguelike del usuario
   */
  async getUserProgress(userId: string) {
    const progress = await this.prisma.rogueliteProgress.findUnique({
      where: { userId },
    });

    return {
      bestWave: progress?.bestWave || 0,
      bestScore: progress?.bestScore || 0,
      totalRuns: progress?.totalRuns || 0,
      unlockedPowerUpSlots: progress?.unlockedPowerUpSlots || 1,
    };
  }

  /**
   * Helper para obtener N categorías aleatorias
   */
  private async getRandomCategoryOptions(count: number = 3): Promise<CategoryOption[]> {
    const categories = await this.prisma.category.findMany();
    const shuffled = categories.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((c) => ({
      key: c.key,
      name: c.name || c.key,
      slug: c.slug || c.key.toLowerCase(),
      icon: c.icon || '🎬',
      type: c.type || 'genre',
    }));
  }
}
