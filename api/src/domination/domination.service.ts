// api/src/domination/domination.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../game/scoring.service';
import { hashAnswer } from '../game/utils/hash.util';
import { SafeQuestionPayload, PowerUpPayload } from '../game/interfaces/game.interface';
import {
  CategoryDominationMap,
  CategoryOverview,
  DominationNodeInfo,
  NodeThresholds,
  StartNodeResponse,
  SubmitNodeResponse,
} from './interfaces/domination.interface';
import { StartNodeDto } from './dto/start-node.dto';
import { SubmitNodeDto } from './dto/submit-node.dto';
import { GameMode } from '@prisma/client';

@Injectable()
export class DominationService {
  private readonly logger = new Logger(DominationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  /**
   * Calcula los umbrales de 1, 2 y 3 estrellas para un nodo del 1 al 10
   */
  getNodeThresholds(nodeNumber: number): NodeThresholds {
    const base = 35_000 + nodeNumber * 5_000;
    return {
      oneStar: base, // ej: Nodo 1 = 40.000, Nodo 10 = 85.000
      twoStars: base + 25_000, // ej: Nodo 1 = 65.000, Nodo 10 = 110.000
      threeStars: base + 45_000, // ej: Nodo 1 = 85.000, Nodo 10 = 130.000
    };
  }

  /**
   * Recompensas base por nodo
   */
  getNodeRewards(nodeNumber: number): { coins: number; xp: number; isBoss: boolean } {
    const isBoss = nodeNumber === 10;
    const coins = 50 + nodeNumber * 25 + (isBoss ? 250 : 0);
    const xp = 40 + nodeNumber * 15 + (isBoss ? 150 : 0);
    return { coins, xp, isBoss };
  }

  /**
   * 1. Resumen de todas las 31 categorías para el mapa general de Dominio
   */
  async getAllCategoriesOverview(userId: string): Promise<CategoryOverview[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const userProgress = await this.prisma.dominationProgress.findMany({
      where: { userId },
    });

    return categories.map((cat) => {
      const catProgress = userProgress.filter((p) => p.categoryId === cat.id);
      const completedNodes = catProgress.filter((p) => p.completed).length;
      const totalStars = catProgress.reduce((sum, p) => sum + p.stars, 0);
      const isMastered = completedNodes === 10;

      return {
        categoryId: cat.id,
        key: cat.key,
        name: cat.name || cat.key,
        icon: cat.icon || '🎬',
        type: cat.type || 'genre',
        totalStars,
        maxStars: 30,
        completedNodes,
        isMastered,
      };
    });
  }

  /**
   * 2. Obtiene el mapa detallado de los 10 nodos de una categoría
   */
  async getCategoryMap(userId: string, categoryIdOrKey: string): Promise<CategoryDominationMap> {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: categoryIdOrKey }, { key: categoryIdOrKey }, { slug: categoryIdOrKey }],
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría '${categoryIdOrKey}' no encontrada.`);
    }

    const progressList = await this.prisma.dominationProgress.findMany({
      where: { userId, categoryId: category.id },
      orderBy: { nodeNumber: 'asc' },
    });

    const progressMap = new Map<number, { stars: number; bestScore: number; completed: boolean }>();
    progressList.forEach((p) => {
      progressMap.set(p.nodeNumber, {
        stars: p.stars,
        bestScore: p.bestScore,
        completed: p.completed,
      });
    });

    const nodes: DominationNodeInfo[] = [];
    let previousNodeCompleted = true; // El nodo 1 arranca desbloqueado

    for (let nodeNum = 1; nodeNum <= 10; nodeNum++) {
      const prog = progressMap.get(nodeNum);
      const thresholds = this.getNodeThresholds(nodeNum);
      const rewards = this.getNodeRewards(nodeNum);
      const isCompleted = Boolean(prog?.completed);

      let status: 'LOCKED' | 'UNLOCKED' | 'COMPLETED' = 'LOCKED';
      if (isCompleted) {
        status = 'COMPLETED';
      } else if (previousNodeCompleted) {
        status = 'UNLOCKED';
      }

      nodes.push({
        nodeNumber: nodeNum,
        title: nodeNum === 10 ? `👑 Dominio Total: ${category.name}` : `Fase ${nodeNum}`,
        status,
        stars: prog?.stars || 0,
        bestScore: prog?.bestScore || 0,
        thresholds,
        rewardCoins: rewards.coins,
        rewardXp: rewards.xp,
        isBossNode: rewards.isBoss,
      });

      previousNodeCompleted = isCompleted;
    }

    const totalStars = nodes.reduce((sum, n) => sum + n.stars, 0);
    const isMastered = nodes.every((n) => n.status === 'COMPLETED');

    return {
      categoryId: category.id,
      categoryKey: category.key,
      categoryName: category.name || category.key,
      categoryIcon: category.icon || '🎬',
      totalStars,
      maxStars: 30,
      isMastered,
      nodes,
    };
  }

  /**
   * 3. Inicia un nodo de Dominio (máximo 2 power-ups)
   */
  async startNode(userId: string, dto: StartNodeDto): Promise<StartNodeResponse> {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: dto.categoryId }, { key: dto.categoryId }, { slug: dto.categoryId }],
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    // Validar que el nodo esté desbloqueado
    if (dto.nodeNumber > 1) {
      const prevNode = await this.prisma.dominationProgress.findUnique({
        where: {
          userId_categoryId_nodeNumber: {
            userId,
            categoryId: category.id,
            nodeNumber: dto.nodeNumber - 1,
          },
        },
      });

      if (!prevNode || !prevNode.completed) {
        throw new BadRequestException(
          `El nodo ${dto.nodeNumber} está bloqueado. Debés completar primero el nodo ${dto.nodeNumber - 1}.`,
        );
      }
    }

    // Regla: Máximo 2 power-ups por ronda de Dominio
    const allowedCardIds = (dto.equippedCardIds || []).slice(0, 2);

    // Obtener 10 preguntas de la categoría
    let questions = await this.prisma.question.findMany({
      where: { categories: { has: category.key } },
    });

    if (questions.length < 10) {
      questions = await this.prisma.question.findMany({ take: 20 });
    }

    const selectedQuestions = questions
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

    // Cargar power-ups
    const userCards = await this.prisma.userCard.findMany({
      where: {
        userId,
        cardId: { in: allowedCardIds },
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
      categoryId: category.id,
      categoryName: category.name || category.key,
      nodeNumber: dto.nodeNumber,
      thresholds: this.getNodeThresholds(dto.nodeNumber),
      questions: safeQuestions,
      powerUps,
    };
  }

  /**
   * 4. Envía los resultados del nodo, calcula estrellas y desbloquea el siguiente nivel
   */
  async submitNode(userId: string, dto: SubmitNodeDto): Promise<SubmitNodeResponse> {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: dto.categoryId }, { key: dto.categoryId }, { slug: dto.categoryId }],
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    const thresholds = this.getNodeThresholds(dto.nodeNumber);
    const nodeRewards = this.getNodeRewards(dto.nodeNumber);

    const questionIds = dto.auditLog.map((l) => l.questionId);
    const realQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });

    let roundScore = 0;
    for (const log of dto.auditLog) {
      this.scoringService.validateTimeIntegrity(log.timeSpentMs);
      const realQ = realQuestions.find((q) => q.id === log.questionId);
      const isCorrect = Boolean(realQ && realQ.correctAnswer === log.selectedAnswer);
      const qScore = this.scoringService.calculateQuestionScore(isCorrect, log.timeSpentMs);
      roundScore += qScore.totalPoints;
    }

    // Tolerancia anti-jitter de red
    const difference = Math.abs(roundScore - dto.claimedScore);
    const maxTolerance = roundScore * ScoringService.TOLERANCE_PERCENTAGE;
    const finalScore = difference <= maxTolerance ? dto.claimedScore : roundScore;

    // Cálculo de estrellas según los umbrales del nodo
    let stars = 0;
    if (finalScore >= thresholds.threeStars) stars = 3;
    else if (finalScore >= thresholds.twoStars) stars = 2;
    else if (finalScore >= thresholds.oneStar) stars = 1;

    const passed = stars >= 1;

    // Buscar progreso previo
    const existingProgress = await this.prisma.dominationProgress.findUnique({
      where: {
        userId_categoryId_nodeNumber: {
          userId,
          categoryId: category.id,
          nodeNumber: dto.nodeNumber,
        },
      },
    });

    const isFirstTimePass = passed && (!existingProgress || !existingProgress.completed);
    const isNewBestScore = finalScore > (existingProgress?.bestScore || 0);
    const isNewBestStars = stars > (existingProgress?.stars || 0);

    let earnedCoins = 0;
    let earnedXp = 0;
    let masteryBonus = false;

    if (passed) {
      // Recompensas: primera vez o mejora de estrellas
      if (isFirstTimePass) {
        earnedCoins = nodeRewards.coins;
        earnedXp = nodeRewards.xp;
      } else if (isNewBestStars) {
        earnedCoins = Math.round(nodeRewards.coins * 0.5);
        earnedXp = Math.round(nodeRewards.xp * 0.5);
      }

      // Si es el nodo 10 (Boss) y es la primera vez que se completa: Bonus de Maestría
      if (dto.nodeNumber === 10 && isFirstTimePass) {
        masteryBonus = true;
        earnedCoins += 500;
        earnedXp += 300;

        // Otorgar 50 de Polvo Estelar al usuario
        await this.prisma.user.update({
          where: { id: userId },
          data: { stardust: { increment: 50 } },
        });
      }

      // Guardar progreso del nodo
      await this.prisma.dominationProgress.upsert({
        where: {
          userId_categoryId_nodeNumber: {
            userId,
            categoryId: category.id,
            nodeNumber: dto.nodeNumber,
          },
        },
        update: {
          completed: true,
          stars: Math.max(stars, existingProgress?.stars || 0),
          bestScore: Math.max(finalScore, existingProgress?.bestScore || 0),
        },
        create: {
          userId,
          categoryId: category.id,
          nodeNumber: dto.nodeNumber,
          completed: true,
          stars,
          bestScore: finalScore,
        },
      });

      // Acreditar monedas y XP al usuario
      if (earnedCoins > 0 || earnedXp > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            coins: { increment: earnedCoins },
            xp: { increment: earnedXp },
          },
        });
      }
    }

    // Guardar sesión de juego
    await this.prisma.gameSession.create({
      data: {
        userId,
        mode: GameMode.DOMINATION,
        score: finalScore,
        coinsEarned: earnedCoins,
        xpEarned: earnedXp,
        totalQuestions: dto.auditLog.length,
        auditLog: dto.auditLog.map((l) => ({
          questionId: l.questionId,
          selectedAnswer: l.selectedAnswer,
          timeSpentMs: l.timeSpentMs,
        })),
      },
    });

    return {
      nodeNumber: dto.nodeNumber,
      score: finalScore,
      stars,
      passed,
      isNewBest: isNewBestScore || isNewBestStars,
      unlockedNextNode: passed && dto.nodeNumber < 10,
      rewards: {
        coins: earnedCoins,
        xp: earnedXp,
        masteryBonus,
      },
      message: passed
        ? `¡Fase ${dto.nodeNumber} superada con ${stars} ⭐!`
        : `No alcanzaste el puntaje mínimo de ${thresholds.oneStar.toLocaleString('es-AR')} pts. ¡Reintentá para conseguir tu primera estrella!`,
    };
  }
}
