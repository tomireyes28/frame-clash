// api/src/cards/cards.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCard(data: CreateCardDto): Promise<Card> {
    const existingCard = await this.prisma.card.findUnique({
      where: { tmdbId: data.tmdbId },
    });

    if (existingCard) {
      throw new ConflictException(`La carta de ${data.title} ya existe en la base de datos.`);
    }

    const releaseYear = parseInt(data.releaseDate.substring(0, 4));

    return this.prisma.card.create({
      data: {
        tmdbId: data.tmdbId,
        title: data.title,
        posterPath: data.posterPath,
        year: releaseYear,
        rarity: data.rarity,
      },
    });
  }

  async findAll(): Promise<Card[]> {
    return this.prisma.card.findMany();
  }
}