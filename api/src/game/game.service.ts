// api/src/game/game.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashAnswer } from './utils/hash.util';
import { SubmitGameDto } from './dto/submit-game.dto';
import { GameRoundResponse, SafeQuestionPayload, PowerUpPayload } from './interfaces/game.interface';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  // AHORA EXIGIMOS QUE ESTA FUNCIÓN DEVUELVA ESTRICTAMENTE UN GameRoundResponse
  async generateRound(categoryId: string, amount: number = 10, userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<GameRoundResponse> {
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

    // Tipamos estrictamente el array de preguntas seguras
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
        userId: userId,
        isEquipped: true,
      },
      include: {
        card: true, 
      }
    });

    // Tipamos estrictamente el array de poderes
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

    const session = await this.prisma.gameSession.create({
      data: {
        userId: data.userId, 
        mode: 'ARCADE', 
        score: finalScoreToSave,
        auditLog: data.auditLog.map(log => ({
          questionId: log.questionId,
          selectedAnswer: log.selectedAnswer,
          timeSpentMs: log.timeSpentMs,
        })), 
      }
    });

    return {
      success: true,
      sessionId: session.id,
      finalScore: finalScoreToSave,
      isAdjusted,
      message: isAdjusted 
        ? 'Discrepancia detectada. Tu puntaje oficial fue ajustado por el servidor.'
        : 'Partida verificada y guardada con éxito.'
    };
  }
}