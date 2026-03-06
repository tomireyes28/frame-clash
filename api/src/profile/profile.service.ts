import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    // 1. Datos básicos del usuario (Billetera y XP)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        coins: true,
        xp: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado en los registros.');
    }

    // 2. Estadísticas de Colección (¿Cuántas cartas distintas tiene?)
    const uniqueCardsCount = await this.prisma.userCard.count({
      where: { userId: userId }
    });

    // 3. Estadísticas de Partidas en el Coliseo
    const sessions = await this.prisma.gameSession.findMany({
      where: { userId: userId },
      select: { score: true, createdAt: true },
      orderBy: { createdAt: 'desc' } // Las más recientes primero
    });

    const totalGames = sessions.length;
    let highestScore = 0;
    let averageScore = 0;

    if (totalGames > 0) {
      const totalScore = sessions.reduce((acc, session) => acc + session.score, 0);
      highestScore = Math.max(...sessions.map(s => s.score));
      averageScore = Math.round(totalScore / totalGames);
    }

    // 4. Sistema de Niveles de Cuenta (1 Nivel cada 1000 XP)
    // Esto es puro meta-juego para que el usuario sienta progreso constante
    const playerLevel = Math.floor(user.xp / 1000) + 1;
    const currentLevelProgress = user.xp % 1000; // Lo que sobra para la barrita
    const xpForNextLevel = 1000; // Para el MVP lo hacemos fijo, luego puede ser exponencial

    return {
      success: true,
      profile: {
        user: {
          ...user,
          level: playerLevel,
          currentLevelProgress,
          xpForNextLevel
        },
        stats: {
          totalGames,
          highestScore,
          averageScore,
          uniqueCardsCount
        },
        recentActivity: sessions.slice(0, 5) // Le mandamos solo las últimas 5 para el historial
      }
    };
  }
}