import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Rarity, Card, UserCard } from '@prisma/client';

@Injectable()
export class PackService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // 🎰 LA RULETA DE PROBABILIDADES
  // =========================================================
  private rollRarity(): Rarity {
    const roll = Math.random() * 100;
    
    // Distribución: 2% Legendaria, 8% Épica, 15% Rara, 25% Poco Común, 50% Común
    if (roll <= 2) return 'LEGENDARY'; 
    if (roll <= 10) return 'EPIC';     
    if (roll <= 25) return 'RARE';     
    if (roll <= 50) return 'UNCOMMON'; 
    
    return 'COMMON';                   
  }

  // =========================================================
  // 🎁 ABRIR UN SOBRE ESTÁNDAR (5 Cartas)
  // =========================================================
  async openStandardPack(userId: string) {
    const PACK_SIZE = 5;
    
    // 🛠️ SOLUCIÓN 2: Le decimos a TypeScript exactamente qué va a guardar este array
    const pulledCards: (UserCard & { card: Card })[] = [];

    for (let i = 0; i < PACK_SIZE; i++) {
      // 🛠️ SOLUCIÓN 3: Cambiamos 'let' por 'const' (regla de ESLint)
      const targetRarity = this.rollRarity();

      let availableCards = await this.prisma.card.findMany({
        where: { rarity: targetRarity },
        select: { id: true }
      });

      // 🛡️ FALLBACK
      if (availableCards.length === 0) {
        availableCards = await this.prisma.card.findMany({
          select: { id: true } 
        });
        
        if (availableCards.length === 0) {
            throw new InternalServerErrorException('No hay cartas en la base de datos para armar sobres.');
        }
      }

      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCardId = availableCards[randomIndex].id;

      const userCard = await this.prisma.userCard.upsert({
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

    // Devolvemos el botín formateado
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