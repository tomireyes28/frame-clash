import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MissionFrequency } from '@prisma/client';
import { DAILY_MISSIONS_CATALOGUE } from './mission.catalogue';

@Injectable()
export class MissionService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // 1. GENERADOR DE MISIONES (La Semilla Diaria)
  // =========================================================
  async getDailyMissions(userId: string) {
    const now = new Date();
    
    // Buscamos misiones activas que NO hayan vencido
    const activeMissions = await this.prisma.userMission.findMany({
      where: {
        userId,
        frequency: MissionFrequency.DAILY,
        expiresAt: { gt: now } // Que expiren DESPUÉS de este exacto momento
      }
    });

    // Si ya tiene misiones para hoy, se las devolvemos y listo.
    if (activeMissions.length > 0) {
      return { success: true, data: activeMissions };
    }

    // Si no tiene (o vencieron), le generamos 3 nuevas usando la fecha como semilla
    const dateString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const dailyPicks = this.getPseudoRandomMissions(dateString, 3);

    // Calculamos el final del día de hoy (23:59:59) para el expiresAt
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Las preparamos para guardarlas en Prisma
    const newMissionsData = dailyPicks.map(mission => ({
      userId,
      frequency: MissionFrequency.DAILY,
      type: mission.type,
      title: mission.title,
      targetValue: mission.targetValue,
      rewardCoins: mission.rewardCoins,
      expiresAt: endOfDay
    }));

    // Las guardamos todas de golpe (Batch Insert) por rendimiento
    await this.prisma.userMission.createMany({ data: newMissionsData });

    // Las recuperamos para enviarlas al frontend
    const freshMissions = await this.prisma.userMission.findMany({
      where: { userId, frequency: MissionFrequency.DAILY, expiresAt: { gt: now } }
    });

    return { success: true, data: freshMissions };
  }

  // =========================================================
  // 2. EL INSPECTOR (Avanzar Progreso)
  // =========================================================
  async advanceProgress(userId: string, stats: { gamesPlayed: number, coinsEarned: number, scoreEarned: number }) {
    const now = new Date();

    // 1. Traemos solo las misiones activas e incompletas de hoy
    const activeMissions = await this.prisma.userMission.findMany({
      where: { userId, isCompleted: false, expiresAt: { gt: now } }
    });

    if (activeMissions.length === 0) return;

    // 2. Evaluamos cada misión en memoria (Lazy Evaluation)
    for (const mission of activeMissions) {
      let addedValue = 0;

      if (mission.type === 'PLAY_GAMES') addedValue = stats.gamesPlayed;
      if (mission.type === 'EARN_COINS') addedValue = stats.coinsEarned;
      if (mission.type === 'SCORE_POINTS') addedValue = stats.scoreEarned;

      if (addedValue > 0) {
        const newValue = mission.currentValue + addedValue;
        const isNowCompleted = newValue >= mission.targetValue;

        // Actualizamos la misión en la DB
        await this.prisma.userMission.update({
          where: { id: mission.id },
          data: { 
            currentValue: isNowCompleted ? mission.targetValue : newValue,
            isCompleted: isNowCompleted
          }
        });

        // Si la completó justo ahora, le pagamos la recompensa
        if (isNowCompleted) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { coins: { increment: mission.rewardCoins } }
          });
        }
      }
    }
  }

  // Utilidad matemática para que todos tengan las mismas misiones según el día
  private getPseudoRandomMissions(seed: string, count: number) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
    }
    const random = () => {
      const x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };

    const shuffled = [...DAILY_MISSIONS_CATALOGUE].sort(() => 0.5 - random());
    return shuffled.slice(0, count);
  }
}