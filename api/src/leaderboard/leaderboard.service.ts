import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class LeaderboardService {
  private redis: Redis;

  constructor(private readonly prisma: PrismaService) {
    // Nos conectamos al contenedor de Docker (localhost en el puerto 6379)
    this.redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  }

  // =========================================================
  // 1. GUARDAR PUNTAJE (El Peaje llamará a esto)
  // =========================================================
  async updateScore(userId: string, mode: string, score: number) {
    const key = `leaderboard:${mode}`;
    
    // ZADD con 'GT' solo actualiza si el nuevo puntaje es mayor al anterior
    await this.redis.zadd(key, 'GT', score, userId);
  }

  // =========================================================
  // 2. OBTENER EL TOP 100 (El Frontend llamará a esto)
  // =========================================================
  async getTopPlayers(mode: string, limit: number = 100) {
    const key = `leaderboard:${mode}`;

    const redisData = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

    if (redisData.length === 0) return { success: true, mode, data: [] };

    // 🛠️ EL FIX ESTÁ ACÁ: Le decimos a TS exactamente qué lleva el array
    const topPlayers: Array<{ userId: string; score: number }> = [];
    
    for (let i = 0; i < redisData.length; i += 2) {
      topPlayers.push({
        userId: redisData[i],
        score: parseInt(redisData[i + 1], 10),
      });
    }

    // 2. Extraemos los IDs para ir a buscar sus nombres a la base de datos
    const userIds = topPlayers.map(p => p.userId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true }, // Solo pedimos lo visual
    });

    // 3. Fusionamos los datos (El puntaje de Redis con la foto de Postgres)
    const enrichedLeaderboard = topPlayers.map((player, index) => {
      const userInfo = users.find(u => u.id === player.userId);
      return {
        rank: index + 1,
        userId: player.userId,
        score: player.score,
        name: userInfo?.name || 'Gladiador Anónimo',
        image: userInfo?.image || null,
      };
    });

    return { 
      success: true, 
      mode, 
      data: enrichedLeaderboard 
    };
  }
}