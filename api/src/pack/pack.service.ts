// src/pack/pack.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Card, UserCard, Prisma } from '@prisma/client';
import { rollRarity, DropRates } from '../common/utils/rarity.util';

// Interfaz para saber qué forma tiene la configuración que llega
interface PackConfig {
  size: number;
  dropRates: DropRates;
}

@Injectable()
export class PackService {
  constructor(private readonly prisma: PrismaService) {}

  async openDynamicPack(userId: string, config: PackConfig, tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma;
    const pulledCards: (UserCard & { card: Card })[] = [];

    for (let i = 0; i < config.size; i++) {
      // Usamos nuestra ruleta externa inyectándole las probabilidades del sobre
      const targetRarity = rollRarity(config.dropRates);

      let availableCards = await db.card.findMany({
        where: { rarity: targetRarity },
        select: { id: true }
      });

      if (availableCards.length === 0) {
        availableCards = await db.card.findMany({
          select: { id: true } 
        });
        
        if (availableCards.length === 0) {
            throw new InternalServerErrorException('No hay cartas en la base de datos.');
        }
      }

      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCardId = availableCards[randomIndex].id;

      const userCard = await db.userCard.upsert({
        where: {
          userId_cardId: { userId, cardId: selectedCardId }
        },
        update: {
          quantity: { increment: 1 } 
        },
        create: {
          userId,
          cardId: selectedCardId,
          quantity: 1, 
          level: 1,
          equippedModes: []
        },
        include: {
          card: true 
        }
      });

      pulledCards.push(userCard);
    }

    return {
      success: true,
      cards: pulledCards.map(uc => ({
        id: uc.card.id,
        title: uc.card.title,
        posterPath: uc.card.posterPath,
        rarity: uc.card.rarity,
        isNew: uc.quantity === 1,
        quantity: uc.quantity
      }))
    };
  }
}