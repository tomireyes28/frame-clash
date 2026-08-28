// api/src/leaderboard/leaderboard.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LeaderboardPlayer {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  level: number;
  primaryMetric: string; // Ej: "145.200 pts", "Onda 12", "⭐ 215", "42 Cartas"
  secondaryMetric?: string; // Ej: "Roguelite", "Puntaje: 85.000", "👑 4 Dominadas", "3 Sets"
  isCurrentUser?: boolean;
}

export interface LeaderboardResult {
  type: string;
  title: string;
  description: string;
  players: LeaderboardPlayer[];
  currentUser?: LeaderboardPlayer | null;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper para actualizar puntajes (compatibilidad con GameService)
   */
  async updateScore(userId: string, mode: string, score: number) {
    // Los puntajes se guardan automáticamente en GameSession
    this.logger.log(`Score registrado para usuario ${userId} en modo ${mode}: ${score} pts`);
  }

  /**
   * 1. Top Récord de Puntuación General
   */
  async getScoreLeaderboard(userId?: string): Promise<LeaderboardResult> {
    const topSessions = await this.prisma.gameSession.groupBy({
      by: ['userId'],
      _max: { score: true },
      orderBy: { _max: { score: 'desc' } },
      take: 50,
    });

    const userIds = topSessions.map((s) => s.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, xp: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const players: LeaderboardPlayer[] = topSessions.map((session, index) => {
      const u = userMap.get(session.userId);
      const level = u ? Math.floor(u.xp / 1000) + 1 : 1;
      const score = session._max.score || 0;

      return {
        rank: index + 1,
        userId: session.userId,
        name: u?.name || 'Cinéfilo Anónimo',
        image: u?.image || null,
        level,
        primaryMetric: `${score.toLocaleString('es-AR')} pts`,
        secondaryMetric: 'Récord Personal',
        isCurrentUser: session.userId === userId,
      };
    });

    const currentUser = players.find((p) => p.userId === userId) || null;

    return {
      type: 'SCORE',
      title: '🏆 Salón de la Fama — Puntajes Máximos',
      description: 'Los mayores récords de puntos conseguidos en una sola partida.',
      players,
      currentUser,
    };
  }

  /**
   * 2. Top Supervivientes del Roguelike
   */
  async getRogueliteLeaderboard(userId?: string): Promise<LeaderboardResult> {
    const progressList = await this.prisma.rogueliteProgress.findMany({
      orderBy: [{ bestWave: 'desc' }, { bestScore: 'desc' }],
      take: 50,
    });

    const userIds = progressList.map((p) => p.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, xp: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const players: LeaderboardPlayer[] = progressList.map((prog, index) => {
      const u = userMap.get(prog.userId);
      const level = u ? Math.floor(u.xp / 1000) + 1 : 1;

      return {
        rank: index + 1,
        userId: prog.userId,
        name: u?.name || 'Cinéfilo Anónimo',
        image: u?.image || null,
        level,
        primaryMetric: `Onda ${prog.bestWave} 🔥`,
        secondaryMetric: `${prog.bestScore.toLocaleString('es-AR')} pts acumulados`,
        isCurrentUser: prog.userId === userId,
      };
    });

    const currentUser = players.find((p) => p.userId === userId) || null;

    return {
      type: 'ROGUELITE',
      title: '🔥 Supervivientes del Roguelike',
      description: 'Jugadores que alcanzaron las ondas más lejanas de trivia infinita.',
      players,
      currentUser,
    };
  }

  /**
   * 3. Top Maestros del Dominio
   */
  async getDominationLeaderboard(userId?: string): Promise<LeaderboardResult> {
    const allProgress = await this.prisma.dominationProgress.findMany();

    const userStats = new Map<string, { stars: number; mastered: number }>();
    for (const p of allProgress) {
      const current = userStats.get(p.userId) || { stars: 0, mastered: 0 };
      current.stars += p.stars;
      if (p.nodeNumber >= 10 && p.completed) current.mastered += 1;
      userStats.set(p.userId, current);
    }

    const sortedUsers = Array.from(userStats.entries())
      .sort((a, b) => b[1].stars - a[1].stars || b[1].mastered - a[1].mastered)
      .slice(0, 50);

    const userIds = sortedUsers.map(([uId]) => uId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, xp: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const players: LeaderboardPlayer[] = sortedUsers.map(([uId, stat], index) => {
      const u = userMap.get(uId);
      const level = u ? Math.floor(u.xp / 1000) + 1 : 1;

      return {
        rank: index + 1,
        userId: uId,
        name: u?.name || 'Cinéfilo Anónimo',
        image: u?.image || null,
        level,
        primaryMetric: `⭐ ${stat.stars} Estrellas`,
        secondaryMetric: `${stat.mastered} Categorías Dominadas 👑`,
        isCurrentUser: uId === userId,
      };
    });

    const currentUser = players.find((p) => p.userId === userId) || null;

    return {
      type: 'DOMINATION',
      title: '⭐ Maestros del Dominio',
      description: 'Jugadores con mayor cantidad de estrellas en las 31 campañas de categorías.',
      players,
      currentUser,
    };
  }

  /**
   * 4. Top Grandes Coleccionistas
   */
  async getCollectorLeaderboard(userId?: string): Promise<LeaderboardResult> {
    const userCards = await this.prisma.userCard.findMany({
      include: { card: { select: { rarity: true } } },
    });

    const collections = await this.prisma.userCollection.findMany({
      where: { isClaimed: true },
    });

    const userMapStats = new Map<string, { uniqueCards: number; legendary: number; sets: number }>();

    for (const uc of userCards) {
      const cur = userMapStats.get(uc.userId) || { uniqueCards: 0, legendary: 0, sets: 0 };
      cur.uniqueCards += 1;
      if (uc.card.rarity === 'LEGENDARY') cur.legendary += 1;
      userMapStats.set(uc.userId, cur);
    }

    for (const col of collections) {
      const cur = userMapStats.get(col.userId) || { uniqueCards: 0, legendary: 0, sets: 0 };
      cur.sets += 1;
      userMapStats.set(col.userId, cur);
    }

    const sorted = Array.from(userMapStats.entries())
      .sort((a, b) => b[1].uniqueCards - a[1].uniqueCards || b[1].legendary - a[1].legendary)
      .slice(0, 50);

    const userIds = sorted.map(([uId]) => uId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, xp: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const players: LeaderboardPlayer[] = sorted.map(([uId, stat], index) => {
      const u = userMap.get(uId);
      const level = u ? Math.floor(u.xp / 1000) + 1 : 1;

      return {
        rank: index + 1,
        userId: uId,
        name: u?.name || 'Cinéfilo Anónimo',
        image: u?.image || null,
        level,
        primaryMetric: `🃏 ${stat.uniqueCards} Cartas Únicas`,
        secondaryMetric: `${stat.legendary} Legendarias • ${stat.sets} Sets 📚`,
        isCurrentUser: uId === userId,
      };
    });

    const currentUser = players.find((p) => p.userId === userId) || null;

    return {
      type: 'COLLECTOR',
      title: '🃏 Grandes Coleccionistas',
      description: 'Jugadores con los álbumes más completos y mayor cantidad de sets completados.',
      players,
      currentUser,
    };
  }
}