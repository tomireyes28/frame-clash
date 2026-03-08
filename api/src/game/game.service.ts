import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashAnswer } from './utils/hash.util';
import { SubmitGameDto } from './dto/submit-game.dto';
import { GameRoundResponse, SafeQuestionPayload, PowerUpPayload } from './interfaces/game.interface';
import { MissionService } from '../mission/mission.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service'; 

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly missionService: MissionService,
    private readonly leaderboardService: LeaderboardService 
  ) {}

  // CORRECCIÓN 1: Sacamos el '= 10' de amount para que TypeScript no tire error de orden
  async generateRound(categoryId: string, amount: number, userId: string): Promise<GameRoundResponse> { 
    if (!categoryId) {
      throw new BadRequestException('El parámetro categoryId es obligatorio para iniciar una partida.');
    }

    const allQuestions = await this.prisma.question.findMany({
      where: { categories: { has: categoryId } },
    });

    if (allQuestions.length < amount) {
      throw new BadRequestException(`No hay suficientes preguntas para la categoría ${categoryId}.`);
    }

    const selectedQuestions = allQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, amount);

    const safeRound: SafeQuestionPayload[] = selectedQuestions.map((q) => {
      return {
        id: q.id,
        text: q.text,
        options: q.options,
        difficulty: q.difficulty,
        answerHash: hashAnswer(q.correctAnswer, q.id),
      };
    });

    const equippedCards = await this.prisma.userCard.findMany({
      where: {
        userId: userId, // 👈 Usa el ID real
        equippedModes: {
          has: 'ARCADE' 
        }
      },
      include: {
        card: true, 
      }
    });

    const powerUps: PowerUpPayload[] = equippedCards.map(uc => ({
      id: uc.card.id,
      title: uc.card.title,
      action: uc.card.powerUpAction,
      value: uc.card.powerUpValue,
    }));

    return {
      questions: safeRound,
      powerUps: powerUps
    };
  }

  async submitRound(data: SubmitGameDto) {
    const BASE_SCORE = 10000; 
    const MAX_TIME_MS = 10000; 
    const TOLERANCE_PERCENTAGE = 0.02; 

    const questionIds = data.auditLog.map(log => log.questionId);

    const realQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true } 
    });

    if (realQuestions.length !== data.auditLog.length) {
      throw new BadRequestException('Discrepancia en la cantidad de preguntas enviadas.');
    }

    let backendCalculatedScore = 0;

    for (const log of data.auditLog) {
      if (log.timeSpentMs < 300) {
        throw new BadRequestException('Velocidad inhumana detectada. Partida anulada.');
      }

      const realQ = realQuestions.find(q => q.id === log.questionId);

      if (realQ && realQ.correctAnswer === log.selectedAnswer) {
        backendCalculatedScore += BASE_SCORE;
        const timeSaved = Math.max(0, MAX_TIME_MS - log.timeSpentMs);
        backendCalculatedScore += timeSaved;
      }
    }

    const difference = Math.abs(backendCalculatedScore - data.claimedScore);
    const maxTolerance = backendCalculatedScore * TOLERANCE_PERCENTAGE;

    let finalScoreToSave = 0;
    let isAdjusted = false;

    if (difference <= maxTolerance) {
      finalScoreToSave = data.claimedScore;
    } else {
      finalScoreToSave = backendCalculatedScore;
      isAdjusted = true;
    }

    if (data.usedPowerUps && data.usedPowerUps.length > 0) {
      const usageCount: Record<string, number> = {};
      for (const powerUpId of data.usedPowerUps) {
        usageCount[powerUpId] = (usageCount[powerUpId] || 0) + 1;
      }

      const uniquePowerUpIds = Object.keys(usageCount);

      const userCards = await this.prisma.userCard.findMany({
        where: {
          userId: data.userId, // 👈 Usa el ID real
          cardId: { in: uniquePowerUpIds },
          quantity: { gt: 0 },
          equippedModes: { has: 'ARCADE' }
        }
      });

      if (userCards.length !== uniquePowerUpIds.length) {
        throw new BadRequestException('Intento de fraude: Cartas no equipadas o no poseídas.');
      }

      for (const userCard of userCards) {
        const usesInRound = usageCount[userCard.cardId];
        if (usesInRound > userCard.level) {
          throw new BadRequestException(`Intento de fraude: Usó la carta ${userCard.cardId} ${usesInRound} veces, pero su nivel es ${userCard.level}.`);
        }
      }
    }

    const session = await this.prisma.gameSession.create({
      data: {
        userId: data.userId, // 👈 Usa el ID real
        mode: 'ARCADE', 
        score: finalScoreToSave,
        auditLog: data.auditLog.map(log => ({
          questionId: log.questionId,
          selectedAnswer: log.selectedAnswer,
          timeSpentMs: log.timeSpentMs,
        })), 
      }
    });

    const coinsEarned = 10 + Math.floor(finalScoreToSave / 3000); 
    const xpEarned = Math.floor(finalScoreToSave / 1000); 

    await this.prisma.user.update({
      where: { id: data.userId }, // 👈 Usa el ID real
      data: {
        coins: { increment: coinsEarned },
        xp: { increment: xpEarned }
      }
    });

    await this.missionService.advanceProgress(data.userId, {
      gamesPlayed: 1, 
      coinsEarned: coinsEarned, 
      scoreEarned: finalScoreToSave    
    });

    await this.leaderboardService.updateScore(data.userId, 'ARCADE', finalScoreToSave);

    return {
      success: true,
      sessionId: session.id,
      finalScore: finalScoreToSave,
      coinsEarned, 
      xpEarned,    
      isAdjusted,
      message: isAdjusted 
        ? 'Discrepancia detectada. Tu puntaje oficial fue ajustado por el servidor.'
        : 'Partida verificada y guardada con éxito.'
    };
  }

  // CORRECCIÓN 2: Eliminado el ID hardcodeado
  async getUserInventory(userId: string) {
    const userCards = await this.prisma.userCard.findMany({
      where: { userId: userId }, // 👈 Usa el ID real
      include: {
        card: true, 
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });

    return userCards.map(uc => ({
      id: uc.card.id, 
      title: uc.card.title,
      year: uc.card.year,
      posterPath: uc.card.posterPath,
      rarity: uc.card.rarity,
      powerUpAction: uc.card.powerUpAction,
      powerUpValue: uc.card.powerUpValue,
      quantity: uc.quantity,
      level: uc.level,
      equippedModes: uc.equippedModes, 
    }));
  }
}