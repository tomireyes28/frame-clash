// api/src/profile/profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameMode, Rarity } from '@prisma/client';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'GAMES' | 'COLLECTION' | 'ROGUELITE' | 'DOMINATION' | 'DRAFT';
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  rewardCoins: number;
  rewardStardust: number;
  unlockedTitle?: string;
}

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
        stardust: true,
        xp: true,
        eloRating: true,
        rankTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // 2. Estadísticas de Colección
    const userCards = await this.prisma.userCard.findMany({
      where: { userId },
      include: {
        card: {
          select: { rarity: true },
        },
      },
    });

    const uniqueCardsCount = userCards.length;
    const level3CardsCount = userCards.filter((uc) => uc.level >= 3).length;
    const legendaryCardsCount = userCards.filter(
      (uc) => uc.card.rarity === Rarity.LEGENDARY,
    ).length;
    const epicCardsCount = userCards.filter(
      (uc) => uc.card.rarity === Rarity.EPIC,
    ).length;

    // Sets completados
    const completedSetsCount = await this.prisma.userCollection.count({
      where: { userId, isClaimed: true },
    });

    // 3. Estadísticas de Modo Roguelite
    const rogueliteProgress = await this.prisma.rogueliteProgress.findUnique({
      where: { userId },
    });
    const rogueliteMaxWave = rogueliteProgress?.bestWave || 0;
    const rogueliteHighScore = rogueliteProgress?.bestScore || 0;

    // 4. Estadísticas de Modo Dominio
    const dominationProgress = await this.prisma.dominationProgress.findMany({
      where: { userId },
    });
    const totalDominationStars = dominationProgress.reduce(
      (sum, p) => sum + p.stars,
      0,
    );
    const masteredCategoriesCount = dominationProgress.filter(
      (p) => p.nodeNumber >= 10 && p.completed,
    ).length;

    // 5. Estadísticas de Partidas
    const sessions = await this.prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalGames = sessions.length;
    const draftSessions = sessions.filter((s) => s.mode === GameMode.DRAFT);
    const draftWinsCount = draftSessions.filter((s) => s.score >= 220000).length;

    let highestScore = 0;
    let averageScore = 0;
    if (totalGames > 0) {
      const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
      highestScore = Math.max(...sessions.map((s) => s.score));
      averageScore = Math.round(totalScore / totalGames);
    }

    // 6. Sistema de Niveles de Cuenta
    const playerLevel = Math.floor(user.xp / 1000) + 1;
    const currentLevelProgress = user.xp % 1000;
    const xpForNextLevel = 1000;

    // 7. Motor Dinámico de Logros
    const achievements: Achievement[] = [
      {
        id: 'FIRST_MATCH',
        title: 'Luz, Cámara, Acción',
        description: 'Jugá tu primera partida en cualquier modo.',
        icon: '🎬',
        category: 'GAMES',
        currentProgress: Math.min(1, totalGames),
        maxProgress: 1,
        isUnlocked: totalGames >= 1,
        rewardCoins: 100,
        rewardStardust: 0,
        unlockedTitle: 'Cinéfilo Debutante',
      },
      {
        id: 'COLLECTOR_10',
        title: 'Coleccionista Novato',
        description: 'Descubrí y coleccioná 10 cartas únicas de películas.',
        icon: '🃏',
        category: 'COLLECTION',
        currentProgress: Math.min(10, uniqueCardsCount),
        maxProgress: 10,
        isUnlocked: uniqueCardsCount >= 10,
        rewardCoins: 200,
        rewardStardust: 10,
        unlockedTitle: 'Coleccionista Novato',
      },
      {
        id: 'LEGENDARY_FIND',
        title: 'Gusto Exquisito',
        description: 'Obtené tu primera carta de rareza Legendaria.',
        icon: '💎',
        category: 'COLLECTION',
        currentProgress: Math.min(1, legendaryCardsCount),
        maxProgress: 1,
        isUnlocked: legendaryCardsCount >= 1,
        rewardCoins: 500,
        rewardStardust: 25,
        unlockedTitle: 'Buscador de Joyas',
      },
      {
        id: 'CARD_LEVEL_3',
        title: 'Poder Cinematográfico',
        description: 'Mejorá cualquier carta de tu colección a Nivel 3.',
        icon: '⚡',
        category: 'COLLECTION',
        currentProgress: Math.min(1, level3CardsCount),
        maxProgress: 1,
        isUnlocked: level3CardsCount >= 1,
        rewardCoins: 300,
        rewardStardust: 15,
        unlockedTitle: 'Potenciador de Estrellas',
      },
      {
        id: 'COMPLETE_SET',
        title: 'Archivista de Sagas',
        description: 'Completá y reclamá el premio de 1 Set de Colección temático.',
        icon: '📚',
        category: 'COLLECTION',
        currentProgress: Math.min(1, completedSetsCount),
        maxProgress: 1,
        isUnlocked: completedSetsCount >= 1,
        rewardCoins: 350,
        rewardStardust: 20,
        unlockedTitle: 'Archivista de Sagas',
      },
      {
        id: 'ROGUELITE_WAVE_5',
        title: 'Superviviente del Guión',
        description: 'Alcanzá la Onda 5 en el Modo Roguelike.',
        icon: '🔥',
        category: 'ROGUELITE',
        currentProgress: Math.min(5, rogueliteMaxWave),
        maxProgress: 5,
        isUnlocked: rogueliteMaxWave >= 5,
        rewardCoins: 400,
        rewardStardust: 20,
        unlockedTitle: 'Superviviente',
      },
      {
        id: 'ROGUELITE_WAVE_10',
        title: 'Titán del Roguelike',
        description: 'Alcanzá la Onda 10 en el Modo Roguelike.',
        icon: '⚔️',
        category: 'ROGUELITE',
        currentProgress: Math.min(10, rogueliteMaxWave),
        maxProgress: 10,
        isUnlocked: rogueliteMaxWave >= 10,
        rewardCoins: 1000,
        rewardStardust: 50,
        unlockedTitle: 'Inmortal Cinéfilo',
      },
      {
        id: 'DOMINATION_STARS_20',
        title: 'Conquistador de Géneros',
        description: 'Conseguí al menos 20 estrellas en el Modo Dominio.',
        icon: '⭐',
        category: 'DOMINATION',
        currentProgress: Math.min(20, totalDominationStars),
        maxProgress: 20,
        isUnlocked: totalDominationStars >= 20,
        rewardCoins: 350,
        rewardStardust: 15,
        unlockedTitle: 'Conquistador',
      },
      {
        id: 'DOMINATION_MASTER',
        title: 'Dominio Absoluto',
        description: 'Superá los 10 nodos de una categoría y derrotá a su Boss.',
        icon: '👑',
        category: 'DOMINATION',
        currentProgress: Math.min(1, masteredCategoriesCount),
        maxProgress: 1,
        isUnlocked: masteredCategoriesCount >= 1,
        rewardCoins: 800,
        rewardStardust: 50,
        unlockedTitle: 'Maestro de Género',
      },
      {
        id: 'DRAFT_CHAMPION',
        title: 'Estratega del Draft',
        description: 'Completá las 3 rondas del Modo Draft como Campeón.',
        icon: '🎲',
        category: 'DRAFT',
        currentProgress: Math.min(1, draftWinsCount),
        maxProgress: 1,
        isUnlocked: draftWinsCount >= 1,
        rewardCoins: 600,
        rewardStardust: 30,
        unlockedTitle: 'Rey del Draft',
      },
    ];

    // Títulos disponibles desbloqueados
    const unlockedTitles = achievements
      .filter((a) => a.isUnlocked && a.unlockedTitle)
      .map((a) => a.unlockedTitle as string);

    if (unlockedTitles.length === 0) {
      unlockedTitles.push('Cinéfilo');
    }

    return {
      success: true,
      profile: {
        user: {
          ...user,
          level: playerLevel,
          currentLevelProgress,
          xpForNextLevel,
          unlockedTitles,
          defaultTitle: unlockedTitles[unlockedTitles.length - 1] || 'Cinéfilo',
        },
        stats: {
          totalGames,
          highestScore,
          averageScore,
          uniqueCardsCount,
          legendaryCardsCount,
          epicCardsCount,
          completedSetsCount,
          rogueliteMaxWave,
          rogueliteHighScore,
          totalDominationStars,
          masteredCategoriesCount,
          draftWinsCount,
        },
        achievements,
        recentActivity: sessions.slice(0, 8),
      },
    };
  }
}