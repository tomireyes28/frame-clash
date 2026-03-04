// api/src/game/game.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashAnswer } from './utils/hash.util';

@Injectable()
export class GameService {
  // Inyectamos Prisma para poder leer la base de datos
  constructor(private readonly prisma: PrismaService) {}

  async generateRound(categoryId: string, amount: number = 10) {
    // 1. Buscamos todas las preguntas de esa categoría
    const allQuestions = await this.prisma.question.findMany({
      where: {
        categories: { has: categoryId }
      }
    });

    // Validamos que haya suficientes preguntas para jugar
    if (allQuestions.length < amount) {
      throw new BadRequestException(`No hay suficientes preguntas para la categoría ${categoryId}.`);
    }

    // 2. Mezclamos (Shuffle) todas las preguntas y cortamos las que necesitamos (ej: 10)
    const selectedQuestions = allQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, amount);

    // 3. El Protocolo de Seguridad (Enmascarar)
    const safeRound = selectedQuestions.map(q => {
      return {
        id: q.id,
        text: q.text,
        options: q.options, // Texto plano para que se lean en la UI
        difficulty: q.difficulty,
        // Eliminamos el 'correctAnswer' y lo cambiamos por nuestro hash seguro
        answerHash: hashAnswer(q.correctAnswer, q.id) 
      };
    });

    return safeRound;
  }
}