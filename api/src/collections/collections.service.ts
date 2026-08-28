// api/src/collections/collections.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { RewardType } from '@prisma/client';

export interface UserCollectionItem {
  id: string;
  name: string;
  description: string | null;
  rewardType: RewardType;
  rewardValue: string;
  totalCards: number;
  ownedCardsCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  cards: {
    id: string;
    tmdbId: number;
    title: string;
    year: number;
    posterPath: string | null;
    rarity: string;
    isOwned: boolean;
  }[];
}

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Obtiene todas las colecciones activas y el progreso del usuario
   */
  async getUserCollections(userId: string): Promise<UserCollectionItem[]> {
    const collections = await this.prisma.collection.findMany({
      where: { isActive: true },
      include: {
        cards: {
          orderBy: { year: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const userCards = await this.prisma.userCard.findMany({
      where: { userId },
      select: { cardId: true },
    });
    const ownedCardIds = new Set(userCards.map((uc) => uc.cardId));

    const userProgress = await this.prisma.userCollection.findMany({
      where: { userId },
    });
    const claimedMap = new Map<string, boolean>();
    userProgress.forEach((up) => {
      claimedMap.set(up.collectionId, up.isClaimed);
    });

    return collections.map((col) => {
      const cards = col.cards.map((c) => ({
        id: c.id,
        tmdbId: c.tmdbId,
        title: c.title,
        year: c.year,
        posterPath: c.posterPath,
        rarity: c.rarity,
        isOwned: ownedCardIds.has(c.id),
      }));

      const ownedCardsCount = cards.filter((c) => c.isOwned).length;
      const isCompleted = cards.length > 0 && ownedCardsCount === cards.length;
      const isClaimed = Boolean(claimedMap.get(col.id));

      return {
        id: col.id,
        name: col.name,
        description: col.description,
        rewardType: col.rewardType,
        rewardValue: col.rewardValue,
        totalCards: cards.length,
        ownedCardsCount,
        isCompleted,
        isClaimed,
        cards,
      };
    });
  }

  /**
   * 2. Reclama la recompensa al completar el 100% de un set
   */
  async claimReward(userId: string, collectionId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: { cards: true },
    });

    if (!collection) {
      throw new NotFoundException('Colección no encontrada.');
    }

    const userCards = await this.prisma.userCard.findMany({
      where: { userId },
      select: { cardId: true },
    });
    const ownedCardIds = new Set(userCards.map((uc) => uc.cardId));

    const allOwned = collection.cards.every((c) => ownedCardIds.has(c.id));
    if (!allOwned) {
      throw new BadRequestException('Aún no posees todas las cartas requeridas para este set.');
    }

    const existingProgress = await this.prisma.userCollection.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
    });

    if (existingProgress && existingProgress.isClaimed) {
      throw new BadRequestException('Ya has reclamado la recompensa de esta colección.');
    }

    // Acreditar recompensa
    let rewardDescription = '';
    const numericValue = parseInt(collection.rewardValue, 10) || 0;

    if (collection.rewardType === RewardType.COINS) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: numericValue || 500 } },
      });
      rewardDescription = `+${numericValue || 500} Monedas 🪙`;
    } else if (collection.rewardType === RewardType.STARDUST) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { stardust: { increment: numericValue || 50 } },
      });
      rewardDescription = `+${numericValue || 50} Polvo Estelar ✨`;
    } else if (collection.rewardType === RewardType.PACK) {
      // Recompensa en forma de monedas para pack o valor
      await this.prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: numericValue || 500 } },
      });
      rewardDescription = `Sobre ${collection.rewardValue} / Monedas 📦`;
    }

    await this.prisma.userCollection.upsert({
      where: {
        userId_collectionId: { userId, collectionId },
      },
      update: {
        isClaimed: true,
        claimedAt: new Date(),
      },
      create: {
        userId,
        collectionId,
        isClaimed: true,
        claimedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `¡Felicitaciones! Has completado el set "${collection.name}" y reclamaste ${rewardDescription}.`,
      rewardDescription,
    };
  }

  /**
   * 3. [ADMIN] Crear una nueva colección curada
   */
  async createCollection(dto: CreateCollectionDto) {
    const existing = await this.prisma.collection.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Ya existe una colección con ese nombre.');
    }

    const newCollection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        description: dto.description,
        rewardType: dto.rewardType,
        rewardValue: dto.rewardValue,
        cards: {
          connect: dto.cardIds.map((id) => ({ id })),
        },
      },
      include: {
        cards: true,
      },
    });

    return {
      success: true,
      message: '¡Colección curada creada con éxito!',
      collection: newCollection,
    };
  }

  /**
   * 4. [ADMIN] Listar todas las colecciones para gestión
   */
  async getAllAdminCollections() {
    return this.prisma.collection.findMany({
      include: {
        cards: true,
        _count: {
          select: { userProgress: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 5. [ADMIN] Eliminar colección
   */
  async deleteCollection(collectionId: string) {
    await this.prisma.collection.delete({
      where: { id: collectionId },
    });
    return { success: true, message: 'Colección eliminada con éxito.' };
  }
}