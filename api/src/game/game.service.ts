// api/src/game/game.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashAnswer } from './utils/hash.util';
import { SubmitGameDto } from './dto/submit-game.dto';

@Injectable()
export class GameService {
  // Inyectamos Prisma para poder leer la base de datos
  constructor(private readonly prisma: PrismaService) {}

  async generateRound(categoryId: string, amount: number = 10) {
    if (!categoryId) {
      throw new BadRequestException(
        'El parámetro categoryId es obligatorio para iniciar una partida.',
      );
    }
    // 1. Buscamos todas las preguntas de esa categoría
    const allQuestions = await this.prisma.question.findMany({
      where: {
        categories: { has: categoryId },
      },
    });

    // Validamos que haya suficientes preguntas para jugar
    if (allQuestions.length < amount) {
      throw new BadRequestException(
        `No hay suficientes preguntas para la categoría ${categoryId}.`,
      );
    }

    // 2. Mezclamos (Shuffle) todas las preguntas y cortamos las que necesitamos (ej: 10)
    const selectedQuestions = allQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, amount);

    // 3. El Protocolo de Seguridad (Enmascarar)
    const safeRound = selectedQuestions.map((q) => {
      return {
        id: q.id,
        text: q.text,
        options: q.options, // Texto plano para que se lean en la UI
        difficulty: q.difficulty,
        // Eliminamos el 'correctAnswer' y lo cambiamos por nuestro hash seguro
        answerHash: hashAnswer(q.correctAnswer, q.id),
      };
    });

    return safeRound;
  }

  async submitRound(data: SubmitGameDto) {
    // Definimos las reglas del juego (Constantes)
    const BASE_SCORE = 10000; 
    const MAX_TIME_MS = 10000; // 10 segundos por pregunta
    const TOLERANCE_PERCENTAGE = 0.02; // El 2% de margen de error por lag

    // 1. Extraemos todos los IDs de las preguntas que mandó el jugador
    const questionIds = data.auditLog.map(log => log.questionId);

    // 2. Buscamos la VERDAD ABSOLUTA en la base de datos
    const realQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true } // Solo traemos la respuesta real
    });

    if (realQuestions.length !== data.auditLog.length) {
      throw new BadRequestException('Discrepancia en la cantidad de preguntas enviadas.');
    }

    let backendCalculatedScore = 0;

    // 3. La Auditoría Pregunta por Pregunta
    for (const log of data.auditLog) {
      // Regla Anti-Bot: Ningún humano lee y toca en menos de 300ms
      if (log.timeSpentMs < 300) {
        throw new BadRequestException('Velocidad inhumana detectada. Partida anulada.');
      }

      const realQ = realQuestions.find(q => q.id === log.questionId);

      // Si la respuesta es correcta, hacemos la matemática
      if (realQ && realQ.correctAnswer === log.selectedAnswer) {
        backendCalculatedScore += BASE_SCORE;
        
        // El Bonus de Tiempo (1 punto extra por cada milisegundo que sobró)
        const timeSaved = Math.max(0, MAX_TIME_MS - log.timeSpentMs);
        backendCalculatedScore += timeSaved;
      }
    }

    // 4. El Veredicto (La Regla del Delta)
    const difference = Math.abs(backendCalculatedScore - data.claimedScore);
    const maxTolerance = backendCalculatedScore * TOLERANCE_PERCENTAGE;

    let finalScoreToSave = 0;
    let isAdjusted = false;

    if (difference <= maxTolerance) {
      // Jugador honesto o lag aceptable -> Guardamos lo que vio en su pantalla
      finalScoreToSave = data.claimedScore;
    } else {
      // Manipulación de RAM o desincronización grave -> El servidor impone su cálculo
      finalScoreToSave = backendCalculatedScore;
      isAdjusted = true;
    }

    // 5. Guardamos la partida en la Bóveda (Prisma)
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


