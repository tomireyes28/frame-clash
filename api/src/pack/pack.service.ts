// api/src/pack/pack.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Card, UserCard, Prisma } from '@prisma/client';
import { rollRarity, DropRates } from '../common/utils/rarity.util';
import { STARDUST_REWARDS_BY_RARITY } from '../common/constants/packs.config';

export interface PackConfigInput {
  id?: string;
  size: number;
  dropRates: DropRates;
}

export interface OpenedCardResult {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  backdropPath: string | null;
  rarity: string;
  atk: number;
  def: number;
  spd: number;
  box: number;
  crt: number;
  level: number;
  quantity: number;
  isNew: boolean;
  isDuplicate: boolean;
  stardustGained: number;
}

@Injectable()
export class PackService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Abre un sobre con probabilidades de rareza dinámicas,
   * gestiona niveles por duplicados (Lvl 1 a 3) y conversión a Polvo Estelar.
   */
  async openDynamicPack(
    userId: string,
    config: PackConfigInput,
    tx?: Prisma.TransactionClient,
  ): Promise<{ success: boolean; cards: OpenedCardResult[]; totalStardustGained: number; xpGained: number }> {
    const db = tx || this.prisma;
    const openedCards: OpenedCardResult[] = [];
    let totalStardustGained = 0;

    for (let i = 0; i < config.size; i++) {
      // 1. Tiramos la ruleta de rareza según los drop rates del sobre
      const targetRarity = rollRarity(config.dropRates);

      let availableCards = await db.card.findMany({
        where: { rarity: targetRarity },
      });

      // Fallback si no hay cartas de esa rareza aún
      if (availableCards.length === 0) {
        availableCards = await db.card.findMany({});
        if (availableCards.length === 0) {
          throw new InternalServerErrorException('No hay cartas disponibles en la base de datos para abrir sobres.');
        }
      }

      // 2. Elegimos una carta al azar dentro de la rareza
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCard = availableCards[randomIndex];

      // 3. Verificamos si el usuario ya posee esta carta
      const existingUserCard = await db.userCard.findUnique({
        where: {
          userId_cardId: { userId, cardId: selectedCard.id },
        },
      });

      const isNew = !existingUserCard;
      let newLevel = 1;
      let newQuantity = 1;
      let stardustForCard = 0;

      if (existingUserCard) {
        newQuantity = existingUserCard.quantity + 1;
        // Subida de nivel: Copia 2 -> Lvl 2, Copia 3+ -> Lvl 3
        newLevel = Math.min(3, Math.max(existingUserCard.level, newQuantity <= 3 ? newQuantity : 3));

        // Si ya tenía 3 copias (o más), a partir de la 4ª otorga Polvo Estelar
        if (existingUserCard.quantity >= 3) {
          stardustForCard = STARDUST_REWARDS_BY_RARITY[selectedCard.rarity] || 5;
          totalStardustGained += stardustForCard;
        }

        await db.userCard.update({
          where: { id: existingUserCard.id },
          data: {
            quantity: newQuantity,
            level: newLevel,
          },
        });
      } else {
        await db.userCard.create({
          data: {
            userId,
            cardId: selectedCard.id,
            quantity: 1,
            level: 1,
            equippedModes: [],
          },
        });
      }

      openedCards.push({
        id: selectedCard.id,
        tmdbId: selectedCard.tmdbId,
        title: selectedCard.title,
        year: selectedCard.year,
        posterPath: selectedCard.posterPath,
        backdropPath: selectedCard.backdropPath,
        rarity: selectedCard.rarity,
        atk: selectedCard.atk,
        def: selectedCard.def,
        spd: selectedCard.spd,
        box: selectedCard.box,
        crt: selectedCard.crt,
        level: newLevel,
        quantity: newQuantity,
        isNew,
        isDuplicate: !isNew,
        stardustGained: stardustForCard,
      });
    }

    const xpGained = 25; // 25 XP por abrir sobre

    // 4. Actualizamos el Polvo Estelar y XP en la cuenta del usuario
    await db.user.update({
      where: { id: userId },
      data: {
        stardust: { increment: totalStardustGained },
        xp: { increment: xpGained },
      },
    });

    return {
      success: true,
      cards: openedCards,
      totalStardustGained,
      xpGained,
    };
  }
}