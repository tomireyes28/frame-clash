// api/src/draft/draft.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../game/scoring.service';
import { hashAnswer } from '../game/utils/hash.util';
import { SafeQuestionPayload, PowerUpPayload } from '../game/interfaces/game.interface';
import {
  DraftCardOption,
  DraftSession,
  StartDraftResponse,
  StartDraftRoundResponse,
  SubmitDraftRoundResponse,
} from './interfaces/draft.interface';
import { SubmitDraftRoundDto } from './dto/submit-draft-round.dto';
import { GameMode } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class DraftService {
  private readonly logger = new Logger(DraftService.name);

  // Almacén en memoria de partidas de draft activas
  private activeDrafts = new Map<string, DraftSession>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  /**
   * 1. Inicia una nueva partida de Draft
   */
  async startDraft(userId: string): Promise<StartDraftResponse> {
    const sessionId = randomUUID();

    // 1. Elegir 3 categorías aleatorias para las 3 rondas (no elegibles por el usuario)
    const allCategories = await this.prisma.category.findMany();
    const shuffledCategories = allCategories.sort(() => 0.5 - Math.random());
    const roundCategories = shuffledCategories.slice(0, 3).map((c) => ({
      key: c.key,
      name: c.name || c.key,
      icon: c.icon || '🎬',
    }));

    // 2. Generar el primer trío de cartas para draftear
    const firstOptions = await this.getRandomDraftCardOptions(3);

    const session: DraftSession = {
      sessionId,
      userId,
      status: 'DRAFTING',
      draftedCards: [],
      currentDraftOptions: firstOptions,
      roundCategories,
      currentRound: 1,
      roundScores: [],
      roundTargets: [50_000, 75_000, 95_000], // Umbrales de las 3 rondas
      passedRounds: 0,
      createdAt: Date.now(),
    };

    this.activeDrafts.set(sessionId, session);

    return {
      sessionId,
      draftStep: 1,
      options: firstOptions,
      draftedCards: [],
      roundCategories,
    };
  }

  /**
   * 2. Elige una carta para la mano de 5 power-ups
   */
  async pickDraftCard(
    userId: string,
    sessionId: string,
    cardId: string,
  ): Promise<{
    sessionId: string;
    draftStep: number;
    options: DraftCardOption[];
    draftedCards: DraftCardOption[];
    isDraftComplete: boolean;
    roundCategories: { key: string; name: string; icon: string }[];
  }> {
    const session = this.activeDrafts.get(sessionId);
    if (!session || session.userId !== userId || session.status !== 'DRAFTING') {
      throw new BadRequestException('Sesión de Draft no válida o expirada.');
    }

    const selectedCard = session.currentDraftOptions.find((c) => c.id === cardId);
    if (!selectedCard) {
      throw new BadRequestException('La carta seleccionada no está en la tanda actual de draft.');
    }

    session.draftedCards.push(selectedCard);

    if (session.draftedCards.length < 5) {
      const nextOptions = await this.getRandomDraftCardOptions(3);
      session.currentDraftOptions = nextOptions;

      return {
        sessionId,
        draftStep: session.draftedCards.length + 1,
        options: nextOptions,
        draftedCards: session.draftedCards,
        isDraftComplete: false,
        roundCategories: session.roundCategories,
      };
    } else {
      // Draft completado con los 5 power-ups
      session.status = 'READY_FOR_ROUND';
      session.currentDraftOptions = [];

      return {
        sessionId,
        draftStep: 5,
        options: [],
        draftedCards: session.draftedCards,
        isDraftComplete: true,
        roundCategories: session.roundCategories,
      };
    }
  }

  /**
   * 3. Inicia una de las 3 rondas del modo Draft (reinicia los 5 power-ups para la ronda)
   */
  async startDraftRound(
    userId: string,
    sessionId: string,
    roundNumber: number,
  ): Promise<StartDraftRoundResponse> {
    const session = this.activeDrafts.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new BadRequestException('Sesión de Draft no válida.');
    }

    if (session.draftedCards.length < 5) {
      throw new BadRequestException('Debés completar el draft de 5 cartas antes de jugar.');
    }

    const targetCategory = session.roundCategories[roundNumber - 1];
    if (!targetCategory) {
      throw new BadRequestException(`Ronda ${roundNumber} no válida.`);
    }

    session.status = 'PLAYING_ROUND';
    session.currentRound = roundNumber;

    // Obtener preguntas de la categoría aleatoria
    let questions = await this.prisma.question.findMany({
      where: { categories: { has: targetCategory.key } },
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

    // REGLA: Los 5 power-ups drafteados se reinician completamente para cada ronda
    const powerUps: PowerUpPayload[] = session.draftedCards.map((c) => ({
      id: c.id,
      title: c.title,
      action: c.powerUpAction,
      value: c.powerUpValue,
    }));

    return {
      sessionId,
      roundNumber,
      totalRounds: 3,
      targetScore: session.roundTargets[roundNumber - 1],
      category: targetCategory,
      questions: safeQuestions,
      powerUps,
    };
  }

  /**
   * 4. Envía los resultados de la ronda y calcula avance o nivel de premio alcanzado
   */
  async submitDraftRound(
    userId: string,
    dto: SubmitDraftRoundDto,
  ): Promise<SubmitDraftRoundResponse> {
    const session = this.activeDrafts.get(dto.sessionId);
    if (!session || session.userId !== userId || session.status !== 'PLAYING_ROUND') {
      throw new BadRequestException('Sesión de Draft no válida o expirada.');
    }

    const targetScore = session.roundTargets[dto.roundNumber - 1];

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

    const difference = Math.abs(roundScore - dto.claimedScore);
    const maxTolerance = roundScore * ScoringService.TOLERANCE_PERCENTAGE;
    const finalScore = difference <= maxTolerance ? dto.claimedScore : roundScore;

    session.roundScores.push(finalScore);
    const passed = finalScore >= targetScore;

    if (passed) {
      session.passedRounds += 1;

      if (dto.roundNumber < 3) {
        // Superó Ronda 1 o 2: Avanza a la siguiente ronda
        session.status = 'READY_FOR_ROUND';
        const nextRound = dto.roundNumber + 1;
        const nextCategory = session.roundCategories[nextRound - 1];
        const nextTarget = session.roundTargets[nextRound - 1];

        return {
          sessionId: session.sessionId,
          roundNumber: dto.roundNumber,
          roundScore: finalScore,
          targetScore,
          passed: true,
          isDraftCompleted: false,
          prizeTier: 0,
          rewards: { coins: 0, xp: 0, stardust: 0 },
          nextCategory,
          nextTargetScore: nextTarget,
          message: `¡Ronda ${dto.roundNumber} superada! Tus 5 power-ups se han recargado para la Ronda ${nextRound}.`,
        };
      } else {
        // 🏆 ¡CAMPEÓN DEL DRAFT! (Superó las 3 rondas completas)
        session.status = 'FINISHED';
        const rewards = {
          coins: 800,
          xp: 500,
          stardust: 40,
          packId: 'SILVER', // Sobre de Plata de premio mayor
        };

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            coins: { increment: rewards.coins },
            xp: { increment: rewards.xp },
            stardust: { increment: rewards.stardust },
          },
        });

        await this.prisma.gameSession.create({
          data: {
            userId,
            mode: GameMode.DRAFT,
            score: session.roundScores.reduce((a, b) => a + b, 0),
            coinsEarned: rewards.coins,
            xpEarned: rewards.xp,
            totalQuestions: dto.auditLog.length * 3,
          },
        });

        this.activeDrafts.delete(session.sessionId);

        return {
          sessionId: session.sessionId,
          roundNumber: 3,
          roundScore: finalScore,
          targetScore,
          passed: true,
          isDraftCompleted: true,
          prizeTier: 3,
          rewards,
          message: '🏆 ¡CAMPEÓN DEL DRAFT! Superaste las 3 rondas y ganaste el Gran Premio.',
        };
      }
    } else {
      // 💀 No superó el umbral de la ronda -> Fin del Draft y cálculo del Premio según rondas pasadas
      session.status = 'FINISHED';
      let prizeTier = 0;
      let rewards = { coins: 50, xp: 30, stardust: 0, packId: undefined as string | undefined };

      if (session.passedRounds === 1) {
        // Premio Nivel 1 (Superó Ronda 1, cayó en Ronda 2)
        prizeTier = 1;
        rewards = { coins: 150, xp: 100, stardust: 5, packId: undefined };
      } else if (session.passedRounds === 2) {
        // Premio Nivel 2 (Superó Ronda 2, cayó en Ronda 3)
        prizeTier = 2;
        rewards = { coins: 350, xp: 250, stardust: 15, packId: 'BRONZE' };
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: rewards.coins },
          xp: { increment: rewards.xp },
          stardust: { increment: rewards.stardust },
        },
      });

      await this.prisma.gameSession.create({
        data: {
          userId,
          mode: GameMode.DRAFT,
          score: session.roundScores.reduce((a, b) => a + b, 0),
          coinsEarned: rewards.coins,
          xpEarned: rewards.xp,
          totalQuestions: dto.auditLog.length,
        },
      });

      this.activeDrafts.delete(session.sessionId);

      return {
        sessionId: session.sessionId,
        roundNumber: dto.roundNumber,
        roundScore: finalScore,
        targetScore,
        passed: false,
        isDraftCompleted: true,
        prizeTier,
        rewards,
        message: `Fin de la partida de Draft. Alcanzaste el Premio Nivel ${prizeTier}.`,
      };
    }
  }

  /**
   * Helper para obtener N cartas aleatorias para la tanda de draft
   */
  private async getRandomDraftCardOptions(count: number = 3): Promise<DraftCardOption[]> {
    const cards = await this.prisma.card.findMany({
      where: { powerUpAction: { not: null } },
      take: 30,
    });

    const pool = cards.length >= count ? cards : await this.prisma.card.findMany({ take: 30 });
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, count);

    return shuffled.map((c) => ({
      id: c.id,
      tmdbId: c.tmdbId,
      title: c.title,
      year: c.year,
      posterPath: c.posterPath,
      rarity: c.rarity,
      powerUpAction: c.powerUpAction ? String(c.powerUpAction) : null,
      powerUpValue: c.powerUpValue,
    }));
  }
}
